import {ContractInterface} from "ethers";
import {CopyContractSource, ParsedCopyContractSource} from "../@types";
import { decodeInvocation } from "../ethers";
import {parseSourceCode} from "./parseSourceCode";

export const parseCopyContractSource = ({copyContractSource}: {
  readonly copyContractSource: CopyContractSource;
}): ParsedCopyContractSource => {
  const {
    ABI,
    ConstructorArguments: data,
  } = copyContractSource;

  if (typeof ABI !== 'string' || !ABI.length)
    throw new Error(`Expected non-empty string ABI, encountered "${String(ABI)}".`);

  const abi = JSON.parse(ABI) as ContractInterface;

  // @ts-ignore
  const maybeConstructor = abi.find((e) => 'type' in e && e.type === 'constructor');

  if (!maybeConstructor)
    throw new Error(`Unable to find constructor in abi!`);

  const deploymentParams = decodeInvocation({
    data,
    fragment: maybeConstructor,
  })

  return {
    abi,
    deploymentParams,
    sourceFiles: parseSourceCode({copyContractSource}),
  };
};