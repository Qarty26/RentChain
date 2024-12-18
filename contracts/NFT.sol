// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract NFT is ERC721 {
    uint256 public tokenCount = 0;

    event TokenMinted(uint256 id, string name, address owner);

    mapping(address => mapping(uint256 => bool)) private ownedTokens; // Mapping of mappings
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

        ownedTokens[owner][newTokenId] = true;
        names[newTokenId] = name;
        descriptions[newTokenId] = description;
        imagesUrls[newTokenId] = url;

        emit TokenMinted(newTokenId, name, owner);
    }

    function transferToken(address from, address to, uint256 tokenId) external {
            
        address tokenOwner = ownerOf(tokenId);
        require(
            msg.sender == tokenOwner || getApproved(tokenId) == msg.sender || isApprovedForAll(tokenOwner, msg.sender),
            "Caller is not owner nor approved"
        );

        safeTransferFrom(from, to, tokenId);

        require(ownedTokens[from][tokenId], "Token not owned by sender");
        ownedTokens[from][tokenId] = false; 
        ownedTokens[to][tokenId] = true;
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

    // Check if an address owns a specific token
    function isOwner(address owner, uint256 tokenId) public view returns (bool) {
        return ownedTokens[owner][tokenId];
    }


    function getTokenIds() public view returns (uint256[] memory) {
        uint256 count = 0;
        uint256[] memory temp = new uint256[](tokenCount); // Temporary storage for token IDs

        for (uint256 tokenId = 1; tokenId <= tokenCount; tokenId++) {
            if (ownedTokens[msg.sender][tokenId]) {
                temp[count] = tokenId;
                count++;
            }
        }

        uint256[] memory result = new uint256[](count);
        for (uint256 i = 0; i < count; i++) {
            result[i] = temp[i];
        }
        return result;
    }
}
