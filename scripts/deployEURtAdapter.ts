// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When runnibal scope.ng the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the glo
import { BigNumberish } from "ethers";
import { ethers } from "hardhat";
import { Exchange, IERC20 } from "../typechain";

type Edge = {
  swapProtocol: BigNumberish;
  pool: string;
  fromCoin: string;
  toCoin: string;
};

let eurtEdge: Edge;
let usdc: IERC20, eurt: IERC20;


async function main() {
  const exchange = await ethers.getContractAt("Exchange", "0x6b45B9Ab699eFbb130464AcEFC23D49481a05773");

  //deploy Adapter
  const CurveEURtAdapter = await ethers.getContractFactory("CurveEURtAdapter");
  console.log("Deploying EURt adapter...");
  const curveEURt = await (await CurveEURtAdapter.deploy()).deployed();
  console.log("EURt adapter deployed at", curveEURt.address);
  console.log("\n\nCalldata for adapters registration:", exchange.interface.encodeFunctionData("registerAdapters", [[curveEURt.address], [1]]))

  //add Minor coin edge to Exchange
  const eurt3CRVPool = "0x225fb4176f0e20cdb66b4a3df70ca3063281e855";
  usdc = await ethers.getContractAt("IERC20", "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174");
  eurt = await ethers.getContractAt("IERC20", "0x7BDF330f423Ea880FF95fC41A280fD5eCFD3D09f");
  eurtEdge = { swapProtocol: 1, pool: eurt3CRVPool, fromCoin: eurt.address, toCoin: usdc.address };
  console.log("\n\nCalldata for edges creation:", exchange.interface.encodeFunctionData("createMinorCoinEdge", [[eurtEdge]]))
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
