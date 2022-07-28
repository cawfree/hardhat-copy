#!/usr/bin/env node
import "dotenv/config";

import os from 'os';
import path from "path";
import {ethers} from "ethers";
import {nanoid} from "nanoid";
import fs from "fs-extra";

import {createHardhatProject} from "../src/solidity";
import {persistentIdentifier} from "../src/providers";

const argv = process.env as Partial<{
  readonly CONTRACT_ADDRESS: string;
  readonly PROJECT_NAME: string;
}>;

const ensureTemplateDir = ({templateDir}: {
  readonly templateDir: string;
}) => {
  if (fs.existsSync(templateDir)) return;

  createHardhatProject({hardhatProjectPath: templateDir});
};

const getProjectDir = ({maybeProjectName}: {
  readonly maybeProjectName: string | undefined;
}) => {
  if (typeof maybeProjectName === 'string' && maybeProjectName.length)
    return path.resolve(maybeProjectName);

  const name = nanoid();

  console.log(`Creating a new project with name "${name}".`);

  return path.resolve(name);
};

const createTestTemplate = ({testTemplatePath, contractAddress}: {
  readonly testTemplatePath: string;
  readonly contractAddress: string;
}) => fs.writeFileSync(
  testTemplatePath,
  `
import { CopyContractFactory } from "hardhat-copy";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("Test", function () {

  const copyContractFactory = new CopyContractFactory({
    network: 'mainnet',
    etherscanKey: /* TODO: */,
  });

  it("successfully copies contract from mainnet", async function () {
    const [signer] = await ethers.getSigners();
    
    const [contractFactory] = await copyContractFactory.copy({
      contractAddress: "${contractAddress}",
      signer,
    });

    // You can fetch the parameters originally used to launch the ERC721:
    const constructorParams = contractFactory.getConstructorParams();

    // Contracts returned by the CopyContractFactory continue to work as expected:
    const [wallet] = await ethers.getSigners();

    const gasLimit = await wallet.estimateGas(
      contractFactory.getDeployTransaction(...constructorParams)
    );

    const contract = await contractFactory
      .connect(wallet)
      .deploy(...constructorParams, {gasLimit});

    console.log(\`Deployed "\${contractFactory.getContractName()}" to \${contract.address}!\`);
    
    expect(typeof contract.address).to.eq("string");
  });
});
  `.trim(),
);

void (async () => {
  try {
    const {
      CONTRACT_ADDRESS: contractAddress,
      PROJECT_NAME: maybeProjectName,
    } = argv;

    if (typeof contractAddress !== 'string' || !ethers.utils.getAddress(contractAddress))
      throw new Error(`Expected non-empty string contract_address, encountered "${
        String(contractAddress)
      }".`);

    const projectDir = getProjectDir({maybeProjectName});

    if (fs.existsSync(projectDir))
      throw new Error(`Unable to initialize, target location is not empty: ${projectDir}`);

    console.log('would create project at', projectDir);

    const templateDir = path.resolve(
      os.tmpdir(),
      persistentIdentifier({
        contractAddress: '0x000000000000000000000000000000000000dead',
        network: 'mainnet',
        context: 'hardhat-copy-template-dir',
      }),
    );

    ensureTemplateDir({templateDir});

    // Copy the template into the project dir.
    fs.copySync(templateDir, projectDir, {recursive: true})

    // Create an example test.
    createTestTemplate({
      testTemplatePath: path.resolve(projectDir, 'test', 'Test.test.ts'),
      contractAddress,
    });

  } catch (e) {
    console.error(e);
  }
})();
