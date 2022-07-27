import { ethers } from "hardhat";

import { CopyContractFactory } from "../src";

void (async () => {

  const {
    CONTRACT_ADDRESS: contractAddress,
    ETHERSCAN_KEY: etherscanKey,
    INFURA_KEY: infuraKey,
  } = process.env as Partial<{
    readonly ETHERSCAN_KEY: string;
    readonly CONTRACT_ADDRESS: string;
    readonly INFURA_KEY: string;
  }>;

  if (typeof etherscanKey !== 'string' || !etherscanKey.length)
    throw new Error(`Expected non-empty string etherscanKey, encountered "${
      etherscanKey
    }".`);

  if (typeof contractAddress !== 'string' || !contractAddress.length)
    throw new Error(`Expected non-empty string contractAddress, encountered "${
      contractAddress
    }".`);

  if (typeof infuraKey !== 'string' || !infuraKey.length)
    throw new Error(`Expected non-empty string infuraKey, encountered "${
      infuraKey
    }".`);

  const copyContractFactory = new CopyContractFactory({
    etherscanKey,
    infuraKey,
    network: 'mainnet',
  });

  const [wallet] = await ethers.getSigners();

  const contractFactories = await copyContractFactory.copy({
    contractAddress,
  });

  for (const contractFactory of contractFactories) {

    const contractName = contractFactory.getContractName();
    const constructorParams = contractFactory.getConstructorParams();

    const gasLimit = await wallet.estimateGas(
      contractFactory.getDeployTransaction(...constructorParams)
    );

    const contract = await contractFactory
      .connect(wallet)
      .deploy(...constructorParams, {gasLimit});

    console.log(`Deployed ${contractName} to: ${contract.address}!`);
  }

})();
