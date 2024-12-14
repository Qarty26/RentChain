require("@nomiclabs/hardhat-ethers");
const { ethers } = require("hardhat");

async function deploy() {
    const [deployer, owner1, user1] = await ethers.getSigners();

    // Deploy PropertyRental contract
    const PropertyRentalFactory = await ethers.getContractFactory("PropertyRental");
    const propertyRental = await PropertyRentalFactory.deploy();
    await propertyRental.deployed();
    console.log("PropertyRental deployed at:", propertyRental.address);

    // Add a new owner (owner1)
    let tx = await propertyRental.connect(deployer).addOwner(owner1.address);
    await tx.wait();
    console.log("Added new owner:", owner1.address);

    // Owner adds a property
    tx = await propertyRental.connect(owner1).addProperty("Luxury Villa", "Bucharest", ethers.utils.parseEther("0.5"));
    await tx.wait();
    console.log("Owner1 added a property.");

    // Display property details
    const property = await propertyRental.properties(1);
    console.log("Property ID:", property.id.toString());
    console.log("Property Name:", property.name);
    console.log("Property Location:", property.location);
    console.log("Property Price Per Day (ETH):", ethers.utils.formatEther(property.pricePerDay));
    console.log("Property Owner:", property.owner);
}

deploy()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
