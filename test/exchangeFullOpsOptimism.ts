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
    const tx = await exchange.createMinorCoinEdge([edge]);
    console.log(tx.data);

    supportedCoinsList.push(wstEthCrv);

    console.log("Minor coin (wstETHCRV) is set.");
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