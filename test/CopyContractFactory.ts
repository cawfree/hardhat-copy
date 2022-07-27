import "dotenv/config";

import { expect } from "chai";
import { ethers } from "hardhat";

import { CopyContractFactory } from "../src";

const {
  ETHERSCAN_KEY: etherscanKey,
  INFURA_KEY: infuraKey,
} = process.env as Partial<{
  readonly ETHERSCAN_KEY: string;
  readonly INFURA_KEY: string;
}>;

if (typeof etherscanKey !== 'string' || !etherscanKey.length)
  throw new Error(`Expected non-empty string etherscanKey, encountered "${
    etherscanKey
  }".`);

if (typeof infuraKey !== 'string' || !infuraKey.length)
  throw new Error(`Expected non-empty string infuraKey, encountered "${
    infuraKey
  }".`);

const fixture = async ({contractAddress}: {
  readonly contractAddress: string;
}) => {
  const copyContractFactory = new CopyContractFactory({
    etherscanKey,
    infuraKey,
    network: 'mainnet',
  });

  const [wallet] = await ethers.getSigners();

  const [contractFactory] = await copyContractFactory.copy({
    contractAddress,
  });

  const constructorParams = contractFactory.getConstructorParams();

  const gasLimit = await wallet.estimateGas(
    contractFactory.getDeployTransaction(...constructorParams)
  );

  const contract = await contractFactory
    .connect(wallet)
    .deploy(...constructorParams, {gasLimit});

  return {copyContractFactory, contract, wallet};
};

describe("RumbleKongLeague", function() {
  const RUMBLE_KONG_LEAGUE_MAINNET = '0xef0182dc0574cd5874494a120750fd222fdb909a';

  it("public:variables", async () => {
    const rumbleKongLeagueFixture = await fixture({
      contractAddress: RUMBLE_KONG_LEAGUE_MAINNET,
    });

    const {contract} = rumbleKongLeagueFixture;

    expect((await contract.kongPrice()).toHexString())
      .to.eq(ethers.utils.parseEther("0.08").toHexString());

    expect((await contract.maxKongPurchase()).toHexString())
      .to.eq(ethers.BigNumber.from("20").toHexString());
  });

  it("reserveKongs:once", async () => {
    const rumbleKongLeagueFixture = await fixture({
      contractAddress: RUMBLE_KONG_LEAGUE_MAINNET,
    });
    const {contract} = rumbleKongLeagueFixture;

    await contract.reserveKongs();

    await expect(contract.reserveKongs()).to.eventually.be.rejectedWith(Error);
  });
});

describe("BoredApeYachtClub", function () {
  const BORED_APE_MAINNET = '0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d';

  it("mintApe:salesNotActive", async () => {

    const boredApeFixture = await fixture({
      contractAddress: BORED_APE_MAINNET,
    });

    const {contract, wallet} = boredApeFixture;

    await expect(contract.mintApe(1)).to.eventually.be.rejectedWith(Error);

    // Enable sales.
    await (contract.flipSaleState());

    // Missing ETH.
    await expect(contract.mintApe(1)).to.eventually.be.rejectedWith(Error);

    // Not enough ETH.
    await expect(contract.mintApe(1, {value: ethers.utils.parseEther("0.07")})).to.eventually.be.rejectedWith(Error);

    // Should allocate a Bored Ape.
    await contract.mintApe(1, {value: ethers.utils.parseEther("0.08")});

    // The deployer should be the owner after a successful mint.
    expect(await contract.ownerOf(0)).to.eq(wallet.address);
  });
});
