import {ethers} from "ethers";
import {decodeInvocation} from "./decodeInvocation";

export const stringifyInvocation = ({deploymentParams}: {
  readonly deploymentParams: ReturnType<typeof decodeInvocation>;
}) => `${
  deploymentParams.map(e => {
    if (ethers.BigNumber.isBigNumber(e)) {
      return `ethers.BigNumber.from("${e.toString()}")`;
    }
    return JSON.stringify(e);
  })
  .join(", ")
}`.trim();