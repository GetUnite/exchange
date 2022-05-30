// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
import { ethers } from "hardhat";
import { TokenFetcher } from "../typechain";

const gnosis = process.env.GNOSIS as string;
let tokenFetcher: TokenFetcher

async function main() {
    console.log("Deploying TokenFetcher...");

    const TokenFetcher = await ethers.getContractFactory("TokenFetcher");
    tokenFetcher = await (await TokenFetcher.deploy(gnosis, false)).deployed();
    
    console.log("TokenFetcher deployed at : ", tokenFetcher.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
