import { ContractInterface } from "ethers";

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
  readonly abi: ContractInterface | null;
  readonly bytecode: string;
  readonly copyContractSources: readonly CopyContractSource[];
};

export type CompiledCopyContract = {
  readonly name: string;
  readonly compilerOutput: object;
  readonly data: string;
};