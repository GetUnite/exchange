// SPDX-License-Identifier: MIT
pragma solidity ^0.8.11;

import "./../interfaces/IExchangeAdapter.sol";
import "@openzeppelin/contracts/interfaces/IERC20.sol";

// solhint-disable func-name-mixedcase
// solhint-disable var-name-mixedcase
interface ICurveCrv {
    function add_liquidity(uint256[2] memory amounts, uint256 min_mint_amount)
        external
        returns (uint256);

    function remove_liquidity_one_coin(
        uint256 token_amount,
        int128 i,
        uint256 min_amount
    ) external returns (uint256);
}

contract CurveCrvWSBTCAdapter {
    address public constant WSBTC_POOL =
        0xf253f83AcA21aAbD2A20553AE0BF7F65C755A07F;
    address public constant WSBTC = 0x051d7e5609917Bd9b73f04BAc0DED8Dd46a74301;

    // aadress public constant WBTC =

    function indexByCoin(address coin) public pure returns (int128) {
        if (coin == 0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599) return 1; // wbtc
        if (coin == 0xfE18be6b3Bd88A2D2A7f928d00292E7a9963CfC6) return 2; // Synth sBTC
        return 0;
    }

    // 0x6012856e  =>  executeSwap(address,address,address,uint256)
    function executeSwap(
        address pool,
        address fromToken,
        address toToken,
        uint256 amount
    ) external payable returns (uint256) {
        ICurveCrv curve = ICurveCrv(pool);

        if (toToken == WSBTC) {
            uint128 i = uint128(indexByCoin(fromToken));
            require(i != 0, "CurveCrvWSBTCAdapter: Can't Swap");
            uint256[2] memory entryVector;
            entryVector[i - 1] = amount;
            return curve.add_liquidity(entryVector, 0);
        } else if (fromToken == WSBTC) {
            int128 i = indexByCoin(toToken);
            require(i != 0, "CurveCrvWSBTCAdapter: Can't Swap");
            return curve.remove_liquidity_one_coin(amount, i - 1, 0);
        } else {
            revert("CurveCrvWSBTCAdapter: Can't Swap");
        }
    }

    // 0xe83bbb76  =>  enterPool(address,address,address,uint256)
    function enterPool(
        address,
        address,
        uint256
    ) external payable returns (uint256) {
        revert("CurveFraxDolaAdapter: Can't enter");
    }

    // 0x9d756192  =>  exitPool(address,address,address,uint256)
    function exitPool(
        address,
        address,
        uint256
    ) external payable returns (uint256) {
        revert("CurveFraxDolaAdapter: Can't exit");
    }
}
