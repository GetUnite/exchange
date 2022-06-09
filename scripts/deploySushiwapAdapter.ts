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

let spellEdge: Edge, ldoEdge: Edge, angleEdge: Edge;
let usdc: IERC20, ldo: IERC20, angle: IERC20, spell:IERC20, weth: IWrappedEther;




async function main() {
  const exchange = await ethers.getContractAt("Exchange", "0x29c66CF57a03d41Cfe6d9ecB6883aa0E2AbA21Ec");

  //deploy Adapter
  const SushiswapAdapter = await ethers.getContractFactory("SushiswapAdapter");
  console.log("Deploying SushiswapAdapter adapter...");
  const sushiswapAdapter = await (await SushiswapAdapter.deploy()).deployed();
  console.log("Sushiswap adapter deployed at", sushiswapAdapter.address);
  console.log("\n\nCalldata for adapters registration:", exchange.interface.encodeFunctionData("registerAdapters", [[sushiswapAdapter.address], [1]]))

  //add Minor coin edge to Exchange
  const ldoWethPair = "0xC558F600B34A5f69dD2f0D06Cb8A88d829B7420a"
  const spellWethPair = "0xb5De0C3753b6E1B4dBA616Db82767F17513E6d4E"
  const angleWethPair = "0xFb55AF0ef0DcdeC92Bd3752E7a9237dfEfB8AcC0"

  weth = await ethers.getContractAt("IWrappedEther", "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2");
  ldo = await ethers.getContractAt("IERC20Metadata", "0x5A98FcBEA516Cf06857215779Fd812CA3beF1B32");
  angle = await ethers.getContractAt("IERC20Metadata", "0x31429d1856aD1377A8A0079410B297e1a9e214c2");
  spell = await ethers.getContractAt("IERC20Metadata", "0x090185f2135308BaD17527004364eBcC2D37e5F6");
  usdc = await ethers.getContractAt("IERC20", "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174");

  spellEdge = { swapProtocol: 10, pool: spellWethPair, fromCoin: spell.address, toCoin: weth.address };
  ldoEdge = { swapProtocol: 10, pool: ldoWethPair, fromCoin: ldo.address, toCoin: weth.address };
  angleEdge = { swapProtocol: 10, pool: angleWethPair, fromCoin: angle.address, toCoin: weth.address };

  console.log("\n\nCalldata for edges creation:", exchange.interface.encodeFunctionData("createMinorCoinEdge", [[spellEdge, ldoEdge, angleEdge]]))
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
