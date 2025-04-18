import { expect } from "chai"
import hre from "hardhat"

describe("Pawn", () => {
  it("should deploy the Pawn contract", async () => {
    const [owner] = await hre.ethers.getSigners()
    const Pawn = await hre.ethers.getContractFactory("Pawn")
    const pawn = await Pawn.deploy()

    expect(await pawn.getAddress()).to.properAddress
  })
})
