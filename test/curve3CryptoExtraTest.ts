import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { BigNumberish } from "ethers";
import { formatUnits, parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { Curve3CryptoAdapter, CurveFraxAdapter, Exchange, IERC20 } from "../typechain";

describe("Curve 3Crypto pool extra tests", async () => {
    let investor: SignerWithAddress;
    let adapter: Curve3CryptoAdapter;

    before(async () => {
        const investorAddress = "0xf977814e90da44bfa03b6295a0616a897441acec"

        await ethers.provider.send(
            'hardhat_impersonateAccount',
            [investorAddress]
        );

        investor = await ethers.getSigner(investorAddress);
    });

    beforeEach(async () => {
        const Adapter = await ethers.getContractFactory("Curve3CryptoAdapter");
        adapter = await Adapter.deploy();
    });

    it("Should check coin indexer return values", async () => {
        expect(await adapter.indexByCoin("0xdAC17F958D2ee523a2206206994597C13D831ec7")).to.be.equal(1);
        expect(await adapter.indexByCoin("0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599")).to.be.equal(2);
        expect(await adapter.indexByCoin("0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2")).to.be.equal(3);
        expect(await adapter.indexByCoin("0x0000000000000000000000000000000000000000")).to.be.equal(0);
    });
});
