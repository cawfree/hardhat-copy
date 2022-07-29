import child_process from "child_process";

export const compileHardhatProject = ({hardhatProjectDir: cwd}: {
  readonly hardhatProjectDir: string;
}) => child_process.execSync(
  'npx hardhat compile',
  {cwd, stdio: 'inherit'}
);