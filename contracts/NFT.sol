// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "hardhat/console.sol";

contract NFT is ERC721 {
    uint256 public tokenCount = 0;

    event TokenMinted(uint256 id, string name, address owner);

    mapping(address => uint256[]) private tokens;
    mapping(uint256 => string) private names;
    mapping(uint256 => string) private descriptions;
    mapping(uint256 => string) private imagesUrls;

    constructor() ERC721("PropertyToken", "PTK") {}

    function createToken(
        address owner,
        string memory name,
        string memory description,
        string memory url
    ) external {
        

        tokenCount++;
        uint256 newTokenId = tokenCount;
        _safeMint(owner, newTokenId);

        tokens[owner].push(newTokenId);
        names[newTokenId] = name;
        descriptions[newTokenId] = description;
        imagesUrls[newTokenId] = url;

        console.logString("NFT Created for:");
        console.logAddress(owner);

        emit TokenMinted(newTokenId, name, owner);
    }

    function transferToken(address from, address to, uint256 tokenId) external {
            
        address tokenOwner = ownerOf(tokenId);
        require(
            msg.sender == tokenOwner || getApproved(tokenId) == msg.sender || isApprovedForAll(tokenOwner, msg.sender),
            "Caller is not owner nor approved"
        );

        safeTransferFrom(from, to, tokenId);

        tokens[from].pop();
        tokens[to].push(tokenId);
    }

    // Public getters for token metadata
    function name(uint256 tokenId) public view returns (string memory) {
        return names[tokenId];
    }

    function description(uint256 tokenId) public view returns (string memory) {
        return descriptions[tokenId];
    }

    function url(uint256 tokenId) public view returns (string memory) {
        return imagesUrls[tokenId];
    }


    function getTokenIds() public view returns (uint256[] memory) {

        console.logString("Msg sender:");
        console.logAddress(msg.sender);
        return tokens[msg.sender];
    }
}
