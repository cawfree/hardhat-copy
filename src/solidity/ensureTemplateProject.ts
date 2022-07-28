import os from "os";
import path from "path";
import fs from "fs-extra";

import {persistentIdentifier} from "../providers/persistentIdentifier";
import {createHardhatProject} from "./createHardhatProject";

export const ensureTemplateProject = ({ignoreCache = false}: {
  readonly ignoreCache?: boolean;
}) => {
  const templateDir = path.resolve(
    os.tmpdir(),
    persistentIdentifier({
      contractAddress: '0x000000000000000000000000000000000000dead',
      network: 'mainnet',
      context: '::ensureTemplateProject::',
    }),
  );

  if (ignoreCache && fs.existsSync(templateDir))
    fs.rmSync(templateDir, {recursive: true});

  if (fs.existsSync(templateDir))
    return {templateDir};

  console.log(`[hardhat-copy]: Performing first time setup! Please be patient. Future runs will be much faster :)`);

  createHardhatProject({hardhatProjectPath: templateDir});

  return {templateDir};
};
