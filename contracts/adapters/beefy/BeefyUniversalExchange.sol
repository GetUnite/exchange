// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {IBeefyVaultV6} from "./IBeefyVault.sol";
import {IERC20} from "@openzeppelin/contracts/interfaces/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {Address} from "@openzeppelin/contracts/utils/Address.sol";

import {IBeefyCalldataLibrary} from "./IBeefyCalldataLibrary.sol";

contract BeefyUniversalExchange is AccessControl {
    using SafeERC20 for IERC20;
    using Address for address;

    struct BeefyTokenInfo {
        address want;
        address dataContract;
        ExtCallInfo[] dataBuy;
        ExtCallInfo[] dataSell;
    }

    struct ExtCallInfo {
        address to;
        uint96 amountStartIndex;
        bytes data;
    }

    bytes32 public constant EXCHANGE_ROLE = keccak256("EXCHANGE_ROLE");
    bytes4 public constant LIBRARY_EXECUTE_SIG = 0x736286e2;
    mapping(address => BeefyTokenInfo) public beefyTokenInfo;

    constructor(address exchange, address gnosis, bool isTesting) {
        _grantRole(DEFAULT_ADMIN_ROLE, gnosis);
        _grantRole(EXCHANGE_ROLE, exchange);

        if (isTesting) {
            _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
            _grantRole(EXCHANGE_ROLE, msg.sender);
        }
    }

    function exchangeBeefy(
        address from,
        address to,
        uint256 amount
    ) external onlyRole(EXCHANGE_ROLE) returns (uint256) {
        IERC20(from).safeTransferFrom(msg.sender, address(this), amount);

        BeefyTokenInfo memory fromInfo = beefyTokenInfo[from];
        BeefyTokenInfo memory toInfo = beefyTokenInfo[to];

        uint256 amountReceived;

        if (fromInfo.want != address(0) && toInfo.want == address(0)) {
            // from beefyToken to want token
            amountReceived = exchangeBeefyToken(
                from,
                amount,
                fromInfo,
                false,
                to
            );
        } else if (fromInfo.want == address(0) && toInfo.want != address(0)) {
            // from want to beefyToken token
            amountReceived = exchangeBeefyToken(to, amount, toInfo, true, from);
        } else {
            revert("BeefyUniversalExchange: unknown");
        }

        IERC20(to).safeTransfer(msg.sender, amountReceived);
        return amountReceived;
    }

    function addBeefyPool(
        address beefyPool,
        BeefyTokenInfo memory _info
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        BeefyTokenInfo storage info = beefyTokenInfo[beefyPool];

        info.want = _info.want;
        info.dataContract = _info.dataContract;

        uint256 length = _info.dataBuy.length;
        for (uint256 i = 0; i < length; i++) {
            info.dataBuy.push(_info.dataBuy[i]);
        }

        length = _info.dataSell.length;
        for (uint256 i = 0; i < length; i++) {
            info.dataSell.push(_info.dataSell[i]);
        }
    }

    /// @notice Force approve of some coin to any pool
    /// @param coins coins list
    /// @param spenders pools list
    function createApproval(
        address[] calldata coins,
        address[] calldata spenders
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(coins.length == spenders.length, "BeefyUniversalExchange: len");
        for (uint256 i = 0; i < coins.length; i++) {
            IERC20(coins[i]).safeApprove(spenders[i], type(uint256).max);
        }
    }

    function exchangeBeefyToken(
        address beefyToken,
        uint256 amount,
        BeefyTokenInfo memory info,
        bool isBuy,
        address originToken
    ) private returns (uint256) {
        if (isBuy) {
            executePreBeefyCalls(beefyToken, amount, info, isBuy, originToken);

            uint256 depositAmount = IERC20(info.want).balanceOf(address(this));
            require(depositAmount > 0, "BeefyUniversalExchange: !tkn");

            // approval of want token has to be done to the beefy vault
            return beefyDepositAll(beefyToken);
        } else {
            amount = beefyWithdraw(beefyToken, amount);
            executePreBeefyCalls(beefyToken, amount, info, isBuy, originToken);

            return IERC20(originToken).balanceOf(address(this));
        }
    }

    function executePreBeefyCalls(
        address beefyToken,
        uint256 amount,
        BeefyTokenInfo memory info,
        bool isBuy,
        address originToken
    ) private {
        if (info.dataContract != address(0)) {
            bytes memory data = abi.encodeWithSelector(
                LIBRARY_EXECUTE_SIG,
                beefyToken,
                amount,
                isBuy,
                info.want,
                originToken
            );
            info.dataContract.functionDelegateCall(data);
        } else {
            uint256 dataLength = isBuy
                ? info.dataBuy.length
                : info.dataSell.length;

            for (uint256 i = 0; i < dataLength; i++) {
                ExtCallInfo memory callInfo = isBuy
                    ? info.dataBuy[i]
                    : info.dataSell[i];
                // console.log("before");
                // console.logBytes(callInfo.data);

                // approval needs to be done for deposits
                applyAmountToData(callInfo, amount);

                // console.log("after");
                // console.logBytes(callInfo.data);

                callInfo.to.functionCall(callInfo.data);
            }
        }
    }

    function applyAmountToData(
        ExtCallInfo memory info,
        uint256 amount
    ) private pure {
        bytes memory amountAsBytes = abi.encode(amount);
        uint256 offset = info.amountStartIndex;

        if (offset == 0) {
            return;
        }

        for (uint256 i = 0; i < 32; i++) {
            info.data[i + offset] = amountAsBytes[i];
        }
    }

    function beefyDepositAll(address beefyVault) private returns (uint256) {
        IBeefyVaultV6(beefyVault).depositAll();
        return IBeefyVaultV6(beefyVault).balanceOf(address(this));
    }

    function beefyWithdraw(
        address beefyVault,
        uint256 amount
    ) private returns (uint256) {
        IBeefyVaultV6(beefyVault).withdraw(amount);

        // using same interface for ERC20 token, because vault itself is ERC20 token
        return
            IBeefyVaultV6(IBeefyVaultV6(beefyVault).want()).balanceOf(
                address(this)
            );
    }
}
