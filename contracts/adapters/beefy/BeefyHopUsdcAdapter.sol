// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {IExchangeAdapter} from "./../../interfaces/IExchangeAdapter.sol";
import "./BeefyBase.sol";

interface IHopSwap {
    function removeLiquidityOneToken(
        uint256 tokenAmount,
        uint8 tokenIndex,
        uint256 minAmount,
        uint256 deadline
    ) external returns (uint256);

    function addLiquidity(
        uint256[] memory amounts,
        uint256 minToMint,
        uint256 deadline
    ) external returns (uint256);

    function getToken(uint8 index) external view returns (address);
}

contract BeefyHopUsdcAdapter is IExchangeAdapter {
    IHopSwap public constant HOP =
        IHopSwap(0x3c0FFAca566fCcfD9Cc95139FEF6CBA143795963);
    address public constant USDC = 0x7F5c764cBc14f9669B88837ca1490cCa17c31607;
    address public constant MOO_TOKEN =
        0xE2f035f59De6a952FF699b4EDD0f99c466f25fEc;

    // 0x6012856e  =>  executeSwap(address,address,address,uint256)
    function executeSwap(
        address pool,
        address fromToken,
        address toToken,
        uint256 amount
    ) external payable returns (uint256) {
        if (fromToken == USDC && toToken == MOO_TOKEN) {
            // USDC -> HOP-LP-USDC
            depositUsdcToHop(amount);

            // HOP-LP-USDC -> moo token
            return BeefyBase.beefyDepositAll(pool);
        } else if (fromToken == MOO_TOKEN && toToken == USDC) {
            // moo token -> HOP-LP-USDC
            uint256 hopReceived = BeefyBase.beefyWithdraw(pool, amount);

            // HOP-LP-USDC -> USDC
            return getUsdcFromHop(hopReceived);
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

    function getUsdcFromHop(uint256 amount) internal returns (uint256) {
        return HOP.removeLiquidityOneToken(amount, 0, 0, type(uint256).max);
    }

    function depositUsdcToHop(uint256 amount) internal returns (uint256) {
        uint256[] memory amounts = new uint256[](2);
        amounts[0] = amount;
        return HOP.addLiquidity(amounts, 0, type(uint256).max);
    }
}
