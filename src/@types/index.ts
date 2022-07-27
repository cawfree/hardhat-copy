import {ContractFactory, ContractInterface} from "ethers";
import {decodeInvocation} from "../providers";

export type CopyContractSource = {
  readonly ContractName: string;
  readonly CompilerVersion: string;
  readonly OptimizationUsed: string;
  readonly Runs: string;
  readonly ConstructorArguments: string;
  readonly EVMVersion: string;
  readonly Library: string;
  readonly LicenseType: string;
  readonly Proxy: string;
  readonly Implementation: string;
  readonly SwarmSource: string;
  readonly SourceCode: string;
  readonly ABI: string;
};

export type CopyContract = {
  readonly contractAddress: string;
  readonly network: 'mainnet';
  readonly abi: ContractInterface | null;
  readonly copyContractSources: readonly CopyContractSource[];
};

export type CompiledCopyContract = CopyContractSource & {
  readonly compilerOutput: object;
};

export type CopiedContractFactory = ContractFactory & {
  readonly getConstructorParams: () => ReturnType<typeof decodeInvocation>;
  readonly getContractName: () => string;
};
