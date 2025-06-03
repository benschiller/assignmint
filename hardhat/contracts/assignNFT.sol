    // SPDX-License-Identifier: MIT
    pragma solidity ^0.8.20;

    import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
    import "@openzeppelin/contracts/access/Ownable.sol";
    import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

    contract assignNFT is ERC721, Ownable, ERC721URIStorage {
        uint256 private _nextTokenId;

        constructor(address initialOwner)
            ERC721("AssignMintNFT", "AMT") // Name: AssignMintNFT, Symbol: AMT
            Ownable(initialOwner)
        {}

        function supportsInterface(bytes4 interfaceId)
            public
            view
            override(ERC721, ERC721URIStorage)
            returns (bool)
        {
            return super.supportsInterface(interfaceId);
        }

        function mint(address to, string memory uri)
            public
            onlyOwner // Only the contract owner can mint
            returns (uint256)
        {
            uint256 tokenId = _nextTokenId++; // Increment token ID
            _safeMint(to, tokenId); // Safely mint the token to 'to' address
            _setTokenURI(tokenId, uri); // Set the metadata URI for the token
            return tokenId;
        }

        function tokenURI(uint256 tokenId)
            public
            view
            override(ERC721, ERC721URIStorage)
            returns (string memory)
        {
            return super.tokenURI(tokenId);
        }
    }