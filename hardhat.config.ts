import * as dotenv from "dotenv";

import { HardhatUserConfig, task } from "hardhat/config";
import "@nomiclabs/hardhat-etherscan";
import "@nomiclabs/hardhat-waffle";
import "@typechain/hardhat";
import "hardhat-gas-reporter";
import "solidity-coverage";
import "./tasks/ERC20-tasks";

dotenv.config();

const ROPSTEN_PRIVATE_KEY = process.env.ROPSTEN_PRIVATE_KEY;
const ALCHEMY_PROJECT_ID = process.env.ALCHEMY_PROJECT_ID;
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;

const config: HardhatUserConfig = {
  solidity: "0.8.4",
  networks: {
    ropsten: {
      url: `https://eth-ropsten.alchemyapi.io/v2/${ALCHEMY_PROJECT_ID}`,
      accounts: [`${ROPSTEN_PRIVATE_KEY}`],
    },
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD",
  },
  etherscan: {
    apiKey: ETHERSCAN_API_KEY,
  },
};

export default config;

