// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface IBeefyCalldataLibrary {
    function getData(
        address beefyToken,
        uint256 amount,
        bool isBuy,
        address want,
        address originToken
    ) external;
}
