<template>
  <div class="app-container">
    <h1 class="main-title">Web3 Account Info</h1>

    <h2 class="section-title">Contract Addresses</h2>
    <ul class="contract-list">
      <li class="contract-item">Client Contract: <span class="contract-address">{{ contractAddresses.client }}</span></li>
      <li class="contract-item">PropertyRental Contract: <span class="contract-address">{{ contractAddresses.propertyRental }}</span></li>
    </ul>

    <h2 class="section-title">Client1 Info</h2>
    <ul class="info-list">
      <li class="info-item">Address: <span class="info-value">{{ client1Info.address }}</span></li>
      <li class="info-item">Balance: <span class="info-value">{{ client1Info.balance }} ETH</span></li>
    </ul>



    <div class="button-container">
      <button @click="handlePayRent" class="action-button transfer-btn">{{ rentButtonLabel }}</button>
      <button @click="showAdvanceRentPopup" class="action-button transfer-btn">Pay Rent in Advance</button>
      <button @click="displayResult" class="action-button transfer-btn">Display Result</button>
    </div>

    <div v-if="result" class="result-container">
      <h3>Booking Interval Result</h3>
      <p>{{ result }}</p>
    </div>

    <div v-if="showPopup" class="popup-container">
      <div class="popup">
        <h3>Enter Number of Days</h3>
        <input v-model="advanceDays" type="number" min="1" />
        <button @click="handlePayRentInAdvance" class="action-button">Submit</button>
        <button @click="closePopup" class="action-button">Cancel</button>
      </div>
    </div>
  </div>
</template>
<script>
import { getContractAddresses, getClient1Info, getOwner1Info, bookProperty, getBalance, extendBooking, getBookingInterval, transferEther } from "../scripts/script1.js";

export default {
  name: 'Client',
  data() {
    return {
      accounts: [],
      balance: null,
      contractAddresses: {},
      client1Info: {},
      owner1Info: {},
      rentButtonLabel: "Pay Rent for TODAY",
      propertyId: 1, 
      startDate: 1633046400, // Unix timestamp
      endDate: 1633132800, // Unix timestamp
      totalCost: '0.2', 
      extendedTime: 86400, // 1 day
      showPopup: false,
      advanceDays: 1,
      result: null,
      ownerBalance: null
    };
  },
  async mounted() {
    this.contractAddresses = getContractAddresses();
    this.client1Info = await getClient1Info();
    this.owner1Info = await getOwner1Info();
    this.balance = await getBalance(this.client1Info.address);
    this.ownerBalance = await getBalance(this.owner1Info.address);
  },
  methods: {
    async handlePayRent() {
      try {
        const tx = await bookProperty(this.propertyId, this.startDate, this.endDate, this.client1Info.address, this.totalCost);
        console.log('Transaction successful:', tx);
        alert('Transaction successful');
        await transferEther(this.client1Info.address, this.owner1Info.address, this.totalCost);
        this.balance = await getBalance(this.client1Info.address); 
        this.ownerBalance = await getBalance(this.owner1Info.address);
      } catch (error) {
        console.error('Transaction failed:', error);
        alert('ALREADY PAID! TRY PAYING IN ADVANCE!');
      }
    },
    showAdvanceRentPopup() {
      this.showPopup = true;
    },
    closePopup() {
      this.showPopup = false;
    },
    async handlePayRentInAdvance() {
      try {
        const totalExtendedTime = this.extendedTime * this.advanceDays;
        const totalCostForDays = (parseFloat(this.totalCost) * this.advanceDays).toFixed(4);
        console.log('VALORI PENTRU INPUT: ', totalExtendedTime, totalCostForDays);

        const tx = await extendBooking(this.propertyId, totalExtendedTime, this.client1Info.address, totalCostForDays);
        console.log('VALORI PENTRU INPUT: ', totalExtendedTime, totalCostForDays);

        console.log('Transaction successful:', tx);
        alert(`Transaction successful. Rent paid for ${this.advanceDays} days in advance.`);
        await transferEther(this.client1Info.address, this.owner1Info.address, totalCostForDays);
        this.balance = await getBalance(this.client1Info.address);
        this.ownerBalance = await getBalance(this.owner1Info.address);
        this.closePopup(); // Close the popup after successful transaction
      } catch (error) {
        console.error('Transaction failed:', error);
        alert('Transaction failed');
      }
    },
    async displayResult() {
      try {
        console.log('Client address:', this.client1Info.address);
        console.log('Property ID:', this.propertyId);
        this.result = await getBookingInterval(this.client1Info.address, this.propertyId);
      } catch (error) {
        console.error('Failed to get booking interval:', error);
        alert('Failed to get booking interval');
      }
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

.balance-list, .contract-list, .info-list, .nft-list, .token-list {
  list-style: none;
  padding: 0;
  margin-bottom: 20px;
}

.balance-item, .contract-item, .info-item, .nft-item, .token-item {
  padding: 15px;
  border-bottom: 1px solid #e2e2e2;
  font-size: 1.2rem;
  color: #4a4e69;
}

.balance-item span, .info-value, .nft-value, .token-value {
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

.action-button:focus {
  outline: none;
}

/* Popup Styles */
.popup-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

.popup {
  background: #fff;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.popup h3 {
  margin-bottom: 15px;
}

.popup input {
  padding: 10px;
  font-size: 1rem;
  margin-bottom: 15px;
  width: 100%;
  box-sizing: border-box;
}

.popup .action-button {
  margin: 5px;
}

/* Result Styles */
.result-container {
  margin-top: 20px;
  padding: 15px;
  background-color: #e2e2e2;
  border-radius: 8px;
  text-align: center;
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