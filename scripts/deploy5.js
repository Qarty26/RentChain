const fs = require('fs');
const path = require('path');
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

    const prop1 = await propertyRental.connect(owner1).addProperty("Cozy Apartment", "Paris", ethers.utils.parseEther("0.2"));
    await prop1.wait();
    console.log("Owner1 added property: 1");

    const prop2 = await propertyRental.connect(owner1).addProperty("Modern Loft", "Berlin", ethers.utils.parseEther("0.3"));
    await prop2.wait();
    console.log("Owner1 added property: 2");

    const prop3 =  await propertyRental.connect(owner2).addProperty("Beach House", "Malibu", ethers.utils.parseEther("0.5"));
    await prop3.wait();
    console.log("Owner2 added property: 3");

    const prop4 = await propertyRental.connect(owner2).addProperty("Mountain Cabin", "Aspen", ethers.utils.parseEther("0.4"));
    await prop4.wait();
    console.log("Owner2 added property: 4");

    let owner1Properties = await propertyRental.getPropertiesByOwner(owner1.address);
    console.log("Properties owned by Owner1:");
    for (let i = 0; i < owner1Properties.length; i++) {
        let propertyId = owner1Properties[i];
        let property = await propertyRental.properties(propertyId);
        console.log(`  Property ID: ${propertyId}, Name: ${property.name}, Location: ${property.location}, Price:${property.pricePerDay}`);
    }

    console.log("Owner1 NFTs:")
    let tokenIds = await nftContract.connect(owner1).getTokenIds();

    for (const tokenId of tokenIds) {
        const name = await nftContract.getName(tokenId);
        const description = await nftContract.getDescription(tokenId);
    
        console.log(`Token ID: ${tokenId}`);
        console.log(`Name: ${name}`);
        console.log(`Description: ${description}`);
    }

    const updatedProperty = await propertyRental.connect(owner1).updateProperty(1, "One Cotroceni", "Bucharest", ethers.utils.parseEther("0.4"));
    await updatedProperty.wait();


    owner1Properties = await propertyRental.getPropertiesByOwner(owner1.address);
    console.log("Properties owned by Owner1:");
    for (let i = 0; i < owner1Properties.length; i++) {
        let propertyId = owner1Properties[i];
        let property = await propertyRental.properties(propertyId);
        console.log(`  Property ID: ${propertyId}, Name: ${property.name}, Location: ${property.location}, Price:${property.pricePerDay} `);
    }

    console.log("Owner1 NFTs:")
    tokenIds = await nftContract.connect(owner1).getTokenIds();

    for (const tokenId of tokenIds) {
        const name = await nftContract.getName(tokenId);
        const description = await nftContract.getDescription(tokenId);
    
        console.log(`Token ID: ${tokenId}`);
        console.log(`Name: ${name}`);
        console.log(`Description: ${description}`);
    }




    // save addresses and balances to a JSON file
    const addresses = {
        owner: ownerContract.address,
        client: clientContract.address,
        nft: nftContract.address,
        propertyRental: propertyRental.address,
        owner1: {
            address: owner1.address,
            balance: ethers.utils.formatEther(await owner1.getBalance())
        },
        client1: {
            address: client1.address,
            balance: ethers.utils.formatEther(await client1.getBalance()) 
        }
    };

    fs.writeFileSync(path.join(__dirname, '../artifacts/addresses.json'), JSON.stringify(addresses, null, 2));

}

deploy()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });