import { getContract, readContract, prepareContractCall, sendTransaction, resolveMethod } from "thirdweb";
import { plumeTestnet } from '../lib/chain';
import { thirdWebClient } from '../lib/client';
import axios from "axios";

export const plumeRwaContract = getContract({
    client: thirdWebClient,
    address: import.meta.env.VITE_RWA_CONTRACT,
    chain: plumeTestnet,
});

export async function mintRWA(
    account: any,
    name: string,
    ticker: string,
    amount: bigint,
    metadataURI: string
): Promise<{ status: boolean; transactionHash?: string; tokenId?: bigint }> {
    try {
        const transaction = prepareContractCall({
            contract: plumeRwaContract,
            method: resolveMethod("function mintRWA(string memory name, string memory ticker, uint256 amount, string memory metadataURI) external returns (uint256)"),
            params: [name, ticker, amount, metadataURI],
        });

        const { transactionHash } = await sendTransaction({
            transaction,
            account,
        });

        return {
            status: true,
            transactionHash,
        };
    } catch (error) {
        console.error("Failed to mint RWA:", error);
        return {
            status: false,
        };
    }
}

export async function getAssetInfo(tokenId: bigint): Promise<{
    name: string;
    ticker: string;
    maxSupply: bigint;
    currentSupply: bigint;
    metadataURI: string;
} | null> {
    try {
        const [name, ticker, maxSupply, currentSupply, metadataURI] = await readContract({
            contract: plumeRwaContract,
            method: resolveMethod("function assetInfo(uint256) view returns (string, string, uint256, uint256, string)"),
            params: [tokenId],
        });

        return {
            name: name as string,
            ticker: ticker as string,
            maxSupply: maxSupply as bigint,
            currentSupply: currentSupply as bigint,
            metadataURI: metadataURI as string,
        };
    } catch (error) {
        console.error("Failed to fetch asset info:", error);
        return null;
    }
}

export async function getTokenCreator(tokenId: bigint): Promise<string | null> {
    try {
        const creator = await readContract({
            contract: plumeRwaContract,
            method: resolveMethod("function tokenCreators(uint256) view returns (address)"),
            params: [tokenId],
        });

        return creator as any;
    } catch (error) {
        console.error("Failed to fetch token creator:", error);
        return null;
    }
}

export async function getNFTs() {
    const totalSupply = await readContract({
      contract: plumeRwaContract,
      method: "function nextTokenId() view returns (uint256)",
    });
  
    const nftItems = [];
    for (let i = 1; i < totalSupply; i++) {
      const assetInfo = await getAssetInfo(BigInt(i));

      if (assetInfo) {
        const metadata = await fetchMetadata(assetInfo.metadataURI);

        if (metadata) {
            nftItems.push({
            tokenId: i,
            name: metadata.name || assetInfo.name,
            ticker: metadata.attributes?.find((a: any) => a.trait_type === "Ticker")?.value || assetInfo.ticker,
            currentSupply: assetInfo.currentSupply.toString(),
            maxSupply: assetInfo.maxSupply.toString(),
            imageUrl: convertIpfsToUrl(metadata.image),
            description: metadata.description,
            metadata
            });
        }
      }
    }
    return nftItems;
}

const convertIpfsToUrl = (ipfsUri: string) => {
    if (!ipfsUri) return '';
    if (ipfsUri.startsWith('ipfs://')) {
      return `https://ipfs.io/ipfs/${ipfsUri.replace('ipfs://', '')}`;
    }
    return ipfsUri;
}

const fetchMetadata = async (metadataUri: string) => {
    try {
      const url = convertIpfsToUrl(metadataUri);
      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      console.error("Failed to fetch metadata:", error);
      return null;
    }
}