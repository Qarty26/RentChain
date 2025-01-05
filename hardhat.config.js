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
    // sepolia: {
    //   url: "https://sepolia.infura.io/v3/", 
      
    //   accounts: [""], 
    // },
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
