// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";


contract PropertyRentalOracle {
    struct Property {
        uint256 id;
        string name;
        string location;
        uint256 pricePerDay;
        address payable owner;
    }


    AggregatorV3Interface internal priceFeed;



    // constructor(address _ownerContract, address _clientContract, address _nftContract, address _priceFeed) {
    //     ownerContract = Owner(_ownerContract);
    //     clientContract = Client(_clientContract);
    //     nftContract = NFT(_nftContract);
    //     priceFeed = AggregatorV3Interface(_priceFeed);
    // }

        constructor(address _priceFeed) {

        priceFeed = AggregatorV3Interface(_priceFeed);
    }

    function getLatestPrice() public view returns (int256) {
        (, int256 price, , , ) = priceFeed.latestRoundData();
        return price; // Price in 8 decimal places (e.g., $2000.00000000)
    }

 
    receive() external payable {}

    fallback() external payable { }

}
