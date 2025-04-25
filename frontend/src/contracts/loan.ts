import { getContract, readContract } from "thirdweb";
import { plumeTestnet } from '../lib/chain';
import { thirdWebClient } from '../lib/client';

const pawnContractAddress = "0xAeC5e1c78a8726634Ad1C3c45C59bbC4f1Fd5c22";

export const plumePawnContract = getContract({
    client: thirdWebClient,
    address: pawnContractAddress,
    chain: plumeTestnet,
});

export async function getLTV(): Promise<string> {
  try {
    const ltv = await readContract({
      contract: plumePawnContract,
      method: "function LTV() view returns (uint256)",
    });
    
    return ltv.toString();
  } catch (error) {
    console.error("Failed to fetch LTV:", error);
    return '-';
  }
}
