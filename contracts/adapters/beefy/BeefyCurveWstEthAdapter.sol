// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {IExchangeAdapter} from "./../../interfaces/IExchangeAdapter.sol";
import {BeefyBase} from "./BeefyBase.sol";
import {IWrappedEther} from "./../../interfaces/IWrappedEther.sol";

// solhint-disable func-name-mixedcase
// solhint-disable var-name-mixedcase
interface ICurve {
    function remove_liquidity_one_coin(
        uint256 _token_amount,
        int128 i,
        uint256 _min_amount
    ) external returns (uint256);

    function add_liquidity(
        uint256[2] memory amounts,
        uint256 min_mint_amount
    ) external payable returns (uint256);
}

contract BeefyCurveWstEthAdapter is IExchangeAdapter {
    ICurve public constant CURVE =
        ICurve(0xB90B9B1F91a01Ea22A182CD84C1E22222e39B415);
    IWrappedEther public constant WETH =
        IWrappedEther(0x4200000000000000000000000000000000000006);
    address public constant MOO_TOKEN =
        0x0892a178c363b4739e5Ac89E9155B9c30214C0c0;

    // 0x6012856e  =>  executeSwap(address,address,address,uint256)
    function executeSwap(
        address pool,
        address fromToken,
        address toToken,
        uint256 amount
    ) external payable returns (uint256) {
        if (fromToken == address(WETH) && toToken == MOO_TOKEN) {
            // ETH -> Curve LP
            depositEthToCurve(amount);

            // Curve LP -> moo token
            return BeefyBase.beefyDepositAll(pool);
        } else if (fromToken == MOO_TOKEN && toToken == address(WETH)) {
            // moo token -> Curve LP
            uint256 curveLpReceived = BeefyBase.beefyWithdraw(pool, amount);

            // Curve LP -> WETH
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
        uint256 ethReceived = CURVE.remove_liquidity_one_coin(amount, 0, 0);
        WETH.deposit{value: ethReceived}();
        return ethReceived;
    }

    function depositEthToCurve(uint256 amount) internal returns (uint256) {
        WETH.withdraw(amount);
        uint256[2] memory amounts;
        amounts[0] = amount;
        return CURVE.add_liquidity{value: amount}(amounts, 0);
    }
}
