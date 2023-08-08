// SPDX-License-Identifier: MIT
pragma solidity ^0.8.11;

import "@openzeppelin/contracts/interfaces/IERC20.sol";

import "./../interfaces/IExchangeAdapter.sol";

// solhint-disable func-name-mixedcase
// solhint-disable var-name-mixedcase
interface ICurve3Crv {
    function add_liquidity(
        uint256[3] memory amounts,
        uint256 min_mint_amount
    ) external returns (uint256);

    function remove_liquidity_one_coin(
        uint256 _token_amount,
        int128 i,
        uint256 min_amount
    ) external returns (uint256);

    function exchange(
        int128 i,
        int128 j,
        uint256 dx,
        uint256 min_dy
    ) external returns (uint256);
}

contract OptimismCurve3CrvAdapter is IExchangeAdapter {
    IERC20 public constant TOKEN_3CRV =
        IERC20(0xE7a24EF0C5e95Ffb0f6684b813A78F2a3AD7D171);

    function indexByCoin(address coin) public pure returns (int128) {
        // We are using the underlying coins for swaps.
        if (coin == 0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1) return 1; // dai
        if (coin == 0x7F5c764cBc14f9669B88837ca1490cCa17c31607) return 2; // usdc
        if (coin == 0x94b008aA00579c1307B0EF2c499aD98a8ce58e58) return 3; // usdt
        return 0;
    }

    function executeSwap(
        address pool,
        address fromToken,
        address toToken,
        uint256 amount
    ) external payable returns (uint256) {
        ICurve3Crv pool3crv = ICurve3Crv(pool);
        // Swap between two USD stable coins
        int128 i = indexByCoin(fromToken);
        int128 j = indexByCoin(toToken);
        require(i != 0 && j != 0, "OptimismCurve3CrvAdapter: can't swap");
        pool3crv.exchange(i - 1, j - 1, amount, 0);
        return IERC20(toToken).balanceOf(address(this));
    }

    function enterPool(
        address pool,
        address fromToken,
        uint256 amount
    ) external payable returns (uint256) {
        ICurve3Crv pool3crv = ICurve3Crv(pool);
        // enter 3crv pool to get 3crv token
        int128 i = indexByCoin(fromToken);
        require(i != 0, "OptimismCurve3CrvAdapter: can't swap");
        uint256[3] memory amounts;
        amounts[uint256(int256(i - 1))] = amount;
        return pool3crv.add_liquidity(amounts, 0);
    }

    function exitPool(
        address pool,
        address toToken,
        uint256 amount
    ) external payable returns (uint256) {
        // exit 3crv pool to get stable
        ICurve3Crv pool3crv = ICurve3Crv(pool);
        int128 i = indexByCoin(toToken);
        require(i != 0, "OptimismCurve3CrvAdapter: can't swap");
        return pool3crv.remove_liquidity_one_coin(amount, i - 1, 0);
    }
}
