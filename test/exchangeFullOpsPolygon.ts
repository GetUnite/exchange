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
    dai: IERC20Metadata,
    eurt: IERC20Metadata;
async function setupMajorCoins() {
    const PolygonCurveEURtPool = "0x225fb4176f0e20cdb66b4a3df70ca3063281e855";

    usdt = await ethers.getContractAt("IERC20Metadata", "0xc2132D05D31c914a87C6611C10748AEb04B58e8F");
    usdc = await ethers.getContractAt("IERC20Metadata", "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174");
    dai = await ethers.getContractAt("IERC20Metadata", "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063");
    eurt = await ethers.getContractAt("IERC20Metadata", "0x7BDF330f423Ea880FF95fC41A280fD5eCFD3D09f");

    let usdtDaiRoute: Route, usdtUsdcRoute: Route,
        usdcDaiRoute: Route, usdcUsdtRoute: Route,
        daiUsdcRoute: Route, daiUsdtRoute: Route,
        daiEurtRoute: Route, usdcEurtRoute: Route, usdtEurtRoute: Route,
        eurtDaiRoute: Route, eurtUsdcRoute: Route, eurtUsdtRoute: Route;

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
    daiEurtRoute = [
        // DAI - EURT
        { swapProtocol: 1, pool: PolygonCurveEURtPool, fromCoin: dai.address, toCoin: eurt.address }
    ];
    usdcEurtRoute = [
        // USDC - EURT
        { swapProtocol: 1, pool: PolygonCurveEURtPool, fromCoin: usdc.address, toCoin: eurt.address }
    ];
    usdtEurtRoute = [
        // USDT - EURT
        { swapProtocol: 1, pool: PolygonCurveEURtPool, fromCoin: usdt.address, toCoin: eurt.address }
    ];
    eurtDaiRoute = [
        // EURT - DAI
        { swapProtocol: 1, pool: PolygonCurveEURtPool, fromCoin: eurt.address, toCoin: dai.address }
    ];
    eurtUsdcRoute = [
        // EURT - USDC
        { swapProtocol: 1, pool: PolygonCurveEURtPool, fromCoin: eurt.address, toCoin: usdc.address }
    ];
    eurtUsdtRoute = [
        // EURT - USDT
        { swapProtocol: 1, pool: PolygonCurveEURtPool, fromCoin: eurt.address, toCoin: usdt.address }
    ];

    const PolygonCurve = await ethers.getContractFactory("CurveEURtAdapter");
    const polygonCurveAdapter = await PolygonCurve.deploy()

    const routes: Route[] = [
        usdtDaiRoute, usdtUsdcRoute,
        usdcDaiRoute, usdcUsdtRoute,
        daiUsdcRoute, daiUsdtRoute,
        daiEurtRoute, usdcEurtRoute, usdtEurtRoute,
        eurtDaiRoute, eurtUsdcRoute, eurtUsdtRoute
    ];
    await exchange.createInternalMajorRoutes(routes);
    await exchange.registerAdapters([polygonCurveAdapter.address], [1])

    supportedCoinsList.push(dai, usdc, usdt, eurt);

    console.log("Major coins (DAI, USDC, USDT, EURT) are set.");
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

let eurs: IERC20Metadata,
    par: IERC20Metadata,
    jeur: IERC20Metadata;
async function setupEursParJeurMinorCoins() {
    const pool = "0xAd326c253A84e9805559b73A08724e11E49ca651";

    eurs = await ethers.getContractAt("IERC20Metadata", "0xE111178A87A3BFf0c8d18DECBa5798827539Ae99");
    par = await ethers.getContractAt("IERC20Metadata", "0xE2Aa7db6dA1dAE97C5f5C6914d285fBfCC32A128");
    jeur = await ethers.getContractAt("IERC20Metadata", "0x4e3Decbb3645551B8A19f0eA1678079FCB33fB4c");

    const eursEurtRoute = { swapProtocol: 3, pool: pool, fromCoin: eurs.address, toCoin: eurt.address };
    const parEurtRoute = { swapProtocol: 3, pool: pool, fromCoin: par.address, toCoin: eurt.address };
    const jeurJeutRoute = { swapProtocol: 3, pool: pool, fromCoin: jeur.address, toCoin: eurt.address };

    const factory = await ethers.getContractFactory("PolygonCurve4EURAdapter");
    const adapter = await factory.deploy();

    await exchange.registerAdapters([adapter.address], [3]);
    await exchange.createMinorCoinEdge([eursEurtRoute, parEurtRoute, jeurJeutRoute]);

    supportedCoinsList.push(eurs, par, jeur);

    console.log("Minor coins (EURS, PAR, JEUR) is set.");
}

let agEur: IERC20Metadata;
async function setupAgEurMinorCoin() {
    const swapRouter = "0xE592427A0AEce92De3Edee1F18E0157C05861564";
    const encodedFeeData = "0x0000000000000000000000000000000000000064"; // fee tier 100 (0.01%)

    agEur = await ethers.getContractAt("IERC20Metadata", "0xE0B52e49357Fd4DAf2c15e02058DCE6BC0057db4")

    const agEurEdge = { swapProtocol: 2, pool: encodedFeeData, fromCoin: agEur.address, toCoin: usdc.address };

    await exchange.createApproval([agEur.address], [swapRouter]);
    await exchange.createMinorCoinEdge([agEurEdge]);

    supportedCoinsList.push(agEur);
    console.log("Minor coin (agEUR) is set.");
}

let beefyLibraryAddress: string;
let mooStargateUsdc: IERC20Metadata, mooStargateUsdt: IERC20Metadata;
async function setupStargateUsdcUsdtMinorCoins() {
    const stargate = "0x45A01E4e04F14f7A4a6702c74187c5F6222033cd";

    const usdcStargateLp = "0x1205f31718499dBf1fCa446663B532Ef87481fe1";
    const usdtStargateLp = "0x29e38769f23701A2e4A8Ef0492e19dA4604Be62c";

    const libraryFactory = await ethers.getContractFactory("BeefyBase");
    const library = await libraryFactory.deploy();
    await library.deployTransaction.wait();
    beefyLibraryAddress = library.address;

    const usdtAdapterFactory = await ethers.getContractFactory("BeefyPolygonStargateUsdtAdapter", { libraries: { BeefyBase: beefyLibraryAddress } });
    const usdcAdapterFactory = await ethers.getContractFactory("BeefyPolygonStargateUsdcAdapter", { libraries: { BeefyBase: beefyLibraryAddress } });

    mooStargateUsdt = await ethers.getContractAt("IERC20Metadata", "0x1C480521100c962F7da106839a5A504B5A7457a1");
    mooStargateUsdc = await ethers.getContractAt("IERC20Metadata", "0x2F4BBA9fC4F77F16829F84181eB7C8b50F639F95");

    const usdtEdge: Edge = { swapProtocol: 7, pool: mooStargateUsdc.address, fromCoin: mooStargateUsdc.address, toCoin: usdc.address };
    const usdcEdge: Edge = { swapProtocol: 8, pool: mooStargateUsdt.address, fromCoin: mooStargateUsdt.address, toCoin: usdt.address };

    const usdtAdapter = await usdtAdapterFactory.deploy();
    const usdcAdapter = await usdcAdapterFactory.deploy();

    await exchange.registerAdapters([usdcAdapter.address, usdtAdapter.address], [7, 8]);
    await exchange.createMinorCoinEdge([usdtEdge, usdcEdge]);
    await exchange.createApproval([usdc.address, usdt.address, usdcStargateLp, usdtStargateLp], [stargate, stargate, mooStargateUsdc.address, mooStargateUsdt.address]);

    customAmounts[mooStargateUsdc.address] = parseUnits("1.0", 6);
    customAmounts[mooStargateUsdt.address] = parseUnits("1.0", 6);

    supportedCoinsList.push(mooStargateUsdc, mooStargateUsdt);
    console.log("Minor coin (mooStargateUsdc, mooStargateUsdt) is set.");
}

let weth: IERC20Metadata;
async function setupWethMajorCoin() {
    const PolygonCurveEURtPool = "0x225fb4176f0e20cdb66b4a3df70ca3063281e855";
    weth = await ethers.getContractAt("IERC20Metadata", "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619")

    const swapRouter = "0xE592427A0AEce92De3Edee1F18E0157C05861564";
    const encodedFeeData = "0x00000000000000000000000000000000000001F4"; // fee tier 500 (0.05%)

    const wethUsdcRoute = { swapProtocol: 2, pool: encodedFeeData, fromCoin: weth.address, toCoin: usdc.address };
    const usdcWethRoute = { swapProtocol: 2, pool: encodedFeeData, fromCoin: usdc.address, toCoin: weth.address };

    let usdtWethRoute: Route, daiWethRoute: Route, eurtWethRoute: Route,
        wethUsdtRoute: Route, wethDaiRoute: Route, wethEurtRoute: Route;

    usdtWethRoute = [
        { swapProtocol: 1, pool: PolygonCurveEURtPool, fromCoin: usdt.address, toCoin: usdc.address },
        usdcWethRoute
    ];
    daiWethRoute = [
        { swapProtocol: 1, pool: PolygonCurveEURtPool, fromCoin: dai.address, toCoin: usdc.address },
        usdcWethRoute
    ];
    eurtWethRoute = [
        { swapProtocol: 1, pool: PolygonCurveEURtPool, fromCoin: eurt.address, toCoin: usdc.address },
        usdcWethRoute
    ]
    wethUsdtRoute = [
        wethUsdcRoute,
        { swapProtocol: 1, pool: PolygonCurveEURtPool, fromCoin: usdc.address, toCoin: usdt.address }
    ];
    wethDaiRoute = [
        wethUsdcRoute,
        { swapProtocol: 1, pool: PolygonCurveEURtPool, fromCoin: usdc.address, toCoin: dai.address }
    ];
    wethEurtRoute = [
        wethUsdcRoute,
        { swapProtocol: 1, pool: PolygonCurveEURtPool, fromCoin: usdc.address, toCoin: eurt.address }
    ];

    const routes: Route[] = [
        [usdcWethRoute], usdtWethRoute, daiWethRoute, eurtWethRoute,
        [wethUsdcRoute], wethUsdtRoute, wethDaiRoute, wethEurtRoute
    ];

    await exchange.createApproval([weth.address], [swapRouter]);
    await exchange.createInternalMajorRoutes(routes);

    customAmounts[weth.address] = parseUnits("0.01", 18);

    supportedCoinsList.push(weth);
    console.log("Major coin (WETH) is set.");
}

let mooCurveATriCrypto3: IERC20Metadata;
async function setupMooCurveATriCrypto3MinorCoin() {
    mooCurveATriCrypto3 = await ethers.getContractAt("IERC20Metadata", "0x5A0801BAd20B6c62d86C566ca90688A6b9ea1d3f");
    const factory = await ethers.getContractFactory("BeefyCurveATriCrypto3Adapter", { libraries: { BeefyBase: beefyLibraryAddress } });
    const contract = await factory.deploy();

    const curveLp = "0xdad97f7713ae9437fa9249920ec8507e5fbb23d3";
    const curvePool = "0x1d8b86e3D88cDb2d34688e87E72F388Cb541B7C8";

    const edge: Edge = { swapProtocol: 6, pool: mooCurveATriCrypto3.address, fromCoin: mooCurveATriCrypto3.address, toCoin: weth.address };

    await exchange.registerAdapters([contract.address], [6]);
    await exchange.createMinorCoinEdge([edge]);
    await exchange.createApproval(
        [weth.address, curveLp, curveLp],
        [curvePool, curvePool, mooCurveATriCrypto3.address]
    );

    supportedCoinsList.push(mooCurveATriCrypto3);
    console.log("Minor coin (mooCurveATriCrypto3) is set.");
}

async function optimiseUsdStablesExchange() {
    const pool = "0x445FE580eF8d70FF569aB36e80c647af338db351"; // aave pool

    const factory = await ethers.getContractFactory("PolygonCurve3Adapter");
    const adapter = await factory.deploy();

    await exchange.registerAdapters([adapter.address], [4]);

    let usdtDaiRoute: Route, usdtUsdcRoute: Route,
        usdcDaiRoute: Route, usdcUsdtRoute: Route,
        daiUsdcRoute: Route, daiUsdtRoute: Route;

    usdtDaiRoute = [
        // USDT - DAI
        { swapProtocol: 4, pool: pool, fromCoin: usdt.address, toCoin: dai.address }
    ];
    usdtUsdcRoute = [
        // USDT - USDC
        { swapProtocol: 4, pool: pool, fromCoin: usdt.address, toCoin: usdc.address }
    ];
    usdcDaiRoute = [
        // USDC - DAI
        { swapProtocol: 4, pool: pool, fromCoin: usdc.address, toCoin: dai.address }
    ];
    usdcUsdtRoute = [
        // USDC - USDT
        { swapProtocol: 4, pool: pool, fromCoin: usdc.address, toCoin: usdt.address }
    ];
    daiUsdcRoute = [
        // DAI - USDC
        { swapProtocol: 4, pool: pool, fromCoin: dai.address, toCoin: usdc.address }
    ];
    daiUsdtRoute = [
        // DAI - USDT
        { swapProtocol: 4, pool: pool, fromCoin: dai.address, toCoin: usdt.address }
    ];

    const routes: Route[] = [
        usdtDaiRoute, usdtUsdcRoute,
        usdcDaiRoute, usdcUsdtRoute,
        daiUsdcRoute, daiUsdtRoute
    ];
    await exchange.createInternalMajorRoutes(routes);

    console.log("USD stablecoins route optimised");
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
        await setupMajorCoins();            // adapter ids: 1
        await setupWmaticMinorCoin();       // adapter ids: 2 (UniswapV3)
        await setupEursParJeurMinorCoins(); // adapter ids: 3
        await setupAgEurMinorCoin();
        await setupStargateUsdcUsdtMinorCoins(); // adapter ids: 4, 5
        await setupWethMajorCoin();
        await setupMooCurveATriCrypto3MinorCoin(); // adapter ids: 6
        await optimiseUsdStablesExchange(); // adapter ids: 4

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