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

async function testSwap(fromAddress: string, toAddress: string, amount: BigNumberish) {
    if (fromAddress == zeroAddr || fromAddress == nativeEth) {
        const to = await ethers.getContractAt("IERC20Metadata", toAddress);
        const balBefore = await to.balanceOf(signers[0].address);
        const tx = await (await exchange.exchange(nativeEth, to.address, amount, 0, { value: amount })).wait();
        console.log("Swapped", formatEther(amount),
            "ETH for", formatUnits((await to.balanceOf(signers[0].address)).sub(balBefore), await to.decimals()),
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
            "ETH, gas used:", tx.cumulativeGasUsed.toString());
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
                jsonRpcUrl: process.env.MAINNET_FORKING_URL as string,
            },
        },],
    });

    exchange = await ethers.getContractAt("Exchange", "0x29c66CF57a03d41Cfe6d9ecB6883aa0E2AbA21Ec");
    signers = await ethers.getSigners();
    const admin = await getImpersonatedSigner("0x1F020A4943EB57cd3b2213A66b355CB662Ea43C3");
    const usdc = await ethers.getContractAt("IERC20Metadata", "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48");
    const weth = await ethers.getContractAt("IWrappedEther", "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2");

    const reth = await ethers.getContractAt("IERC20Metadata", "0xae78736Cd615f374D3085123A210448E74Fc6393")
    const usdt = await ethers.getContractAt("IERC20Metadata", "0xdAC17F958D2ee523a2206206994597C13D831ec7");
    const dai = await ethers.getContractAt("IERC20Metadata", "0x6B175474E89094C44Da98b954EedeAC495271d0F");
    const ust = await ethers.getContractAt("IERC20Metadata", "0xa47c8bf37f92aBed4A126BDA807A7b7498661acD");
    const cvx = await ethers.getContractAt("IERC20Metadata", "0x4e3FBD56CD56c3e72c1403e103b45Db9da5B9D2B");
    const crv = await ethers.getContractAt("IERC20Metadata", "0xD533a949740bb3306d119CC777fa900bA034cd52");
    const alluo = await ethers.getContractAt("IERC20Metadata", "0x1E5193ccC53f25638Aa22a940af899B692e10B09");
    const frax = await ethers.getContractAt("IERC20Metadata", "0x853d955aCEf822Db058eb8505911ED77F175b99e");
    const threeCrvLp = await ethers.getContractAt("IERC20Metadata", "0x6c3F90f043a72FA612cbac8115EE7e52BDe6E490");
    const fraxUsdc = await ethers.getContractAt("IERC20Metadata", "0x3175Df0976dFA876431C2E9eE6Bc45b65d3473CC")
    const stEthEth = await ethers.getContractAt("IERC20Metadata", "0x06325440D014e39736583c165C2963BA99fAf14E")
    const eurs = await ethers.getContractAt("IERC20Metadata", "0xdB25f211AB05b1c97D595516F45794528a807ad8");
    const ageur = await ethers.getContractAt("IERC20Metadata", "0x1a7e4e63778B4f12a199C062f3eFdD288afCBce8");
    const eurt = await ethers.getContractAt("IERC20Metadata", "0xC581b735A1688071A1746c968e0798D642EDE491");
    const ldo = await ethers.getContractAt("IERC20Metadata", "0x5A98FcBEA516Cf06857215779Fd812CA3beF1B32");
    const angle = await ethers.getContractAt("IERC20Metadata", "0x31429d1856aD1377A8A0079410B297e1a9e214c2");
    const spell = await ethers.getContractAt("IERC20Metadata", "0x090185f2135308BaD17527004364eBcC2D37e5F6");
    const cvxEth = await ethers.getContractAt("IERC20Metadata", "0x3A283D9c08E8b55966afb64C515f5143cf907611");
    const wbtc = await ethers.getContractAt("IERC20Metadata", "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599");
    const fxs = await ethers.getContractAt("IERC20Metadata", "0x3432B6A60D23Ca0dFCa7761B7ab56459D9C964D0");
    const fraxBP = await ethers.getContractAt("IERC20Metadata", "0xe57180685e3348589e9521aa53af0bcd497e884d");
    const cvxCrvFrax = await ethers.getContractAt("IERC20Metadata", "0x527331f3f550f6f85acfecab9cc0889180c6f1d5");
    const ycrvLp = await ethers.getContractAt("IERC20Metadata", "0x453d92c7d4263201c69aacfaf589ed14202d83a4");
    const frxEthLp = await ethers.getContractAt("IERC20Metadata", "0xf43211935c781d5ca1a41d2041f397b8a7366c7a");
    const cvxCrvFraxLP = await ethers.getContractAt("IERC20Metadata", "0x527331f3f550f6f85acfecab9cc0889180c6f1d5");

    const supportedCoinList = [dai, usdc, usdt, frax, threeCrvLp, ust, crv, cvx, alluo, weth, reth, ldo, spell, angle, eurs, ageur, eurt, stEthEth, fraxUsdc, cvxEth, wbtc, fxs, fraxBP, cvxCrvFrax, ycrvLp, frxEthLp, cvxCrvFraxLP];
    await weth.deposit({ value: parseEther("1000.0") });

    // get all supported coins - swap ETH for all coins
    for (let i = 0; i < supportedCoinList.length; i++) {
        const coin = supportedCoinList[i];
        if (coin.address == weth.address) continue;
        const ethToCoinAmount = parseEther("20.0");
        await testSwap(nativeEth, coin.address, ethToCoinAmount);
    }
    console.log();

    for (let i = 0; i < supportedCoinList.length; i++) {
        for (let j = 0; j < supportedCoinList.length; j++) {
            if (i == j) continue;

            const coinIn = supportedCoinList[i];
            const coinOut = supportedCoinList[j];
            let amount: BigNumber = coinIn == reth ?
                parseUnits("0.1", await coinIn.decimals()) :
                (coinIn == spell ?
                    parseUnits("1000", await coinIn.decimals())
                    : (coinIn == wbtc ?
                        parseUnits("0.001", await coinIn.decimals())
                        : (coinIn == stEthEth ? parseUnits("0.1", await coinIn.decimals()) : parseUnits("1", await coinIn.decimals())))
                );
            await testSwap(coinIn.address, coinOut.address, amount);
        }
        console.log();
    }

    // swap rest of all coins to eth
    for (let i = 0; i < supportedCoinList.length; i++) {
        const coin = supportedCoinList[i];
        if (coin.address == weth.address) continue;
        const amount = await coin.balanceOf(signers[0].address);
        await testSwap(coin.address, nativeEth, amount);
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
})