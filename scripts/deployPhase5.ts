// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
import { BigNumberish } from "ethers";
import { ethers } from "hardhat";
import { IERC20Metadata, IWrappedEther } from "../typechain";

type Edge = {
    swapProtocol: BigNumberish;
    pool: string;
    fromCoin: string;
    toCoin: string;
};
let rethEdge: Edge;
let weth: IWrappedEther, reth: IERC20Metadata;

async function main() {
    const rethPool = "0x1E19CF2D73a72Ef1332C882F20534B6519Be0276";

    weth = await ethers.getContractAt("IWrappedEther", "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2");
    reth = await ethers.getContractAt("IERC20Metadata", "0xae78736Cd615f374D3085123A210448E74Fc6393")

    rethEdge = { swapProtocol: 7, pool: rethPool, fromCoin: reth.address, toCoin: weth.address };

    const exchange = await ethers.getContractAt("Exchange", "0x29c66CF57a03d41Cfe6d9ecB6883aa0E2AbA21Ec");
    const createApproval = exchange.interface.encodeFunctionData(
        "createApproval",
        [
            [reth.address],
            ["0xBA12222222228d8Ba445958a75a0704d566BF2C8"]
        ]
    )
    const createEdgeAdapterCalldata = exchange.interface.encodeFunctionData(
        "createMinorCoinEdge",
        [[rethEdge]]
    )

    console.log("\n\nCreate approval for Balancer Vault:", createApproval);
    console.log("\n\nCreate ALLUO-WETH minor edge calldata:", createEdgeAdapterCalldata);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
