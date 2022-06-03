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
    let exchange: Exchange;
    let eurt: IERC20Metadata, dai: IERC20Metadata, usdc: IERC20Metadata,
        usdt: IERC20Metadata, weth: IWrappedEther, eurtLp: IERC20Metadata,
        alluo: IERC20Metadata, wMatic: IWrappedEther;

    let eurtwMaticRoute: Route, eurtDaiRoute: Route, eurtUsdcRoute: Route, eurtUsdtRoute: Route,
        daiwMaticRoute: Route, daiEurtRoute: Route, daiUsdcRoute: Route, daiUsdtRoute: Route,
        usdcwMaticRoute: Route, usdcEurtRoute: Route, usdcDaiRoute: Route, usdcUsdtRoute: Route,
        usdtwMaticRoute: Route, usdtEurtRoute: Route, usdtDaiRoute: Route, usdtUsdcRoute: Route,
        wMaticEurtRoute: Route, wMaticDaiRoute: Route, wMaticUsdtRoute: Route, wMaticUsdcRoute: Route;
    // let wethUsdcRoute: Route, wethDaiRoute: Route, usdtWethRoute: Route;

    let eurtEdge: Edge;

    const eurtPoolAddress = "0x225fb4176f0e20cdb66b4a3df70ca3063281e855";
    const uint256MaxValue = "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff";
    const nativeEth = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";
    const zeroAddr = "0x0000000000000000000000000000000000000000";

    // const alluoPool = "0x85Be1e46283f5f438D1f864c2d925506571d544f";

    async function getImpersonatedSigner(address: string): Promise<SignerWithAddress> {
        await ethers.provider.send(
            'hardhat_impersonateAccount',
            [address]
        );

        return await ethers.getSigner(address);
    }

    function initializeRoutes() {
        eurtwMaticRoute = [
            { swapProtocol: 2, pool: eurtPoolAddress, fromCoin: eurt.address, toCoin: wMatic.address }
        ];
        eurtDaiRoute = [
            { swapProtocol: 2, pool: eurtPoolAddress, fromCoin: eurt.address, toCoin: dai.address }
        ];
        eurtUsdcRoute = [
            { swapProtocol: 2, pool: eurtPoolAddress, fromCoin: eurt.address, toCoin: usdc.address }
        ];
        eurtUsdtRoute = [
            { swapProtocol: 2, pool: eurtPoolAddress, fromCoin: eurt.address, toCoin: usdt.address },
        ];
        daiwMaticRoute = [
            { swapProtocol: 2, pool: eurtPoolAddress, fromCoin: dai.address, toCoin: wMatic.address }
        ];
        daiEurtRoute = [
            // USDT - WETH
            { swapProtocol: 2, pool: eurtPoolAddress, fromCoin: dai.address, toCoin: eurt.address }
        ];
        daiUsdcRoute = [
            // USDT - WETH
            { swapProtocol: 2, pool: eurtPoolAddress, fromCoin: dai.address, toCoin: usdc.address }
        ];
        daiUsdtRoute = [
            // USDT - WETH
            { swapProtocol: 2, pool: eurtPoolAddress, fromCoin: dai.address, toCoin: usdt.address }
        ];
        usdcwMaticRoute = [
            // USDT - WETH
            { swapProtocol: 2, pool: eurtPoolAddress, fromCoin: usdc.address, toCoin: wMatic.address }
        ];
        usdcEurtRoute = [
            // USDT - WETH
            { swapProtocol: 2, pool: eurtPoolAddress, fromCoin: usdc.address, toCoin: eurt.address }
        ];
        usdcDaiRoute = [
            // USDT - WETH
            { swapProtocol: 2, pool: eurtPoolAddress, fromCoin: usdc.address, toCoin: dai.address }
        ];
        usdcUsdtRoute = [
            // USDT - WETH
            { swapProtocol: 2, pool: eurtPoolAddress, fromCoin: usdc.address, toCoin: usdt.address }
        ];
        usdtwMaticRoute = [
            // USDT - WETH
            { swapProtocol: 2, pool: eurtPoolAddress, fromCoin: usdt.address, toCoin: wMatic.address }
        ];
        usdtEurtRoute = [
            // USDT - WETH
            { swapProtocol: 2, pool: eurtPoolAddress, fromCoin: usdt.address, toCoin: eurt.address }
        ];
        usdtDaiRoute = [
            // USDT - WETH
            { swapProtocol: 2, pool: eurtPoolAddress, fromCoin: usdt.address, toCoin: dai.address }
        ];
        usdtUsdcRoute = [
            // USDT - WETH
            { swapProtocol: 2, pool: eurtPoolAddress, fromCoin: usdt.address, toCoin: usdc.address }
        ];

        wMaticEurtRoute = [
            // USDT - WETH
            { swapProtocol: 2, pool: eurtPoolAddress, fromCoin: wMatic.address, toCoin: eurt.address }
        ];
        wMaticDaiRoute = [
            // USDT - WETH
            { swapProtocol: 2, pool: eurtPoolAddress, fromCoin: wMatic.address, toCoin: dai.address }
        ];
        wMaticUsdcRoute = [
            // USDT - WETH
            { swapProtocol: 2, pool: eurtPoolAddress, fromCoin: wMatic.address, toCoin: usdc.address }
        ];
        wMaticUsdtRoute = [
            // USDT - WETH
            { swapProtocol: 2, pool: eurtPoolAddress, fromCoin: wMatic.address, toCoin: usdt.address }
        ];

        // eurtUsdtRoute = [
        //     { swapProtocol: 2, pool: eurtPoolAddress, fromCoin: weth.address, toCoin: usdt.address },
        //     { swapProtocol: 1, pool: fraxPoolAddress, fromCoin: usdt.address, toCoin: dai.address }
        // ];

        // alluoEdge = { swapProtocol: 7, pool: alluoPool, fromCoin: alluo.address, toCoin: weth.address };
        eurtEdge = { swapProtocol: 2, pool: eurtPoolAddress, fromCoin: usdc.address, toCoin: eurt.address };
    }

    async function executeSetup() {
        const Exchange = await ethers.getContractFactory("Exchange");

        exchange = await Exchange.deploy(dai.address, true);
        await exchange.deployed();
        console.log("exchange Address:", exchange.address)

        const routes: Route[] = [
            wMaticEurtRoute, wMaticDaiRoute, wMaticUsdcRoute, wMaticUsdtRoute,
            eurtwMaticRoute, eurtDaiRoute, eurtUsdcRoute, eurtUsdtRoute, daiwMaticRoute, daiEurtRoute, daiUsdcRoute, daiUsdtRoute,
            usdcwMaticRoute, usdcEurtRoute, usdcDaiRoute, usdcUsdtRoute, usdtwMaticRoute, usdtEurtRoute, usdtDaiRoute, usdtUsdcRoute,
        ];

        await (await exchange.createInternalMajorRoutes(routes)).wait();
        console.log("InternalMajorRoutes Registered")

        const EurtAdapter = await ethers.getContractFactory("CurveEURtAdapter");
        

        const eurtAdapter = await (await EurtAdapter.deploy()).deployed();
        console.log("eurt Address:", eurtAdapter.address)

        await (await exchange.registerAdapters([eurtAdapter.address], [2])).wait();
        console.log("Adapter Registered")

        const adapterAddress = await exchange.adapters([2]);
        console.log("Adapter Address :", adapterAddress)

        await (await exchange.createLpToken([{ swapProtocol: 2, pool: eurtPoolAddress }],
            [eurtLp.address],
            [[eurt.address, dai.address, usdc.address, usdt.address]])).wait();
            console.log("LPToken Registered")

        await exchange.createApproval([eurt.address, dai.address, usdc.address, usdt.address],
            [eurtPoolAddress,
                eurtPoolAddress,
                eurtPoolAddress]);
                console.log("Approval Registered")


        await (await exchange.createMinorCoinEdge([eurtEdge])).wait();
        console.log("MinorCoinEdge Registered")


        // add more liquidity in ALLUO-ETH pool
        const investor = await getImpersonatedSigner("0xaa7c65cd4b52844412533e2c2c3e36402781d69f");
        const forcer = await (await ethers.getContractFactory("ForceSender")).deploy({ value: parseEther("5.0") });
        await forcer.forceSend(investor.address);

        const etherAmount = parseEther("72.9927");
        await wMatic.deposit({ value: etherAmount });
        await wMatic.approve(exchange.address, etherAmount);

        // const alluoAmount = parseUnits("2999910.0", await alluo.decimals());
        // await alluo.connect(investor).approve(exchange.address, alluoAmount);

        // await exchange.exchange(weth.address, alluoPool, etherAmount, 0);
        // await exchange.connect(investor).exchange(alluo.address, alluoPool, alluoAmount, 0);
    }

    before(async () => {
        const investorAddress = process.env.IMPERSONATE_ADDRESS as string;

        await ethers.provider.send(
            'hardhat_impersonateAccount',
            [investorAddress]
        );

        signers = await ethers.getSigners();

        wMatic = await ethers.getContractAt("IWrappedEther", "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270");
        // weth = await ethers.getContractAt("IWrappedEther", "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619");
        eurt = await ethers.getContractAt("IERC20Metadata", "0x7BDF330f423Ea880FF95fC41A280fD5eCFD3D09f");
        usdt = await ethers.getContractAt("IERC20Metadata", "0xc2132D05D31c914a87C6611C10748AEb04B58e8F");
        usdc = await ethers.getContractAt("IERC20Metadata", "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174");
        dai = await ethers.getContractAt("IERC20Metadata", "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063");
        // alluo = await ethers.getContractAt("IERC20Metadata", "0xb625dA6b38FD7c62747c777121140cA4b3D7fD05");
        eurtLp = await ethers.getContractAt("IERC20Metadata", "0x600743B1d8A96438bD46836fD34977a00293f6Aa")


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
        const supportedCoinList = [dai, usdc, usdt, eurt, wMatic];
        await wMatic.deposit({ value: parseEther("100.0") });

        // get all supported coins - swap ETH for all coins
        for (let i = 0; i < supportedCoinList.length; i++) {
            const coin = supportedCoinList[i];
            if (coin.address == wMatic.address) continue;
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
            if (coin.address == wMatic.address) continue;
            const amount = await coin.balanceOf(signers[0].address);
            await testSwap(coin.address, nativeEth, amount);
        }
    });
});

// Is Swap protocol & Protocol ID same ? 
// nested array at Create LP Token 
// Replace Native / Wrapper Eth w Matic (Routes - PoolAddress)


// Adapter - Add liquidity, entry coin [4] - 1 ? 
// 