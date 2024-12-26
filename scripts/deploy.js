require("@nomiclabs/hardhat-ethers");
const { ethers } = require("hardhat");

async function deploy() {
    const [deployer, owner1, owner2, client1, client2] = await ethers.getSigners();

    const OwnerFactory = await ethers.getContractFactory("Owner");
    const ownerContract = await OwnerFactory.deploy(deployer.address);
    await ownerContract.deployed();
    console.log("Owner contract deployed at:", ownerContract.address);

    const NFTFactory = await ethers.getContractFactory("NFT");
    const nftContract = await NFTFactory.deploy();
    await nftContract.deployed();
    console.log("NFT contract deployed at:", nftContract.address);

    const ClientFactory = await ethers.getContractFactory("Client");
    const clientContract = await ClientFactory.deploy(deployer.address);
    await clientContract.deployed();
    console.log("Client contract deployed at:", clientContract.address);

    const PropertyRentalFactory = await ethers.getContractFactory("PropertyRental");
    const propertyRental = await PropertyRentalFactory.deploy(ownerContract.address, clientContract.address, nftContract.address);
    await propertyRental.deployed();
    console.log("PropertyRental deployed at:", propertyRental.address);

    await ownerContract.connect(deployer).addOwner(owner1.address);
    await ownerContract.connect(deployer).addOwner(owner2.address);
    await clientContract.connect(deployer).addClient(client1.address);
    await clientContract.connect(deployer).addClient(client2.address);


    await propertyRental.connect(owner1).addProperty("Cozy Apartment", "Paris", ethers.utils.parseEther("0.2"));
    console.log("Owner1 added property: 1");
    await propertyRental.connect(owner1).addProperty("Modern Loft", "Berlin", ethers.utils.parseEther("0.3"));
    console.log("Owner1 added property: 2");
    await propertyRental.connect(owner2).addProperty("Beach House", "Malibu", ethers.utils.parseEther("0.5"));
    console.log("Owner2 added property: 3");
    await propertyRental.connect(owner2).addProperty("Mountain Cabin", "Aspen", ethers.utils.parseEther("0.4"));
    console.log("Owner2 added property: 4");





    const client1BookingTx = await propertyRental.connect(client1).bookProperty(1, Math.floor(Date.now() / 1000), Math.floor(Date.now() / 1000) + 86400 * 3, {
        value: ethers.utils.parseEther("0.6")
    });
    await client1BookingTx.wait();
    console.log("Client1 booked property 1 for 3 days");






    const client2BookingTx = await propertyRental.connect(client2).bookProperty(3, Math.floor(Date.now() / 1000), Math.floor(Date.now() / 1000) + 86400 * 5, {
        value: ethers.utils.parseEther("2.5")
    });
    await client2BookingTx.wait();
    console.log("Client2 booked property 3 for 5 days");

    const client3BookingTx = await propertyRental.connect(client2).bookProperty(2, Math.floor(Date.now() / 1000), Math.floor(Date.now() / 1000) + 86400 * 3, {
        value: ethers.utils.parseEther("0.9")
    });
    await client3BookingTx.wait();
    console.log("Client2 booked property 2 for 3 days");

    // Fetch properties owned by each owner
    // let owner1Properties = await propertyRental.getPropertiesByOwner(owner1.address);
    // console.log("Properties owned by Owner1:");
    // for (let i = 0; i < owner1Properties.length; i++) {
    //     let propertyId = owner1Properties[i];
    //     let property = await propertyRental.properties(propertyId);
    //     console.log(`  Property ID: ${propertyId}, Name: ${property.name}, Location: ${property.location}`);
    // }

    // let owner2Properties = await propertyRental.getPropertiesByOwner(owner2.address);
    // console.log("Properties owned by Owner2:");
    // for (let i = 0; i < owner2Properties.length; i++) {
    //     let propertyId = owner2Properties[i];
    //     let property = await propertyRental.properties(propertyId);
    //     console.log(`  Property ID: ${propertyId}, Name: ${property.name}, Location: ${property.location}`);
    // }

    // Fetch properties booked by each client
    // let client1Bookings = await propertyRental.getUserBookings(client1.address);
    // console.log("Properties booked by Client1:");
    // for (let i = 0; i < client1Bookings.length; i++) {
    //     let propertyId = client1Bookings[i];
    //     let property = await propertyRental.properties(propertyId);
    //     console.log(`  Property ID: ${propertyId}, Name: ${property.name}, Location: ${property.location}`);
    // }

    // let client2Bookings = await propertyRental.getUserBookings(client2.address);
    // console.log("Properties booked by Client2:");
    // for (let i = 0; i < client2Bookings.length; i++) {
    //     let propertyId = client2Bookings[i];
    //     let property = await propertyRental.properties(propertyId);
    //     console.log(`  Property ID: ${propertyId}, Name: ${property.name}, Location: ${property.location}`);
    // }


    console.log("Revenues before withdrawal:");
    const owner1Revenue = await propertyRental.ownerRevenue(owner1.address);
    console.log("Owner1 revenue:", ethers.utils.formatEther(owner1Revenue));
    const owner2Revenue = await propertyRental.ownerRevenue(owner2.address);
    console.log("Owner2 revenue:", ethers.utils.formatEther(owner2Revenue));


    let tx = await propertyRental.connect(owner1).withdraw(owner1Revenue);
    await tx.wait();

    tx = await propertyRental.connect(owner2).withdraw(owner2Revenue);
    await tx.wait();


    console.log("Final Balances after withdrawals:");
    console.log("Deployer balance:", ethers.utils.formatEther(await deployer.getBalance()));
    console.log("Owner1 balance:", ethers.utils.formatEther(await owner1.getBalance()));
    console.log("Owner2 balance:", ethers.utils.formatEther(await owner2.getBalance()));
    console.log("Client1 balance:", ethers.utils.formatEther(await client1.getBalance()));
    console.log("Client2 balance:", ethers.utils.formatEther(await client2.getBalance()));


    console.log("Owner1 NFTs:")
    console.log(owner1.address)
    let tokenIds = nftContract.connect(owner1).getTokenIds();
    for(let i in tokenIds)
    {
        console.log(i.name);
        console.log(i.description);
    }

    
}

deploy()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
