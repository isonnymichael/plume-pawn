import { readContract } from "thirdweb";
import axios from "axios";

export async function getListingMetadata(tokenAddress: any, tokenId: number): Promise<any> {

  try {
    const metadataURI = await readContract({
      contract: tokenAddress,
      method: "function uri(uint256) view returns (string)",
      params: [BigInt(tokenId)],
    });


    let metadata = await fetchMetadata(metadataURI);
    metadata.image = convertIpfsToUrl(metadata.image);
    console.log(metadata);
    return metadata;
  } catch (err) {
    console.error("Failed to fetch metadata:", err);
    return {};
  }
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