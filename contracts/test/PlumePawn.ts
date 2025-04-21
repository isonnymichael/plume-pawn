// test/PlumePawn.ts
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
  
    const MockPUSD = await hre.ethers.getContractFactory("MockERC20");
    mockPUSD = await MockPUSD.connect(owner).deploy("Plume USD", "pUSD", 18);
    await mockPUSD.waitForDeployment();

    await mockPUSD.mint(user.address, parseUnits("1000000", 18));

    const MockRWA = await hre.ethers.getContractFactory("PlumeDummyRWA");
    mockRWA = await MockRWA.connect(owner).deploy();
    await mockRWA.waitForDeployment();

    await mockRWA.mint(user.address, parseUnits("1000", 18));

    const PlumePawn = await hre.ethers.getContractFactory("PlumePawn");
    pawn = await PlumePawn.connect(owner).deploy(
      await mockPUSD.getAddress(),
      await mockRWA.getAddress()
    );
    await pawn.waitForDeployment();

    const pawnAddress = await pawn.getAddress();

    await mockRWA.connect(user).approve(pawnAddress, 1);

    await mockPUSD.connect(user).approve(pawnAddress, parseUnits("1000000", 18));
  });  

  it("should return all interest durations", async function () {
    const durations = await pawn.getAllDurations();
    const durationNums = durations.map((d: bigint) => Number(d));

    console.log("Durations: ", durationNums);
  
    expect(durationNums).to.include.members([
      30 * 24 * 60 * 60,
      90 * 24 * 60 * 60,
      180 * 24 * 60 * 60,
    ]);
  });

  it("should return the correct Loan-to-Value (LTV) ratio", async function () {
    const ltv = await pawn.LTV();
    console.log("LTV:", ltv.toString());
    expect(ltv).to.be.greaterThan(0);
    expect(ltv).to.be.lte(100);
  });
  
  it("should allow adding liquidity", async function () {
    const pawnAddress = await pawn.getAddress();
  
    console.log("User address:", user.address);
    console.log("Pawn contract address:", pawnAddress);
    console.log("Amount to add as liquidity:", SMALL_AMOUNT.toString());
  
    await mockPUSD.connect(user).approve(pawnAddress, SMALL_AMOUNT);
  
    await expect(pawn.connect(user).addLiquidity(SMALL_AMOUNT))
      .to.emit(pawn, "LiquidityAdded")
      .withArgs(user.address, SMALL_AMOUNT);
  });

  // TODO: update add liquidity berdasrkan update SC

  // TODO: tambahkan test withdraw liquidity berdasrkan liquidity provider + APRnya
  
  it("should allow requesting and repaying a loan", async function () {
    const pawnAddress = await pawn.getAddress();
    console.log("Pawn contract address:", pawnAddress);
  
    const liquidityAmount = parseUnits("10000", 18);
    await mockPUSD.connect(user).approve(pawnAddress, liquidityAmount);
    await pawn.connect(user).addLiquidity(liquidityAmount);
    console.log("Liquidity added:", liquidityAmount.toString());
  
    const duration = 30 * 24 * 60 * 60;
    console.log("Requesting loan with duration:", duration);
    await pawn.connect(user).requestLoan(tokenId, duration);
  
    const loans = await pawn.getLoansByUser(user.address);
    console.log("Loans after requesting:", loans);
    expect(loans.length).to.eq(1);
  
    const repayAmount = loans[0].repayAmount;
    console.log("Repay amount:", repayAmount.toString());
  
    await mockPUSD.mint(user.address, repayAmount);
    await mockPUSD.connect(user).approve(pawnAddress, repayAmount);
  
    await pawn.connect(user).repayLoan(0);
  
    const updatedLoan = await pawn.getLoansByUser(user.address);
    console.log("Loan after repayment:", updatedLoan[0]);
    expect(updatedLoan[0].repaid).to.eq(true);
  });  

  // TODO: tambahkan repay liquidated / sudah kadaluarsa, harusnya otomatis dari blockchain bukan? tidak trigger manual

  it("should calculate APR for liquidity providers", async function () {
    const liquidityAmount = parseUnits("13570", 18);
    await mockPUSD.connect(user).approve(pawn.getAddress(), liquidityAmount);
    await pawn.connect(user).addLiquidity(liquidityAmount);
    
    const duration = 30 * 24 * 60 * 60;
    console.log("Requesting loan with duration:", duration);
    await pawn.connect(user).requestLoan(tokenId, duration);
  
    const totalLiquidity = await pawn.totalLiquidity();
    const totalBorrowed = await pawn.totalBorrowed();

    console.log("Total Liquidity:", totalLiquidity.toString());
    console.log("Total Borrowed:", totalBorrowed.toString());
    
    const totalBorrowedBigInt = BigInt(totalBorrowed.toString());
    const totalLiquidityBigInt = BigInt(totalLiquidity.toString());
  
    const aprScaled = (totalBorrowedBigInt * 10000n) / totalLiquidityBigInt;

    const aprWhole = aprScaled / 100n;
    const aprDecimal = aprScaled % 100n;
    const aprFormatted = `${aprWhole}.${aprDecimal.toString().padStart(2, '0')}%`;
    const aprNumeric = parseFloat(aprFormatted.replace("%", ""));

    console.log("Current APR (percentage):", aprFormatted);
    
    expect(aprNumeric).to.be.gt(0);
    expect(aprNumeric).to.be.lt(100);
  });
  
});
