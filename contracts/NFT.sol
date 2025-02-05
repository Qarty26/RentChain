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
        
        require(bytes(name).length > 0, "Token name cannot be empty");
        require(bytes(description).length > 0, "Token description cannot be empty");
        require(bytes(url).length > 0, "Token URL cannot be empty");

        tokenCount++;
        uint256 newTokenId = tokenCount;
        _safeMint(owner, newTokenId);

        tokens[owner].push(newTokenId);
        names[newTokenId] = name;
        descriptions[newTokenId] = description;
        imagesUrls[newTokenId] = url;

        emit TokenMinted(newTokenId, name, owner);
    }

    function updateNFT(uint256 tokenId, string memory name, string memory description) external {
        
        names[tokenId] = name;
        descriptions[tokenId] = description;

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
    function getName(uint256 tokenId) public view returns (string memory) {
        return names[tokenId];
    }

    function getDescription(uint256 tokenId) public view returns (string memory) {
        return descriptions[tokenId];
    }

    function getUrl(uint256 tokenId) public view returns (string memory) {
        return imagesUrls[tokenId];
    }


    function getTokenIds() public view returns (uint256[] memory) {

        return tokens[msg.sender];
    }
}
