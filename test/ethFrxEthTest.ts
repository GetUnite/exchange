import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { BigNumberish } from "ethers";
import { ethers, network } from "hardhat";
import { Exchange, IERC20, IWrappedEther, CurveFrxEthAdapter } from "../typechain";

describe("New adapters", async () => {
    type Edge = {
        swapProtocol: BigNumberish;
        pool: string;
        fromCoin: string;
        toCoin: string;
    };

    console.log('start testing...');

    let signers: SignerWithAddress[];
    let admin: SignerWithAddress;
    let exchange: Exchange, weth: IWrappedEther, usdc: IERC20, frax: IERC20, frxEthLp: IERC20;
    let frxEthAdapter: CurveFrxEthAdapter;

    const frxEthPool = "0xa1f8a6807c402e4a15ef4eba36528a3fed24e577";
    const nativeEth = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";


    async function getImpersonatedSigner(address: string): Promise<SignerWithAddress> {
        await ethers.provider.send(
            'hardhat_impersonateAccount',
            [address]
        );

        return await ethers.getSigner(address);
    }

    before(async () => {

        await network.provider.request({
            method: "hardhat_reset",
            params: [{
                forking: {
                    enabled: true,
                    jsonRpcUrl: process.env.MAINNET_FORKING_URL as string,
                    //you can fork from last block by commenting next line
                    blockNumber: 16389494,
                },
            },],
        });

        usdc = await ethers.getContractAt("IERC20", "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48");
        frax = await ethers.getContractAt("IERC20", "0x853d955aCEf822Db058eb8505911ED77F175b99e");
        frxEthLp = await ethers.getContractAt("IERC20", "0xf43211935c781d5ca1a41d2041f397b8a7366c7a");
        weth = await ethers.getContractAt("IWrappedEther", "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2");

        signers = await ethers.getSigners();
        admin = await getImpersonatedSigner("0x1F020A4943EB57cd3b2213A66b355CB662Ea43C3");
        exchange = await ethers.getContractAt("Exchange", "0x29c66CF57a03d41Cfe6d9ecB6883aa0E2AbA21Ec");

        console.log(exchange.address);

    });

    beforeEach(async () => {

        const CurveFrxEthAdapter = await ethers.getContractFactory("CurveFrxEthAdapter");
        frxEthAdapter = await CurveFrxEthAdapter.deploy();
        console.log(frxEthAdapter.address);
    });

    it("Should register frxEth adapter", async () => {

        const frxEthEdge = [
            { swapProtocol: 17, pool: frxEthPool, fromCoin: frxEthLp.address, toCoin: weth.address }
        ];

        console.log('registering new adapter..');
        await exchange.connect(admin).registerAdapters([frxEthAdapter.address], [17]);
        console.log('adapter registered!\nInfo: ', await exchange.adapters(17));

        console.log('create minor coin edge..');
        await exchange.connect(admin).createMinorCoinEdge(frxEthEdge);

        const amount = ethers.utils.parseEther("1.0");

        console.log(await exchange.buildRoute(frxEthLp.address, weth.address));
        await exchange.exchange(nativeEth, frxEthLp.address, amount, 0, { value: amount });
        console.log(await frxEthLp.balanceOf(signers[0].address));
        console.log('exchanged TO cvxCrvFrax lp');
        expect(await frxEthLp.balanceOf(signers[0].address)).to.be.gt(0);

        const balanceBefore = await frxEthLp.balanceOf(signers[0].address);

        await frxEthLp.approve(exchange.address, balanceBefore);
        await exchange.exchange(frxEthLp.address, usdc.address, balanceBefore, 0);
        console.log('exchanged FROM cvxCrvFrax lp');
        expect(await usdc.balanceOf(signers[0].address)).to.be.gt(0);

    });

});