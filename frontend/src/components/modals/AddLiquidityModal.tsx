import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Button, Typography, Alert, notification } from 'antd';
import { ensureAllowanceThenAddLiquidity } from '../../lib/contracts'
import { useSendTransaction, useActiveAccount } from 'thirdweb/react'

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
  const [currentAPR] = useState("12%");
  const { mutate: sendTransaction, isPending } = useSendTransaction();
  const account = useActiveAccount();

  const handleSubmit = async (values: { amount: string }) => {
    try {
      const tx = await ensureAllowanceThenAddLiquidity({ amount: values.amount, account: account });
      await sendTransaction(tx as any, {
        onSuccess: (receipt) => {
          console.log(receipt);
          
          notification.success({
            message: "Liquidity Added",
            description: `Successfully added ${values.amount} pUSD to the pool`,
          });
          onSubmit(values);
          form.resetFields();
          onClose();
        },
        onError: (error) => {
          notification.error({
            message: "Transaction Failed",
            description: error.message || "Failed to add liquidity",
          });
        },
      });
    } catch (err) {
      console.error("Failed to add liquidity:", err);
    }
  };

  useEffect(() => {
    if (visible) {
      form.resetFields();
    }
  }, [visible, form]);

  return (
    <Modal
      title="Add Liquidity (pUSD)"
      open={visible}
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
          loading={isPending}
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
          <div className="flex justify-between items-center">
            <Text strong>Current APR:</Text>
            <Text strong className="text-green-600 text-lg">
              {currentAPR}
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