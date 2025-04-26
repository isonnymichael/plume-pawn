// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

interface IPlumeDummyRWA {
    function getTokenValue(uint256 tokenId) external view returns (uint256);
}

contract PlumePawn is Ownable, IERC721Receiver, ReentrancyGuard {
    IERC20 public immutable pUSD;
    IERC721 public immutable RWA;

    uint256 public totalLiquidity;
    uint256 public totalBorrowed;
    uint256 public LTV = 70; // Loan-to-Value ratio in percentage
    uint256 public APR = 12;  // APR ration in percentage
    uint constant SECONDS_IN_YEAR = 365 * 24 * 60 * 60; // For APR calculation
    uint256 public platformDepositFeeBP = 25; // 0.25%
    uint256 public platformRepaymentFeeBP = 200; // 2%
    uint256 public totalPlatformFeesCollected;

    struct InterestRate {
        uint256 duration;
        uint256 rate;
    }

    InterestRate[] public interestRates;

    struct Loan {
        address borrower;
        uint256 loanId;
        uint256 tokenId;
        uint256 amount;
        uint256 repayAmount;
        uint256 feeAmount;
        uint256 dueDate;
        bool repaid;
        bool overdue;
    }

    Loan[] public loans;
    mapping(address => uint256[]) public userLoans;

    struct DepositInfo {
        uint256 depositId;
        uint256 amount;
        uint256 feeAmount;
        uint256 apr;
        uint256 depositTimestamp;
        uint256 unclaimedReward;
        uint256 lastRewardCalculation;
        bool withdrawn;
    }

    DepositInfo[] public allDeposits;
    mapping(address => uint256[]) public userDeposits;

    event LiquidityAdded(address indexed provider, uint256 amount, uint256 feeAmount);
    event LiquidityWithdrawn(address indexed owner, uint256 amount, uint256 reward);
    event LoanRequested(uint256 indexed loanId, address indexed borrower, uint256 tokenId, uint256 amount);
    event LoanRepaid(uint256 indexed loanId, uint256 feeAmount);
    event LTVUpdated(uint256 newLTV);
    event APRUpdated(uint256 newApr);
    event InterestRateUpdated(uint256 duration, uint256 newRate);
    event PlatformFeeWithdrawn(uint256 amount);

    /**
     * Initializes the contract with the addresses of the pUSD token and 
     * the RWA NFT contract. Also sets up default interest rate options.
     * 
     * @param _pUSD Address of the pUSD ERC20 token contract.
     * @param _RWA Address of the RWA ERC721 token contract.
     *
     * Requirements:
     * - `_pUSD` must not be the zero address.
     * - `_RWA` must not be the zero address.
     */
    constructor(address _pUSD, address _RWA) Ownable(msg.sender) {
        require(_pUSD != address(0), "Invalid pUSD address");
        require(_RWA != address(0), "Invalid RWA address");
        pUSD = IERC20(_pUSD);
        RWA = IERC721(_RWA);

        interestRates.push(InterestRate(30 days, 9));
        interestRates.push(InterestRate(90 days, 12));
        interestRates.push(InterestRate(180 days, 15));
    }

    /**
     * Sets the Loan-to-Value (LTV) ratio for the platform.
     * Can only be called by the contract owner.
     *
     * @param newLTV The new LTV percentage (must be between 1 and 100).
     *
     * Emits an {LTVUpdated} event.
     */
    function setLTV(uint256 newLTV) external onlyOwner {
        require(newLTV > 0 && newLTV <= 100, "Invalid LTV");
        LTV = newLTV;
        emit LTVUpdated(newLTV);
    }

    /**
     * Updates the Annual Percentage Rate (APR) for loans.
     * Can only be called by the contract owner.
     *
     * @param newApr The new APR value (must be greater than 0).
     *
     * Emits an {APRUpdated} event.
     */
    function setAPR(uint256 newApr) external onlyOwner {
        require(newApr > 0, "Invalid APR");
        APR = newApr;
        emit APRUpdated(newApr);
    }

    /**
     * Sets the platform fees for deposits and repayments.
     * Can only be called by the contract owner.
     *
     * @param depositFeeBP Deposit fee in basis points (max 500 = 5%).
     * @param repaymentFeeBP Repayment fee in basis points (max 2000 = 20%).
     */
    function setPlatformFees(uint256 depositFeeBP, uint256 repaymentFeeBP) external onlyOwner {
        require(depositFeeBP <= 500, "Max 5%");
        require(repaymentFeeBP <= 2000, "Max 20%");

        platformDepositFeeBP = depositFeeBP;
        platformRepaymentFeeBP = repaymentFeeBP;
    }

    /**
     * Updates or adds an interest rate based on loan duration.
     * If the duration exists, the rate is updated; otherwise, a new entry is added.
     * Only callable by the contract owner.
     *
     * @param duration Loan duration in seconds.
     * @param rate Interest rate percentage for the given duration.
     *
     * Emits an {InterestRateUpdated} event.
     */
    function setInterestRate(uint256 duration, uint256 rate) external onlyOwner {
        require(rate > 0, "Invalid rate");
        bool updated = false;
        for (uint256 i = 0; i < interestRates.length; i++) {
            if (interestRates[i].duration == duration) {
                interestRates[i].rate = rate;
                updated = true;
                break;
            }
        }
        if (!updated) {
            interestRates.push(InterestRate(duration, rate));
        }
        emit InterestRateUpdated(duration, rate);
    }

    /**
     * Returns the interest rate associated with a given loan duration.
     * Reverts if the duration is not supported.
     *
     * @param duration Loan duration in seconds.
     * @return Interest rate percentage for the specified duration.
     */
    function getInterestRate(uint256 duration) public view returns (uint256) {
        for (uint256 i = 0; i < interestRates.length; i++) {
            if (interestRates[i].duration == duration) {
                return interestRates[i].rate;
            }
        }
        revert("Duration not supported");
    }

    /**
     * Returns an array of all supported loan durations.
     *
     * @return Array of loan durations in seconds.
     */
    function getAllDurations() external view returns (uint256[] memory) {
        uint256[] memory durations = new uint256[](interestRates.length);
        for (uint256 i = 0; i < interestRates.length; i++) {
            durations[i] = interestRates[i].duration;
        }
        return durations;
    }

    /**
     * Allows users to add liquidity in pUSD to the platform.
     * A deposit fee is deducted and recorded. The net amount is stored
     * along with deposit metadata. Rewards are tracked per deposit.
     *
     * @param amount The total amount of pUSD to deposit (must be > 0).
     *
     * Emits a {LiquidityAdded} event.
     */
    function addLiquidity(uint256 amount) external nonReentrant {
        require(amount > 0, "Amount must be > 0");
        
        uint256 feeAmount = (amount * platformDepositFeeBP) / 10000;
        uint256 depositAmount = amount - feeAmount;

        bool success = pUSD.transferFrom(msg.sender, address(this), amount);
        require(success, "Transfer failed");
        
        totalPlatformFeesCollected += feeAmount;

        uint256 depositId = allDeposits.length;
        
        allDeposits.push(DepositInfo({
            depositId: depositId,
            amount: depositAmount,
            feeAmount: feeAmount,
            apr: APR,
            depositTimestamp: block.timestamp,
            unclaimedReward: 0,
            lastRewardCalculation: block.timestamp,
            withdrawn: false
        }));

        userDeposits[msg.sender].push(depositId);
        
        totalLiquidity += depositAmount;
        emit LiquidityAdded(msg.sender, depositAmount, feeAmount);
    }

    /**
     * Withdraws a specific deposit along with its unclaimed rewards.
     * Validates ownership and withdrawal status, updates rewards,
     * and transfers the total amount to the user.
     *
     * @param depositId ID of the deposit to withdraw.
     *
     * Emits a {LiquidityWithdrawn} event.
     */
    function withdrawLiquidity(uint256 depositId) external nonReentrant {
        require(depositId < allDeposits.length, "Invalid deposit ID");
        DepositInfo storage deposit = allDeposits[depositId];
        require(!deposit.withdrawn, "Already withdrawn");
        
        _updateReward(deposit);
        
        uint256 totalAmount = deposit.amount + deposit.unclaimedReward;
        require(totalAmount <= totalLiquidity, "Insufficient liquidity");
        
        bool success = pUSD.transfer(msg.sender, totalAmount);
        require(success, "Transfer failed");
        
        deposit.withdrawn = true;
        totalLiquidity -= totalAmount;
        
        emit LiquidityWithdrawn(msg.sender, deposit.amount, deposit.unclaimedReward);
    }

    /**
     * Updates the unclaimed reward for a given deposit based on
     * the time elapsed since the last reward calculation.
     *
     * @param deposit Reference to the DepositInfo struct to update.
     */
    function _updateReward(DepositInfo storage deposit) internal {
        uint256 timeElapsed = block.timestamp - deposit.lastRewardCalculation;
        if (timeElapsed > 0) {
            uint256 additionalReward = (deposit.amount * deposit.apr * timeElapsed) / (SECONDS_IN_YEAR * 100);
            deposit.unclaimedReward += additionalReward;
            deposit.lastRewardCalculation = block.timestamp;
        }
    }

    /**
     * Returns the total unclaimed reward for a specific deposit,
     * including any rewards accumulated since the last calculation.
     * Returns 0 if the deposit has been withdrawn.
     *
     * @param depositId ID of the deposit.
     * @return Total unclaimed reward in pUSD.
     */
    function getUnclaimedReward(uint256 depositId) public view returns (uint256) {
        require(depositId < allDeposits.length, "Invalid deposit ID");
        DepositInfo storage deposit = allDeposits[depositId];
        
        if (deposit.withdrawn) {
            return 0;
        }
        
        uint256 timeElapsed = block.timestamp - deposit.lastRewardCalculation;
        uint256 additionalReward = (deposit.amount * deposit.apr * timeElapsed) / (SECONDS_IN_YEAR * 100);
        return deposit.unclaimedReward + additionalReward;
    }

    /**
     * Allows users to request a loan by pledging an RWA token as collateral.
     * The loan amount is based on the token's value and the platform's LTV.
     * The loan is transferred in pUSD, and the token is held as collateral.
     * 
     * @param tokenId ID of the RWA token being used as collateral.
     * @param duration Loan duration in seconds.
     *
     * Emits a {LoanRequested} event.
     */
    function requestLoan(uint256 tokenId, uint256 duration) external nonReentrant {
        require(RWA.ownerOf(tokenId) == msg.sender, "Not token owner");

        uint256 interest = getInterestRate(duration);

        uint256 value = IPlumeDummyRWA(address(RWA)).getTokenValue(tokenId);
        require(value > 0, "Invalid token value");

        uint256 loanAmount = (value * LTV) / 100;
        require(totalLiquidity >= loanAmount, "Insufficient liquidity");

        uint256 repayAmount = loanAmount + ((loanAmount * interest) / 100);
        uint256 feeAmount = (repayAmount * platformRepaymentFeeBP) / 10000;

        RWA.safeTransferFrom(msg.sender, address(this), tokenId);
        bool success = pUSD.transfer(msg.sender, loanAmount);
        require(success, "Loan transfer failed");

        uint256 loanId = loans.length;

        loans.push(Loan({
            borrower: msg.sender,
            loanId: loanId,
            tokenId: tokenId,
            amount: loanAmount,
            repayAmount: repayAmount,
            feeAmount: feeAmount,
            dueDate: block.timestamp + duration,
            repaid: false,
            overdue: false
        }));

        userLoans[msg.sender].push(loanId);

        totalBorrowed += loanAmount;
        totalLiquidity -= loanAmount;

        emit LoanRequested(loanId, msg.sender, tokenId, loanAmount);
    }

    /**
     * Allows the borrower to repay the loan along with applicable fees.
     * If successful, the collateral RWA token is returned and the loan is marked as repaid.
     * 
     * @param loanId ID of the loan to be repaid.
     *
     * Emits a {LoanRepaid} event.
     */
    function repayLoan(uint256 loanId) external nonReentrant {
        Loan storage loan = loans[loanId];
        require(msg.sender == loan.borrower, "Not borrower");
        require(!loan.repaid, "Loan resolved");
        require(block.timestamp <= loan.dueDate, "Loan overdue");

        bool success = pUSD.transferFrom(msg.sender, address(this), loan.repayAmount);
        require(success, "Repayment failed");

        totalPlatformFeesCollected += loan.feeAmount;
        
        RWA.safeTransferFrom(address(this), msg.sender, loan.tokenId);

        loan.repaid = true;
        totalBorrowed -= loan.amount;
        totalLiquidity += (loan.repayAmount - loan.feeAmount);

        emit LoanRepaid(loanId, loan.feeAmount);
    }

    /**
     * Allows the contract owner to withdraw accumulated platform fees in pUSD.
     * 
     * Emits a {PlatformFeeWithdrawn} event.
     */
    function withdrawPlatformFees() external onlyOwner nonReentrant {
        require(totalPlatformFeesCollected > 0, "No fees to withdraw");
        uint256 amount = totalPlatformFeesCollected;
        totalPlatformFeesCollected = 0;
        
        bool success = pUSD.transfer(msg.sender, amount);
        require(success, "Transfer failed");
        
        emit PlatformFeeWithdrawn(amount);
    }

    /**
     * Returns a list of loans associated with a specific user.
     * 
     * @param user Address of the user whose loans are to be retrieved.
     * @return Array of Loan structs associated with the user.
     */
    function getLoansByUser(address user) external view returns (Loan[] memory) {
        uint256[] memory ids = userLoans[user];
        Loan[] memory result = new Loan[](ids.length);
        
        for (uint256 i = 0; i < ids.length; i++) {
            Loan storage loan = loans[ids[i]];
            
            result[i] = Loan({
                borrower: loan.borrower,
                loanId: loan.loanId,
                tokenId: loan.tokenId,
                amount: loan.amount,
                repayAmount: loan.repayAmount,
                feeAmount: loan.feeAmount,
                dueDate: loan.dueDate,
                repaid: loan.repaid,
                overdue: !loan.repaid && block.timestamp > loan.dueDate
            });
        }
        
        return result;
    }

    /**
     * Returns a list of deposits associated with a specific user.
     * 
     * @param user Address of the user whose deposits are to be retrieved.
     * @return Array of DepositInfo structs associated with the user.
     */
    function getDepositsByUser(address user) external view returns (DepositInfo[] memory) {
        uint256[] memory ids = userDeposits[user];
        DepositInfo[] memory result = new DepositInfo[](ids.length);
        
        for (uint256 i = 0; i < ids.length; i++) {
            DepositInfo memory deposit = allDeposits[ids[i]];
            
            // Calculate unclaimed reward if deposit is not withdrawn
            if (!deposit.withdrawn) {
                uint256 timeElapsed = block.timestamp - deposit.lastRewardCalculation;
                uint256 additionalReward = (deposit.amount * deposit.apr * timeElapsed) / (SECONDS_IN_YEAR * 100);
                deposit.unclaimedReward += additionalReward;
            }
            
            result[i] = deposit;
        }
        
        return result;
    }

    function onERC721Received(
        address,
        address,
        uint256,
        bytes calldata
    ) external pure override returns (bytes4) {
        return this.onERC721Received.selector;
    }
}
