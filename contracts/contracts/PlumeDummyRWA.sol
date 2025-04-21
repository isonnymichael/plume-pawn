// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract PlumeDummyRWA is ERC721Enumerable, Ownable {
    uint256 public nextTokenId = 1;
    mapping(uint256 => uint256) public tokenValues;

    constructor() ERC721("Plume RWA", "pRWA") Ownable(msg.sender) {}

    function mint(address to, uint256 value) external onlyOwner {
        uint256 tokenId = nextTokenId++;
        _safeMint(to, tokenId);
        tokenValues[tokenId] = value;
    }

    function getTokenValue(uint256 tokenId) external view returns (uint256) {
        return tokenValues[tokenId];
    }
}