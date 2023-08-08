import { BigNumber, BigNumberish, Signer } from "ethers";
import { ethers } from "hardhat";
import { CallForwarder, Exchange, IERC20Metadata } from "../../typechain";
import { formatEther, formatUnits, parseEther, parseUnits } from "ethers/lib/utils";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

type VelodromeTokenInfo = {
    mooToken: string,
    majorCoin: string,
    customAmount?: BigNumber,
    v2?: boolean
}

let exchange: Exchange;
let callForwarder: CallForwarder;

let usdc: IERC20Metadata, frax: IERC20Metadata;

const zeroAddr = ethers.constants.AddressZero;
const nativeEth = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";

let signers: SignerWithAddress[];

async function testSwap(fromAddress: string, toAddress: string, amount: BigNumberish) {
    if (fromAddress == zeroAddr || fromAddress == nativeEth) {
        const to = await ethers.getContractAt("IERC20Metadata", toAddress);
        const balBefore = await to.balanceOf(signers[0].address);
        const tx = await (await exchange.exchange(nativeEth, to.address, amount, 0, { value: amount, gasLimit: 30000000 })).wait();
        const amountOut = (await to.balanceOf(signers[0].address)).sub(balBefore);
        const result = { amount: amountOut, decimals: await to.decimals(), asString: formatUnits(amountOut, await to.decimals()) };
        console.log("Swapped", formatEther(amount),
            "ETH for", result.asString,
            await to.symbol() + ",", "gas used:", tx.cumulativeGasUsed.toString());
        return result;
    }
    if (toAddress == zeroAddr || toAddress == nativeEth) {
        const from = await ethers.getContractAt("IERC20Metadata", fromAddress);
        await from.approve(exchange.address, amount);
        const balBefore = await signers[0].getBalance();
        const tx = await (await exchange.exchange(from.address, toAddress, amount, 0, { gasLimit: 30000000 })).wait();
        const amountOut = ((await signers[0].getBalance()).add(tx.gasUsed.mul(tx.effectiveGasPrice))).sub(balBefore);
        const result = { amount: amountOut, decimals: 18, asString: formatEther(amountOut) };
        console.log("Swapped", formatUnits(amount, await from.decimals()),
            await from.symbol(), "for", result.asString,
            "ETH, gas used:", tx.cumulativeGasUsed.toString());
        return result;
    }

    const from = await ethers.getContractAt("IERC20Metadata", fromAddress);
    await from.approve(exchange.address, amount);
    const to = await ethers.getContractAt("IERC20Metadata", toAddress);
    const balBefore = await to.balanceOf(signers[0].address);
    const tx = await (await exchange.exchange(fromAddress, toAddress, amount, 0, { gasLimit: 30000000 })).wait();
    const amountOut = (await to.balanceOf(signers[0].address)).sub(balBefore);
    const result = { amount: amountOut, decimals: await to.decimals(), asString: formatUnits(amountOut, await to.decimals()) };
    console.log("Swapped", formatUnits(amount, await from.decimals()),
        await from.symbol(), "for", result.asString,
        await to.symbol() + ",", "gas used:", tx.cumulativeGasUsed.toString());

    return result;
}


async function setVelodromeTokens() {
    const usdcSusd = "0x182fe51442C7D65360eD1511f30be6261c2C20C1";
    const usdcUsdt = "0x8aD01c3a425987c508A69149185383BAf6F47534";
    const alusdFrax = "0x9a02ab83e5139Ae8d4c6a9711D20b90DBC50c9f0";

    const tokens: VelodromeTokenInfo[] = [
        // TODO: List tokens to add here
    ];

    const adapterId = 16;
    let beefyZapper = "0x9b50b06b81f033ca86d70f0a44f30bd7e0155737";

    for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i];
        const mooToken = await ethers.getContractAt("contracts/interfaces/IBeefyVaultV6.sol:IBeefyVaultV6", token.mooToken);
        const veloPool = await ethers.getContractAt("IVelodromePool", await mooToken.want())

        if (token.v2) {
            beefyZapper = "0x25e66f746254cd7582E65EF7dE1F10d8883F4640"
        }

        const token0 = await veloPool.token0();
        const token1 = await veloPool.token1();
        const oppositeToken = await ethers.getContractAt("IERC20Metadata", (token0 == token.majorCoin) ? token1 : token0);

        if ((await oppositeToken.allowance(exchange.address, beefyZapper)).eq(0)) {

            await callForwarder.call(
                exchange.address,
                exchange.interface.encodeFunctionData("createApproval", [[oppositeToken.address], [beefyZapper]]),
            );

        }

        await callForwarder.call(
            exchange.address,
            exchange.interface.encodeFunctionData("createMinorCoinEdge", [[{ swapProtocol: adapterId, pool: beefyZapper, fromCoin: token.mooToken, toCoin: token.majorCoin }]]),
        );

        console.log(`Minor coin (${await mooToken.symbol()}) is set.`);
    }
}


async function main() {
    exchange = await ethers.getContractAt("Exchange", "0x66Ac11c106C3670988DEFDd24BC75dE786b91095");
    callForwarder = await ethers.getContractAt("CallForwarder", "0x1B369dE4c731d143C86cfAa811E88725905F4365");

    usdc = await ethers.getContractAt("IERC20Metadata", "0x7F5c764cBc14f9669B88837ca1490cCa17c31607");
    frax = await ethers.getContractAt("IERC20Metadata", "0x2E3D870790dC77A83DD1d18184Acc7439A53f475");
    signers = await ethers.getSigners();

    const usdcAlusd = await ethers.getContractAt("IERC20Metadata", "0x8a21Ea69300Fe56ee19fE974e9791a212114573F");
    const usdcSusd = await ethers.getContractAt("IERC20Metadata", "0x182fe51442C7D65360eD1511f30be6261c2C20C1");
    const usdcUsdt = await ethers.getContractAt("IERC20Metadata", "0x8aD01c3a425987c508A69149185383BAf6F47534");
    const alusdFrax = await ethers.getContractAt("IERC20Metadata", "0x9a02ab83e5139Ae8d4c6a9711D20b90DBC50c9f0");

    const tokens = [usdcAlusd, usdcSusd, usdcUsdt, alusdFrax];

    // await setVelodromeTokens();

    // await testSwap(nativeEth, usdc.address, parseEther("100.0"));

    // await testSwap(usdc.address, usdcAlusd.address, parseUnits("100.0", 6));
    // await testSwap(usdcAlusd.address, usdc.address, await usdcAlusd.balanceOf(signers[0].address));

    // await testSwap(usdc.address, usdcSusd.address, parseUnits("100.0", 6));
    // await testSwap(usdcSusd.address, usdc.address, await usdcSusd.balanceOf(signers[0].address));

    // await testSwap(usdc.address, usdcUsdt.address, parseUnits("100.0", 6));
    // await testSwap(usdcUsdt.address, usdc.address, await usdcUsdt.balanceOf(signers[0].address));

    // await testSwap(usdc.address, alusdFrax.address, parseUnits("100.0", 6));
    // await testSwap(alusdFrax.address, usdc.address, await alusdFrax.balanceOf(signers[0].address));
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});