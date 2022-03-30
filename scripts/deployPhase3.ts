// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
import { BigNumberish } from "ethers";
import { ethers } from "hardhat";
import { Exchange, IERC20Metadata, IWrappedEther } from "../typechain";

type Edge = {
  swapProtocol: BigNumberish;
  pool: string;
  fromCoin: string;
  toCoin: string;
};
let threeCrvEdge: Edge, cvxEdge: Edge, crvEdge: Edge, ustEdge: Edge;
let weth: IWrappedEther, usdt: IERC20Metadata, usdc: IERC20Metadata,
  dai: IERC20Metadata, cvx: IERC20Metadata, crv: IERC20Metadata, frax: IERC20Metadata,
  threeCrvLp: IERC20Metadata, crv3CryptoLp: IERC20Metadata, ust: IERC20Metadata;


async function main() {
  const renbtcAddress = "0xD51a44d3FaE010294C616388b506AcdA1bfAAE46";
  const fraxPoolAddress = "0xd632f22692FaC7611d2AA1C0D552930D43CAEd3B";
  const threeCrvPool = "0xbEbc44782C7dB0a1A60Cb6fe97d0b483032FF1C7";
  const cvxCurvePool = "0xB576491F1E6e5E62f1d8F26062Ee822B40B0E0d4";
  const crvCurvePool = "0x8301AE4fc9c624d1D396cbDAa1ed877821D7C511";
  const ustCurveAddress = "0x890f4e345B1dAED0367A877a1612f86A1f86985f";
  const uint256MaxValue = "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff";
  const nativeEth = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";
  const zeroAddr = "0x0000000000000000000000000000000000000000";

  weth = await ethers.getContractAt("IWrappedEther", "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2");
  usdt = await ethers.getContractAt("IERC20Metadata", "0xdAC17F958D2ee523a2206206994597C13D831ec7");
  usdc = await ethers.getContractAt("IERC20Metadata", "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48");
  dai = await ethers.getContractAt("IERC20Metadata", "0x6B175474E89094C44Da98b954EedeAC495271d0F");
  ust = await ethers.getContractAt("IERC20Metadata", "0xa47c8bf37f92aBed4A126BDA807A7b7498661acD");
  cvx = await ethers.getContractAt("IERC20Metadata", "0x4e3FBD56CD56c3e72c1403e103b45Db9da5B9D2B");
  crv = await ethers.getContractAt("IERC20Metadata", "0xD533a949740bb3306d119CC777fa900bA034cd52");
  frax = await ethers.getContractAt("IERC20Metadata", "0x853d955aCEf822Db058eb8505911ED77F175b99e");
  threeCrvLp = await ethers.getContractAt("IERC20Metadata", "0x6c3F90f043a72FA612cbac8115EE7e52BDe6E490");
  crv3CryptoLp = await ethers.getContractAt("IERC20Metadata", "0xc4AD29ba4B3c580e6D59105FFf484999997675Ff");

  ustEdge = { swapProtocol: 6, pool: ustCurveAddress, fromCoin: ust.address, toCoin: usdt.address };

  const exchange = await ethers.getContractAt("Exchange", "0x29c66CF57a03d41Cfe6d9ecB6883aa0E2AbA21Ec");
  const UstAdapter = await ethers.getContractFactory("CurveUstAdapter");

  console.log("Deploying UST adapter...");
  const ustAdapter = await (await UstAdapter.deploy()).deployed();
  console.log("UST adapter deployed at", ustAdapter.address);

  console.log("\n\nCalldata for adapters registration:", exchange.interface.encodeFunctionData("registerAdapters", [[ustAdapter.address], [6]]))
  console.log("\n\nCalldata for edges creation:", exchange.interface.encodeFunctionData("createMinorCoinEdge", [[ustEdge]]))
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
