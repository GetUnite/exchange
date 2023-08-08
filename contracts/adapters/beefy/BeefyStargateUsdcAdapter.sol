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

contract BeefyStargateUsdcAdapter is IExchangeAdapter {
    IStargate public constant STARGATE =
        IStargate(0xB0D502E938ed5f4df2E681fE6E419ff29631d62b);
    address public constant USDC = 0x7F5c764cBc14f9669B88837ca1490cCa17c31607;
    address public constant MOO_TOKEN =
        0xe536F8141D8EB7B1f096934AF3329cB581bFe995;
    IERC20Metadata public constant SUSDC =
        IERC20Metadata(0xDecC0c09c3B5f6e92EF4184125D5648a66E35298);
    uint16 public constant POOL_ID = 1;

    // 0x6012856e  =>  executeSwap(address,address,address,uint256)
    function executeSwap(
        address pool,
        address fromToken,
        address toToken,
        uint256 amount
    ) external payable returns (uint256) {
        if (fromToken == USDC && toToken == MOO_TOKEN) {
            // USDC -> Stargate LP
            depositUsdcToStargate(amount);

            // Stargate LP -> moo token
            return BeefyBase.beefyDepositAll(pool);
        } else if (fromToken == MOO_TOKEN && toToken == USDC) {
            // moo token -> Stargate LP
            uint256 hopReceived = BeefyBase.beefyWithdraw(pool, amount);

            // Stargate LP -> USDC
            uint256 received = getUsdcFromStargate(hopReceived);
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

    function getUsdcFromStargate(uint256 amount) internal returns (uint256) {
        return STARGATE.instantRedeemLocal(POOL_ID, amount, address(this));
    }

    function depositUsdcToStargate(uint256 amount) internal {
        STARGATE.addLiquidity(POOL_ID, amount, address(this));
    }
}
