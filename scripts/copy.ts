import "dotenv/config";
import {CopyContractFactory} from "../src";
import {ethers} from "hardhat";

const {
  ETHERSCAN_KEY: etherscanKey,
  CONTRACT_ADDRESS: contractAddress,
} = process.env as Partial<{
  readonly ETHERSCAN_KEY: string;
  readonly CONTRACT_ADDRESS: string;
}>;

if (typeof etherscanKey !== 'string' || !etherscanKey.length)
  throw new Error(`Expected non-empty string etherscanKey, encountered "${
   etherscanKey
  }".`);

if (typeof contractAddress !== 'string' || !contractAddress.length)
  throw new Error(`Expected non-empty string contractAddress, encountered "${
    contractAddress
  }".`);

void (async () => {
  try {
    const copyContractFactory = new CopyContractFactory({
      etherscanKey,
      network: 'mainnet',
    });

    const [wallet] = await ethers.getSigners();

    const [contractFactory] = await copyContractFactory.copy({
      contractAddress,
      ignoreCache: true,
    });

    const contractName = contractFactory.getContractName();
    const constructorParams = contractFactory.getConstructorParams();

    const gasLimit = await wallet.estimateGas(
      contractFactory.getDeployTransaction(...constructorParams)
    );

    const contract = await contractFactory
      .connect(wallet)
      .deploy(...constructorParams, {gasLimit});

    console.log(`Deployed ${
      contractName
    } to ${
      contract.address
    } on local hardhat node.`)

  } catch (e) {
    console.error(e);
  }
})();
