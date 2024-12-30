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

    const ownerDeployGas = await ownerContract.deployTransaction.gasLimit;
    console.log("Estimated Gas used for Owner contract deployment:", ownerDeployGas.toString());

    const NFTFactory = await ethers.getContractFactory("NFT");
    const nftContract = await NFTFactory.deploy();
    await nftContract.deployed();
    console.log("NFT contract deployed at:", nftContract.address);

    const nftDeployGas = await nftContract.deployTransaction.gasLimit;
    console.log("Estimated Gas used for NFT contract deployment:", nftDeployGas.toString());

    const ClientFactory = await ethers.getContractFactory("Client");
    const clientContract = await ClientFactory.deploy(deployer.address);
    await clientContract.deployed();
    console.log("Client contract deployed at:", clientContract.address);

    const clientDeployGas = await clientContract.deployTransaction.gasLimit;
    console.log("Estimated Gas used for Client contract deployment:", clientDeployGas.toString());

    const priceFeedAddress = "0x5f4ec3df9cbd43714fe2740f5e3616155c5b8419"; // Ethereum mainnet price feed address
    const PropertyRentalFactory = await ethers.getContractFactory("PropertyRental");
    const propertyRental = await PropertyRentalFactory.deploy(
        ownerContract.address,
        clientContract.address,
        nftContract.address,
        priceFeedAddress
    );
    await propertyRental.deployed();
    console.log("PropertyRental deployed at:", propertyRental.address);

    const propertyRentalDeployGas = await propertyRental.deployTransaction.gasLimit;
    console.log("Estimated Gas used for PropertyRental contract deployment:", propertyRentalDeployGas.toString());

    const addOwnerGas = await ownerContract.estimateGas.addOwner(owner1.address);
    console.log("Estimated Gas used for addOwner:", addOwnerGas.toString());

    const addOwnerGasWithBuffer = addOwnerGas.add(ethers.BigNumber.from('50000')); // Adding buffer of 50k gas units

    await ownerContract.connect(deployer).addOwner(owner1.address, { gasLimit: addOwnerGasWithBuffer });

    // Dynamically estimate gas for adding properties
    const prop1Gas = await propertyRental.estimateGas.addProperty(
        "Cozy Apartment", "Paris", ethers.utils.parseEther("0.2")
    );
    const prop1GasWithBuffer = prop1Gas.add(ethers.BigNumber.from('50000')); 
    await propertyRental.connect(owner1).addProperty(
        "Cozy Apartment", "Paris", ethers.utils.parseEther("0.2"),
        { gasLimit: prop1GasWithBuffer }
    );
    console.log("Owner1 added property: 1");

    const prop2Gas = await propertyRental.estimateGas.addProperty(
        "Modern Loft", "Berlin", ethers.utils.parseEther("0.3")
    );
    const prop2GasWithBuffer = prop2Gas.add(ethers.BigNumber.from('50000')); 
    await propertyRental.connect(owner1).addProperty(
        "Modern Loft", "Berlin", ethers.utils.parseEther("0.3"),
        { gasLimit: prop2GasWithBuffer }
    );
    console.log("Owner1 added property: 2");

    const prop3Gas = await propertyRental.estimateGas.addProperty(
        "One Cotroceni", "Bucharest", ethers.utils.parseEther("0.6")
    );
    const prop3GasWithBuffer = prop3Gas.add(ethers.BigNumber.from('50000')); 
    await propertyRental.connect(owner1).addProperty(
        "One Cotroceni", "Bucharest", ethers.utils.parseEther("0.6"),
        { gasLimit: prop3GasWithBuffer }
    );
    console.log("Owner1 added property: 3");

    // Fetch token IDs and details for NFTs owned by owner1
    const tokenIds = await nftContract.connect(owner1).getTokenIds();
    let owner1NFTs = [];

    for (const tokenId of tokenIds) {
        const name = await nftContract.getName(tokenId);
        const description = await nftContract.getDescription(tokenId);
        owner1NFTs.push({ tokenId, name, description });
    }

    console.log("Owner1 NFTs:");
    console.log(owner1.address);

    const addresses = {
        owner: ownerContract.address,
        client: clientContract.address,
        nft: nftContract.address,
        propertyRental: propertyRental.address,
        owner1: {
            address: owner1.address,
            balance: ethers.utils.formatEther(await owner1.getBalance()),
            nfts: owner1NFTs
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
