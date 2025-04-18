import { defineStore } from 'pinia'

interface ConnectState {
  showDashboard: boolean
  supportedChainId: number
  chainId: string,
  chainName: string,
  symbol: string,
  decimals: number,
  rpcUrls: [string],
  blockExplorerUrls: [string],
}

const useConnectStore = defineStore('connect', {
  state: (): ConnectState => ({
    supportedChainId: 98867,
    chainId: '0x18233',
    chainName: 'Plume',
    symbol: '$PLUME',
    decimals: 18,
    rpcUrls: ['https://testnet-rpc.plumenetwork.xyz'],
    blockExplorerUrls: ['https://testnet-explorer.plumenetwork.xyz'],
    showDashboard: false,
  }),
  actions: {
    setShowDashboard(value: boolean) {
      this.showDashboard = value
    },
  },
})

export default useConnectStore
