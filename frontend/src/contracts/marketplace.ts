import { getContract, readContract, prepareContractCall, sendTransaction, resolveMethod } from "thirdweb";
import { plumeTestnet } from '../lib/chain';
import { thirdWebClient } from '../lib/client';
import { plumeRwaContract } from './rwa';
import { Listing } from '../types/marketplace';

export const plumeRwaMarketplaceContract = getContract({
    client: thirdWebClient,
    address: import.meta.env.VITE_RWA_MARKETPLACE_CONTRACT,
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

export async function fetchListings(): Promise<Listing[]> {
    try {
        const total = await readContract({
            contract: plumeRwaMarketplaceContract,
            method: "function nextListingId() view returns (uint256)",
        });
  
        const listings = await Promise.all(
            [...Array(Number(total)).keys()].map(async (id) => {
            const listingData: any = await readContract({
                contract: plumeRwaMarketplaceContract,
                method: resolveMethod("function listings(uint256) view returns (uint256 id, address seller, address tokenAddress, uint256 tokenId, uint256 pricePerUnit, uint256 amountAvailable)"),
                params: [id],
            });
            const listing: Listing = {
                id: listingData[0],
                seller: listingData[1],
                tokenAddress: listingData[2],
                tokenId: listingData[3],
                pricePerUnit: listingData[4],
                amountAvailable: listingData[5],
            };

            // Filter out listings with no available amount
            if (listing.amountAvailable > 0) return listing;
                return null;
            })
        );
  
        return listings.filter(Boolean) as Listing[];
    } catch (err) {
        console.error("Failed to fetch listings", err);
        return [];
    }
  }