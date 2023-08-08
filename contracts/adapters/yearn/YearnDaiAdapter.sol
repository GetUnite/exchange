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

contract YearnDaiAdapter is IExchangeAdapter {
    address public constant DAI = 0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1;
    address public constant YEARN_TOKEN =
        0x65343F414FFD6c97b0f6add33d16F6845Ac22BAc;

    // 0x6012856e  =>  executeSwap(address,address,address,uint256)
    function executeSwap(
        address pool,
        address fromToken,
        address toToken,
        uint256 amount
    ) external payable returns (uint256) {
        if (fromToken == DAI && toToken == YEARN_TOKEN) {
            return IYearnVault(pool).deposit(amount);
        } else if (fromToken == YEARN_TOKEN && toToken == DAI) {
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