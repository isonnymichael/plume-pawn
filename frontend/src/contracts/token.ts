import { getContract } from "thirdweb";
import { getBalance } from "thirdweb/extensions/erc20";
import { plumeTestnet } from '../lib/chain';
import { thirdWebClient } from '../lib/client';

const tokenContractAddress = "0x1E0E030AbCb4f07de629DCCEa458a271e0E82624";

export const tokenContract = getContract({
    client: thirdWebClient,
    address: tokenContractAddress,
    chain: plumeTestnet,
});

export const getTokenBalance = async (accountAddress: string): Promise<string> => {
    try {
        const balance = await getBalance({
            contract: tokenContract,
            address: accountAddress
        });

        return balance.displayValue;
    } catch (error) {
        console.error("Error fetching token balance:", error);
        return "0";
    }
};