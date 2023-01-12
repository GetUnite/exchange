import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { ethers, network } from "hardhat";
import { Exchange, IERC20, CurvecvxCrvFraxAdapter } from "../typechain";

describe("cvxCrvFrax adapter", async () => {

    console.log('start testing...');

    let signers: SignerWithAddress[];
    let admin: SignerWithAddress;
    let exchange: Exchange, usdc: IERC20, frax: IERC20, dolaFraxbp: IERC20, cvxCrvFraxLP: IERC20;
    let cvxCrvFraxAdapter: CurvecvxCrvFraxAdapter;
    const cvxCrvFraxMetaPool = "0x5De4EF4879F4fe3bBADF2227D2aC5d0E2D76C895";
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
        cvxCrvFraxLP = await ethers.getContractAt("IERC20", "0x527331f3f550f6f85acfecab9cc0889180c6f1d5");

        signers = await ethers.getSigners();
        admin = await getImpersonatedSigner("0x1F020A4943EB57cd3b2213A66b355CB662Ea43C3");
        exchange = await ethers.getContractAt("Exchange", "0x29c66CF57a03d41Cfe6d9ecB6883aa0E2AbA21Ec");

        console.log(exchange.address);

    });

    beforeEach(async () => {

        const cvxCrvFraxAdapterContract = await ethers.getContractFactory("CurvecvxCrvFraxAdapter");
        cvxCrvFraxAdapter = await cvxCrvFraxAdapterContract.deploy();
        console.log(cvxCrvFraxAdapter.address);
    });

    it("Should register cvxCrvFrax adapter", async () => {

        const cvxCrvFraxEdge = [
            { swapProtocol: 17, pool: cvxCrvFraxMetaPool, fromCoin: cvxCrvFraxLP.address, toCoin: usdc.address }
        ];

        console.log('registering new adapter..');
        await exchange.connect(admin).registerAdapters([cvxCrvFraxAdapter.address], [17]);
        console.log('adapter registered!\nInfo: ', await exchange.adapters(17));

        console.log('create minor coin edge..');
        await exchange.connect(admin).createMinorCoinEdge(cvxCrvFraxEdge);

        const amount = ethers.utils.parseEther("1.0");

        console.log(await exchange.buildRoute(cvxCrvFraxLP.address, usdc.address));
        await exchange.exchange(nativeEth, cvxCrvFraxLP.address, amount, 0, { value: amount });
        console.log(await cvxCrvFraxLP.balanceOf(signers[0].address));
        console.log('exchanged TO cvxCrvFrax lp');
        expect(await cvxCrvFraxLP.balanceOf(signers[0].address)).to.be.gt(0);

        const balanceBefore = await cvxCrvFraxLP.balanceOf(signers[0].address);

        await cvxCrvFraxLP.approve(exchange.address, balanceBefore);
        await exchange.exchange(cvxCrvFraxLP.address, usdc.address, balanceBefore, 0);
        console.log('exchanged FROM cvxCrvFrax lp');
        expect(await usdc.balanceOf(signers[0].address)).to.be.gt(0);

    });

});