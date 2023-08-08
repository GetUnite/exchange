// SPDX-License-Identifier: MIT
pragma solidity ^0.8.11;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Address} from "@openzeppelin/contracts/utils/Address.sol";

contract CallForwarder is Ownable {
    using Address for address;

    function call(address to, bytes memory data) external onlyOwner {
        to.functionCall(data);
    }

    function transferOwnership(address) public override {
        revert("CallForwarder: no owner transfer");
    }
}
