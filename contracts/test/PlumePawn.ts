import { expect } from "chai";
import { parseUnits } from "ethers";
import hre from "hardhat"
import { time } from "@nomicfoundation/hardhat-network-helpers";

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

    await mockRWA.connect(user).approve(pawnAddress, tokenId);
    await mockPUSD.connect(user).approve(pawnAddress, parseUnits("1000000", 18));
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

  it("should return the correct Loan-to-Value (LTV) ratio", async function () {
    const ltv = await pawn.LTV();
    expect(ltv).to.equal(70); // Default LTV is 70%
  });
  
  it("should add liquidity with fee deduction", async function () {
    const amount = parseUnits("100", 18);
    const expectedFee = amount * 25n / 10000n; // 0.25% fee
    const expectedDeposit = amount - expectedFee;

    await expect(pawn.connect(user).addLiquidity(amount))
      .to.emit(pawn, "LiquidityAdded")
      .withArgs(user.address, expectedDeposit, expectedFee);

    // Check platform fees collected
    const fees = await pawn.totalPlatformFeesCollected();
    expect(fees).to.equal(expectedFee);

    // Check user deposit
    const deposits = await pawn.getDepositsByUser(user.address);
    expect(deposits[0].amount).to.equal(expectedDeposit);
    expect(deposits[0].feeAmount).to.equal(expectedFee);
  });

  it("should allow withdrawing liquidity with rewards", async function () {
      // Add large initial liquidity to ensure enough funds
      const largeAmount = parseUnits("10000", 18);
      await mockPUSD.mint(user.address, largeAmount);
      await mockPUSD.connect(user).approve(await pawn.getAddress(), largeAmount);
      await pawn.connect(user).addLiquidity(largeAmount);

      // Add test liquidity
      const amount = parseUnits("1000", 18);
      await mockPUSD.mint(user.address, amount);
      await mockPUSD.connect(user).approve(await pawn.getAddress(), amount);
      await pawn.connect(user).addLiquidity(amount);

      // Fast forward 30 days
      await time.increase(30 * 24 * 60 * 60);

      // Get exact reward amount
      const depositId = (await pawn.getDepositsByUser(user.address)).length - 1;
      const reward = await pawn.getUnclaimedReward(depositId);

      // Ensure contract has enough funds (original amount + reward)
      const deposit = (await pawn.getDepositsByUser(user.address))[depositId];
      const required = deposit.amount + reward;
      const contractBalance = await mockPUSD.balanceOf(await pawn.getAddress());
      
      if (contractBalance < required) {
          const needed = required.sub(contractBalance);
          await mockPUSD.mint(await pawn.getAddress(), needed);
      }

      // Withdraw
      await pawn.connect(user).withdrawLiquidity(depositId);

      // Verify
      const updatedDeposit = (await pawn.getDepositsByUser(user.address))[depositId];
      expect(updatedDeposit.withdrawn).to.be.true;
  });

  it("should calculate correct unclaimed rewards", async function () {
    const amount = parseUnits("5000", 18);
    await pawn.connect(user).addLiquidity(amount);

    // Check initial reward (should be 0)
    let reward = await pawn.getUnclaimedReward(0);
    expect(reward).to.equal(0);

    // Fast forward 1 year
    await time.increase(365 * 24 * 60 * 60);

    // Check reward after 1 year (12% APR)
    reward = await pawn.getUnclaimedReward(0);
    const expectedReward = amount * 12n / 100n;
    expect(reward).to.be.closeTo(expectedReward, expectedReward / 100n); // 1% tolerance
  });

  it("should request and repay loan with fee", async function () {
    // Add liquidity first
    await pawn.connect(user).addLiquidity(parseUnits("10000", 18));
  
    // Request loan
    const duration = 30 * 24 * 60 * 60;
    await pawn.connect(user).requestLoan(tokenId, duration);
  
    // Check loan details
    const loans = await pawn.getLoansByUser(user.address);
    const loan = loans[0];
    expect(loan.feeAmount > 0n).to.be.true;
  
    // Mint and approve repayment amount
    const repayAmount = loan.repayAmount;
    await mockPUSD.mint(user.address, repayAmount);
    await mockPUSD.connect(user).approve(await pawn.getAddress(), repayAmount);
  
    // Get platform fees before repayment
    const prevFees = await pawn.totalPlatformFeesCollected();
  
    // Repay the loan
    await expect(pawn.connect(user).repayLoan(0))
      .to.emit(pawn, "LoanRepaid")
      .withArgs(0, loan.feeAmount);
  
    // Get platform fees after repayment
    const afterFees = await pawn.totalPlatformFeesCollected();
    const feeDiff = afterFees - prevFees;
  
    // Assert that fee was collected
    expect(feeDiff).to.equal(loan.feeAmount);
  });

  it("should handle expired loans automatically", async function () {
    // Add liquidity and request loan
    await pawn.connect(user).addLiquidity(parseUnits("10000", 18));
    const duration = 30 * 24 * 60 * 60;
    await pawn.connect(user).requestLoan(tokenId, duration);

    // Fast forward past due date
    await time.increase(duration + 1);

    // Check loan status
    const loan = (await pawn.getLoansByUser(user.address))[0];
    expect(loan.repaid).to.be.false;

    // NFT should remain in contract ownership
    const nftOwner = await mockRWA.ownerOf(tokenId);
    expect(nftOwner).to.equal(await pawn.getAddress());
  });

  it("should allow owner to withdraw platform fees", async function () {
    // Generate some fees
    await pawn.connect(user).addLiquidity(parseUnits("1000", 18));
    const initialFees = await pawn.totalPlatformFeesCollected();

    // Withdraw fees
    await expect(pawn.connect(owner).withdrawPlatformFees())
      .to.emit(pawn, "PlatformFeeWithdrawn")
      .withArgs(initialFees);

    // Check fees are reset
    const remainingFees = await pawn.totalPlatformFeesCollected();
    expect(remainingFees).to.equal(0);
  });
});