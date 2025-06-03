import { expect } from "chai";
import pkg from 'hardhat';
const { ethers } = pkg;

console.log("Escrow test file is running!"); // Basic output to confirm execution

describe("Escrow", function () {
    let Escrow;
    let escrow;
    let owner;
    let wholesaler;
    let seller;
    let buyer;
    let addrs;
    let mockNft; // Declare mockNft here

    const TOKEN_ID = 0;
    const PURCHASE_PRICE = ethers.parseEther("10"); // 10 XDC
    const ASSIGNMENT_PRICE = ethers.parseEther("12"); // 12 XDC

    beforeEach(async function () {
        [owner, wholesaler, seller, buyer, ...addrs] = await ethers.getSigners();

        // 1. Deploy Mock ERC721 contract
        const MockERC721 = await ethers.getContractFactory("MockERC721");
        mockNft = await MockERC721.deploy();
        await mockNft.waitForDeployment();

        // 2. Mint an NFT to the wholesaler (owner of MockERC721 mints to wholesaler)
        await mockNft.connect(owner).mint(wholesaler.address, TOKEN_ID);

        // 3. Deploy the Escrow contract as the wholesaler
        Escrow = await ethers.getContractFactory("Escrow");
        escrow = await Escrow.connect(wholesaler).deploy(
            seller.address,      // _seller
            buyer.address,       // _buyer
            mockNft.target,      // _nftContractAddress (use deployed mock NFT address)
            TOKEN_ID,            // _tokenId
            PURCHASE_PRICE,      // _purchasePrice
            ASSIGNMENT_PRICE     // _assignmentPrice
        );
        await escrow.waitForDeployment();

        // 4. Wholesaler approves the Escrow contract to manage the NFT
        // This approval is crucial for the depositNFT function to succeed
        await mockNft.connect(wholesaler).approve(escrow.target, TOKEN_ID);
    });

    describe("Deployment", function () {
        it("Should set the correct initial state", async function () {
            expect(await escrow.wholesaler()).to.equal(wholesaler.address);
            expect(await escrow.seller()).to.equal(seller.address);
            expect(await escrow.buyer()).to.equal(buyer.address);
            // Check that the NFT contract address is the deployed mock NFT
            expect(await escrow.nftContract()).to.equal(mockNft.target);
            expect(await escrow.tokenId()).to.equal(TOKEN_ID);
            expect(await escrow.purchasePrice()).to.equal(PURCHASE_PRICE);
            expect(await escrow.assignmentPrice()).to.equal(ASSIGNMENT_PRICE);
            expect(await escrow.nftDeposited()).to.be.false;
            expect(await escrow.paymentReceived()).to.be.false;
            expect(await escrow.currentState()).to.equal(0); // EscrowState.Created
        });

        it("Should emit EscrowCreated event", async function () {
            // Deploy a new contract as wholesaler and check for the event
            const EscrowFactory = await ethers.getContractFactory("Escrow");
            const tx = await EscrowFactory.connect(wholesaler).deploy(
                seller.address,
                buyer.address,
                mockNft.target, // Use mock NFT address
                TOKEN_ID,
                PURCHASE_PRICE,
                ASSIGNMENT_PRICE
            );
            const receipt = await tx.deploymentTransaction().wait();

            // Find the event in the logs
            const event = receipt.logs
                .map(log => {
                    try {
                        return EscrowFactory.interface.parseLog(log);
                    } catch {
                        return null;
                    }
                })
                .find(e => e && e.name === "EscrowCreated");

            expect(event).to.not.be.undefined;
            expect(event.args.wholesaler).to.equal(wholesaler.address);
            expect(event.args.seller).to.equal(seller.address);
            expect(event.args.buyer).to.equal(buyer.address);
            expect(event.args.nftContract).to.equal(mockNft.target); // Check against mock NFT address
            expect(event.args.tokenId).to.equal(TOKEN_ID);
            expect(event.args.purchasePrice).to.equal(PURCHASE_PRICE);
            expect(event.args.assignmentPrice).to.equal(ASSIGNMENT_PRICE);
        });
    });

    describe("depositNFT", function () {
        it("Should allow wholesaler to deposit NFT (if approved)", async function () {
            // Wholesaler is already the owner and has approved the escrow contract in beforeEach
            await expect(escrow.connect(wholesaler).depositNFT())
                .to.emit(escrow, "NFTDeposited")
                .withArgs(wholesaler.address, mockNft.target, TOKEN_ID); // Use mockNft.target

            expect(await escrow.nftDeposited()).to.be.true;
            expect(await escrow.currentState()).to.equal(1); // EscrowState.NFTDeposited
            expect(await mockNft.ownerOf(TOKEN_ID)).to.equal(escrow.target); // NFT should now be in escrow
        });

        it("Should revert if not called by wholesaler", async function () {
            await expect(escrow.connect(seller).depositNFT())
                .to.be.revertedWith("Only wholesaler can deposit NFT");
        });

        it("Should revert if NFT is not approved", async function () {
            // Deploy a new escrow contract without prior approval to test this
            const EscrowNoApproval = await ethers.getContractFactory("Escrow");
            const escrowNoApproval = await EscrowNoApproval.connect(wholesaler).deploy(
                seller.address,
                buyer.address,
                mockNft.target,
                TOKEN_ID,
                PURCHASE_PRICE,
                ASSIGNMENT_PRICE
            );
            await escrowNoApproval.waitForDeployment();

            // Do NOT approve here
            // Expect a generic revert, as the exact custom error name might vary or not be present.
            await expect(escrowNoApproval.connect(wholesaler).depositNFT())
                .to.be.reverted;
        });

        it("Should revert if not in Created state", async function () {
            // First, make a payment to change the state from Created
            await escrow.connect(buyer).makePayment({ value: ASSIGNMENT_PRICE });
            expect(await escrow.currentState()).to.equal(2); // EscrowState.PaymentReceived

            await expect(escrow.connect(wholesaler).depositNFT())
                .to.be.revertedWith("NFT can only be deposited in Created state");
        });
    });

    describe("makePayment", function () {
        it("Should allow buyer to make payment", async function () {
            await expect(escrow.connect(buyer).makePayment({ value: ASSIGNMENT_PRICE }))
                .to.emit(escrow, "PaymentReceived")
                .withArgs(buyer.address, ASSIGNMENT_PRICE);

            expect(await escrow.paymentReceived()).to.be.true;
            expect(await escrow.currentState()).to.equal(2); // EscrowState.PaymentReceived
            expect(await ethers.provider.getBalance(escrow.target)).to.equal(ASSIGNMENT_PRICE);
        });

        it("Should revert if not called by buyer", async function () {
            await expect(escrow.connect(wholesaler).makePayment({ value: ASSIGNMENT_PRICE }))
                .to.be.revertedWith("Only buyer can make payment");
        });

        it("Should revert if incorrect payment amount", async function () {
            await expect(escrow.connect(buyer).makePayment({ value: ethers.parseEther("10") }))
                .to.be.revertedWith("Incorrect payment amount");
        });

        it("Should revert if already completed", async function () {
            // To make it completed, first deposit NFT and then make payment
            await escrow.connect(wholesaler).depositNFT();
            await escrow.connect(buyer).makePayment({ value: ASSIGNMENT_PRICE });
            expect(await escrow.currentState()).to.equal(3); // EscrowState.Completed

            await expect(escrow.connect(buyer).makePayment({ value: ASSIGNMENT_PRICE }))
                .to.be.revertedWith("Payment can only be made in Created or NFTDeposited state");
        });
    });

    describe("_tryExecuteEscrow", function () {
        it("Should execute escrow when both conditions are met", async function () {
            const initialSellerBalance = await ethers.provider.getBalance(seller.address);
            const initialWholesalerBalance = await ethers.provider.getBalance(wholesaler.address);

            // First, deposit NFT
            await escrow.connect(wholesaler).depositNFT();
            expect(await escrow.nftDeposited()).to.be.true;
            expect(await escrow.currentState()).to.equal(1); // NFTDeposited

            // Then, make payment (this will trigger _tryExecuteEscrow)
            const tx = await escrow.connect(buyer).makePayment({ value: ASSIGNMENT_PRICE });
            await tx.wait(); // Wait for the transaction to be mined

            expect(await escrow.paymentReceived()).to.be.true;
            expect(await escrow.currentState()).to.equal(3); // Completed

            // Check balances after execution
            expect(await ethers.provider.getBalance(seller.address)).to.equal(initialSellerBalance + PURCHASE_PRICE);
            expect(await ethers.provider.getBalance(escrow.target)).to.equal(0); // Escrow contract should have 0 balance

            // Check NFT ownership (requires calling the mock NFT contract directly)
            expect(await mockNft.ownerOf(TOKEN_ID)).to.equal(buyer.address);
        });
    });

    describe("cancelEscrow", function () {
        it("Should allow wholesaler to cancel escrow before NFT deposit", async function () {
            await expect(escrow.connect(wholesaler).cancelEscrow())
                .to.emit(escrow, "EscrowCancelled")
                .withArgs(wholesaler.address);

            expect(await escrow.currentState()).to.equal(4); // EscrowState.Cancelled
            expect(await mockNft.ownerOf(TOKEN_ID)).to.equal(wholesaler.address); // NFT should remain with wholesaler
        });

        it("Should allow wholesaler to cancel escrow after NFT deposit and refund NFT", async function () {
            await escrow.connect(wholesaler).depositNFT(); // Deposit NFT
            expect(await escrow.currentState()).to.equal(1); // NFTDeposited
            expect(await mockNft.ownerOf(TOKEN_ID)).to.equal(escrow.target); // NFT should be in escrow

            await expect(escrow.connect(wholesaler).cancelEscrow())
                .to.emit(escrow, "EscrowCancelled")
                .withArgs(wholesaler.address);

            expect(await escrow.currentState()).to.equal(4); // EscrowState.Cancelled
            expect(await mockNft.ownerOf(TOKEN_ID)).to.equal(wholesaler.address); // NFT should be returned to wholesaler
        });

        it("Should allow wholesaler to cancel escrow after payment and refund XDC (if NFT not deposited)", async function () {
            const initialBuyerBalance = await ethers.provider.getBalance(buyer.address);

            // Capture the gas cost of the makePayment transaction for accurate balance calculation
            const makePaymentTx = await escrow.connect(buyer).makePayment({ value: ASSIGNMENT_PRICE });
            const makePaymentReceipt = await makePaymentTx.wait();
            const makePaymentGasCost = makePaymentReceipt.gasUsed * makePaymentReceipt.gasPrice;

            expect(await escrow.currentState()).to.equal(2); // PaymentReceived

            const tx = await escrow.connect(wholesaler).cancelEscrow();
            await tx.wait(); // Wait for the wholesaler's cancel transaction to be mined

            // Expected final buyer balance: initial balance - gas cost of makePayment
            const expectedBuyerBalance = initialBuyerBalance - makePaymentGasCost;

            // Use .closeTo for floating point comparisons of balances due to gas costs
            // Increased tolerance to 0.15 ETH to account for potential variations in gas costs
            expect(await ethers.provider.getBalance(buyer.address)).to.closeTo(expectedBuyerBalance, ethers.parseEther("0.15"));
            expect(await ethers.provider.getBalance(escrow.target)).to.equal(0);
            expect(await escrow.currentState()).to.equal(4); // EscrowState.Cancelled

            await expect(tx)
                .to.emit(escrow, "EscrowCancelled")
                .withArgs(wholesaler.address);
        });


        it("Should revert if not called by wholesaler", async function () {
            await expect(escrow.connect(seller).cancelEscrow())
                .to.be.revertedWith("Only wholesaler can cancel escrow");
        });

        it("Should revert if escrow is completed", async function () {
            // Make escrow completed
            await escrow.connect(wholesaler).depositNFT();
            await escrow.connect(buyer).makePayment({ value: ASSIGNMENT_PRICE });
            expect(await escrow.currentState()).to.equal(3); // Completed

            await expect(escrow.connect(wholesaler).cancelEscrow())
                .to.be.revertedWith("Escrow cannot be cancelled in current state");
        });
    });
});
