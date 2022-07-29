import {fetchCopyContractSource, parseCopyContractSource} from "../etherscan";
import {cloneHardhatProjectWithParsedCopyContractSource} from "../hardhat";

export const copyProject = async ({
  hardhatProjectTemplatePath,
  targetPath,
  etherscanKey,
  contractAddress,
}: {
  readonly hardhatProjectTemplatePath: string;
  readonly targetPath: string;
  readonly etherscanKey: string;
  readonly contractAddress: string;
}) => {
  const copyContractSources = await fetchCopyContractSource({
    etherscanKey,
    contractAddress,
  });
  const [copyContractSource] = copyContractSources!;
  cloneHardhatProjectWithParsedCopyContractSource({
    hardhatProjectTemplatePath,
    targetPath,
    parsedCopyContractSource: parseCopyContractSource({
      copyContractSource,
      contractAddress,
    }),
  });
};