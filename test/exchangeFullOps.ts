import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { BigNumberish } from "ethers";
import { formatEther, formatUnits, parseEther, parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { Exchange, IERC20Metadata, IWrappedEther } from "../typechain";

describe("Exchange (full setup operations)", async () => {
    type Edge = {
        swapProtocol: BigNumberish;
        pool: string;
        fromCoin: string;
        toCoin: string;
    };
    type Route = Edge[];

    let signers: SignerWithAddress[];
    let exchange: Exchange, weth: IWrappedEther, usdt: IERC20Metadata, usdc: IERC20Metadata,
        dai: IERC20Metadata, cvx: IERC20Metadata, crv: IERC20Metadata, frax: IERC20Metadata,
        threeCrvLp: IERC20Metadata, crv3CryptoLp: IERC20Metadata, ust: IERC20Metadata;

    let wethUsdtRoute: Route, wethUsdcRoute: Route, wethDaiRoute: Route, usdtWethRoute: Route, usdtUsdcRoute: Route, usdtDaiRoute: Route,
        usdcWethRoute: Route, usdcUsdtRoute: Route, usdcDaiRoute: Route, daiUsdcRoute: Route, daiUsdtRoute: Route, daiWethRoute: Route,
        wethFraxRoute: Route, usdtFraxRoute: Route, daiFraxRoute: Route, usdcFraxRoute: Route, fraxUsdcRoute: Route, fraxDaiRoute: Route,
        fraxUsdtRoute: Route, fraxWethRoute: Route;

    let threeCrvEdge: Edge, cvxEdge: Edge, crvEdge: Edge, ustEdge: Edge;

    const renbtcAddress = "0xD51a44d3FaE010294C616388b506AcdA1bfAAE46";
    const fraxPoolAddress = "0xd632f22692FaC7611d2AA1C0D552930D43CAEd3B";
    const threeCrvPool = "0xbEbc44782C7dB0a1A60Cb6fe97d0b483032FF1C7";
    const cvxCurvePool = "0xB576491F1E6e5E62f1d8F26062Ee822B40B0E0d4";
    const crvCurvePool = "0x8301AE4fc9c624d1D396cbDAa1ed877821D7C511";
    const ustCurveAddress = "0x890f4e345B1dAED0367A877a1612f86A1f86985f";
    const uint256MaxValue = "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff";
    const nativeEth = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";
    const zeroAddr = "0x0000000000000000000000000000000000000000";


    function initializeRoutes() {
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

        threeCrvEdge = { swapProtocol: 3, pool: threeCrvPool, fromCoin: threeCrvLp.address, toCoin: usdc.address };
        cvxEdge = { swapProtocol: 4, pool: cvxCurvePool, fromCoin: cvx.address, toCoin: weth.address };
        crvEdge = { swapProtocol: 5, pool: crvCurvePool, fromCoin: crv.address, toCoin: weth.address };
        ustEdge = { swapProtocol: 6, pool: ustCurveAddress, fromCoin: ust.address, toCoin: usdt.address };
    }

    async function executeSetup() {
        const Exchange = await ethers.getContractFactory("Exchange");

        exchange = await Exchange.deploy(dai.address, true);
        await exchange.deployed();

        const routes: Route[] = [
            wethUsdtRoute, wethUsdcRoute, wethDaiRoute, usdtWethRoute, usdtUsdcRoute, usdtDaiRoute,
            usdcWethRoute, usdcUsdtRoute, usdcDaiRoute, daiUsdcRoute, daiUsdtRoute, daiWethRoute,
            wethFraxRoute, usdtFraxRoute, daiFraxRoute, usdcFraxRoute, fraxUsdcRoute, fraxDaiRoute,
            fraxUsdtRoute, fraxWethRoute
        ];

        await (await exchange.createInternalMajorRoutes(routes)).wait();

        const ThreeCrypto = await ethers.getContractFactory("Curve3CryptoAdapter");
        const Frax = await ethers.getContractFactory("CurveFraxAdapter");
        const ThreeCrvSwap = await ethers.getContractFactory("Curve3CrvSwapAdapter");
        const CvxAdapter = await ethers.getContractFactory("CurveCvxAdapter");
        const CrvAdapter = await ethers.getContractFactory("CurveCrvAdapter");

        const threeCrypto = await (await ThreeCrypto.deploy()).deployed();
        const fraxAdapter = await (await Frax.deploy()).deployed();
        const threeCrvAdapter = await (await ThreeCrvSwap.deploy()).deployed();
        const cvxAdapter = await (await CvxAdapter.deploy()).deployed();
        const crvAdapter = await (await CrvAdapter.deploy()).deployed();

        await (await exchange.registerAdapters([fraxAdapter.address, threeCrypto.address], [1, 2])).wait();

        await (await exchange.createLpToken([{ swapProtocol: 1, pool: fraxPoolAddress }, { swapProtocol: 2, pool: renbtcAddress }],
            [fraxPoolAddress, crv3CryptoLp.address],
            [[threeCrvLp.address, frax.address, fraxPoolAddress], [usdt.address, weth.address]])).wait();

        await exchange.createApproval([dai.address, usdc.address, usdt.address],
            ["0xbEbc44782C7dB0a1A60Cb6fe97d0b483032FF1C7",
                "0xbEbc44782C7dB0a1A60Cb6fe97d0b483032FF1C7",
                "0xbEbc44782C7dB0a1A60Cb6fe97d0b483032FF1C7"]);

        await (await exchange.registerAdapters([threeCrvAdapter.address], [3])).wait();
        await (await exchange.registerAdapters([cvxAdapter.address], [4])).wait();
        await (await exchange.registerAdapters([crvAdapter.address], [5])).wait();

        await (await exchange.createMinorCoinEdge([threeCrvEdge])).wait();
        await (await exchange.createMinorCoinEdge([cvxEdge])).wait();
        await (await exchange.createMinorCoinEdge([crvEdge])).wait();

        // phase 3 - add of UST coin

        const UstAdapter = await ethers.getContractFactory("CurveUstAdapter");
        const ustAdapter = await (await UstAdapter.deploy()).deployed();

        await (await exchange.registerAdapters([ustAdapter.address], [6])).wait();
        await (await exchange.createMinorCoinEdge([ustEdge])).wait();
    }

    before(async () => {
        const investorAddress = process.env.IMPERSONATE_ADDRESS as string;

        await ethers.provider.send(
            'hardhat_impersonateAccount',
            [investorAddress]
        );

        signers = await ethers.getSigners();

        weth = await ethers.getContractAt("IWrappedEther", "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2");
        usdt = await ethers.getContractAt("IERC20Metadata", "0xdAC17F958D2ee523a2206206994597C13D831ec7");
        usdc = await ethers.getContractAt("IERC20Metadata", "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48");
        dai = await ethers.getContractAt("IERC20Metadata", "0x6B175474E89094C44Da98b954EedeAC495271d0F");
        ust = await ethers.getContractAt("IERC20Metadata", "0xa47c8bf37f92aBed4A126BDA807A7b7498661acD");
        cvx = await ethers.getContractAt("IERC20Metadata", "0x4e3FBD56CD56c3e72c1403e103b45Db9da5B9D2B");
        crv = await ethers.getContractAt("IERC20Metadata", "0xD533a949740bb3306d119CC777fa900bA034cd52");
        frax = await ethers.getContractAt("IERC20Metadata", "0x853d955aCEf822Db058eb8505911ED77F175b99e");
        threeCrvLp = await ethers.getContractAt("IERC20Metadata", "0x6c3F90f043a72FA612cbac8115EE7e52BDe6E490");
        crv3CryptoLp = await ethers.getContractAt("IERC20Metadata", "0xc4AD29ba4B3c580e6D59105FFf484999997675Ff");

        initializeRoutes();
    });

    beforeEach(async () => {
        await executeSetup();
    });

    async function testSwap(fromAddress: string, toAddress: string, amount: BigNumberish) {
        if (fromAddress == zeroAddr || fromAddress == nativeEth) {
            const to = await ethers.getContractAt("IERC20Metadata", toAddress);
            const balBefore = await to.balanceOf(signers[0].address);
            const tx = await (await exchange.exchange(nativeEth, to.address, amount, 0, { value: amount })).wait();
            console.log("Swapped", formatEther(amount),
                "ETH for", formatUnits((await to.balanceOf(signers[0].address)).sub(balBefore), await to.decimals()),
                await to.symbol() + ",", "gas used:", tx.cumulativeGasUsed.toString());
            return;
        }
        if (toAddress == zeroAddr || toAddress == nativeEth) {
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


    it("Should check all available swaps", async () => {


        const supportedCoinList = [dai, usdc, usdt, frax, threeCrvLp, ust, crv, cvx]

        // get all supported coins - swap ETH for all coins
        for (let i = 0; i < supportedCoinList.length; i++) {
            const coin = supportedCoinList[i];
            const ethToCoinAmount = parseEther("10.0");
            await testSwap(nativeEth, coin.address, ethToCoinAmount);
        }

        // swap all combinations of all tokens
        for (let i = 0; i < supportedCoinList.length; i++) {
            for (let j = 0; j < supportedCoinList.length; j++) {
                if (i == j) continue;

                const coinIn = supportedCoinList[i];
                const coinOut = supportedCoinList[j];
                const oneToken = parseUnits("1.0", await coinIn.decimals());
                await testSwap(coinIn.address, coinOut.address, oneToken);
            }
        }

        // swap rest of all coins to eth
        for (let i = 0; i < supportedCoinList.length; i++) {
            const coin = supportedCoinList[i];
            const amount = await coin.balanceOf(signers[0].address);
            await testSwap(coin.address, nativeEth, amount);
        }
    });
});