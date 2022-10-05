import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { BigNumberish } from "ethers";
import { formatUnits, parseUnits } from "ethers/lib/utils";
import { ethers, network } from "hardhat";
import { Exchange, IERC20Metadata } from "../typechain";

describe("Exchange EURT Adapter (full setup operations)", async () => {
    type Edge = {
        swapProtocol: BigNumberish;
        pool: string;
        fromCoin: string;
        toCoin: string;
    };
    type Route = Edge[];
    let admin: SignerWithAddress;

    let signers: SignerWithAddress[];
    let exchange: Exchange;
    let usdt: IERC20Metadata, usdc: IERC20Metadata, dai: IERC20Metadata,
        eurt: IERC20Metadata, EURtCurveLp: IERC20Metadata;

    let usdtEurtRoute: Route, usdtDaiRoute: Route, usdtUsdcRoute: Route,
        usdcEurtRoute: Route, usdcDaiRoute: Route, usdcUsdtRoute: Route,
        daiEurtRoute: Route, daiUsdcRoute: Route, daiUsdtRoute: Route,
        eurtDaiRoute: Route, eurtUsdcRoute: Route, eurtUsdtRoute: Route;

    let polygonCurveEdge: Edge;
    let usdWhale: SignerWithAddress;


    const PolygonCurveEURtPool = "0x225fb4176f0e20cdb66b4a3df70ca3063281e855";


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
                    jsonRpcUrl: process.env.POLYGON_FORKING_URL as string,
                    //you can fork from last block by commenting next line
                    blockNumber: 28729129,
                },
            },],
        });
        admin = await getImpersonatedSigner("0x2580f9954529853Ca5aC5543cE39E9B5B1145135");
        usdWhale = await getImpersonatedSigner("0x075e72a5eDf65F0A5f44699c7654C1a76941Ddc8");

        await ethers.provider.send(
            'hardhat_impersonateAccount',
            [admin.address]
        );
        signers = await ethers.getSigners();

        usdt = await ethers.getContractAt("IERC20Metadata", "0xc2132D05D31c914a87C6611C10748AEb04B58e8F");
        usdc = await ethers.getContractAt("IERC20Metadata", "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174");
        dai = await ethers.getContractAt("IERC20Metadata", "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063");
        eurt = await ethers.getContractAt("IERC20Metadata", "0x7BDF330f423Ea880FF95fC41A280fD5eCFD3D09f");
        EURtCurveLp = await ethers.getContractAt("IERC20Metadata", "0x600743B1d8A96438bD46836fD34977a00293f6Aa")

        polygonCurveEdge = { swapProtocol: 1, pool: PolygonCurveEURtPool, fromCoin: EURtCurveLp.address, toCoin: usdc.address };

        usdtEurtRoute = [
            // USDT - EURT
            { swapProtocol: 1, pool: PolygonCurveEURtPool, fromCoin: usdt.address, toCoin: eurt.address }
        ];
        usdtDaiRoute = [
            // USDT - DAI
            { swapProtocol: 1, pool: PolygonCurveEURtPool, fromCoin: usdt.address, toCoin: dai.address }
        ];
        usdtUsdcRoute = [
            // USDT - USDC
            { swapProtocol: 1, pool: PolygonCurveEURtPool, fromCoin: usdt.address, toCoin: usdc.address }
        ];
        usdcEurtRoute = [
            // USDC - EURT
            { swapProtocol: 1, pool: PolygonCurveEURtPool, fromCoin: usdc.address, toCoin: eurt.address }
        ];
        usdcDaiRoute = [
            // USDC - DAI
            { swapProtocol: 1, pool: PolygonCurveEURtPool, fromCoin: usdc.address, toCoin: dai.address }
        ];
        usdcUsdtRoute = [
            // USDC - USDT
            { swapProtocol: 1, pool: PolygonCurveEURtPool, fromCoin: usdc.address, toCoin: usdt.address }
        ];
        daiEurtRoute = [
            // DAI - EURT
            { swapProtocol: 1, pool: PolygonCurveEURtPool, fromCoin: dai.address, toCoin: eurt.address }
        ];
        daiUsdcRoute = [
            // DAI - USDC
            { swapProtocol: 1, pool: PolygonCurveEURtPool, fromCoin: dai.address, toCoin: usdc.address }
        ];
        daiUsdtRoute = [
            // DAI - USDT
            { swapProtocol: 1, pool: PolygonCurveEURtPool, fromCoin: dai.address, toCoin: usdt.address }
        ];
        eurtDaiRoute = [
            // EURT - DAI
            { swapProtocol: 1, pool: PolygonCurveEURtPool, fromCoin: eurt.address, toCoin: dai.address }
        ];
        eurtUsdcRoute = [
            // EURT - USDC
            { swapProtocol: 1, pool: PolygonCurveEURtPool, fromCoin: eurt.address, toCoin: usdc.address }
        ];
        eurtUsdtRoute = [
            // EURT - USDT
            { swapProtocol: 1, pool: PolygonCurveEURtPool, fromCoin: eurt.address, toCoin: usdt.address },
        ];
    });

    beforeEach(async () => {
        const Exchange = await ethers.getContractFactory("Exchange");
        admin = await getImpersonatedSigner("0x2580f9954529853Ca5aC5543cE39E9B5B1145135");

        exchange = await Exchange.deploy(admin.address, true);
        await exchange.deployed();


        const PolygonCurve = await ethers.getContractFactory("CurveEURtAdapter");

        const polygonCurveAdapter = await PolygonCurve.deploy()
        const routes: Route[] = [
            usdtEurtRoute, usdtDaiRoute, usdtUsdcRoute,
            usdcEurtRoute, usdcDaiRoute, usdcUsdtRoute,
            daiEurtRoute, daiUsdcRoute, daiUsdtRoute,
            eurtDaiRoute, eurtUsdcRoute, eurtUsdtRoute
        ];
        await exchange.connect(admin).createInternalMajorRoutes(routes)

        await exchange.connect(admin).createLpToken(
            [{ swapProtocol: 1, pool: PolygonCurveEURtPool }],
            [EURtCurveLp.address],
            [[eurt.address, dai.address, usdc.address, usdt.address]]
        );

        await exchange.connect(admin).createApproval([eurt.address, dai.address, usdc.address, usdt.address],
            [exchange.address,
            exchange.address,
            exchange.address,
            exchange.address]);
        await exchange.connect(admin).registerAdapters([polygonCurveAdapter.address], [1])

        await exchange.connect(admin).createMinorCoinEdge([polygonCurveEdge])
    });

    async function testSwap(fromAddress: string, toAddress: string, amount: BigNumberish) {
        const from = await ethers.getContractAt("IERC20Metadata", fromAddress);
        await from.connect(usdWhale).approve(exchange.address, amount);
        // Usd whale doesn't have EURtLp, so change slightly,
        if (fromAddress == "0x600743B1d8A96438bD46836fD34977a00293f6Aa") {
            usdc.connect(usdWhale).approve(exchange.address, parseUnits("100", 6));
            const tx = await exchange.connect(usdWhale).exchange(usdc.address, "0x600743B1d8A96438bD46836fD34977a00293f6Aa", parseUnits("100", 6), 0)
            // Give some EURtLp to the usdWhale to exit pool.
        }
        if (fromAddress == eurt.address) {
            usdc.connect(usdWhale).approve(exchange.address, parseUnits("100", 6));
            const tx = await exchange.connect(usdWhale).exchange(usdc.address, eurt.address, parseUnits("100", 6), 0)
            // Give some EURt to the usdWhale.
        }
        const to = await ethers.getContractAt("IERC20Metadata", toAddress);
        const balBefore = await to.balanceOf(usdWhale.address);
        const tx = await (await exchange.connect(usdWhale).exchange(fromAddress, toAddress, amount, 0)).wait();
        console.log("Swapped", formatUnits(amount, await from.decimals()),
            await from.symbol(), "for", formatUnits((await to.balanceOf(usdWhale.address)).sub(balBefore), await to.decimals()),
            await to.symbol() + ",", "gas used:", tx.cumulativeGasUsed.toString());
    }


    it("Should check all available swaps", async () => {
        const supportedCoinList = [dai, usdc, usdt, eurt, EURtCurveLp];

        // swap all combinations of all tokens
        for (let i = 0; i < supportedCoinList.length; i++) {
            for (let j = 0; j < supportedCoinList.length; j++) {
                if (i == j) continue;

                const coinIn = supportedCoinList[i];
                const coinOut = supportedCoinList[j];
                const oneToken = parseUnits("1.0", await coinIn.decimals());
                await testSwap(coinIn.address, coinOut.address, oneToken);
            }
        }

    })
})

