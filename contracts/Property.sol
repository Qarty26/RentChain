// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./Owner.sol";
import "./Client.sol";
import "./NFT.sol";
import "hardhat/console.sol";


contract PropertyRental {
    struct Property {
        uint256 id;
        string name;
        string location;
        uint256 pricePerDay;
        address payable owner;
    }

    uint256 public propertyCount;
    mapping(uint256 => Property) public properties;
    mapping(uint256 => mapping(uint256 => bool)) public isBooked; // propertyId -> day -> isBooked
    mapping(address => uint256) public ownerRevenue;
    mapping(address => mapping(uint256 => uint256)) public bookingPayments;

    Owner public ownerContract;
    Client public clientContract;
    NFT public nftContract;

    event PropertyAdded(uint256 id, string name, string location, address owner);
    event PropertyBooked(uint256 id, address client, uint256 startDate, uint256 endDate, uint256 totalCost);
    event Withdraw(address owner, uint256 amount);

    constructor(address _ownerContract, address _clientContract, address _nftContract) {
        ownerContract = Owner(_ownerContract);
        clientContract = Client(_clientContract);
        nftContract = NFT(_nftContract);
    }

    function updateProperty(
        uint256 _propertyId,
        string memory _name,
        string memory _location,
        uint256 _pricePerDay
    ) external {

        require(properties[_propertyId].id != 0, "Property does not exist");
        require(properties[_propertyId].owner == msg.sender, "Only the property owner can update the property");
        require(_pricePerDay > 0, "Price per day must be greater than zero");

        properties[_propertyId].name = _name;
        properties[_propertyId].location = _location;
        properties[_propertyId].pricePerDay = _pricePerDay;

        nftContract.updateNFT(_propertyId, _name, _location);

        emit PropertyAdded(_propertyId, _name, _location, msg.sender);
    }


    function addProperty(
        string memory _name,
        string memory _location,
        uint256 _pricePerDay
    ) external {
        require(ownerContract.isOwner(msg.sender), "Only owners can add properties");
        require(_pricePerDay > 0, "Price per day must be greater than zero");

        propertyCount++;
        properties[propertyCount] = Property({
            id: propertyCount,
            name: _name,
            location: _location,
            pricePerDay: _pricePerDay,
            owner: payable(msg.sender)
        });

        nftContract.createToken(msg.sender, _name, _location, _location);

        ownerContract.addProperty(msg.sender, propertyCount);
        emit PropertyAdded(propertyCount, _name, _location, msg.sender);
    }

    function getPropertyCount() public view returns (uint256) {
        return propertyCount;
    }

    function getPropertyPrice(uint256 propertyId) public view returns (uint256){

        return properties[propertyId].pricePerDay;
    }


    // Book property by a client
    function bookProperty(
        uint256 _propertyId,
        uint256 _startDate,
        uint256 _endDate
    ) external payable {
        
        require(_startDate < _endDate, "Invalid booking dates");
        require(properties[_propertyId].id != 0, "Property does not exist");
        require(_endDate - _startDate >= 1 days);

        for (uint256 day = _startDate / 1 days; day < _endDate / 1 days; day++) {
            require(!isBooked[_propertyId][day], "Property already booked for one or more days");
        }

        uint256 daysToBook = (_endDate - _startDate) / 1 days;
        uint256 totalCost = properties[_propertyId].pricePerDay * daysToBook;

        require(msg.value == totalCost, "Incorrect Ether value sent");

        ownerRevenue[properties[_propertyId].owner] += msg.value;

        for (uint256 day = _startDate / 1 days; day < _endDate / 1 days; day++) {
            isBooked[_propertyId][day] = true;
        }

        bookingPayments[msg.sender][_propertyId] = msg.value;

        clientContract.addBooking(msg.sender, _propertyId, _startDate, _endDate);

        emit PropertyBooked(_propertyId, msg.sender, _startDate, _endDate, totalCost);
    }

     function extendBooking(
        uint256 _propertyId,
        uint256 extendedTime
    ) external payable {
        
        require(properties[_propertyId].id != 0, "Property does not exist");

        uint256 startDate = clientContract.getBookingInterval(msg.sender, _propertyId)[0];
        uint256 endDate = clientContract.getBookingInterval(msg.sender, _propertyId)[1];
        uint256 extendedEndDate = endDate + extendedTime; 
        uint256 daysToBook = (extendedEndDate- endDate) / 1 days;
        uint256 totalCost = properties[_propertyId].pricePerDay * daysToBook;
        require(msg.value == totalCost, "Incorrect Ether value sent");

        for (uint256 day = endDate / 1 days; day < extendedEndDate / 1 days; day++) {
            require(!isBooked[_propertyId][day], "Property already booked for one or more days");
        }


        ownerRevenue[properties[_propertyId].owner] += msg.value;

        for (uint256 day = endDate / 1 days; day < extendedEndDate / 1 days; day++) {
            isBooked[_propertyId][day] = true;
        }

        bookingPayments[msg.sender][_propertyId] += msg.value;

        clientContract.extendBooking(msg.sender, _propertyId, startDate, extendedEndDate);

        emit PropertyBooked(_propertyId, msg.sender, endDate, extendedEndDate, totalCost);
    }

    function refundBooking(uint256 _propertyId) external {
        uint256 startDate = clientContract.getBookingInterval(msg.sender, _propertyId)[0];
        uint256 endDate = clientContract.getBookingInterval(msg.sender, _propertyId)[1];

        require(startDate != 0 && endDate != 0, "No valid booking found");
        require(block.timestamp < startDate, "Cannot refund after booking start date");

        uint256 amountPaid = bookingPayments[msg.sender][_propertyId];
        require(amountPaid > 0, "No payment found for this booking");

        uint256 ownerRevenueAmount = ownerRevenue[properties[_propertyId].owner];
        require(ownerRevenueAmount >= amountPaid, "Owner does not have enough funds for refund");

        for (uint256 day = startDate / 1 days; day < endDate / 1 days; day++) {
            isBooked[_propertyId][day] = false;
        }

        clientContract.removeBooking(msg.sender, _propertyId);

        ownerRevenue[properties[_propertyId].owner] -= amountPaid;

        (bool success, ) = payable(msg.sender).call{value: amountPaid}("");
        require(success, "Refund transfer failed");

        emit Withdraw(msg.sender, amountPaid);
    }


    function calculateBookingCost(uint256 pricePerDay, uint256 numberOfDays) public pure returns (uint256) {
            return pricePerDay * numberOfDays;
        }


    function withdraw(uint256 amount) external {

        require(ownerRevenue[msg.sender] >= amount, "Insufficient revenue to withdraw");
        ownerRevenue[msg.sender] -= amount;

        (bool success, ) = payable(msg.sender).call{value: amount}("");
        require(success, "Transfer failed");

        emit Withdraw(msg.sender, amount);

    }


    function getPropertiesByOwner(address _owner) external view returns (uint256[] memory) {
        return ownerContract.getOwnerProperties(_owner);
    }


    function getUserBookings(address _client) external view returns (uint256[] memory) {
        return clientContract.getClientBookings(_client);
    }

    receive() external payable {}

    fallback() external payable { }

}
