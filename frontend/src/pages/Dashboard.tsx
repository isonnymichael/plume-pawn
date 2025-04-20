import React from "react";
import { Tabs } from "antd";
import { DollarOutlined, SwapOutlined } from '@ant-design/icons';
import { ActionCards } from '../components/dashboard/ActionCards';
import { LoanInterface } from '../components/dashboard/Loan';
import { LiquidityInterface } from '../components/dashboard/Liquidity';
import { LoanType, LiquidityPosition } from '../types/loan';

const { TabPane } = Tabs;

const Dashboard: React.FC = () => {

  const loans: LoanType[] = [
    {
      key: 1,
      asset: "Gold Necklace NFT",
      loanAmount: "500 pUSD",
      interest: "10%",
      dueDate: "2023-12-15",
      status: "Active",
    },
    {
      key: 2,
      asset: "Rolex Watch NFT",
      loanAmount: "1,200 pUSD",
      interest: "8%",
      dueDate: "2023-11-30",
      status: "Active",
    },
    {
      key: 3,
      asset: "Diamond Ring NFT",
      loanAmount: "800 pUSD",
      interest: "12%",
      dueDate: "2023-10-20",
      status: "Liquidated",
    },
  ];

  const liquidityPositions: LiquidityPosition[] = [
    {
      key: 1,
      token: "pUSD",
      amount: "5,000",
      apr: "12.8%",
    },
    {
      key: 2,
      token: "pUSD",
      amount: "10,000",
      apr: "9.5%",
    }
  ];

  return (
    <div className="bg-[#F9F9F9] min-h-screen">
      <section className="text-black py-32 px-6 font-sans max-w-6xl mx-auto">
        <ActionCards />

        <Tabs defaultActiveKey="borrower" className="mb-8">
          <TabPane
            tab={
              <span className="flex items-center">
                <SwapOutlined className="mr-2" />
                Borrower
              </span>
            }
            key="borrower"
          >
            <LoanInterface loans={loans} />
          </TabPane>

          <TabPane
            tab={
              <span className="flex items-center">
                <DollarOutlined className="mr-2" />
                Liquidity Provider
              </span>
            }
            key="liquidity"
          >
            <LiquidityInterface positions={liquidityPositions} />
          </TabPane>
        </Tabs>
      </section>
    </div>
  );
};

export default Dashboard;