<template>
  <div>
    <h1>Web3 Account Info</h1>
    <ul>
      <li v-for="account in accounts" :key="account">
        Account: {{ account }}
      </li>
      <li v-if="balance">
        Balance of first account: {{ balance }} ETH
      </li>
    </ul>
    <h2>Contract Addresses</h2>
    <ul>
      <li>Owner Contract: {{ contractAddresses.owner }}</li>
      <li>Client Contract: {{ contractAddresses.client }}</li>
      <li>NFT Contract: {{ contractAddresses.nft }}</li>
      <li>PropertyRental Contract: {{ contractAddresses.propertyRental }}</li>
    </ul>
    <h2>Owner1 Info</h2>
    <ul>
      <li>Address: {{ owner1Info.address }}</li>
      <li>Balance: {{ owner1Info.balance }} ETH</li>
    </ul>
    <h2>Client1 Info</h2>
    <ul>
      <li>Address: {{ client1Info.address }}</li>
      <li>Balance: {{ client1Info.balance }} ETH</li>
    </ul>
  </div>
</template>

<script>
import { getContractAddresses, getOwner1Info, getClient1Info } from "../../scripts/web3";

export default {
  data() {
    return {
      accounts: [],
      balance: null,
      contractAddresses: {},
      owner1Info: {},
      client1Info: {}
    };
  },
  async mounted() {
    this.contractAddresses = getContractAddresses();
    this.owner1Info = await getOwner1Info();
    this.client1Info = await getClient1Info();
  },
};
</script>

<style>
body {
  font-family: Arial, sans-serif;
}
</style>