# `hardhat-copy`

`hardhat-copy` helps you import an [__Ethereum__](https://ethereum.org/en/) mainnet smart contract onto your local [__Hardhat__](https://hardhat.org/) node. This helps you to rapidly experiment with real production smart contracts from the safety of your local environment and test benches; no moon-math level indexing setup necessary.

## 🚀 getting started

You can download the [__Node.js__](https://nodejs.org/en/) library from [__npm__](https://www.npmjs.com/):

```shell
npm i hardhat-copy
```

Then you can import the `CopyContractFactory` into scripts you usually invoke using the [__HRE__](https://hardhat.org/hardhat-runner/docs/advanced/hardhat-runtime-environment). Below, we show how to automatically pull down the [__Rumble Kong League__](https://www.rumblekongleague.com/) [__smart contract__](https://etherscan.io/token/0xef0182dc0574cd5874494a120750fd222fdb909a#code).

```typescript
// Allocate a CopyContractFactory; this manages the process of downloading smart contracts by
// their address and repackaging these as ethers Contracts.
const copyContractFactory = new CopyContractFactory({
  etherscanKey: 'XXXXXXXXXXXXXXXXXX',
  network: 'mainnet',
});

// Semantically, multiple factories can be returned here, but for most cases you'll received the main contract.
const [contractFactory] = await copyContractFactory.copy({
  contractAddress: '0xef0182dc0574cd5874494a120750fd222fdb909a',
  ignoreCache: false /* by default, artifacts are cached to greatly increase performance */,
});

const contractName = contractFactory.getContractName(); // "RumbleKongLeague"

// You can fetch the parameters originally used to launch the ERC721:
const constructorParams = contractFactory.getConstructorParams();

// Contracts returned by the CopyContractFactory continue to work as expected:
const [wallet] = await ethers.getSigners();

const gasLimit = await wallet.estimateGas(
  contractFactory.getDeployTransaction(...constructorParams)
);

const contract = await contractFactory
  .connect(wallet)
  .deploy(...constructorParams, {gasLimit});
```

### 🤔 why do we need an etherscan key tho

[__Etherscan__](https://etherscan.io/apis) is used to download verified contract source code, which is in turn compiled on your local machine. This is because Etherscan is currently the mainstream way to share contract ABIs, which by aren't published on-chain.

# License
[__MIT__](./LICENSE)
