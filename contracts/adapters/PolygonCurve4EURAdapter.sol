// SPDX-License-Identifier: MIT

pragma solidity ^0.8.11;

import "./../interfaces/IExchangeAdapter.sol";
import "@openzeppelin/contracts/interfaces/IERC20Metadata.sol";

// solhint-disable func-name-mixedcase
// solhint-disable var-name-mixedcase

interface ICurve4eur {
    function exchange(
        int128 i,
        int128 j,
        uint256 dx,
        uint256 min_dy
    ) external returns (uint256);

    function add_liquidity(
        uint256[4] memory amounts,
        uint256 min_mint_amount
    ) external returns (uint256);

    function remove_liquidity_one_coin(
        uint256 token_amount,
        int128 i,
        uint256 min_amount
    ) external returns (uint256);
}

contract PolygonCurve4EURAdapter {
    IERC20 public constant LP_TOKEN =
        IERC20(0xAd326c253A84e9805559b73A08724e11E49ca651); // Curve 4eur-f

    function indexByCoin(address coin) public pure returns (int128) {
        // We are using the underlying coins for swaps.
        if (coin == 0x4e3Decbb3645551B8A19f0eA1678079FCB33fB4c) return 1; // jEUR polygon
        if (coin == 0xE2Aa7db6dA1dAE97C5f5C6914d285fBfCC32A128) return 2; // PAR polygon
        if (coin == 0xE111178A87A3BFf0c8d18DECBa5798827539Ae99) return 3; // EURS polygon
        if (coin == 0x7BDF330f423Ea880FF95fC41A280fD5eCFD3D09f) return 4; // EURT polygon
        return 0;
    }

    // 0x6012856e  =>  executeSwap(address,address,address,uint256)
    function executeSwap(
        address pool,
        address fromToken,
        address toToken,
        uint256 amount
    ) external payable returns (uint256) {
        ICurve4eur curve = ICurve4eur(pool);
        int128 i = indexByCoin(fromToken);
        int128 j = indexByCoin(toToken);
        require(i != 0 && j != 0, "4eurAdapter: can't swap");
        return curve.exchange(i - 1, j - 1, amount, 0);
    }

    // 0xe83bbb76  =>  enterPool(address,address,address,uint256)
    function enterPool(
        address pool,
        address fromToken,
        uint256 amount
    ) external payable returns (uint256) {
        ICurve4eur curve = ICurve4eur(pool);
        // enter EURt pool to get crvEURTUSD token
        uint256[4] memory amounts;
        int128 i = indexByCoin(fromToken);
        require(i != 0, "4eurAdapter: can't enter");
        amounts[uint256(int256(i - 1))] = amount;
        return curve.add_liquidity(amounts, 0);
    }

    // 0x9d756192  =>  exitPool(address,address,address,uint256)
    function exitPool(
        address pool,
        address toToken,
        uint256 amount
    ) external payable returns (uint256) {
        ICurve4eur curve = ICurve4eur(pool);
        // exit EURt pool to get stable
        int128 i = indexByCoin(toToken);
        require(i != 0, "4eurAdapter: can't exit");
        return curve.remove_liquidity_one_coin(amount, i - 1, 0);
    }
}
