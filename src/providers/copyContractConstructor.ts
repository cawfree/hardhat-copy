import { JsonFragment } from "@ethersproject/abi/src.ts/fragments";

import { CopyContract } from "../@types";

export const copyContractConstructor = ({ copyContract }: {
  readonly copyContract: CopyContract;
}) => {
  const {abi} = copyContract;

  if (!abi)
    throw new Error(`Expected ContractInterface abi, encountered "${String(abi)}".`);

  // @ts-ignore
  const maybeConstructor = abi.find((e) => 'type' in e && e.type === 'constructor');

  if (!maybeConstructor)
    throw new Error("Unable to find constructor.");

  return maybeConstructor as JsonFragment;
};