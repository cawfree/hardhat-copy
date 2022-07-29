import path from "path";
import fs from "fs-extra";

import {ParsedCopyContractSource} from "../@types";
import {createHardhatConfig} from "./createHardhatConfig";
import {compileHardhatProject} from "./compileHardhatProject";
import {createTestForClonedHardhatProject} from "./createTestForClonedHardhatProject";
import child_process from "child_process";

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

  const {
    dangerousCompilerVersion,
    optimizer,
    runs,
  } = parsedCopyContractSource;

  // Ensure the appropriate compiler version.
  createHardhatConfig({
    projectDir: targetPath,
    compilerVersion: dangerousCompilerVersion,
    optimizer,
    runs,
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

  createTestForClonedHardhatProject({
    parsedCopyContractSource,
    targetPath,
  });

  compileHardhatProject({hardhatProjectDir: targetPath});

  child_process.execSync(
    'npx hardhat test',
    {stdio: 'inherit', cwd: targetPath},
  );
}