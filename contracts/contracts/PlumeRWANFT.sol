// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract PlumeRWANFT is ERC721Enumerable, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIdCounter;

    struct RWAData {
        string name;
        string ticker;
        uint256 tokenSupply;
        string image;
    }

    mapping(uint256 => RWAData) public rwaMetadata;

    event Minted(
        address indexed to,
        uint256 indexed tokenId,
        string name,
        string ticker,
        uint256 tokenSupply,
        string image
    );

    constructor() ERC721("Plume Real World Asset", "pRWA") Ownable(msg.sender) {}

    function mint(
        string memory _name,
        string memory _ticker,
        uint256 _tokenSupply,
        string memory _image
    ) external {
        _tokenIdCounter.increment();
        uint256 newTokenId = _tokenIdCounter.current();

        _safeMint(msg.sender, newTokenId);

        rwaMetadata[newTokenId] = RWAData({
            name: _name,
            ticker: _ticker,
            tokenSupply: _tokenSupply,
            image: _image
        });

        emit Minted(msg.sender, newTokenId, _name, _ticker, _tokenSupply, _image);
    }

    function getRWAData(uint256 tokenId) external view returns (RWAData memory) {
        require(_exists(tokenId), "Token does not exist");
        return rwaMetadata[tokenId];
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_exists(tokenId), "Nonexistent token");

        RWAData memory data = rwaMetadata[tokenId];

        return string(
            abi.encodePacked(
                "data:application/json;base64,",
                _encodeMetadata(data)
            )
        );
    }

    function _encodeMetadata(RWAData memory data) internal pure returns (string memory) {
        bytes memory json = abi.encodePacked(
            '{"name":"', data.name,
            '", "description":"Tokenized RWA for ', data.name,
            '", "ticker":"', data.ticker,
            '", "supply":"', Strings.toString(data.tokenSupply),
            '", "image":"', data.image,
            '"}'
        );
        return _base64Encode(json);
    }

    function _base64Encode(bytes memory data) internal pure returns (string memory) {
        return Base64.encode(data); // Add Base64.sol from OpenZeppelin or external lib
    }
}
