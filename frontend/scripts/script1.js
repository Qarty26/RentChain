import { ethers } from "ethers";
import addresses from "../../artifacts/addresses.json";

const provider = new ethers.providers.JsonRpcProvider("http://localhost:8545");

const propertyRentalAbi = [
  "function addProperty(string name, string description, uint256 price) public",
  "function bookProperty(uint256 _propertyId, uint256 _startDate, uint256 _endDate) external payable",
  "function extendBooking(uint256 _propertyId, uint256 extendedTime) external payable",
  "function getClientBookings(address _client) external view returns (uint256[] memory)"
];

const propertyRentalContract = new ethers.Contract(addresses.propertyRental, propertyRentalAbi, provider);

const clientAbi = [
  "function getBookingInterval(address _client, uint256 _propertyId) external view returns (uint256[2])"
];

const clientContract = new ethers.Contract(addresses.client, clientAbi, provider);


  export async function transferEther(from, to, amount) {
    const signer = provider.getSigner(from);
    const tx = await signer.sendTransaction({
      to: to,
      value: ethers.utils.parseEther(amount)
    });
    await tx.wait();
    return tx;
  }

export async function bookProperty(propertyId, startDate, endDate, clientAddress, totalCost) {
  const signer = provider.getSigner(clientAddress);
  const propertyRentalWithSigner = propertyRentalContract.connect(signer);
  const tx = await propertyRentalWithSigner.bookProperty(propertyId, startDate, endDate, {
    value: ethers.utils.parseEther(totalCost.toString())
  });
  await tx.wait();
  return tx;
}

export async function extendBooking(propertyId, extendedTime, clientAddress, totalCost) {
  const signer = provider.getSigner(clientAddress);
  const propertyRentalWithSigner = propertyRentalContract.connect(signer);
  const tx = await propertyRentalWithSigner.extendBooking(propertyId, extendedTime, {
    value: ethers.utils.parseEther(totalCost.toString())
  });
  await tx.wait();
  return tx;
}


export async function getBookingInterval(clientAddress, propertyId) {
  console.log('Calling getBookingInterval with:', clientAddress, propertyId);
  try {
    let interval = await clientContract.getBookingInterval(clientAddress, propertyId);
    console.log('Booking interval:', interval[0], interval[1]);
    return interval;
  } catch (error) {
    console.error('Error calling getBookingInterval:', error);
    throw error;
  }
}


export function getContractAddresses() {
  return addresses;
}

export async function getClient1Info() {
  const balance = await provider.getBalance(addresses.client1.address);
  return {
    address: addresses.client1.address,
    balance: ethers.utils.formatEther(balance)
  };
}

export async function getOwner1Info() {
  const balance = await provider.getBalance(addresses.owner1.address);
  return {
    address: addresses.owner1.address,
    balance: ethers.utils.formatEther(balance)
  };
}

export async function getBalance(address) {
  const balance = await provider.getBalance(address);
  return ethers.utils.formatEther(balance);
}