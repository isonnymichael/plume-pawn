<!-- source: https://vuedapp.xyz/overview -->
<script lang="ts" setup>
import { computed, ref, watchEffect } from 'vue'
import { BrowserWalletConnector, useVueDapp, shortenAddress } from '@vue-dapp/core'
import { VueDappModal, useVueDappModal } from '@vue-dapp/modal'
import '@vue-dapp/modal/dist/style.css'
import useConnectStore from '../store/connect'

const { addConnectors, isConnected, wallet, disconnect } = useVueDapp()

const connectStore = useConnectStore()
const showSwitchButton = computed(() => isConnected.value && wallet.chainId !== connectStore.supportedChainId);
const error = ref(null)

addConnectors([new BrowserWalletConnector()])

watchEffect(() => {
  const shouldShow = isConnected.value && wallet.chainId === connectStore.supportedChainId
  connectStore.setShowDashboard(shouldShow)
})

async function switchChain() {
	const { connector } = useVueDapp()
	const ethereum = window.ethereum

	try {
		await connector.value?.switchChain?.(connectStore.supportedChainId, {
			chainId: connectStore.supportedChainId,
			chainName: connectStore.chainName,
			nativeCurrency: {
				symbol: connectStore.symbol,
				decimals: connectStore.decimals,
			},
			rpcUrls: connectStore.rpcUrls,
			blockExplorerUrls: connectStore.blockExplorerUrls,
		})
	} catch (err: any) {
		if (err?.code === 4902 && ethereum?.request) {
			try {
				await ethereum.request({
					method: 'wallet_addEthereumChain',
					params: [{
						chainId: connectStore.chainId,
						chainName: connectStore.chainName,
						nativeCurrency: {
							name: connectStore.chainName,
							symbol: connectStore.symbol,
							decimals: connectStore.decimals,
						},
						rpcUrls: connectStore.rpcUrls,
						blockExplorerUrls: connectStore.blockExplorerUrls,
					}],
				})
			} catch (addErr: any) {
				error.value = addErr.message
			}
		} else {
			error.value = err.message
		}
	}
}

function onClickConnectButton() {
	if (isConnected.value) {
		disconnect()
		connectStore.setShowDashboard(false)
	} else {
		useVueDappModal().open()
	}
}

</script>

<template>
    <button v-if="!showSwitchButton" @click="onClickConnectButton" class="bg-black hover:bg-gray-900 text-white text-sm px-6 py-2 rounded-full cursor-pointer mr-3">
        {{ isConnected ? shortenAddress(wallet.address!) : 'Connect' }}
    </button>

    <button ghost v-if="showSwitchButton" @click="switchChain" class="bg-red-500 hover:bg-red-600 text-white text-sm px-6 py-2 rounded-full cursor-pointer mr-3">
        Wrong Network
    </button>

	<VueDappModal auto-connect />
</template>