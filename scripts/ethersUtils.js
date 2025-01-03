import { ethers } from "ethers";
import addresses from "../artifacts/addresses.json"; 

const provider = new ethers.providers.JsonRpcProvider("http://localhost:8545");

const nftAbi = [
  "function getTokenIds() view returns (uint256[])",
  "function getName(uint256 tokenId) view returns (string)",
  "function getDescription(uint256 tokenId) view returns (string)"
];

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



export async function getOwner1Tokens() {
  return addresses.owner1.tokens;
}