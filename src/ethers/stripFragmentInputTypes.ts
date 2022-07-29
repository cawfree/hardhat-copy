import {JsonFragment} from "@ethersproject/abi/src.ts/fragments";

export const stripFragmentInputTypes = ({fragment}: {
  readonly fragment: JsonFragment;
}) => {
  const {inputs} = fragment;
  if (!Array.isArray(inputs)) return [];
  return inputs.map(({type}) => type);
};