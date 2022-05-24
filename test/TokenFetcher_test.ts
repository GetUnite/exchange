import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { BigNumberish } from "ethers";
import { formatUnits, parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { TokenFetcher, IERC20 } from "../typechain";

describe("Token Fetcher Tests", async () => {
    let investor: SignerWithAddress;
    let tokenFetcher: TokenFetcher;


    before(async () => {
        const investorAddress = process.env.IMPERSONATE_ADDRESS as string;

        await ethers.provider.send(
            'hardhat_impersonateAccount',
            [investorAddress]
        );

        investor = await ethers.getSigner(investorAddress);

        const TokenFetcher = await ethers.getContractFactory("TokenFetcher");
        tokenFetcher = await TokenFetcher.deploy(investorAddress, true);
    });

    it("Should Add Major Coins", async() => {
      const usdcToken = {fromSymbol: 'USDC', fromToken: "0xdAC17F958D2ee523a2206206994597C13D831ec7", toSymbols: ['USDT', 'DAI', 'WETH'] };
      const usdtToken = {fromSymbol: 'USDT', fromToken: "0xdAC17F958D2ee523a2206206994597C13D831ec7", toSymbols: ['USDC', 'DAI', 'WETH'] };

      const newMajorCoin = await tokenFetcher.addMajorCoins([usdcToken, usdtToken]);
      console.log('new tokens created : ', newMajorCoin);

      const majorTokens = await tokenFetcher.getAllMajorCoins();
      console.log("Results from fetching all tokens : ", majorTokens);

      expect(majorTokens.length).to.be.equal(2);
    })

    it("Should Change Token Data", async() => {
      const TokensBefore = await tokenFetcher.getAllMajorCoins();
      const nameBefore = TokensBefore[1].fromSymbol;
      console.log("name before change", nameBefore);

      const newData = {fromSymbol: 'SHIB', fromToken: "0xdAC17F958D2ee523a2206206994597C13D831ec7", toSymbols: ['USDC', 'DAI', 'WETH'] };
      await tokenFetcher.changeMajorCoinData(1, newData);

      const TokensAfter = await tokenFetcher.getAllMajorCoins();
      const nameAfter = TokensAfter[1].fromSymbol;
      console.log("name After change", nameAfter);

      expect(nameAfter).to.be.equal("SHIB");
    })

    it("Should Delete One listed Major Token", async() => {
      const deleteToken = await tokenFetcher.deleteMajorCoin(1);
      console.log("Last listed Coins after Deletion : ", deleteToken);
      const majorTokens = await tokenFetcher.getAllMajorCoins();

      expect(majorTokens.length).to.be.equal(1);
    })
  })