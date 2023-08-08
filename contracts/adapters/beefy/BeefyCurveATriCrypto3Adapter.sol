// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {IExchangeAdapter} from "./../../interfaces/IExchangeAdapter.sol";
import {BeefyBase} from "./BeefyBase.sol";
import {IWrappedEther} from "./../../interfaces/IWrappedEther.sol";
import {IERC20Metadata} from "@openzeppelin/contracts/interfaces/IERC20Metadata.sol";

// solhint-disable func-name-mixedcase
// solhint-disable var-name-mixedcase
interface ICurve {
    function remove_liquidity_one_coin(
        uint256 _token_amount,
        uint256 i,
        uint256 _min_amount
    ) external;

    function add_liquidity(
        uint256[5] memory _amounts,
        uint256 _min_mint_amount
    ) external;
}

contract BeefyCurveATriCrypto3Adapter is IExchangeAdapter {
    ICurve public constant CURVE =
        ICurve(0x1d8b86e3D88cDb2d34688e87E72F388Cb541B7C8);
    IERC20Metadata public constant CURVE_LP =
        IERC20Metadata(0xdAD97F7713Ae9437fa9249920eC8507e5FbB23d3);
    IWrappedEther public constant WETH =
        IWrappedEther(0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619);
    address public constant MOO_TOKEN =
        0x5A0801BAd20B6c62d86C566ca90688A6b9ea1d3f;

    // 0x6012856e  =>  executeSwap(address,address,address,uint256)
    function executeSwap(
        address pool,
        address fromToken,
        address toToken,
        uint256 amount
    ) external payable returns (uint256) {
        if (fromToken == address(WETH) && toToken == MOO_TOKEN) {
            // WETH -> Curve LP
            depositEthToCurve(amount);

            // Curve LP -> moo token
            return BeefyBase.beefyDepositAll(pool);
        } else if (fromToken == MOO_TOKEN && toToken == address(WETH)) {
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
        CURVE.remove_liquidity_one_coin(amount, 4, 0);
        return WETH.balanceOf(address(this));
    }

    function depositEthToCurve(uint256 amount) internal returns (uint256) {
        uint256[5] memory amounts;
        amounts[4] = amount;
        CURVE.add_liquidity(amounts, 0);
        return CURVE_LP.balanceOf(address(this));
    }
}
