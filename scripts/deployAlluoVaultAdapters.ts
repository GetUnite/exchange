// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When runnibal scope.ng the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the glo
import { BigNumberish } from "ethers";
import { ethers } from "hardhat";
import { IERC20, IWrappedEther } from "../typechain";

type Edge = {
  swapProtocol: BigNumberish;
  pool: string;
  fromCoin: string;
  toCoin: string;
};

let fraxUsdcEdge: Edge, stEthEdge: Edge;;

async function main() {
  const exchange = await ethers.getContractAt("Exchange", "0x29c66CF57a03d41Cfe6d9ecB6883aa0E2AbA21Ec");
  const fraxUSDCPool = "0xDcEF968d416a41Cdac0ED8702fAC8128A64241A2"
  const stEthEthPool = "0xDC24316b9AE028F1497c275EB9192a3Ea0f67022"
  const fraxUsdc = await ethers.getContractAt("IERC20Metadata", "0x3175Df0976dFA876431C2E9eE6Bc45b65d3473CC")
  const stEthEth = await ethers.getContractAt("IERC20Metadata", "0x06325440D014e39736583c165C2963BA99fAf14E")
  const usdc = await ethers.getContractAt("IERC20Metadata", "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48");
  const weth = await ethers.getContractAt("IERC20Metadata", "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2");

  //deploy Adapters
  const CurveFraxUsdcAdapter = await ethers.getContractFactory("CurveFraxUsdcAdapter");
  const curveFraxUsdcAdapter = await (await CurveFraxUsdcAdapter.deploy()).deployed();
  console.log("CurveFraxUsdc adapter deployed at", curveFraxUsdcAdapter.address);

  const CurveStEthAdapter = await ethers.getContractFactory("CurveStEthAdapter");
  const curveStEthAdapter = await (await CurveStEthAdapter.deploy()).deployed();
  console.log("curveStEthAdapter adapter deployed at", curveStEthAdapter.address);


  console.log("\n\nCalldata for adapters registration:", exchange.interface.encodeFunctionData("registerAdapters", [[curveFraxUsdcAdapter.address, curveStEthAdapter.address], [9,10]]))


  fraxUsdcEdge = { swapProtocol: 9, pool: fraxUSDCPool, fromCoin: fraxUsdc.address, toCoin: usdc.address };
  stEthEdge = { swapProtocol: 10, pool: stEthEthPool, fromCoin: stEthEth.address, toCoin: weth.address};

  console.log("\n\nCalldata for edges creation:", exchange.interface.encodeFunctionData("createMinorCoinEdge", [[fraxUsdcEdge, stEthEdge]]))
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
