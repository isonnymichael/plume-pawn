import { getContract, readContract, prepareContractCall, sendTransaction, resolveMethod } from "thirdweb";
import { plumeTestnet } from '../lib/chain';
import { thirdWebClient } from '../lib/client';
import axios from "axios";

export const plumeRwaMarketplaceContract = getContract({
    client: thirdWebClient,
    address: import.meta.env.VITE_RWA_MARKETPLACE_CONTRACT,
    chain: plumeTestnet,
});

export const plumeRwaContract = getContract({
    client: thirdWebClient,
    address: import.meta.env.VITE_RWA_CONTRACT,
    chain: plumeTestnet,
});

export async function listAsset(
    account: any,
    tokenId: bigint,
    pricePerUnit: bigint,
    amount: bigint
  ): Promise<{ status: boolean; transactionHash?: string }> {
    try {
        const approvalTx = prepareContractCall({
            contract: plumeRwaContract,
            method: resolveMethod("function setApprovalForAll(address operator, bool approved) external"),
            params: [plumeRwaMarketplaceContract.address, true],
        })

        await sendTransaction({
            transaction: approvalTx,
            account,
        })

        const transaction = prepareContractCall({
            contract: plumeRwaMarketplaceContract,
            method: resolveMethod("function list(address tokenAddress, uint256 tokenId, uint256 pricePerUnit, uint256 amount) external"),
            params: [import.meta.env.VITE_RWA_CONTRACT, tokenId, pricePerUnit, amount],
        })
  
        const { transactionHash } = await sendTransaction({
            transaction,
            account,
        })
    
        return {
            status: true,
            transactionHash,
        }
    } catch (error) {
      console.error("Failed to list asset:", error)
      return {
        status: false,
      }
    }
}