<template>
  <div class="app-container">
    <h1 class="main-title">Web3 Account Info</h1>
    <h2 class="section-title">Contract Addresses</h2>
    <ul class="contract-list">
      <li class="contract-item">Owner Contract: <span class="contract-address">{{ contractAddresses.owner }}</span></li>
      <li class="contract-item">NFT Contract: <span class="contract-address">{{ contractAddresses.nft }}</span></li>
      <li class="contract-item">PropertyRental Contract: <span class="contract-address">{{ contractAddresses.propertyRental }}</span></li>
    </ul>

    <hr class="section-divider" />
    <h2 class="section-title">Owner1 Info</h2>
    <ul class="info-list">
      <li class="info-item">Address: <span class="info-value">{{ owner1Info.address }}</span></li>
      <li class="info-item">Balance: <span class="info-value">{{ owner1Info.balance }} ETH</span></li>
    </ul>

    <h2 class="section-title">Owner1 Tokens</h2>
    <button @click="toggleTokens" class="action-button token-display-btn">
      {{ showTokens ? 'Hide Owner 1 Tokens' : 'Display Owner 1 Tokens' }}
    </button>
    <ul v-if="showTokens" class="token-list">
      <li v-for="token in owner1Tokens" :key="token.tokenId" class="token-item">
        <p>Name: <span class="token-value">{{ token.name }}</span></p>
        <p>Description: <span class="token-value">{{ token.description }}</span></p>
      </li>
    </ul>

    <h2 class="section-title">Add Property</h2>
    <div class="add-property-form">
      <input v-model="newPropertyName" placeholder="Property Name" class="input-field" />
      <input v-model="newPropertyDescription" placeholder="Property Description" class="input-field" />
      <button @click="addProperty" class="action-button add-property-btn">Add Property</button>
    </div>

    <h2 class="section-title">Buy a Property</h2>
    <div class="add-property-form">
      <input v-model="newBoughtPropertyName" placeholder="Property Name" class="input-field" />
      <input v-model="newBoughtPropertyDescription" placeholder="Property Description" class="input-field" />
      <input v-model="newBoughtPropertyCost" placeholder="Cost (ETH)" class="input-field" type="number" />
      <button @click="addBoughtProperty" class="action-button add-property-btn">Buy Property</button>
    </div>
  </div>
</template>

<script>
import { getContractAddresses, getOwner1Info, getOwner1Tokens, addPropertyToContract, addBoughtPropertyToContract } from "../../scripts/ethersUtils";

export default {
  name: 'Owner',
  data() {
    return {
      accounts: [],
      balance: null,
      contractAddresses: {},
      owner1Info: {},
      owner1Tokens: [],
      showTokens: false,
      newPropertyName: '',
      newPropertyDescription: '',
      newBoughtPropertyName: '',
      newBoughtPropertyDescription: '',
      newBoughtPropertyCost: '',
    };
  },
  async mounted() {
    this.contractAddresses = getContractAddresses();
    this.owner1Info = await getOwner1Info();
    this.owner1Tokens = await getOwner1Tokens();
  },
  methods: {
    toggleTokens() {
      this.showTokens = !this.showTokens;
    },
    async addProperty() {
      try {
        await addPropertyToContract(this.newPropertyName, this.newPropertyDescription);
        alert("Property added successfully!");
        this.owner1Tokens = await getOwner1Tokens(); // Refresh the tokens
      } catch (error) {
        console.error("Error adding property:", error);
        alert("Failed to add property.");
      }
    },
    async addBoughtProperty() {
      try {
        const costString = this.newBoughtPropertyCost.toString();
        await addBoughtPropertyToContract(this.newBoughtPropertyName, this.newBoughtPropertyDescription, costString);
        alert("Bought property added successfully!");
        this.owner1Tokens = await getOwner1Tokens(); // Refresh the tokens
        this.owner1Info = await getOwner1Info(); // Refresh the owner1 info
      } catch (error) {
        console.error("Error adding bought property:", error);
        alert("Failed to add bought property.");
      }
    },
  }
}
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

.account-list, .contract-list, .info-list, .nft-list, .token-list {
  list-style: none;
  padding: 0;
  margin-bottom: 20px;
}

.account-item, .contract-item, .info-item, .nft-item, .token-item {
  padding: 15px;
  border-bottom: 1px solid #e2e2e2;
  font-size: 1.2rem;
  color: #4a4e69;
}

.account-item span, .balance-item span, .info-value, .nft-value, .token-value {
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

.nft-display-btn {
  background-color: #007bff;
  color: #fff;
}

.nft-display-btn:hover {
  background-color: #0056b3;
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

.token-display-btn {
  background-color: #007bff;
  color: #fff;
}

.token-display-btn:hover {
  background-color: #0056b3;
}

.add-property-btn {
  background-color: #28a745;
  color: #fff;
}

.add-property-btn:hover {
  background-color: #218838;
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

.token-list {
  list-style: none;
  padding: 0;
  margin-bottom: 20px;
}

.token-item {
  padding: 15px;
  border-bottom: 1px solid #e2e2e2;
  font-size: 1.2rem;
  color: #4a4e69;
}

.token-value {
  font-weight: bold;
  color: #2a9d8f;
}

.add-property-form {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 20px;
}

.input-field {
  padding: 10px;
  font-size: 1rem;
  border: 1px solid #ccc;
  border-radius: 5px;
}

.section-divider {
  border: 1px solid black;
  margin: 20px 0;
}
</style>