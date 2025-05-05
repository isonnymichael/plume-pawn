import axios from 'axios'

const BASE_URL = '/api/conduit/api/v2/addresses';

export async function fetchNFTs(address: string) {
  try {
    const url = `${BASE_URL}/${address}/nft?type=ERC-721%2CERC-404%2CERC-1155`
    const response = await axios.get(url)
    return response.data
  } catch (error) {
    console.error('Failed to fetch NFTs:', error)
    throw error
  }
}
