import { JsonFragment } from "@ethersproject/abi/src.ts/fragments";
import { ethers } from "ethers";
import { stripFragmentInputTypes } from "./stripFragmentInputTypes";

export const decodeInvocation = ({
  data,
  fragment,
}: {
  readonly data: string;
  readonly fragment: JsonFragment;
}) => {
  const fragmentInputTypes = stripFragmentInputTypes({ fragment });
  return ethers.utils.defaultAbiCoder.decode(fragmentInputTypes, `0x${data}`);
};