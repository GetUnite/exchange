import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { BigNumber, BigNumberish, ContractReceipt } from "ethers";
import { formatEther, formatUnits, parseEther, parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { Exchange, IERC20, IWrappedEther } from "../typechain";

describe("Exchange (full setup operations)", async () => {
    type Edge = {
        swapProtocol: BigNumberish;
        pool: string;
        fromCoin: string;
        toCoin: string;
    };
    type Route = Edge[];

    let signers: SignerWithAddress[];
    let investor: SignerWithAddress;
    let exchange: Exchange, weth: IWrappedEther, usdt: IERC20, usdc: IERC20,
        dai: IERC20, cvx: IERC20, crv: IERC20, shib: IERC20, frax: IERC20, fraxPoolLp: IERC20,
        threeCrvLp: IERC20, crv3CryptoLp: IERC20;

    let wethUsdtRoute: Route, wethUsdcRoute: Route, wethDaiRoute: Route, usdtWethRoute: Route, usdtUsdcRoute: Route, usdtDaiRoute: Route,
        usdcWethRoute: Route, usdcUsdtRoute: Route, usdcDaiRoute: Route, daiUsdcRoute: Route, daiUsdtRoute: Route, daiWethRoute: Route,
        wethFraxRoute: Route, usdtFraxRoute: Route, daiFraxRoute: Route, usdcFraxRoute: Route, fraxUsdcRoute: Route, fraxDaiRoute: Route,
        fraxUsdtRoute: Route, fraxWethRoute: Route;

    let threeCrvEdge: Edge, cvxEdge: Edge, crvEdge: Edge;

    const renbtcAddress = "0xD51a44d3FaE010294C616388b506AcdA1bfAAE46";
    const fraxPoolAddress = "0xd632f22692FaC7611d2AA1C0D552930D43CAEd3B";
    const threeCrvPool = "0xbEbc44782C7dB0a1A60Cb6fe97d0b483032FF1C7";
    const cvxCurvePool = "0xB576491F1E6e5E62f1d8F26062Ee822B40B0E0d4";
    const crvCurvePool = "0x8301AE4fc9c624d1D396cbDAa1ed877821D7C511";
    const uint256MaxValue = "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff";
    const nativeEth = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";
    const zeroAddr = "0x0000000000000000000000000000000000000000";


    function initializeRoutes() {
        wethUsdtRoute = [
            { swapProtocol: 2, pool: renbtcAddress, fromCoin: weth.address, toCoin: usdt.address }
        ];
        wethUsdcRoute = [
            { swapProtocol: 2, pool: renbtcAddress, fromCoin: weth.address, toCoin: usdt.address },
            { swapProtocol: 1, pool: fraxPoolAddress, fromCoin: usdt.address, toCoin: usdc.address }
        ];
        wethDaiRoute = [
            { swapProtocol: 2, pool: renbtcAddress, fromCoin: weth.address, toCoin: usdt.address },
            { swapProtocol: 1, pool: fraxPoolAddress, fromCoin: usdt.address, toCoin: dai.address }
        ];
        usdtWethRoute = [
            // USDT - WETH
            { swapProtocol: 2, pool: renbtcAddress, fromCoin: usdt.address, toCoin: weth.address }
        ];
        usdtUsdcRoute = [
            // USDT - USDC
            { swapProtocol: 1, pool: fraxPoolAddress, fromCoin: usdt.address, toCoin: usdc.address }
        ]
        usdtDaiRoute = [
            // USDT - DAI
            { swapProtocol: 1, pool: fraxPoolAddress, fromCoin: usdt.address, toCoin: dai.address }
        ]
        usdcWethRoute = [
            // USDC - USDT - WETH
            { swapProtocol: 1, pool: fraxPoolAddress, fromCoin: usdc.address, toCoin: usdt.address },
            { swapProtocol: 2, pool: renbtcAddress, fromCoin: usdt.address, toCoin: weth.address }
        ];
        usdcUsdtRoute = [
            // USDC - USDT
            { swapProtocol: 1, pool: fraxPoolAddress, fromCoin: usdc.address, toCoin: usdt.address }
        ];
        usdcDaiRoute = [
            // USDC - DAI
            { swapProtocol: 1, pool: fraxPoolAddress, fromCoin: usdc.address, toCoin: dai.address }
        ];
        daiUsdcRoute = [
            // DAI - USDC
            { swapProtocol: 1, pool: fraxPoolAddress, fromCoin: dai.address, toCoin: usdc.address }
        ];
        daiUsdtRoute = [
            // DAI - USDT
            { swapProtocol: 1, pool: fraxPoolAddress, fromCoin: dai.address, toCoin: usdt.address }
        ];
        daiWethRoute = [
            // DAI - USDT - WETH
            { swapProtocol: 1, pool: fraxPoolAddress, fromCoin: dai.address, toCoin: usdt.address },
            { swapProtocol: 2, pool: renbtcAddress, fromCoin: usdt.address, toCoin: weth.address },
        ];
        wethFraxRoute = [
            // WETH - USDT - FRAX
            { swapProtocol: 2, pool: renbtcAddress, fromCoin: weth.address, toCoin: usdt.address },
            { swapProtocol: 1, pool: fraxPoolAddress, fromCoin: usdt.address, toCoin: frax.address },
        ];
        usdtFraxRoute = [
            // USDT - FRAX
            { swapProtocol: 1, pool: fraxPoolAddress, fromCoin: usdt.address, toCoin: frax.address },
        ];
        daiFraxRoute = [
            // DAI - FRAX
            { swapProtocol: 1, pool: fraxPoolAddress, fromCoin: dai.address, toCoin: frax.address },
        ];
        usdcFraxRoute = [
            // USDC - FRAX
            { swapProtocol: 1, pool: fraxPoolAddress, fromCoin: usdc.address, toCoin: frax.address },
        ];
        fraxUsdcRoute = [
            // FRAX - USDC
            { swapProtocol: 1, pool: fraxPoolAddress, fromCoin: frax.address, toCoin: usdc.address },
        ];
        fraxDaiRoute = [
            // FRAX - DAI
            { swapProtocol: 1, pool: fraxPoolAddress, fromCoin: frax.address, toCoin: dai.address },
        ];
        fraxUsdtRoute = [
            // FRAX - DAI
            { swapProtocol: 1, pool: fraxPoolAddress, fromCoin: frax.address, toCoin: usdt.address },
        ];
        fraxWethRoute = [
            // FRAX - USDT - WETH
            { swapProtocol: 1, pool: fraxPoolAddress, fromCoin: frax.address, toCoin: usdt.address },
            { swapProtocol: 2, pool: renbtcAddress, fromCoin: usdt.address, toCoin: weth.address },
        ];

        threeCrvEdge = { swapProtocol: 3, pool: threeCrvPool, fromCoin: threeCrvLp.address, toCoin: usdc.address };

        cvxEdge = { swapProtocol: 4, pool: cvxCurvePool, fromCoin: cvx.address, toCoin: weth.address };
        crvEdge = { swapProtocol: 5, pool: crvCurvePool, fromCoin: crv.address, toCoin: weth.address };
    }

    function reverseEdge(edge: Edge): Edge {
        return {
            swapProtocol: edge.swapProtocol,
            pool: edge.pool,
            fromCoin: edge.toCoin,
            toCoin: edge.fromCoin
        };
    }

    function validateRoute(actual: any[], expected: any[]) {
        expect(actual.length).to.be.equal(expected.length);
        for (let i = 0; i < actual.length; i++) {
            const x = actual[i];
            const y = expected[i];
            expect(x.swapProtocol).to.be.equal(y.swapProtocol);
            expect(x.pool).to.be.equal(y.pool);
            expect(x.fromCoin).to.be.equal(y.fromCoin);
            expect(x.toCoin).to.be.equal(y.toCoin);
        }
    }

    async function executeSetup() {
        const Exchange = await ethers.getContractFactory("Exchange");

        exchange = await Exchange.deploy(dai.address, true);
        await exchange.deployed();

        const routes: Route[] = [
            wethUsdtRoute, wethUsdcRoute, wethDaiRoute, usdtWethRoute, usdtUsdcRoute, usdtDaiRoute,
            usdcWethRoute, usdcUsdtRoute, usdcDaiRoute, daiUsdcRoute, daiUsdtRoute, daiWethRoute,
            wethFraxRoute, usdtFraxRoute, daiFraxRoute, usdcFraxRoute, fraxUsdcRoute, fraxDaiRoute,
            fraxUsdtRoute, fraxWethRoute
        ];

        await (await exchange.createInternalMajorRoutes(routes)).wait();

        const ThreeCrypto = await ethers.getContractFactory("Curve3CryptoAdapter");
        const Frax = await ethers.getContractFactory("CurveFraxAdapter");
        const ThreeCrvSwap = await ethers.getContractFactory("Curve3CrvSwapAdapter");
        const CvxAdapter = await ethers.getContractFactory("CurveCvxAdapter");
        const CrvAdapter = await ethers.getContractFactory("CurveCrvAdapter");

        const threeCrypto = await (await ThreeCrypto.deploy()).deployed();
        const fraxAdapter = await (await Frax.deploy()).deployed();
        const threeCrvAdapter = await (await ThreeCrvSwap.deploy()).deployed();
        const cvxAdapter = await (await CvxAdapter.deploy()).deployed();
        const crvAdapter = await (await CrvAdapter.deploy()).deployed();

        await (await exchange.registerAdapters([fraxAdapter.address, threeCrypto.address], [1, 2])).wait();

        await (await exchange.createLpToken([{ swapProtocol: 1, pool: fraxPoolAddress }, { swapProtocol: 2, pool: renbtcAddress }],
            [fraxPoolAddress, crv3CryptoLp.address],
            [[threeCrvLp.address, frax.address, fraxPoolAddress], [usdt.address, weth.address]])).wait();

        await exchange.createApproval([dai.address, usdc.address, usdt.address],
            ["0xbEbc44782C7dB0a1A60Cb6fe97d0b483032FF1C7",
                "0xbEbc44782C7dB0a1A60Cb6fe97d0b483032FF1C7",
                "0xbEbc44782C7dB0a1A60Cb6fe97d0b483032FF1C7"]);

        // not executed yet

        await (await exchange.registerAdapters([threeCrvAdapter.address], [3])).wait();
        await (await exchange.registerAdapters([cvxAdapter.address], [4])).wait();
        await (await exchange.registerAdapters([crvAdapter.address], [5])).wait();

        await (await exchange.createMinorCoinEdge([threeCrvEdge])).wait();
        await (await exchange.createMinorCoinEdge([cvxEdge])).wait();
        await (await exchange.createMinorCoinEdge([crvEdge])).wait();
    }

    before(async () => {
        const investorAddress = process.env.IMPERSONATE_ADDRESS as string;

        await ethers.provider.send(
            'hardhat_impersonateAccount',
            [investorAddress]
        );

        investor = await ethers.getSigner(investorAddress);

        signers = await ethers.getSigners();

        weth = await ethers.getContractAt("IWrappedEther", "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2");
        usdt = await ethers.getContractAt("IERC20", "0xdAC17F958D2ee523a2206206994597C13D831ec7");
        usdc = await ethers.getContractAt("IERC20", "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48");
        dai = await ethers.getContractAt("IERC20", "0x6B175474E89094C44Da98b954EedeAC495271d0F");
        cvx = await ethers.getContractAt("IERC20", "0x4e3FBD56CD56c3e72c1403e103b45Db9da5B9D2B");
        crv = await ethers.getContractAt("IERC20", "0xD533a949740bb3306d119CC777fa900bA034cd52");
        shib = await ethers.getContractAt("IERC20", "0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE");
        frax = await ethers.getContractAt("IERC20", "0x853d955aCEf822Db058eb8505911ED77F175b99e");
        fraxPoolLp = await ethers.getContractAt("IERC20", fraxPoolAddress);
        threeCrvLp = await ethers.getContractAt("IERC20", "0x6c3F90f043a72FA612cbac8115EE7e52BDe6E490");
        crv3CryptoLp = await ethers.getContractAt("IERC20", "0xc4AD29ba4B3c580e6D59105FFf484999997675Ff");

        initializeRoutes();
    });

    beforeEach(async () => {
        await executeSetup();
    });

    it("Should check all available swaps", async () => {
        let tx: ContractReceipt;
        let balBefore: BigNumber;
        let amount: BigNumber;
        const ethAmountString = "1.0";
        const ethAmount = parseEther(ethAmountString);

        await usdc.approve(exchange.address, uint256MaxValue);
        await usdt.approve(exchange.address, uint256MaxValue);
        await dai.approve(exchange.address, uint256MaxValue);
        await frax.approve(exchange.address, uint256MaxValue);
        await crv.approve(exchange.address, uint256MaxValue);
        await cvx.approve(exchange.address, uint256MaxValue);

        await signers[0].sendTransaction({
            to: signers[1].address,
            value: parseEther("1.0")
        })

        // get usdc
        balBefore = await usdc.balanceOf(signers[0].address);
        tx = await (await exchange.exchange(nativeEth, usdc.address, ethAmount, 0, { value: ethAmount })).wait();
        console.log("Swapped", ethAmountString,
            "ETH for", formatUnits((await usdc.balanceOf(signers[0].address)).sub(balBefore), 6),
            "USDC, gas used:", tx.cumulativeGasUsed.toString());

        // get usdt
        balBefore = await usdt.balanceOf(signers[0].address);
        tx = await (await exchange.exchange(nativeEth, usdt.address, ethAmount, 0, { value: ethAmount })).wait();
        console.log("Swapped", ethAmountString,
            "ETH for", formatUnits((await usdt.balanceOf(signers[0].address)).sub(balBefore), 6),
            "USDT, gas used:", tx.cumulativeGasUsed.toString());

        // get dai
        balBefore = await dai.balanceOf(signers[0].address);
        tx = await (await exchange.exchange(nativeEth, dai.address, ethAmount, 0, { value: ethAmount })).wait();
        console.log("Swapped", ethAmountString,
            "ETH for", formatUnits((await dai.balanceOf(signers[0].address)).sub(balBefore)),
            "DAI, gas used:", tx.cumulativeGasUsed.toString());

        // get frax
        balBefore = await frax.balanceOf(signers[0].address);
        tx = await (await exchange.exchange(nativeEth, frax.address, ethAmount, 0, { value: ethAmount })).wait();
        console.log("Swapped", ethAmountString,
            "ETH for", formatUnits((await frax.balanceOf(signers[0].address)).sub(balBefore)),
            "FRAX, gas used:", tx.cumulativeGasUsed.toString());

        // get crv
        balBefore = await crv.balanceOf(signers[0].address);
        tx = await (await exchange.exchange(nativeEth, crv.address, ethAmount, 0, { value: ethAmount })).wait();
        console.log("Swapped", ethAmountString,
            "ETH for", formatUnits((await crv.balanceOf(signers[0].address)).sub(balBefore)),
            "CRV, gas used:", tx.cumulativeGasUsed.toString());

        // get cvx
        balBefore = await cvx.balanceOf(signers[0].address);
        tx = await (await exchange.exchange(nativeEth, cvx.address, ethAmount, 0, { value: ethAmount })).wait();
        console.log("Swapped", ethAmountString,
            "ETH for", formatUnits((await cvx.balanceOf(signers[0].address)).sub(balBefore)),
            "CVX, gas used:", tx.cumulativeGasUsed.toString());

        balBefore = await threeCrvLp.balanceOf(signers[0].address);
        amount = await usdc.balanceOf(signers[0].address);
        tx = await (await exchange.exchange(usdc.address, threeCrvLp.address, amount, 0)).wait();
        console.log("Swapped", formatUnits(amount, 6),
            "USDC for", formatUnits((await threeCrvLp.balanceOf(signers[0].address)).sub(balBefore)),
            "3Crv, gas used:", tx.cumulativeGasUsed.toString());

        balBefore = await threeCrvLp.balanceOf(signers[0].address);
        amount = await usdt.balanceOf(signers[0].address);
        tx = await (await exchange.exchange(usdt.address, threeCrvLp.address, amount, 0)).wait();
        console.log("Swapped", formatUnits(amount, 6),
            "USDT for", formatUnits((await threeCrvLp.balanceOf(signers[0].address)).sub(balBefore)),
            "3Crv, gas used:", tx.cumulativeGasUsed.toString());

        balBefore = await threeCrvLp.balanceOf(signers[0].address);
        amount = (await dai.balanceOf(signers[0].address)).div(2);
        tx = await (await exchange.exchange(dai.address, threeCrvLp.address, amount, 0)).wait();
        console.log("Swapped", formatUnits(amount),
            "DAI for", formatUnits((await threeCrvLp.balanceOf(signers[0].address)).sub(balBefore)),
            "3Crv, gas used:", tx.cumulativeGasUsed.toString());

        balBefore = await threeCrvLp.balanceOf(signers[0].address);
        amount = await dai.balanceOf(signers[0].address);
        tx = await (await exchange.exchange(dai.address, threeCrvLp.address, amount, 0)).wait();
        console.log("Swapped", formatUnits(amount),
            "DAI for", formatUnits((await threeCrvLp.balanceOf(signers[0].address)).sub(balBefore)),
            "3Crv, gas used:", tx.cumulativeGasUsed.toString());

        balBefore = await threeCrvLp.balanceOf(signers[0].address);
        amount = await frax.balanceOf(signers[0].address);
        tx = await (await exchange.exchange(frax.address, threeCrvLp.address, amount, 0)).wait();
        console.log("Swapped", formatUnits(amount),
            "FRAX for", formatUnits((await threeCrvLp.balanceOf(signers[0].address)).sub(balBefore)),
            "3Crv, gas used:", tx.cumulativeGasUsed.toString());

        balBefore = await threeCrvLp.balanceOf(signers[0].address);
        tx = await (await exchange.exchange(nativeEth, threeCrvLp.address, ethAmount, 0, { value: ethAmount })).wait();
        console.log("Swapped", ethAmountString,
            "ETH for", formatUnits((await threeCrvLp.balanceOf(signers[0].address)).sub(balBefore)),
            "3Crv, gas used:", tx.cumulativeGasUsed.toString());
    });
});