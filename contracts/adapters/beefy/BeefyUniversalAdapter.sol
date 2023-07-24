// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {IExchangeAdapter} from "./../../interfaces/IExchangeAdapter.sol";
import {IBeefyVaultV6} from "./IBeefyVault.sol";
import "./../../interfaces/IVelodromePool.sol";
import "@openzeppelin/contracts/interfaces/IERC20Metadata.sol";
import "./../../interfaces/IWrappedEther.sol";
import "./../../interfaces/IPriceRouterV2.sol";

interface IBeefyZap {
    function beefIn(
        address beefyVault,
        uint256 tokenAmountOutMin,
        address tokenIn,
        uint256 tokenInAmount
    ) external;

    function beefOutAndSwap(
        address beefyVault,
        uint256 withdrawAmount,
        address desiredToken,
        uint256 desiredTokenOutMin
    ) external;
}

contract BeefyUniversalAdapter is IExchangeAdapter {
    IWrappedEther public constant WETH =
        IWrappedEther(0x4200000000000000000000000000000000000006);
    IPriceFeedRouterV2 public constant PRICE_ROUTER =
        IPriceFeedRouterV2(0x7E6FD319A856A210b9957Cd6490306995830aD25);
    uint256 public constant MINIMUM_BEEF_IN = 1000;

    event NeedPriceFeed(address indexed token);

    // Needs extra approval of the opposite token in Velodrome pool
    // 0x6012856e  =>  executeSwap(address,address,address,uint256)
    function executeSwap(
        address pool,
        address fromToken,
        address toToken,
        uint256 amount
    ) external payable returns (uint256) {
        if (isBeefyVault(toToken)) {
            address oppositeToken = getOppositeToken(toToken, fromToken);

            (uint256 originBalance, uint256 oppositeBalance) = beefInAndWrap(
                pool,
                toToken,
                fromToken,
                oppositeToken,
                amount
            );

            loop(
                pool,
                fromToken,
                oppositeToken,
                originBalance,
                oppositeBalance,
                toToken
            );

            originBalance = IERC20(fromToken).balanceOf(address(this));
            oppositeBalance = IERC20(oppositeToken).balanceOf(address(this));

            if (originBalance > 0) {
                IERC20(fromToken).transfer(msg.sender, originBalance);
            }

            if (oppositeBalance > 0) {
                IERC20(oppositeToken).transfer(msg.sender, oppositeBalance);
            }

            return IERC20(toToken).balanceOf(address(this));
        } else if (isBeefyVault(fromToken)) {
            address oppositeToken = getOppositeToken(fromToken, toToken);

            uint256 result = beefOutAndWrap(pool, fromToken, toToken, amount);

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
            revert("BeefyUniversalAdapter: cant swap");
        }
    }

    function loop(
        address pool,
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

        uint256 priceOriginGoal = 10 ** (priceDecimalsOrigin - 3);
        uint256 priceOppositeGoal = 10 ** (priceDecimalsOpposite - 3);

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
            ) = beefInAndWrap(
                    pool,
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
            IBeefyVaultV6(beefyVault).want()
        );
        address token0 = veloPool.token0();
        address token1 = veloPool.token1();

        return (token0 == originToken) ? token1 : token0;
    }

    function beefInAndWrap(
        address pool,
        address beefyToken,
        address from,
        address oppositeFrom,
        uint256 amount
    ) private returns (uint256 fromAmount, uint256 oppositeFromAmount) {
        IBeefyZap(pool).beefIn(beefyToken, 0, from, amount);
        wrap(from, oppositeFrom);

        fromAmount = IERC20(from).balanceOf(address(this));
        oppositeFromAmount = IERC20(oppositeFrom).balanceOf(address(this));
    }

    function beefOutAndWrap(
        address pool,
        address beefyToken,
        address to,
        uint256 amount
    ) private returns (uint256) {
        IBeefyZap(pool).beefOutAndSwap(beefyToken, amount, to, 0);
        wrap(to, address(0));

        return IERC20(to).balanceOf(address(this));
    }

    function wrap(address tokenA, address tokenB) private {
        uint256 balance = address(this).balance;
        if (
            (tokenA == address(WETH) || tokenB == address(WETH)) && balance > 0
        ) {
            WETH.deposit{value: balance}();
        }
    }

    function isBeefyVault(address vaultAddress) public view returns (bool) {
        bytes memory symbol = bytes(IERC20Metadata(vaultAddress).symbol());

        if (
            symbol[0] == bytes1("m") &&
            symbol[1] == bytes1("o") &&
            symbol[2] == bytes1("o")
        ) {
            try IBeefyVaultV6(vaultAddress).getPricePerFullShare() returns (
                uint256
            ) {
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
        revert("BeefyUniversalAdapter: !enter");
    }

    // 0x660cb8d4  =>  exitPool(address,address,uint256)
    function exitPool(
        address,
        address,
        uint256
    ) external payable returns (uint256) {
        revert("BeefyUniversalAdapter: !enter");
    }
}