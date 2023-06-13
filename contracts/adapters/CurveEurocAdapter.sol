// SPDX-License-Identifier: MIT
pragma solidity ^0.8.11;

import "./../interfaces/IExchangeAdapter.sol";
import "@openzeppelin/contracts/interfaces/IERC20.sol";

// solhint-disable func-name-mixedcase
// solhint-disable var-name-mixedcase
interface ICurveEuroc {
    function exchange_underlying(
        uint256 i,
        uint256 j,
        uint256 _dx,
        uint256 _min_dy
    ) external returns (uint256);
}

contract CurveEurocAdapter {
    function indexByCoin(address coin) public pure returns (uint256) {
        if (coin == 0x1aBaEA1f7C830bD89Acc67eC4af516284b1bC33c) return 1; // euroc
        if (coin == 0x6B175474E89094C44Da98b954EedeAC495271d0F) return 2; // dai
        if (coin == 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48) return 3; // usdc
        if (coin == 0xdAC17F958D2ee523a2206206994597C13D831ec7) return 4; // usdt
        return 0;
    }

    function executeSwap(
        address pool,
        address fromToken,
        address toToken,
        uint256 amount
    ) external payable returns (uint256) {
        ICurveEuroc curve = ICurveEuroc(pool);
        uint256 i = indexByCoin(fromToken);
        uint256 j = indexByCoin(toToken);
        require(i != 0 && j != 0, "eurocAdapter: can't swap");

        return curve.exchange_underlying(i - 1, j - 1, amount, 0);
    }

    function enterPool(
        address,
        address,
        uint256
    ) external payable returns (uint256) {
        revert("eurocAdapter: can't enter");
    }

    function exitPool(
        address,
        address,
        uint256
    ) external payable returns (uint256) {
        revert("eurocAdapter: can't exit");
    }
}
