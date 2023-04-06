// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {IExchangeAdapter} from "./../../interfaces/IExchangeAdapter.sol";
import {BeefyBase} from "./BeefyBase.sol";

// solhint-disable func-name-mixedcase
// solhint-disable var-name-mixedcase
interface ICurve {
    function remove_liquidity_one_coin(
        address _pool,
        uint256 _burn_amount,
        int128 i,
        uint256 _min_amount
    ) external returns (uint256);

    function add_liquidity(
        address _pool,
        uint256[4] memory _deposit_amounts,
        uint256 _min_mint_amount
    ) external returns (uint256);
}

contract BeefyCurveOpFSusdAdapter is IExchangeAdapter {
    ICurve public constant CURVE =
        ICurve(0x167e42a1C7ab4Be03764A2222aAC57F5f6754411);
    address public constant CURVE_POOL =
        0x061b87122Ed14b9526A813209C8a59a633257bAb;
    address public constant USDC = 0x7F5c764cBc14f9669B88837ca1490cCa17c31607;
    address public constant MOO_TOKEN =
        0x107Dbf9c9C0EF2Df114159e5C7DC2baf7C444cFF;

    // 0x6012856e  =>  executeSwap(address,address,address,uint256)
    function executeSwap(
        address pool,
        address fromToken,
        address toToken,
        uint256 amount
    ) external payable returns (uint256) {
        if (fromToken == USDC && toToken == MOO_TOKEN) {
            // USDC -> Curve LP
            depositUsdcToCurve(amount);

            // Curve LP -> moo token
            return BeefyBase.beefyDepositAll(pool);
        } else if (fromToken == MOO_TOKEN && toToken == USDC) {
            // moo token -> HOP-LP-USDC
            uint256 hopReceived = BeefyBase.beefyWithdraw(pool, amount);

            // HOP-LP-USDC -> USDC
            return getUsdcFromCurve(hopReceived);
        } else {
            revert("Adapter: can't swap");
        }
    }

    // 0xe83bbb76  =>  enterPool(address,address,address,uint256)
    function enterPool(
        address,
        address,
        uint256
    ) external payable returns (uint256) {
        revert("Adapter: can't enter");
    }

    // 0x9d756192  =>  exitPool(address,address,address,uint256)
    function exitPool(
        address,
        address,
        uint256
    ) external payable returns (uint256) {
        revert("Adapter: can't exit");
    }

    function getUsdcFromCurve(uint256 amount) internal returns (uint256) {
        return CURVE.remove_liquidity_one_coin(CURVE_POOL, amount, 2, 0);
    }

    function depositUsdcToCurve(uint256 amount) internal returns (uint256) {
        uint256[4] memory amounts;
        amounts[2] = amount;
        return CURVE.add_liquidity(CURVE_POOL, amounts, 0);
    }
}
