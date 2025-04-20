import React from "react";
import { Table, Tag } from "antd";
import type { ColumnsType } from 'antd/es/table';
import { LoanType, LoanInterfaceProps } from '../../types/loan';

export const LoanInterface: React.FC<LoanInterfaceProps> = ({ loans }) => {
  const activeLoanColumns: ColumnsType<LoanType> = [
    {
      title: 'Asset',
      dataIndex: 'asset',
      key: 'asset',
    },
    {
      title: 'Loan Amount',
      dataIndex: 'loanAmount',
      key: 'loanAmount',
    },
    {
      title: 'Interest',
      dataIndex: 'interest',
      key: 'interest',
    },
    {
      title: 'Due Date',
      dataIndex: 'dueDate',
      key: 'dueDate',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'Active' ? 'green' : 'red'}>
          {status}
        </Tag>
      ),
    },
  ];

  const historyColumns: ColumnsType<LoanType> = [
    {
      title: 'Asset',
      dataIndex: 'asset',
      key: 'asset',
    },
    {
      title: 'Loan Amount',
      dataIndex: 'loanAmount',
      key: 'loanAmount',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'Active' ? 'green' : 'red'}>
          {status}
        </Tag>
      ),
    },
    {
      title: 'Date',
      dataIndex: 'dueDate',
      key: 'dueDate',
    },
  ];

  return (
    <>
      <div className="mb-8 bg-white p-4">
        <h2 className="text-2xl font-semibold mb-6 text-gray-800">My Active Loans</h2>
        <Table
          columns={activeLoanColumns}
          dataSource={loans.filter(loan => loan.status === "Active")}
          pagination={false}
          className="rounded-lg overflow-hidden"
          locale={{
            emptyText: (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <p className="text-gray-500">You don't have any active loans</p>
              </div>
            )
          }}
        />
      </div>

      {loans.filter(loan => loan.status === "Active").length > 0 && (
        <RepaySection loans={loans.filter(loan => loan.status === "Active")} />
      )}

      <div className="mt-12 bg-white p-4">
        <h2 className="text-2xl font-semibold mb-6 text-gray-800">Loan History</h2>
        <Table
            columns={historyColumns}
            dataSource={loans.filter(loan => loan.status !== "Active")}
            pagination={false}
            className="rounded-lg overflow-hidden"
            locale={{
                emptyText: (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <p className="text-gray-500">No loan history available</p>
                </div>
                )
            }}
        />
      </div>
    </>
  );
};

const RepaySection: React.FC<{ loans: LoanType[] }> = ({ loans }) => (
  <div className="bg-red-50 p-6 rounded-lg border border-red-100">
    <h3 className="text-xl font-semibold mb-4 text-red-500">Loan Repayment</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {loans.map((loan) => (
        <LoanRepayCard key={loan.key} loan={loan} />
      ))}
    </div>
  </div>
);

const LoanRepayCard: React.FC<{ loan: LoanType }> = ({ loan }) => (
  <div className="bg-white p-4 rounded-lg shadow-sm">
    <div className="flex justify-between items-center mb-2">
      <h4 className="font-medium">{loan.asset}</h4>
      <span className="text-sm text-gray-500">Due: {loan.dueDate}</span>
    </div>
    <div className="flex justify-between items-center">
      <div>
        <p className="text-sm text-gray-600">Amount: {loan.loanAmount}</p>
        <p className="text-sm text-gray-600">Interest: {loan.interest}</p>
      </div>
      <button className="cursor-pointer text-red-500 hover:text-red-700 font-medium py-2 px-4 border border-red-300 rounded-full transition-colors">
        Repay Now
      </button>
    </div>
  </div>
);