<img src="https://img.shields.io/badge/Solidity-e6e6e6?style=for-the-badge&logo=solidity&logoColor=black">

## ERC20 implementation

The contract is an implementation of ERC20 token. 

Deployed to [Ropsten](https://ropsten.etherscan.io/tx/0x545b77e941bec4cbe3cbb7a40dc66c578e214d6c1ab244d6b64f437d243f455a)

Available tasks:

```shell
npx hardhat accounts
npx hardhat compile
npx hardhat clean
npx hardhat test
npx hardhat node
npx hardhat help
REPORT_GAS=true npx hardhat test
npx hardhat coverage
npx hardhat run scripts/deploy.ts

npx hardhat balance --account [ACCOUNT]
npx hardhat allowance --account1 [ACCOUNT1] --account2 [ACCOUNT2]
npx hardhat mint --account [ACCOUNT] --amount [AMOUNT]
npx hardhat transfer --account [ACCOUNT] --amount [AMOUNT]
npx hardhat transferFrom --recipient [RECIPIENT] --sender [SENDER] --amount [AMOUNT]
npx hardhat increaseAllowance --account [ACCOUNT] --amount [AMOUNT]

TS_NODE_FILES=true npx ts-node scripts/deploy.ts
npx eslint '**/*.{js,ts}'
npx eslint '**/*.{js,ts}' --fix
npx prettier '**/*.{json,sol,md}' --check
npx prettier '**/*.{json,sol,md}' --write
npx solhint 'contracts/**/*.sol'
npx solhint 'contracts/**/*.sol' --fix
```

# Etherscan verification

To try out Etherscan verification, you first need to deploy a contract to an Ethereum network that's supported by Etherscan, such as Ropsten.

In this project, copy the .env.example file to a file named .env, and then edit it to fill in the details. Enter your Etherscan API key, your Ropsten node URL (eg from Alchemy), and the private key of the account which will send the deployment transaction. With a valid .env file in place, first deploy your contract:

```shell
hardhat run --network ropsten scripts/sample-script.ts
```

Then, copy the deployment address and paste it in to replace `DEPLOYED_CONTRACT_ADDRESS` in this command:

```shell
npx hardhat verify --network ropsten DEPLOYED_CONTRACT_ADDRESS "Hello, Hardhat!"
```

# Performance optimizations

For faster runs of your tests and scripts, consider skipping ts-node's type checking by setting the environment variable `TS_NODE_TRANSPILE_ONLY` to `1` in hardhat's environment. For more details see [the documentation](https://hardhat.org/guides/typescript.html#performance-optimizations).
