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
    console.log(); 


    const NFTFactory = await ethers.getContractFactory("NFT");
    const nftContract = await NFTFactory.deploy();
    await nftContract.deployed();
    console.log("NFT contract deployed at:", nftContract.address);

    const nftDeployGas = await nftContract.deployTransaction.gasLimit;
    console.log("Estimated Gas used for NFT contract deployment:", nftDeployGas.toString());
    console.log(); 


    const ClientFactory = await ethers.getContractFactory("Client");
    const clientContract = await ClientFactory.deploy(deployer.address);
    await clientContract.deployed();
    console.log("Client contract deployed at:", clientContract.address);

    const clientDeployGas = await clientContract.deployTransaction.gasLimit;
    console.log("Estimated Gas used for Client contract deployment:", clientDeployGas.toString());
    console.log(); 


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

    const prop1 = await propertyRental.connect(owner1).addProperty("Cozy Apartment", "Paris", ethers.utils.parseEther("0.2"));
    await prop1.wait();
    console.log("Owner1 added property: 1");

    const prop2 = await propertyRental.connect(owner1).addProperty("Modern Loft", "Berlin", ethers.utils.parseEther("0.3"));
    await prop2.wait();
    console.log("Owner1 added property: 2");

    const prop3 = await propertyRental.connect(owner1).addProperty("One Cotroceni", "Bucharest", ethers.utils.parseEther("0.6"));
    await prop3.wait();
    console.log("Owner1 added property: 3");

    console.log("Owner1 tokens:")
    let tokenIds = await nftContract.connect(owner1).getTokenIds();

    for (const tokenId of tokenIds) {
        const name = await nftContract.getName(tokenId);
        const description = await nftContract.getDescription(tokenId);
    
        console.log(`Token ID: ${tokenId}`);
        console.log(`Name: ${name}`);
        console.log(`Description: ${description}`);
    }

    async function getOwner1Tokens(nftContract, owner1) {
        const tokenIds = await nftContract.connect(owner1).getTokenIds();
        const tokens = [];
    
        for (const tokenId of tokenIds) {
            const name = await nftContract.getName(tokenId);
            const description = await nftContract.getDescription(tokenId);
            tokens.push({ tokenId, name, description });
        }
    
        return tokens;
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

    const owner1Tokens = await getOwner1Tokens(nftContract, owner1);
    addresses.owner1.tokens = owner1Tokens;

    fs.writeFileSync(path.join(__dirname, '../artifacts/addresses.json'), JSON.stringify(addresses, null, 2));

}

deploy()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });