import axios from "axios";
import fs from "fs-extra";
import path from "path";
import os from "os";

import { CopyContract } from "../@types";
import {persistentIdentifier} from "./persistentIdentifier";

const getContractAbiFromEtherscan = async ({contractAddress, etherscanKey}: {
  readonly contractAddress: string;
  readonly etherscanKey: string;
}) =>  {
  try {
    const {data} = await axios
      .get(`https://api.etherscan.io/api?module=contract&action=getabi&address=${
        contractAddress
      }&apikey=${
        etherscanKey
      }`);
    return JSON.parse(data?.result);
  } catch (e) {
    console.error(e);
  }
  return null;
};

const getContractSourcesFromEtherscan = async ({
  contractAddress,
  etherscanKey,
}: {
  readonly contractAddress: string;
  readonly etherscanKey: string;
}) => {
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

export const copyContractFrom = async ({
  contractAddress,
  etherscanKey,
  network,
  ignoreCache,
}: {
  readonly contractAddress: string;
  readonly etherscanKey: string;
  readonly network: 'mainnet';
  readonly ignoreCache: boolean;
}): Promise<CopyContract> => {

  const cachedCopyContract = path.resolve(
    os.tmpdir(),
    persistentIdentifier({
      contractAddress,
      network,
      context: 'copyContractFrom',
    }),
  );

  if (ignoreCache && fs.existsSync(cachedCopyContract)) {
    fs.unlinkSync(cachedCopyContract);
  }

  if (!fs.existsSync(cachedCopyContract)) {

    const [abi, copyContractSources] = await Promise.all([
      getContractAbiFromEtherscan({
        contractAddress,
        etherscanKey,
      }),
      getContractSourcesFromEtherscan({
        contractAddress,
        etherscanKey,
      }),
    ]);

    const nextCopyContract: CopyContract = {
      contractAddress,
      abi,
      copyContractSources,
      network,
    };

    fs.writeFileSync(cachedCopyContract, JSON.stringify(nextCopyContract));
  }

  return JSON.parse(fs.readFileSync(cachedCopyContract, 'utf-8')) as CopyContract;
};
