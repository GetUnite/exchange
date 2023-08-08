// SPDX-License-Identifier: MIT
pragma solidity ^0.8.11;
import "@openzeppelin/contracts/interfaces/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "../interfaces/IExchange.sol";
import "./../interfaces/IVelodromeV2Router.sol";

interface IUniswapV2Pair {
    function stable() external view returns (bool);
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

contract VelodromeV2Adapter is IExchangeAdapter {
    using SafeERC20 for IERC20;
    address public constant ROUTER = 0xa062aE8A9c5e11aaA026fc2670B0D65cCc8B2858;
    address public constant POOL_FACTORY =
        0xF1046053aa5682b4F9a81b5481394DA16BE5FF5a;

    function executeSwap(
        address pool,
        address fromToken,
        address toToken,
        uint256 amount
    ) external payable returns (uint256) {
        _approveTokenIfNeeded(fromToken, address(ROUTER));

        IVelodromeV2Router.Route[]
            memory route = new IVelodromeV2Router.Route[](1);
        route[0] = IVelodromeV2Router.Route(
            fromToken,
            toToken,
            IUniswapV2Pair(pool).stable(),
            POOL_FACTORY
        );
        IVelodromeV2Router(ROUTER).swapExactTokensForTokens(
            amount,
            0,
            route,
            address(this),
            type(uint256).max
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

    function _approveTokenIfNeeded(address token, address spender) private {
        if (IERC20(token).allowance(address(this), spender) == 0) {
            IERC20(token).safeApprove(spender, type(uint256).max);
        }
    }
}
