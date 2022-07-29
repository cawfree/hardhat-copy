import {CopyContractSource, SourceFiles} from "../@types";

export const parseSourceCode = ({copyContractSource}: {
  readonly copyContractSource: CopyContractSource;
}): SourceFiles => {
  const {SourceCode, ContractName} = copyContractSource;

  if (!SourceCode.startsWith("{")) {
    return {[`${ContractName}.sol`]: SourceCode};
  }

  const {sources} = JSON.parse(SourceCode.substring(1, SourceCode.length - 1));

  return Object.entries(sources).reduce<SourceFiles>(
    // @ts-ignore
    (e, [relativeFilePath, {content}]) => ({
      ...e,
      [relativeFilePath]: content,
    }),
    {},
  );
};