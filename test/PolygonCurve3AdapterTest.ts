import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { BigNumberish } from "ethers";
import { formatEther, formatUnits, parseEther, parseUnits } from "ethers/lib/utils";
import { ethers, network } from "hardhat";
import { Exchange, IERC20, IERC20Metadata, IWrappedEther } from "../typechain";

describe("Curve 3 Exchange (full setup operations)", async () => {
    type Edge = {
        swapProtocol: BigNumberish;
        pool: string;
        fromCoin: string;
        toCoin: string;
    };
    type Route = Edge[];
    let admin: SignerWithAddress;

    let signers: SignerWithAddress[];
    let exchange: Exchange, usdt: IERC20Metadata, usdc: IERC20Metadata,
        dai: IERC20Metadata, PolygonCurve3Lp: IERC20Metadata;

    let usdtUsdcRoute: Route, usdtDaiRoute: Route, usdcUsdtRoute: Route, usdcDaiRoute: Route, daiUsdcRoute: Route, daiUsdtRoute: Route;

    let polygonCurveEdge: Edge;
    let usdWhale: SignerWithAddress;


    const PolygonCurve3Pool = "0x445FE580eF8d70FF569aB36e80c647af338db351";


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
        PolygonCurve3Lp = await ethers.getContractAt("IERC20Metadata", "0xE7a24EF0C5e95Ffb0f6684b813A78F2a3AD7D171");

        polygonCurveEdge = { swapProtocol: 1, pool: PolygonCurve3Pool, fromCoin: PolygonCurve3Lp.address, toCoin: usdc.address };

        usdtUsdcRoute = [
            // USDT - USDC
            { swapProtocol: 1, pool: PolygonCurve3Pool, fromCoin: usdt.address, toCoin: usdc.address }
        ]
        usdtDaiRoute = [
            // USDT - DAI
            { swapProtocol: 1, pool: PolygonCurve3Pool, fromCoin: usdt.address, toCoin: dai.address }
        ]

        usdcUsdtRoute = [
            // USDC - USDT
            { swapProtocol: 1, pool: PolygonCurve3Pool, fromCoin: usdc.address, toCoin: usdt.address }
        ];
        usdcDaiRoute = [
            // USDC - DAI
            { swapProtocol: 1, pool: PolygonCurve3Pool, fromCoin: usdc.address, toCoin: dai.address }
        ];
        daiUsdcRoute = [
            // DAI - USDC
            { swapProtocol: 1, pool: PolygonCurve3Pool, fromCoin: dai.address, toCoin: usdc.address }
        ];
        daiUsdtRoute = [
            // DAI - USDT
            { swapProtocol: 1, pool: PolygonCurve3Pool, fromCoin: dai.address, toCoin: usdt.address }
        ];




    });

    beforeEach(async () => {
        const Exchange = await ethers.getContractFactory("Exchange");
        admin = await getImpersonatedSigner("0x2580f9954529853Ca5aC5543cE39E9B5B1145135");

        exchange = await Exchange.deploy(admin.address, true);
        await exchange.deployed();


        const PolygonCurve = await ethers.getContractFactory("PolygonCurve3Adapter");

        const polygonCurveAdapter = await PolygonCurve.deploy()
        const routes: Route[] = [
            usdtUsdcRoute, usdtDaiRoute, usdcUsdtRoute, usdcDaiRoute, daiUsdcRoute, daiUsdtRoute,
        ];
        await exchange.connect(admin).createInternalMajorRoutes(routes)

        await exchange.connect(admin).createLpToken(
            [{ swapProtocol: 1, pool: PolygonCurve3Pool }],
            [PolygonCurve3Lp.address],
            [[dai.address, usdt.address, usdc.address, PolygonCurve3Lp.address]]
        );

        await exchange.connect(admin).createApproval([dai.address, usdc.address, usdt.address],
            [exchange.address,
            exchange.address,
            exchange.address]);
        await exchange.connect(admin).registerAdapters([polygonCurveAdapter.address], [1])

        await exchange.connect(admin).createMinorCoinEdge([polygonCurveEdge])


    });

    async function testSwap(fromAddress: string, toAddress: string, amount: BigNumberish) {
        const from = await ethers.getContractAt("IERC20Metadata", fromAddress);
        await from.connect(usdWhale).approve(exchange.address, amount);
        // Usd whale doesn't have am3CRV, so change slightly,
        if (fromAddress == "0xE7a24EF0C5e95Ffb0f6684b813A78F2a3AD7D171") {
            usdc.connect(usdWhale).approve(exchange.address, parseUnits("100", 6));
            const tx = await exchange.connect(usdWhale).exchange(usdc.address, "0xE7a24EF0C5e95Ffb0f6684b813A78F2a3AD7D171", parseUnits("100", 6), 0)
            // Give some amCRV to the usdWhale so they can swap.
        }
        const to = await ethers.getContractAt("IERC20Metadata", toAddress);
        const balBefore = await to.balanceOf(usdWhale.address);
        const tx = await (await exchange.connect(usdWhale).exchange(fromAddress, toAddress, amount, 0)).wait();
        console.log("Swapped", formatUnits(amount, await from.decimals()),
            await from.symbol(), "for", formatUnits((await to.balanceOf(usdWhale.address)).sub(balBefore), await to.decimals()),
            await to.symbol() + ",", "gas used:", tx.cumulativeGasUsed.toString());
    }


    it("Should check all available swaps", async () => {
        const supportedCoinList = [dai, usdc, usdt, PolygonCurve3Lp];

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