import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Button, Typography, Alert } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';

const { Text } = Typography;

interface AddLiquidityModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (values: { amount: string }) => void;
}

export const AddLiquidityModal: React.FC<AddLiquidityModalProps> = ({ 
  visible, 
  onClose, 
  onSubmit
}) => {
  const [form] = Form.useForm();
  const [currentAPR, setCurrentAPR] = useState("12.5%");

  // Simulate APR updates based on mock market conditions
  useEffect(() => {
    if (visible) {
      const interval = setInterval(() => {
        // Random APR fluctuation between 12% and 13% for demo purposes
        const newAPR = (12 + Math.random()).toFixed(1) + "%";
        setCurrentAPR(newAPR);
      }, 3000);
      
      return () => clearInterval(interval);
    }
  }, [visible]);

  const handleSubmit = (values: { amount: string }) => {
    onSubmit(values);
    form.resetFields();
  };

  useEffect(() => {
    if (visible) {
      form.resetFields();
    }
  }, [visible, form]);

  return (
    <Modal
      title="Add Liquidity (pUSD)"
      visible={visible}
      onCancel={onClose}
      width={600}
      footer={[
        <Button key="cancel" onClick={onClose}>
          Cancel
        </Button>,
        <Button 
          key="submit" 
          type="primary" 
          onClick={() => form.submit()}
          className="bg-green-600 hover:bg-green-700 border-none"
        >
          Deposit pUSD
        </Button>,
      ]}
    >
      <Form 
        form={form} 
        layout="vertical" 
        onFinish={handleSubmit}
      >
        <Form.Item
          name="amount"
          label="Amount to Deposit"
          rules={[{ 
            required: true, 
            message: 'Please enter amount' 
          }]}
        >
          <Input 
            type="number" 
            placeholder="Enter pUSD amount" 
            addonAfter="pUSD"
          />
        </Form.Item>

        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <Text strong>Current APR:</Text>
            <Text strong className="text-green-600 text-lg">
              {currentAPR}
            </Text>
          </div>
          <div className="flex items-start">
            <InfoCircleOutlined className="text-blue-500 mr-2 mt-1" />
            <Text type="secondary" className="text-xs">
              APR is calculated based on:
              <ul className="list-disc pl-4 mt-1">
                <li>Current pool utilization (75%)</li>
                <li>Loan demand in the system</li>
                <li>Platform risk parameters</li>
              </ul>
            </Text>
          </div>
        </div>

        <Alert
          message="Important Notice"
          description={
            <div className="text-xs">
              <p className="mb-1">• Depositing pUSD helps secure loans against RWAs</p>
              <p className="mb-1">• You earn this APR when borrowers repay their loans</p>
              <p>• Rates update automatically based on market conditions</p>
            </div>
          }
          type="info"
          showIcon
          className="mb-4"
        />
      </Form>
    </Modal>
  );
};