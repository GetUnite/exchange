// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {IExchangeAdapter} from "./../../interfaces/IExchangeAdapter.sol";
import {IVelodromeV2Pool as IVelodromePool} from "./../../interfaces/IVelodromeV2Pool.sol";
import "@openzeppelin/contracts/interfaces/IERC20Metadata.sol";
import "./../../interfaces/IWrappedEther.sol";
import "./../../interfaces/IPriceRouterV2.sol";
import "./../../interfaces/IVelodromeV2Router.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

import "./../../interfaces/IYearnVault.sol";

contract YearnUniversalAdapter is IExchangeAdapter {
    using SafeERC20 for IERC20;

    IWrappedEther public constant WETH =
        IWrappedEther(0x4200000000000000000000000000000000000006);
    IVelodromeV2Router public constant VELODROME_ROUTER =
        IVelodromeV2Router(0xa062aE8A9c5e11aaA026fc2670B0D65cCc8B2858);
    IPriceFeedRouterV2 public constant PRICE_ROUTER =
        IPriceFeedRouterV2(0x7E6FD319A856A210b9957Cd6490306995830aD25);
    uint256 public constant MINIMUM_BEEF_IN = 1000;

    event NeedPriceFeed(address indexed token);

    // Needs extra approval of the opposite token in Velodrome pool
    // 0x6012856e  =>  executeSwap(address,address,address,uint256)
    function executeSwap(
        address,
        address fromToken,
        address toToken,
        uint256 amount
    ) external payable returns (uint256) {
        if (isYearnVault(toToken)) {
            address oppositeToken = getOppositeToken(toToken, fromToken);

            (uint256 originBalance, uint256 oppositeBalance) = zapInVelo(
                toToken,
                fromToken,
                oppositeToken,
                amount
            );

            loop(
                fromToken,
                oppositeToken,
                originBalance,
                oppositeBalance,
                toToken
            );

            _approveTokenIfNeeded(IYearnVault(toToken).token(), toToken);
            IYearnVault(toToken).deposit();

            originBalance = IERC20(fromToken).balanceOf(address(this));
            oppositeBalance = IERC20(oppositeToken).balanceOf(address(this));

            if (originBalance > 0) {
                IERC20(fromToken).transfer(msg.sender, originBalance);
            }

            if (oppositeBalance > 0) {
                IERC20(oppositeToken).transfer(msg.sender, oppositeBalance);
            }

            return IERC20(toToken).balanceOf(address(this));
        } else if (isYearnVault(fromToken)) {
            address oppositeToken = getOppositeToken(fromToken, toToken);

            IYearnVault(fromToken).withdraw();
            uint256 result = zapOutVelo(fromToken, toToken, amount);

            uint256 originBalance = IERC20(fromToken).balanceOf(address(this));
            uint256 oppositeBalance = IERC20(oppositeToken).balanceOf(
                address(this)
            );

            if (originBalance > 0) {
                IERC20(fromToken).transfer(msg.sender, originBalance);
            }

            if (oppositeBalance > 0) {
                IERC20(oppositeToken).transfer(msg.sender, oppositeBalance);
            }

            return result;
        } else {
            revert("YearnUniversalAdapter: cant swap");
        }
    }

    function loop(
        address originToken,
        address oppositeToken,
        uint256 originBalance,
        uint256 oppositeBalance,
        address beefyToken
    ) private {
        if (originBalance == 0 && oppositeBalance == 0) {
            return;
        }

        (uint256 priceOrigin, uint8 priceDecimalsOrigin) = tryGetTokenPrice(
            originToken,
            originBalance
        );
        (uint256 priceOpposite, uint8 priceDecimalsOpposite) = tryGetTokenPrice(
            oppositeToken,
            oppositeBalance
        );

        uint256 priceOriginGoal = 10 ** (priceDecimalsOrigin - 1);
        uint256 priceOppositeGoal = 10 ** (priceDecimalsOpposite - 1);

        for (uint256 i = 0; i < 15; i++) {
            if (
                (priceOrigin < priceOriginGoal && priceDecimalsOrigin != 1) &&
                (priceOpposite < priceOppositeGoal &&
                    priceDecimalsOpposite != 1)
            ) {
                return;
            }
            bool investOpposite;
            if (
                priceDecimalsOrigin > priceDecimalsOpposite &&
                priceOrigin != 0 &&
                priceOpposite != 0
            ) {
                uint256 priceOppositeSameDecimals = priceOpposite *
                    (10 ** (priceDecimalsOrigin - priceDecimalsOpposite));

                investOpposite = priceOppositeSameDecimals > priceOrigin;
            } else if (
                priceDecimalsOrigin < priceDecimalsOpposite &&
                priceOrigin != 0 &&
                priceOpposite != 0
            ) {
                uint256 priceOriginSameDecimals = priceOrigin *
                    (10 ** (priceDecimalsOpposite - priceDecimalsOrigin));

                investOpposite = priceOpposite > priceOriginSameDecimals;
            } else {
                // Normally this case should not happen.
                // This protects from 0 value beefIn
                investOpposite = oppositeBalance > originBalance;
            }

            uint256 depositAmount = investOpposite
                ? oppositeBalance
                : originBalance;

            if (depositAmount < MINIMUM_BEEF_IN) {
                return;
            }

            (
                uint256 investedAmount,
                uint256 oppositeInvestedAmount
            ) = zapInVelo(
                    beefyToken,
                    investOpposite ? oppositeToken : originToken,
                    investOpposite ? originToken : oppositeToken,
                    depositAmount
                );

            oppositeBalance = investOpposite
                ? investedAmount
                : oppositeInvestedAmount;
            originBalance = investOpposite
                ? oppositeInvestedAmount
                : investedAmount;

            (priceOrigin, priceDecimalsOrigin) = tryGetTokenPrice(
                originToken,
                originBalance
            );
            (priceOpposite, priceDecimalsOpposite) = tryGetTokenPrice(
                oppositeToken,
                oppositeBalance
            );
        }
    }

    function tryGetTokenPrice(
        address token,
        uint256 amount
    ) private returns (uint256, uint8) {
        try PRICE_ROUTER.getPriceOfAmount(token, amount, 0) returns (
            uint256 value,
            uint8 decimals
        ) {
            return (value, decimals);
        } catch {
            emit NeedPriceFeed(token);
            return (0, 1);
        }
    }

    function getOppositeToken(
        address beefyVault,
        address originToken
    ) private view returns (address) {
        IVelodromePool veloPool = IVelodromePool(
            IYearnVault(beefyVault).token()
        );
        address token0 = veloPool.token0();
        address token1 = veloPool.token1();

        return (token0 == originToken) ? token1 : token0;
    }

    function zapInVelo(
        address beefyToken,
        address from,
        address oppositeFrom,
        uint256
    ) private returns (uint256 fromAmount, uint256 oppositeFromAmount) {
        _swapAndStake(beefyToken, 0, from);

        fromAmount = IERC20(from).balanceOf(address(this));
        oppositeFromAmount = IERC20(oppositeFrom).balanceOf(address(this));
    }

    function zapOutVelo(
        address yearnVault,
        address to,
        uint256
    ) private returns (uint256) {
        IVelodromePool pair = IVelodromePool(IYearnVault(yearnVault).token());
        address token0 = pair.token0();
        address token1 = pair.token1();

        _removeLiquidity(address(pair), address(this));

        address swapToken = token1 == to ? token0 : token1;
        address[] memory path = new address[](2);
        path[0] = swapToken;
        path[1] = to;

        _approveTokenIfNeeded(path[0], address(VELODROME_ROUTER));
        _swapExactTokensForTokensSimple(
            IERC20(swapToken).balanceOf(address(this)),
            0,
            path[0],
            path[1],
            pair.stable(),
            pair.factory(),
            address(this),
            block.timestamp
        );

        return IERC20(to).balanceOf(address(this));
    }

    function _removeLiquidity(address pair, address to) private {
        IERC20(pair).safeTransfer(pair, IERC20(pair).balanceOf(address(this)));
        (uint256 amount0, uint256 amount1) = IVelodromePool(pair).burn(to);

        if (amount0 < MINIMUM_BEEF_IN) {
            revert("InsufficientAmount");
        }
        if (amount1 < MINIMUM_BEEF_IN) {
            revert("InsufficientAmount");
        }
    }

    function _swapAndStake(
        address yearnVault,
        uint256 tokenAmountOutMin,
        address tokenIn
    ) private returns (uint256) {
        IVelodromePool pair = IVelodromePool(IYearnVault(yearnVault).token());
        if (pair.factory() != VELODROME_ROUTER.defaultFactory()) {
            revert("IncompatiblePair"); // router.addLiquidity adds to pair from router.defaultFactory()
        }

        (uint256 reserveA, uint256 reserveB, ) = pair.getReserves();
        if (reserveA < MINIMUM_BEEF_IN || reserveB < MINIMUM_BEEF_IN) {
            revert("ReservesTooLow");
        }

        bool isInputA = pair.token0() == tokenIn;
        if (!isInputA && pair.token1() != tokenIn) {
            revert("WrongToken");
        }

        address[] memory path = new address[](2);
        path[0] = tokenIn;
        path[1] = isInputA ? pair.token1() : pair.token0();

        uint256 fullInvestment = IERC20(tokenIn).balanceOf(address(this));
        uint256 swapAmountIn;
        if (isInputA) {
            swapAmountIn = _getSwapAmount(
                pair,
                fullInvestment,
                reserveA,
                reserveB,
                path[0],
                path[1]
            );
        } else {
            swapAmountIn = _getSwapAmount(
                pair,
                fullInvestment,
                reserveB,
                reserveA,
                path[0],
                path[1]
            );
        }

        _approveTokenIfNeeded(path[0], address(VELODROME_ROUTER));
        uint256[] memory swappedAmounts = _swapExactTokensForTokensSimple(
            swapAmountIn,
            tokenAmountOutMin,
            path[0],
            path[1],
            pair.stable(),
            pair.factory(),
            address(this),
            block.timestamp
        );

        _approveTokenIfNeeded(path[1], address(VELODROME_ROUTER));
        (, , uint256 amountLiquidity) = VELODROME_ROUTER.addLiquidity(
            path[0],
            path[1],
            pair.stable(),
            fullInvestment - swappedAmounts[0],
            swappedAmounts[1],
            1,
            1,
            address(this),
            block.timestamp
        );

        return amountLiquidity;
    }

    function wrap(address tokenA, address tokenB) private {
        uint256 balance = address(this).balance;
        if (
            (tokenA == address(WETH) || tokenB == address(WETH)) && balance > 0
        ) {
            WETH.deposit{value: balance}();
        }
    }

    function isYearnVault(address vaultAddress) public view returns (bool) {
        bytes memory symbol = bytes(IERC20Metadata(vaultAddress).symbol());

        if (symbol[0] == bytes1("y") && symbol[1] == bytes1("v")) {
            try IYearnVault(vaultAddress).pricePerShare() returns (uint256) {
                return true;
            } catch {
                return false;
            }
        } else {
            return false;
        }
    }

    // 0x73ec962e  =>  enterPool(address,address,uint256)
    function enterPool(
        address,
        address,
        uint256
    ) external payable returns (uint256) {
        revert("YearnUniversalAdapter: !enter");
    }

    // 0x660cb8d4  =>  exitPool(address,address,uint256)
    function exitPool(
        address,
        address,
        uint256
    ) external payable returns (uint256) {
        revert("YearnUniversalAdapter: !enter");
    }

    function _swapExactTokensForTokensSimple(
        uint amountIn,
        uint amountOutMin,
        address tokenFrom,
        address tokenTo,
        bool stable,
        address factory,
        address to,
        uint deadline
    ) private returns (uint256[] memory amounts) {
        IVelodromeV2Router.Route[]
            memory routes = new IVelodromeV2Router.Route[](1);
        routes[0] = IVelodromeV2Router.Route({
            from: tokenFrom,
            to: tokenTo,
            stable: stable,
            factory: factory
        });
        amounts = VELODROME_ROUTER.swapExactTokensForTokens(
            amountIn,
            amountOutMin,
            routes,
            to,
            deadline
        );
    }

    function _getSwapAmount(
        IVelodromePool pair,
        uint256 investmentA,
        uint256 reserveA,
        uint256 reserveB,
        address tokenA,
        address tokenB
    ) private view returns (uint256 swapAmount) {
        uint256 halfInvestment = investmentA / 2;

        if (pair.stable()) {
            swapAmount = _getStableSwap(
                pair,
                investmentA,
                halfInvestment,
                tokenA,
                tokenB
            );
        } else {
            uint256 nominator = pair.getAmountOut(halfInvestment, tokenA);
            uint256 denominator = (halfInvestment * (reserveB - nominator)) /
                (reserveA + halfInvestment);
            swapAmount =
                investmentA -
                (
                    sqrt(
                        (halfInvestment * halfInvestment * nominator) /
                            denominator
                    )
                );
        }
    }

    function _getStableSwap(
        IVelodromePool pair,
        uint256 investmentA,
        uint256 halfInvestment,
        address tokenA,
        address tokenB
    ) private view returns (uint256 swapAmount) {
        uint out = pair.getAmountOut(halfInvestment, tokenA);
        (uint amountA, uint amountB, ) = VELODROME_ROUTER.quoteAddLiquidity(
            tokenA,
            tokenB,
            pair.stable(),
            pair.factory(),
            halfInvestment,
            out
        );

        amountA = (amountA * 1e18) / 10 ** IERC20Metadata(tokenA).decimals();
        amountB = (amountB * 1e18) / 10 ** IERC20Metadata(tokenB).decimals();
        out = (out * 1e18) / 10 ** IERC20Metadata(tokenB).decimals();
        halfInvestment =
            (halfInvestment * 1e18) /
            10 ** IERC20Metadata(tokenA).decimals();

        uint ratio = (((out * 1e18) / halfInvestment) * amountA) / amountB;

        return (investmentA * 1e18) / (ratio + 1e18);
    }

    function _approveTokenIfNeeded(address token, address spender) private {
        if (IERC20(token).allowance(address(this), spender) == 0) {
            IERC20(token).safeApprove(spender, type(uint256).max);
        }
    }

    function sqrt(uint256 x) internal pure returns (uint256) {
        unchecked {
            if (x == 0) return 0;
            else {
                uint256 xx = x;
                uint256 r = 1;
                if (xx >= 0x100000000000000000000000000000000) {
                    xx >>= 128;
                    r <<= 64;
                }
                if (xx >= 0x10000000000000000) {
                    xx >>= 64;
                    r <<= 32;
                }
                if (xx >= 0x100000000) {
                    xx >>= 32;
                    r <<= 16;
                }
                if (xx >= 0x10000) {
                    xx >>= 16;
                    r <<= 8;
                }
                if (xx >= 0x100) {
                    xx >>= 8;
                    r <<= 4;
                }
                if (xx >= 0x10) {
                    xx >>= 4;
                    r <<= 2;
                }
                if (xx >= 0x4) {
                    r <<= 1;
                }
                r = (r + x / r) >> 1;
                r = (r + x / r) >> 1;
                r = (r + x / r) >> 1;
                r = (r + x / r) >> 1;
                r = (r + x / r) >> 1;
                r = (r + x / r) >> 1;
                r = (r + x / r) >> 1; // Seven iterations should be enough
                uint256 r1 = x / r;
                return (r < r1 ? r : r1);
            }
        }
    }
}
