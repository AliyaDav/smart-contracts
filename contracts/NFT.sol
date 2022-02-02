// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/IERC721Metadata.sol";

contract MyNFT is ERC165, IERC721, IERC721Metadata {
    using Address for address;
    using Counter.Counter for tokenIds; // check this

    string private _name;
    string private _symbol;
    address private _minter;

    mapping(uint256 => address) private _owners;
    mapping(address => uint256) private _balances;
    mapping(uint256 => address) private _tokenApprovals; // Mapping from token ID to approved address
    mapping(address => mapping(address => bool)) private _operatorApprovals; // Mapping from owner to operator approvals
    mapping(uint256 => string) private _tokenURIs;

    constructor(string memory name_, string memory symbol_) {

        _name = name_;
        _symbol = symbol_;
        _minter = msg.sender;
    }

    /* ======================= Modifiers ======================= */

    modifier _onlyMinter() {
        require(msg.sender == _minter, "Only minter allowed");
        _;
    }

    /* ======================= Getters ======================= */

    function balanceOf(address owner) external view virtual override returns (uint256) {
        require(owner != address(0), "Zero address cannot be owner");
        return (_balances[owner]);
    }

    function ownerOf(uint256 _tokenId) public view virtual override returns (address) {
        require(_exists(_tokenId), "Token does not exist");
        return (_owners[_tokenId]);
    }

    function name() external view virtual override returns (string) {
        return (_name);
    }

    function symbol() external view virtual override returns (string) {
        return (_symbol);
    }

    function tokenURI(uint256 _tokenId) external view virtual override returns (string) {
        require(_exists(tokenId), "URI requested for non-existing token");
        return (_tokenURIs[_tokenId]);
    }
    
    /* ======================= Functions ======================= */

    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC165, IERC165) returns (bool) {
        return
            interfaceId == type(IERC721).interfaceId ||
            interfaceId == type(IERC721Metadata).interfaceId ||
            super.supportsInterface(interfaceId);
    }

    function _exists(uint256 tokenId) internal view virtual returns (bool) {
        return _owners[tokenId] != address(0);
    }

    function _isApprovedOrOwner(address spender, uint256 tokenId)
        internal view virtual
        returns (bool)
    {
        require(
            _exists(tokenId),
            "ERC721: operator query for nonexistent token"
        );
        address owner = ownerOf(tokenId);
        return (spender == owner ||
            getApproved(tokenId) == spender ||
            isApprovedForAll(owner, spender));
    }

    function approve(address to, uint256 tokenId) external virtual override returns (bool) {
        require(_exists(tokenID), "Approval requested for non-existing token");
        require(
            msg.sender == ownerof(tokenId) ||
                msg.sender == getApproved(tokenId),
            "ERC721: approve caller is not owner nor approved for all"
        );
        
        require(to != owner, "ERC721: approval to current owner");
        _approve(to, tokenId);
        return true;
    }

    function _approve(address to, uint256 tokenId) internal virtual {
        _tokenApprovals[tokenId] = to;
        emit Approval(ownerOf(tokenId), to, tokenId);
    }

    // Returns the account approved for `tokenId` token.
    function getApproved(uint256 tokenId) public view virtual override returns (address) {
        require(
            _exists(tokenID),
            "ERC721: approved query for nonexistent token"
        );
        return (_tokenApprovals[tokenId]);
    }

    function setApprovalForAll(address operator, bool _approved)
        external virtual override
        returns (bool)
    {
        require(operator != msg.sender, "Operator cannot be the caller");

        _operatorApprovals[msg.sender][operator] = _approved;
        emit ApprovalForAll(msg.sender, operator, _approved);
        return true;
    }

    // Returns if the `operator` is allowed to manage all of the assets of `owner`.
    function isApprovedForAll(address owner, address operator)
        public
        view virtual override
        returns (bool)
    {
        return _operatorApproval[owner][operator];
    }

    function transferFrom(
        address from,
        address to,
        uint256 tokenId
    ) external virtual override {
        require(
            _isApprovedOrOwner(msg.sender, tokenId),
            "ERC721: transfer caller is not owner nor approved"
        );
        _transfer(from, to, tokenId);
    }

    function _transfer(
        address from,
        address to,
        uint256 tokenId
    ) internal returns (bool) {
        require(
            ERC721.ownerOf(tokenId) == from,
            "ERC721: transfer of token that is not own"
        );
        require(to != address(0), "ERC721: transfer to the zero address");

        _approve(address(0), tokenId);

        _balances[from] -= 1;
        _balances[to] += 1;
        _owners[tokenId] = to;

        emit Transfer(from, to, tokenId);
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
        bytes calldata data
    ) public virtual override {
        require(
            _isApprovedOrOwner(msg.sender, tokenId),
            "The spender is not approved by the token owner"
        );
        _safeTransfer(from, to, tokenId);
    }

    function _safeTransfer(
        address from,
        address to,
        uint256 tokenId,
        bytes memory _data
    ) internal virtual {
        _transfer(from, to, tokenId);
        require(
            _checkOnERC721Received(from, to, tokenId, _data),
            "ERC721: transfer to non ERC721Receiver implementer"
        );
    }


    function mint(address to, string tokenURI) public virtual _onlyMinter returns (bool) {

        require(to != address(0), "ERC721: mint to the zero address");
        require(!_exists(tokenId), "ERC721: token already minted");

        _balances[to] += 1;
        _owners[tokenId] = to;

        require(
            _checkOnERC721Received(address(0), to, tokenId, _data),
            "ERC721: transfer to non ERC721Receiver implementer"
        );

        emit Transfer(msg.sender, to, tokenId);
        
    }

    function burn(uint256 tokenId) public virtual _onlyMinter {
        address owner = ERC721.ownerOf(tokenId);

        _approve(address(0), tokenId);

        _balances[owner] -= 1;
        delete _owners[tokenId];

        emit Transfer(owner, address(0), tokenId);
    }

    // function setTokenURI(uint256 tokenId, string memory _uri) public virtual returns(bool) {
    //     require(ownerOf(tokenId) == msg.sender, "Only token owner can set URI");

    //     _tokenURIs[tokenId] = _uri;
    //     return true;
    // }

    // This method relies on extcodesize, which returns 0 for contracts in
    // construction, since the code is only stored at the end of the
    // constructor execution.
    function _checkOnERC721Received(
        address from,
        address to,
        uint256 tokenId,
        bytes memory _data
    ) private returns (bool) {
        if (to.isContract()) {
            t-ry
                IERC721Receiver(to).onERC721Received(
                    msg.sender,
                    from,
                    tokenId,
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
                    // Inline assembly is a way to access the Ethereum Virtual Machine at a low level.
                    assembly {
                        revert(add(32, reason), mload(reason))
                    }
                }
            }
        } else {
            return true;
        }
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
