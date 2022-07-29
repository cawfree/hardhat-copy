import fs from "fs-extra";
import path from "path";
import {getSafeCompilerVersion} from "./getSafeCompilerVersion";

export const createHardhatConfig = ({projectDir, compilerVersion}: {
  readonly projectDir: string;
  readonly compilerVersion?: string;
}) =>   fs.writeFileSync(
  path.resolve(projectDir, 'hardhat.config.ts'),
  `
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  solidity: "${getSafeCompilerVersion({
    compilerVersion
  })}",
};

export default config;
  `.trim(),
);