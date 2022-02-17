import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { BigNumberish } from "ethers";
import { formatUnits, parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { CurveFraxAdapter, Exchange, IERC20 } from "../typechain";

describe("Curve Frax pool extra tests", async () => {
    let investor: SignerWithAddress;
    let adapter: CurveFraxAdapter;

    async function getImpersonatedSigner(address: string): Promise<SignerWithAddress> {
        await ethers.provider.send(
            'hardhat_impersonateAccount',
            [address]
        );

        return await ethers.getSigner(address);
    }

    before(async () => {
        const investorAddress = process.env.IMPERSONATE_ADDRESS as string;

        await ethers.provider.send(
            'hardhat_impersonateAccount',
            [investorAddress]
        );

        investor = await ethers.getSigner(investorAddress);
    });

    beforeEach(async () => {
        const Adapter = await ethers.getContractFactory("CurveFraxAdapter");
        adapter = await Adapter.deploy();
    });

    it("Should check coin indexer return values", async () => {
        expect(await adapter.indexByUnderlyingCoin("0x853d955aCEf822Db058eb8505911ED77F175b99e")).to.be.equal(1);
        expect(await adapter.indexByUnderlyingCoin("0x6B175474E89094C44Da98b954EedeAC495271d0F")).to.be.equal(2);
        expect(await adapter.indexByUnderlyingCoin("0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48")).to.be.equal(3);
        expect(await adapter.indexByUnderlyingCoin("0xdAC17F958D2ee523a2206206994597C13D831ec7")).to.be.equal(4);
        expect(await adapter.indexByUnderlyingCoin("0x0000000000000000000000000000000000000000")).to.be.equal(0);

        expect(await adapter.indexByCoin("0x853d955aCEf822Db058eb8505911ED77F175b99e")).to.be.equal(1);
        expect(await adapter.indexByCoin("0x6c3F90f043a72FA612cbac8115EE7e52BDe6E490")).to.be.equal(2);
        expect(await adapter.indexByCoin("0x0000000000000000000000000000000000000000")).to.be.equal(0);
    });
});
