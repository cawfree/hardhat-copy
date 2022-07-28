#!/usr/bin/env node
import "dotenv/config";

import path from "path";
import {ethers} from "ethers";
import {nanoid} from "nanoid";
import fs from "fs-extra";
import child_process from "child_process";

import {ensureTemplateProject} from "../src/solidity";

const argv = process.env as Partial<{
  readonly CONTRACT_ADDRESS: string;
  readonly PROJECT_NAME: string;
}>;

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
import "dotenv/config";
  
import { CopyContractFactory } from "hardhat-copy";
import { expect } from "chai";
import { ethers } from "hardhat";

const {ETHERSCAN_KEY: etherscanKey} = process.env as Partial<{
  readonly ETHERSCAN_KEY: string;
}>;

if (typeof etherscanKey !== 'string' || !etherscanKey.length) 
  throw new Error(\`Expected non-empty string ETHERSCAN_KEY, encountered "\${
    String(etherscanKey)
  }".\`);


describe("Test", function () {

  const copyContractFactory = new CopyContractFactory({
    network: 'mainnet',
    etherscanKey,
  });

  it("successfully copies and redeploys contract", async function () {
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

    const {templateDir} = ensureTemplateProject({});

    // Copy the template into the project dir.
    fs.copySync(templateDir, projectDir, {recursive: true})

    // Create an example test.
    createTestTemplate({
      testTemplatePath: path.resolve(projectDir, 'test', 'Test.test.ts'),
      contractAddress,
    });

    // Run test deployment upon completion.
    child_process.execSync(
      'npx hardhat test',
      {stdio: 'inherit', cwd: projectDir}
    );

  } catch (e) {
    console.error(e);
  }
})();
