require("@nomiclabs/hardhat-ethers");
const { ethers } = require("hardhat");

async function deploy() {
    const [deployer, owner1, owner2, client1, client2] = await ethers.getSigners();

    // Deploy Owner contract
    const OwnerFactory = await ethers.getContractFactory("Owner");
    const ownerContract = await OwnerFactory.deploy(deployer.address);
    await ownerContract.deployed();
    console.log("Owner contract deployed at:", ownerContract.address);

    // Deploy Client contract
    const ClientFactory = await ethers.getContractFactory("Client");
    const clientContract = await ClientFactory.deploy(deployer.address);
    await clientContract.deployed();
    console.log("Client contract deployed at:", clientContract.address);

    // Deploy PropertyRental contract
    const PropertyRentalFactory = await ethers.getContractFactory("PropertyRental");
    const propertyRental = await PropertyRentalFactory.deploy(ownerContract.address, clientContract.address);
    await propertyRental.deployed();
    console.log("PropertyRental deployed at:", propertyRental.address);

    // Add two owners
    let tx = await ownerContract.connect(deployer).addOwner(owner1.address);
    await tx.wait();
    console.log("Added Owner1:", owner1.address);

    tx = await ownerContract.connect(deployer).addOwner(owner2.address);
    await tx.wait();
    console.log("Added Owner2:", owner2.address);

    // Owners add properties
    tx = await propertyRental.connect(owner1).addProperty("Cozy Apartment", "Paris", ethers.utils.parseEther("0.2"));
    await tx.wait();
    console.log("Owner1 added property 1");

    tx = await propertyRental.connect(owner1).addProperty("Modern Loft", "Berlin", ethers.utils.parseEther("0.3"));
    await tx.wait();
    console.log("Owner1 added property 2");

    tx = await propertyRental.connect(owner2).addProperty("Beach House", "Malibu", ethers.utils.parseEther("0.5"));
    await tx.wait();
    console.log("Owner2 added property 3");

    tx = await propertyRental.connect(owner2).addProperty("Mountain Cabin", "Aspen", ethers.utils.parseEther("0.4"));
    await tx.wait();
    console.log("Owner2 added property 4");

    // Register two clients
    tx = await clientContract.connect(deployer).addClient(client1.address);
    await tx.wait();
    console.log("Registered Client1:", client1.address);

    tx = await clientContract.connect(deployer).addClient(client2.address);
    await tx.wait();
    console.log("Registered Client2:", client2.address);

    // Clients book properties
    tx = await propertyRental.connect(client1).bookProperty(1, Math.floor(Date.now() / 1000), Math.floor(Date.now() / 1000) + 86400 * 3, {
        value: ethers.utils.parseEther("0.6")
    });
    await tx.wait();
    console.log("Client1 booked property 1 for 3 days");

    tx = await propertyRental.connect(client2).bookProperty(3, Math.floor(Date.now() / 1000), Math.floor(Date.now() / 1000) + 86400 * 5, {
        value: ethers.utils.parseEther("2.5")
    });
    await tx.wait();
    console.log("Client2 booked property 3 for 5 days");

    // Fetch properties owned by each owner
    let owner1Properties = await propertyRental.getPropertiesByOwner(owner1.address);
    console.log("Properties owned by Owner1:", owner1Properties.map(p => p.toString()));

    let owner2Properties = await propertyRental.getPropertiesByOwner(owner2.address);
    console.log("Properties owned by Owner2:", owner2Properties.map(p => p.toString()));

    // Fetch properties booked by each client
    let client1Bookings = await propertyRental.getUserBookings(client1.address);
    console.log("Properties booked by Client1:", client1Bookings.map(p => p.toString()));

    let client2Bookings = await propertyRental.getUserBookings(client2.address);
    console.log("Properties booked by Client2:", client2Bookings.map(p => p.toString()));
}

deploy()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
