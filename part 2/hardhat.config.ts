import * as dotenv from "dotenv";
import { HardhatUserConfig } from "hardhat/config";
import "@nomiclabs/hardhat-etherscan";
import "@nomiclabs/hardhat-waffle";
import "@typechain/hardhat";
import "hardhat-gas-reporter";
import "solidity-coverage";
import "./tasks/bridge-tasks";
import "./tasks/dao-tasks";

dotenv.config();

const ALCHEMY_PROJECT_ID = process.env.ALCHEMY_PROJECT_ID;
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;
const BINANCE_API_KEY = process.env.BINANCE_API_KEY;
const MNEMONIC = process.env.MNEMONIC;

const config: HardhatUserConfig = {
  solidity: "0.8.4",
  networks: {
    ropsten: {
      url: `https://eth-ropsten.alchemyapi.io/v2/${ALCHEMY_PROJECT_ID}`,
      accounts: { mnemonic: MNEMONIC }
    },
    rinkeby: {
      url: `https://eth-rinkeby.alchemyapi.io/v2/${ALCHEMY_PROJECT_ID}`,
      accounts: { mnemonic: MNEMONIC }
    },
    bscTestnet: {
      url: "https://data-seed-prebsc-1-s1.binance.org:8545",
      chainId: 97,
      accounts: { mnemonic: MNEMONIC }
    },
  },
  etherscan: {
    apiKey: {
      rinkeby: ETHERSCAN_API_KEY,
      bscTestnet: BINANCE_API_KEY,
    }
  },
  // mocha: {
  //   timeout: 20000
  // }
};

export default config;

