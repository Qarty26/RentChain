require("@nomiclabs/hardhat-ethers");
const { ethers } = require("hardhat");

async function deploy() {
    const [deployer, owner1, owner2, user1] = await ethers.getSigners();

    console.log("Deploying contracts with the account:", deployer.address);

    // Deploy the PropertyRental contract
    const PropertyRentalFactory = await ethers.getContractFactory("PropertyRental");
    const propertyRental = await PropertyRentalFactory.deploy();
    await propertyRental.deployed();
    console.log("PropertyRental deployed at:", propertyRental.address);

    // Add multiple owners
    console.log("\n--- Adding Owners ---");
    let tx = await propertyRental.connect(deployer).addOwner(owner1.address);
    await tx.wait();
    console.log(`Added Owner1: ${owner1.address}`);

    tx = await propertyRental.connect(deployer).addOwner(owner2.address);
    await tx.wait();
    console.log(`Added Owner2: ${owner2.address}`);

    // Owners add properties
    console.log("\n--- Adding Properties ---");
    tx = await propertyRental.connect(owner1).addProperty(
        "Luxury Villa", 
        "Bucharest", 
        ethers.utils.parseEther("0.5")
    );
    await tx.wait();
    console.log("Owner1 added a property: Luxury Villa");

    tx = await propertyRental.connect(owner2).addProperty(
        "Beach House", 
        "Constanta", 
        ethers.utils.parseEther("1.0")
    );
    await tx.wait();
    console.log("Owner2 added a property: Beach House");

    tx = await propertyRental.connect(owner2).addProperty(
        "Mountain Cabin", 
        "Brasov", 
        ethers.utils.parseEther("0.8")
    );
    await tx.wait();
    console.log("Owner2 added a property: Mountain Cabin");

    // Display all properties
    console.log("\n--- Displaying All Properties ---");
    const propertyCount = await propertyRental.propertyCount();
    for (let i = 1; i <= propertyCount; i++) {
        const property = await propertyRental.properties(i);
        console.log(`Property ID: ${property.id.toString()}`);
        console.log(`  Name: ${property.name}`);
        console.log(`  Location: ${property.location}`);
        console.log(`  Price Per Day (ETH): ${ethers.utils.formatEther(property.pricePerDay)}`);
        console.log(`  Owner Address: ${property.owner}`);
        console.log("-------------------------------");
    }



    tx = await propertyRental.connect(user1).bookProperty(
        1, 
        Math.floor(Date.now() / 1000), // Current timestamp as start date
        Math.floor(Date.now() / 1000) + (3 * 24 * 60 * 60), // Start + 3 days
        { value: ethers.utils.parseEther("1.5") } // 0.5 ETH/day * 3 days
    );
    await tx.wait();
    console.log("User1 booked Luxury Villa for 3 days.");


    const userBookings = await propertyRental.getUserBookings(user1.address);
    console.log("\n--- User1's Bookings ---");
    userBookings.forEach((booking, index) => {
        console.log(`Booking ${index + 1}:`);
        console.log(`  Property ID: ${booking.propertyId}`);
        console.log(`  Start Date: ${new Date(booking.startDate * 1000).toISOString()}`);
        console.log(`  End Date: ${new Date(booking.endDate * 1000).toISOString()}`);
    });
}

deploy()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
