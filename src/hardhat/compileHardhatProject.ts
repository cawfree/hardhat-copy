import child_process from "child_process";

export const compileHardhatProject = ({hardhatProjectDir: cwd}: {
  readonly hardhatProjectDir: string;
}) => child_process.execSync(
  './node_modules/.bin/hardhat compile',
  {cwd, stdio: 'inherit'}
);