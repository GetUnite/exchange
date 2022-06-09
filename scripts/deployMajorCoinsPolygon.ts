// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When runnibal scope.ng the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the glo
import { BigNumberish } from "ethers";
import { ethers } from "hardhat";
import { Exchange, IERC20Metadata } from "../typechain";

type Edge = {
  swapProtocol: BigNumberish;
  pool: string;
  fromCoin: string;
  toCoin: string;
};
type Route = Edge[];

const PolygonCurveEURtPool = "0x225fb4176f0e20cdb66b4a3df70ca3063281e855";

let exchange: Exchange;
let usdt: IERC20Metadata, usdc: IERC20Metadata, dai: IERC20Metadata,
    EURtCurveLp: IERC20Metadata;

let usdtDaiRoute: Route, usdtUsdcRoute: Route,
usdcDaiRoute: Route, usdcUsdtRoute: Route,
daiUsdcRoute: Route, daiUsdtRoute: Route;

async function main() {
  const exchange = await ethers.getContractAt("Exchange", "0x6b45B9Ab699eFbb130464AcEFC23D49481a05773");

  //add Routes to Exchange
  usdt = await ethers.getContractAt("IERC20Metadata", "0xc2132D05D31c914a87C6611C10748AEb04B58e8F");
  usdc = await ethers.getContractAt("IERC20Metadata", "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174");
  dai = await ethers.getContractAt("IERC20Metadata", "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063");

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

  console.log("\n\nCalldata for edges creation:", exchange.interface.encodeFunctionData("createInternalMajorRoutes", [[usdtDaiRoute, usdtUsdcRoute, usdcDaiRoute, daiUsdcRoute, daiUsdtRoute]]))
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});