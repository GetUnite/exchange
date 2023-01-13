import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { BigNumber, BigNumberish, constants } from "ethers";
import { formatEther, formatUnits, parseEther, parseUnits } from "ethers/lib/utils";
import { ethers, network } from "hardhat";
import { Exchange, IERC20Metadata, IWrappedEther } from "../typechain";

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
    usdt: IERC20Metadata,
    usdc: IERC20Metadata,
    dai: IERC20Metadata,
    frax: IERC20Metadata,
    threeCrvLp: IERC20Metadata,
    crv3CryptoLp: IERC20Metadata;
async function setupMajorCoins() {
    const renbtcAddress = "0xD51a44d3FaE010294C616388b506AcdA1bfAAE46";
    const fraxPoolAddress = "0xd632f22692FaC7611d2AA1C0D552930D43CAEd3B";

    weth = await ethers.getContractAt("IWrappedEther", "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2");
    usdt = await ethers.getContractAt("IERC20Metadata", "0xdAC17F958D2ee523a2206206994597C13D831ec7");
    usdc = await ethers.getContractAt("IERC20Metadata", "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48");
    dai = await ethers.getContractAt("IERC20Metadata", "0x6B175474E89094C44Da98b954EedeAC495271d0F");
    frax = await ethers.getContractAt("IERC20Metadata", "0x853d955aCEf822Db058eb8505911ED77F175b99e");
    crv3CryptoLp = await ethers.getContractAt("IERC20Metadata", "0xc4AD29ba4B3c580e6D59105FFf484999997675Ff");
    threeCrvLp = await ethers.getContractAt("IERC20Metadata", "0x6c3F90f043a72FA612cbac8115EE7e52BDe6E490");

    let wethUsdtRoute: Route, wethUsdcRoute: Route, wethDaiRoute: Route, usdtWethRoute: Route, usdtUsdcRoute: Route, usdtDaiRoute: Route,
        usdcWethRoute: Route, usdcUsdtRoute: Route, usdcDaiRoute: Route, daiUsdcRoute: Route, daiUsdtRoute: Route, daiWethRoute: Route,
        wethFraxRoute: Route, usdtFraxRoute: Route, daiFraxRoute: Route, usdcFraxRoute: Route, fraxUsdcRoute: Route, fraxDaiRoute: Route,
        fraxUsdtRoute: Route, fraxWethRoute: Route;

    wethUsdtRoute = [
        { swapProtocol: 2, pool: renbtcAddress, fromCoin: weth.address, toCoin: usdt.address }
    ];
    wethUsdcRoute = [
        { swapProtocol: 2, pool: renbtcAddress, fromCoin: weth.address, toCoin: usdt.address },
        { swapProtocol: 1, pool: fraxPoolAddress, fromCoin: usdt.address, toCoin: usdc.address }
    ];
    wethDaiRoute = [
        { swapProtocol: 2, pool: renbtcAddress, fromCoin: weth.address, toCoin: usdt.address },
        { swapProtocol: 1, pool: fraxPoolAddress, fromCoin: usdt.address, toCoin: dai.address }
    ];
    usdtWethRoute = [
        // USDT - WETH
        { swapProtocol: 2, pool: renbtcAddress, fromCoin: usdt.address, toCoin: weth.address }
    ];
    usdtUsdcRoute = [
        // USDT - USDC
        { swapProtocol: 1, pool: fraxPoolAddress, fromCoin: usdt.address, toCoin: usdc.address }
    ]
    usdtDaiRoute = [
        // USDT - DAI
        { swapProtocol: 1, pool: fraxPoolAddress, fromCoin: usdt.address, toCoin: dai.address }
    ]
    usdcWethRoute = [
        // USDC - USDT - WETH
        { swapProtocol: 1, pool: fraxPoolAddress, fromCoin: usdc.address, toCoin: usdt.address },
        { swapProtocol: 2, pool: renbtcAddress, fromCoin: usdt.address, toCoin: weth.address }
    ];
    usdcUsdtRoute = [
        // USDC - USDT
        { swapProtocol: 1, pool: fraxPoolAddress, fromCoin: usdc.address, toCoin: usdt.address }
    ];
    usdcDaiRoute = [
        // USDC - DAI
        { swapProtocol: 1, pool: fraxPoolAddress, fromCoin: usdc.address, toCoin: dai.address }
    ];
    daiUsdcRoute = [
        // DAI - USDC
        { swapProtocol: 1, pool: fraxPoolAddress, fromCoin: dai.address, toCoin: usdc.address }
    ];
    daiUsdtRoute = [
        // DAI - USDT
        { swapProtocol: 1, pool: fraxPoolAddress, fromCoin: dai.address, toCoin: usdt.address }
    ];
    daiWethRoute = [
        // DAI - USDT - WETH
        { swapProtocol: 1, pool: fraxPoolAddress, fromCoin: dai.address, toCoin: usdt.address },
        { swapProtocol: 2, pool: renbtcAddress, fromCoin: usdt.address, toCoin: weth.address },
    ];
    wethFraxRoute = [
        // WETH - USDT - FRAX
        { swapProtocol: 2, pool: renbtcAddress, fromCoin: weth.address, toCoin: usdt.address },
        { swapProtocol: 1, pool: fraxPoolAddress, fromCoin: usdt.address, toCoin: frax.address },
    ];
    usdtFraxRoute = [
        // USDT - FRAX
        { swapProtocol: 1, pool: fraxPoolAddress, fromCoin: usdt.address, toCoin: frax.address },
    ];
    daiFraxRoute = [
        // DAI - FRAX
        { swapProtocol: 1, pool: fraxPoolAddress, fromCoin: dai.address, toCoin: frax.address },
    ];
    usdcFraxRoute = [
        // USDC - FRAX
        { swapProtocol: 1, pool: fraxPoolAddress, fromCoin: usdc.address, toCoin: frax.address },
    ];
    fraxUsdcRoute = [
        // FRAX - USDC
        { swapProtocol: 1, pool: fraxPoolAddress, fromCoin: frax.address, toCoin: usdc.address },
    ];
    fraxDaiRoute = [
        // FRAX - DAI
        { swapProtocol: 1, pool: fraxPoolAddress, fromCoin: frax.address, toCoin: dai.address },
    ];
    fraxUsdtRoute = [
        // FRAX - DAI
        { swapProtocol: 1, pool: fraxPoolAddress, fromCoin: frax.address, toCoin: usdt.address },
    ];
    fraxWethRoute = [
        // FRAX - USDT - WETH
        { swapProtocol: 1, pool: fraxPoolAddress, fromCoin: frax.address, toCoin: usdt.address },
        { swapProtocol: 2, pool: renbtcAddress, fromCoin: usdt.address, toCoin: weth.address },
    ];

    const routes: Route[] = [
        wethUsdtRoute, wethUsdcRoute, wethDaiRoute, usdtWethRoute, usdtUsdcRoute, usdtDaiRoute,
        usdcWethRoute, usdcUsdtRoute, usdcDaiRoute, daiUsdcRoute, daiUsdtRoute, daiWethRoute,
        wethFraxRoute, usdtFraxRoute, daiFraxRoute, usdcFraxRoute, fraxUsdcRoute, fraxDaiRoute,
        fraxUsdtRoute, fraxWethRoute,
    ];
    const ThreeCrypto = await ethers.getContractFactory("Curve3CryptoAdapter");
    const Frax = await ethers.getContractFactory("CurveFraxAdapter");
    const fraxAdapter = await Frax.deploy()
    const threeCrypto = await ThreeCrypto.deploy()

    await exchange.registerAdapters([fraxAdapter.address, threeCrypto.address], [1, 2]);
    await exchange.createInternalMajorRoutes(routes);
    await exchange.createLpToken(
        [{ swapProtocol: 1, pool: fraxPoolAddress }, { swapProtocol: 2, pool: renbtcAddress }],
        [fraxPoolAddress, crv3CryptoLp.address],
        [[threeCrvLp.address, frax.address, fraxPoolAddress], [usdt.address, weth.address]]);

    supportedCoinsList.push(dai, usdc, usdt, frax, weth);

    console.log("Major coins (WETH, USDC, USDT, DAI, FRAX) are set.");
}

async function setup3CrvMinorCoin() {
    const threeCrvPool = "0xbEbc44782C7dB0a1A60Cb6fe97d0b483032FF1C7";

    const threeCrvEdge: Edge = { swapProtocol: 3, pool: threeCrvPool, fromCoin: threeCrvLp.address, toCoin: usdc.address };
    const ThreeCrvSwap = await ethers.getContractFactory("Curve3CrvSwapAdapter");

    const threeCrypto = await ThreeCrvSwap.deploy();

    await exchange.registerAdapters([threeCrypto.address], [3]);
    await exchange.createMinorCoinEdge([threeCrvEdge]);

    supportedCoinsList.push(threeCrvLp);

    console.log("Minor coin (3Crv) is set.");
}

let cvx: IERC20Metadata,
    crv: IERC20Metadata;
async function setupCvxCrvMinorCoins() {
    const cvxCurvePool = "0xB576491F1E6e5E62f1d8F26062Ee822B40B0E0d4";
    const crvCurvePool = "0x8301AE4fc9c624d1D396cbDAa1ed877821D7C511";

    cvx = await ethers.getContractAt("IERC20Metadata", "0x4e3FBD56CD56c3e72c1403e103b45Db9da5B9D2B");
    crv = await ethers.getContractAt("IERC20Metadata", "0xD533a949740bb3306d119CC777fa900bA034cd52");

    const cvxEdge = { swapProtocol: 4, pool: cvxCurvePool, fromCoin: cvx.address, toCoin: weth.address };
    const crvEdge = { swapProtocol: 5, pool: crvCurvePool, fromCoin: crv.address, toCoin: weth.address };

    const CvxAdapter = await ethers.getContractFactory("CurveCvxAdapter");
    const CrvAdapter = await ethers.getContractFactory("CurveCrvAdapter");

    const cvxAdapter = await CvxAdapter.deploy();
    const crvAdapter = await CrvAdapter.deploy();

    await exchange.registerAdapters([cvxAdapter.address, crvAdapter.address], [4, 5]);
    await exchange.createMinorCoinEdge([cvxEdge, crvEdge]);

    supportedCoinsList.push(cvx, crv);

    console.log("Minor coins (CVX, CRV) are set.");
}

let ust: IERC20Metadata;
async function setupUstMinorCoin() {
    const ustCurveAddress = "0x890f4e345B1dAED0367A877a1612f86A1f86985f";

    ust = await ethers.getContractAt("IERC20Metadata", "0xa47c8bf37f92aBed4A126BDA807A7b7498661acD");

    const ustEdge = { swapProtocol: 6, pool: ustCurveAddress, fromCoin: ust.address, toCoin: usdt.address };
    const UstAdapter = await ethers.getContractFactory("CurveUstAdapter");
    const ustAdapter = await UstAdapter.deploy();

    await exchange.registerAdapters([ustAdapter.address], [6]);
    await exchange.createMinorCoinEdge([ustEdge]);

    supportedCoinsList.push(ust);

    console.log("Minor coin (UST) is set. [RIP]");
}

let reth: IERC20Metadata;
async function setupRethMinorCoin() {
    const rethPool = "0x1E19CF2D73a72Ef1332C882F20534B6519Be0276";
    const balancerAddress = "0xBA12222222228d8Ba445958a75a0704d566BF2C8";

    reth = await ethers.getContractAt("IERC20Metadata", "0xae78736Cd615f374D3085123A210448E74Fc6393")

    const rethEdge = { swapProtocol: 7, pool: rethPool, fromCoin: reth.address, toCoin: weth.address };

    const BalancerAdapter = await ethers.getContractFactory("BalancerAdapter");
    const balancerAdapter = await BalancerAdapter.deploy();
    await exchange.registerAdapters([balancerAdapter.address], [7]);

    await exchange.createMinorCoinEdge([rethEdge]);
    await exchange.createApproval(
        [reth.address, weth.address],
        [balancerAddress, balancerAddress]
    );

    customAmounts[reth.address] = parseUnits("0.1", await reth.decimals());
    supportedCoinsList.push(reth);

    console.log("Minor coin (rETH) is set.");
}

let ldo: IERC20Metadata,
    spell: IERC20Metadata,
    angle: IERC20Metadata;
async function setupAngleSpellLdoMinorCoins() {
    const angleWethPair = "0xFb55AF0ef0DcdeC92Bd3752E7a9237dfEfB8AcC0"
    const spellWethPair = "0xb5De0C3753b6E1B4dBA616Db82767F17513E6d4E"
    const ldoWethPair = "0xC558F600B34A5f69dD2f0D06Cb8A88d829B7420a"

    ldo = await ethers.getContractAt("IERC20Metadata", "0x5A98FcBEA516Cf06857215779Fd812CA3beF1B32");
    angle = await ethers.getContractAt("IERC20Metadata", "0x31429d1856aD1377A8A0079410B297e1a9e214c2");
    spell = await ethers.getContractAt("IERC20Metadata", "0x090185f2135308BaD17527004364eBcC2D37e5F6");

    const angleEdge = { swapProtocol: 8, pool: angleWethPair, fromCoin: angle.address, toCoin: weth.address };
    const spellEdge = { swapProtocol: 8, pool: spellWethPair, fromCoin: spell.address, toCoin: weth.address };
    const ldoEdge = { swapProtocol: 8, pool: ldoWethPair, fromCoin: ldo.address, toCoin: weth.address };

    const SushiSwapAdapter = await ethers.getContractFactory("SushiswapAdapter")
    const sushiAdapter = await SushiSwapAdapter.deploy();
    await exchange.registerAdapters([sushiAdapter.address], [8]);

    await exchange.createMinorCoinEdge([angleEdge, spellEdge, ldoEdge]);

    customAmounts[spell.address] = parseUnits("1000", await spell.decimals());
    supportedCoinsList.push(angle, spell, ldo);

    console.log("Minor coins (ANGLE, SPELL, LDO) are set.");
}

let fraxUsdc: IERC20Metadata;
async function setupFraxUsdcLpMinorCoin() {
    const fraxUSDCPool = "0xDcEF968d416a41Cdac0ED8702fAC8128A64241A2"

    fraxUsdc = await ethers.getContractAt("IERC20Metadata", "0x3175Df0976dFA876431C2E9eE6Bc45b65d3473CC")

    const fraxUsdcEdge = { swapProtocol: 9, pool: fraxUSDCPool, fromCoin: fraxUsdc.address, toCoin: usdc.address };

    const FraxUsdcAdapter = await ethers.getContractFactory("CurveFraxUsdcAdapter");
    const fraxUsdcAdapter = await FraxUsdcAdapter.deploy();
    await exchange.registerAdapters([fraxUsdcAdapter.address], [9]);

    await exchange.createMinorCoinEdge([fraxUsdcEdge]);

    supportedCoinsList.push(fraxUsdc);

    console.log("Minor coin (crvFRAX) is set.");
}

let stEthEth: IERC20Metadata;
async function setupStEthLpMinorCoin() {
    const stEthEthPool = "0xDC24316b9AE028F1497c275EB9192a3Ea0f67022"

    stEthEth = await ethers.getContractAt("IERC20Metadata", "0x06325440D014e39736583c165C2963BA99fAf14E")

    const stEthEdge = { swapProtocol: 10, pool: stEthEthPool, fromCoin: stEthEth.address, toCoin: weth.address };

    const StEthAdapter = await ethers.getContractFactory("CurveStEthAdapter");
    const stEthAdapter = await StEthAdapter.deploy();

    await exchange.registerAdapters([stEthAdapter.address], [10]);
    await exchange.createMinorCoinEdge([stEthEdge]);

    customAmounts[stEthEth.address] = parseUnits("0.1", await stEthEth.decimals());

    supportedCoinsList.push(stEthEth);

    console.log("Minor coin (steCRV) is set.");
}

let eurs: IERC20Metadata,
    ageur: IERC20Metadata,
    eurt: IERC20Metadata;
async function setupEurosMinorCoins() {
    const eursUsdcPool = "0x98a7F18d4E56Cfe84E3D081B40001B3d5bD3eB8B";
    const eurPool = "0xb9446c4Ef5EBE66268dA6700D26f96273DE3d571";

    eurs = await ethers.getContractAt("IERC20Metadata", "0xdB25f211AB05b1c97D595516F45794528a807ad8");
    ageur = await ethers.getContractAt("IERC20Metadata", "0x1a7e4e63778B4f12a199C062f3eFdD288afCBce8");
    eurt = await ethers.getContractAt("IERC20Metadata", "0xC581b735A1688071A1746c968e0798D642EDE491");

    const eursUsdcEdge = { swapProtocol: 11, pool: eursUsdcPool, fromCoin: eurs.address, toCoin: usdc.address };
    const ageurUsdcEdge = { swapProtocol: 12, pool: eurPool, fromCoin: ageur.address, toCoin: usdc.address };
    const eurtUsdcEdge = { swapProtocol: 12, pool: eurPool, fromCoin: eurt.address, toCoin: usdc.address };

    const EursUsdcAdapter = await ethers.getContractFactory("CurveEURSUSDAdapter");
    const EurAdapter = await ethers.getContractFactory("CurveEURAdapter");
    const eursUsdcAdapter = await EursUsdcAdapter.deploy();
    const eurAdapter = await EurAdapter.deploy();

    await exchange.createApproval(
        [eurs.address],
        [eurPool]
    )
    await exchange.registerAdapters([eursUsdcAdapter.address, eurAdapter.address], [11, 12])
    await exchange.createMinorCoinEdge([eursUsdcEdge, ageurUsdcEdge, eurtUsdcEdge]);

    supportedCoinsList.push(eurs, ageur, eurt);

    console.log("Minor coins (EURS, agEUR, EURT) are set.");
}

let cvxEth: IERC20Metadata;
async function setupCvxEthLpMinorCoin() {
    const cvxEthPool = "0xB576491F1E6e5E62f1d8F26062Ee822B40B0E0d4"

    cvxEth = await ethers.getContractAt("IERC20Metadata", "0x3A283D9c08E8b55966afb64C515f5143cf907611");

    const cvxEthEdge = { swapProtocol: 13, pool: cvxEthPool, fromCoin: cvxEth.address, toCoin: weth.address }

    const CvxEthAdapter = await ethers.getContractFactory("CurveCvxEthAdapter");
    const cvxEthAdapter = await (await CvxEthAdapter.deploy()).deployed();

    await exchange.registerAdapters([cvxEthAdapter.address], [13]);
    await exchange.createMinorCoinEdge([cvxEthEdge]);

    supportedCoinsList.push(cvxEth);

    console.log("Minor coin (crvCVXETH) is set.");
}

let wbtc: IERC20Metadata;
async function setupWbtcMinorCoin() {
    const pool = "0xD51a44d3FaE010294C616388b506AcdA1bfAAE46";
    wbtc = await ethers.getContractAt("IERC20Metadata", "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599");

    const wbtcEdge = { swapProtocol: 2, pool: pool, fromCoin: wbtc.address, toCoin: weth.address };

    customAmounts[wbtc.address] = parseUnits("0.001", await wbtc.decimals());

    await exchange.createMinorCoinEdge([wbtcEdge]);

    supportedCoinsList.push(wbtc);

    console.log("Minor coin (WBTC) is set.");
}

let alluo: IERC20Metadata;
async function setupAlluoUniswapMinorCoin() {
    // we've had used Balancer before, but as of proposal
    // https://vote.alluo.com/#/proposal/0x73c59ea443951e62b7eba5b8a6d9ae5a64a9819a5f1990ce9e635679ba9011a2
    // liquidity was moved to UniswapV3 and ALLUO is now traded on Uniswap

    // instead of passing liquidity pool, UniswapV3Adapter receives fee data.
    // we encode fee tier in pool address for exchange and then UniswapV3 using
    // pool token addresses and fee tier finds pool by itself
    const encodedFeeData = "0x0000000000000000000000000000000000000bb8"; // fee tier 3000 (0.3%)
    const swapRouter = "0xE592427A0AEce92De3Edee1F18E0157C05861564";

    alluo = await ethers.getContractAt("IERC20Metadata", "0x1E5193ccC53f25638Aa22a940af899B692e10B09");

    const alluoEdge = { swapProtocol: 14, pool: encodedFeeData, fromCoin: alluo.address, toCoin: weth.address };

    const uniV3AdapterFactory = await ethers.getContractFactory("UniswapV3Adapter");
    const uniV3Adapter = await uniV3AdapterFactory.deploy();

    await exchange.createApproval([alluo.address, weth.address], [swapRouter, swapRouter]);
    await exchange.registerAdapters([uniV3Adapter.address], [14]);
    await exchange.createMinorCoinEdge([alluoEdge]);

    supportedCoinsList.push(alluo);

    console.log("Minor coin (ALLUO 🚀) is set.");
}

let fxs: IERC20Metadata;
async function setupFxsMinorCoin() {
    const fxsPool = "0xE1573B9D29e2183B1AF0e743Dc2754979A40D237";
    fxs = await ethers.getContractAt("IERC20Metadata", "0x3432B6A60D23Ca0dFCa7761B7ab56459D9C964D0");

    const fxsEdge = { swapProtocol: 8, pool: fxsPool, fromCoin: fxs.address, toCoin: frax.address };

    await exchange.createMinorCoinEdge([fxsEdge]);

    supportedCoinsList.push(fxs);

    console.log("Minor coin (FXS) is set.");
}

async function setupUsdcWethMajorRouteShortcut() {
    const encodedFeeData = "0x00000000000000000000000000000000000001F4";
    const swapRouter = "0xE592427A0AEce92De3Edee1F18E0157C05861564";

    const wethUsdcRoute = { swapProtocol: 14, pool: encodedFeeData, fromCoin: weth.address, toCoin: usdc.address };
    const usdcWethRoute = { swapProtocol: 14, pool: encodedFeeData, fromCoin: usdc.address, toCoin: weth.address };

    await exchange.createInternalMajorRoutes([[wethUsdcRoute], [usdcWethRoute]]);
    await exchange.createApproval(
        [usdc.address],
        [swapRouter]
    );

    console.log("USDC-WETH shortcut added");
}

let fraxBP: IERC20Metadata;
async function setupFraxDolaLpMinorCoin() {
    const pool = "0x08780fb7E580e492c1935bEe4fA5920b94AA95Da";
    fraxBP = await ethers.getContractAt("IERC20Metadata", "0xe57180685e3348589e9521aa53af0bcd497e884d");

    const edge = { swapProtocol: 15, pool: pool, fromCoin: fraxBP.address, toCoin: usdc.address }

    const DolaFraxAdapter = await ethers.getContractFactory("CurveFraxDolaAdapter");
    const adapter = await DolaFraxAdapter.deploy();

    await exchange.registerAdapters([adapter.address], [15]);
    await exchange.createMinorCoinEdge([edge]);

    supportedCoinsList.push(fraxBP);

    console.log("Minor coin (DOLAFRAXBP3CRV-f) is set.");
}

let ycrvLp: IERC20Metadata;
async function setupYCrvLpMinorCoin() {
    const pool = "0x8301AE4fc9c624d1D396cbDAa1ed877821D7C511"

    ycrvLp = await ethers.getContractAt("IERC20Metadata", "0x453d92c7d4263201c69aacfaf589ed14202d83a4");

    const edge = { swapProtocol: 16, pool: pool, fromCoin: ycrvLp.address, toCoin: weth.address }

    const YCrvAdapter = await ethers.getContractFactory("CurveYCrvAdapter");
    const adapter = await YCrvAdapter.deploy();

    await exchange.registerAdapters([adapter.address], [16]);
    await exchange.createMinorCoinEdge([edge]);
    await exchange.createApproval(
        [crv.address],
        [ycrvLp.address]
    );

    supportedCoinsList.push(ycrvLp);

    console.log("Minor coin (yCRV-f) is set.");
}

let frxEthLp: IERC20Metadata;
let cvxCrvFraxLP: IERC20Metadata;
async function setupCurveLpMinorCoins() {

    const frxEthPool = "0xa1f8a6807c402e4a15ef4eba36528a3fed24e577";
    const cvxCrvFraxMetaPool = "0x5De4EF4879F4fe3bBADF2227D2aC5d0E2D76C895";

    frxEthLp = await ethers.getContractAt("IERC20Metadata", "0xf43211935c781d5ca1a41d2041f397b8a7366c7a");
    cvxCrvFraxLP = await ethers.getContractAt("IERC20Metadata", "0x527331f3f550f6f85acfecab9cc0889180c6f1d5");


    const edge1: Edge = { swapProtocol: 17, pool: frxEthPool, fromCoin: frxEthLp.address, toCoin: weth.address };
    const edge2: Edge = { swapProtocol: 18, pool: cvxCrvFraxMetaPool, fromCoin: cvxCrvFraxLP.address, toCoin: usdc.address };

    const CurveFrxEthAdapter = await ethers.getContractFactory("CurveFrxEthAdapter");
    const CvxCrvFraxAdapter = await ethers.getContractFactory("CurvecvxCrvFraxAdapter");

    const frxEthAdapter = await CurveFrxEthAdapter.deploy();
    const cvxCrvFraxAdapter = await CvxCrvFraxAdapter.deploy();

    await exchange.registerAdapters([frxEthAdapter.address, cvxCrvFraxAdapter.address], [17, 18]);
    await exchange.createMinorCoinEdge([edge1, edge2]);

    customAmounts[frxEthLp.address] = parseUnits("0.1", await frxEthLp.decimals());

    supportedCoinsList.push(frxEthLp, cvxCrvFraxLP);
    supportedCoinsList.push(cvxCrvFraxLP);

    console.log("Minor coins (frxEthLp, cvxCrvFraxLP) is set.")

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

describe("Exchange (full setup operations)", async () => {
    before(async () => {
        await network.provider.request({
            method: "hardhat_reset",
            params: [{
                forking: {
                    enabled: true,
                    jsonRpcUrl: process.env.MAINNET_FORKING_URL as string,
                },
            },],
        });
        console.log("\nForking Ethereum Mainnet from latest block. This test may take some time.")

        signers = await ethers.getSigners();
    });

    beforeEach(async () => {
        const Exchange = await ethers.getContractFactory("Exchange");
        exchange = await Exchange.deploy(
            "0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE",
            true
        );
        console.log("Clean Exchange contract deployed, setting up routes...\n");
        // adaprter creations:
        await setupMajorCoins();              // adapter ids: 1, 2
        await setup3CrvMinorCoin();           // adapter ids: 3
        await setupCvxCrvMinorCoins();        // adapter ids: 4, 5
        await setupUstMinorCoin();            // adapter ids: 6
        await setupRethMinorCoin();           // adapter ids: 7      (Balancer)
        await setupAngleSpellLdoMinorCoins(); // adapter ids: 8      (UniswapV2)
        await setupFraxUsdcLpMinorCoin();     // adapter ids: 9
        await setupStEthLpMinorCoin();        // adapter ids: 10
        await setupEurosMinorCoins();         // adapter ids: 11, 12
        await setupCvxEthLpMinorCoin();       // adapter ids: 13
        await setupWbtcMinorCoin();
        await setupAlluoUniswapMinorCoin();   // adapter ids: 14     (UniswapV3)
        await setupFxsMinorCoin();

        // as UniswapV3 adapter was added, and USDC-WETH pool on UniswapV3 has
        // significant amount of liquidity, we decided to make internal USDC-WETH
        // major route to though that pool directly, instead of making 2 step exchange
        // USDC-USDT-WETH. This shortcut saves a lot of gas on all exchanges that
        // require USDC-WETH major route 
        await setupUsdcWethMajorRouteShortcut();

        await setupFraxDolaLpMinorCoin();     // adapter ids: 15
        await setupYCrvLpMinorCoin();         // adapter ids: 16
        await setupCurveLpMinorCoins();       // adapter ids: 17, 18
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
            const ethToCoinAmount = parseEther("20.0");
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
                    parseUnits("1", await coinIn.decimals()) :
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