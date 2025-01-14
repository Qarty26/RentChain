// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "hardhat/console.sol";

contract Client {
    mapping(address => bool) public isClient;
    mapping(address => uint256[]) public clientBookings;
    mapping(address => mapping(uint256 => uint256[2])) public bookingDates;

    address public propertyRentalContract;

    modifier onlyPropertyRental() {
        require(msg.sender == propertyRentalContract, "Only PropertyRental can call this function");
        _;
    }

    constructor(address _propertyRentalContract) {
        propertyRentalContract = _propertyRentalContract;
    }


    function addBooking(address _client, uint256 _propertyId, uint256 startDate, uint256 endDate) external {
        clientBookings[_client].push(_propertyId);
        bookingDates[_client][_propertyId] = [startDate, endDate];
        isClient[_client] = true;
        
    }

    function extendBooking(address _client, uint256 _propertyId, uint256 startDate, uint256 endDate) external {
        
        require(isClient[_client] == true, "This address never booked a property!");
        require(startDate == bookingDates[_client][_propertyId][0], "Start date does not match!");
        require(endDate >= bookingDates[_client][_propertyId][1], "End date does not extend current booking!");

        bookingDates[_client][_propertyId] = [startDate, endDate];

    }

    function getBookingInterval(address _client, uint256 _propertyId) external view returns (uint256[2] memory){

        return bookingDates[_client][_propertyId]; 
    }


    function getClientBookings(address _client) external view returns (uint256[] memory) {

        require(isClient[_client], "Client never booked a property");
        return clientBookings[_client];
    }
}
