// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
// import "@openzeppelin/contracts/token/ERC721/extensions/IERC721Metadata.sol";
// import "@openzeppelin/contracts/utils/introspection/ERC165.sol";
import "@openzeppelin/contracts/utils/Context.sol";

contract MyPropertyNft is Context, IERC721 {
    using Address for address;
    using Strings for uint256;

    // using Counter.Counter for _tokenIds; // check this

    // string private _name;
    // string private _symbol;
    address private _minter;

    mapping(uint256 => address) private _owners;
    mapping(address => uint256) private _balances;
    mapping(uint256 => address) private _tokenApprovals; // Mapping from token ID to approved address
    mapping(address => mapping(address => bool)) private _operatorApprovals; // Mapping from owner to operator approvals
    mapping(uint256 => string) private _tokenURIs;

    constructor() {
        _minter = msg.sender;
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override
        returns (bool)
    {
        return interfaceId == type(IERC165).interfaceId;
    }

    /* ======================= Modifiers ======================= */

    modifier _onlyMinter() {
        require(msg.sender == _minter, "Only minter allowed");
        _;
    }

    /* ======================= Getters ======================= */

    function balanceOf(address owner)
        public
        view
        virtual
        override
        returns (uint256)
    {
        require(owner != address(0), "Zero address cannot be owner");
        return (_balances[owner]);
    }

    function ownerOf(uint256 _tokenId)
        public
        view
        virtual
        override
        returns (address)
    {
        require(_exists(_tokenId), "Token does not exist");
        return (_owners[_tokenId]);
    }

    function tokenURI(uint256 _tokenId)
        external
        view
        virtual
        returns (string memory)
    {
        require(_exists(_tokenId), "URI requested for non-existing token");
        return (_tokenURIs[_tokenId]);
    }

    /* ======================= Functions ======================= */

    function _exists(uint256 _tokenId) internal view virtual returns (bool) {
        return _owners[_tokenId] != address(0);
    }

    function _isApprovedOrOwner(address spender, uint256 _tokenId)
        internal
        view
        virtual
        returns (bool)
    {
        require(
            _exists(_tokenId),
            "ERC721: operator query for nonexistent token"
        );
        address owner = ownerOf(_tokenId);
        return (spender == owner ||
            getApproved(_tokenId) == spender ||
            isApprovedForAll(owner, spender));
    }

    function approve(address to, uint256 _tokenId) public virtual override {
        require(_exists(_tokenId), "Approval requested for non-existing token");
        require(
            _msgSender() == ownerOf(_tokenId) ||
                isApprovedForAll(ownerOf(_tokenId), _msgSender()),
            "ERC721: approve caller is not owner nor approved for all"
        );

        require(to != ownerOf(_tokenId), "ERC721: approval to current owner");
        _approve(to, _tokenId);
    }

    function _approve(address to, uint256 _tokenId) internal virtual {
        _tokenApprovals[_tokenId] = to;
        emit Approval(ownerOf(_tokenId), to, _tokenId);
    }

    // Returns the account approved for `_tokenId` token.
    function getApproved(uint256 _tokenId)
        public
        view
        virtual
        override
        returns (address)
    {
        require(
            _exists(_tokenId),
            "ERC721: approved query for nonexistent token"
        );
        return (_tokenApprovals[_tokenId]);
    }

    function setApprovalForAll(address operator, bool _approved)
        public
        virtual
        override
    {
        require(operator != msg.sender, "Operator cannot be the caller");

        _operatorApprovals[msg.sender][operator] = _approved;
        emit ApprovalForAll(msg.sender, operator, _approved);
    }

    // Returns if the `operator` is allowed to manage all of the assets of `owner`.
    function isApprovedForAll(address owner, address operator)
        public
        view
        virtual
        override
        returns (bool)
    {
        return _operatorApprovals[owner][operator];
    }

    function transferFrom(
        address from,
        address to,
        uint256 _tokenId
    ) public virtual override {
        require(
            _isApprovedOrOwner(from, _tokenId),
            "ERC721: sender is not owner nor approved"
        );
        _transfer(from, to, _tokenId);
    }

    function _transfer(
        address from,
        address to,
        uint256 _tokenId
    ) internal {
        require(
            ownerOf(_tokenId) == from,
            "ERC721: transfer of token that is not own"
        );
        require(to != address(0), "ERC721: transfer to the zero address");

        _approve(address(0), _tokenId);

        _balances[from] -= 1;
        _balances[to] += 1;
        _owners[_tokenId] = to;

        emit Transfer(from, to, _tokenId);
    }

    function _safeTransfer(
        address from,
        address to,
        uint256 _tokenId,
        bytes memory _data
    ) internal virtual {
        _transfer(from, to, _tokenId);
        require(
            _checkOnERC721Received(from, to, _tokenId, _data),
            "ERC721: transfer to non ERC721Receiver implementer"
        );
    }

    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId
    ) public virtual override {
        safeTransferFrom(from, to, tokenId, "");
    }

    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId,
        bytes memory _data
    ) public virtual override {
        require(
            _isApprovedOrOwner(_msgSender(), tokenId),
            "ERC721: transfer caller is not owner nor approved"
        );
        _safeTransfer(from, to, tokenId, _data);
    }

    function mint(
        address to,
        uint256 _tokenId,
        string memory _tokenURI
    ) public virtual _onlyMinter returns (bool) {
        require(to != address(0), "ERC721: mint to the zero address");
        require(!_exists(_tokenId), "ERC721: token already minted");

        _balances[to] += 1;
        _owners[_tokenId] = to;
        _tokenURIs[_tokenId] = _tokenURI;

        emit Transfer(msg.sender, to, _tokenId);
        return true;
    }

    function burn(uint256 _tokenId) public virtual _onlyMinter {

        address owner = ownerOf(_tokenId);
        approve(address(0), _tokenId); 
        // owner should transfer to minter first and only minter can burn nft

        _balances[owner] -= 1;
        delete _owners[_tokenId];

        emit Transfer(owner, address(0), _tokenId);
    }

    // function setTokenURI(uint256 _tokenId, string memory _uri) public virtual returns(bool) {
    //     require(ownerOf(_tokenId) == msg.sender, "Only token owner can set URI");

    //     _tokenURIs[_tokenId] = _uri;
    //     return true;
    // }

    // This method relies on extcodesize, which returns 0 for contracts in
    // construction, since the code is only stored at the end of the
    // constructor execution.
    function _checkOnERC721Received(
        address from,
        address to,
        uint256 _tokenId,
        bytes memory _data
    ) private returns (bool) {
        if (to.isContract()) {
            try
                IERC721Receiver(to).onERC721Received(
                    _msgSender(),
                    from,
                    _tokenId,
                    _data
                )
            returns (bytes4 retval) {
                return retval == IERC721Receiver.onERC721Received.selector;
            } catch (bytes memory reason) {
                if (reason.length == 0) {
                    revert(
                        "ERC721: transfer to non ERC721Receiver implementer"
                    );
                } else {
                    assembly {
                        revert(add(32, reason), mload(reason))
                    }
                }
            }
        } else {
            return true;
        }
    }
}
