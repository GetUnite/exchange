// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { BigNumberish } from "ethers";
import { formatEther, formatUnits, parseEther, parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { Exchange, IERC20, IWrappedEther } from "../typechain";

type Edge = {
    swapProtocol: BigNumberish;
    pool: string;
    fromCoin: string;
    toCoin: string;
};
type Route = Edge[];

let signers: SignerWithAddress[];
let weth: IWrappedEther, usdt: IERC20, usdc: IERC20,
    dai: IERC20, cvx: IERC20, crv: IERC20, shib: IERC20, frax: IERC20, fraxPoolLp: IERC20,
    threeCrvLp: IERC20, crv3CryptoLp: IERC20;

let wethUsdtRoute: Route, wethUsdcRoute: Route, wethDaiRoute: Route, usdtWethRoute: Route, usdtUsdcRoute: Route, usdtDaiRoute: Route,
    usdcWethRoute: Route, usdcUsdtRoute: Route, usdcDaiRoute: Route, daiUsdcRoute: Route, daiUsdtRoute: Route, daiWethRoute: Route,
    wethFraxRoute: Route, usdtFraxRoute: Route, daiFraxRoute: Route, usdcFraxRoute: Route, fraxUsdcRoute: Route, fraxDaiRoute: Route,
    fraxUsdtRoute: Route, fraxWethRoute: Route;

let cvxEdge: Edge, crvEdge: Edge, shibEdge: Edge;

const renbtcAddress = "0xD51a44d3FaE010294C616388b506AcdA1bfAAE46";
const fraxPoolAddress = "0xd632f22692FaC7611d2AA1C0D552930D43CAEd3B";
const cvxCurvePool = "0xB576491F1E6e5E62f1d8F26062Ee822B40B0E0d4";
const crvUnipool = "0x4c83A7f819A5c37D64B4c5A2f8238Ea082fA1f4e";
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
}

async function main() {
    signers = await ethers.getSigners();

    weth = await ethers.getContractAt("IWrappedEther", "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2");
    usdt = await ethers.getContractAt("IERC20", "0xdAC17F958D2ee523a2206206994597C13D831ec7");
    usdc = await ethers.getContractAt("IERC20", "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48");
    dai = await ethers.getContractAt("IERC20", "0x6B175474E89094C44Da98b954EedeAC495271d0F");
    frax = await ethers.getContractAt("IERC20", "0x853d955aCEf822Db058eb8505911ED77F175b99e");
    threeCrvLp = await ethers.getContractAt("IERC20", "0x6c3F90f043a72FA612cbac8115EE7e52BDe6E490");
    crv3CryptoLp = await ethers.getContractAt("IERC20", "0xc4AD29ba4B3c580e6D59105FFf484999997675Ff");
    fraxPoolLp = await ethers.getContractAt("IERC20", "0xd632f22692FaC7611d2AA1C0D552930D43CAEd3B");

    initializeRoutes();

    console.log("Preparing launch to the moon...");
    const Exchange = await ethers.getContractFactory("Exchange");

    console.log("Deploying exchange...");
    const exchange = await Exchange.deploy(dai.address, true);
    await exchange.deployed();
    console.log("Exchange is at", exchange.address);

    const routes: Route[] = [
        wethUsdtRoute, wethUsdcRoute, wethDaiRoute, usdtWethRoute, usdtUsdcRoute, usdtDaiRoute,
        usdcWethRoute, usdcUsdtRoute, usdcDaiRoute, daiUsdcRoute, daiUsdtRoute, daiWethRoute,
        wethFraxRoute, usdtFraxRoute, daiFraxRoute, usdcFraxRoute, fraxUsdcRoute, fraxDaiRoute,
        fraxUsdtRoute, fraxWethRoute
    ];

    console.log("Building major routes...");
    await (await exchange.createInternalMajorRoutes(routes)).wait();

    const ThreeCrypto = await ethers.getContractFactory("Curve3CryptoAdapter");
    const Frax = await ethers.getContractFactory("CurveFraxAdapter");

    console.log("Deploying 3Crypto adapter...");
    const threeCrypto = await (await ThreeCrypto.deploy()).deployed();
    console.log("3Crypto adapter is at", threeCrypto.address);

    console.log("Deploying frax adapter...");
    const fraxAdapter = await (await Frax.deploy()).deployed();
    console.log("frax adapter is at", fraxAdapter.address);

    console.log("Registering adapters...");
    await (await exchange.registerAdapters([fraxAdapter.address, threeCrypto.address], [1, 2])).wait();

    console.log("Adding LP tokens...");
    await (await exchange.createLpToken([{ swapProtocol: 1, pool: fraxPoolAddress }, { swapProtocol: 2, pool: renbtcAddress }],
        [fraxPoolAddress, crv3CryptoLp.address],
        [[threeCrvLp.address, frax.address, fraxPoolAddress], [usdt.address, weth.address]])).wait();

    console.log("Approving stables to 3Crv...");
    await exchange.createApproval([dai.address, usdc.address, usdt.address],
        ["0xbEbc44782C7dB0a1A60Cb6fe97d0b483032FF1C7",
            "0xbEbc44782C7dB0a1A60Cb6fe97d0b483032FF1C7",
            "0xbEbc44782C7dB0a1A60Cb6fe97d0b483032FF1C7"]);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
