// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Owner {
    mapping(address => bool) public isOwner;
    mapping(address => uint256[]) public ownerProperties;

    address public propertyRentalContract;

    modifier onlyPropertyRental() {
        require(msg.sender == propertyRentalContract, "Only PropertyRental can call this function");
        _;
    }

    constructor(address _propertyRentalContract) {
        propertyRentalContract = _propertyRentalContract;
        isOwner[msg.sender] = true; // Deployer is the first owner
    }

    function addOwner(address _owner) external onlyPropertyRental {
        isOwner[_owner] = true;
    }

    function addProperty(address _owner, uint256 _propertyId) external {
        require(isOwner[_owner], "Not a registered owner");
        ownerProperties[_owner].push(_propertyId);
    }

    function getOwnerProperties(address _owner) external view returns (uint256[] memory) {
        return ownerProperties[_owner];
    }
}
