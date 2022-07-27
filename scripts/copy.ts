import { ethers } from "hardhat";

import {
  compile, CompiledCopyContract,
  copyContractConstructor,
  copyContractFrom,
  decodeInvocation,
} from "../src";

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

  const copyContract = await copyContractFrom({
    contractAddress,
    etherscanKey,
    infuraKey,
    network: 'mainnet',
  });

  const {copyContractSources, abi} = copyContract;

  if (!abi)
    throw new Error(`Expected abi, encountered "${
      String(abi)
    }".`);

  if (!copyContractSources)
    throw new Error(`Expected copyContractSource, encountered "${
      String(copyContractSources)
    }".`);


  if (copyContractSources.length !== 1)
    throw new Error(`Expected single copyContractSource, encountered ${
      copyContractSources.length
    }.`);

  const {compilerOutputs} = compile({copyContract});

  const [wallet] = await ethers.getSigners();

  for (const {compilerOutput, data} of compilerOutputs) {
    const Contract = ethers.ContractFactory.fromSolidity(compilerOutput, wallet);
    const deployTransaction = Contract.getDeployTransaction(
      ...decodeInvocation({
        data,
        fragment: copyContractConstructor({ copyContract }),
      }),
    );

    const gasLimit = await wallet.estimateGas(deployTransaction);

    const tx = await wallet.sendTransaction({
      ...deployTransaction,
      gasLimit,
    });

    await tx.wait();
  }

  console.log('Done!');
})();
