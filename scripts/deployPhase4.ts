// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { BigNumberish } from "ethers";
import { ethers } from "hardhat";
import { IERC20Metadata, IWrappedEther } from "../typechain";

type Edge = {
    swapProtocol: BigNumberish;
    pool: string;
    fromCoin: string;
    toCoin: string;
};
let alluoEdge: Edge;
let weth: IWrappedEther, alluo: IERC20Metadata;

async function main() {
    const alluoPool = "0x85Be1e46283f5f438D1f864c2d925506571d544f";

    weth = await ethers.getContractAt("IWrappedEther", "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2");
    alluo = await ethers.getContractAt("IERC20Metadata", "0x1E5193ccC53f25638Aa22a940af899B692e10B09");

    alluoEdge = { swapProtocol: 7, pool: alluoPool, fromCoin: alluo.address, toCoin: weth.address }

    const exchange = await ethers.getContractAt("Exchange", "0x29c66CF57a03d41Cfe6d9ecB6883aa0E2AbA21Ec");
    const BalancerAdapter = await ethers.getContractFactory("BalancerAdapter");
    const balancerAdapter = await (await BalancerAdapter.deploy()).deployed();

    const createApproval = exchange.interface.encodeFunctionData(
        "createApproval",
        [
            [weth.address, alluo.address],
            [
                "0xBA12222222228d8Ba445958a75a0704d566BF2C8",
                "0xBA12222222228d8Ba445958a75a0704d566BF2C8",
            ]
        ]
    )
    const registerAdapterCalldata = exchange.interface.encodeFunctionData(
        "registerAdapters",
        [[balancerAdapter.address], [7]]
    );
    const createEdgeAdapterCalldata = exchange.interface.encodeFunctionData(
        "createMinorCoinEdge",
        [[alluoEdge]]
    )
    const createLpTokenCalldata = exchange.interface.encodeFunctionData(
        "createLpToken",
        [
            [{ swapProtocol: 7, pool: alluoPool }],
            [alluoPool],
            [[weth.address, alluo.address]]
        ]
    )

    console.log("Adapter deployed:", balancerAdapter.address);

    console.log("\n\nCreate approval for Balancer Vault:", createApproval);
    console.log("\n\nRegister Balancer adapter calldata:", registerAdapterCalldata);
    console.log("\n\nCreate ALLUO-WETH minor edge calldata:", createEdgeAdapterCalldata);
    console.log("\n\nCreate ALLUO-WETH LP token calldata:", createLpTokenCalldata);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
