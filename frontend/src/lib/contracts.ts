import { getContract, prepareContractCall, readContract, sendTransaction, waitForReceipt } from "thirdweb";
import { plumeTestnet } from './chain';
import { thirdWebClient } from './client';
import { parseUnits } from "ethers";
import { PrepareLiquidityArgs } from '../types/deposit';

const pawnContractAddress = "0xAeC5e1c78a8726634Ad1C3c45C59bbC4f1Fd5c22";
const tokenContractAddress = "0x1E0E030AbCb4f07de629DCCEa458a271e0E82624"; 

export const plumePawnContract = getContract({
    client: thirdWebClient,
    address: pawnContractAddress,
    chain: plumeTestnet,
});

const tokenContract = getContract({
    client: thirdWebClient,
    address: tokenContractAddress,
    chain: plumeTestnet,
});

export async function ensureAllowanceThenAddLiquidity({
    amount,
    account,
  }: PrepareLiquidityArgs & { account: any }) {
    const parsedAmount = parseUnits(amount.toString(), 6);
  
    const allowance = await readContract({
      contract: tokenContract,
      method: "function allowance(address owner, address spender) view returns (uint256)",
      params: [account.address, pawnContractAddress],
    }) as bigint;
  
    if (allowance < parsedAmount) {
  
      const approveTx = await prepareContractCall({
        contract: tokenContract,
        method: "function approve(address spender, uint256 amount)",
        params: [pawnContractAddress, parsedAmount],
      });
  
      const { transactionHash } = await sendTransaction({
        account,
        transaction: approveTx,
      });
  
      await waitForReceipt({
        client: thirdWebClient,
        chain: plumeTestnet,
        transactionHash,
      });
    }
  
    return await prepareContractCall({
      contract: plumePawnContract,
      method: "function addLiquidity(uint256 amount)",
      params: [parsedAmount],
    });
}
  