// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {IExchangeAdapter} from "./../../interfaces/IExchangeAdapter.sol";
import {BeefyBase} from "./BeefyBase.sol";
import {IWrappedEther} from "./../../interfaces/IWrappedEther.sol";

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

contract BeefyCurveSBTCAdapter is IExchangeAdapter {
    ICurve public constant CURVE =
        ICurve(0x9F2fE3500B1a7E285FDc337acacE94c480e00130);
    IWrappedEther public constant WBTC =
        IWrappedEther(0x68f180fcCe6836688e9084f035309E29Bf0A2095);
    address public constant MOO_TOKEN =
        0x25DE69dA4469A96974FaE79d0C41366A63317FDC;

    // 0x6012856e  =>  executeSwap(address,address,address,uint256)
    function executeSwap(
        address pool,
        address fromToken,
        address toToken,
        uint256 amount
    ) external payable returns (uint256) {
        if (fromToken == address(WBTC) && toToken == MOO_TOKEN) {
            // WBTC -> Curve LP
            depositEthToCurve(amount);

            // Curve LP -> moo token
            return BeefyBase.beefyDepositAll(pool);
        } else if (fromToken == MOO_TOKEN && toToken == address(WBTC)) {
            // moo token -> Curve LP
            uint256 curveLpReceived = BeefyBase.beefyWithdraw(pool, amount);

            // Curve LP -> WBTC
            return getEthFromCurve(curveLpReceived);
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

    function getEthFromCurve(uint256 amount) internal returns (uint256) {
        uint256 wbtcReceived = CURVE.remove_liquidity_one_coin(amount, 1, 0);
        return wbtcReceived;
    }

    function depositEthToCurve(uint256 amount) internal returns (uint256) {
        uint256[2] memory amounts;
        amounts[1] = amount;
        return CURVE.add_liquidity(amounts, 0);
    }
}
