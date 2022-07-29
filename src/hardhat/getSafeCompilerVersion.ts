export const getSafeCompilerVersion = ({compilerVersion = "0.8.9"}: {
  readonly compilerVersion?: string;
}) => compilerVersion
  .substring(0, compilerVersion.indexOf('+'))
  .replace('v', '');