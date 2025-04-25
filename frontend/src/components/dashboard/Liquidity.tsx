import React from "react";
import { Table, Tag, Button } from "antd";
import type { ColumnsType } from 'antd/es/table';
import { DollarOutlined } from '@ant-design/icons';
import { LiquidityPosition } from '../../types/loan';

export const LiquidityInterface: React.FC<{ positions: LiquidityPosition[] }> = ({ positions }) => {

  // Liquidity provider columns.
  const liquidityColumns: ColumnsType<LiquidityPosition> = [
    {
      title: 'Token',
      dataIndex: 'token',
      key: 'token',
      render: (token) => <Tag color="blue">{token}</Tag>,
    },
    {
      title: 'Amount Supplied',
      dataIndex: 'amount',
      key: 'amount',
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

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
      <h2 className="text-2xl font-bold text-green-600 mb-6">My Liquidity Positions</h2>
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
    </div>
  );
};