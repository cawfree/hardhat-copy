import {ethers} from "hardhat";
import {Signer} from "ethers";

import {copyContractConstructor, copyContractFrom, decodeInvocation} from "../providers";
import {compile} from "../solidity";
import {CopiedContractFactory} from "../@types";

export class CopyContractFactory {

  /* member */
  private etherscanKey: string;
  private network: 'mainnet';

  constructor({
    etherscanKey,
    network,
  }: {
    readonly etherscanKey: string;
    readonly network: 'mainnet';
  }) {
    this.etherscanKey = etherscanKey;
    this.network = network;
  }

  public async copy({contractAddress, signer, ignoreCache = false}: {
    readonly contractAddress: string;
    readonly signer?: Signer;
    readonly ignoreCache?: boolean;
  }): Promise<readonly CopiedContractFactory[]> {
    const copyContract = await copyContractFrom({
      contractAddress,
      etherscanKey: this.etherscanKey,
      network: this.network,
      ignoreCache,
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

    const {compilerOutputs} = compile({
      copyContract,
      ignoreCache,
    });

    return compilerOutputs.map(({
      ContractName: name,
      ConstructorArguments: data,
      compilerOutput,
    }): CopiedContractFactory => {
      const ContractFactory = ethers.ContractFactory.fromSolidity(compilerOutput, signer);

      const getConstructorParams = () => decodeInvocation({
        data,
        fragment: copyContractConstructor({ copyContract }),
      });

      const getContractName = () => name;

      return Object.assign(ContractFactory, {getConstructorParams, getContractName});
    });
  }
}