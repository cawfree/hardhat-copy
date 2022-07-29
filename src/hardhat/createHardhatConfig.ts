import fs from "fs-extra";
import path from "path";
import {getSafeCompilerVersion} from "./getSafeCompilerVersion";

export const createHardhatConfig = ({
  projectDir,
  compilerVersion,
  optimizer = false,
  runs = 0,
}: {
  readonly projectDir: string;
  readonly compilerVersion?: string;
  readonly optimizer?: boolean;
  readonly runs?: number;
}) =>   fs.writeFileSync(
  path.resolve(projectDir, 'hardhat.config.ts'),
  `
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  defaultNetwork: "hardhat",
  solidity: {
    version: "${getSafeCompilerVersion({compilerVersion})}",
    settings: {
      optimizer: {
        enabled: ${optimizer},
        runs: ${String(runs)},
      },
    },  
  },
  networks: {
    hardhat: {
      allowUnlimitedContractSize: true 
    },
  },
};

export default config;
  `.trim(),
);