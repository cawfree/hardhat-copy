import path from "path";
import fs from "fs-extra";
import {ParsedCopyContractSource} from "../@types";
import {stringifyInvocation} from "../ethers";

export const createTestForClonedHardhatProject = ({
  parsedCopyContractSource: {contractName, deploymentParams},
  targetPath,
}: {
  readonly parsedCopyContractSource: ParsedCopyContractSource;
  readonly targetPath: string;
}) => fs.writeFileSync(
  path.resolve(targetPath, "test", `${contractName}.test.ts`),
    `
import { expect } from "chai";
import { ethers } from "hardhat";

// Thanks for using npx hardhat-copy!
// Follow @cawfree on Twitter for even more Ethereum goodness. ✌️

describe("Test Deployment...", function () {
  it("Successfully deploys to the hardhat runtime.", async function () {
    const [signer] = await ethers.getSigners();
    
    const Contract = await ethers.getContractFactory("${contractName}");
    const contract = await Contract.deploy(${
      stringifyInvocation({deploymentParams})
    });
    
    console.log(\`Successfully copied "${contractName}" to "\${contract.address}"!\`); 
  });
});
  `.trim(),
);