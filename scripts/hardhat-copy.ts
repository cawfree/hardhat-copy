import "dotenv/config";

import os from "os";
import path from "path";
import fs from "fs-extra";

import {ethers} from "ethers";

import {AUSTIN_GRIFFITHS_ETHERSCAN_KEY, copyProject, createHardhatProject, keccakString} from "../src";

const {
  ETHERSCAN_KEY: maybeEtherscanKey,
  CONTRACT_ADDRESS: maybeContractAddress,
} = process.env as Partial<{
  readonly ETHERSCAN_KEY: string;
  readonly CONTRACT_ADDRESS: string;
}>;

void (async () => {
  try {
    const etherscanKey = typeof maybeEtherscanKey === 'string' && maybeEtherscanKey.length
      ? maybeEtherscanKey
      : AUSTIN_GRIFFITHS_ETHERSCAN_KEY;

    const contractAddress = !!maybeContractAddress && ethers.utils.getAddress(maybeContractAddress);

    if (!contractAddress)
      throw new Error(`Expected valid string CONTRACT_ADDRESS, encountered "${
        maybeContractAddress
      }".`);

    const hardhatProjectTemplatePath = path.resolve(
      os.tmpdir(),
      "__HardhatCopyTemplateProject__",
    );

    // Cache where possible.
    if (!fs.existsSync(hardhatProjectTemplatePath)) {
      createHardhatProject({
        hardhatProjectPath: hardhatProjectTemplatePath,
      });
    }

    const targetPath = path.resolve(`HardhatCopy__contractAddress`);

    if (fs.existsSync(targetPath)) {
      fs.rmSync(targetPath, {recursive: true});
    }

    await copyProject({
      hardhatProjectTemplatePath,
      targetPath,
      etherscanKey,
      contractAddress,
    });

    console.log('Done!');

  } catch (e) {
    console.error(e);
  }
})();
