// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract PlumeRWANFT is ERC1155, Ownable {
    using Strings for uint256;
    
    uint256 public nextTokenId = 1;

    struct AssetInfo {
        string name;
        string ticker;
        uint256 maxSupply;
        uint256 currentSupply;
        string metadataURI;
    }

    mapping(uint256 => AssetInfo) public assetInfo;
    mapping(uint256 => address) public tokenCreators;

    event AssetMinted(
        uint256 indexed tokenId,
        string name,
        string ticker,
        uint256 amount,
        string metadataURI,
        address creator
    );

    constructor() ERC1155("") Ownable(msg.sender) {}

    function mintRWA(
        string memory name,
        string memory ticker,
        uint256 amount,
        string memory metadataURI
    ) external onlyOwner returns (uint256) {
        require(amount > 0, "Amount must be greater than 0");
        require(bytes(name).length > 0, "Name cannot be empty");
        require(bytes(ticker).length > 0, "Ticker cannot be empty");
        require(bytes(metadataURI).length > 0, "Metadata URI cannot be empty");

        uint256 tokenId = nextTokenId++;

        _mint(msg.sender, tokenId, amount, "");

        assetInfo[tokenId] = AssetInfo({
            name: name,
            ticker: ticker,
            maxSupply: amount,
            currentSupply: amount,
            metadataURI: metadataURI
        });
        
        tokenCreators[tokenId] = msg.sender;

        emit AssetMinted(tokenId, name, ticker, amount, metadataURI, msg.sender);
        
        return tokenId;
    }

    function uri(uint256 tokenId) public view override returns (string memory) {
        require(tokenId > 0 && tokenId < nextTokenId, "Token does not exist");
        return assetInfo[tokenId].metadataURI;
    }

    function getAssetInfo(uint256 tokenId) public view returns (AssetInfo memory) {
        require(tokenId > 0 && tokenId < nextTokenId, "Token does not exist");
        return assetInfo[tokenId];
    }

    function getTokenCreator(uint256 tokenId) public view returns (address) {
        require(tokenId > 0 && tokenId < nextTokenId, "Token does not exist");
        return tokenCreators[tokenId];
    }
}