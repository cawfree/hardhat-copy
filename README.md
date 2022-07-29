# `hardhat-copy`

`hardhat-copy` helps you import an [__Ethereum__](https://ethereum.org/en/) mainnet smart contract onto your local [__Hardhat__](https://hardhat.org/) node, enabling you to rapidly experiment with production smart contracts from the safety of your local environment.

## 🚀 getting started

Make sure you have downloaded the [__Node.js__](https://nodejs.org/en/) library from [__npm__](https://www.npmjs.com/) and have also installed [__Hardhat__](https://hardhat.org/). Then just use `npx hardhat-copy` to generate a project which clones and deploys your desired mainnet smart contract onto your local branch:

```shell
# Try it!
CONTRACT_ADDRESS=0xef0182dc0574cd5874494a120750fd222fdb909a npx hardhat-copy
```

This will create a hardhat project in your working directory, i.e.:

```shell
HardhatCopy_0xef0182dc0574cd5874494a120750fd222fdb909a/
```

If you `cd` into this project, you can execute the included [__Mocha__](https://mochajs.org/) unit tests using the [__HRE__](https://hardhat.org/hardhat-runner/docs/advanced/hardhat-runtime-environment):

```shell
npx hardhat test
```

By default, this simply deploys the specified smart contract onto your local environment; the included unit tests can then be extended for your own experimentation!

## ✌️ license
[__MIT__](./LICENSE)
