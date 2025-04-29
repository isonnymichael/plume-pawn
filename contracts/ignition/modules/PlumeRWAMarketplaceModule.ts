import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const PLUME_PUSD_ADDRESS = "0x1E0E030AbCb4f07de629DCCEa458a271e0E82624";

const PlumeRWAMarketplaceModule = buildModule("PlumeRWAMarketplaceModule", (m) => {
  const plumeRWAMarketplace = m.contract("PlumeRWAMarketplace", [PLUME_PUSD_ADDRESS]);

  return { plumeRWAMarketplace };
});

export default PlumeRWAMarketplaceModule;
