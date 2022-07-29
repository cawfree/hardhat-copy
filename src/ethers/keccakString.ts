import {ethers} from "ethers";

export const keccakString = (str: string) => ethers.utils.keccak256(ethers.utils.toUtf8Bytes(str));