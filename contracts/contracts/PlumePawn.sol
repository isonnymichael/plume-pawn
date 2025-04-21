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

// TODO: update deposit info karena menambahkan fee amount
// TODO: update add liquidity karena menggunakan history per deposit
// TODO: menambahkan fungsi withdraw liquidty pada liquidity providernya / depositinfo + apr unclaimedReward yang didapatkan.
// TODO: update loan karena menambahkan fee amount
// TODO: nambah platform fee ketika melakukan repay dengan transfer ke address
// TODO: nambah platform fee ketika add liquidity / deposit
// TODO: tambah fungsi owner withdraw fee

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
        uint256 tokenId;
        uint256 amount;
        uint256 repayAmount;
        uint256 feeAmount;
        uint256 dueDate;
        bool repaid;
        bool liquidated;
    }

    Loan[] public loans;
    mapping(address => uint256[]) public userLoans;

    struct DepositInfo {
        uint256 amount;
        uint256 feeAmount;
        uint256 apr;
        uint256 depositTimestamp;
        uint256 unclaimedReward;
        bool withdrawn;
    }

    DepositInfo[] public allDeposits;
    mapping(address => uint256[]) public userDeposits;

    event LiquidityAdded(address indexed provider, uint256 amount);
    event LiquidityWithdrawn(address indexed owner, uint256 amount);
    event LoanRequested(uint256 indexed loanId, address indexed borrower, uint256 tokenId, uint256 amount);
    event LoanRepaid(uint256 indexed loanId);
    event LoanLiquidated(uint256 indexed loanId);
    event LTVUpdated(uint256 newLTV);
    event APRUpdated(uint256 newApr);
    event InterestRateUpdated(uint256 duration, uint256 newRate);

    constructor(address _pUSD, address _RWA) Ownable(msg.sender) {
        require(_pUSD != address(0), "Invalid pUSD address");
        require(_RWA != address(0), "Invalid RWA address");
        pUSD = IERC20(_pUSD);
        RWA = IERC721(_RWA);

        interestRates.push(InterestRate(30 days, 9));
        interestRates.push(InterestRate(90 days, 12));
        interestRates.push(InterestRate(180 days, 15));
    }

    function setLTV(uint256 newLTV) external onlyOwner {
        require(newLTV > 0 && newLTV <= 100, "Invalid LTV");
        LTV = newLTV;
        emit LTVUpdated(newLTV);
    }

    function setAPR(uint256 newApr) external onlyOwner {
        require(newApr > 0, "Invalid APR");
        APR = newApr;
        emit APRUpdated(newApr);
    }

    function setPlatformFees(uint256 depositFeeBP, uint256 repaymentFeeBP) external onlyOwner {
        require(depositFeeBP <= 500, "Max 5%");
        require(repaymentFeeBP <= 2000, "Max 20%");

        platformDepositFeeBP = depositFeeBP;
        platformRepaymentFeeBP = repaymentFeeBP;
    }

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

    function getInterestRate(uint256 duration) public view returns (uint256) {
        for (uint256 i = 0; i < interestRates.length; i++) {
            if (interestRates[i].duration == duration) {
                return interestRates[i].rate;
            }
        }
        revert("Duration not supported");
    }

    function getAllDurations() external view returns (uint256[] memory) {
        uint256[] memory durations = new uint256[](interestRates.length);
        for (uint256 i = 0; i < interestRates.length; i++) {
            durations[i] = interestRates[i].duration;
        }
        return durations;
    }

    function addLiquidity(uint256 amount) external nonReentrant {
        require(amount > 0, "Amount must be > 0");
        bool success = pUSD.transferFrom(msg.sender, address(this), amount);
        require(success, "Transfer failed");
        totalLiquidity += amount;
        emit LiquidityAdded(msg.sender, amount);
    }

    function requestLoan(uint256 tokenId, uint256 duration) external nonReentrant {
        require(RWA.ownerOf(tokenId) == msg.sender, "Not token owner");

        uint256 interest = getInterestRate(duration);

        uint256 value = IPlumeDummyRWA(address(RWA)).getTokenValue(tokenId);
        require(value > 0, "Invalid token value");

        uint256 loanAmount = (value * LTV) / 100;
        require(totalLiquidity >= loanAmount, "Insufficient liquidity");

        uint256 repayAmount = loanAmount + ((loanAmount * interest) / 100);

        RWA.safeTransferFrom(msg.sender, address(this), tokenId);
        bool success = pUSD.transfer(msg.sender, loanAmount);
        require(success, "Loan transfer failed");

        loans.push(Loan({
            borrower: msg.sender,
            tokenId: tokenId,
            amount: loanAmount,
            repayAmount: repayAmount,
            dueDate: block.timestamp + duration,
            repaid: false,
            liquidated: false
        }));

        uint256 loanId = loans.length - 1;
        userLoans[msg.sender].push(loanId);

        totalBorrowed += loanAmount;
        totalLiquidity -= loanAmount;

        emit LoanRequested(loanId, msg.sender, tokenId, loanAmount);
    }

    function repayLoan(uint256 loanId) external nonReentrant {
        Loan storage loan = loans[loanId];
        require(msg.sender == loan.borrower, "Not borrower");
        require(!loan.repaid && !loan.liquidated, "Loan resolved");
        require(block.timestamp <= loan.dueDate, "Loan overdue");

        bool success = pUSD.transferFrom(msg.sender, address(this), loan.repayAmount);
        require(success, "Repayment failed");

        RWA.safeTransferFrom(address(this), msg.sender, loan.tokenId);

        loan.repaid = true;
        totalBorrowed -= loan.amount;
        totalLiquidity += loan.repayAmount;

        emit LoanRepaid(loanId);
    }

    function liquidateLoan(uint256 loanId) external onlyOwner nonReentrant {
        Loan storage loan = loans[loanId];
        require(!loan.repaid && !loan.liquidated, "Loan resolved");
        require(block.timestamp > loan.dueDate, "Not overdue");

        loan.liquidated = true;
        emit LoanLiquidated(loanId);
    }

    function getLoansByUser(address user) external view returns (Loan[] memory) {
        uint256[] memory ids = userLoans[user];
        Loan[] memory result = new Loan[](ids.length);
        for (uint256 i = 0; i < ids.length; i++) {
            result[i] = loans[ids[i]];
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
