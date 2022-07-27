import {ethers} from "hardhat";
import {Signer} from "ethers";

import {copyContractConstructor, copyContractFrom, decodeInvocation} from "../providers";
import {compile} from "../solidity";
import {CopiedContractFactory} from "../@types";

export class CopyContractFactory {

  /* member */
  private etherscanKey: string;
  private infuraKey: string;
  private network: 'mainnet';

  constructor({
    etherscanKey,
    infuraKey,
    network,
  }: {
    readonly etherscanKey: string;
    readonly infuraKey: string;
    readonly network: 'mainnet';
  }) {
    this.etherscanKey = etherscanKey;
    this.infuraKey = infuraKey;
    this.network = network;
  }

  public async copy({contractAddress, signer}: {
    readonly contractAddress: string;
    readonly signer?: Signer;
  }): Promise<readonly CopiedContractFactory[]> {
    const copyContract = await copyContractFrom({
      contractAddress,
      etherscanKey: this.etherscanKey,
      infuraKey: this.infuraKey,
      network: this.network,
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