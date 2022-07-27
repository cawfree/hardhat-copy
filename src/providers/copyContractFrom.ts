import { ethers } from "ethers";
import axios from "axios";

import { CopyContract } from "../@types";

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
  infuraKey,
  network,
}: {
  readonly contractAddress: string;
  readonly etherscanKey: string;
  readonly infuraKey: string;
  readonly network: 'mainnet';
}): Promise<CopyContract> => {
  const provider = new ethers.providers.InfuraProvider(network, infuraKey);
  const [abi, copyContractSources, bytecode] = await Promise.all([
    getContractAbiFromEtherscan({
      contractAddress,
      etherscanKey,
    }),
    getContractSourcesFromEtherscan({
      contractAddress,
      etherscanKey,
    }),
    provider.getCode(contractAddress),
  ]);
  return {contractAddress, abi, copyContractSources, bytecode, network};
};
