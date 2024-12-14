// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Client {
    string public name;
    address public wallet;

    constructor(string memory _name) {
        name = _name;
        wallet = msg.sender;
    }
}
