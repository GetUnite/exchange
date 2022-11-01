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
  const cvxEthPool = "0xB576491F1E6e5E62f1d8F26062Ee822B40B0E0d4"
  const cvxEth = await ethers.getContractAt("IERC20Metadata","0x3A283D9c08E8b55966afb64C515f5143cf907611" )
  const weth = await ethers.getContractAt("IERC20Metadata", "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2");


  const CurveCvxEthAdapter = await ethers.getContractFactory("CurveCvxEthAdapter");
  const curveCvxEthAdapter = await (await CurveCvxEthAdapter.deploy()).deployed();
  console.log("curveCvxEthAdapter adapter deployed at", curveCvxEthAdapter.address);


  console.log("\n\nCalldata for adapters registration:", exchange.interface.encodeFunctionData("registerAdapters", [[curveCvxEthAdapter.address], [11]]))


  let cvxEthEdge = { swapProtocol: 11, pool: cvxEthPool, fromCoin: cvxEth.address, toCoin: weth.address}

  console.log("\n\nCalldata for edges creation:", exchange.interface.encodeFunctionData("createMinorCoinEdge", [[cvxEthEdge]]))
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
