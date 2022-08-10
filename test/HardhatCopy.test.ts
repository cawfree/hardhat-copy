import "dotenv/config";

import os from "os";
import path from "path";
import fs from "fs-extra";

import { expect } from "chai";

import {
  fetchCopyContractSource,
  parseCopyContractSource,
  keccakString,
  createHardhatProject,
  copyProject, getSafeCompilerVersion,
} from "../src";

const {
  ETHERSCAN_KEY: etherscanKey,
} = process.env as Partial<{
  readonly ETHERSCAN_KEY: string;
}>;

if (typeof etherscanKey !== 'string' || !etherscanKey.length)
  throw new Error(`Expected non-empty string etherscanKey, encountered "${
    etherscanKey
  }".`);

const BORED_APE_MAINNET = "0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d";
const RENFT_MAINNET = "0x94d8f036a0fbc216bb532d33bdf6564157af0cd7";

describe("hardhat", () => {
  expect(getSafeCompilerVersion({compilerVersion: '0.8.9'}))
    .to.equal('0.8.9');
});

describe("fetchCopyContractSource", () => {
  it("BoredApeYachtClub", async () => {
    const copyContractSource = await fetchCopyContractSource({
      etherscanKey,
      contractAddress: BORED_APE_MAINNET,
    });
    expect(!!copyContractSource).to.eq(true);
  });
  it("ReNFT", async () => {
    const copyContractSource = await fetchCopyContractSource({
      etherscanKey,
      contractAddress: RENFT_MAINNET,
    });
    expect(!!copyContractSource).to.eq(true);
  });
});

describe("parseCopyContractSource", () => {
  it("BoredApeYachtClub", async () => {
    const copyContractSources = await fetchCopyContractSource({
      etherscanKey,
      contractAddress: BORED_APE_MAINNET,
    });

    expect(copyContractSources?.length).to.eq(1);

    const [copyContractSource] = copyContractSources!;
    const {sourceFiles} = parseCopyContractSource({
      copyContractSource,
      contractAddress: BORED_APE_MAINNET,
    });

    expect(!!sourceFiles['BoredApeYachtClub.sol']).to.eq(true);
  });
  it("ReNFT", async () => {
    const copyContractSources = await fetchCopyContractSource({
      etherscanKey,
      contractAddress: RENFT_MAINNET,
    });

    expect(copyContractSources?.length).to.eq(1);

    const [copyContractSource] = copyContractSources!;
    const {sourceFiles} = parseCopyContractSource({
      copyContractSource,
      contractAddress: RENFT_MAINNET,
    });

    expect(Object.keys(sourceFiles))
      .to.deep.eq(['src/ReNFT.sol', '@openzeppelin/contracts/token/ERC20/IERC20.sol', '@openzeppelin/contracts/token/ERC20/ERC20.sol', '@openzeppelin/contracts/token/ERC721/IERC721.sol', '@openzeppelin/contracts/token/ERC1155/IERC1155.sol', '@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol', '@openzeppelin/contracts/token/ERC1155/utils/ERC1155Receiver.sol', '@openzeppelin/contracts/token/ERC1155/utils/ERC1155Holder.sol', 'src/interfaces/IResolver.sol', 'src/interfaces/IReNFT.sol', '@openzeppelin/contracts/utils/Context.sol', '@openzeppelin/contracts/utils/introspection/IERC165.sol', '@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol', '@openzeppelin/contracts/token/ERC1155/IERC1155Receiver.sol', '@openzeppelin/contracts/utils/introspection/ERC165.sol', '@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol', '@openzeppelin/contracts/utils/Address.sol']);
  });
});

describe("createHardhatProject", () => {
  const hardhatProjectTemplatePath = path.resolve(
    os.tmpdir(),
    keccakString("hardhat-copy/test/createHardhatProject")
  );
  it("createHardhatProject", () => {
    const {testDir, contractsDir} = createHardhatProject({
      hardhatProjectPath: hardhatProjectTemplatePath,
    });
    expect(fs.existsSync(hardhatProjectTemplatePath)).to.eq(true);
    expect(fs.existsSync(testDir)).to.eq(true);
    expect(fs.existsSync(contractsDir)).to.eq(true);
  });
  it("cloneHardhatProjectWithParsedCopyContractSource:BoredApeYachtClub", async () => {
    const targetPath = path.resolve(
      os.tmpdir(),
      keccakString("hardhat-copy/test/cloneHardhatProjectWithParsedCopyContractSource:BoredApeYachtClub")
    );
    await copyProject({
      hardhatProjectTemplatePath,
      targetPath,
      etherscanKey,
      contractAddress: BORED_APE_MAINNET,
    });
  });
  it("copyProject:ReNFT", async () => {
    const targetPath = path.resolve(
      os.tmpdir(),
      keccakString("hardhat-copy/test/cloneHardhatProjectWithParsedCopyContractSource:ReNFT")
    );
    await copyProject({
      hardhatProjectTemplatePath,
      targetPath,
      etherscanKey,
      contractAddress: RENFT_MAINNET,
    });
  });
});
