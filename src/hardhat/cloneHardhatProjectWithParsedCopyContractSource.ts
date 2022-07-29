import path from "path";
import fs from "fs-extra";

import {ParsedCopyContractSource} from "../@types";
import {createHardhatConfig} from "./createHardhatConfig";
import {compileHardhatProject} from "./compileHardhatProject";

export const cloneHardhatProjectWithParsedCopyContractSource = ({
  hardhatProjectTemplatePath,
  parsedCopyContractSource,
  targetPath,
}: {
  readonly hardhatProjectTemplatePath: string;
  readonly parsedCopyContractSource: ParsedCopyContractSource;
  readonly targetPath: string;
}) => {
  fs.existsSync(targetPath) && fs.rmSync(targetPath, {recursive: true});

  fs.copySync(hardhatProjectTemplatePath, targetPath, {recursive: true});

  const {dangerousCompilerVersion} = parsedCopyContractSource;

  // Ensure the appropriate compiler version.
  createHardhatConfig({
    projectDir: targetPath,
    compilerVersion: dangerousCompilerVersion,
  });

  // Copy over smart contracts.
  const contractsDir = path.resolve(targetPath, "contracts");

  const {sourceFiles} = parsedCopyContractSource;

  Object.entries(sourceFiles)
    .forEach(([relativeFilePath, sourceCode]) => {
      const targetFilePath = path.resolve(
        contractsDir,
        ...path.dirname(relativeFilePath).split(path.sep),
        path.basename(relativeFilePath),
      );
      fs.mkdirSync(path.dirname(targetFilePath), {recursive: true});
      fs.writeFileSync(targetFilePath, sourceCode);
    });

  compileHardhatProject({hardhatProjectDir: targetPath});
}