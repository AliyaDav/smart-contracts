// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/IERC721Metadata.sol";

contract MyNFT is IERC721, IERC721Metadata {
    string private _name;
    string private _symbol;

    mapping(uint256 => address) private _owners;
    mapping(address => uint256) private _balances;
    mapping(uint256 => address) private _tokenApprovals;
    mapping(address => mapping(address => bool)) private _operatorApprovals;
    mapping(uint256 => string) private _tokenURIs;

    constructor(string memory name_, string memory symbol_) {
        _name = name_;
        _symbol = symbol_;
    }

    /* ======================= Modifiers ======================= */

    modifier _tokenExists(uint256 tokenId) {
        require(_owners[tokenId] != address(0), "Token does not exist");
        _;
    }

    /* ======================= Getters ======================= */

    function balanceOf(address owner) external view returns (uint256) {
        require(owner != address(0), "Zero address cannot be owner");
        return (_balances[owner]);
    }

    function ownerOf(uint256 _tokenId)
        external
        view
        _tokenExists
        returns (address)
    {
        return (_owners[_tokenId]);
    }

    function name() external view returns (string) {
        return (_name);
    }

    function symbol() external view returns (string) {
        return (_symbol);
    }

    function tokenURI(uint256 _tokenId) public view returns (string) {
        return (_tokenURIs[_tokenId]);
    }

    /* ======================= Functions ======================= */

    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId
    ) external;

    function transferFrom(
        address from,
        address to,
        uint256 tokenId
    ) external;

    function approve(address to, uint256 tokenId) external {}

    // Returns the account approved for `tokenId` token.
    function getApproved(uint256 tokenId)
        external
        view
        _tokenURIs
        returns (address)
    {
        return (_tokenApprovals[tokenId]);
    }

    /**
     * @dev Approve or remove `operator` as an operator for the caller.
     * Operators can call {transferFrom} or {safeTransferFrom} for any token owned by the caller.
     *
     * Requirements:
     *
     * - The `operator` cannot be the caller.
     *
     * Emits an {ApprovalForAll} event.
     */
    function setApprovalForAll(address operator, bool _approved) external {
        require(operator != msg.sender, "Operator cannot be the caller");

        emit ApprovalForAll(msg.sender, operator, _approved);
    }

    // Returns if the `operator` is allowed to manage all of the assets of `owner`.
    function isApprovedForAll(address owner, address operator)
        external
        view
        returns (bool);

    /**
     * @dev Safely transfers `tokenId` token from `from` to `to`.
     *
     * Requirements:
     *
     * - `from` cannot be the zero address.
     * - `to` cannot be the zero address.
     * - `tokenId` token must exist and be owned by `from`.
     * - If the caller is not `from`, it must be approved to move this token by either {approve} or {setApprovalForAll}.
     * - If `to` refers to a smart contract, it must implement {IERC721Receiver-onERC721Received}, which is called upon a safe transfer.
     *
     * Emits a {Transfer} event.
     */
    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId,
        bytes calldata data
    ) external;

    //URIs are generated through the python script create_URI.py
    function _setTokenURI(uint256 tokenId, string memory _uri)
        internal
        validateSender
        existingToken(tokenId)
    {
        // require(_isApprovedOrOwner(msg.sender, tokenId), "ERC721 transfer caller is nor owner not approved");
        _tokenURIs[tokenId] = _uri;
    }

    // We (the company) mint the NFTs
    function mintNFT(string memory _uri, address _owner)
        public
        validateSender
        returns (uint256)
    {
        uint256 newItemId = tokenCounter;
        _safeMint(_owner, newItemId);
        _setTokenURI(newItemId, _uri);
        tokenCounter++;

        tokenColleteralizaion[newItemId] = false; //by default the token is not used as collateral
        return newItemId;
    }

    function gettokenURI(uint256 tokenId)
        public
        view
        existingToken(tokenId)
        returns (string memory)
    {
        string memory _uri = _tokenURIs[tokenId];
        return _uri;
    }

    function burnNFT(uint256 tokenId) public existingToken(tokenId) {
        //_burn already checks that msg.sender = owner
        _burn(tokenId);
        delete tokenColleteralizaion[tokenId];
        delete _tokenURIs[tokenId];
    }

    event Transfer(
        address indexed from,
        address indexed to,
        uint256 indexed tokenId
    );
    event Approval(
        address indexed owner,
        address indexed approved,
        uint256 indexed tokenId
    );
    event ApprovalForAll(
        address indexed owner,
        address indexed operator,
        bool approved
    );
}
