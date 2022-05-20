// SPDX-License-Identifier: MIT

pragma solidity 0.8.11;

import "./../interfaces/IExchangeAdapter.sol";
import "@openzeppelin/contracts/interfaces/IERC20Metadata.sol";

// solhint-disable func-name-mixedcase
// solhint-disable var-name-mixedcase

interface ICurveEURt {
    function exchange(
        uint256 i,
        uint256 j,
        uint256 dx,
        uint256 min_dy
    ) external returns (uint256);

    function add_liquidity(uint256[2] memory amounts, uint256 min_mint_amount)
        external
        returns (uint256);

    function remove_liquidity_one_coin(
        uint256 token_amount,
        uint256 i,
        uint256 min_amount
    ) external returns (uint256);
}

interface ICurveam3Crv {
    function add_liquidity(uint256[3] memory amounts, uint256 min_mint_amount)
        external
        returns (uint256);

    function remove_liquidity_one_coin(
        uint256 _token_amount,
        int128 i,
        uint256 min_amount
    ) external
    returns (uint256);
}

contract CurveEURtAdapter {
    address public constant crvEURTUSD_LpToken = 0x600743B1d8A96438bD46836fD34977a00293f6Aa; //Curve EURT-3Crv (crvEURTUSD) 
    ICurveam3Crv public constant poolam3Crv = 
        ICurveam3Crv(0x445FE580eF8d70FF569aB36e80c647af338db351); // Curve.Polygon Aave Pool Contract

    function indexByUnderlyingCoin(address coin) public pure returns (uint256) {
        if (coin == 0x7BDF330f423Ea880FF95fC41A280fD5eCFD3D09f) return 1; // EURt polygon
        if (coin == 0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063) return 2; // dai polygon
        if (coin == 0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174) return 3; // usdc polygon
        if (coin == 0xc2132D05D31c914a87C6611C10748AEb04B58e8F) return 4; // usdt polygon
        return 0;
    }
    
    function indexByCoin(address coin) public pure returns (uint256) {
        if (coin == 0x7BDF330f423Ea880FF95fC41A280fD5eCFD3D09f) return 1; // EURt polygon
        if (coin == 0xE7a24EF0C5e95Ffb0f6684b813A78F2a3AD7D171) return 2; // am3Crv (From Curve.Polygon Aave Pool -> Token Contract)
        return 0;
    }

    // 0x6012856e  =>  executeSwap(address,address,address,uint256)
    function executeSwap(
        address pool,
        address fromToken,
        address toToken,
        uint256 amount
    ) external payable returns (uint256) {
        ICurveEURt curve = ICurveEURt(pool);
        uint256 i = indexByUnderlyingCoin(fromToken);
        uint256 j = indexByUnderlyingCoin(toToken);
        require(i != 0 && j != 0, "EURtAdapter: can't swap");

        return curve.exchange(i - 1, j - 1, amount, 0);
    }

    // 0xe83bbb76  =>  enterPool(address,address,address,uint256)
    function enterPool(
        address pool,
        address fromToken,
        uint256 amount
    ) external payable returns (uint256) {
        ICurveEURt curve = ICurveEURt(pool);

        uint256 i = indexByCoin(fromToken);

        if (i != 0) {
            uint256[2] memory entryVector_;
            entryVector_[i - 1] = amount;
            return curve.add_liquidity(entryVector_, 0);
        }

        i = indexByUnderlyingCoin(fromToken);
        IERC20 amthreeCrvToken = IERC20(
            0xE7a24EF0C5e95Ffb0f6684b813A78F2a3AD7D171 // Gas saving ? 
        );

        require(i != 0, "EURtAdapter: can't enter");
        uint256[3] memory entryVector;
        entryVector[i - 2] = amount;

        poolam3Crv.add_liquidity(entryVector, 0);
        return
            curve.add_liquidity([0, amthreeCrvToken.balanceOf(address(this))], 0);
    }

    // 0x9d756192  =>  exitPool(address,address,address,uint256)
    function exitPool(
        address pool,
        address toToken,
        uint256 amount
    ) external payable returns (uint256) {
        ICurveEURt curve = ICurveEURt(pool);

        uint256 i = indexByCoin(toToken);

        if (i != 0) {
            return curve.remove_liquidity_one_coin(amount, i - 1, 0);
        }

        i = indexByUnderlyingCoin(toToken);
        require(i != 0, "EURtAdapter: can't exit");
        uint256 amountam3Crv = curve.remove_liquidity_one_coin(amount, 1, 0);
        poolam3Crv.remove_liquidity_one_coin(amountam3Crv, int128(uint128(i - 2)), 0);

        return IERC20(toToken).balanceOf(address(this));
    }
}

