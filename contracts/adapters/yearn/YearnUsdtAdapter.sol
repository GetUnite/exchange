// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface IYearnVault {
    function deposit(uint256 _amount) external returns (uint256);

    function withdraw(uint256 maxShares) external returns (uint256);
}

interface IExchangeAdapter {
    // 0x6012856e  =>  executeSwap(address,address,address,uint256)
    function executeSwap(
        address pool,
        address fromToken,
        address toToken,
        uint256 amount
    ) external payable returns (uint256);

    // 0x73ec962e  =>  enterPool(address,address,uint256)
    function enterPool(
        address pool,
        address fromToken,
        uint256 amount
    ) external payable returns (uint256);

    // 0x660cb8d4  =>  exitPool(address,address,uint256)
    function exitPool(
        address pool,
        address toToken,
        uint256 amount
    ) external payable returns (uint256);
}

contract YearnUsdtAdapter is IExchangeAdapter {
    address public constant USDT = 0x94b008aA00579c1307B0EF2c499aD98a8ce58e58;
    address public constant YEARN_TOKEN =
        0xFaee21D0f0Af88EE72BB6d68E54a90E6EC2616de;

    // 0x6012856e  =>  executeSwap(address,address,address,uint256)
    function executeSwap(
        address pool,
        address fromToken,
        address toToken,
        uint256 amount
    ) external payable returns (uint256) {
        if (fromToken == USDT && toToken == YEARN_TOKEN) {
            return IYearnVault(pool).deposit(amount);
        } else if (fromToken == YEARN_TOKEN && toToken == USDT) {
            return IYearnVault(pool).withdraw(amount);
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
}