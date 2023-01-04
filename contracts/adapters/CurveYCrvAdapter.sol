// SPDX-License-Identifier: MIT
pragma solidity ^0.8.11;

import "./../interfaces/IExchangeAdapter.sol";
import "@openzeppelin/contracts/interfaces/IERC20.sol";
import "hardhat/console.sol";

// solhint-disable func-name-mixedcase
// solhint-disable var-name-mixedcase
interface ICurveCrv {
    function exchange(
        uint256 i,
        uint256 j,
        uint256 dx,
        uint256 min_dy,
        bool use_eth
    ) external returns (uint256);

    function add_liquidity(uint256[2] memory amounts, uint256 min_mint_amount)
        external
        returns (uint256);

    function remove_liquidity_one_coin(
        uint256 token_amount,
        uint128 i,
        uint256 min_amount
    ) external returns (uint256);
}

contract CurveYCrvAdapter is IExchangeAdapter {
    address public constant yCRV = 0x453D92C7d4263201C69aACfaf589Ed14202d83a4;
    address public constant crv = 0xD533a949740bb3306d119CC777fa900bA034cd52;

    function executeSwap(
        address pool,
        address fromToken,
        address toToken,
        uint256 amount
    ) external payable returns (uint256) {
        ICurveCrv curve = ICurveCrv(pool);
        ICurveCrv CRVethCurve = ICurveCrv(
            address(0x8301AE4fc9c624d1D396cbDAa1ed877821D7C511) // eth-CRV pool
        );

        if (toToken == yCRV) {
            uint256 crvAmountToDeposit = CRVethCurve.exchange(
                0,
                1,
                amount,
                0,
                false
            );
            IERC20(crv).approve(pool, crvAmountToDeposit);
            return curve.add_liquidity([crvAmountToDeposit, 0], 0);
        } else if (fromToken == yCRV) {
            uint256 crvAmountToWithdraw = curve.remove_liquidity_one_coin(
                amount,
                0,
                0
            );

            return
                CRVethCurve.exchange(1, 0, amount, crvAmountToWithdraw, false);
        } else {
            revert("CurveYCrvAdapter: Can't Swap");
        }
    }

    // 0xe83bbb76  =>  enterPool(address,address,address,uint256)
    function enterPool(
        address,
        address,
        uint256
    ) external payable returns (uint256) {
        revert("CurveYCrvAdapter: Can't Swap");
    }

    // 0x9d756192  =>  exitPool(address,address,address,uint256)
    function exitPool(
        address,
        address,
        uint256
    ) external payable returns (uint256) {
        revert("CurveYCrvAdapter: Can't Swap");
    }
}
