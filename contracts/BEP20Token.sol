// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title BEP20Token
/// @notice Standard BEP-20 / ERC-20 meme coin contract deployed directly from
/// the connected wallet. No platform fee, no platform wallet, no hidden
/// owner-only "freeze" or "blacklist" functions of any kind -- by design,
/// the only privileged capabilities an owner can ever have are (1) minting
/// additional supply, and only if `mintable` was enabled at deploy time, and
/// (2) updating the off-chain metadata pointer (`tokenURI`, e.g. an IPFS
/// link with logo/socials). Both capabilities are removed forever, in the
/// same deployment transaction if desired, by setting `renounceOwnershipImmediately`
/// to true, or at any later time by calling `renounceOwnership()`.
contract BEP20Token is ERC20, ERC20Burnable, Ownable {
    uint8 private immutable _decimals;

    /// @notice Whether this token was deployed with a working mint() function.
    /// This is fixed forever at deploy time and cannot be turned on later --
    /// if false, mint() will always revert, no matter who calls it.
    bool public immutable mintable;

    /// @notice Off-chain metadata URI (name/logo/description/socials JSON,
    /// typically pinned to IPFS). Purely informational -- has no effect on
    /// transfers, balances, or supply. Only the owner can update it, and
    /// only until ownership is renounced.
    string public tokenURI;

    event TokenURIUpdated(string newURI);

    constructor(
        string memory name_,
        string memory symbol_,
        uint8 decimals_,
        uint256 initialSupply,
        address recipient,
        bool mintable_,
        string memory initialTokenURI,
        bool renounceOwnershipImmediately
    ) ERC20(name_, symbol_) Ownable(msg.sender) {
        require(recipient != address(0), "Recipient cannot be the zero address");
        require(bytes(name_).length > 0, "Name required");
        require(bytes(symbol_).length > 0, "Symbol required");
        require(initialSupply > 0, "Supply must be greater than zero");

        _decimals = decimals_;
        mintable = mintable_;
        tokenURI = initialTokenURI;

        _mint(recipient, initialSupply);

        // Doing this inside the constructor lets the whole deployment --
        // contract creation, supply mint, and (optionally) the permanent
        // renouncement of owner privileges -- happen atomically in the
        // single transaction the connected wallet signs.
        if (renounceOwnershipImmediately) {
            _transferOwnership(address(0));
        }
    }

    function decimals() public view virtual override returns (uint8) {
        return _decimals;
    }

    /// @notice Mint additional supply. Only callable by the owner, and only
    /// if this token was deployed with `mintable = true`. Reverts otherwise,
    /// unconditionally -- there is no way to enable minting after deployment
    /// if it was disabled at construction.
    function mint(address to, uint256 amount) external onlyOwner {
        require(mintable, "Minting is permanently disabled for this token");
        _mint(to, amount);
    }

    /// @notice Update the off-chain metadata pointer. Only callable by the
    /// owner. Once ownership is renounced this reverts forever, making the
    /// metadata pointer immutable.
    function setTokenURI(string calldata newURI) external onlyOwner {
        tokenURI = newURI;
        emit TokenURIUpdated(newURI);
    }
}
