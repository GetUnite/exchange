// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {IERC20Metadata} from "@openzeppelin/contracts/interfaces/IERC20Metadata.sol";

import {IExchangeAdapter} from "./../../interfaces/IExchangeAdapter.sol";
import {BeefyBase} from "./BeefyBase.sol";

interface IStargate {
    function addLiquidity(
        uint256 _poolId,
        uint256 _amountLD,
        address _to
    ) external;

    function instantRedeemLocal(
        uint16 _srcPoolId,
        uint256 _amountLP,
        address _to
    ) external returns (uint256 amountSD);
}

contract BeefyPolygonStargateUsdtAdapter is IExchangeAdapter {
    IStargate public constant STARGATE =
        IStargate(0x45A01E4e04F14f7A4a6702c74187c5F6222033cd);
    address public constant USDT = 0xc2132D05D31c914a87C6611C10748AEb04B58e8F;
    address public constant MOO_TOKEN =
        0x1C480521100c962F7da106839a5A504B5A7457a1;
    uint16 public constant POOL_ID = 2;

    // 0x6012856e  =>  executeSwap(address,address,address,uint256)
    function executeSwap(
        address pool,
        address fromToken,
        address toToken,
        uint256 amount
    ) external payable returns (uint256) {
        if (fromToken == USDT && toToken == MOO_TOKEN) {
            // USDT -> Stargate LP
            depositUsdtToStargate(amount);

            // Stargate LP -> moo token
            return BeefyBase.beefyDepositAll(pool);
        } else if (fromToken == MOO_TOKEN && toToken == USDT) {
            // moo token -> Stargate LP
            uint256 hopReceived = BeefyBase.beefyWithdraw(pool, amount);

            // Stargate LP -> USDT
            uint256 received = getUsdtFromStargate(hopReceived);
            return received;
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

    function getUsdtFromStargate(uint256 amount) internal returns (uint256) {
        return STARGATE.instantRedeemLocal(POOL_ID, amount, address(this));
    }

    function depositUsdtToStargate(uint256 amount) internal {
        STARGATE.addLiquidity(POOL_ID, amount, address(this));
    }
}
