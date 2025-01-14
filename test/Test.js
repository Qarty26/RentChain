const { ethers } = require("hardhat");
const assert = require("assert");

describe("PropertyRental Tests", function () {
    let deployer, owner1, owner2, owner3 ,client1, client2, nonOwner, nonClient;
    let ownerContract, clientContract, nftContract, propertyRental;

    before(async () => {
        [deployer, owner1, owner2, owner3, client1, client2, nonOwner, nonClient] = await ethers.getSigners();

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
        await ownerContract.connect(deployer).addOwner(owner3.address);
        await clientContract.connect(deployer).addClient(client1.address);
        await clientContract.connect(deployer).addClient(client2.address);

        const prop1 = await propertyRental
            .connect(owner1)
            .addProperty("Cozy Apartment", "Paris", ethers.utils.parseEther("0.2"));
        await prop1.wait();

        const prop2 = await propertyRental
            .connect(owner3)
            .addProperty("Modern Loft", "Berlin", ethers.utils.parseEther("0.3"));
        await prop2.wait();

        const prop3 = await propertyRental
            .connect(owner2)
            .addProperty("Beach House", "Malibu", ethers.utils.parseEther("0.5"));
        await prop3.wait();

        console.log("finished before");

    });

    it("Should fail when getting properties of a non-owner", async function () {
        try {
            await propertyRental.getPropertiesByOwner(nonOwner.address);
            assert.fail("Non-owner was able to get properties");
        } catch (error) {
            assert(
                error.message.includes("Not a registered owner"),
                "Unexpected error message for non-owner access"
            );
        }
    });

    it("Should fail when getting bookings of a non-client", async function () {
        try {
            await propertyRental.getUserBookings(nonClient.address);
            assert.fail("Non-client was able to get bookings");
        } catch (error) {
            assert(
                error.message.includes("Not a registered client"),
                "Unexpected error message for non-client access"
            );
        }
    });

    it("Should fail when a non-owner tries to add a property", async function () {
        try {
            await propertyRental.connect(nonOwner).addProperty("Test Property", "Nowhere", ethers.utils.parseEther("1"));
            assert.fail("Non-owner was able to add a property");
        } catch (error) {
            assert(
                error.message.includes("Only owners can add properties"),
                "Unexpected error message for non-owner adding property"
            );
        }
    });

    it("Should fail when a non-client tries to book a property", async function () {
        const startDate = Math.floor(Date.now() / 1000);
        const endDate = startDate + 86400 * 3; // 3 days

        try {
            await propertyRental.connect(nonClient).bookProperty(1, startDate, endDate, {
                value: ethers.utils.parseEther("0.6"),
            });
            assert.fail("Non-client was able to book a property");
        } catch (error) {
            assert(
                error.message.includes("Only clients can book properties"),
                "Unexpected error message for non-client booking property"
            );
        }
    });

    it("Should fail when booking with insufficient Ether", async function () {
        const startDate = Math.floor(Date.now() / 1000);
        const endDate = startDate + 86400 * 2; // 2 days
        const insufficientPayment = ethers.utils.parseEther("0.1"); // Less than required

        try {
            await propertyRental.connect(client2).bookProperty(1, startDate, endDate, {
                value: insufficientPayment,
            });
            assert.fail("Booking succeeded with insufficient Ether");
        } catch (error) {
            assert(
                error.message.includes("Incorrect Ether value sent"),
                "Unexpected error message for insufficient Ether"
            );
        }
    });

    it("Should fail when booking a non-existent property", async function () {
        const startDate = Math.floor(Date.now() / 1000);
        const endDate = startDate + 86400 * 2; // 2 days

        try {
            await propertyRental.connect(client1).bookProperty(999, startDate, endDate, {
                value: ethers.utils.parseEther("0.4"),
            });
            assert.fail("Booking succeeded for a non-existent property");
        } catch (error) {
            assert(
                error.message.includes("Property does not exist"),
                "Unexpected error message for non-existent property booking"
            );
        }
    });

    it("Should fail when booking an already booked property", async function () {
        const startDate = Math.floor(Date.now() / 1000);
        const endDate = startDate + 86400 * 3; // 3 days

        // Client1 books property
        await propertyRental.connect(client1).bookProperty(2, startDate, endDate, {
            value: ethers.utils.parseEther("0.9"),
        });

        // Client2 tries to book the same property for overlapping dates
        try {
            await propertyRental.connect(client2).bookProperty(2, startDate + 86400, endDate + 86400, {
                value: ethers.utils.parseEther("0.9"),
            });
            assert.fail("Double booking succeeded");
        } catch (error) {
            assert(
                error.message.includes("Property already booked for one or more days"),
                "Unexpected error message for double booking"
            );
        }
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

});
