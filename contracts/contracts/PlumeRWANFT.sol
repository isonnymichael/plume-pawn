// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract PlumeRWANFT is ERC1155, Ownable {
    uint256 public nextTokenId = 1;

    struct AssetInfo {
        string name;
        string ticker;
        uint256 supply;
        string metadataURI;
    }

    mapping(uint256 => AssetInfo) public assetInfo;

    constructor() ERC1155("") {}

    function mintRWA(
        string memory name,
        string memory ticker,
        uint256 amount,
        string memory metadataURI
    ) external onlyOwner {
        uint256 tokenId = nextTokenId++;

        _mint(msg.sender, tokenId, amount, "");

        assetInfo[tokenId] = AssetInfo({
            name: name,
            ticker: ticker,
            supply: amount,
            metadataURI: metadataURI
        });

        _setURI(metadataURI);
    }

    function uri(uint256 tokenId) public view override returns (string memory) {
        return assetInfo[tokenId].metadataURI;
    }
}