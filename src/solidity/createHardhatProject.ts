import fs from "fs-extra";
import child_process from "child_process";
import path from "path";

export const createHardhatProject = ({hardhatProjectPath}: {
  readonly hardhatProjectPath: string;
}) => {
  fs.mkdirSync(hardhatProjectPath);
  fs.mkdirSync(path.resolve(hardhatProjectPath, 'test'));

  child_process.execSync(
    'npm i @nomicfoundation/hardhat-toolbox@^1.0.2 hardhat@^2.0.1',
    {stdio: 'inherit', cwd: hardhatProjectPath},
  );

  fs.writeFileSync(
    path.resolve(hardhatProjectPath, 'tsconfig.json'),
    `
{
  "compilerOptions": {
    "target": "es2020",
    "module": "commonjs",
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "skipLibCheck": true
  }
}
      `.trim(),
    );
};
