import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { BigNumber, BigNumberish, constants } from "ethers";
import { formatEther, formatUnits, parseEther, parseUnits } from "ethers/lib/utils";
import { ethers, network } from "hardhat";
import { Exchange, IERC20Metadata, IWrappedEther } from "../typechain";
import { setBalance } from "@nomicfoundation/hardhat-network-helpers";

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

const nativeMatic = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";

async function testSwap(fromAddress: string, toAddress: string, amount: BigNumberish) {
    if (fromAddress == constants.AddressZero || fromAddress == nativeMatic) {
        const to = await ethers.getContractAt("IERC20Metadata", toAddress);
        const balBefore = await to.balanceOf(signers[0].address);
        const tx = await (await exchange.exchange(nativeMatic, to.address, amount, 0, { value: amount })).wait();
        console.log("Swapped", formatEther(amount),
            "MATIC for", formatUnits((await to.balanceOf(signers[0].address)).sub(balBefore), await to.decimals()),
            await to.symbol() + ",", "gas used:", tx.cumulativeGasUsed.toString());
        return;
    }
    if (toAddress == constants.AddressZero || toAddress == nativeMatic) {
        const from = await ethers.getContractAt("IERC20Metadata", fromAddress);
        await from.approve(exchange.address, amount);
        const balBefore = await signers[0].getBalance();
        const tx = await (await exchange.exchange(from.address, toAddress, amount, 0)).wait();
        console.log("Swapped", formatUnits(amount, await from.decimals()),
            await from.symbol(), "for", formatEther((await signers[0].getBalance()).sub(balBefore)),
            "MATIC, gas used:", tx.cumulativeGasUsed.toString());
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

let usdt: IERC20Metadata,
    usdc: IERC20Metadata,
    dai: IERC20Metadata;
async function setupMajorCoins() {
    const PolygonCurveEURtPool = "0x225fb4176f0e20cdb66b4a3df70ca3063281e855";

    usdt = await ethers.getContractAt("IERC20Metadata", "0xc2132D05D31c914a87C6611C10748AEb04B58e8F");
    usdc = await ethers.getContractAt("IERC20Metadata", "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174");
    dai = await ethers.getContractAt("IERC20Metadata", "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063");

    let usdtDaiRoute: Route, usdtUsdcRoute: Route,
        usdcDaiRoute: Route, usdcUsdtRoute: Route,
        daiUsdcRoute: Route, daiUsdtRoute: Route

    usdtDaiRoute = [
        // USDT - DAI
        { swapProtocol: 1, pool: PolygonCurveEURtPool, fromCoin: usdt.address, toCoin: dai.address }
    ];
    usdtUsdcRoute = [
        // USDT - USDC
        { swapProtocol: 1, pool: PolygonCurveEURtPool, fromCoin: usdt.address, toCoin: usdc.address }
    ];
    usdcDaiRoute = [
        // USDC - DAI
        { swapProtocol: 1, pool: PolygonCurveEURtPool, fromCoin: usdc.address, toCoin: dai.address }
    ];
    usdcUsdtRoute = [
        // USDC - USDT
        { swapProtocol: 1, pool: PolygonCurveEURtPool, fromCoin: usdc.address, toCoin: usdt.address }
    ];
    daiUsdcRoute = [
        // DAI - USDC
        { swapProtocol: 1, pool: PolygonCurveEURtPool, fromCoin: dai.address, toCoin: usdc.address }
    ];
    daiUsdtRoute = [
        // DAI - USDT
        { swapProtocol: 1, pool: PolygonCurveEURtPool, fromCoin: dai.address, toCoin: usdt.address }
    ];

    const PolygonCurve = await ethers.getContractFactory("CurveEURtAdapter");
    const polygonCurveAdapter = await PolygonCurve.deploy()

    const routes: Route[] = [
        usdtDaiRoute, usdtUsdcRoute,
        usdcDaiRoute, usdcUsdtRoute,
        daiUsdcRoute, daiUsdtRoute,
    ];
    await exchange.createInternalMajorRoutes(routes);
    await exchange.registerAdapters([polygonCurveAdapter.address], [1])

    supportedCoinsList.push(dai, usdc, usdt);

    console.log("Major coins (DAI, USDC, USDT) are set.");
}

let eurt: IERC20Metadata;
async function setupEurtMinorCoin() {
    const PolygonCurveEURtPool = "0x225fb4176f0e20cdb66b4a3df70ca3063281e855";

    eurt = await ethers.getContractAt("IERC20Metadata", "0x7BDF330f423Ea880FF95fC41A280fD5eCFD3D09f");

    const eurtEdge = { swapProtocol: 1, pool: PolygonCurveEURtPool, fromCoin: eurt.address, toCoin: usdc.address };

    await exchange.createMinorCoinEdge([eurtEdge])

    supportedCoinsList.push(eurt); 
    console.log("Minor coin (EURT) is set.");
}

let wmatic: IWrappedEther;
async function setupWmaticMinorCoin() {
    const swapRouter = "0xE592427A0AEce92De3Edee1F18E0157C05861564";
    const encodedFeeData = "0x00000000000000000000000000000000000001F4"; // fee tier 500 (0.05%)

    const wmaticUsdcRoute = { swapProtocol: 2, pool: encodedFeeData, fromCoin: wmatic.address, toCoin: usdc.address };

    const uniV3AdapterFactory = await ethers.getContractFactory("UniswapV3Adapter");
    const uniV3Adapter = await uniV3AdapterFactory.deploy();

    await exchange.createApproval([usdc.address, wmatic.address], [swapRouter, swapRouter]);
    await exchange.registerAdapters([uniV3Adapter.address], [2]);
    await exchange.createMinorCoinEdge([wmaticUsdcRoute]);

    supportedCoinsList.push(wmatic); 
    console.log("Minor coin (WMATIC) is set.");
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

describe("Exchange (full setup operations on Polygon Mainnet)", async () => {
    before(async () => {
        await network.provider.request({
            method: "hardhat_reset",
            params: [{
                forking: {
                    enabled: true,
                    jsonRpcUrl: process.env.POLYGON_FORKING_URL as string,
                },
            },],
        });
        console.log("\nForking Polygon Mainnet from latest block. This test may take some time.")

        signers = await ethers.getSigners();
        await setBalance(signers[0].address, parseEther("15000000.0"));
    });

    beforeEach(async () => {
        const Exchange = await ethers.getContractFactory("Exchange");
        exchange = await Exchange.deploy(
            "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063",
            true
        );

        wmatic = await ethers.getContractAt("IWrappedEther", "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270");
        await exchange.setWrappedNativeToken(wmatic.address);

        console.log("Clean Exchange contract deployed, setting up routes...\n");
        // adaprter creations:
        await setupMajorCoins();      // adapter ids: 1
        await setupEurtMinorCoin();
        await setupWmaticMinorCoin(); // adapter ids: 2 (UniswapV3)

        // TODO: add your new exchange setup function call above this line. add adapter
        // id comment after function call if you are registering any new adapters inside
        // 
        // with example above, you would add this line:
        // await setupExampleMinorCoin()         // adapter ids: 69

        console.log("\nRoutes set, executing all possible exchanges\n");
    });

    it("Should check all available swaps", async () => {
        console.log("Supported coins list length:", supportedCoinsList.length);

        await wmatic.deposit({ value: parseEther("1500000.0") });

        // get all supported coins - swap MATIC for all coins
        console.log("Swapping MATIC to all listed coins...\n");
        for (let i = 0; i < supportedCoinsList.length; i++) {
            const coin = supportedCoinsList[i];
            if (coin.address == wmatic.address) continue;
            const ethToCoinAmount = parseEther("30000.0");
            await testSwap(nativeMatic, coin.address, ethToCoinAmount);
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
        console.log("Swapping all listed coins to MATIC...\n");

        // swap rest of all coins to MATIC
        for (let i = 0; i < supportedCoinsList.length; i++) {
            const coin = supportedCoinsList[i];
            if (coin.address == wmatic.address) continue;
            const amount = await coin.balanceOf(signers[0].address);
            await testSwap(coin.address, nativeMatic, amount);
        }
    });
});