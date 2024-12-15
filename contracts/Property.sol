// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract PropertyRental {
    struct Property {
        uint256 id; 
        string name; 
        string location; 
        uint256 pricePerDay; // Price in wei per day
        address owner;
    }

    struct Booking {
        uint256 propertyId;
        uint256 startDate; // UNIX timestamp for the start date
        uint256 endDate;   // UNIX timestamp for the end date
        address renter;    // Address of the person who booked
    }

    uint256 public propertyCount;
    mapping(uint256 => Property) public properties; 
    mapping(uint256 => mapping(uint256 => bool)) public bookings; // propertyId => date (UNIX timestamp) => isBooked
    mapping(uint256 => Booking[]) public propertyBookings; // propertyId => list of bookings

    mapping(address => Booking[]) public userBookings; // user address => list of their bookings
    mapping(address => bool) public isOwner; 

    event PropertyAdded(uint256 id, string name, string location, address owner);
    event PropertyBooked(uint256 propertyId, uint256 startDate, uint256 endDate, address renter);

    constructor() {
        // Contract deployer becomes the first owner
        isOwner[msg.sender] = true;
    }

    modifier onlyOwner() {
        require(isOwner[msg.sender], "Caller is not an owner");
        _;
    }

    modifier propertyExists(uint256 _propertyId) {
        require(_propertyId > 0 && _propertyId <= propertyCount, "Property does not exist");
        _;
    }

    function addOwner(address _newOwner) external onlyOwner {
        isOwner[_newOwner] = true;
    }

    function addProperty(string memory _name, string memory _location, uint256 _pricePerDay) external onlyOwner {
        require(_pricePerDay > 0, "Price per day must be greater than zero");

        propertyCount++;
        properties[propertyCount] = Property({
            id: propertyCount,
            name: _name,
            location: _location,
            pricePerDay: _pricePerDay,
            owner: msg.sender
        });

        emit PropertyAdded(propertyCount, _name, _location, msg.sender);
    }

    function bookProperty(
        uint256 _propertyId, 
        uint256 _startDate, 
        uint256 _endDate
    ) 
        external 
        payable 
        propertyExists(_propertyId) 
    {
        Property storage property = properties[_propertyId];

        // Ensure the start date is before the end date
        require(_startDate < _endDate, "Invalid booking period");

        // Calculate the number of days and the total price
        uint256 daysToBook = (_endDate - _startDate) / 1 days;
        uint256 totalPrice = daysToBook * property.pricePerDay;

        // Ensure the correct payment is sent
        require(msg.value == totalPrice, "Incorrect payment amount");

        // Check availability for all requested dates
        for (uint256 date = _startDate; date < _endDate; date += 1 days) {
            require(!bookings[_propertyId][date], "Property is already booked for one or more selected dates");
        }

        // Mark the property as booked for each date
        for (uint256 date = _startDate; date < _endDate; date += 1 days) {
            bookings[_propertyId][date] = true;
        }

        // Save the booking
        Booking memory newBooking = Booking({
            propertyId: _propertyId,
            startDate: _startDate,
            endDate: _endDate,
            renter: msg.sender
        });
        propertyBookings[_propertyId].push(newBooking);
        userBookings[msg.sender].push(newBooking);

        // Emit the booking event
        emit PropertyBooked(_propertyId, _startDate, _endDate, msg.sender);
    }

    function getBookings(uint256 _propertyId) 
        external 
        view 
        propertyExists(_propertyId) 
        returns (Booking[] memory) 
    {
        return propertyBookings[_propertyId];
    }

    function getUserBookings(address _user) 
        external 
        view 
        returns (Booking[] memory) 
    {
        return userBookings[_user];
    }
}
