export const getSafeCompilerVersion = ({compilerVersion = "0.8.9"}: {
  readonly compilerVersion?: string;
}) => compilerVersion
  .substring(0, compilerVersion.includes('+') ? compilerVersion.indexOf('+') : compilerVersion.length)
  .replace('v', '');