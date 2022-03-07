// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
import { BigNumberish } from "ethers";
import { ethers } from "hardhat";
import { Exchange, IERC20, IWrappedEther } from "../typechain";

type Edge = {
  swapProtocol: BigNumberish;
  pool: string;
  fromCoin: string;
  toCoin: string;
};
type Route = Edge[];
let threeCrvEdge: Edge, cvxEdge: Edge, crvEdge: Edge;
let exchange: Exchange, weth: IWrappedEther, usdt: IERC20, usdc: IERC20,
  dai: IERC20, cvx: IERC20, crv: IERC20, shib: IERC20, frax: IERC20, fraxPoolLp: IERC20,
  threeCrvLp: IERC20, crv3CryptoLp: IERC20;


async function main() {
  const threeCrvPool = "0xbEbc44782C7dB0a1A60Cb6fe97d0b483032FF1C7";
  const cvxCurvePool = "0xB576491F1E6e5E62f1d8F26062Ee822B40B0E0d4";
  const fraxPoolAddress = "0xd632f22692FaC7611d2AA1C0D552930D43CAEd3B";
  const crvCurvePool = "0x8301AE4fc9c624d1D396cbDAa1ed877821D7C511";

  weth = await ethers.getContractAt("IWrappedEther", "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2");
  usdt = await ethers.getContractAt("IERC20", "0xdAC17F958D2ee523a2206206994597C13D831ec7");
  usdc = await ethers.getContractAt("IERC20", "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48");
  dai = await ethers.getContractAt("IERC20", "0x6B175474E89094C44Da98b954EedeAC495271d0F");
  cvx = await ethers.getContractAt("IERC20", "0x4e3FBD56CD56c3e72c1403e103b45Db9da5B9D2B");
  crv = await ethers.getContractAt("IERC20", "0xD533a949740bb3306d119CC777fa900bA034cd52");
  shib = await ethers.getContractAt("IERC20", "0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE");
  frax = await ethers.getContractAt("IERC20", "0x853d955aCEf822Db058eb8505911ED77F175b99e");
  fraxPoolLp = await ethers.getContractAt("IERC20", fraxPoolAddress);
  threeCrvLp = await ethers.getContractAt("IERC20", "0x6c3F90f043a72FA612cbac8115EE7e52BDe6E490");
  crv3CryptoLp = await ethers.getContractAt("IERC20", "0xc4AD29ba4B3c580e6D59105FFf484999997675Ff");

  threeCrvEdge = { swapProtocol: 3, pool: threeCrvPool, fromCoin: threeCrvLp.address, toCoin: usdc.address };

  cvxEdge = { swapProtocol: 4, pool: cvxCurvePool, fromCoin: cvx.address, toCoin: weth.address };
  crvEdge = { swapProtocol: 5, pool: crvCurvePool, fromCoin: crv.address, toCoin: weth.address };


  const exchange = await ethers.getContractAt("Exchange", "0x29c66CF57a03d41Cfe6d9ecB6883aa0E2AbA21Ec");
  const ThreeCrvAdapterFactory = await ethers.getContractFactory("Curve3CrvSwapAdapter");
  const CrvAdapterFactory = await ethers.getContractFactory("CurveCrvAdapter");
  const CvxAdapterFactory = await ethers.getContractFactory("CurveCvxAdapter");

  console.log("Deploying 3crv adapter...");
  const threeCrv = await (await ThreeCrvAdapterFactory.deploy()).deployed();
  console.log("3crv adapter deployed at", threeCrv.address);

  console.log("Deploying crv adapter...");
  const crvAdapter = await (await CrvAdapterFactory.deploy()).deployed();
  console.log("crv adapter deployed at", crvAdapter.address);

  console.log("Deploying cvx adapter...");
  const cvxAdapter = await (await CvxAdapterFactory.deploy()).deployed();
  console.log("cvx adapter deployed at", cvxAdapter.address);

  console.log("\n\nCalldata for adapters registration:", exchange.interface.encodeFunctionData("registerAdapters", [[threeCrv.address, crvAdapter.address, cvxAdapter.address], [3, 4, 5]]))
  console.log("\n\nCalldata for edges creation:", exchange.interface.encodeFunctionData("createMinorCoinEdge", [[threeCrvEdge, cvxEdge, crvEdge]]))
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
