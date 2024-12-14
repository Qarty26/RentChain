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

    uint256 public propertyCount;
    mapping(uint256 => Property) public properties; 
    mapping(address => bool) public isOwner; 

    event PropertyAdded(uint256 id, string name, string location, address owner);

    constructor() {
        // Contract deployer becomes the first owner
        isOwner[msg.sender] = true;
    }

    modifier onlyOwner() {
        require(isOwner[msg.sender], "Caller is not an owner");
        _;
    }

    function addOwner(address _newOwner) external onlyOwner {
        isOwner[_newOwner] = true;
    }

    function addProperty(string memory _name, string memory _location, uint256 _pricePerDay) external {
        require(isOwner[msg.sender], "Only owners can add properties");
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
}
