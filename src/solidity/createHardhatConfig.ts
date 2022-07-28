import fs from "fs-extra";
import path from "path";

export const createHardhatConfig = ({projectDir, compilerVersion = '0.8.9'}: {
  readonly projectDir: string;
  readonly compilerVersion?: string;
}) =>   fs.writeFileSync(
  path.resolve(projectDir, 'hardhat.config.ts'),
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