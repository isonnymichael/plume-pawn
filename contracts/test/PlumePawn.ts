// test/PlumePawn.ts
import { ethers } from "hardhat";
import { expect } from "chai";
import { parseUnits } from "ethers";
import hre from "hardhat"

const SMALL_AMOUNT = parseUnits("0.1", 18);

describe("PlumePawn", function () {
  let pawn: any;
  let mockRWA: any;
  let mockPUSD: any;
  let owner: any;
  let user: any;
  let tokenId = 1;

  beforeEach(async function () {
    [owner, user] = await hre.ethers.getSigners(); 
  
    // Deploy Mock pUSD
    const MockPUSD = await hre.ethers.getContractFactory("MockERC20");
    mockPUSD = await MockPUSD.connect(owner).deploy("Plume USD", "pUSD", 18);
    await mockPUSD.waitForDeployment();

    await mockPUSD.mint(user.address, parseUnits("1000", 18));

    // Deploy Mock RWA
    const MockRWA = await hre.ethers.getContractFactory("PlumeDummyRWA");
    mockRWA = await MockRWA.connect(owner).deploy();
    await mockRWA.waitForDeployment();

    await mockRWA.mint(user.address, 1);

    const PlumePawn = await hre.ethers.getContractFactory("PlumePawn");
    pawn = await PlumePawn.connect(owner).deploy(
      await mockPUSD.getAddress(),
      await mockRWA.getAddress()
    );
    await pawn.waitForDeployment();

    const pawnAddress = await pawn.getAddress();
    const mockRWAAddress = await mockRWA.getAddress();
    const mockPUSDAddress = await mockPUSD.getAddress();

    // Approve RWA NFT
    await mockRWA.connect(user).approve(pawnAddress, 1);

    // Approve pUSD token
    await mockPUSD.connect(user).approve(pawnAddress, parseUnits("1000", 18));
  });  

  it("should return all interest durations", async function () {
    const durations = await pawn.getAllDurations();
    const durationNums = durations.map((d: bigint) => Number(d));
  
    expect(durationNums).to.include.members([
      30 * 24 * 60 * 60,
      90 * 24 * 60 * 60,
      180 * 24 * 60 * 60,
    ]);
  });

  it("should return total liquidity (TVL)", async function () {
    await mockPUSD.connect(user).approve(pawn.getAddress(), SMALL_AMOUNT);
    await pawn.connect(user).addLiquidity(SMALL_AMOUNT);
    const tvl = await pawn.totalLiquidity();
    expect(tvl).to.equal(SMALL_AMOUNT);
  });

  it("should allow adding liquidity", async function () {
    await mockPUSD.connect(user).approve(pawn.getAddress(), SMALL_AMOUNT);
    await expect(pawn.connect(user).addLiquidity(SMALL_AMOUNT))
      .to.emit(pawn, "LiquidityAdded")
      .withArgs(user.address, SMALL_AMOUNT);
  });

  it("should return total value locked (TVL) and APR correctly", async function () {
    await mockPUSD.connect(user).approve(pawn.getAddress(), SMALL_AMOUNT);
    await pawn.connect(user).addLiquidity(SMALL_AMOUNT);

    const tvl = await pawn.totalLiquidity();
    expect(tvl).to.equal(SMALL_AMOUNT);

    const durations = await pawn.getAllDurations();
    for (let d of durations) {
      const apr = await pawn.getInterestRate(d);
      expect(Number(apr)).to.be.greaterThan(0);
    }
  });

  it("should allow requesting and repaying a loan", async function () {
    await mockPUSD.connect(user).approve(pawn.getAddress(), SMALL_AMOUNT * 10n);
    await pawn.connect(user).addLiquidity(SMALL_AMOUNT * 10n);

    const duration = 30 * 24 * 60 * 60;
    await pawn.connect(user).requestLoan(tokenId, duration);
    const loans = await pawn.getLoansByUser(user.address);
    expect(loans.length).to.eq(1);

    const repayAmount = loans[0].repayAmount;
    await mockPUSD.mint(user.address, repayAmount);
    await mockPUSD.connect(user).approve(pawn.getAddress(), repayAmount);

    await pawn.connect(user).repayLoan(0);
    const updatedLoan = await pawn.getLoansByUser(user.address);
    expect(updatedLoan[0].repaid).to.eq(true);
  });

});
