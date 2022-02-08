// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.0;

// import './ERC721.sol';
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract XTerra {
    address private marketOwner;
    uint256 private auctionDuration;
    uint256 private minBid;

    bytes4 private constant INTERFACE_ID_ERC721 = 0x80ac58cd;
    bytes4 private constant INTERFACE_ID_ERC1155 = 0xd9b67a26;

    mapping(uint256 => address) private _tokenCreators;
    mapping(uint256 => address[]) private _tokenBidders;

    constructor() {
        marketOwner = msg.sender;
    }

    
    struct Listing {
        uint256 quantity;
        address payToken;
        uint256 pricePerItem;
        uint256 startingTime;
    }

    /// @notice Structure for offer
    struct Offer {
        IERC20 payToken;
        uint256 quantity;
        uint256 pricePerItem;
        uint256 deadline;
    }



    modifier isListed(
        address _nftAddress,
        uint256 _tokenId,
        address _owner
    ) {
        require();
    }

    modifier notListed(
        address _nftAddress,
        uint256 _tokenId,
        address _owner
    ) {
        require();
    }

    function registerProperty(
        address _nftAddress,
        uint256 _tokenId,
        uint256 _quantity,
        address _payToken,
        uint256 _pricePerItem,
        string memory uri) public {

        if (IERC165(_nftAddress).supportsInterface(INTERFACE_ID_ERC721)) {
            IERC721 nft = IERC721(_nftAddress);
            require(nft.ownerOf(_tokenId) == _msgSender(), "not owning item");
            require(
                nft.isApprovedForAll(_msgSender(), address(this)),
                "item not approved"
            );
        } else if (
            IERC165(_nftAddress).supportsInterface(INTERFACE_ID_ERC1155)
        ) {
            IERC1155 nft = IERC1155(_nftAddress);
            require(
                nft.balanceOf(_msgSender(), _tokenId) >= _quantity,
                "must hold enough nfts"
            );
            require(
                nft.isApprovedForAll(_msgSender(), address(this)),
                "item not approved"
            );
        } else {
            revert("invalid nft address");
        }

        _mint(msg.sender, _tokenId, uri);
    }

    function _mint(
        address creator,
        uint256 _tokenId,
        string memory tokenURI
    ) internal {}

    function listItem(uint256 _tokenId) public {}

    function buyItme(uint256 _tokenId) public {}

    function cancelListing(uint256 _tokenId) public {}

    function listItemOnAuction(uint256 _tokenId) public {}

    function makeBid(uint256 _tokenId, uint256 amount) public {}

    function finishAuction(uint256 _tokenId) public {}

    function cancelAuction(uint256 _tokenId) public {}
}
