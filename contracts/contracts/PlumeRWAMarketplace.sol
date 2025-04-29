// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract PlumeRWAMarketplace is ReentrancyGuard, Ownable {
    struct Listing {
        uint256 id;
        address seller;
        address tokenAddress;
        uint256 tokenId;
        uint256 pricePerUnit;
        uint256 amountAvailable;
    }

    IERC20 public immutable pUSD;

    uint256 public nextListingId;
    mapping(uint256 => Listing) public listings;
    mapping(address => uint256[]) public sellerListings;

    event Listed(
        uint256 indexed listingId,
        address indexed seller,
        address tokenAddress,
        uint256 tokenId,
        uint256 pricePerUnit,
        uint256 amount
    );

    event Purchased(
        uint256 indexed listingId,
        address indexed buyer,
        uint256 amount,
        uint256 totalPrice
    );

    constructor(address _pUSD) {
        pUSD = IERC20(_pUSD);
    }

    function list(
        address tokenAddress,
        uint256 tokenId,
        uint256 pricePerUnit,
        uint256 amount
    ) external nonReentrant {
        require(pricePerUnit > 0, "Price must be > 0");
        require(amount > 0, "Amount must be > 0");

        IERC1155(tokenAddress).safeTransferFrom(
            msg.sender,
            address(this),
            tokenId,
            amount,
            ""
        );

        listings[nextListingId] = Listing({
            id: nextListingId,
            seller: msg.sender,
            tokenAddress: tokenAddress,
            tokenId: tokenId,
            pricePerUnit: pricePerUnit,
            amountAvailable: amount
        });

        sellerListings[msg.sender].push(nextListingId);

        emit Listed(nextListingId, msg.sender, tokenAddress, tokenId, pricePerUnit, amount);
        nextListingId++;
    }

    function buy(uint256 listingId, uint256 amount) external nonReentrant {
        Listing storage l = listings[listingId];
        require(l.amountAvailable >= amount, "Not enough supply");

        uint256 totalPrice = l.pricePerUnit * amount;

        require(
            pUSD.transferFrom(msg.sender, l.seller, totalPrice),
            "pUSD transfer failed"
        );

        IERC1155(l.tokenAddress).safeTransferFrom(
            address(this),
            msg.sender,
            l.tokenId,
            amount,
            ""
        );

        l.amountAvailable -= amount;

        emit Purchased(listingId, msg.sender, amount, totalPrice);
    }

    function cancelListing(uint256 listingId) external {
        Listing storage l = listings[listingId];
        require(msg.sender == l.seller, "Only seller can cancel");
        require(l.amountAvailable > 0, "Already sold");

        IERC1155(l.tokenAddress).safeTransferFrom(
            address(this),
            l.seller,
            l.tokenId,
            l.amountAvailable,
            ""
        );

        l.amountAvailable = 0;
    }

    function getListingsBySeller(address seller) external view returns (uint256[] memory) {
        return sellerListings[seller];
    }

    function onERC1155Received(
        address,
        address,
        uint256,
        uint256,
        bytes calldata
    ) external pure returns (bytes4) {
        return this.onERC1155Received.selector;
    }

    function onERC1155BatchReceived(
        address,
        address,
        uint256[] calldata,
        uint256[] calldata,
        bytes calldata
    ) external pure returns (bytes4) {
        return this.onERC1155BatchReceived.selector;
    }
}
