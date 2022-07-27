import {ethers} from "ethers";

export const persistentIdentifier = ({
  contractAddress,
  network,
  context,
}: {
  readonly contractAddress: string;
  readonly network: 'mainnet';
  readonly context: string;
}) => ethers.utils.keccak256(
  ethers.utils.toUtf8Bytes(`${context}:${network}:${contractAddress}`)
);