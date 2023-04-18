import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { BigNumber, BigNumberish, constants } from "ethers";
import { formatEther, formatUnits, parseEther, parseUnits } from "ethers/lib/utils";
import { ethers, network } from "hardhat";
import { BeefyUniversalExchange, Exchange, IERC20Metadata, IWrappedEther, VelodromeCalldataSource } from "../typechain";

type Edge = {
    swapProtocol: BigNumberish;
    pool: string;
    fromCoin: string;
    toCoin: string;
};
type Route = Edge[];

let signers: SignerWithAddress[];
let exchange: Exchange;
let supportedCoinsList: (IERC20Metadata | IWrappedEther)[] = [];
let customAmounts: { [key: string]: BigNumber } = {};

const nativeEth = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";

async function testSwap(fromAddress: string, toAddress: string, amount: BigNumberish) {
    if (fromAddress == constants.AddressZero || fromAddress == nativeEth) {
        const to = await ethers.getContractAt("IERC20Metadata", toAddress);
        const balBefore = await to.balanceOf(signers[0].address);
        const tx = await (await exchange.exchange(nativeEth, to.address, amount, 0, { value: amount })).wait();
        console.log("Swapped", formatEther(amount),
            "ETH for", formatUnits((await to.balanceOf(signers[0].address)).sub(balBefore), await to.decimals()),
            await to.symbol() + ",", "gas used:", tx.cumulativeGasUsed.toString());
        return;
    }
    if (toAddress == constants.AddressZero || toAddress == nativeEth) {
        const from = await ethers.getContractAt("IERC20Metadata", fromAddress);
        await from.approve(exchange.address, amount);
        const balBefore = await signers[0].getBalance();
        const tx = await (await exchange.exchange(from.address, toAddress, amount, 0)).wait();
        console.log("Swapped", formatUnits(amount, await from.decimals()),
            await from.symbol(), "for", formatEther((await signers[0].getBalance()).sub(balBefore)),
            "ETH, gas used:", tx.cumulativeGasUsed.toString());
        return;
    }

    const from = await ethers.getContractAt("IERC20Metadata", fromAddress);
    await from.approve(exchange.address, amount);
    const to = await ethers.getContractAt("IERC20Metadata", toAddress);
    const balBefore = await to.balanceOf(signers[0].address);
    const tx = await (await exchange.exchange(fromAddress, toAddress, amount, 0)).wait();
    console.log("Swapped", formatUnits(amount, await from.decimals()),
        await from.symbol(), "for", formatUnits((await to.balanceOf(signers[0].address)).sub(balBefore), await to.decimals()),
        await to.symbol() + ",", "gas used:", tx.cumulativeGasUsed.toString());
}

let weth: IWrappedEther,
    usdc: IERC20Metadata,
    usdt: IERC20Metadata,
    dai: IERC20Metadata,
    wbtc: IERC20Metadata,
    frax: IERC20Metadata;
async function setupMajorCoins() {
    const wethUsdcPool = "0x79c912FEF520be002c2B6e57EC4324e260f38E50";
    const threeCrvPool = "0x1337BedC9D22ecbe766dF105c9623922A27963EC";
    const encodedFeeData3 = "0x0000000000000000000000000000000000000bb8"; // fee tier 3000 (0.3%)
    const encodedFeeData05 = "0x00000000000000000000000000000000000001F4"; // fee tier 500 (0.05%)

    const swapRouter = "0xE592427A0AEce92De3Edee1F18E0157C05861564";

    usdc = await ethers.getContractAt("IERC20Metadata", "0x7F5c764cBc14f9669B88837ca1490cCa17c31607");
    usdt = await ethers.getContractAt("IERC20Metadata", "0x94b008aA00579c1307B0EF2c499aD98a8ce58e58");
    dai = await ethers.getContractAt("IERC20Metadata", "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1");
    wbtc = await ethers.getContractAt("IERC20Metadata", "0x68f180fcCe6836688e9084f035309E29Bf0A2095");
    frax = await ethers.getContractAt("IERC20Metadata", "0x2E3D870790dC77A83DD1d18184Acc7439A53f475");

    let usdcWethRoute: Route, wethUsdcRoute: Route,
        usdcUsdtRoute: Route, usdtUsdcRoute: Route,
        usdcDaiRoute: Route, daiUsdcRoute: Route,
        daiUsdtRoute: Route, usdtDaiRoute: Route,
        daiWethRoute: Route, wethDaiRoute: Route,
        wethUsdtRoute: Route, usdtWethRoute: Route,

        wbtcWethRoute: Route, wbtcUsdcRoute: Route, wbtcUsdtRoute: Route, wbtcDaiRoute: Route,
        wethWbtcRoute: Route, usdcWbtcRoute: Route, usdtWbtcRoute: Route, daiWbtcRoute: Route,

        fraxWethRoute: Route, fraxUsdcRoute: Route, fraxUsdtRoute: Route, fraxDaiRoute: Route, fraxWbtcRoute: Route,
        wethFraxRoute: Route, usdcFraxRoute: Route, usdtFraxRoute: Route, daiFraxRoute: Route, wbtcFraxRoute: Route;

    fraxUsdcRoute = [
        { swapProtocol: 3, pool: encodedFeeData05, fromCoin: frax.address, toCoin: usdc.address }
    ];
    usdcFraxRoute = [
        { swapProtocol: 3, pool: encodedFeeData05, fromCoin: usdc.address, toCoin: frax.address }
    ];
    fraxWethRoute = [
        { swapProtocol: 3, pool: encodedFeeData05, fromCoin: frax.address, toCoin: usdc.address },
        { swapProtocol: 1, pool: wethUsdcPool, fromCoin: usdc.address, toCoin: weth.address },
    ]
    wethFraxRoute = [
        { swapProtocol: 1, pool: wethUsdcPool, fromCoin: weth.address, toCoin: usdc.address },
        { swapProtocol: 3, pool: encodedFeeData05, fromCoin: usdc.address, toCoin: frax.address }
    ];
    fraxUsdtRoute = [
        { swapProtocol: 3, pool: encodedFeeData05, fromCoin: frax.address, toCoin: usdc.address },
        { swapProtocol: 2, pool: threeCrvPool, fromCoin: usdc.address, toCoin: usdt.address }
    ];
    usdtFraxRoute = [
        { swapProtocol: 2, pool: threeCrvPool, fromCoin: usdt.address, toCoin: usdc.address },
        { swapProtocol: 3, pool: encodedFeeData05, fromCoin: usdc.address, toCoin: frax.address }
    ];
    fraxDaiRoute = [
        { swapProtocol: 3, pool: encodedFeeData05, fromCoin: frax.address, toCoin: usdc.address },
        { swapProtocol: 2, pool: threeCrvPool, fromCoin: usdc.address, toCoin: dai.address }
    ];
    daiFraxRoute = [
        { swapProtocol: 2, pool: threeCrvPool, fromCoin: dai.address, toCoin: usdc.address },
        { swapProtocol: 3, pool: encodedFeeData05, fromCoin: usdc.address, toCoin: frax.address }
    ];
    fraxWbtcRoute = [
        { swapProtocol: 3, pool: encodedFeeData05, fromCoin: frax.address, toCoin: usdc.address },
        { swapProtocol: 1, pool: wethUsdcPool, fromCoin: usdc.address, toCoin: weth.address },
        { swapProtocol: 3, pool: encodedFeeData3, fromCoin: weth.address, toCoin: wbtc.address }
    ];
    wbtcFraxRoute = [
        { swapProtocol: 3, pool: encodedFeeData3, fromCoin: wbtc.address, toCoin: weth.address },
        { swapProtocol: 1, pool: wethUsdcPool, fromCoin: weth.address, toCoin: usdc.address },
        { swapProtocol: 3, pool: encodedFeeData05, fromCoin: usdc.address, toCoin: frax.address }
    ];
    wbtcWethRoute = [
        { swapProtocol: 3, pool: encodedFeeData3, fromCoin: wbtc.address, toCoin: weth.address }
    ];
    wethWbtcRoute = [
        { swapProtocol: 3, pool: encodedFeeData3, fromCoin: weth.address, toCoin: wbtc.address }
    ];
    wbtcUsdcRoute = [
        { swapProtocol: 3, pool: encodedFeeData3, fromCoin: wbtc.address, toCoin: weth.address },
        { swapProtocol: 1, pool: wethUsdcPool, fromCoin: weth.address, toCoin: usdc.address }
    ];
    usdcWbtcRoute = [
        { swapProtocol: 1, pool: wethUsdcPool, fromCoin: usdc.address, toCoin: weth.address },
        { swapProtocol: 3, pool: encodedFeeData3, fromCoin: weth.address, toCoin: wbtc.address }
    ];
    wbtcUsdtRoute = [
        { swapProtocol: 3, pool: encodedFeeData3, fromCoin: wbtc.address, toCoin: weth.address },
        { swapProtocol: 1, pool: wethUsdcPool, fromCoin: weth.address, toCoin: usdc.address },
        { swapProtocol: 2, pool: threeCrvPool, fromCoin: usdc.address, toCoin: usdt.address }
    ];
    usdtWbtcRoute = [
        { swapProtocol: 2, pool: threeCrvPool, fromCoin: usdt.address, toCoin: usdc.address },
        { swapProtocol: 1, pool: wethUsdcPool, fromCoin: usdc.address, toCoin: weth.address },
        { swapProtocol: 3, pool: encodedFeeData3, fromCoin: weth.address, toCoin: wbtc.address }
    ];
    wbtcDaiRoute = [
        { swapProtocol: 3, pool: encodedFeeData3, fromCoin: wbtc.address, toCoin: weth.address },
        { swapProtocol: 1, pool: wethUsdcPool, fromCoin: weth.address, toCoin: usdc.address },
        { swapProtocol: 2, pool: threeCrvPool, fromCoin: usdc.address, toCoin: dai.address }
    ];
    daiWbtcRoute = [
        { swapProtocol: 2, pool: threeCrvPool, fromCoin: dai.address, toCoin: usdc.address },
        { swapProtocol: 1, pool: wethUsdcPool, fromCoin: usdc.address, toCoin: weth.address },
        { swapProtocol: 3, pool: encodedFeeData3, fromCoin: weth.address, toCoin: wbtc.address }
    ];
    usdcWethRoute = [
        { swapProtocol: 1, pool: wethUsdcPool, fromCoin: usdc.address, toCoin: weth.address }
    ];
    wethUsdcRoute = [
        { swapProtocol: 1, pool: wethUsdcPool, fromCoin: weth.address, toCoin: usdc.address }
    ];
    usdcUsdtRoute = [
        { swapProtocol: 2, pool: threeCrvPool, fromCoin: usdc.address, toCoin: usdt.address }
    ];
    usdtUsdcRoute = [
        { swapProtocol: 2, pool: threeCrvPool, fromCoin: usdt.address, toCoin: usdc.address }
    ];
    usdcDaiRoute = [
        { swapProtocol: 2, pool: threeCrvPool, fromCoin: usdc.address, toCoin: dai.address }
    ];
    daiUsdcRoute = [
        { swapProtocol: 2, pool: threeCrvPool, fromCoin: dai.address, toCoin: usdc.address }
    ];
    daiUsdtRoute = [
        { swapProtocol: 2, pool: threeCrvPool, fromCoin: dai.address, toCoin: usdt.address }
    ];
    usdtDaiRoute = [
        { swapProtocol: 2, pool: threeCrvPool, fromCoin: usdt.address, toCoin: dai.address }
    ];
    wethDaiRoute = [
        { swapProtocol: 1, pool: wethUsdcPool, fromCoin: weth.address, toCoin: usdc.address },
        { swapProtocol: 2, pool: threeCrvPool, fromCoin: usdc.address, toCoin: dai.address }
    ];
    daiWethRoute = [
        { swapProtocol: 2, pool: threeCrvPool, fromCoin: dai.address, toCoin: usdc.address },
        { swapProtocol: 1, pool: wethUsdcPool, fromCoin: usdc.address, toCoin: weth.address }
    ];
    wethUsdtRoute = [
        { swapProtocol: 1, pool: wethUsdcPool, fromCoin: weth.address, toCoin: usdc.address },
        { swapProtocol: 2, pool: threeCrvPool, fromCoin: usdc.address, toCoin: usdt.address }
    ];
    usdtWethRoute = [
        { swapProtocol: 2, pool: threeCrvPool, fromCoin: usdt.address, toCoin: usdc.address },
        { swapProtocol: 1, pool: wethUsdcPool, fromCoin: usdc.address, toCoin: weth.address }
    ];

    const velodromeAdapterFactory = await ethers.getContractFactory("SushiswapAdapter");
    const optimism3crvAdapterFactory = await ethers.getContractFactory("OptimismCurve3CrvAdapter");
    const uniV3AdapterFactory = await ethers.getContractFactory("UniswapV3Adapter");
    const velodromeAdapter = await velodromeAdapterFactory.deploy();
    const optimism3crvAdapter = await optimism3crvAdapterFactory.deploy();
    const uniV3Adapter = await uniV3AdapterFactory.deploy();

    const routes: Route[] = [
        usdcWethRoute, wethUsdcRoute,
        usdcUsdtRoute, usdtUsdcRoute,
        usdcDaiRoute, daiUsdcRoute,
        daiUsdtRoute, usdtDaiRoute,
        daiWethRoute, wethDaiRoute,
        wethUsdtRoute, usdtWethRoute,
        wbtcWethRoute, wbtcUsdcRoute, wbtcUsdtRoute, wbtcDaiRoute,
        wethWbtcRoute, usdcWbtcRoute, usdtWbtcRoute, daiWbtcRoute,
        fraxWethRoute, fraxUsdcRoute, fraxUsdtRoute, fraxDaiRoute, fraxWbtcRoute,
        wethFraxRoute, usdcFraxRoute, usdtFraxRoute, daiFraxRoute, wbtcFraxRoute
    ];
    await exchange.createInternalMajorRoutes(routes);
    await exchange.registerAdapters([velodromeAdapter.address, optimism3crvAdapter.address, uniV3Adapter.address], [1, 2, 3]);
    await exchange.createApproval([weth.address, wbtc.address, usdc.address, frax.address], [swapRouter, swapRouter, swapRouter, swapRouter])

    customAmounts[wbtc.address] = parseUnits("0.001", await wbtc.decimals());

    supportedCoinsList.push(usdc, usdt, dai, weth, wbtc, frax);

    console.log("Major coins (USDC, USDT, DAI, WETH, WBTC, FRAX) are set.");
}

let wstEthCrv: IERC20Metadata;
async function setupWstEthCrvMinorCoin() {
    wstEthCrv = await ethers.getContractAt("IERC20Metadata", "0xEfDE221f306152971D8e9f181bFe998447975810");
    const pool = "0xB90B9B1F91a01Ea22A182CD84C1E22222e39B415";

    const edge: Edge = { swapProtocol: 4, pool: pool, fromCoin: wstEthCrv.address, toCoin: weth.address };

    const adapterFactory = await ethers.getContractFactory("OptimismCurveWstEthAdapter");
    const adapter = await adapterFactory.deploy();

    await exchange.registerAdapters([adapter.address], [4]);
    await exchange.createMinorCoinEdge([edge]);

    supportedCoinsList.push(wstEthCrv);

    console.log("Minor coin (wstETHCRV) is set.");
}

let ldo: IERC20Metadata;
async function setupLdoMinorCoin() {
    const encodedFeeData3 = "0x0000000000000000000000000000000000000bb8"; // fee tier 3000 (0.3%)
    const swapRouter = "0xE592427A0AEce92De3Edee1F18E0157C05861564";

    ldo = await ethers.getContractAt("IERC20Metadata", "0xFdb794692724153d1488CcdBE0C56c252596735F");

    const edge: Edge = { swapProtocol: 3, pool: encodedFeeData3, fromCoin: ldo.address, toCoin: weth.address };

    await exchange.createMinorCoinEdge([edge]);
    await exchange.createApproval([ldo.address], [swapRouter]);

    supportedCoinsList.push(ldo);

    console.log("Minor coin (LDO) is set.");
}

let beefyLibraryAddress: string;
let mooHopUSDC: IERC20Metadata;
async function setupBeefyHopUsdcMinorCoin() {
    mooHopUSDC = await ethers.getContractAt("IERC20Metadata", "0xE2f035f59De6a952FF699b4EDD0f99c466f25fEc");
    const hopSwapPool = "0x3c0FFAca566fCcfD9Cc95139FEF6CBA143795963";
    const hopUsdcLpToken = "0x2e17b8193566345a2Dd467183526dEdc42d2d5A8";

    const edge: Edge = { swapProtocol: 5, pool: mooHopUSDC.address, fromCoin: mooHopUSDC.address, toCoin: usdc.address };

    await exchange.createMinorCoinEdge([edge]);
    await exchange.createApproval([usdc.address, hopUsdcLpToken, hopUsdcLpToken], [hopSwapPool, mooHopUSDC.address, hopSwapPool]);

    const libraryFactory = await ethers.getContractFactory("BeefyBase");
    const library = await libraryFactory.deploy();
    await library.deployTransaction.wait();
    beefyLibraryAddress = library.address;

    const adapterFactory = await ethers.getContractFactory("BeefyHopUsdcAdapter", { libraries: { BeefyBase: beefyLibraryAddress } });
    const adapter = await adapterFactory.deploy();

    await exchange.registerAdapters([adapter.address], [5]);

    supportedCoinsList.push(mooHopUSDC);

    console.log("Minor coin (mooHopUSDC) is set.");
}

let mooCurveFsUSD: IERC20Metadata;
async function setupBeefyCurveFsUSDMinorCoin() {
    mooCurveFsUSD = await ethers.getContractAt("IERC20Metadata", "0x107Dbf9c9C0EF2Df114159e5C7DC2baf7C444cFF");
    const curvePool = "0x061b87122Ed14b9526A813209C8a59a633257bAb";
    const curveMetaPool = "0x167e42a1C7ab4Be03764A2222aAC57F5f6754411";

    const edge: Edge = { swapProtocol: 6, pool: mooCurveFsUSD.address, fromCoin: mooCurveFsUSD.address, toCoin: usdc.address };

    await exchange.createMinorCoinEdge([edge]);
    await exchange.createApproval([usdc.address, curvePool, curvePool], [curveMetaPool, mooCurveFsUSD.address, curveMetaPool]);

    const adapterFactory = await ethers.getContractFactory("BeefyCurveOpFSusdAdapter", { libraries: { BeefyBase: beefyLibraryAddress } });
    const adapter = await adapterFactory.deploy();

    await exchange.registerAdapters([adapter.address], [6]);

    supportedCoinsList.push(mooCurveFsUSD);

    console.log("Minor coin (mooCurveFsUSD) is set.");
}

let mooStargateUsdc: IERC20Metadata;
async function setupBeefyStargateUsdcMinorCoin() {
    mooStargateUsdc = await ethers.getContractAt("IERC20Metadata", "0xe536F8141D8EB7B1f096934AF3329cB581bFe995");
    const susdc = "0xDecC0c09c3B5f6e92EF4184125D5648a66E35298";
    const stargate = "0xB0D502E938ed5f4df2E681fE6E419ff29631d62b";

    const edge: Edge = { swapProtocol: 7, pool: mooStargateUsdc.address, fromCoin: mooStargateUsdc.address, toCoin: usdc.address };

    await exchange.createMinorCoinEdge([edge]);
    await exchange.createApproval([usdc.address, susdc], [stargate, mooStargateUsdc.address]);

    const adapterFactory = await ethers.getContractFactory("BeefyStargateUsdcAdapter", { libraries: { BeefyBase: beefyLibraryAddress } });
    const adapter = await adapterFactory.deploy();

    await exchange.registerAdapters([adapter.address], [7]);

    supportedCoinsList.push(mooStargateUsdc);
    customAmounts[mooStargateUsdc.address] = parseUnits("1.0", await usdc.decimals());

    console.log("Minor coin (mooStargateUsdc) is set.");
}

let mooCurveWSTETH: IERC20Metadata;
async function setupBeefyCurveWSTETHMinorCoin() {
    mooCurveWSTETH = await ethers.getContractAt("IERC20Metadata", "0x0892a178c363b4739e5Ac89E9155B9c30214C0c0");
    const curveLp = "0xEfDE221f306152971D8e9f181bFe998447975810";

    const edge: Edge = { swapProtocol: 8, pool: mooCurveWSTETH.address, fromCoin: mooCurveWSTETH.address, toCoin: weth.address };

    await exchange.createMinorCoinEdge([edge]);
    await exchange.createApproval([curveLp], [mooCurveWSTETH.address]);

    const adapterFactory = await ethers.getContractFactory("BeefyCurveWstEthAdapter", { libraries: { BeefyBase: beefyLibraryAddress } });
    const adapter = await adapterFactory.deploy();

    await exchange.registerAdapters([adapter.address], [8]);

    supportedCoinsList.push(mooCurveWSTETH);

    console.log("Minor coin (mooCurveWSTETH) is set.");
}

let op: IERC20Metadata;
async function setupOpMinorCoin() {
    const encodedFeeData3 = "0x0000000000000000000000000000000000000bb8"; // fee tier 3000 (0.3%)
    const swapRouter = "0xE592427A0AEce92De3Edee1F18E0157C05861564";

    op = await ethers.getContractAt("IERC20Metadata", "0x4200000000000000000000000000000000000042");

    const edge: Edge = { swapProtocol: 3, pool: encodedFeeData3, fromCoin: op.address, toCoin: weth.address };

    await exchange.createMinorCoinEdge([edge]);
    await exchange.createApproval([op.address], [swapRouter]);

    supportedCoinsList.push(op);

    console.log("Minor coin (OP) is set.");
}

async function setOpAsMajorCoin() {
    const wethUsdcPool = "0x79c912FEF520be002c2B6e57EC4324e260f38E50";
    const threeCrvPool = "0x1337BedC9D22ecbe766dF105c9623922A27963EC";
    const encodedFeeData3 = "0x0000000000000000000000000000000000000bb8"; // fee tier 3000 (0.3%)
    const encodedFeeData05 = "0x00000000000000000000000000000000000001F4"; // fee tier 500 (0.05%)

    op = await ethers.getContractAt("IERC20Metadata", "0x4200000000000000000000000000000000000042");

    const edge: Edge = { swapProtocol: 3, pool: encodedFeeData3, fromCoin: op.address, toCoin: weth.address };
    const reverseEdge: Edge = { swapProtocol: 3, pool: encodedFeeData3, fromCoin: weth.address, toCoin: op.address };

    let opWethRoute: Route, opUsdcRoute: Route, opUsdtRoute: Route, opDaiRoute: Route, opWbtcRoute: Route, opFraxRoute: Route,
        wethOpRoute: Route, usdcOpRoute: Route, usdtOpRoute: Route, daiOpRoute: Route, wbtcOpRoute: Route, fraxOpRoute: Route;

    opWethRoute = [edge];
    wethOpRoute = [reverseEdge];

    opUsdcRoute = [
        edge,
        { swapProtocol: 1, pool: wethUsdcPool, fromCoin: weth.address, toCoin: usdc.address }
    ];
    usdcOpRoute = [
        { swapProtocol: 1, pool: wethUsdcPool, fromCoin: usdc.address, toCoin: weth.address },
        reverseEdge
    ];

    opUsdtRoute = [
        edge,
        { swapProtocol: 1, pool: wethUsdcPool, fromCoin: weth.address, toCoin: usdc.address },
        { swapProtocol: 2, pool: threeCrvPool, fromCoin: usdc.address, toCoin: usdt.address }
    ];
    usdtOpRoute = [
        { swapProtocol: 2, pool: threeCrvPool, fromCoin: usdt.address, toCoin: usdc.address },
        { swapProtocol: 1, pool: wethUsdcPool, fromCoin: usdc.address, toCoin: weth.address },
        reverseEdge
    ];

    opDaiRoute = [
        edge,
        { swapProtocol: 1, pool: wethUsdcPool, fromCoin: weth.address, toCoin: usdc.address },
        { swapProtocol: 2, pool: threeCrvPool, fromCoin: usdc.address, toCoin: dai.address }
    ];
    daiOpRoute = [
        { swapProtocol: 2, pool: threeCrvPool, fromCoin: dai.address, toCoin: usdc.address },
        { swapProtocol: 1, pool: wethUsdcPool, fromCoin: usdc.address, toCoin: weth.address },
        reverseEdge
    ];

    opWbtcRoute = [
        edge,
        { swapProtocol: 3, pool: encodedFeeData3, fromCoin: weth.address, toCoin: wbtc.address }
    ];
    wbtcOpRoute = [
        { swapProtocol: 3, pool: encodedFeeData3, fromCoin: wbtc.address, toCoin: weth.address },
        reverseEdge
    ]

    opFraxRoute = [
        edge,
        { swapProtocol: 1, pool: wethUsdcPool, fromCoin: weth.address, toCoin: usdc.address },
        { swapProtocol: 3, pool: encodedFeeData05, fromCoin: usdc.address, toCoin: frax.address }
    ]
    fraxOpRoute = [
        { swapProtocol: 3, pool: encodedFeeData05, fromCoin: frax.address, toCoin: usdc.address },
        { swapProtocol: 1, pool: wethUsdcPool, fromCoin: usdc.address, toCoin: weth.address },
        reverseEdge
    ]

    const routes: Route[] = [
        opWethRoute, opUsdcRoute, opUsdtRoute, opDaiRoute, opWbtcRoute, opFraxRoute,
        wethOpRoute, usdcOpRoute, usdtOpRoute, daiOpRoute, wbtcOpRoute, fraxOpRoute
    ];

    await exchange.deleteMinorCoinEdge([op.address]);
    await exchange.createInternalMajorRoutes(routes);

    console.log("Set OP as major coin");
}

let yvUSDC: IERC20Metadata,
    yvUSDT: IERC20Metadata,
    yvDAI: IERC20Metadata,
    yvOP: IERC20Metadata;
async function setYearnMinorCoins() {
    yvUSDC = await ethers.getContractAt("IERC20Metadata", "0xaD17A225074191d5c8a37B50FdA1AE278a2EE6A2");
    yvUSDT = await ethers.getContractAt("IERC20Metadata", "0xFaee21D0f0Af88EE72BB6d68E54a90E6EC2616de");
    yvDAI = await ethers.getContractAt("IERC20Metadata", "0x65343F414FFD6c97b0f6add33d16F6845Ac22BAc");
    yvOP = await ethers.getContractAt("IERC20Metadata", "0x7D2382b1f8Af621229d33464340541Db362B4907");

    const usdcAdapterFactory = await ethers.getContractFactory("YearnUsdcAdapter");
    const usdtAdapterFactory = await ethers.getContractFactory("YearnUsdtAdapter");
    const daiAdapterFactory = await ethers.getContractFactory("YearnDaiAdapter");
    const opAdapterFactory = await ethers.getContractFactory("YearnOpAdapter");

    const usdcAdapter = await usdcAdapterFactory.deploy();
    const usdtAdapter = await usdtAdapterFactory.deploy();
    const daiAdapter = await daiAdapterFactory.deploy();
    const opAdapter = await opAdapterFactory.deploy();

    await exchange.registerAdapters([usdcAdapter.address, usdtAdapter.address, daiAdapter.address, opAdapter.address], [9, 10, 11, 12]);

    const edgeUsdc: Edge = { swapProtocol: 9, pool: yvUSDC.address, fromCoin: yvUSDC.address, toCoin: usdc.address };
    const edgeUsdt: Edge = { swapProtocol: 10, pool: yvUSDT.address, fromCoin: yvUSDT.address, toCoin: usdt.address };
    const edgeDai: Edge = { swapProtocol: 11, pool: yvDAI.address, fromCoin: yvDAI.address, toCoin: dai.address };
    const edgeOp: Edge = { swapProtocol: 12, pool: yvOP.address, fromCoin: yvOP.address, toCoin: op.address };

    await exchange.createMinorCoinEdge([edgeUsdc, edgeUsdt, edgeDai, edgeOp]);

    supportedCoinsList.push(yvUSDC, yvUSDT, yvDAI, yvOP);

    console.log("Minor coins (yvUSDC, yvUSDT, yvDAI, yvOP) are set.");
}

let mooVelodromeMAIUSDC: IERC20Metadata;
let beefyExchange: BeefyUniversalExchange;
let velodromeLibrary: VelodromeCalldataSource;
async function setVelodromeMAIUSDCMinorCoin() {
    mooVelodromeMAIUSDC = await ethers.getContractAt("IERC20Metadata", "0x01D9cfB8a9D43013a1FdC925640412D8d2D900F0");

    const velodromeLp = "0xd62c9d8a3d4fd98b27caaefe3571782a3af0a737";
    const velodromeRouter = "0xa132DAB612dB5cB9fC9Ac426A0Cc215A3423F9c9";
    const mai = "0xdFA46478F9e5EA86d57387849598dbFB2e964b02";

    const adapterFactory = await ethers.getContractFactory("BeefyUniversalAdapter");
    const beefyExchangeFactory = await ethers.getContractFactory("BeefyUniversalExchange");
    const velodromeLibraryFactory = await ethers.getContractFactory("VelodromeCalldataSource");

    const adapter = await adapterFactory.deploy();
    velodromeLibrary = await velodromeLibraryFactory.deploy();
    beefyExchange = await beefyExchangeFactory.deploy(exchange.address, constants.AddressZero, true);

    const edge: Edge = { swapProtocol: 13, pool: beefyExchange.address, fromCoin: mooVelodromeMAIUSDC.address, toCoin: usdc.address };

    await exchange.registerAdapters([adapter.address], [13]);
    await exchange.createMinorCoinEdge([edge]);

    await beefyExchange.addBeefyPool(
        mooVelodromeMAIUSDC.address,
        {
            want: velodromeLp,
            dataContract: velodromeLibrary.address,
            dataBuy: [],
            dataSell: []
        }
    );

    await beefyExchange.createApproval([usdc.address, mai, velodromeLp, velodromeLp], [velodromeRouter, velodromeRouter, mooVelodromeMAIUSDC.address, velodromeRouter])

    customAmounts[mooVelodromeMAIUSDC.address] = parseUnits("0.000001", await mooVelodromeMAIUSDC.decimals());
    supportedCoinsList.push(mooVelodromeMAIUSDC);

    console.log("Minor coin (mooVelodromeMAIUSDC - via Universal beefy exchange) is set.");
}

let dola: IERC20Metadata;
async function setDolaMajorCoin() {
    const wethUsdcPool = "0x79c912FEF520be002c2B6e57EC4324e260f38E50";
    const threeCrvPool = "0x1337BedC9D22ecbe766dF105c9623922A27963EC";
    const encodedFeeData3 = "0x0000000000000000000000000000000000000bb8"; // fee tier 3000 (0.3%)
    const encodedFeeData05 = "0x00000000000000000000000000000000000001F4"; // fee tier 500 (0.05%)

    const velodromeRouter = "0xa132DAB612dB5cB9fC9Ac426A0Cc215A3423F9c9";

    dola = await ethers.getContractAt("IERC20Metadata", "0x8aE125E8653821E851F12A49F7765db9a9ce7384");
    const dolaUsdcPool = "0x6C5019D345Ec05004A7E7B0623A91a0D9B8D590d";

    let dolaWethRoute: Route, dolaUsdcRoute: Route, dolaUsdtRoute: Route, dolaDaiRoute: Route, dolaWbtcRoute: Route, dolaFraxRoute: Route, dolaOpRoute: Route,
        wethDolaRoute: Route, usdcDolaRoute: Route, usdtDolaRoute: Route, daiDolaRoute: Route, wbtcDolaRoute: Route, fraxDolaRoute: Route, opDolaRoute: Route;

    const dolaEdge: Edge = { swapProtocol: 1, pool: dolaUsdcPool, fromCoin: dola.address, toCoin: usdc.address };
    const dolaEdgeReverse: Edge = { swapProtocol: 1, pool: dolaUsdcPool, fromCoin: usdc.address, toCoin: dola.address };

    dolaWethRoute = [
        dolaEdge,
        { swapProtocol: 1, pool: wethUsdcPool, fromCoin: usdc.address, toCoin: weth.address },
    ];
    dolaUsdcRoute = [
        dolaEdge
    ];
    dolaUsdtRoute = [
        dolaEdge,
        { swapProtocol: 2, pool: threeCrvPool, fromCoin: usdc.address, toCoin: usdt.address }
    ];
    dolaDaiRoute = [
        dolaEdge,
        { swapProtocol: 2, pool: threeCrvPool, fromCoin: usdc.address, toCoin: dai.address }
    ];
    dolaWbtcRoute = [
        dolaEdge,
        { swapProtocol: 1, pool: wethUsdcPool, fromCoin: usdc.address, toCoin: weth.address },
        { swapProtocol: 3, pool: encodedFeeData3, fromCoin: weth.address, toCoin: wbtc.address }
    ];
    dolaFraxRoute = [
        dolaEdge,
        { swapProtocol: 3, pool: encodedFeeData05, fromCoin: usdc.address, toCoin: frax.address }
    ];
    dolaOpRoute = [
        dolaEdge,
        { swapProtocol: 1, pool: wethUsdcPool, fromCoin: usdc.address, toCoin: weth.address },
        { swapProtocol: 3, pool: encodedFeeData3, fromCoin: weth.address, toCoin: op.address }
    ];

    wethDolaRoute = [
        { swapProtocol: 1, pool: wethUsdcPool, fromCoin: weth.address, toCoin: usdc.address },
        dolaEdgeReverse
    ];
    usdcDolaRoute = [
        dolaEdgeReverse
    ];
    usdtDolaRoute = [
        { swapProtocol: 2, pool: threeCrvPool, fromCoin: usdt.address, toCoin: usdc.address },
        dolaEdgeReverse
    ];
    daiDolaRoute = [
        { swapProtocol: 2, pool: threeCrvPool, fromCoin: dai.address, toCoin: usdc.address },
        dolaEdgeReverse
    ];
    wbtcDolaRoute = [
        { swapProtocol: 3, pool: encodedFeeData3, fromCoin: wbtc.address, toCoin: weth.address },
        { swapProtocol: 1, pool: wethUsdcPool, fromCoin: weth.address, toCoin: usdc.address },
        dolaEdgeReverse
    ];
    fraxDolaRoute = [
        { swapProtocol: 3, pool: encodedFeeData05, fromCoin: frax.address, toCoin: usdc.address },
        dolaEdgeReverse
    ];
    opDolaRoute = [
        { swapProtocol: 3, pool: encodedFeeData3, fromCoin: op.address, toCoin: weth.address },
        { swapProtocol: 1, pool: wethUsdcPool, fromCoin: weth.address, toCoin: usdc.address },
        dolaEdgeReverse
    ];

    const routes = [dolaWethRoute, dolaUsdcRoute, dolaUsdtRoute, dolaDaiRoute, dolaWbtcRoute, dolaFraxRoute, dolaOpRoute,
        wethDolaRoute, usdcDolaRoute, usdtDolaRoute, daiDolaRoute, wbtcDolaRoute, fraxDolaRoute, opDolaRoute]

    await exchange.createInternalMajorRoutes(routes);
    await exchange.createApproval([dola.address, usdc.address, weth.address], [velodromeRouter, velodromeRouter, velodromeRouter])

    supportedCoinsList.push(dola);

    const velodromeAdapterFactory = await ethers.getContractFactory("VelodromeAdapter");
    const velodromeAdapter = await velodromeAdapterFactory.deploy();

    await exchange.registerAdapters([velodromeAdapter.address], [1]); // +

    console.log("Set DOLA as major coin");
}

let mooVelodromeDOLAMAI: IERC20Metadata;
async function setVelodromeDolaMaiMinorCoin() {
    mooVelodromeDOLAMAI = await ethers.getContractAt("IERC20Metadata", "0xa9913D2DA71768CD13eA75B05D9E91A3120E2f08");

    const velodromeLp = "0x21950a0cA249A0ef3d182338c86c8C066B24D801";
    const velodromeRouter = "0xa132DAB612dB5cB9fC9Ac426A0Cc215A3423F9c9";
    const mai = "0xdFA46478F9e5EA86d57387849598dbFB2e964b02";

    const edge: Edge = { swapProtocol: 13, pool: beefyExchange.address, fromCoin: mooVelodromeDOLAMAI.address, toCoin: dola.address };

    await exchange.createMinorCoinEdge([edge]);  // +

    await beefyExchange.addBeefyPool(
        mooVelodromeDOLAMAI.address,
        {
            want: velodromeLp,
            dataContract: velodromeLibrary.address,
            dataBuy: [],
            dataSell: []
        }
    );
    await beefyExchange.createApproval([dola.address, velodromeLp, velodromeLp], [velodromeRouter, mooVelodromeDOLAMAI.address, velodromeRouter])

    supportedCoinsList.push(mooVelodromeDOLAMAI);

    console.log("Minor coin (mooVelodromeDOLAMAI - via Universal beefy exchange) is set.");
}

let mooVelodromeDOLAFRAX: IERC20Metadata;
async function setVelodromeDolaFraxMinorCoin() {
    mooVelodromeDOLAFRAX = await ethers.getContractAt("IERC20Metadata", "0xe282AD2480fFD8e34454C56c4360E5ba3240a429");

    const velodromeLp = "0xD29DE64c1a9Dd3e829A7345BE1E9c32a9414541f";
    const velodromeRouter = "0xa132DAB612dB5cB9fC9Ac426A0Cc215A3423F9c9";
    const frax = "0x2E3D870790dC77A83DD1d18184Acc7439A53f475";

    const edge: Edge = { swapProtocol: 13, pool: beefyExchange.address, fromCoin: mooVelodromeDOLAFRAX.address, toCoin: dola.address };

    await exchange.createMinorCoinEdge([edge]); // +

    await beefyExchange.addBeefyPool(
        mooVelodromeDOLAFRAX.address,
        {
            want: velodromeLp,
            dataContract: velodromeLibrary.address,
            dataBuy: [],
            dataSell: []
        }
    );
    await beefyExchange.createApproval([frax, velodromeLp, velodromeLp], [velodromeRouter, mooVelodromeDOLAFRAX.address, velodromeRouter])

    supportedCoinsList.push(mooVelodromeDOLAFRAX);

    console.log("Minor coin (mooVelodromeDOLAFRAX - via Universal beefy exchange) is set.");
}

// TODO: add your new exchange setup function above this line. use example below
//
// always specify in function name if you are adding new minor coin, doing some
// extra setup, etc...
//
// e.g. if you are adding token EXAMPLE as minor, recommended function name is
// `setupExampleMinorCoin`. Follow `snakeCase` rule for function name
//
// when adding new coin(-s) to the exchange, declare its global variable(-s) right
// above function declaration, always specify type `IERC20Metadata`
//
// right after function declaration, call it inside `beforeEach` hook below

// uncomment code below for readability

// let example: IERC20Metadata;
// // ...
// async function setupExampleMinorCoin() {
//     // declare constants first - pool addresses, ids, calldatas etc...
//     const pool = "0x1234567890123456789012345678901234567890"

//     // set your global token variable(-s) using `ethers.getContractAt`
//     example = await ethers.getContractAt("IERC20Metadata", "0x1111111111111111111111111111111111111111");
//     // ...

//     // declare constant(-s) of type `Edge` that will be passed to the Exchange
//     // - swapProtocol - adapter id that has to be used in the exchange
//     // - pool - address of the pool that will be passed to the adapter for exchange
//     // - fromCoin - MINOR coin that you want to add to the exchange
//     // - toCoin - MAJOR coin that is already registered on exchange
//     const edge1: Edge = { swapProtocol: 69, pool: pool, fromCoin: example.address, toCoin: weth.address}; 
//     const edge2: Edge = { swapProtocol: 69, pool: pool, fromCoin: example.address, toCoin: weth.address}; 
//     //...

//     // deploy and register any new adapters if needed. always check that you are using unique id and
//     // not overwriting any existing adapter, otherwise you may break some routes
//     const ExampleAdapter = await ethers.getContractFactory("ExampleAdapter");
//     const adapter = await ExampleAdapter.deploy();
//     await exchange.registerAdapters([adapter.address, /*...*/], [69, /*...*/]);

//     // create needed edges on the exchange
//     await exchange.createMinorCoinEdge([edge1, edge2, /*...*/]);

//     // exchange automatically approves `fromCoin` and `toCoin` to spender `pool`, but 
//     // if your adapter requires any other token approval, use `createApproval` function.
//     // avoid calling `approve` on tokens inside adapters.
//     await exchange.createApproval(
//         [example.address, /*...*/], // coins: what coins to approve
//         [pool, /*...*/]             // spenders: whom to approve
//     ); // every coins[i] is approved by Exchange to spenders[i], array lengths must be equal

//     // if you are dealing with extremely cheap/expensive coins, you may want to override amount
//     // of tokens that has to be used in swap from your token
//     customAmounts[example.address] = parseUnits("0.001", await wbtc.decimals());
//     customAmounts[example.address] = parseUnits("0.001", await wbtc.decimals());
//     //...

//     // always add your token to supported coins list
//     supportedCoinsList.push(example, /*...*/);

//     // always console log at the end some description what you did.
//     console.log("Minor coin (EXCHANGE, ...) is set.")
// }

describe("Exchange (full setup operations on Optimism Mainnet)", async () => {
    before(async () => {
        await network.provider.request({
            method: "hardhat_reset",
            params: [{
                forking: {
                    enabled: true,
                    jsonRpcUrl: process.env.OPTIMISM_URL as string,
                },
            },],
        });
        console.log("\nForking Optimism Mainnet from latest block. This test may take some time.")

        signers = await ethers.getSigners();
    });

    beforeEach(async () => {
        const Exchange = await ethers.getContractFactory("Exchange");
        exchange = await Exchange.deploy(
            "0xc7061dD515B602F86733Fa0a0dBb6d6E6B34aED4",
            true
        );
        weth = await ethers.getContractAt("IWrappedEther", "0x4200000000000000000000000000000000000006");
        await exchange.setWrappedNativeToken(weth.address);
        console.log("Clean Exchange contract deployed, setting up routes...\n");
        // adaprter creations:
        await setupMajorCoins();         // adapter ids: 1, 2, 3
        await setupWstEthCrvMinorCoin(); // adapter ids: 4
        await setupLdoMinorCoin();
        await setupBeefyHopUsdcMinorCoin(); // adapter ids: 5
        await setupBeefyCurveFsUSDMinorCoin(); // adapter ids: 6
        await setupBeefyStargateUsdcMinorCoin(); // adapter ids: 7
        await setupBeefyCurveWSTETHMinorCoin(); // adapter ids: 8
        await setupOpMinorCoin();
        await setOpAsMajorCoin();
        await setYearnMinorCoins();         // adapter ids: 9, 10, 11, 12
        await setVelodromeMAIUSDCMinorCoin(); // adapter ids: 13
        await setDolaMajorCoin();
        await setVelodromeDolaMaiMinorCoin();
        await setVelodromeDolaFraxMinorCoin();

        // TODO: add your new exchange setup function call above this line. add adapter
        // id comment after function call if you are registering any new adapters inside
        // 
        // with example above, you would add this line:
        // await setupExampleMinorCoin()         // adapter ids: 69

        console.log("\nRoutes set, executing all possible exchanges\n");
    });

    it("Should check all available swaps", async () => {
        console.log("Supported coins list length:", supportedCoinsList.length);

        await weth.deposit({ value: parseEther("1000.0") });

        // get all supported coins - swap ETH for all coins
        console.log("Swapping ETH to all listed coins...\n");
        for (let i = 0; i < supportedCoinsList.length; i++) {
            const coin = supportedCoinsList[i];
            if (coin.address == weth.address) continue;
            const ethToCoinAmount = parseEther("10.0");
            await testSwap(nativeEth, coin.address, ethToCoinAmount);
        }
        console.log();
        console.log("Executing all exchange combinations...\n");

        // swap all combinations of all tokens
        for (let i = 0; i < supportedCoinsList.length; i++) {
            for (let j = 0; j < supportedCoinsList.length; j++) {
                if (i == j) continue;

                const coinIn = supportedCoinsList[i];
                const coinOut = supportedCoinsList[j];

                const amount = customAmounts[coinIn.address] == null ?
                    parseUnits("0.5", await coinIn.decimals()) :
                    customAmounts[coinIn.address];

                await testSwap(coinIn.address, coinOut.address, amount);
            }
            console.log();
        }
        console.log();
        console.log("Swapping all listed coins to ETH...\n");

        // swap rest of all coins to eth
        for (let i = 0; i < supportedCoinsList.length; i++) {
            const coin = supportedCoinsList[i];
            if (coin.address == weth.address) continue;
            const amount = await coin.balanceOf(signers[0].address);
            await testSwap(coin.address, nativeEth, amount);
        }
    });
});