import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { BigNumberish } from "ethers";
import { formatEther, formatUnits, parseEther, parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { Exchange, IERC20Metadata, IWrappedEther, SushiswapAdapter, SushiswapAdapter__factory } from "../typechain";

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
        threeCrvLp: IERC20Metadata, crv3CryptoLp: IERC20Metadata, ust: IERC20Metadata,
        alluo: IERC20Metadata, reth: IERC20Metadata, ldo : IERC20Metadata, spell : IERC20Metadata, angle : IERC20Metadata;

    let wethUsdtRoute: Route, wethUsdcRoute: Route, wethDaiRoute: Route, usdtWethRoute: Route, usdtUsdcRoute: Route, usdtDaiRoute: Route,
        usdcWethRoute: Route, usdcUsdtRoute: Route, usdcDaiRoute: Route, daiUsdcRoute: Route, daiUsdtRoute: Route, daiWethRoute: Route,
        wethFraxRoute: Route, usdtFraxRoute: Route, daiFraxRoute: Route, usdcFraxRoute: Route, fraxUsdcRoute: Route, fraxDaiRoute: Route,
        fraxUsdtRoute: Route, fraxWethRoute: Route , ldoWethRoute: Route,  spellWethRoute: Route, angleWethRoute : Route, wethLdoRoute: Route,  wethSpellRoute: Route, wethAngleRoute : Route;

    let threeCrvEdge: Edge, cvxEdge: Edge, crvEdge: Edge, ustEdge: Edge, alluoEdge: Edge, rethEdge: Edge, angleEdge :Edge, ldoEdge : Edge, spellEdge: Edge;

    let spellWhale : SignerWithAddress, ldoWhale : SignerWithAddress, angleWhale: SignerWithAddress
    const renbtcAddress = "0xD51a44d3FaE010294C616388b506AcdA1bfAAE46";
    const fraxPoolAddress = "0xd632f22692FaC7611d2AA1C0D552930D43CAEd3B";
    const threeCrvPool = "0xbEbc44782C7dB0a1A60Cb6fe97d0b483032FF1C7";
    const cvxCurvePool = "0xB576491F1E6e5E62f1d8F26062Ee822B40B0E0d4";
    const crvCurvePool = "0x8301AE4fc9c624d1D396cbDAa1ed877821D7C511";
    const ustCurveAddress = "0x890f4e345B1dAED0367A877a1612f86A1f86985f";
    const uint256MaxValue = "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff";
    const nativeEth = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";
    const zeroAddr = "0x0000000000000000000000000000000000000000";

    const alluoPool = "0x85Be1e46283f5f438D1f864c2d925506571d544f";
    const rethPool = "0x1E19CF2D73a72Ef1332C882F20534B6519Be0276";


    const ldoWethPair = "0xC558F600B34A5f69dD2f0D06Cb8A88d829B7420a"
    const spellWethPair = "0xb5De0C3753b6E1B4dBA616Db82767F17513E6d4E"
    const angleWethPair = "0xFb55AF0ef0DcdeC92Bd3752E7a9237dfEfB8AcC0"

    const spellWhaleAddress = "0x2ee555c9006a9dc4674f01e0d4dfc58e013708f0";
    const ldoWhaleAddress = "0x0f89d54b02ca570de82f770d33c7b7cf7b3c3394";
    const angleWhaleAddress = "0x2fc443960971e53fd6223806f0114d5faa8c7c4e";

    async function getImpersonatedSigner(address: string): Promise<SignerWithAddress> {
        await ethers.provider.send(
            'hardhat_impersonateAccount',
            [address]
        );

        return await ethers.getSigner(address);
    }

    function initializeRoutes() {
        ldoWethRoute = [
            { swapProtocol: 10, pool: ldoWethPair, fromCoin: ldo.address, toCoin: weth.address }
        ];
        angleWethRoute = [
            { swapProtocol: 10, pool: angleWethPair, fromCoin: angle.address, toCoin: weth.address}
        ];
        spellWethRoute = [
            { swapProtocol: 10, pool: spellWethPair, fromCoin: spell.address, toCoin: weth.address }
        ];
        wethLdoRoute = [
            { swapProtocol: 10, pool: ldoWethPair, fromCoin: weth.address, toCoin: ldo.address }
        ];
        wethAngleRoute = [
            { swapProtocol: 10, pool: angleWethPair, fromCoin: weth.address, toCoin: angle.address}
        ];
        wethSpellRoute = [
            { swapProtocol: 10, pool: spellWethPair, fromCoin: weth.address, toCoin: spell.address }
        ];

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
        alluoEdge = { swapProtocol: 7, pool: alluoPool, fromCoin: alluo.address, toCoin: weth.address };
        rethEdge = { swapProtocol: 7, pool: rethPool, fromCoin: reth.address, toCoin: weth.address };

        spellEdge = { swapProtocol: 10, pool: spellWethPair, fromCoin: spell.address, toCoin: weth.address };
        ldoEdge = { swapProtocol: 10, pool: ldoWethPair, fromCoin: ldo.address, toCoin: weth.address };
        angleEdge = { swapProtocol: 10, pool: angleWethPair, fromCoin: angle.address, toCoin: weth.address };

    }

    async function executeSetup() {
        const Exchange = await ethers.getContractFactory("Exchange");

        exchange = await Exchange.deploy(dai.address, true);
        await exchange.deployed();

        spellWhale = await getImpersonatedSigner(spellWhaleAddress);
        ldoWhale = await getImpersonatedSigner(ldoWhaleAddress);
        angleWhale = await getImpersonatedSigner(angleWhaleAddress);

        const routes: Route[] = [
            wethUsdtRoute, wethUsdcRoute, wethDaiRoute, usdtWethRoute, usdtUsdcRoute, usdtDaiRoute,
            usdcWethRoute, usdcUsdtRoute, usdcDaiRoute, daiUsdcRoute, daiUsdtRoute, daiWethRoute,
            wethFraxRoute, usdtFraxRoute, daiFraxRoute, usdcFraxRoute, fraxUsdcRoute, fraxDaiRoute,
            fraxUsdtRoute, fraxWethRoute, //wethAngleRoute, wethSpellRoute, wethLdoRoute, angleWethRoute, spellWethRoute, ldoWethRoute
        ];

        await (await exchange.createInternalMajorRoutes(routes)).wait();

        const ThreeCrypto = await ethers.getContractFactory("Curve3CryptoAdapter");
        const Frax = await ethers.getContractFactory("CurveFraxAdapter");
        const ThreeCrvSwap = await ethers.getContractFactory("Curve3CrvSwapAdapter");
        const CvxAdapter = await ethers.getContractFactory("CurveCvxAdapter");
        const CrvAdapter = await ethers.getContractFactory("CurveCrvAdapter");
        const SushiSwapAdapter : SushiswapAdapter__factory = await ethers.getContractFactory("SushiswapAdapter")
        
        const sushiAdapter : SushiswapAdapter = await (await SushiSwapAdapter.deploy()).deployed();
        const threeCrypto = await (await ThreeCrypto.deploy()).deployed();
        const fraxAdapter = await (await Frax.deploy()).deployed();
        const threeCrvAdapter = await (await ThreeCrvSwap.deploy()).deployed();
        const cvxAdapter = await (await CvxAdapter.deploy()).deployed();
        const crvAdapter = await (await CrvAdapter.deploy()).deployed();

        await (await exchange.registerAdapters([fraxAdapter.address, threeCrypto.address], [1, 2])).wait();

        await (await exchange.createLpToken([{ swapProtocol: 1, pool: fraxPoolAddress }, { swapProtocol: 2, pool: renbtcAddress }],
            [fraxPoolAddress, crv3CryptoLp.address],
            [[threeCrvLp.address, frax.address, fraxPoolAddress], [usdt.address, weth.address]])).wait();

        // Weth approval is given later so no need there.
        await exchange.createApproval([dai.address, usdc.address, usdt.address, spell.address, ldo.address, angle.address],
            ["0xbEbc44782C7dB0a1A60Cb6fe97d0b483032FF1C7",
                "0xbEbc44782C7dB0a1A60Cb6fe97d0b483032FF1C7",
                "0xbEbc44782C7dB0a1A60Cb6fe97d0b483032FF1C7", "0xbEbc44782C7dB0a1A60Cb6fe97d0b483032FF1C7",  "0xbEbc44782C7dB0a1A60Cb6fe97d0b483032FF1C7",  "0xbEbc44782C7dB0a1A60Cb6fe97d0b483032FF1C7"]);

        await (await exchange.registerAdapters([threeCrvAdapter.address], [3])).wait();
        await (await exchange.registerAdapters([cvxAdapter.address], [4])).wait();
        await (await exchange.registerAdapters([crvAdapter.address], [5])).wait();
        
        await (await exchange.registerAdapters([sushiAdapter.address], [10])).wait();

        await (await exchange.createMinorCoinEdge([threeCrvEdge])).wait();
        await (await exchange.createMinorCoinEdge([cvxEdge])).wait();
        await (await exchange.createMinorCoinEdge([crvEdge])).wait();
        await (await exchange.createMinorCoinEdge([spellEdge])).wait();
        await (await exchange.createMinorCoinEdge([angleEdge])).wait();
        await (await exchange.createMinorCoinEdge([ldoEdge])).wait();

        // phase 3 - add of UST coin

        const UstAdapter = await ethers.getContractFactory("CurveUstAdapter");
        const ustAdapter = await (await UstAdapter.deploy()).deployed();

        await (await exchange.registerAdapters([ustAdapter.address], [6])).wait();
        await (await exchange.createMinorCoinEdge([ustEdge])).wait();

        // phase 4 - add of Balancer adapter & ALLUO route
        const BalancerAdapter = await ethers.getContractFactory("BalancerAdapter");
        const balancerAdapter = await (await BalancerAdapter.deploy()).deployed();
        await exchange.createApproval([weth.address, alluo.address],
            ["0xBA12222222228d8Ba445958a75a0704d566BF2C8",
                "0xBA12222222228d8Ba445958a75a0704d566BF2C8",
            ])

        await (await exchange.registerAdapters([balancerAdapter.address], [7])).wait();
        await (await exchange.createMinorCoinEdge([alluoEdge])).wait();

        await exchange.createLpToken(
            [{ swapProtocol: 7, pool: alluoPool }],
            [alluoPool],
            [[weth.address, alluo.address]]
        );

        // phase 5 - using existing adaptor for rETH exchange
        await (await exchange.createMinorCoinEdge([rethEdge])).wait();
        await exchange.createApproval([reth.address],
            ["0xBA12222222228d8Ba445958a75a0704d566BF2C8"]);

        // add more liquidity in ALLUO-ETH pool
        const investor = await getImpersonatedSigner("0xaa7c65cd4b52844412533e2c2c3e36402781d69f");
        const forcer = await (await ethers.getContractFactory("ForceSender")).deploy({ value: parseEther("5.0") });
        await forcer.forceSend(investor.address);

        const etherAmount = parseEther("72.9927");
        await weth.deposit({ value: etherAmount });
        await weth.approve(exchange.address, etherAmount);

        const alluoAmount = parseUnits("2999910.0", await alluo.decimals());
        await alluo.connect(investor).approve(exchange.address, alluoAmount);

        await exchange.exchange(weth.address, alluoPool, etherAmount, 0);
        await exchange.connect(investor).exchange(alluo.address, alluoPool, alluoAmount, 0);
    }

    before(async () => {
        // const investorAddress = process.env.IMPERSONATE_ADDRESS as string;

        // await ethers.provider.send(
        //     'hardhat_impersonateAccount',
        //     [investorAddress]
        // );

        signers = await ethers.getSigners();

        weth = await ethers.getContractAt("IWrappedEther", "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2");
        reth = await ethers.getContractAt("IERC20Metadata", "0xae78736Cd615f374D3085123A210448E74Fc6393")
        usdt = await ethers.getContractAt("IERC20Metadata", "0xdAC17F958D2ee523a2206206994597C13D831ec7");
        usdc = await ethers.getContractAt("IERC20Metadata", "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48");
        dai = await ethers.getContractAt("IERC20Metadata", "0x6B175474E89094C44Da98b954EedeAC495271d0F");
        ust = await ethers.getContractAt("IERC20Metadata", "0xa47c8bf37f92aBed4A126BDA807A7b7498661acD");
        cvx = await ethers.getContractAt("IERC20Metadata", "0x4e3FBD56CD56c3e72c1403e103b45Db9da5B9D2B");
        crv = await ethers.getContractAt("IERC20Metadata", "0xD533a949740bb3306d119CC777fa900bA034cd52");
        alluo = await ethers.getContractAt("IERC20Metadata", "0x1E5193ccC53f25638Aa22a940af899B692e10B09");
        frax = await ethers.getContractAt("IERC20Metadata", "0x853d955aCEf822Db058eb8505911ED77F175b99e");
        threeCrvLp = await ethers.getContractAt("IERC20Metadata", "0x6c3F90f043a72FA612cbac8115EE7e52BDe6E490");
        crv3CryptoLp = await ethers.getContractAt("IERC20Metadata", "0xc4AD29ba4B3c580e6D59105FFf484999997675Ff");


        ldo = await ethers.getContractAt("IERC20Metadata", "0x5A98FcBEA516Cf06857215779Fd812CA3beF1B32");
        angle = await ethers.getContractAt("IERC20Metadata", "0x31429d1856aD1377A8A0079410B297e1a9e214c2");
        spell = await ethers.getContractAt("IERC20Metadata", "0x090185f2135308BaD17527004364eBcC2D37e5F6");
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
        const supportedCoinList = [dai, usdc, usdt, frax, threeCrvLp, ust, crv, cvx, alluo, reth, weth, ldo, spell, angle];

        await weth.deposit({ value: parseEther("100.0") });

        // get all supported coins - swap ETH for all coins
        for (let i = 0; i < supportedCoinList.length; i++) {
            const coin = supportedCoinList[i];
            if (coin.address == weth.address) continue;
            const ethToCoinAmount = parseEther("10.0");
            await testSwap(nativeEth, coin.address, ethToCoinAmount);
        }

        // swap all combinations of all tokens
        for (let i = 0; i < supportedCoinList.length; i++) {
            for (let j = 0; j < supportedCoinList.length; j++) {
                if (i == j) continue;

                const coinIn = supportedCoinList[i];
                const coinOut = supportedCoinList[j];
                const oneToken = parseUnits("0.1", await coinIn.decimals());
                await testSwap(coinIn.address, coinOut.address, oneToken);
            }
        }

        // swap rest of all coins to eth
        for (let i = 0; i < supportedCoinList.length; i++) {
            const coin = supportedCoinList[i];
            if (coin.address == weth.address) continue;
            const amount = await coin.balanceOf(signers[0].address);
            await testSwap(coin.address, nativeEth, amount);
        }
    });

});