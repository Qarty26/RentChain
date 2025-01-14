import { ethers } from "ethers";
import addresses from "../artifacts/addresses.json";

const provider = new ethers.providers.JsonRpcProvider("http://localhost:8545");

const nftAbi = [
  "function getTokenIds() view returns (uint256[])",
  "function getName(uint256 tokenId) view returns (string)",
  "function getDescription(uint256 tokenId) view returns (string)"
];

const propertyRentalAbi = [
  "function addProperty(string name, string description, uint256 price) public",
  "function bookProperty(uint256 _propertyId, uint256 _startDate, uint256 _endDate) external payable",
  "function updateProperty(uint256 propertyId, string name, string location, uint256 pricePerDay) public",
  "function getPropertyPrice(uint256 propertyId) view returns (uint256)"
];

const propertyRentalContract = new ethers.Contract(addresses.propertyRental, propertyRentalAbi, provider);

export async function bookProperty(propertyId, startDate, endDate, clientAddress, totalCost) {
  const signer = provider.getSigner(clientAddress);
  const propertyRentalWithSigner = propertyRentalContract.connect(signer);
  const tx = await propertyRentalWithSigner.bookProperty(propertyId, startDate, endDate, {
    value: ethers.utils.parseEther(totalCost)
  });
  await tx.wait();
  return tx;
}

const nftContract = new ethers.Contract(addresses.nft, nftAbi, provider);

export function getContractAddresses() {
  return addresses;
}

export async function getOwner1Info() {
  const balance = await provider.getBalance(addresses.owner1.address);
  return {
    address: addresses.owner1.address,
    balance: ethers.utils.formatEther(balance)
  };
}

export async function getClient1Info() {
  const balance = await provider.getBalance(addresses.client1.address);
  return {
    address: addresses.client1.address,
    balance: ethers.utils.formatEther(balance)
  };
}

// Function to transfer Ether
export async function transferEther(from, to, amount) {
  const signer = provider.getSigner(from);
  const tx = await signer.sendTransaction({
    to: to,
    value: ethers.utils.parseEther(amount)
  });
  await tx.wait();
  return tx;
}

export async function addPropertyToContract(name, description) {
  const signer = provider.getSigner(addresses.owner1.address);
  const propertyRentalContract = new ethers.Contract(addresses.propertyRental, propertyRentalAbi, signer);
  const tx = await propertyRentalContract.addProperty(name, description, ethers.utils.parseEther("0.1"));
  await tx.wait();
  return tx;
}

export async function addBoughtPropertyToContract(name, description, cost) {
  const signer = provider.getSigner(addresses.owner1.address);
  const propertyRentalContract = new ethers.Contract(addresses.propertyRental, propertyRentalAbi, signer);
  const tx = await propertyRentalContract.addProperty(name, description, ethers.utils.parseEther(cost));
  await tx.wait();

  // Deduct the cost from owner1's balance
  const tx2 = await signer.sendTransaction({
    to: addresses.propertyRental,
    value: ethers.utils.parseEther(cost)
  });
  await tx2.wait();

  return tx;
}

export async function getOwner1Tokens() {
  const tokenIds = await nftContract.connect(provider.getSigner(addresses.owner1.address)).getTokenIds();
  const tokens = [];

  for (const tokenId of tokenIds) {
    const name = await nftContract.getName(tokenId);
    const description = await nftContract.getDescription(tokenId);
    const price = await getPropertyPrice(tokenId);
    tokens.push({ tokenId, name, location: description, price });
  }

  return tokens;
}

export async function updateProperty(propertyId, name, location, price, clientAddress) {
  const signer = provider.getSigner(clientAddress);
  const propertyRentalWithSigner = propertyRentalContract.connect(signer);
  const tx = await propertyRentalWithSigner.updateProperty(propertyId, name, location, ethers.utils.parseEther(price));
  await tx.wait();
  return tx;
}

export async function getPropertyPrice(propertyId) {
  const price = await propertyRentalContract.getPropertyPrice(propertyId);
  return ethers.utils.formatEther(price);
}