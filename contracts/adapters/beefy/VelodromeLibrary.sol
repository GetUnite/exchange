// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {IBeefyCalldataLibrary} from "./IBeefyCalldataLibrary.sol";
import {IERC20Metadata} from "@openzeppelin/contracts/interfaces/IERC20Metadata.sol";
import {SafeMath} from "@openzeppelin/contracts/utils/math/SafeMath.sol";

interface IUniswapV2Pair {
    function stable() external view returns (bool);

    function getAmountOut(
        uint256 amountIn,
        address tokenIn
    ) external view returns (uint256);

    function getReserves()
        external
        view
        returns (
            uint256 _reserve0,
            uint256 _reserve1,
            uint256 _blockTimestampLast
        );

    function token0() external view returns (address);

    function token1() external view returns (address);
}

interface IUniswapRouterSolidly {
    function quoteAddLiquidity(
        address tokenA,
        address tokenB,
        bool stable,
        uint256 amountADesired,
        uint256 amountBDesired
    )
        external
        view
        returns (uint256 amountA, uint256 amountB, uint256 liquidity);

    function swapExactTokensForTokensSimple(
        uint256 amountIn,
        uint256 amountOutMin,
        address tokenFrom,
        address tokenTo,
        bool stable,
        address to,
        uint256 deadline
    ) external returns (uint256[] memory amounts);

    function addLiquidity(
        address tokenA,
        address tokenB,
        bool stable,
        uint256 amountADesired,
        uint256 amountBDesired,
        uint256 amountAMin,
        uint256 amountBMin,
        address to,
        uint256 deadline
    ) external returns (uint256 amountA, uint256 amountB, uint256 liquidity);

    function removeLiquidity(
        address tokenA,
        address tokenB,
        bool stable,
        uint256 liquidity,
        uint256 amountAMin,
        uint256 amountBMin,
        address to,
        uint256 deadline
    ) external returns (uint256 amountA, uint256 amountB);
}

contract VelodromeCalldataSource is IBeefyCalldataLibrary {
    using SafeMath for uint256;

    IUniswapRouterSolidly public constant ROUTER =
        IUniswapRouterSolidly(0xa132DAB612dB5cB9fC9Ac426A0Cc215A3423F9c9);
    uint256 public constant MINIMUM_AMOUNT = 1000;

    function getData(
        address,
        uint256 amount,
        bool isBuy,
        address want,
        address originToken
    ) external {
        if (isBuy) {
            // originToken -> want
            executeOptimalDeposit(amount, want, originToken);
        } else {
            // want -> originToken
            exitOneCoin(amount, want, originToken);
        }
    }

    function exitOneCoin(
        uint256 amount,
        address want,
        address originToken
    ) private {
        IUniswapV2Pair pair = IUniswapV2Pair(want);

        bool isInputA = pair.token0() == originToken;
        require(
            isInputA || pair.token1() == originToken,
            "Beefy: Input token not present in liqudity pair"
        );
        address tokenB = isInputA ? pair.token1() : pair.token0();

        (, uint256 amountReceivedB) = ROUTER.removeLiquidity(
            originToken,
            tokenB,
            pair.stable(),
            amount,
            0,
            0,
            address(this),
            block.timestamp
        );

        ROUTER.swapExactTokensForTokensSimple(
            amountReceivedB,
            0,
            tokenB,
            originToken,
            pair.stable(),
            address(this),
            block.timestamp
        );
    }

    function executeOptimalDeposit(
        uint256,
        address want,
        address tokenIn
    ) private {
        IUniswapV2Pair pair = IUniswapV2Pair(want);

        (uint256 reserveA, uint256 reserveB, ) = pair.getReserves();
        require(
            reserveA > MINIMUM_AMOUNT && reserveB > MINIMUM_AMOUNT,
            "Beefy: Liquidity pair reserves too low"
        );

        bool isInputA = pair.token0() == tokenIn;
        require(
            isInputA || pair.token1() == tokenIn,
            "Beefy: Input token not present in liqudity pair"
        );

        address[] memory path = new address[](2);
        path[0] = tokenIn;
        path[1] = isInputA ? pair.token1() : pair.token0();

        uint256 fullInvestment = IERC20Metadata(tokenIn).balanceOf(
            address(this)
        );
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

        uint256[] memory swapedAmounts = ROUTER.swapExactTokensForTokensSimple(
            swapAmountIn,
            0,
            path[0],
            path[1],
            pair.stable(),
            address(this),
            block.timestamp
        );

        ROUTER.addLiquidity(
            path[0],
            path[1],
            pair.stable(),
            fullInvestment.sub(swapedAmounts[0]),
            swapedAmounts[1],
            1,
            1,
            address(this),
            block.timestamp
        );
    }

    function _getSwapAmount(
        IUniswapV2Pair pair,
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
            uint256 denominator = (halfInvestment * reserveB.sub(nominator)) /
                reserveA.add(halfInvestment);
            swapAmount = investmentA.sub(
                babylonianSqrt(
                    (halfInvestment * halfInvestment * nominator) / denominator
                )
            );
        }
    }

    function _getStableSwap(
        IUniswapV2Pair pair,
        uint256 investmentA,
        uint256 halfInvestment,
        address tokenA,
        address tokenB
    ) private view returns (uint256 swapAmount) {
        uint out = pair.getAmountOut(halfInvestment, tokenA);
        (uint amountA, uint amountB, ) = ROUTER.quoteAddLiquidity(
            tokenA,
            tokenB,
            pair.stable(),
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

    // credit for this implementation goes to
    // https://github.com/abdk-consulting/abdk-libraries-solidity/blob/master/ABDKMath64x64.sol#L687
    function babylonianSqrt(uint256 x) internal pure returns (uint256) {
        if (x == 0) return 0;
        // this block is equivalent to r = uint256(1) << (BitMath.mostSignificantBit(x) / 2);
        // however that code costs significantly more gas
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
        if (xx >= 0x8) {
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
