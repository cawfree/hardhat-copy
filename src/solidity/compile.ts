import os from "os";
import path from "path";
import child_process from "child_process";
import fs from "fs-extra";

import {CompiledCopyContract, CopyContract, CopyContractSource} from "../@types";
import {persistentIdentifier} from "../providers";
import {artifacts} from "hardhat";

import {ensureTemplateProject} from "./ensureTemplateProject";
import {createHardhatConfig} from "./createHardhatConfig";

const getMainArtifactPath = ({
  artifactsCacheDir,
  copyContractSource: {ContractName},
  relativeSourcePaths,
}: {
  readonly artifactsCacheDir: string;
  readonly copyContractSource: CopyContractSource;
  readonly relativeSourcePaths: readonly string[];
}) => {

  const suffix = `${ContractName}.sol`;

  const relativeSourcePath = relativeSourcePaths
    .find((e) => e.endsWith(suffix))

  if (!relativeSourcePath)
    throw new Error(`Unable to find relativeSourcePath with suffix "${
      suffix
    }" in ${
      relativeSourcePaths.map(e => `"${e}"`).join(", ")
    }.`);

  // TODO: find a more reliable way of doing this (possibly inspect artifacts for name)
  return path
    .resolve(
      artifactsCacheDir,
      'contracts',
      ...relativeSourcePath.split(path.sep),
      `${ContractName}.json`
  );
};

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

  createHardhatConfig({
    projectDir: templateDir,
    compilerVersion,
  });

  const relativeSourcePaths = copyContractSources.flatMap(
    ({ContractName, SourceCode}: CopyContractSource) => {

      if (!SourceCode.startsWith('{')) {
        const relativeSourcePath =`${ContractName}.sol`;
        fs.writeFileSync(path.resolve(contractsDir, `${ContractName}.sol`), SourceCode);
        return [relativeSourcePath];
      }

      const {sources} = JSON.parse(SourceCode.substring(1, SourceCode.length - 1));

      return Object.entries(sources).map(
        // @ts-ignore
        ([relativeFilePath, {content}]) => {
          fs.mkdirSync(
            path.resolve(contractsDir, path.dirname(relativeFilePath)),
            {recursive: true}
          );

          fs.writeFileSync(path.resolve(contractsDir, relativeFilePath), content);

          return relativeFilePath;
        },
      );
    },
  );

  try {
    const artifactsCacheDir = path.resolve(
      os.tmpdir(),
      persistentIdentifier({
        ...copyContract,
        context: 'artifactsCacheDir',
      }),
    );

    if (ignoreCache && fs.existsSync(artifactsCacheDir))
      fs.rmSync(artifactsCacheDir, {recursive: true});

    if (!fs.existsSync(artifactsCacheDir)) {

      // TODO: This should be generalized for global imports.
      // Check if there's any @openzeppelin contracts.
      // (These expect to be included as globals.)
      //const openZeppelinDir = path.resolve(templateDir, 'contracts', '@openzeppelin');

      //if (fs.existsSync(openZeppelinDir)) {
      //  console.log('found open zepplein dir, copying..');

      //  const to = path.resolve(templateDir, 'node_modules', '@openzeppelin');
      //  console.log(to);

      //  fs.cpSync(openZeppelinDir, to, {recursive: true});
      //}

      child_process.execSync(
        'npx hardhat compile',
        {stdio: 'inherit', cwd: templateDir}
      );

      // After compiling, cache these results in an attempt to can skip the next iteration if possible.
      fs.mkdirSync(artifactsCacheDir);
      fs.copySync(artifactsDir, artifactsCacheDir, {recursive: true});
    }

    copyContractSources.forEach(
      (copyContractSource: CopyContractSource) => {
        const {ContractName, ConstructorArguments, ...extras} = copyContractSource;
        return compilerOutputs.push({
          ...extras,
          ContractName,
          ConstructorArguments,
          compilerOutput: JSON.parse(
            fs.readFileSync(
              getMainArtifactPath({
                artifactsCacheDir,
                copyContractSource,
                relativeSourcePaths,
              }),
              'utf-8',
            ),
          ),
        });
      },
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