import {ContractInterface} from "ethers";
import {CopyContractSource, ParsedCopyContractSource} from "../@types";
import { decodeInvocation } from "../ethers";
import {parseSourceCode} from "./parseSourceCode";

export const parseCopyContractSource = ({copyContractSource, contractAddress}: {
  readonly copyContractSource: CopyContractSource;
  readonly contractAddress: string;
}): ParsedCopyContractSource => {
  const {
    ABI,
    ConstructorArguments: data,
    CompilerVersion: dangerousCompilerVersion,
    ContractName: contractName,
    OptimizationUsed,
    Runs,
  } = copyContractSource;

  if (typeof ABI !== 'string' || !ABI.length)
    throw new Error(`Expected non-empty string ABI, encountered "${String(ABI)}".`);

  if (typeof dangerousCompilerVersion !== 'string' || !dangerousCompilerVersion.length)
    throw new Error(`Expected non-empty string dangerousCompilerVersion, encountered "${
      String(dangerousCompilerVersion)
    }".`);

  const abi = JSON.parse(ABI) as ContractInterface;

  // @ts-ignore
  const maybeConstructor = abi.find((e) => 'type' in e && e.type === 'constructor');

  if (!maybeConstructor)
    throw new Error(`Unable to find constructor in abi!`);

  const deploymentParams = decodeInvocation({
    data,
    fragment: maybeConstructor,
  });

  const optimizer = OptimizationUsed === '1';
  const runs = optimizer ? parseInt(Runs) : 0;

  return {
    abi,
    contractAddress,
    contractName,
    deploymentParams,
    sourceFiles: parseSourceCode({copyContractSource}),
    dangerousCompilerVersion,
    optimizer,
    runs,
  };
};