require('@nomiclabs/hardhat-ethers');

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  networks: {
    hardhat: {
      chainId: 1337,
      gas: "auto",
      mining: {
        interval: 2000 //ms
      },
      // ,
      // loggingEnabled : false
    },
    sepolia: {
      url: "https://sepolia.infura.io/v3/10543e7619ae4699bf9ba56963aa919e", 
      
      accounts: ["df509fdee23083e3e6a410ead1891e19a36b9953bec3e932b3436d7cf4537c13"], 
    },
  },
  defaultNetwork: "hardhat",
  solidity: {
    compilers: [
      {
        version: '0.8.24',
        settings: {
          optimizer: {
            enabled: true,
            runs: 10000
          }
        }
      }
    ]
  }
};
