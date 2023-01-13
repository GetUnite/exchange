import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { BigNumberish } from "ethers";
import { formatEther, formatUnits, parseEther, parseUnits } from "ethers/lib/utils";
import { ethers, network } from "hardhat";
import { Exchange, IERC20, IWrappedEther } from "../typechain";

describe("Exchange", async () => {
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

    let cvxEdge: Edge, crvEdge: Edge, shibEdge: Edge;

    const renbtcAddress = "0xD51a44d3FaE010294C616388b506AcdA1bfAAE46";
    const fraxPoolAddress = "0xd632f22692FaC7611d2AA1C0D552930D43CAEd3B";
    const cvxCurvePool = "0xB576491F1E6e5E62f1d8F26062Ee822B40B0E0d4";
    const crvUnipool = "0x4c83A7f819A5c37D64B4c5A2f8238Ea082fA1f4e";
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

        cvxEdge = { swapProtocol: 3, pool: cvxCurvePool, fromCoin: cvx.address, toCoin: weth.address };
        crvEdge = { swapProtocol: 4, pool: crvUnipool, fromCoin: crv.address, toCoin: weth.address };
        // NEXT ONE IS FAKE - linking SHIB-DAI is done only for testing complex route!
        shibEdge = { swapProtocol: 5, pool: crvUnipool, fromCoin: shib.address, toCoin: dai.address };

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

    before(async () => {
        await network.provider.request({
            method: "hardhat_reset",
            params: [{
                forking: {
                    enabled: true,
                    jsonRpcUrl: process.env.MAINNET_FORKING_URL as string,
                    blockNumber: 15931417
                },
            },],
        });
        console.log("\nForking Ethereum Mainnet from latest block. This test may take some time.")

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
        const Exchange = await ethers.getContractFactory("Exchange");
        exchange = await Exchange.deploy(dai.address, true);
    });

    it("Should build correct routes", async () => {
        const routes: Route[] = [
            wethUsdtRoute, wethUsdcRoute, wethDaiRoute, usdtWethRoute, usdtUsdcRoute, usdtDaiRoute,
            usdcWethRoute, usdcUsdtRoute, usdcDaiRoute, daiUsdcRoute, daiUsdtRoute, daiWethRoute,
            wethFraxRoute, usdtFraxRoute, daiFraxRoute, usdcFraxRoute, fraxUsdcRoute, fraxDaiRoute,
            fraxUsdtRoute, fraxWethRoute
        ];
        // shibEdge IS FAKE - linking SHIB-DAI is done only for testing complex route!
        const edges: Edge[] = [cvxEdge, crvEdge, shibEdge];

        await exchange.createInternalMajorRoutes(routes);
        await exchange.createMinorCoinEdge(edges);

        expect(await exchange.isMajorCoin(weth.address)).to.be.true;
        expect(await exchange.isMajorCoin(usdc.address)).to.be.true;
        expect(await exchange.isMajorCoin(usdt.address)).to.be.true;
        expect(await exchange.isMajorCoin(dai.address)).to.be.true;
        expect(await exchange.isMajorCoin(frax.address)).to.be.true;

        expect(await exchange.isMajorCoin(cvx.address)).to.be.false;
        expect(await exchange.isMajorCoin(crv.address)).to.be.false;
        expect(await exchange.isMajorCoin(shib.address)).to.be.false;

        validateRoute(await exchange.getMajorRoute(weth.address, usdt.address), wethUsdtRoute);
        validateRoute(await exchange.getMajorRoute(weth.address, usdc.address), wethUsdcRoute);
        validateRoute(await exchange.getMajorRoute(weth.address, dai.address), wethDaiRoute);
        validateRoute(await exchange.getMajorRoute(usdt.address, weth.address), usdtWethRoute);
        validateRoute(await exchange.getMajorRoute(usdt.address, usdc.address), usdtUsdcRoute);
        validateRoute(await exchange.getMajorRoute(usdt.address, dai.address), usdtDaiRoute);
        validateRoute(await exchange.getMajorRoute(usdc.address, weth.address), usdcWethRoute);
        validateRoute(await exchange.getMajorRoute(usdc.address, usdt.address), usdcUsdtRoute);
        validateRoute(await exchange.getMajorRoute(usdc.address, dai.address), usdcDaiRoute);
        validateRoute(await exchange.getMajorRoute(dai.address, usdc.address), daiUsdcRoute);
        validateRoute(await exchange.getMajorRoute(dai.address, usdt.address), daiUsdtRoute);
        validateRoute(await exchange.getMajorRoute(dai.address, weth.address), daiWethRoute);

        validateRoute(await exchange.getMajorRoute(weth.address, frax.address), wethFraxRoute);
        validateRoute(await exchange.getMajorRoute(usdt.address, frax.address), usdtFraxRoute);
        validateRoute(await exchange.getMajorRoute(dai.address, frax.address), daiFraxRoute);
        validateRoute(await exchange.getMajorRoute(usdc.address, frax.address), usdcFraxRoute);

        validateRoute(await exchange.getMajorRoute(frax.address, usdc.address), fraxUsdcRoute);
        validateRoute(await exchange.getMajorRoute(frax.address, dai.address), fraxDaiRoute);
        validateRoute(await exchange.getMajorRoute(frax.address, usdt.address), fraxUsdtRoute);
        validateRoute(await exchange.getMajorRoute(frax.address, weth.address), fraxWethRoute);


        validateRoute([await exchange.minorCoins(cvx.address)], [cvxEdge]);
        validateRoute([await exchange.minorCoins(crv.address)], [crvEdge]);
        validateRoute([await exchange.minorCoins(shib.address)], [shibEdge]);

        validateRoute(await exchange.buildRoute(crv.address, cvx.address), [crvEdge, reverseEdge(cvxEdge)]); // minor - minor
        validateRoute(await exchange.buildRoute(dai.address, cvx.address), daiWethRoute.concat(reverseEdge(cvxEdge))); // major - minor
        validateRoute(await exchange.buildRoute(crv.address, dai.address), [crvEdge].concat(wethDaiRoute)); // minor - major
        validateRoute(await exchange.buildRoute(weth.address, dai.address), wethDaiRoute); // major - major


        validateRoute(await exchange.buildRoute(crv.address, weth.address), [crvEdge]); // minor - major (simple)
        validateRoute(await exchange.buildRoute(weth.address, crv.address), [reverseEdge(crvEdge)]); // major - minor (simple)
        validateRoute(await exchange.buildRoute(shib.address, crv.address), [shibEdge].concat(daiWethRoute).concat(reverseEdge(crvEdge))); // major - minor (complex)
    });

    it("Should not create minor coin edge (swap protocol id is 0)", async () => {
        const edges = [
            { swapProtocol: 1, pool: fraxPoolAddress, fromCoin: dai.address, toCoin: usdc.address },
            { swapProtocol: 0, pool: fraxPoolAddress, fromCoin: dai.address, toCoin: usdc.address },
            { swapProtocol: 1, pool: fraxPoolAddress, fromCoin: dai.address, toCoin: usdc.address },
        ];

        await expect(exchange.createMinorCoinEdge(edges)).to.be.revertedWith("Exchange: protocol type !set");
    })

    it("Should not create minor coin edge (loop)", async () => {
        const edges = [
            { swapProtocol: 1, pool: fraxPoolAddress, fromCoin: dai.address, toCoin: usdc.address },
            { swapProtocol: 1, pool: fraxPoolAddress, fromCoin: dai.address, toCoin: dai.address },
            { swapProtocol: 1, pool: fraxPoolAddress, fromCoin: dai.address, toCoin: usdc.address },
        ];

        await expect(exchange.createMinorCoinEdge(edges)).to.be.revertedWith("Exchange: edge is loop");
    })

    it("Should create minor coin edge (approval test)", async () => {
        const edge = [
            { swapProtocol: 1, pool: fraxPoolAddress, fromCoin: dai.address, toCoin: usdc.address },
        ];
        const newEdge = [
            { swapProtocol: 2, pool: fraxPoolAddress, fromCoin: dai.address, toCoin: usdc.address },
        ];

        expect(await dai.allowance(exchange.address, fraxPoolAddress)).to.be.equal(0);
        expect(await usdc.allowance(exchange.address, fraxPoolAddress)).to.be.equal(0);

        expect(await exchange.approveCompleted(fraxPoolAddress, dai.address)).to.be.false;
        expect(await exchange.approveCompleted(fraxPoolAddress, usdc.address)).to.be.false;

        const txWithApproval = await exchange.createMinorCoinEdge(edge);

        expect(txWithApproval).to.emit(dai, "Approval").withArgs(exchange.address, fraxPoolAddress, uint256MaxValue);
        expect(txWithApproval).to.emit(usdc, "Approval").withArgs(exchange.address, fraxPoolAddress, uint256MaxValue);

        expect(await dai.allowance(exchange.address, fraxPoolAddress)).to.be.equal(uint256MaxValue);
        expect(await usdc.allowance(exchange.address, fraxPoolAddress)).to.be.equal(uint256MaxValue);

        expect(await exchange.approveCompleted(fraxPoolAddress, dai.address)).to.be.true;
        expect(await exchange.approveCompleted(fraxPoolAddress, usdc.address)).to.be.true;

        const txWithoutApproval = await exchange.createMinorCoinEdge(newEdge);

        expect(txWithoutApproval).to.not.emit(dai, "Approval");
        expect(txWithoutApproval).to.not.emit(usdc, "Approval");
    });

    it("Should create major routes (approval test)", async () => {
        expect(await usdc.allowance(exchange.address, fraxPoolAddress)).to.be.equal(0);
        expect(await usdt.allowance(exchange.address, renbtcAddress)).to.be.equal(0);
        expect(await dai.allowance(exchange.address, fraxPoolAddress)).to.be.equal(0);
        expect(await exchange.approveCompleted(fraxPoolAddress, dai.address)).to.be.false;
        expect(await exchange.approveCompleted(fraxPoolAddress, usdc.address)).to.be.false;
        expect(await exchange.approveCompleted(renbtcAddress, usdt.address)).to.be.false;

        const tx1 = await exchange.createInternalMajorRoutes([daiWethRoute]);

        expect(await usdc.allowance(exchange.address, fraxPoolAddress)).to.be.equal(0);
        expect(await usdt.allowance(exchange.address, renbtcAddress)).to.be.equal(uint256MaxValue);
        expect(await dai.allowance(exchange.address, fraxPoolAddress)).to.be.equal(uint256MaxValue);

        expect(tx1).to.emit(dai, "Approval").withArgs(exchange.address, fraxPoolAddress, uint256MaxValue);
        expect(tx1).to.emit(usdt, "Approval").withArgs(exchange.address, renbtcAddress, uint256MaxValue);
        expect(tx1).to.not.emit(usdc, "Approval");

        expect(await exchange.approveCompleted(fraxPoolAddress, dai.address)).to.be.true;
        expect(await exchange.approveCompleted(fraxPoolAddress, usdc.address)).to.be.false;
        expect(await exchange.approveCompleted(renbtcAddress, usdt.address)).to.be.true;

        const tx2 = await exchange.createInternalMajorRoutes([usdcWethRoute]);

        expect(await usdc.allowance(exchange.address, fraxPoolAddress)).to.be.equal(uint256MaxValue);
        expect(await usdt.allowance(exchange.address, renbtcAddress)).to.be.equal(uint256MaxValue);
        expect(await dai.allowance(exchange.address, fraxPoolAddress)).to.be.equal(uint256MaxValue);

        expect(tx2).to.not.emit(dai, "Approval");
        expect(tx2).to.not.emit(usdt, "Approval");
        expect(tx2).to.emit(usdc, "Approval").withArgs(exchange.address, fraxPoolAddress, uint256MaxValue);

        expect(await exchange.approveCompleted(fraxPoolAddress, dai.address)).to.be.true;
        expect(await exchange.approveCompleted(fraxPoolAddress, usdc.address)).to.be.true;
        expect(await exchange.approveCompleted(renbtcAddress, usdt.address)).to.be.true;
    });

    it("Should not create major route (from and to are equal)", async () => {
        const routes = [
            usdcDaiRoute,
            [
                { swapProtocol: 1, pool: renbtcAddress, fromCoin: weth.address, toCoin: usdt.address },
                { swapProtocol: 1, pool: fraxPoolAddress, fromCoin: usdt.address, toCoin: dai.address },
                { swapProtocol: 1, pool: renbtcAddress, fromCoin: dai.address, toCoin: weth.address }
            ] as Route,
            usdcWethRoute
        ];

        await expect(exchange.createInternalMajorRoutes(routes)).to.be.revertedWith("Exchange: route is loop");
    })

    it("Should not create major route (swap protocol id is 0 in middle)", async () => {
        const routes = [
            usdcDaiRoute,
            [
                { swapProtocol: 1, pool: renbtcAddress, fromCoin: weth.address, toCoin: usdt.address },
                { swapProtocol: 0, pool: fraxPoolAddress, fromCoin: usdt.address, toCoin: dai.address },
            ] as Route,
            usdcWethRoute
        ];

        await expect(exchange.createInternalMajorRoutes(routes)).to.be.revertedWith("Exchange: protocol type !set");
    })

    it("Should not create major route (swap protocol id is 0 at first element)", async () => {
        const routes = [
            usdcDaiRoute,
            [
                { swapProtocol: 0, pool: renbtcAddress, fromCoin: weth.address, toCoin: usdt.address },
                { swapProtocol: 1, pool: fraxPoolAddress, fromCoin: usdt.address, toCoin: dai.address },
            ] as Route,
            usdcWethRoute
        ];

        await expect(exchange.createInternalMajorRoutes(routes)).to.be.revertedWith("Exchange: protocol type !set");
    })


    it("Should not create major route (edge is loop in middle)", async () => {
        const routes = [
            usdcDaiRoute,
            [
                { swapProtocol: 1, pool: renbtcAddress, fromCoin: weth.address, toCoin: usdt.address },
                { swapProtocol: 1, pool: fraxPoolAddress, fromCoin: usdt.address, toCoin: usdt.address },
            ] as Route,
            usdcWethRoute
        ];

        await expect(exchange.createInternalMajorRoutes(routes)).to.be.revertedWith("Exchange: edge is loop");
    })

    it("Should not create major route (edge is loop at first element)", async () => {
        const routes = [
            usdcDaiRoute,
            [
                { swapProtocol: 1, pool: renbtcAddress, fromCoin: weth.address, toCoin: weth.address },
                { swapProtocol: 1, pool: fraxPoolAddress, fromCoin: usdt.address, toCoin: dai.address },
            ] as Route,
            usdcWethRoute
        ];

        await expect(exchange.createInternalMajorRoutes(routes)).to.be.revertedWith("Exchange: edge is loop");
    })

    it("Should not create major route (route broken)", async () => {
        const routes = [
            usdcDaiRoute,
            [
                { swapProtocol: 1, pool: renbtcAddress, fromCoin: weth.address, toCoin: usdt.address },
                { swapProtocol: 1, pool: fraxPoolAddress, fromCoin: usdc.address, toCoin: dai.address },
            ] as Route,
            usdcWethRoute
        ];

        await expect(exchange.createInternalMajorRoutes(routes)).to.be.revertedWith("Exchange: route broken");
    })

    it("Should not build major-major route (major-major path not found)", async () => {
        const routes: Route[] = [
            wethUsdtRoute
        ];

        await exchange.createInternalMajorRoutes(routes);

        await expect(exchange.buildRoute(usdt.address, weth.address)).to.be.revertedWith("Exchange: 1!path from major coin");
    })

    it("Should not build minor-major route (minor edge not found)", async () => {
        const routes: Route[] = [
            wethUsdtRoute
        ];

        await exchange.createInternalMajorRoutes(routes);

        await expect(exchange.buildRoute(dai.address, weth.address)).to.be.revertedWith("Exchange: 2!path from input coin");
    })

    it("Should not build minor-major route (major-major path not found)", async () => {
        const routes: Route[] = [
            usdtDaiRoute
        ];
        const edges: Edge[] = [crvEdge];

        await exchange.createInternalMajorRoutes(routes);
        await exchange.createMinorCoinEdge(edges);

        await expect(exchange.buildRoute(crv.address, dai.address)).to.be.revertedWith("Exchange: 2!path from major coin");
    })

    it("Should not build major-minor route (minor edge not found)", async () => {
        const routes: Route[] = [
            wethUsdtRoute
        ];

        await exchange.createInternalMajorRoutes(routes);

        await expect(exchange.buildRoute(usdt.address, cvx.address)).to.be.revertedWith("Exchange: 3!path from input coin");
    })

    it("Should not build major-minor route (major-major path not found)", async () => {
        const routes: Route[] = [
            wethUsdtRoute
        ];
        const edges: Edge[] = [crvEdge];

        await exchange.createMinorCoinEdge(edges);
        await exchange.createInternalMajorRoutes(routes);

        await expect(exchange.buildRoute(usdt.address, crv.address)).to.be.revertedWith("Exchange: 3!path from major coin");
    })

    it("Should not build minor-minor route (source coin edge not found)", async () => {
        const edges: Edge[] = [crvEdge];

        await exchange.createMinorCoinEdge(edges);

        await expect(exchange.buildRoute(cvx.address, crv.address)).to.be.revertedWith("Exchange: 4!path from input coin");
    })

    it("Should not build minor-minor route (destination coin edge not found)", async () => {
        const edges: Edge[] = [crvEdge];

        await exchange.createMinorCoinEdge(edges);

        await expect(exchange.buildRoute(crv.address, cvx.address)).to.be.revertedWith("Exchange: 4!path from out coin");
    })

    it("Should not build minor-minor route (major-major path not found)", async () => {
        const edges: Edge[] = [crvEdge, shibEdge];

        await exchange.createMinorCoinEdge(edges);

        await expect(exchange.buildRoute(crv.address, shib.address)).to.be.revertedWith("Exchange: 4!path from major coin");
    })

    it("Should execute exchange", async () => {
        const routes: Route[] = [
            daiFraxRoute
        ];
        const amount = parseUnits("10.0", 18);

        expect(amount.lte(await dai.balanceOf(investor.address))).to.be.true;

        await exchange.createInternalMajorRoutes(routes);

        const FraxAdapter = await ethers.getContractFactory("CurveFraxAdapter");
        const fraxAdapter = await FraxAdapter.deploy();

        await exchange.registerAdapters([fraxAdapter.address], [1]);

        await dai.connect(investor).approve(exchange.address, uint256MaxValue);

        console.log("given amount of dai to swap:", formatUnits(amount, 18));
        await exchange.connect(investor).exchange(dai.address, frax.address, amount, 0);
        console.log("frax balance:", formatUnits(await frax.balanceOf(investor.address)));
    })

    it("Should not execute exchange (from == to)", async () => {
        const amount = parseUnits("10.0", 18);

        await expect(exchange.exchange(dai.address, dai.address, amount, 0)).to.be.revertedWith("Exchange: from == to");
    });

    it("Should not execute exchange (tight slippage)", async () => {
        const routes: Route[] = [
            daiUsdcRoute
        ];
        const amount = parseUnits("10.0", 18);
        const minAmount = parseUnits("11.0", 6);

        expect(amount.lte(await dai.balanceOf(investor.address))).to.be.true;

        await exchange.createInternalMajorRoutes(routes);

        const FraxAdapter = await ethers.getContractFactory("CurveFraxAdapter");
        const fraxAdapter = await FraxAdapter.deploy();

        await exchange.registerAdapters([fraxAdapter.address], [1]);

        await dai.connect(investor).approve(exchange.address, uint256MaxValue);

        await expect(exchange.connect(investor).exchange(dai.address, usdc.address, amount, minAmount)).to.be.revertedWith("Exchange: slippage");
    });

    it("Should not execute exchange (native to native exchange)", async () => {
        const amount = parseUnits("10.0", 18);

        await expect(exchange.exchange(nativeEth, zeroAddr, amount, 0)).to.be.revertedWith("Exchange: ETH to ETH");
        await expect(exchange.exchange(zeroAddr, nativeEth, amount, 0)).to.be.revertedWith("Exchange: ETH to ETH");
    });

    it("Should unregister adapters", async () => {
        const FraxAdapter = await ethers.getContractFactory("CurveFraxAdapter");
        const fraxAdapter = await FraxAdapter.deploy();

        await exchange.registerAdapters([fraxAdapter.address], [1]);

        expect(await exchange.adapters(1)).to.be.equal(fraxAdapter.address);

        await exchange.unregisterAdapters([1]);

        expect(await exchange.adapters(1)).to.be.equal(zeroAddr);
    });

    it("Should delete minor coin edge", async () => {
        const edges: Edge[] = [crvEdge, shibEdge];

        await exchange.createMinorCoinEdge(edges);

        expect((await exchange.minorCoins(crv.address)).swapProtocol).to.not.be.equal(0);
        expect((await exchange.minorCoins(shib.address)).swapProtocol).to.not.be.equal(0);

        await exchange.deleteMinorCoinEdge([crv.address, shib.address]);

        expect((await exchange.minorCoins(crv.address)).swapProtocol).to.be.equal(0);
        expect((await exchange.minorCoins(shib.address)).swapProtocol).to.be.equal(0);
    });

    it("Should delete internal major routes", async () => {
        const routes: Route[] = [
            daiUsdcRoute, usdtWethRoute
        ];

        await exchange.createInternalMajorRoutes(routes);
        expect((await exchange.getMajorRoute(dai.address, usdc.address)).length).to.be.gt(0);

        await exchange.deleteInternalMajorRoutes([dai.address], [usdc.address], true);
        expect((await exchange.getMajorRoute(dai.address, usdc.address)).length).to.be.equal(0);

        expect(await exchange.isMajorCoin(dai.address)).to.be.false;
        expect(await exchange.isMajorCoin(usdc.address)).to.be.false;

        await exchange.deleteInternalMajorRoutes([usdt.address], [weth.address], false);
        expect((await exchange.getMajorRoute(usdt.address, weth.address)).length).to.be.equal(0);

        expect(await exchange.isMajorCoin(usdt.address)).to.be.true;
        expect(await exchange.isMajorCoin(weth.address)).to.be.true;
    });

    it("Should not delete internal major routes (different array length)", async () => {
        const tx = exchange.deleteInternalMajorRoutes([dai.address, crv.address], [weth.address], false);

        await expect(tx).to.be.revertedWith("Exchange: length discrep");
    });

    it("Should remove approval", async () => {
        const route = daiWethRoute;

        await exchange.createInternalMajorRoutes([route]);

        expect(await dai.allowance(exchange.address, daiWethRoute[0].pool)).to.be.equal(uint256MaxValue);
        expect(await usdt.allowance(exchange.address, daiWethRoute[1].pool)).to.be.equal(uint256MaxValue);

        await exchange.removeApproval([dai.address, usdt.address], [daiWethRoute[0].pool, daiWethRoute[1].pool]);

        expect(await dai.allowance(exchange.address, daiWethRoute[0].pool)).to.be.equal(0);
        expect(await usdt.allowance(exchange.address, daiWethRoute[1].pool)).to.be.equal(0);
    });

    it("Should not remove approval (different array length)", async () => {
        const tx = exchange.removeApproval([dai.address, crv.address], [renbtcAddress]);

        await expect(tx).to.be.revertedWith("Exchange: length discrep");
    });

    it("Should register adapters (different array length)", async () => {
        const tx = exchange.registerAdapters([dai.address, crv.address], [1]);

        await expect(tx).to.be.revertedWith("Exchange: length discrep");
    });

    it("Should enable LP token swap", async () => {
        await exchange.createLpToken(
            [{ swapProtocol: 1, pool: fraxPoolAddress }],
            [fraxPoolAddress],
            [[dai.address, usdc.address, usdt.address]]);
    })

    it("Should not enable LP token swap (different array length)", async () => {
        const tx = exchange.createLpToken(
            [{ swapProtocol: 1, pool: fraxPoolAddress }],
            [fraxPoolAddress, fraxPoolAddress],
            [[dai.address, usdc.address, usdt.address], [], []]);

        await expect(tx).to.be.revertedWith("Exchange: length discrep");
    })

    it("Should not enable LP token swap (protocol type not set)", async () => {
        const tx = exchange.createLpToken(
            [{ swapProtocol: 0, pool: fraxPoolAddress }],
            [fraxPoolAddress],
            [[dai.address, usdc.address, usdt.address]]);

        await expect(tx).to.be.revertedWith("Exchange: protocol type !set");
    })

    it("Should create approval (different array length)", async () => {
        const tx = exchange.createApproval(
            [dai.address, usdc.address],
            [fraxPoolAddress]
        );

        await expect(tx).to.be.revertedWith("Exchange: length discrep");
    })

    it("Should enable LP token swap (approval test)", async () => {
        expect(await dai.allowance(exchange.address, fraxPoolAddress)).to.be.equal(0);
        expect(await usdc.allowance(exchange.address, fraxPoolAddress)).to.be.equal(0);
        expect(await usdt.allowance(exchange.address, fraxPoolAddress)).to.be.equal(0);

        expect(await exchange.approveCompleted(fraxPoolAddress, dai.address)).to.be.false;
        expect(await exchange.approveCompleted(fraxPoolAddress, usdc.address)).to.be.false;
        expect(await exchange.approveCompleted(fraxPoolAddress, usdt.address)).to.be.false;

        const tx1 = await exchange.createLpToken(
            [{ swapProtocol: 1, pool: fraxPoolAddress }],
            [fraxPoolAddress],
            [[dai.address, usdc.address, usdt.address]]);

        expect(await dai.allowance(exchange.address, fraxPoolAddress)).to.be.equal(uint256MaxValue);
        expect(await usdc.allowance(exchange.address, fraxPoolAddress)).to.be.equal(uint256MaxValue);
        expect(await usdt.allowance(exchange.address, fraxPoolAddress)).to.be.equal(uint256MaxValue);

        expect(await exchange.approveCompleted(fraxPoolAddress, dai.address)).to.be.true;
        expect(await exchange.approveCompleted(fraxPoolAddress, usdc.address)).to.be.true;
        expect(await exchange.approveCompleted(fraxPoolAddress, usdt.address)).to.be.true;

        expect(tx1).to.emit(dai, "Approval").withArgs(exchange.address, fraxPoolAddress, uint256MaxValue);
        expect(tx1).to.emit(usdc, "Approval").withArgs(exchange.address, fraxPoolAddress, uint256MaxValue);
        expect(tx1).to.emit(usdt, "Approval").withArgs(exchange.address, fraxPoolAddress, uint256MaxValue);


        const tx2 = await exchange.createLpToken(
            [{ swapProtocol: 1, pool: fraxPoolAddress }],
            [fraxPoolAddress],
            [[dai.address, usdc.address, usdt.address]]);

        expect(tx2).to.not.emit(dai, "Approval");
        expect(tx2).to.not.emit(usdc, "Approval");
        expect(tx2).to.not.emit(usdt, "Approval");

    })

    it("Should disable LP token swap", async () => {
        await exchange.createLpToken(
            [{ swapProtocol: 1, pool: fraxPoolAddress }],
            [fraxPoolAddress],
            [[dai.address, usdc.address, usdt.address]]);

        expect((await exchange.lpTokens(fraxPoolAddress)).swapProtocol).to.not.be.equal(0);

        await exchange.deleteLpToken([fraxPoolAddress]);

        expect((await exchange.lpTokens(fraxPoolAddress)).swapProtocol).to.be.equal(0);
    });

    it("Should execute DAI-LP, LP-DAI token swap", async () => {
        await exchange.createLpToken(
            [{ swapProtocol: 1, pool: fraxPoolAddress }],
            [fraxPoolAddress],
            [[dai.address, usdc.address, usdt.address, threeCrvLp.address]]);

        const amount = parseUnits("10.0", 18);

        expect(amount.lte(await dai.balanceOf(investor.address))).to.be.true;

        const FraxAdapter = await ethers.getContractFactory("CurveFraxAdapter");
        const fraxAdapter = await FraxAdapter.deploy();

        await exchange.registerAdapters([fraxAdapter.address], [1]);
        await exchange.createApproval([dai.address], ["0xbEbc44782C7dB0a1A60Cb6fe97d0b483032FF1C7"]);
        await exchange.createApproval([threeCrvLp.address], ["0xbEbc44782C7dB0a1A60Cb6fe97d0b483032FF1C7"]);

        await dai.connect(investor).approve(exchange.address, uint256MaxValue);
        await fraxPoolLp.connect(investor).approve(exchange.address, uint256MaxValue);

        console.log("given amount of dai to swap:", formatUnits(amount, 18));
        await exchange.connect(investor).exchange(dai.address, fraxPoolLp.address, amount, 0);
        console.log("fraxLP balance:", formatUnits(await fraxPoolLp.balanceOf(investor.address)));

        const daiBalanceBefore = await dai.balanceOf(investor.address);
        await exchange.connect(investor).exchange(fraxPoolLp.address, dai.address, await fraxPoolLp.balanceOf(investor.address), 0);
        console.log("got dai from all lps:", formatUnits((await dai.balanceOf(investor.address)).sub(daiBalanceBefore)));
    });

    it("Should not execute DAI-LP, LP-DAI token swap (tight slippage)", async () => {
        await exchange.createLpToken(
            [{ swapProtocol: 1, pool: fraxPoolAddress }],
            [fraxPoolAddress],
            [[dai.address, usdc.address, usdt.address, threeCrvLp.address]]);

        const amount = parseUnits("10.0", 18);
        const tightAmount = parseUnits("11.0", 18);

        expect(amount.lte(await dai.balanceOf(investor.address))).to.be.true;

        const FraxAdapter = await ethers.getContractFactory("CurveFraxAdapter");
        const fraxAdapter = await FraxAdapter.deploy();

        await exchange.registerAdapters([fraxAdapter.address], [1]);
        await exchange.createApproval([dai.address], ["0xbEbc44782C7dB0a1A60Cb6fe97d0b483032FF1C7"]);
        await exchange.createApproval([threeCrvLp.address], ["0xbEbc44782C7dB0a1A60Cb6fe97d0b483032FF1C7"]);

        await dai.connect(investor).approve(exchange.address, uint256MaxValue);
        await fraxPoolLp.connect(investor).approve(exchange.address, uint256MaxValue);

        const tx1 = exchange.connect(investor).exchange(dai.address, fraxPoolLp.address, amount, tightAmount);
        await expect(tx1).to.be.revertedWith("Exchange: slippage");
        await exchange.connect(investor).exchange(dai.address, fraxPoolLp.address, amount, 0);

        const tx2 = exchange.connect(investor).exchange(fraxPoolLp.address, dai.address, await fraxPoolLp.balanceOf(investor.address), tightAmount);
        await expect(tx2).to.be.revertedWith("Exchange: slippage");
    });

    it("Should enter liquidity pool directly without 3crv token", async () => {
        const routes: Route[] = [
            daiFraxRoute
        ];
        const amount = parseUnits("10.0", 18);

        await exchange.createInternalMajorRoutes(routes);

        const FraxAdapter = await ethers.getContractFactory("CurveFraxAdapter");
        const fraxAdapter = await FraxAdapter.deploy();

        await exchange.registerAdapters([fraxAdapter.address], [1]);

        await exchange.createLpToken(
            [{ swapProtocol: 1, pool: fraxPoolAddress }],
            [fraxPoolAddress],
            [[dai.address, usdc.address, usdt.address, threeCrvLp.address, frax.address]]);

        await dai.connect(investor).approve(exchange.address, uint256MaxValue);
        await frax.connect(investor).approve(exchange.address, uint256MaxValue);
        await fraxPoolLp.connect(investor).approve(exchange.address, uint256MaxValue);

        console.log("given amount of dai to swap:", formatUnits(amount, 18));
        await exchange.connect(investor).exchange(dai.address, frax.address, amount, 0);
        console.log("frax balance:", formatUnits(await frax.balanceOf(investor.address)));

        await exchange.connect(investor).exchange(frax.address, fraxPoolLp.address, await frax.balanceOf(investor.address), 0);
        console.log("fraxPoolLp balance:", formatUnits(await fraxPoolLp.balanceOf(investor.address)));

        await exchange.connect(investor).exchange(fraxPoolLp.address, frax.address, await fraxPoolLp.balanceOf(investor.address), 0);
        console.log("frax balance:", formatUnits(await frax.balanceOf(investor.address)));
    })

    it("Should not enter liquidity (wrong entry coin)", async () => {
        const routes: Route[] = [
            daiFraxRoute
        ];
        const amount = parseUnits("10.0", 18);

        await exchange.createInternalMajorRoutes(routes);

        const FraxAdapter = await ethers.getContractFactory("CurveFraxAdapter");
        const fraxAdapter = await FraxAdapter.deploy();

        await exchange.registerAdapters([fraxAdapter.address], [1]);

        await exchange.createLpToken(
            [{ swapProtocol: 1, pool: fraxPoolAddress }],
            [fraxPoolAddress],
            [[dai.address, usdc.address, usdt.address, threeCrvLp.address, frax.address]]);

        await dai.connect(investor).approve(exchange.address, uint256MaxValue);
        await frax.connect(investor).approve(exchange.address, uint256MaxValue);
        await fraxPoolLp.connect(investor).approve(exchange.address, uint256MaxValue);
        await weth.connect(investor).approve(exchange.address, uint256MaxValue);

        await exchange.connect(investor).exchange(dai.address, frax.address, amount, 0);

        await signers[0].sendTransaction({
            to: investor.address,
            value: parseEther("100.0")
        })
        await weth.connect(investor).deposit({ value: parseEther("10.0") });

        const tx1 = exchange.connect(investor).exchange(weth.address, fraxPoolLp.address, parseEther("1.0"), 0);
        await expect(tx1).to.be.revertedWith("CrvFraxAdapter: can't enter");

        await exchange.connect(investor).exchange(frax.address, fraxPoolLp.address, await frax.balanceOf(investor.address), 0);

        const tx2 = exchange.connect(investor).exchange(fraxPoolLp.address, weth.address, await fraxPoolLp.balanceOf(investor.address), 0);
        await expect(tx2).to.be.revertedWith("CrvFraxAdapter: can't exit");
    });

    it("Should execute swap from native ether", async () => {
        const routes: Route[] = [
            wethUsdtRoute, usdcWethRoute
        ];
        const amount = parseEther("10.0");

        await exchange.createInternalMajorRoutes(routes);

        const Adapter = await ethers.getContractFactory("Curve3CryptoAdapter");
        const adapter = await Adapter.deploy();
        await exchange.registerAdapters([adapter.address], [2]);

        await exchange.exchange(zeroAddr, usdt.address, amount, 0, { value: amount });
        console.log("usdt amount from 10 eth:", formatUnits(await usdt.balanceOf(signers[0].address), 6));
    });

    it("Should not execute swap from native ether (incorrect amount&value)", async () => {
        const routes: Route[] = [
            wethUsdtRoute, usdcWethRoute
        ];
        const amount = parseEther("10.0");

        await exchange.createInternalMajorRoutes(routes);

        const Adapter = await ethers.getContractFactory("Curve3CryptoAdapter");
        const adapter = await Adapter.deploy();

        await exchange.registerAdapters([adapter.address], [2]);

        const tx = exchange.exchange(zeroAddr, usdt.address, amount, 0, { value: amount.sub(1) });

        await expect(tx).to.be.revertedWith("Exchange: value/amount discrep");
    });

    it("Should not execute swap from native ether (tight slippage)", async () => {
        const routes: Route[] = [
            wethUsdtRoute, usdcWethRoute
        ];
        const amount = parseEther("10.0");

        await exchange.createInternalMajorRoutes(routes);

        const Adapter = await ethers.getContractFactory("Curve3CryptoAdapter");
        const adapter = await Adapter.deploy();
        await exchange.registerAdapters([adapter.address], [2]);

        const tx = exchange.exchange(zeroAddr, usdt.address, amount, uint256MaxValue, { value: amount });

        await expect(tx).to.be.revertedWith("Exchange: slippage");
    });

    it("Should execute swap to native ether", async () => {
        const routes: Route[] = [
            daiWethRoute
        ];
        const amount = parseUnits("3500.0", 18);

        await exchange.createInternalMajorRoutes(routes);

        const Adapter1 = await ethers.getContractFactory("Curve3CryptoAdapter");
        const adapter1 = await Adapter1.deploy();

        const Adapter2 = await ethers.getContractFactory("CurveFraxAdapter");
        const adapter2 = await Adapter2.deploy();

        await exchange.registerAdapters([adapter1.address, adapter2.address], [2, 1]);

        await dai.connect(investor).approve(exchange.address, uint256MaxValue);

        const ethBalanceBefore = await investor.getBalance();
        await exchange.connect(investor).exchange(dai.address, zeroAddr, amount, 0);
        console.log("ETH amount from 3500 usdt:", formatEther((await investor.getBalance()).sub(ethBalanceBefore)));
    });

    it("Should not execute swap to native ether (tight slippage)", async () => {
        const routes: Route[] = [
            daiWethRoute
        ];
        const amount = parseUnits("10.0", 18);

        await exchange.createInternalMajorRoutes(routes);

        const Adapter1 = await ethers.getContractFactory("Curve3CryptoAdapter");
        const adapter1 = await Adapter1.deploy();

        const Adapter2 = await ethers.getContractFactory("CurveFraxAdapter");
        const adapter2 = await Adapter2.deploy();

        await exchange.registerAdapters([adapter1.address, adapter2.address], [2, 1]);

        await dai.connect(investor).approve(exchange.address, uint256MaxValue);

        const tx = exchange.connect(investor).exchange(dai.address, zeroAddr, amount, uint256MaxValue);

        await expect(tx).to.be.revertedWith("Exchange: slippage");
    });

    it("Should not make exchange (adapter is missing)", async () => {
        const routes: Route[] = [
            wethUsdtRoute, usdcWethRoute
        ];
        const amount = parseEther("10.0");

        await exchange.createInternalMajorRoutes(routes);

        const tx = exchange.exchange(zeroAddr, usdt.address, amount, 0, { value: amount });
        await expect(tx).to.be.revertedWith("Exchange: adapter not found");
    });

    it("Should not enter liquidity pool (adapter is missing)", async () => {
        await exchange.createLpToken(
            [{ swapProtocol: 1, pool: fraxPoolAddress }],
            [fraxPoolAddress],
            [[dai.address, usdc.address, usdt.address, threeCrvLp.address]]);
        const amount = parseUnits("10.0", 18);
        await exchange.createApproval([dai.address], ["0xbEbc44782C7dB0a1A60Cb6fe97d0b483032FF1C7"]);
        await exchange.createApproval([threeCrvLp.address], ["0xbEbc44782C7dB0a1A60Cb6fe97d0b483032FF1C7"]);

        await dai.connect(investor).approve(exchange.address, uint256MaxValue);
        await fraxPoolLp.connect(investor).approve(exchange.address, uint256MaxValue);

        const tx = exchange.connect(investor).exchange(dai.address, fraxPoolLp.address, amount, 0);
        await expect(tx).to.be.revertedWith("Exchange: adapter not found");
    });

    it("Should not exit liquidity pool (adapter is missing)", async () => {
        await exchange.createLpToken(
            [{ swapProtocol: 1, pool: fraxPoolAddress }],
            [fraxPoolAddress],
            [[dai.address, usdc.address, usdt.address, threeCrvLp.address]]);
        const amount = parseUnits("10.0", 18);

        const FraxAdapter = await ethers.getContractFactory("CurveFraxAdapter");
        const fraxAdapter = await FraxAdapter.deploy();

        await exchange.registerAdapters([fraxAdapter.address], [1]);
        await exchange.createApproval([dai.address], ["0xbEbc44782C7dB0a1A60Cb6fe97d0b483032FF1C7"]);
        await exchange.createApproval([threeCrvLp.address], ["0xbEbc44782C7dB0a1A60Cb6fe97d0b483032FF1C7"]);

        await dai.connect(investor).approve(exchange.address, uint256MaxValue);
        await fraxPoolLp.connect(investor).approve(exchange.address, uint256MaxValue);

        await exchange.connect(investor).exchange(dai.address, fraxPoolLp.address, amount, 0);

        await exchange.unregisterAdapters([1]);
        const tx = exchange.connect(investor).exchange(fraxPoolLp.address, dai.address, await fraxPoolLp.balanceOf(investor.address), 0);
        await expect(tx).to.be.revertedWith("Exchange: adapter not found");
    });

    it("Should enter/exit 3crypto", async () => {
        await exchange.createLpToken(
            [{ swapProtocol: 2, pool: renbtcAddress }],
            [crv3CryptoLp.address],
            [[weth.address, usdt.address, crv3CryptoLp.address]]);

        const amount = parseEther("1.0");
        await weth.deposit({ value: amount });

        const Adapter1 = await ethers.getContractFactory("Curve3CryptoAdapter");
        const adapter1 = await Adapter1.deploy();

        await exchange.registerAdapters([adapter1.address], [2]);

        await weth.approve(exchange.address, uint256MaxValue);
        await crv3CryptoLp.approve(exchange.address, uint256MaxValue);

        await exchange.exchange(weth.address, crv3CryptoLp.address, await weth.balanceOf(signers[0].address), 0);
        await exchange.exchange(crv3CryptoLp.address, weth.address, await crv3CryptoLp.balanceOf(signers[0].address), 0);
    })

    it("Should not deploy contract (admin address is not contract)", async () => {
        const Exchange = await ethers.getContractFactory("Exchange");
        const tx = Exchange.deploy(signers[1].address, true);
        await expect(tx).to.be.revertedWith("Exchange: not contract");
    });

    it("Should check roles after deployment", async () => {
        const Exchange = await ethers.getContractFactory("Exchange");
        const exchangeTest = await Exchange.deploy(dai.address, true);

        expect(await exchangeTest.hasRole(await exchange.DEFAULT_ADMIN_ROLE(), dai.address)).to.be.true;
        expect(await exchangeTest.hasRole(await exchange.DEFAULT_ADMIN_ROLE(), signers[0].address)).to.be.true;

        const exchangeNotTest = await Exchange.deploy(dai.address, false);
        expect(await exchangeNotTest.hasRole(await exchange.DEFAULT_ADMIN_ROLE(), dai.address)).to.be.true;
        expect(await exchangeNotTest.hasRole(await exchange.DEFAULT_ADMIN_ROLE(), signers[0].address)).to.be.false;
    });

    it("Should grant role to contract", async () => {
        await exchange.grantRole(await exchange.DEFAULT_ADMIN_ROLE(), usdc.address);
    });

    it("Should not grant role to non-contract", async () => {
        await expect(exchange.grantRole(await exchange.DEFAULT_ADMIN_ROLE(), signers[1].address)).to.be.revertedWith("Exchange: not contract");
    });

    it("Should correctly overwrite major routes", async () => {
        const wrongRoute: Route = [
            // WETH - USDT - FRAX
            { swapProtocol: 1, pool: fraxPoolAddress, fromCoin: weth.address, toCoin: usdt.address },
            { swapProtocol: 1, pool: fraxPoolAddress, fromCoin: usdt.address, toCoin: frax.address },
        ];

        const correctRoute: Route = [
            // WETH - USDT - FRAX
            { swapProtocol: 2, pool: renbtcAddress, fromCoin: weth.address, toCoin: usdt.address },
            { swapProtocol: 1, pool: fraxPoolAddress, fromCoin: usdt.address, toCoin: frax.address },
        ];

        const amount = parseEther("1.0");

        await exchange.createInternalMajorRoutes([wrongRoute]);

        const ThreeCrypto = await ethers.getContractFactory("Curve3CryptoAdapter");
        const Frax = await ethers.getContractFactory("CurveFraxAdapter");

        const threeCrypto = await ThreeCrypto.deploy();
        const fraxAdapter = await Frax.deploy();

        await exchange.registerAdapters([fraxAdapter.address, threeCrypto.address], [1, 2]);

        await expect(exchange.exchange(zeroAddr, frax.address, amount, 0, { value: amount })).to.be.revertedWith("CurveFraxAdapter: can't swap");

        await exchange.createInternalMajorRoutes([correctRoute]);

        await exchange.exchange(zeroAddr, frax.address, amount, 0, { value: amount });
    });
});