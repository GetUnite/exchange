// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {IExchangeAdapter} from "./../../interfaces/IExchangeAdapter.sol";
import {BeefyBase} from "./BeefyBase.sol";

// solhint-disable func-name-mixedcase
// solhint-disable var-name-mixedcase
interface ICurve {
    function remove_liquidity_one_coin(
        uint256 _burn_amount,
        int128 i,
        uint256 _min_received
    ) external returns (uint256);

    function add_liquidity(
        uint256[2] memory _amounts,
        uint256 _min_mint_amount
    ) external returns (uint256);
}

contract BeefyCurveOpFMimAdapter is IExchangeAdapter {
    ICurve public constant CURVE =
        ICurve(0x810D1AaA4Cd8F21c23bB648F2dfb9DC232A01F09);
    address public constant MIM = 0xB153FB3d196A8eB25522705560ac152eeEc57901;
    address public constant MOO_TOKEN =
        0x5990002594b13e174885ba4D4Ec15B8a8A4485bb;

    // 0x6012856e  =>  executeSwap(address,address,address,uint256)
    function executeSwap(
        address pool,
        address fromToken,
        address toToken,
        uint256 amount
    ) external payable returns (uint256) {
        if (fromToken == MIM && toToken == MOO_TOKEN) {
            // MIM -> Curve LP
            depositUsdcToCurve(amount);

            // Curve LP -> moo token
            return BeefyBase.beefyDepositAll(pool);
        } else if (fromToken == MOO_TOKEN && toToken == MIM) {
            // moo token -> MIM LP
            uint256 hopReceived = BeefyBase.beefyWithdraw(pool, amount);

            // MIM LP -> MIM
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
        return CURVE.remove_liquidity_one_coin(amount, 0, 0);
    }

    function depositUsdcToCurve(uint256 amount) internal returns (uint256) {
        uint256[2] memory amounts;
        amounts[0] = amount;
        return CURVE.add_liquidity(amounts, 0);
    }
}
