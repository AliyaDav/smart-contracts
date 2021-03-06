<img src="https://img.shields.io/badge/Solidity-e6e6e6?style=for-the-badge&logo=solidity&logoColor=black">

# Smart-contracts with cryptocurrencies

This reposetory consists of a set of smart-contract implementation.

PART 1
Deployments:
 - [ERC20 (Ropsten)](https://ropsten.etherscan.io/tx/0x545b77e941bec4cbe3cbb7a40dc66c578e214d6c1ab244d6b64f437d243f455a)
 - [Staking (Ropsten)](https://ropsten.etherscan.io/address/0x6960B5d1C46332CD9DA88cA061c06da43D1FC662)
 - [ERC721 (Rinkeby)](https://rinkeby.etherscan.io/address/0x24C3215036DB918C7120411880809633eBCb306b)
 - [Marketplace (Rinkeby)](https://rinkeby.etherscan.io/address/0xB427495253cF0dF44C66431475f6ED3a5BB61FfD)
 - [ERC20 (Rinkeby)](https://rinkeby.etherscan.io/address/0x5ccc29ba253a1affa9d03f93558fa52277555615)

PART 2
Deployments:
- [ERC20Base (Rinkeby)](https://rinkeby.etherscan.io/token/0x647b6dd0d93cb6213eaa7b91ee6aba46968d95a6?a=0x51d2f9f3379fe7d9ff120c9d34e2a696e838a330)
- [ERC20Base (BscTestnet)](https://testnet.bscscan.com/token/0x916dcd5aede27bf6c68b421c66d39e60cb2735b2?a=0xafb7cde620f31aa72205a74466d35d6bd9264281)
- [Bridge (Rinkeby)](https://rinkeby.etherscan.io/address/0xbe56c7cc235e25c9873e55df8fc1a2434d74ef2b)
- [Bridge (BscTestnet)](https://testnet.bscscan.com/address/0x0bd592b52998eed1c5df0cc2b20a33e87f7655e3)
- [DAO (Rinkeby)](https://rinkeby.etherscan.io/address/0xb9f95a653cfc2498114d56849844d2be8b525085)

Available general tasks:

```shell
npx hardhat compile
npx hardhat clean
npx hardhat test
npx hardhat node
npx hardhat help
REPORT_GAS=true npx hardhat test
npx hardhat coverage
npx hardhat run scripts/deploy.ts
```

## Deployment and verification

In this project, copy the .env.example file to a file named .env, and then edit it to fill in the details. Enter your Etherscan API key, your Ropsten/Rinkeby node URL (eg from Alchemy), and the private key of the account which will send the deployment transaction (or a mnemonic).

```shell
hardhat run --network [network] scripts/sample-script.ts
```

Then, copy the deployment address and paste it in to replace `DEPLOYED_CONTRACT_ADDRESS` in this command:

```shell
npx hardhat verify --network ropsten DEPLOYED_CONTRACT_ADDRESS "Additional arguments"
```

## Performance optimizations

For faster runs of your tests and scripts, consider skipping ts-node's type checking by setting the environment variable `TS_NODE_TRANSPILE_ONLY` to `1` in hardhat's environment. For more details see [the documentation](https://hardhat.org/guides/typescript.html#performance-optimizations).
