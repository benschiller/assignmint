# Escrow Contract MVP Plan (Wholesale Real Estate)

This document outlines the plan for developing a minimal viable product (MVP) escrow contract for a wholesale real estate transaction on the XDC testnet, utilizing Hardhat.

## 1. Revised Escrow Requirements (MVP)

*   **Parties Involved:**
    *   **Wholesaler (`wholesaler`):** The address that deposits the `assignMint` ERC-721 NFT into the escrow. This address will receive the `assignmentPrice - purchasePrice` in native XDC.
    *   **Seller (`seller`):** The address that will receive the `purchasePrice` in native XDC.
    *   **Buyer (`buyer`):** The address responsible for paying the `assignmentPrice` in native XDC and will receive the `assignMint` NFT.

*   **Type of Assets:**
    *   **ERC-721 NFT:** Specifically, the `assignMint` NFT on the XDC testnet.
    *   **Native XDC:** For all monetary transactions.

*   **Conditions for Execution:**
    *   The contract itself acts as the arbiter, with no external dispute resolution for this hackathon demo.
    *   The escrow will be executed automatically when **both** the NFT is deposited by the Wholesaler **and** the full `assignmentPrice` is paid by the Buyer.

*   **Execution Flow:**
    1.  Wholesaler deposits the `assignMint` NFT into the escrow contract.
    2.  Buyer pays the `assignmentPrice` in XDC to the escrow contract.
    3.  Upon successful completion of both steps, the contract will:
        *   Transfer `purchasePrice` (XDC) to the Seller.
        *   Transfer `assignmentPrice - purchasePrice` (XDC) to the Wholesaler.
        *   Transfer the `assignMint` NFT to the Buyer.

## 2. Revised Contract Structure Design (`Escrow.sol`)

The `Escrow.sol` contract will be created in `hardhat/contracts/` and will include:

*   **Imports:**
    *   `@openzeppelin/contracts/token/ERC721/IERC721.sol` for ERC-721 interface.
    *   `@openzeppelin/contracts/utils/ReentrancyGuard.sol` for reentrancy protection.

*   **State Variables:**
    *   `address public wholesaler;`
    *   `address public seller;`
    *   `address public buyer;`
    *   `IERC721 public nftContract;` (Instance of the ERC-721 contract)
    *   `uint256 public tokenId;` (The specific NFT ID being escrowed)
    *   `uint256 public purchasePrice;` (Amount for the seller)
    *   `uint256 public assignmentPrice;` (Total amount buyer pays)
    *   `bool public nftDeposited;` (Flag to track NFT deposit status)
    *   `bool public paymentReceived;` (Flag to track payment status)
    *   `enum EscrowState { Created, NFTDeposited, PaymentReceived, Completed, Cancelled } public currentState;`

*   **Functions:**
    *   `constructor(address _seller, address _buyer, address _nftContractAddress, uint256 _tokenId, uint256 _purchasePrice, uint256 _assignmentPrice)`:
        *   Sets `wholesaler` to `msg.sender`.
        *   Initializes `seller`, `buyer`, `nftContract`, `tokenId`, `purchasePrice`, `assignmentPrice`.
        *   Sets `currentState` to `Created`.
    *   `depositNFT() external`:
        *   Requires `msg.sender` to be the `wholesaler`.
        *   Requires `currentState` to be `Created`.
        *   Transfers the NFT from `wholesaler` to `address(this)` (the escrow contract). This will require prior approval from the wholesaler on the NFT contract.
        *   Sets `nftDeposited = true`.
        *   Updates `currentState` to `NFTDeposited`.
        *   Calls `_tryExecuteEscrow()` internally.
    *   `makePayment() payable external nonReentrant`:
        *   Requires `msg.sender` to be the `buyer`.
        *   Requires `currentState` to be `Created` or `NFTDeposited`.
        *   Requires `msg.value` to be equal to `assignmentPrice`.
        *   Sets `paymentReceived = true`.
        *   Updates `currentState` to `PaymentReceived`.
        *   Calls `_tryExecuteEscrow()` internally.
    *   `_tryExecuteEscrow() internal`:
        *   Checks if both `nftDeposited` and `paymentReceived` are true.
        *   If true, performs the following transfers:
            *   `seller.transfer(purchasePrice);`
            *   `wholesaler.transfer(assignmentPrice - purchasePrice);`
            *   `nftContract.safeTransferFrom(address(this), buyer, tokenId);`
        *   Sets `currentState` to `Completed`.
    *   `cancelEscrow() external`:
        *   Requires `msg.sender` to be the `wholesaler`.
        *   Requires `currentState` to be `Created` or `NFTDeposited` (i.e., not yet completed).
        *   If `nftDeposited` is true, transfers the NFT back to the `wholesaler`.
        *   If `paymentReceived` is true, transfers the `assignmentPrice` back to the `buyer`.
        *   Sets `currentState` to `Cancelled`.

*   **Events:**
    *   `event EscrowCreated(address indexed wholesaler, address indexed seller, address indexed buyer, address nftContract, uint256 tokenId, uint256 purchasePrice, uint256 assignmentPrice);`
    *   `event NFTDeposited(address indexed wholesaler, address indexed nftContract, uint256 tokenId);`
    *   `event PaymentReceived(address indexed buyer, uint256 amount);`
    *   `event EscrowCompleted(address indexed buyer, address indexed seller, address indexed wholesaler, uint256 purchaseAmount, uint256 wholesalerProfit);`
    *   `event EscrowCancelled(address indexed initiator);`

## 3. Revised Implementation Steps

1.  **Create `Escrow.sol`:** A new Solidity file will be created in `hardhat/contracts/` with the revised contract structure, including necessary OpenZeppelin imports.
2.  **Develop Tests:** A comprehensive test file (`hardhat/test/Escrow.js`) will be written to cover:
    *   Successful deployment with correct initial parameters.
    *   Wholesaler approving the NFT transfer to the escrow contract.
    *   Wholesaler successfully depositing the NFT.
    *   Buyer successfully making the payment.
    *   Verification of correct XDC distribution to Seller and Wholesaler.
    *   Verification of NFT transfer to the Buyer.
    *   Testing of `cancelEscrow` functionality under various states (before NFT deposit, after NFT deposit, after payment but before execution if possible).
    *   Negative tests: unauthorized calls, insufficient payment, attempting actions in wrong states.
3.  **Deployment Script:** A new deployment script (`hardhat/scripts/deployEscrow.js`) will be created to deploy the `Escrow` contract. This script will need to accept command-line arguments for `seller`, `buyer`, `nftContractAddress`, `tokenId`, `purchasePrice`, and `assignmentPrice`.

## 4. How will we ultimately run it?

*   **Prerequisites:**
    *   An `assignMint` ERC-721 NFT contract must be deployed on the XDC Apothem testnet.
    *   The Wholesaler must own the specific `tokenId` intended for escrow.
    *   The Wholesaler must `approve` the Escrow contract to transfer their NFT *before* calling `depositNFT`.
*   **Compilation:** `npx hardhat compile`
*   **Testing:** `npx hardhat test hardhat/test/Escrow.js`
*   **Deployment:** `npx hardhat run scripts/deployEscrow.js --network xdcApothem --seller <seller_address> --buyer <buyer_address> --nftContract <nft_contract_address> --tokenId <token_id> --purchasePrice <purchase_price> --assignmentPrice <assignment_price>`
*   **Interaction (Post-Deployment for Demo):**
    1.  **Wholesaler Action:** Call `approve(escrowContractAddress, tokenId)` on the `assignMint` NFT contract.
    2.  **Wholesaler Action:** Call `depositNFT()` on the deployed Escrow contract.
    3.  **Buyer Action:** Call `makePayment()` on the deployed Escrow contract, sending `assignmentPrice` XDC.
    4.  The contract will automatically execute the transfers.

## 5. Pressing Considerations

*   **ERC-721 Approval:** This is a crucial off-chain step that must happen before `depositNFT`. The contract will enforce this by attempting `safeTransferFrom`.
*   **Native XDC Transfers:** Using `transfer` or `call` for sending XDC, ensuring reentrancy protection with `nonReentrant`.
*   **State Management:** Careful management of the `EscrowState` enum to ensure functions are called in the correct sequence.
*   **Gas Efficiency:** Keeping the logic streamlined for minimal gas costs.
*   **Error Handling:** Comprehensive `require` statements to validate inputs and state transitions.
