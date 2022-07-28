import os from "os";
import path from "path";
import child_process from "child_process";
import fs from "fs-extra";

import {CompiledCopyContract, CopyContract, CopyContractSource} from "../@types";
import {persistentIdentifier} from "../providers";
import {artifacts} from "hardhat";

import {ensureTemplateProject} from "./ensureTemplateProject";

const ensureContractsDir = ({templateDir}: {
  readonly templateDir: string;
}) => {
  const contractsDir = path.resolve(templateDir, 'contracts');

  fs.existsSync(contractsDir) && fs.rmSync(contractsDir, {recursive: true});

  fs.mkdirSync(contractsDir);

  return {contractsDir};
};

export function compile({copyContract, ignoreCache}: {
  readonly copyContract: CopyContract;
  readonly ignoreCache: boolean;
}) {

  const compilerOutputs: CompiledCopyContract[] = [];

  const {templateDir} = ensureTemplateProject({
    ignoreCache,
  });

  const artifactsDir = path.resolve(templateDir, 'artifacts');
  const cacheDir = path.resolve(templateDir, 'cache');

  const {contractsDir} = ensureContractsDir({
    templateDir,
  });

  const {copyContractSources} = copyContract;

  // TODO: Ensure appropriate version for all contracts.
  const [{CompilerVersion: compilerVersion}] = copyContractSources

  fs.writeFileSync(
    path.resolve(templateDir, 'hardhat.config.ts'),
    `
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  solidity: "${
    compilerVersion
      .substring(0, compilerVersion.indexOf('+'))
      .replace('v', '')
  }",
};

export default config;
  `.trim(),
  );

  copyContractSources.forEach(
    ({ContractName, SourceCode}: CopyContractSource) =>
      fs.writeFileSync(path.resolve(contractsDir, `${ContractName}.sol`), SourceCode)
  );

  try {
    const artifactsCacheDir = path.resolve(
      os.tmpdir(),
      persistentIdentifier({
        ...copyContract,
        context: 'artifactsCacheDir',
      }),
    );

    ignoreCache && fs.rmSync(artifactsCacheDir, {recursive: true});

    if (!fs.existsSync(artifactsCacheDir)) {
      child_process.execSync(
        'npx hardhat compile',
        {stdio: 'inherit', cwd: templateDir}
      );

      // After compiling, cache these results in an attempt to can skip the next iteration if possible.
      fs.mkdirSync(artifactsCacheDir);
      fs.copySync(artifactsDir, artifactsCacheDir, {recursive: true});
    }

    copyContractSources.forEach(
      ({ContractName, ConstructorArguments, ...extras}: CopyContractSource) => compilerOutputs.push({
        ...extras,
        ContractName,
        ConstructorArguments,
        compilerOutput: JSON.parse(
          fs.readFileSync(
            path.resolve(artifactsCacheDir, 'contracts', `${ContractName}.sol`, `${ContractName}.json`),
            'utf-8',
          ),
        ),
      }),
    );
  } catch (e) {
    console.error(e);
  } finally {
    fs.existsSync(contractsDir) && fs.rmSync(contractsDir, {recursive: true});
    fs.existsSync(artifactsDir) && fs.rmSync(artifactsDir, {recursive: true});
    fs.existsSync(cacheDir) && fs.rmSync(cacheDir, {recursive: true});
  }

  return {compilerOutputs};
}