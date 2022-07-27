import os from "os";
import path from "path";
import child_process from "child_process";
import fs from "fs-extra";

import {CompiledCopyContract, CopyContract, CopyContractSource} from "../@types";

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

export function compile({copyContract}: {
  readonly copyContract: CopyContract;
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

      //
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
    child_process.execSync(
      'npx hardhat compile',
      {stdio: 'inherit', cwd: templatePath}
    );

    copyContractSources.forEach(
      ({ContractName, ConstructorArguments}: CopyContractSource) => compilerOutputs.push({
        name: ContractName,
        data: ConstructorArguments,
        compilerOutput: JSON.parse(
          fs.readFileSync(
            path.resolve(templatePath, 'artifacts', 'contracts', `${ContractName}.sol`, `${ContractName}.json`),
            'utf-8',
          ),
        ),
      }),
    );
  } catch (e) {
    console.error(e);
  } finally {
    // TODO: clear artifacts as well probably
    fs.existsSync(contractsDir) && fs.rmSync(contractsDir, {recursive: true});
    fs.existsSync(artifactsDir) && fs.rmSync(artifactsDir, {recursive: true});
    fs.existsSync(cacheDir) && fs.rmSync(cacheDir, {recursive: true});
  }

  return {compilerOutputs};
}