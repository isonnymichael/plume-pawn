import React, { useEffect } from "react";
import { Tabs } from "antd";
import { DollarOutlined, SwapOutlined } from '@ant-design/icons';
import { ActionCards } from '../components/dashboard/ActionCards';
import { LoanInterface } from '../components/dashboard/Loan';
import { LiquidityInterface } from '../components/dashboard/Liquidity';
import { LoanType } from '../types/loan';
import useAuthStore from '../stores/authStore';
import { getTokenBalance } from '../contracts/token'
import { useActiveAccount } from 'thirdweb/react'

const { TabPane } = Tabs;

const Dashboard: React.FC = () => {
  const { balance, setBalance, setBalanceLoading } = useAuthStore();
  const account = useActiveAccount();

  useEffect(() => {
      const fetchBalance = async () => {
          if (account?.address) {
              const userBalance = await getTokenBalance(account?.address);
              setBalance(userBalance);
              setBalanceLoading(false);
          }
      };
      
      fetchBalance();
  }, [account, balance]);

  // DUMMY
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
  // END OF DUMMY
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
            <LiquidityInterface />
          </TabPane>
        </Tabs>
      </section>
    </div>
  );
};

export default Dashboard;