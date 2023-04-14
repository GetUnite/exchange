// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {BeefyUniversalExchange} from "./BeefyUniversalExchange.sol";
import {IExchangeAdapter} from "./../../interfaces/IExchangeAdapter.sol";

contract BeefyUniversalAdapter is IExchangeAdapter {
    // 0x6012856e  =>  executeSwap(address,address,address,uint256)
    function executeSwap(
        address pool,
        address fromToken,
        address toToken,
        uint256 amount
    ) external payable returns (uint256) {
        return
            BeefyUniversalExchange(pool).exchangeBeefy(
                fromToken,
                toToken,
                amount
            );
    }

    // 0x73ec962e  =>  enterPool(address,address,uint256)
    function enterPool(
        address,
        address,
        uint256
    ) external payable returns (uint256) {
        revert("BeefyUniversalAdapter: !enter");
    }

    // 0x660cb8d4  =>  exitPool(address,address,uint256)
    function exitPool(
        address,
        address,
        uint256
    ) external payable returns (uint256) {
        revert("BeefyUniversalAdapter: !enter");
    }
}
