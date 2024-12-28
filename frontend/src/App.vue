<template>
  <div class="app-container">
    <h1 class="main-title">Web3 Account Info</h1>
    <ul class="account-list">
      <li v-for="account in accounts" :key="account" class="account-item">
        Account: <span class="account">{{ account }}</span>
      </li>
      <li v-if="balance" class="balance-item">
        Balance of first account: <span class="balance">{{ balance }} ETH</span>
      </li>
    </ul>

    <h2 class="section-title">Contract Addresses</h2>
    <ul class="contract-list">
      <li class="contract-item">Owner Contract: <span class="contract-address">{{ contractAddresses.owner }}</span></li>
      <li class="contract-item">Client Contract: <span class="contract-address">{{ contractAddresses.client }}</span></li>
      <li class="contract-item">NFT Contract: <span class="contract-address">{{ contractAddresses.nft }}</span></li>
      <li class="contract-item">PropertyRental Contract: <span class="contract-address">{{ contractAddresses.propertyRental }}</span></li>
    </ul>

    <h2 class="section-title">Owner1 Info</h2>
    <ul class="info-list">
      <li class="info-item">Address: <span class="info-value">{{ owner1Info.address }}</span></li>
      <li class="info-item">Balance: <span class="info-value">{{ owner1Info.balance }} ETH</span></li>
    </ul>

    <h2 class="section-title">Owner1 NFTs</h2>
    <ul class="nft-list">
      <li v-for="nft in owner1NFTs" :key="nft.tokenId" class="nft-item">
        <p>Name: <span class="nft-value">{{ nft.name }}</span></p>
        <p>Location: <span class="nft-value">{{ nft.description }}</span></p>
      </li>
    </ul>

    <h2 class="section-title">Client1 Info</h2>
    <ul class="info-list">
      <li class="info-item">Address: <span class="info-value">{{ client1Info.address }}</span></li>
      <li class="info-item">Balance: <span class="info-value">{{ client1Info.balance }} ETH</span></li>
    </ul>

    <div class="button-container">
      <button @click="transferEther" class="action-button transfer-btn">Transfer Ether</button>
      <button @click="callContractFunction" class="action-button contract-btn">Call Contract Function</button>
    </div>
  </div>
</template>

<script>
import { getContractAddresses, getOwner1Info, getClient1Info, getOwner1NFTs, transferEther, callContractFunction } from "../../scripts/ethersUtils";

export default {
  data() {
    return {
      accounts: [],
      balance: null,
      contractAddresses: {},
      owner1Info: {},
      client1Info: {},
      owner1NFTs: []
    };
  },
  async mounted() {
    this.contractAddresses = getContractAddresses();
    this.owner1Info = await getOwner1Info();
    this.client1Info = await getClient1Info();
    this.owner1NFTs = await getOwner1NFTs();
  },
  methods: {
    async transferEther() {
      const from = this.client1Info.address; // Sender address (client1)
      const to = this.owner1Info.address; // Recipient address (owner1)
      const amount = "0.1"; // Amount in ETH to transfer
      await transferEther(from, to, amount);
      alert("Transfer complete!");
      window.location.reload(); // Refresh the page after transfer
    },
    async callContractFunction() {
      const contractAddress = this.contractAddresses.propertyRental;
      const abi = [ /* !!!!! TO DO : ABI of the contract */ ];
      const functionName = "someFunction"; // !!!!!!!!! TO DO , Replace with actual function name
      const args = [ /* !!!!! TO DO: Arguments for the function */ ];
      await callContractFunction(contractAddress, abi, functionName, ...args);
      alert("Contract function called!");
    }
  }
};
</script>

<style scoped>
/* General Styles */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Arial', sans-serif;
  background-color: #f4f7fc;
  color: #333;
}

.app-container {
  max-width: 1200px;
  margin: 30px auto;
  padding: 20px;
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.main-title {
  font-size: 2.5rem;
  font-weight: 600;
  text-align: center;
  margin-bottom: 20px;
  color: #2b2d42;
}

.section-title {
  font-size: 2rem;
  margin-bottom: 10px;
  color: #1e212d;
}

.account-list, .contract-list, .info-list, .nft-list {
  list-style: none;
  padding: 0;
  margin-bottom: 20px;
}

.account-item, .contract-item, .info-item, .nft-item {
  padding: 15px;
  border-bottom: 1px solid #e2e2e2;
  font-size: 1.2rem;
  color: #4a4e69;
}

.account-item span, .balance-item span, .info-value, .nft-value {
  font-weight: bold;
  color: #2a9d8f;
}

.contract-item span {
  color: #e76f51;
  word-wrap: break-word;
}

.balance-item {
  font-size: 1.3rem;
  color: #2a9d8f;
}

/* Buttons */
.button-container {
  display: flex;
  justify-content: space-around;
  margin-top: 30px;
}

.action-button {
  padding: 15px 30px;
  font-size: 1.2rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.transfer-btn {
  background-color: #2a9d8f;
  color: #fff;
}

.transfer-btn:hover {
  background-color: #1f7862;
}

.contract-btn {
  background-color: #e76f51;
  color: #fff;
}

.contract-btn:hover {
  background-color: #d15f42;
}

.action-button:focus {
  outline: none;
}

/* Responsiveness */
@media screen and (max-width: 600px) {
  .app-container {
    padding: 15px;
  }

  .main-title {
    font-size: 2rem;
  }

  .section-title {
    font-size: 1.5rem;
  }

  .action-button {
    padding: 10px 20px;
    font-size: 1rem;
  }
}
</style>