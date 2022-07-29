import fs from "fs-extra";

export const forceMkdir = ({dir}: {
  readonly dir: string;
}) => {
  if (fs.existsSync(dir)) fs.rmSync(dir, {recursive: true});
  fs.mkdirSync(dir, {recursive: true});
};