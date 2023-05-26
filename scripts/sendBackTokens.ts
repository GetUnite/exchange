import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { BigNumber, BigNumberish, constants } from "ethers";
import { formatEther, formatUnits, parseEther, parseUnits } from "ethers/lib/utils";
import { ethers, network } from "hardhat";
import { BeefyUniversalExchange, Exchange } from "../typechain";
type TransferInfo = {
    txHash: string,
    tokenAddress: string,
    amountIn: BigNumber,
    amountOut: BigNumber
};

type DeltaInfo = {
    txHash: string,
    tokenAddress: string,
    amount: BigNumber
};

async function main() {
    await network.provider.request({
        method: "hardhat_reset",
        params: [{
            forking: {
                enabled: true,
                jsonRpcUrl: process.env.OPTIMISM_URL as string,
                blockNumber: 101473030
            },
        },],
    });
    console.log("\nForking Optimism Mainnet from latest block. This test may take some time.")

    let usdplus = await ethers.getContractAt("IERC20", "0x73cb180bf0521828d8849bc8CF2B920918e23032")
    let sfrxeth = await ethers.getContractAt("IERC20", "0x484c2D6e3cDd945a8B2DF735e079178C1036578c")
    let frax = await ethers.getContractAt("IERC20", "0x2E3D870790dC77A83DD1d18184Acc7439A53f475")
    let mai = await ethers.getContractAt("IERC20", "0xdFA46478F9e5EA86d57387849598dbFB2e964b02")

    let leftOverTokens = [usdplus, sfrxeth, frax, mai]
    let leftOverTokensAddress = [usdplus.address, sfrxeth.address, frax.address, mai.address]
    let omnivaultContracts = ["0x2EC847395B6247Ab72b7B37432989f4547A0e947", "0xA430432eEf5C062D34e4078540b91C2ec7DBe0c9", "0xAf332f4d7A82854cB4B6345C4c133eC60c4eAd87", "0x75862d2fEdb1c6a9123F3b5d5E36D614570B404d", "0xDd7ebC54b851E629E61bc49DFcAed41C13fc67Da", "0x4eC3177F5c2500AAABE56DDbD8907d41d17Fc2E9", "0x306Df6b5D50abeD3f7bCbe7399C4b8e6BD55cB81", "0x2682c8057426FE5c462237eb3bfcfEDFb9539004"]
    let buggyContract = await ethers.getContractAt("BeefyUniversalExchange", "0xFd0aafC7b6b6fcd130a34C8d7f83E88D11fB8C6A");
    let uniqueHashes: any = []
    // Iterate over each token contract
    for (const tokenContract of leftOverTokens) {
        // Get past Transfer events where your contract was the receiver
        const filter = tokenContract.filters.Transfer(null, buggyContract.address);
        const events = await tokenContract.queryFilter(filter);

        // For each event, fetch the transaction and print details
        for (const event of events) {
            const transaction = await ethers.provider.getTransaction(event.transactionHash);
            if (!uniqueHashes.includes(event.transactionHash)) {
                uniqueHashes.push(event.transactionHash)
            } else {
                // console.log("Skipping duplicate transaction hash...")
                continue
            }
        }
    }

    // Now we have each unique transaction hash,
    // get the specific case when:
    // 1. The residual token was sent to the buggy contract:
    // 2. The residual token was sent from the buggy contract  out to another contract
    // 3. However the receipt token amount was greater than the amount sent out

    // Iterate over each transaction hash
    // Maps each transaction hash and token address to a TransferInfo object
    const transfers: Record<string, TransferInfo> = {};

    for (const transactionHash of uniqueHashes) {
        const txReceipt = await ethers.provider.getTransactionReceipt(transactionHash);

        for (const log of txReceipt.logs) {
            try {
                let tokenAddress = log.address;
                if (leftOverTokensAddress.includes(tokenAddress)) {
                    const eventDescription = usdplus.interface.parseLog(log);
                    if (eventDescription.name == "Transfer") {
                        const key = `${transactionHash}_${tokenAddress}`;

                        // Initialize the TransferInfo object if it doesn't exist
                        if (!transfers[key]) {
                            transfers[key] = {
                                txHash: transactionHash,
                                tokenAddress: tokenAddress,
                                amountIn: BigNumber.from(0),
                                amountOut: BigNumber.from(0)
                            };
                        }

                        // Update the total amount in/out for this transaction and token
                        if (eventDescription.args.to == buggyContract.address) {
                            transfers[key].amountIn = transfers[key].amountIn.add(eventDescription.args.value);
                        } else if (eventDescription.args.from == buggyContract.address) {
                            transfers[key].amountOut = transfers[key].amountOut.add(eventDescription.args.value);
                        }
                    }
                }
            } catch {
            }
        }
    }

    const deltas: DeltaInfo[] = [];
    for (const key in transfers) {
        const transfer = transfers[key];
        if (transfer.amountIn.gt(transfer.amountOut)) {
            deltas.push({
                txHash: transfer.txHash,
                tokenAddress: transfer.tokenAddress,
                amount: transfer.amountIn.sub(transfer.amountOut)
            });
        }
    }

    // Group deltas by token
    const tokenDeltas: Record<string, { total: BigNumber, amounts: { txHash: string, amount: BigNumber }[] }> = {};

    for (const delta of deltas) {
        if (!tokenDeltas[delta.tokenAddress]) {
            tokenDeltas[delta.tokenAddress] = { total: BigNumber.from(0), amounts: [] };
        }

        tokenDeltas[delta.tokenAddress].total = tokenDeltas[delta.tokenAddress].total.add(delta.amount);
        tokenDeltas[delta.tokenAddress].amounts.push({ txHash: delta.txHash, amount: delta.amount });
    }

    // Print the token deltas
    for (const tokenAddress in tokenDeltas) {
        console.log('\n')
        console.log(`Token address: ${tokenAddress}`);
        console.log(`Total amount: ${tokenDeltas[tokenAddress].total.toString()}`);
        console.log(`Individual transaction amounts:`);
        for (const tx of tokenDeltas[tokenAddress].amounts) {
            const transaction = await ethers.provider.getTransaction(tx.txHash);
            if (await isContract(transaction.from)) {
                console.log("Below is a contract address")
            }
            console.log(`TxHash: ${tx.txHash}, from: ${transaction.from},  amount: ${tx.amount.toString()}`);
        }
    }
}

async function isContract(address: string) {
    try {
        const code = await ethers.provider.getCode(address);
        if (code !== '0x') return true;
    } catch (error) { return false }
    return false
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
})