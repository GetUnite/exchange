// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {IExchangeAdapter} from "./../interfaces/IExchangeAdapter.sol";
import {IWrappedEther} from "./../interfaces/IWrappedEther.sol";

// solhint-disable func-name-mixedcase
// solhint-disable var-name-mixedcase
interface ICurveWstEthCrv {
    function add_liquidity(
        uint256[2] memory _amounts,
        uint256 _min_mint_amount
    ) external payable returns (uint256);

    function remove_liquidity_one_coin(
        uint256 _burn_amount,
        int128 i,
        uint256 _min_received
    ) external returns (uint256);
}

contract OptimismCurveWstEthAdapter is IExchangeAdapter {
    address public constant WST_ETH_CRV_LP =
        0xEfDE221f306152971D8e9f181bFe998447975810;

    function indexByCoin(address coin) public pure returns (int128) {
        if (coin == 0x4200000000000000000000000000000000000006) return 1; // WETH
        if (coin == 0x1F32b1c2345538c0c6f582fCB022739c4A194Ebb) return 2; // wstETH
        return 0;
    }

    // 0x6012856e  =>  executeSwap(address,address,address,uint256)
    function executeSwap(
        address pool,
        address fromToken,
        address toToken,
        uint256 amount
    ) external payable returns (uint256) {
        ICurveWstEthCrv curve = ICurveWstEthCrv(pool);
        if (toToken == WST_ETH_CRV_LP) {
            uint128 i = uint128(indexByCoin(fromToken));
            require(i != 0, "OptimismCurveWstEthAdapter: Can't Swap");
            if (i == 1) {
                IWrappedEther(fromToken).withdraw(amount);
            }
            uint256[2] memory entryVector;
            entryVector[i - 1] = amount;
            return curve.add_liquidity{value: amount}(entryVector, 0);
        } else if (fromToken == WST_ETH_CRV_LP) {
            int128 i = indexByCoin(toToken);
            require(i != 0, "OptimismCurveWstEthAdapter: Can't Swap");
            uint256 amountReceived = curve.remove_liquidity_one_coin(
                amount,
                i - 1,
                0
            );
            if (i == 1) {
                IWrappedEther(toToken).deposit{value: amountReceived}();
            }
            return amountReceived;
        } else {
            revert("OptimismCurveWstEthAdapter: Can't Swap");
        }
    }

    // 0xe83bbb76  =>  enterPool(address,address,address,uint256)
    function enterPool(
        address,
        address,
        uint256
    ) external payable returns (uint256) {
        revert("OptimismCurveWstEthAdapter: Can't Swap");
    }

    // 0x9d756192  =>  exitPool(address,address,address,uint256)
    function exitPool(
        address,
        address,
        uint256
    ) external payable returns (uint256) {
        revert("OptimismCurveWstEthAdapter: Can't Swap");
    }
}
