<img src="https://img.shields.io/badge/Solidity-e6e6e6?style=for-the-badge&logo=solidity&logoColor=black">

### Available tasks


ERC20:

```shell
npx hardhat balance --account [ACCOUNT]
npx hardhat allowance --account1 [ACCOUNT1] --account2 [ACCOUNT2]
npx hardhat mint --account [ACCOUNT] --amount [AMOUNT]
npx hardhat transfer --account [ACCOUNT] --amount [AMOUNT]
npx hardhat transferFrom --recipient [RECIPIENT] --sender [SENDER] --amount [AMOUNT]
npx hardhat increaseAllowance --account [ACCOUNT] --amount [AMOUNT]
```

ERC721:

```shell
npx hardhat mintnft --account [ACCOUNT] --tokenid [TOKEN ID] --uri [TOKEN URI]
npx hardhat nftbalance --account [ACCOUNT]
npx hardhat nfturi --tokenid [TOKEN ID]
npx hardhat transfernft --from [ACCOUNT] --to [ACCOUNT] --tokenid [TOKEN ID]
npx hardhat burnnft --tokenid [TOKEN ID]
```

Staking:

```shell
npx hardhat stake --account [ACCOUNT] --amount [AMOUNT]
npx hardhat unstake --account [ACCOUNT] --amount [AMOUNT]
npx hardhat claim --account [ACCOUNT]
npx hardhat transfer-lp-token --account [ACCOUNT]
npx hardhat check-staking-balance --account [ACCOUNT]
```

Marketplace:
```shell
npx hardhat create-item --uri [TOKEN URI]
```
