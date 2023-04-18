// SPDX-License-Identifier: MIT
pragma solidity ^0.8.11;
import "@openzeppelin/contracts/interfaces/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "../interfaces/IExchange.sol";

interface IUniswapV2Pair {
    function stable() external view returns (bool);
}

interface IUniswapRouterSolidly {
    function swapExactTokensForTokensSimple(
        uint256 amountIn,
        uint256 amountOutMin,
        address tokenFrom,
        address tokenTo,
        bool stable,
        address to,
        uint256 deadline
    ) external returns (uint256[] memory amounts);
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

contract VelodromeAdapter is IExchangeAdapter {
    using SafeERC20 for IERC20;
    address public constant ROUTER =
        0xa132DAB612dB5cB9fC9Ac426A0Cc215A3423F9c9;

    function executeSwap(
        address pool,
        address fromToken,
        address toToken,
        uint256 amount
    ) external payable returns (uint256) {
        IUniswapRouterSolidly(ROUTER).swapExactTokensForTokensSimple(
            amount,
            0,
            fromToken,
            toToken,
            IUniswapV2Pair(pool).stable(),
            address(this),
            block.timestamp
        );
        return IERC20(toToken).balanceOf(address(this));
    }

    function enterPool(
        address,
        address,
        uint256
    ) external payable returns (uint256) {
        revert("SushiswapAdapter: cant enter");
    }

    // Amount = amount of lptokens to burn!
    function exitPool(
        address,
        address,
        uint256
    ) external payable returns (uint256) {
        revert("SushiswapAdapter: cant enter");
    }
}
