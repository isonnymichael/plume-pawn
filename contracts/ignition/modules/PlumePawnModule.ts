import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const PLUME_PUSD_ADDRESS = "0x1E0E030AbCb4f07de629DCCEa458a271e0E82624";

const PlumePawnModule = buildModule("PlumePawnModule", (m) => {
  const dummyRWA = m.contract("PlumeDummyRWA");
  const pawn = m.contract("PlumePawn", [PLUME_PUSD_ADDRESS, dummyRWA]);

  return { dummyRWA, pawn };
});

export default PlumePawnModule;
