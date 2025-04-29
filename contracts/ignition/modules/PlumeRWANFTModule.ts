import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const PlumeRWANFTModule = buildModule("PlumeRWANFTModule", (m) => {
  const plumeRWANFT = m.contract("PlumeRWANFT");

  return { plumeRWANFT };
});

export default PlumeRWANFTModule;
