import {ethers} from "ethers";

import {CopyContract} from "../@types";

export const copyContractPersistentIdentifier = ({
  copyContract: {network, contractAddress},
  context,
}: {
  readonly copyContract: CopyContract;
  readonly context: string;
}) => ethers.utils.keccak256(
  ethers.utils.toUtf8Bytes(`${network}:${contractAddress}:${context}`)
);