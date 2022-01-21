require("@nomiclabs/hardhat-web3");


task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
    const accounts = await hre.ethers.getSigners();

    for (const account of accounts) {
        console.log(account.address);
    }
});


task("transfer", "Transfers tokens to a given account")
    .addParam("account", "The recipient's address")
    .addParam("value", "The amount to trasfer")
    .setAction(async (taskArgs) => {

        const account = taskArgs.account;
        // const amount = taskArgs.value;
        const contract = await hre.ethers.getContractAt("ERC20", '0x222e82Ef3B2Cfc5aE9083Ee90012b40d13fA7CC4');
        const amount = hre.ethers.utils.parseUnits(taskArgs.value, await contract.decimals());

        const signer = await hre.ethers.getSigners();
        // console.log(signer);

        let result = await contract.connect(signer[0]).transfer(account, amount);
        console.log(result);

    });

task("mint", "Transfers tokens to a given account")
    .addParam("account", "The recipient's address")
    .addParam("value", "The amount to trasfer")
    .setAction(async (taskArgs) => {

        const account = taskArgs.account;
        // const amount = taskArgs.value;
        const contract = await hre.ethers.getContractAt("ERC20", '0x222e82Ef3B2Cfc5aE9083Ee90012b40d13fA7CC4');
        const amount = hre.ethers.utils.parseUnits(taskArgs.value, await contract.decimals());

        const signer = await hre.ethers.getSigners();
        // console.log(signer);

        // let result = await contract.connect(signer[0])._mint(account, amount);
        let result = await contract._mint(account, amount);
        console.log(result);

    });

task("transferFrom", "Transfers tokens from a given address to another given account")
    .addParam("recipient", "The recipient's address")
    .addParam("sender", "The sender's address")
    .addParam("value", "The amount to trasfer")
    .setAction(async (taskArgs) => {

        const recipient = web3.utils.toChecksumAddress(taskArgs.recipient);
        const amount = taskArgs.amount;
        const contract = hre.ethers.getContractAt("ERC20", '0x222e82Ef3B2Cfc5aE9083Ee90012b40d13fA7CC4');
        const signer = '0x51d2f9f3379Fe7D9fF120c9d34E2a696e838A330'

        let result = await contract.methods.transferFrom(sender, recipient, amount).send({ from: signer });
        console.log(result);

    });

task("increaseAllowance", "Increase allowance for an address")
    .addParam("account", "The address of account for which to increase allowance")
    .addParam("value", "The amount by which to increase allowance")
    .setAction(async (taskArgs) => {

        const amount = taskArgs.value;
        const contract = hre.ethers.getContractAt("ERC20", '0x222e82Ef3B2Cfc5aE9083Ee90012b40d13fA7CC4');
        const signer = '0x51d2f9f3379Fe7D9fF120c9d34E2a696e838A330'

        let result = await contract.methods.increaseAllowance(recipient, amount).send({ from: signer });

        console.log(result);
    });

