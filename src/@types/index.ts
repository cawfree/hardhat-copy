import { ContractInterface } from "ethers";
import { decodeInvocation } from "../ethers";

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

export type SourceFiles = {
  readonly [relativeFilePath: string]: string;
};

export type ParsedCopyContractSource = {
  readonly optimizer: boolean;
  readonly runs: number;
  readonly contractAddress: string;
  readonly contractName: string;
  readonly dangerousCompilerVersion: string;
  readonly abi: ContractInterface;
  readonly sourceFiles: SourceFiles;
  readonly deploymentParams: ReturnType<typeof decodeInvocation>;
};
