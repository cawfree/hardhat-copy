import axios from "axios";

import {CopyContractSource} from "../@types";

export const fetchCopyContractSource = async ({
  contractAddress,
  etherscanKey,
}: {
  readonly contractAddress: string;
  readonly etherscanKey: string;
}): Promise<readonly CopyContractSource[] | null> => {
  try {
    const {data} = await axios
      .get(`https://api.etherscan.io/api?module=contract&action=getsourcecode&address=${
        contractAddress
      }&apikey=${
        etherscanKey
      }`);
    return data?.result || null;
  } catch (e) {
    console.error(e);
  }
  return null;
};