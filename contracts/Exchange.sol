// SPDX-License-Identifier: MIT
pragma solidity 0.8.11;

import "@openzeppelin/contracts/interfaces/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract Exchange {
    using SafeERC20 for IERC20;

    // struct size - 64 bytes, 2 slots
    struct RouteEdge {
        uint32 swapProtocol; // 0 - unknown edge, 1 - UniswapV2, 2 - Curve...
        address pool; // address of pool to call
        address fromCoin; // address of coin to deposit to pool
        address toCoin; // address of coin to get from pool
    }

    // returns true if address is registered as major token, false otherwise
    mapping(address => bool) public isMajorCoin;

    // returns true if pool received approve of token. First address is pool,
    // second is token
    mapping(address => mapping(address => bool)) public approveCompleted;

    // Storage of routes between major coins. Normally, any major coin should
    // have route to any other major coin that is saved here
    mapping(address => mapping(address => RouteEdge[]))
        private internalMajorRoute;

    // Storage of single edges from minor coin to major
    mapping(address => RouteEdge) public minorCoins;

    // Storage of swap execution method for different protocols
    mapping(uint256 => address) public adapters;

    /// @notice Create single edge of a route from minor coin to major
    /// @dev In order for swap from/to minor coin to be working, `toCoin` should
    /// be registered as major
    /// @param edges array of edges to store
    function createMinorCoinEdge(RouteEdge[] calldata edges) external {
        for (uint256 i = 0; i < edges.length; i++) {
            // validate protocol id - zero is interpreted as
            // non-existing route
            require(edges[i].swapProtocol != 0, "Exchange: protocol type !set");
            require(
                edges[i].fromCoin != edges[i].toCoin,
                "Exchange: edge is loop"
            );

            if (!approveCompleted[edges[i].pool][edges[i].fromCoin]) {
                IERC20(edges[i].fromCoin).safeApprove(
                    edges[i].pool,
                    type(uint256).max
                );
                approveCompleted[edges[i].pool][edges[i].fromCoin] = true;
            }

            if (!approveCompleted[edges[i].pool][edges[i].toCoin]) {
                IERC20(edges[i].toCoin).safeApprove(
                    edges[i].pool,
                    type(uint256).max
                );
                approveCompleted[edges[i].pool][edges[i].toCoin] = true;
            }

            minorCoins[edges[i].fromCoin] = edges[i];
        }
    }

    /// @notice Get prebuilt route between two major coins
    /// @param from major coin to start route from
    /// @param to major coin that should be end of route
    /// @return Prebuilt route between major coins
    function getMajorRoute(address from, address to)
        external
        view
        returns (RouteEdge[] memory)
    {
        return internalMajorRoute[from][to];
    }

    /// @notice Create route between two tokens and set them as major
    /// @param routes array of routes
    function createInternalMajorRoutes(RouteEdge[][] calldata routes) external {
        for (uint256 i = 0; i < routes.length; i++) {
            RouteEdge[] memory route = routes[i];

            // extract start and beginning of given route
            address start = route[0].fromCoin;
            address end = route[route.length - 1].toCoin;
            require(start != end, "Exchange: route is loop");

            // validate protocol id - zero is interpreted as non-existing route
            require(route[0].swapProtocol != 0, "Exchange: protocol type !set");

            // set approve of the token to the pool
            if (!approveCompleted[route[0].pool][route[0].fromCoin]) {
                IERC20(route[0].fromCoin).safeApprove(
                    route[0].pool,
                    type(uint256).max
                );
                approveCompleted[route[0].pool][route[0].fromCoin] = true;
            }

            require(
                route[0].fromCoin != route[0].toCoin,
                "Exchange: edge is loop"
            );

            // starting to save this route
            internalMajorRoute[start][end].push(route[0]);

            // if route is simple, then we've done everything for it
            if (route.length == 1) {
                // as route between these coins is set, we consider them as major
                isMajorCoin[start] = true;
                isMajorCoin[end] = true;

                continue;
            }

            // loop through whole route to check its continuity
            address node = route[0].toCoin;
            for (uint256 j = 1; j < route.length; j++) {
                require(route[j].fromCoin == node, "Exchange: route broken");
                node = route[j].toCoin;

                // validate protocol id - zero is interpreted as
                // non-existing route
                require(
                    route[j].swapProtocol != 0,
                    "Exchange: protocol type !set"
                );

                require(
                    route[j].fromCoin != route[j].toCoin,
                    "Exchange: edge is loop"
                );

                // set approve of the token to the pool
                if (!approveCompleted[route[j].pool][route[j].fromCoin]) {
                    IERC20(route[j].fromCoin).safeApprove(
                        route[j].pool,
                        type(uint256).max
                    );
                    approveCompleted[route[j].pool][route[j].fromCoin] = true;
                }

                // continiuing to save this route
                internalMajorRoute[start][end].push(route[j]);
            }

            // as route between these coins is set, we consider them as major
            isMajorCoin[start] = true;
            isMajorCoin[end] = true;
        }
    }

    /// @notice Build highest liquidity swap route between two ERC20 coins
    /// @param from address of coin to start route from
    /// @param to address of route destination coin
    /// @return route containing liquidity pool addresses
    function buildRoute(address from, address to)
        public
        view
        returns (RouteEdge[] memory)
    {
        bool isFromMajorCoin = isMajorCoin[from];
        bool isToMajorCoin = isMajorCoin[to];

        if (isFromMajorCoin && isToMajorCoin) {
            // Moscow - Heathrow
            // in this case route of major coins is predefined
            RouteEdge[] memory majorToMajor = internalMajorRoute[from][to];

            // check if this part of route exists
            require(
                majorToMajor.length > 0,
                "Exchange: 1!path from major coin"
            );

            return majorToMajor;
        } else if (!isFromMajorCoin && isToMajorCoin) {
            // Tomsk - Heathrow
            // getting predefined route from minor coin to major coin
            RouteEdge memory minorToMajor = minorCoins[from];

            // revert if route is not predefined
            require(
                minorToMajor.swapProtocol != 0,
                "Exchange: 2!path from input coin"
            );

            // if predefined route from minor to major coin is what we wanted
            // to get, simply return it
            if (minorToMajor.toCoin == to) {
                RouteEdge[] memory result = new RouteEdge[](1);
                result[0] = minorToMajor;
                return result;
            }

            // find continuation of the route, if these major coins don't match
            RouteEdge[] memory majorToMajor = internalMajorRoute[
                minorToMajor.toCoin
            ][to];

            // check if this part of route exists
            require(
                majorToMajor.length > 0,
                "Exchange: 2!path from major coin"
            );

            // concatenate route and return it
            RouteEdge[] memory route = new RouteEdge[](majorToMajor.length + 1);
            route[0] = minorToMajor;

            for (uint256 i = 0; i < majorToMajor.length; i++) {
                route[i + 1] = majorToMajor[i];
            }

            return route;
        } else if (isFromMajorCoin && !isToMajorCoin) {
            // Heathrow - Sochi
            // getting predefined route from any major coin to target minor coin
            RouteEdge memory majorToMinor = reverseRouteEdge(minorCoins[to]);

            // revert if route is not predefined
            require(
                majorToMinor.swapProtocol != 0,
                "Exchange: 3!path from input coin"
            );

            // if predefined route from major to minor coin is what we wanted
            // to get, simply return it
            if (majorToMinor.fromCoin == from) {
                RouteEdge[] memory result = new RouteEdge[](1);
                result[0] = majorToMinor;
                return result;
            }

            // find beginning of route from start major coin to major coin
            // that is linked to destination
            RouteEdge[] memory majorToMajor = internalMajorRoute[from][
                majorToMinor.fromCoin
            ];

            // check if this part of route exists
            require(
                majorToMajor.length > 0,
                "Exchange: 3!path from major coin"
            );

            // concatenate route and return it
            RouteEdge[] memory route = new RouteEdge[](majorToMajor.length + 1);
            route[majorToMajor.length] = majorToMinor;

            for (uint256 i = 0; i < majorToMajor.length; i++) {
                route[i] = majorToMajor[i];
            }

            return route;
        } else {
            // Chelyabinsk - Glasgow
            //       minor - minor
            // get paths from source and target coin to
            // corresponding major coins
            RouteEdge memory minorToMajor = minorCoins[from];
            RouteEdge memory majorToMinor = reverseRouteEdge(minorCoins[to]);

            // revert if routes are not predefined
            require(
                minorToMajor.swapProtocol != 0,
                "Exchange: 4!path from input coin"
            );
            require(
                majorToMinor.swapProtocol != 0,
                "Exchange: 4!path from out coin"
            );

            // if these paths overlap on one coin, simply return it
            if (minorToMajor.toCoin == majorToMinor.fromCoin) {
                RouteEdge[] memory result = new RouteEdge[](2);
                result[0] = minorToMajor;
                result[1] = majorToMinor;
                return result;
            }

            // connect input and output coins with major coins
            RouteEdge[] memory majorToMajor = internalMajorRoute[
                minorToMajor.toCoin
            ][majorToMinor.fromCoin];

            // check if this part of route exists
            require(
                majorToMajor.length > 0,
                "Exchange: 4!path from major coin"
            );

            // concatenate route and return it
            RouteEdge[] memory route = new RouteEdge[](majorToMajor.length + 2);
            route[0] = minorToMajor;
            route[majorToMajor.length + 1] = majorToMinor;

            for (uint256 i = 0; i < majorToMajor.length; i++) {
                route[i + 1] = majorToMajor[i];
            }

            return route;
        }
    }

    function reverseRouteEdge(RouteEdge memory route)
        private
        pure
        returns (RouteEdge memory)
    {
        address cache = route.fromCoin;
        route.fromCoin = route.toCoin;
        route.toCoin = cache;

        return route;
    }
}
