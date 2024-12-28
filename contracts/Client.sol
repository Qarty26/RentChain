// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Client {
    mapping(address => bool) public isClient;
    mapping(address => uint256[]) public clientBookings;

    address public propertyRentalContract;

    modifier onlyPropertyRental() {
        require(msg.sender == propertyRentalContract, "Only PropertyRental can call this function");
        _;
    }

    constructor(address _propertyRentalContract) {
        propertyRentalContract = _propertyRentalContract;
    }

    function addClient(address _client) external onlyPropertyRental {
        require(!isClient[_client], "The address is already a client!");
        isClient[_client] = true;
    }

    function addBooking(address _client, uint256 _propertyId) external {
        require(isClient[_client], "Not a registered client");
        clientBookings[_client].push(_propertyId);
    }

    function getClientBookings(address _client) external view returns (uint256[] memory) {
        return clientBookings[_client];
    }
}
