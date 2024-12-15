// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./Owner.sol";
import "./Client.sol";

contract PropertyRental {
    struct Property {
        uint256 id;
        string name;
        string location;
        uint256 pricePerDay;
        address owner;
    }

    uint256 public propertyCount;
    mapping(uint256 => Property) public properties;
    mapping(uint256 => mapping(uint256 => bool)) public isBooked; // propertyId -> day -> isBooked

    Owner public ownerContract;
    Client public clientContract;

    event PropertyAdded(uint256 id, string name, string location, address owner);
    event PropertyBooked(uint256 id, address client, uint256 startDate, uint256 endDate);

    constructor(address _ownerContract, address _clientContract) {
        ownerContract = Owner(_ownerContract);
        clientContract = Client(_clientContract);
    }

    function addProperty(string memory _name, string memory _location, uint256 _pricePerDay) external {
        require(ownerContract.isOwner(msg.sender), "Only owners can add properties");
        require(_pricePerDay > 0, "Price per day must be greater than zero");

        propertyCount++;
        properties[propertyCount] = Property({
            id: propertyCount,
            name: _name,
            location: _location,
            pricePerDay: _pricePerDay,
            owner: msg.sender
        });

        ownerContract.addProperty(msg.sender, propertyCount);
        emit PropertyAdded(propertyCount, _name, _location, msg.sender);
    }

    function bookProperty(uint256 _propertyId, uint256 _startDate, uint256 _endDate) external payable {
        require(clientContract.isClient(msg.sender), "Only clients can book properties");
        require(_startDate < _endDate, "Invalid booking dates");
        require(properties[_propertyId].id != 0, "Property does not exist");

        uint256 totalCost = (properties[_propertyId].pricePerDay) * ((_endDate - _startDate) / 1 days);
        require(msg.value >= totalCost, "Insufficient payment");

        for (uint256 day = _startDate / 1 days; day < _endDate / 1 days; day++) {
            require(!isBooked[_propertyId][day], "Property already booked for one or more days");
            isBooked[_propertyId][day] = true;
        }

        clientContract.addBooking(msg.sender, _propertyId);
        emit PropertyBooked(_propertyId, msg.sender, _startDate, _endDate);
    }

    function getPropertiesByOwner(address _owner) external view returns (uint256[] memory) {
        return ownerContract.getOwnerProperties(_owner);
    }

    function getUserBookings(address _client) external view returns (uint256[] memory) {
        return clientContract.getClientBookings(_client);
    }
}
