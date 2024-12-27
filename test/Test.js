const { ethers } = require("hardhat");
const assert = require("assert");

describe("PropertyRental Tests", function () {
    let deployer, owner1, owner2, client1, client2;
    let ownerContract, clientContract, nftContract, propertyRental;

    before(async () => {
        [deployer, owner1, owner2, client1, client2] = await ethers.getSigners();

        // Deploy contracts
        const OwnerFactory = await ethers.getContractFactory("Owner");
        ownerContract = await OwnerFactory.deploy(deployer.address);
        await ownerContract.deployed();

        const NFTFactory = await ethers.getContractFactory("NFT");
        nftContract = await NFTFactory.deploy();
        await nftContract.deployed();

        const ClientFactory = await ethers.getContractFactory("Client");
        clientContract = await ClientFactory.deploy(deployer.address);
        await clientContract.deployed();

        const PropertyRentalFactory = await ethers.getContractFactory("PropertyRental");
        propertyRental = await PropertyRentalFactory.deploy(
            ownerContract.address,
            clientContract.address,
            nftContract.address
        );
        await propertyRental.deployed();

        // Add owners and clients
        await ownerContract.connect(deployer).addOwner(owner1.address);
        await ownerContract.connect(deployer).addOwner(owner2.address);
        await clientContract.connect(deployer).addClient(client1.address);
        await clientContract.connect(deployer).addClient(client2.address);

        const prop1 = await propertyRental
            .connect(owner1)
            .addProperty("Cozy Apartment", "Paris", ethers.utils.parseEther("0.2"));
        await prop1.wait();

        const prop2 = await propertyRental
            .connect(owner1)
            .addProperty("Modern Loft", "Berlin", ethers.utils.parseEther("0.3"));
        await prop2.wait();

        const prop3 = await propertyRental
            .connect(owner2)
            .addProperty("Beach House", "Malibu", ethers.utils.parseEther("0.5"));
        await prop3.wait();
    });

    it("Should allow adding properties", async function () {
        const propertyCount = await propertyRental.getPropertyCount();
        assert.strictEqual(propertyCount.toNumber(), 3, "Property count mismatch");
    });

    it("Should allow booking a property", async function () {
        const startDate = Math.floor(Date.now() / 1000);
        const endDate = startDate + 86400 * 3; // 3 days
        const bookingTx = await propertyRental.connect(client1).bookProperty(1, startDate, endDate, {
            value: ethers.utils.parseEther("0.6"),
        });
        await bookingTx.wait();

        // Check owner revenue
        const ownerRevenue = await propertyRental.ownerRevenue(owner1.address);
        assert.strictEqual(
            ownerRevenue.toString(),
            ethers.utils.parseEther("0.6").toString(),
            "Revenue mismatch after booking"
        );
    });

    it("Should allow withdrawing revenue", async function () {
        const initialBalance = await owner1.getBalance();

        const revenue = await propertyRental.ownerRevenue(owner1.address);
        const withdrawTx = await propertyRental.connect(owner1).withdraw(revenue);
        await withdrawTx.wait();

        const finalBalance = await owner1.getBalance();
        assert(finalBalance.gt(initialBalance), "Balance not increased after withdrawal");
    });

    it("Should track NFTs correctly", async function () {
        const tokenIds = await nftContract.connect(owner1).getTokenIds();

        assert(tokenIds.length > 0, "Owner does not own any NFTs");
        for (const tokenId of tokenIds) {
            const name = await nftContract.getName(tokenId);
            const description = await nftContract.getDescription(tokenId);

            assert(name, "Token name is missing");
            assert(description, "Token description is missing");
        }
    });

    it("Should fail for unauthorized actions", async function () {
        try {
            await ownerContract.connect(client1).addOwner(client2.address);
            assert.fail("Non-deployer added an owner");
        } catch (error) {
            assert(
                error.message.includes("Ownable: caller is not the owner"),
                "Unexpected error message for unauthorized action"
            );
        }

        try {
            await propertyRental.connect(client1).addProperty("Test", "Test", ethers.utils.parseEther("1"));
            assert.fail("Non-owner added a property");
        } catch (error) {
            assert(
                error.message.includes("Caller is not an owner"),
                "Unexpected error message for unauthorized action"
            );
        }
    });
});
