import React, { useState, useEffect } from "react";
import { Table, Button, Skeleton } from "antd";
import type { ColumnsType } from 'antd/es/table';
import { DollarOutlined } from '@ant-design/icons';
import { LiquidityPosition } from '../../types/deposit';
import { useActiveAccount } from 'thirdweb/react';
import { getDepositsByUser } from "../../contracts/deposit";
import useAuthStore from '../../stores/authStore';

export const LiquidityInterface: React.FC = () => {
  const account = useActiveAccount();
  const address = account?.address;
  const { balance } = useAuthStore();

  const [positions, setPositions] = useState<LiquidityPosition[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDeposits = async () => {
      if (!address) return;

      setLoading(true);
      try {
        const deposits = await getDepositsByUser(address);
        setPositions(deposits);
      } catch (err) {
        console.error("Error fetching deposits:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDeposits();
  }, [address, balance]);

  // Liquidity provider columns.
  const liquidityColumns: ColumnsType<LiquidityPosition> = [
    {
      title: 'Amount Supplied',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount) => `${amount} $pUSD`,
    },
    {
      title: 'APR',
      dataIndex: 'apr',
      key: 'apr',
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Button className="!text-green-600 hover:!text-green-800 !px-3 !py-1 !rounded-full !border !border-gray-300 hover:!bg-gray-100 transition-colors">
          Withdraw
        </Button>
      ),
    },
  ];

  const skeletonColumns = [
    {
      title: 'Amount',
      key: 'amount',
      render: () => <Skeleton.Input active size="small" style={{ width: 100 }} />,
    },
    {
      title: 'APR',
      key: 'apr',
      render: () => <Skeleton.Input active size="small" style={{ width: 60 }} />,
    },
    {
      title: 'Action',
      key: 'action',
      render: () => <Skeleton.Button active size="small" style={{ width: 80 }} />,
    },
  ];

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
      <h2 className="text-2xl font-bold text-green-600 mb-6">My Liquidity Positions</h2>
      {loading ? (
        <Table
          columns={skeletonColumns}
          dataSource={Array(3).fill({})} // 3 baris skeleton
          pagination={false}
          showHeader={true}
        />
      ) : (
      <Table
        columns={liquidityColumns}
        dataSource={positions}
        pagination={false}
        locale={{
            emptyText: (
            <div className="text-center py-8">
                <p className="text-gray-500 mb-4">You haven't supplied any tokens yet</p>
                <Button 
                type="primary" 
                icon={<DollarOutlined />}
                className="bg-green-600 hover:bg-green-700"
                >
                Supply Tokens Now
                </Button>
            </div>
            )
        }}
      />
      )}
    </div>
  );
};