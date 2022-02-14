import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { POINT_CONVERSION_UNCOMPRESSED } from "constants";
import { BigNumberish } from "ethers";
import { ethers } from "hardhat";
import { Exchange, IERC20 } from "../typechain";

describe("Exchange", async () => {
    type Edge = {
        swapProtocol: BigNumberish;
        pool: string;
        fromCoin: string;
        toCoin: string;
    };
    type Route = Edge[];

    let signers: SignerWithAddress[];
    let exchange: Exchange, weth: IERC20, usdt: IERC20, usdc: IERC20,
        dai: IERC20, cvx: IERC20, crv: IERC20, shib: IERC20;

    let wethUsdtRoute: Route, wethUsdcRoute: Route, wethDaiRoute: Route, usdtWethRoute: Route, usdtUsdcRoute: Route, usdtDaiRoute: Route,
        usdcWethRoute: Route, usdcUsdtRoute: Route, usdcDaiRoute: Route, daiUsdcRoute: Route, daiUsdtRoute: Route, daiWethRoute: Route

    let cvxEdge: Edge, crvEdge: Edge, shibEdge: Edge;

    const renbtcAddress = "0xD51a44d3FaE010294C616388b506AcdA1bfAAE46";
    const threeCrvAddress = "0xbEbc44782C7dB0a1A60Cb6fe97d0b483032FF1C7";
    const cvxCurvePool = "0xB576491F1E6e5E62f1d8F26062Ee822B40B0E0d4";
    const crvUnipool = "0x4c83A7f819A5c37D64B4c5A2f8238Ea082fA1f4e";
    const uint256MaxValue = "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff";


    function initializeRoutes() {
        wethUsdtRoute = [
            { swapProtocol: 1, pool: renbtcAddress, fromCoin: weth.address, toCoin: usdt.address }
        ];
        wethUsdcRoute = [
            { swapProtocol: 1, pool: renbtcAddress, fromCoin: weth.address, toCoin: usdt.address },
            { swapProtocol: 1, pool: threeCrvAddress, fromCoin: usdt.address, toCoin: usdc.address }
        ];
        wethDaiRoute = [
            { swapProtocol: 1, pool: renbtcAddress, fromCoin: weth.address, toCoin: usdt.address },
            { swapProtocol: 1, pool: threeCrvAddress, fromCoin: usdt.address, toCoin: dai.address }
        ];
        usdtWethRoute = [
            // USDT - WETH
            { swapProtocol: 1, pool: renbtcAddress, fromCoin: usdt.address, toCoin: weth.address }
        ];
        usdtUsdcRoute = [
            // USDT - USDC
            { swapProtocol: 1, pool: threeCrvAddress, fromCoin: usdt.address, toCoin: usdc.address }
        ]
        usdtDaiRoute = [
            // USDT - DAI
            { swapProtocol: 1, pool: threeCrvAddress, fromCoin: usdt.address, toCoin: dai.address }
        ]
        usdcWethRoute = [
            // USDC - USDT - WETH
            { swapProtocol: 1, pool: threeCrvAddress, fromCoin: usdc.address, toCoin: usdt.address },
            { swapProtocol: 1, pool: renbtcAddress, fromCoin: usdt.address, toCoin: weth.address }
        ];
        usdcUsdtRoute = [
            // USDC - USDT
            { swapProtocol: 1, pool: threeCrvAddress, fromCoin: usdc.address, toCoin: usdt.address }
        ];
        usdcDaiRoute = [
            // USDC - DAI
            { swapProtocol: 1, pool: threeCrvAddress, fromCoin: usdc.address, toCoin: dai.address }
        ];
        daiUsdcRoute = [
            // DAI - USDC
            { swapProtocol: 1, pool: threeCrvAddress, fromCoin: dai.address, toCoin: usdc.address }
        ];
        daiUsdtRoute = [
            // DAI - USDT
            { swapProtocol: 1, pool: threeCrvAddress, fromCoin: dai.address, toCoin: usdt.address }
        ];
        daiWethRoute = [
            // DAI - USDT - WETH
            { swapProtocol: 1, pool: threeCrvAddress, fromCoin: dai.address, toCoin: usdt.address },
            { swapProtocol: 1, pool: renbtcAddress, fromCoin: usdt.address, toCoin: weth.address },
        ];

        cvxEdge = { swapProtocol: 1, pool: cvxCurvePool, fromCoin: cvx.address, toCoin: weth.address };
        crvEdge = { swapProtocol: 2, pool: crvUnipool, fromCoin: crv.address, toCoin: weth.address };
        // NEXT ONE IS FAKE - linking SHIB-DAI is done only for testing complex route!
        shibEdge = { swapProtocol: 2, pool: crvUnipool, fromCoin: shib.address, toCoin: dai.address };

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
        signers = await ethers.getSigners();

        weth = await ethers.getContractAt("IERC20", "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2");
        usdt = await ethers.getContractAt("IERC20", "0xdAC17F958D2ee523a2206206994597C13D831ec7");
        usdc = await ethers.getContractAt("IERC20", "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48");
        dai = await ethers.getContractAt("IERC20", "0x6B175474E89094C44Da98b954EedeAC495271d0F");
        cvx = await ethers.getContractAt("IERC20", "0x4e3FBD56CD56c3e72c1403e103b45Db9da5B9D2B");
        crv = await ethers.getContractAt("IERC20", "0xD533a949740bb3306d119CC777fa900bA034cd52");
        shib = await ethers.getContractAt("IERC20", "0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE");

        initializeRoutes();
    });

    beforeEach(async () => {
        const Exchange = await ethers.getContractFactory("Exchange");
        exchange = await Exchange.deploy();
    });

    it("Should build correct routes", async () => {
        const routes: Route[] = [
            wethUsdtRoute, wethUsdcRoute, wethDaiRoute, usdtWethRoute, usdtUsdcRoute, usdtDaiRoute,
            usdcWethRoute, usdcUsdtRoute, usdcDaiRoute, daiUsdcRoute, daiUsdtRoute, daiWethRoute
        ];
        const edges: Edge[] = [cvxEdge, crvEdge, shibEdge];

        await exchange.createInternalMajorRoutes(routes);
        await exchange.createMinorCoinEdge(edges);

        expect(await exchange.isMajorCoin(weth.address)).to.be.true;
        expect(await exchange.isMajorCoin(usdc.address)).to.be.true;
        expect(await exchange.isMajorCoin(usdt.address)).to.be.true;
        expect(await exchange.isMajorCoin(dai.address)).to.be.true;

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
            { swapProtocol: 1, pool: threeCrvAddress, fromCoin: dai.address, toCoin: usdc.address },
            { swapProtocol: 0, pool: threeCrvAddress, fromCoin: dai.address, toCoin: usdc.address },
            { swapProtocol: 1, pool: threeCrvAddress, fromCoin: dai.address, toCoin: usdc.address },
        ];

        await expect(exchange.createMinorCoinEdge(edges)).to.be.revertedWith("Exchange: protocol type !set");
    })

    it("Should not create minor coin edge (loop)", async () => {
        const edges = [
            { swapProtocol: 1, pool: threeCrvAddress, fromCoin: dai.address, toCoin: usdc.address },
            { swapProtocol: 1, pool: threeCrvAddress, fromCoin: dai.address, toCoin: dai.address },
            { swapProtocol: 1, pool: threeCrvAddress, fromCoin: dai.address, toCoin: usdc.address },
        ];

        await expect(exchange.createMinorCoinEdge(edges)).to.be.revertedWith("Exchange: edge is loop");
    })

    it("Should create minor coin edge (approval test)", async () => {
        const edge = [
            { swapProtocol: 1, pool: threeCrvAddress, fromCoin: dai.address, toCoin: usdc.address },
        ];
        const newEdge = [
            { swapProtocol: 2, pool: threeCrvAddress, fromCoin: dai.address, toCoin: usdc.address },
        ];

        expect(await dai.allowance(exchange.address, threeCrvAddress)).to.be.equal(0);
        expect(await usdc.allowance(exchange.address, threeCrvAddress)).to.be.equal(0);

        expect(await exchange.approveCompleted(threeCrvAddress, dai.address)).to.be.false;
        expect(await exchange.approveCompleted(threeCrvAddress, usdc.address)).to.be.false;

        const txWithApproval = await exchange.createMinorCoinEdge(edge);

        expect(txWithApproval).to.emit(dai, "Approval").withArgs(exchange.address, threeCrvAddress, uint256MaxValue);
        expect(txWithApproval).to.emit(usdc, "Approval").withArgs(exchange.address, threeCrvAddress, uint256MaxValue);

        expect(await dai.allowance(exchange.address, threeCrvAddress)).to.be.equal(uint256MaxValue);
        expect(await usdc.allowance(exchange.address, threeCrvAddress)).to.be.equal(uint256MaxValue);

        expect(await exchange.approveCompleted(threeCrvAddress, dai.address)).to.be.true;
        expect(await exchange.approveCompleted(threeCrvAddress, usdc.address)).to.be.true;

        const txWithoutApproval = await exchange.createMinorCoinEdge(newEdge);

        expect(txWithoutApproval).to.not.emit(dai, "Approval");
        expect(txWithoutApproval).to.not.emit(usdc, "Approval");
    });

    it("Should create major routes (approval test)", async () => {
        expect(await usdc.allowance(exchange.address, threeCrvAddress)).to.be.equal(0);
        expect(await usdt.allowance(exchange.address, renbtcAddress)).to.be.equal(0);
        expect(await dai.allowance(exchange.address, threeCrvAddress)).to.be.equal(0);
        expect(await exchange.approveCompleted(threeCrvAddress, dai.address)).to.be.false;
        expect(await exchange.approveCompleted(threeCrvAddress, usdc.address)).to.be.false;
        expect(await exchange.approveCompleted(renbtcAddress, usdt.address)).to.be.false;

        const tx1 = await exchange.createInternalMajorRoutes([daiWethRoute]);

        expect(await usdc.allowance(exchange.address, threeCrvAddress)).to.be.equal(0);
        expect(await usdt.allowance(exchange.address, renbtcAddress)).to.be.equal(uint256MaxValue);
        expect(await dai.allowance(exchange.address, threeCrvAddress)).to.be.equal(uint256MaxValue);

        expect(tx1).to.emit(dai, "Approval").withArgs(exchange.address, threeCrvAddress, uint256MaxValue);
        expect(tx1).to.emit(usdt, "Approval").withArgs(exchange.address, renbtcAddress, uint256MaxValue);
        expect(tx1).to.not.emit(usdc, "Approval");

        expect(await exchange.approveCompleted(threeCrvAddress, dai.address)).to.be.true;
        expect(await exchange.approveCompleted(threeCrvAddress, usdc.address)).to.be.false;
        expect(await exchange.approveCompleted(renbtcAddress, usdt.address)).to.be.true;

        const tx2 = await exchange.createInternalMajorRoutes([usdcWethRoute]);

        expect(await usdc.allowance(exchange.address, threeCrvAddress)).to.be.equal(uint256MaxValue);
        expect(await usdt.allowance(exchange.address, renbtcAddress)).to.be.equal(uint256MaxValue);
        expect(await dai.allowance(exchange.address, threeCrvAddress)).to.be.equal(uint256MaxValue);

        expect(tx2).to.not.emit(dai, "Approval");
        expect(tx2).to.not.emit(usdt, "Approval");
        expect(tx2).to.emit(usdc, "Approval").withArgs(exchange.address, threeCrvAddress, uint256MaxValue);

        expect(await exchange.approveCompleted(threeCrvAddress, dai.address)).to.be.true;
        expect(await exchange.approveCompleted(threeCrvAddress, usdc.address)).to.be.true;
        expect(await exchange.approveCompleted(renbtcAddress, usdt.address)).to.be.true;
    });

    it("Should not create major route (from and to are equal)", async () => {
        const routes = [
            usdcDaiRoute,
            [
                { swapProtocol: 1, pool: renbtcAddress, fromCoin: weth.address, toCoin: usdt.address },
                { swapProtocol: 1, pool: threeCrvAddress, fromCoin: usdt.address, toCoin: dai.address },
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
                { swapProtocol: 0, pool: threeCrvAddress, fromCoin: usdt.address, toCoin: dai.address },
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
                { swapProtocol: 1, pool: threeCrvAddress, fromCoin: usdt.address, toCoin: dai.address },
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
                { swapProtocol: 1, pool: threeCrvAddress, fromCoin: usdt.address, toCoin: usdt.address },
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
                { swapProtocol: 1, pool: threeCrvAddress, fromCoin: usdt.address, toCoin: dai.address },
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
                { swapProtocol: 1, pool: threeCrvAddress, fromCoin: usdc.address, toCoin: dai.address },
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
});