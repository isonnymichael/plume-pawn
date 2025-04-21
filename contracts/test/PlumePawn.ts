// test/PlumePawn.ts
import { ethers } from "hardhat";
import { expect } from "chai";
import { parseUnits } from "ethers";

const ONE_PUSD = parseUnits("1", 18);
const SMALL_AMOUNT = parseUnits("0.1", 18);
const PLUME_PUSD_ADDRESS = "0x1E0E030AbCb4f07de629DCCEa458a271e0E82624";

describe("PlumePawn", function () {
  let pawn: any;
  let mockRWA: any;
  let pUSD: any;
  let owner: any;
  let user: any;
  let tokenId = 1;

  beforeEach(async function () {
    [owner, user] = await ethers.getSigners();

    pUSD = await ethers.getContractAt("IERC20", PLUME_PUSD_ADDRESS);

    const MockRWA = await ethers.getContractFactory("PlumeDummyRWA");
    mockRWA = await MockRWA.deploy();
    await mockRWA.mint(user.address, tokenId);
    await mockRWA.setTokenValue(tokenId, parseUnits("1", 18));

    const PlumePawn = await ethers.getContractFactory("PlumePawn");
    pawn = await PlumePawn.deploy(PLUME_PUSD_ADDRESS, mockRWA.address);

    await pUSD.connect(user).approve(pawn.address, ONE_PUSD);
    await mockRWA.connect(user).approve(pawn.address, tokenId);
  });

  it("should return all interest durations", async function () {
    const durations = await pawn.getAllDurations();
    expect(durations.map((d: any) => d.toNumber())).to.include.members([
      30 * 24 * 60 * 60,
      90 * 24 * 60 * 60,
      180 * 24 * 60 * 60,
    ]);
  });

  it("should return total liquidity (TVL)", async function () {
    await pUSD.connect(user).approve(pawn.address, SMALL_AMOUNT);
    await pawn.connect(user).addLiquidity(SMALL_AMOUNT);
    const tvl = await pawn.totalLiquidity();
    expect(tvl).to.equal(SMALL_AMOUNT);
  });

  it("should allow adding liquidity", async function () {
    await pUSD.connect(user).approve(pawn.address, SMALL_AMOUNT);
    await expect(pawn.connect(user).addLiquidity(SMALL_AMOUNT))
      .to.emit(pawn, "LiquidityAdded")
      .withArgs(user.address, SMALL_AMOUNT);
  });

  it("should return total value locked (TVL) and APR correctly", async function () {
    await pUSD.connect(user).approve(pawn.address, SMALL_AMOUNT);
    await pawn.connect(user).addLiquidity(SMALL_AMOUNT);

    const tvl = await pawn.totalLiquidity();
    expect(tvl).to.equal(SMALL_AMOUNT);

    const durations = await pawn.getAllDurations();
    for (let d of durations) {
      const apr = await pawn.getInterestRate(d);
      expect(apr.toNumber()).to.be.greaterThan(0);
    }
  });

  it("should allow requesting and repaying a loan", async function () {
    await pUSD.connect(user).approve(pawn.address, SMALL_AMOUNT * 10n);
    await pawn.connect(user).addLiquidity(SMALL_AMOUNT * 10n);

    const duration = 30 * 24 * 60 * 60;
    await pawn.connect(user).requestLoan(tokenId, duration);
    const loans = await pawn.getLoansByUser(user.address);
    expect(loans.length).to.eq(1);

    const repayAmount = loans[0].repayAmount;
    await pUSD.mint(user.address, repayAmount);
    await pUSD.connect(user).approve(pawn.address, repayAmount);

    await pawn.connect(user).repayLoan(0);
    const updatedLoan = await pawn.getLoansByUser(user.address);
    expect(updatedLoan[0].repaid).to.eq(true);
  });

});
