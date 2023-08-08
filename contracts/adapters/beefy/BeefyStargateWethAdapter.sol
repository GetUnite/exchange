// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {IERC20Metadata} from "@openzeppelin/contracts/interfaces/IERC20Metadata.sol";

import {IExchangeAdapter} from "./../../interfaces/IExchangeAdapter.sol";
import {BeefyBase} from "./BeefyBase.sol";
import {IStargateEth} from "./../../interfaces/IStargateEth.sol";
import {IWrappedEther} from "./../../interfaces/IWrappedEther.sol";

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

contract BeefyStargateWethAdapter is IExchangeAdapter {
    IStargate public constant STARGATE =
        IStargate(0xB0D502E938ed5f4df2E681fE6E419ff29631d62b);
    address public constant WETH = 0x4200000000000000000000000000000000000006;
    address public constant STARGATE_ETH =
        0xb69c8CBCD90A39D8D3d3ccf0a3E968511C3856A0;
    address public constant MOO_TOKEN =
        0x79149B500f0d796aA7f85e0170d16C7e79BAd3C5;
    uint16 public constant POOL_ID = 13;

    // 0x6012856e  =>  executeSwap(address,address,address,uint256)
    function executeSwap(
        address pool,
        address fromToken,
        address toToken,
        uint256 amount
    ) external payable returns (uint256) {
        if (fromToken == WETH && toToken == MOO_TOKEN) {
            // USDC -> Stargate LP
            depositUsdcToStargate(amount);

            // Stargate LP -> moo token
            return BeefyBase.beefyDepositAll(pool);
        } else if (fromToken == MOO_TOKEN && toToken == WETH) {
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
        uint256 ethReceived = STARGATE.instantRedeemLocal(
            POOL_ID,
            amount,
            address(this)
        );
        IWrappedEther(WETH).deposit{value: ethReceived}();

        return ethReceived;
    }

    function depositUsdcToStargate(uint256 amount) internal {
        IWrappedEther(WETH).withdraw(amount);
        IStargateEth(STARGATE_ETH).deposit{value: amount}();

        STARGATE.addLiquidity(POOL_ID, amount, address(this));
    }
}
