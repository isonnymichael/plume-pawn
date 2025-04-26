import { getContract, readContract } from "thirdweb";
import { plumeTestnet } from '../lib/chain';
import { thirdWebClient } from '../lib/client';

export const plumePawnContract = getContract({
    client: thirdWebClient,
    address: import.meta.env.PLUME_PAWN_CONTRACT,
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
