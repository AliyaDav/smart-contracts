
import { ethers } from 'ethers';
import * as dotenv from "dotenv";
import bridgeJson from "../artifacts/contracts/Bridge.sol/Bridge.json";
import { AlchemyProvider } from '@ethersproject/providers';

dotenv.config();

const ALCHEMY_PROJECT_ID = process.env.ALCHEMY_PROJECT_ID;
const OWNER_PRIVATE_KEY = process.env.OWNER_PRIVATE_KEY!;
const bridgeEthAddress = '0xBE56c7cc235E25C9873e55Df8fc1A2434d74ef2B';
const bridgeBscAddress = '0x78B5c4a7EF96b479485e035ef8D5ef73C48BafC9';

const ethProvider = new AlchemyProvider("rinkeby", ALCHEMY_PROJECT_ID);
const bscProvider = new ethers.providers.JsonRpcProvider('https://data-seed-prebsc-1-s1.binance.org:8545', { name: 'binance', chainId: 97 })

const wallet = new ethers.Wallet(OWNER_PRIVATE_KEY);

let bridgeEth = new ethers.Contract(bridgeEthAddress, bridgeJson.abi, ethProvider);
let bridgeBsc = new ethers.Contract(bridgeBscAddress, bridgeJson.abi, bscProvider);

console.log("Started listening...");

bridgeEth.on('SwapInitialized', async (from, to, amount, nonce, chainId, symbol) => {

  let signerBsc = wallet.connect(bscProvider);

  let messageHash = ethers.utils.solidityKeccak256(
    ['address', 'address', 'uint256', 'uint256', 'uint256', 'string'],
    [from, to, amount, nonce, chainId, symbol]);

  const messageArray = ethers.utils.arrayify(messageHash);
  const rawSignature = await signerBsc.signMessage(messageArray);

  console.log(`Raw signature: ${rawSignature}`);
  console.log(`
    Processed transfer:
    - from ${from} 
    - to ${to} 
    - amount ${amount} tokens
    - chainId ${chainId}
    - nonce ${nonce}
    - token ${symbol}
  `);
});

bridgeBsc.on('SwapInitialized', async (from, to, amount, nonce, chainId, symbol) => {

  let signerEth = wallet.connect(ethProvider);


  let messageHash = ethers.utils.solidityKeccak256(
    ['address', 'address', 'uint256', 'uint256', 'uint256', 'string'],
    [from, to, amount, nonce, chainId, symbol]);

  const messageArray = ethers.utils.arrayify(messageHash);
  const rawSignature = await signerEth.signMessage(messageArray);

  console.log(`Raw signature: ${rawSignature}`);
  console.log(`
    Processed transfer:
    - from ${from} 
    - to ${to} 
    - amount ${amount} tokens
    - chainId ${chainId}
    - nonce ${nonce}
    - token ${symbol}
  `);
});