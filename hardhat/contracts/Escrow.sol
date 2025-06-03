// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol";

contract Escrow is ReentrancyGuard, ERC721Holder {
    address public wholesaler;
    address public seller;
    address public buyer;
    IERC721 public nftContract;
    uint256 public tokenId;
    uint256 public purchasePrice;
    uint256 public assignmentPrice;
    bool public nftDeposited;
    bool public paymentReceived;

    enum EscrowState { Created, NFTDeposited, PaymentReceived, Completed, Cancelled }
    EscrowState public currentState;

    event EscrowCreated(address indexed wholesaler, address indexed seller, address indexed buyer, address nftContract, uint256 tokenId, uint256 purchasePrice, uint256 assignmentPrice);
    event NFTDeposited(address indexed wholesaler, address indexed nftContract, uint256 tokenId);
    event PaymentReceived(address indexed buyer, uint256 amount);
    event EscrowCompleted(address indexed buyer, address indexed seller, address indexed wholesaler, uint256 purchaseAmount, uint256 wholesalerProfit);
    event EscrowCancelled(address indexed initiator);

    constructor(address _seller, address _buyer, address _nftContractAddress, uint256 _tokenId, uint256 _purchasePrice, uint256 _assignmentPrice) {
        wholesaler = msg.sender;
        seller = _seller;
        buyer = _buyer;
        nftContract = IERC721(_nftContractAddress);
        tokenId = _tokenId;
        purchasePrice = _purchasePrice;
        assignmentPrice = _assignmentPrice;
        currentState = EscrowState.Created;

        emit EscrowCreated(wholesaler, seller, buyer, _nftContractAddress, tokenId, purchasePrice, assignmentPrice);
    }

    function depositNFT() external {
        require(msg.sender == wholesaler, "Only wholesaler can deposit NFT");
        require(currentState == EscrowState.Created, "NFT can only be deposited in Created state");

        nftContract.safeTransferFrom(wholesaler, address(this), tokenId);
        nftDeposited = true;
        currentState = EscrowState.NFTDeposited;

        emit NFTDeposited(wholesaler, address(nftContract), tokenId);
        _tryExecuteEscrow();
    }

    function makePayment() payable external nonReentrant {
        require(msg.sender == buyer, "Only buyer can make payment");
        require(currentState == EscrowState.Created || currentState == EscrowState.NFTDeposited, "Payment can only be made in Created or NFTDeposited state");
        require(msg.value == assignmentPrice, "Incorrect payment amount");

        paymentReceived = true;
        currentState = EscrowState.PaymentReceived;

        emit PaymentReceived(buyer, msg.value);
        _tryExecuteEscrow();
    }

    function _tryExecuteEscrow() internal {
        if (nftDeposited && paymentReceived) {
            uint256 wholesalerProfit = assignmentPrice - purchasePrice;

            (bool sellerSuccess, ) = seller.call{value: purchasePrice}("");
            require(sellerSuccess, "Failed to transfer purchase price to seller");

            (bool wholesalerSuccess, ) = wholesaler.call{value: wholesalerProfit}("");
            require(wholesalerSuccess, "Failed to transfer wholesaler profit");

            nftContract.safeTransferFrom(address(this), buyer, tokenId);
            currentState = EscrowState.Completed;

            emit EscrowCompleted(buyer, seller, wholesaler, purchasePrice, wholesalerProfit);
        }
    }

    function cancelEscrow() external {
        require(msg.sender == wholesaler, "Only wholesaler can cancel escrow");
        require(currentState == EscrowState.Created || currentState == EscrowState.NFTDeposited || currentState == EscrowState.PaymentReceived, "Escrow cannot be cancelled in current state");

        if (nftDeposited) {
            nftContract.safeTransferFrom(address(this), wholesaler, tokenId);
        }
        if (paymentReceived) {
            (bool buyerSuccess, ) = buyer.call{value: assignmentPrice}("");
            require(buyerSuccess, "Failed to refund buyer");
        }
        currentState = EscrowState.Cancelled;

        emit EscrowCancelled(msg.sender);
    }
}
