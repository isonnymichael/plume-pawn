import { config as dotenvConfig } from "dotenv"
import { HardhatUserConfig } from "hardhat/config"
import "@nomicfoundation/hardhat-toolbox"

dotenvConfig()

const config: HardhatUserConfig = {
  solidity: "0.8.28",
  networks: {
    plume: {
      url: process.env.PLUME_RPC_URL,
      accounts: [process.env.PRIVATE_KEY!],
    },
  },
}

export default config
