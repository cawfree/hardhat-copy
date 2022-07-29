import "dotenv/config";

import { expect } from "chai";
import { ethers } from "hardhat";

import {fetchCopyContractSource, parseCopyContractSource} from "../src";

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
    const {sourceFiles} = parseCopyContractSource({copyContractSource});

    expect(!!sourceFiles['BoredApeYachtClub.sol']).to.eq(true);
  });
  it("ReNFT", async () => {
    const copyContractSources = await fetchCopyContractSource({
      etherscanKey,
      contractAddress: RENFT_MAINNET,
    });

    expect(copyContractSources?.length).to.eq(1);

    const [copyContractSource] = copyContractSources!;
    const {sourceFiles} = parseCopyContractSource({copyContractSource});

    expect(Object.keys(sourceFiles))
      .to.deep.eq(['src/ReNFT.sol', '@openzeppelin/contracts/token/ERC20/IERC20.sol', '@openzeppelin/contracts/token/ERC20/ERC20.sol', '@openzeppelin/contracts/token/ERC721/IERC721.sol', '@openzeppelin/contracts/token/ERC1155/IERC1155.sol', '@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol', '@openzeppelin/contracts/token/ERC1155/utils/ERC1155Receiver.sol', '@openzeppelin/contracts/token/ERC1155/utils/ERC1155Holder.sol', 'src/interfaces/IResolver.sol', 'src/interfaces/IReNFT.sol', '@openzeppelin/contracts/utils/Context.sol', '@openzeppelin/contracts/utils/introspection/IERC165.sol', '@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol', '@openzeppelin/contracts/token/ERC1155/IERC1155Receiver.sol', '@openzeppelin/contracts/utils/introspection/ERC165.sol', '@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol', '@openzeppelin/contracts/utils/Address.sol']);
  });
});

///// Cache the dir and just execute directly via Proxy.
//describe("BoredApeYachtClub", function () {
//  const BORED_APE_MAINNET = '0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d';
//
//  it("mintApe:salesNotActive", async () => {
//
//    const boredApeFixture = await fixture({
//      contractAddress: BORED_APE_MAINNET,
//    });
//
//    const {contract, wallet} = boredApeFixture;
//
//    await expect(contract.mintApe(1)).to.eventually.be.rejectedWith(Error);
//
//    // Enable sales.
//    await (contract.flipSaleState());
//
//    // Missing ETH.
//    await expect(contract.mintApe(1)).to.eventually.be.rejectedWith(Error);
//
//    // Not enough ETH.
//    await expect(contract.mintApe(1, {value: ethers.utils.parseEther("0.07")})).to.eventually.be.rejectedWith(Error);
//
//    // Should allocate a Bored Ape.
//    await contract.mintApe(1, {value: ethers.utils.parseEther("0.08")});
//
//    // The deployer should be the owner after a successful mint.
//    expect(await contract.ownerOf(0)).to.eq(wallet.address);
//  });
//});
//
////describe("ReNFT", function() {
////  const RENFT_MAINNET = '0x94d8f036a0fbc216bb532d33bdf6564157af0cd7';
////
////  it("compiles-at-all", async () => {
////    const renftFixture = await fixture({
////      contractAddress: RENFT_MAINNET,
////    });
////
////    expect(true).to.eq(true);
////  });
////});
//