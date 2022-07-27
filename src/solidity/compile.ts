import os from "os";
import path from "path";
import child_process from "child_process";
import fs from "fs-extra";

import {CompiledCopyContract, CopyContract, CopyContractSource} from "../@types";
import {copyContractPersistentIdentifier} from "../providers";
import {artifacts} from "hardhat";

const ensureTemplateDir = ({templatePath}: {
  readonly templatePath: string;
}) => {
  if (fs.existsSync(templatePath)) return;

  fs.mkdirSync(templatePath);

  child_process.execSync(
    'npm i @nomicfoundation/hardhat-toolbox@^1.0.2 hardhat@^2.0.1',
    {stdio: 'inherit', cwd: templatePath},
  );

  fs.writeFileSync(
      path.resolve(templatePath, 'tsconfig.json'),
      `
{
  "compilerOptions": {
    "target": "es2020",
    "module": "commonjs",
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "skipLibCheck": true
  }
}
    `.trim(),

  );
};

const ensureContractsDir = ({templatePath}: {
  readonly templatePath: string;
}) => {
  const contractsDir = path.resolve(templatePath, 'contracts');

  fs.existsSync(contractsDir) && fs.rmSync(contractsDir, {recursive: true});

  fs.mkdirSync(contractsDir);

  return {contractsDir};
};

const accumulateCompilerOutputs = ({artifactsDir}: {
  readonly artifactsDir: string;
}) => {

};

export function compile({copyContract, ignoreCache}: {
  readonly copyContract: CopyContract;
  readonly ignoreCache: boolean;
}) {

  const compilerOutputs: CompiledCopyContract[] = [];

  // TODO: versioning etc
  const templatePath = path.resolve(os.tmpdir(), 'hardhat-copy-template');
  const artifactsDir = path.resolve(templatePath, 'artifacts');
  const cacheDir = path.resolve(templatePath, 'cache');

  ensureTemplateDir({templatePath});

  const {contractsDir} = ensureContractsDir({
    templatePath,
  });

  const {copyContractSources} = copyContract;

  // TODO: Ensure appropriate version for all contracts.
  const [{CompilerVersion: compilerVersion}] = copyContractSources

  fs.writeFileSync(
    path.resolve(templatePath, 'hardhat.config.ts'),
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
      copyContractPersistentIdentifier({
        copyContract,
        context: 'artifacts',
      }),
    );

    ignoreCache && fs.rmSync(artifactsCacheDir, {recursive: true});

    if (!fs.existsSync(artifactsCacheDir)) {
      child_process.execSync(
        'npx hardhat compile',
        {stdio: 'inherit', cwd: templatePath}
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