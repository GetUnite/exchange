// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface IStargateEth {
    function allowance(address, address) external view returns (uint256);

    function approve(address guy, uint256 wad) external returns (bool);

    function balanceOf(address) external view returns (uint256);

    function decimals() external view returns (uint8);

    function deposit() external payable;

    function name() external view returns (string memory);

    function noUnwrapTo(address) external view returns (bool);

    function owner() external view returns (address);

    function renounceOwnership() external;

    function setNoUnwrapTo(address _addr) external;

    function symbol() external view returns (string memory);

    function totalSupply() external view returns (uint256);

    function transfer(address dst, uint256 wad) external returns (bool);

    function transferFrom(
        address src,
        address dst,
        uint256 wad
    ) external returns (bool);

    function transferOwnership(address newOwner) external;

    function withdraw(uint256 wad) external;
}
