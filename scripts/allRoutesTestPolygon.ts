import { setBalance } from "@nomicfoundation/hardhat-network-helpers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { BigNumber, BigNumberish, constants } from "ethers";
import { formatEther, formatUnits, parseEther, parseUnits } from "ethers/lib/utils";
import { ethers, network } from "hardhat";
import { Exchange } from "../typechain";

async function getImpersonatedSigner(address: string): Promise<SignerWithAddress> {
    await ethers.provider.send(
        'hardhat_impersonateAccount',
        [address]
    );
    return await ethers.getSigner(address);
}

const zeroAddr = constants.AddressZero;
const nativeEth = zeroAddr;
let signers: SignerWithAddress[];
let exchange: Exchange;
let customAmounts: { [key: string]: BigNumber } = {};

async function testSwap(fromAddress: string, toAddress: string, amount: BigNumberish) {
    if (fromAddress == zeroAddr || fromAddress == nativeEth) {
        const to = await ethers.getContractAt("IERC20Metadata", toAddress);
        const balBefore = await to.balanceOf(signers[0].address);
        const tx = await (await exchange.exchange(nativeEth, to.address, amount, 0, { value: amount })).wait();
        console.log("Swapped", formatEther(amount),
            "MATIC for", formatUnits((await to.balanceOf(signers[0].address)).sub(balBefore), await to.decimals()),
            await to.symbol() + ",", "gas used:", tx.cumulativeGasUsed.toString());
        return;
    }
    if (toAddress == zeroAddr || toAddress == nativeEth) {
        const from = await ethers.getContractAt("IERC20Metadata", fromAddress);
        await from.approve(exchange.address, amount);
        const balBefore = await signers[0].getBalance();
        const tx = await (await exchange.exchange(from.address, toAddress, amount, 0)).wait();
        console.log("Swapped", formatUnits(amount, await from.decimals()),
            await from.symbol(), "for", formatEther((await signers[0].getBalance()).sub(balBefore)),
            "MATIC, gas used:", tx.cumulativeGasUsed.toString());
        return;
    }

    const from = await ethers.getContractAt("IERC20Metadata", fromAddress);
    await from.approve(exchange.address, amount);
    const to = await ethers.getContractAt("IERC20Metadata", toAddress);
    const balBefore = await to.balanceOf(signers[0].address);
    const tx = await (await exchange.exchange(fromAddress, toAddress, amount, 0)).wait();
    console.log("Swapped", formatUnits(amount, await from.decimals()),
        await from.symbol(), "for", formatUnits((await to.balanceOf(signers[0].address)).sub(balBefore), await to.decimals()),
        await to.symbol() + ",", "gas used:", tx.cumulativeGasUsed.toString());
}

async function main() {
    await network.provider.request({
        method: "hardhat_reset",
        params: [{
            forking: {
                enabled: true,
                jsonRpcUrl: process.env.POLYGON_FORKING_URL as string,
            },
        },],
    });

    exchange = await ethers.getContractAt("Exchange", "0xeE0674C1E7d0f64057B6eCFe845DC2519443567F");
    signers = await ethers.getSigners();
    await setBalance(signers[0].address, parseEther("15000000.0"));

    const admin = await getImpersonatedSigner("0x2580f9954529853Ca5aC5543cE39E9B5B1145135");

    const usdt = await ethers.getContractAt("IERC20Metadata", "0xc2132D05D31c914a87C6611C10748AEb04B58e8F");
    const usdc = await ethers.getContractAt("IERC20Metadata", "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174");
    const dai = await ethers.getContractAt("IERC20Metadata", "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063");
    const eurt = await ethers.getContractAt("IERC20Metadata", "0x7BDF330f423Ea880FF95fC41A280fD5eCFD3D09f");
    const wmatic = await ethers.getContractAt("IWrappedEther", "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270");
    const eurs = await ethers.getContractAt("IERC20Metadata", "0xE111178A87A3BFf0c8d18DECBa5798827539Ae99");
    const par = await ethers.getContractAt("IERC20Metadata", "0xE2Aa7db6dA1dAE97C5f5C6914d285fBfCC32A128");
    const jeur = await ethers.getContractAt("IERC20Metadata", "0x4e3Decbb3645551B8A19f0eA1678079FCB33fB4c");


    const supportedCoinList = [dai, usdc, usdt, eurt, eurs, par, jeur, wmatic];
    await wmatic.deposit({ value: parseEther("1500000.0") });

    // get all supported coins - swap ETH for all coins
    for (let i = 0; i < supportedCoinList.length; i++) {
        const coin = supportedCoinList[i];
        if (coin.address == wmatic.address) continue;
        const ethToCoinAmount = parseEther("30000.0");
        await testSwap(nativeEth, coin.address, ethToCoinAmount);
    }
    console.log();

    for (let i = 0; i < supportedCoinList.length; i++) {
        for (let j = 0; j < supportedCoinList.length; j++) {
            if (i == j) continue;

            const coinIn = supportedCoinList[i];
            const coinOut = supportedCoinList[j];

            const amount = customAmounts[coinIn.address] == null ?
                parseUnits("1", await coinIn.decimals()) :
                customAmounts[coinIn.address];
            await testSwap(coinIn.address, coinOut.address, amount);
        }
        console.log();
    }

    // swap rest of all coins to eth
    for (let i = 0; i < supportedCoinList.length; i++) {
        const coin = supportedCoinList[i];
        if (coin.address == wmatic.address) continue;
        const amount = await coin.balanceOf(signers[0].address);
        await testSwap(coin.address, nativeEth, amount);
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
})