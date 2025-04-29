import { NFTStorage, File } from "nft.storage"

const client = new NFTStorage({ token: import.meta.env.VITE_NFT_STORAGE_KEY })

export async function uploadMetadata(name: string, ticker: string, imageFile: File) {
  const metadata = await client.store({
    name,
    description: `${ticker} - Tokenized Plume Pawn RWA`,
    image: new File([imageFile], imageFile.name, { type: imageFile.type })
  })

  return metadata.url
}
