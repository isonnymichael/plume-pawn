import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Button, Select, Row, Col, Divider, Checkbox, Typography, Spin, notification } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import { useActiveAccount } from 'thirdweb/react'
import { fetchNFTs } from '../../lib/api'; 

const { Text } = Typography;

interface RWAItem {
  id: string;
  name: string;
  image: string;
  value: number;
}

interface RequestLoanModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (values: any) => void;
}

type DurationKey = '30' | '90' | '180';

export const RequestLoanModal: React.FC<RequestLoanModalProps> = ({ 
  visible, 
  onClose, 
  onSubmit
}) => {
  const [form] = Form.useForm();
  const [selectedAsset, setSelectedAsset] = useState<RWAItem | null>(null);
  const [duration, setDuration] = useState<DurationKey>('30');
  const [agreed, setAgreed] = useState(false);
  const [rwaList, setRwaList] = useState<RWAItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const account = useActiveAccount();

  const interestRates: Record<DurationKey, number> = {
    '30': 6,
    '90': 9,
    '180': 12
  };

  useEffect(() => {
    if (!visible) {
      form.resetFields();
      setSelectedAsset(null);
      setAgreed(false);
      setDuration('30');
    }
  }, [visible]);

  useEffect(() => {
    if (dropdownOpen && rwaList.length === 0) {
      fetchData();
    }
  }, [dropdownOpen]);

  const fetchData = async () => {
    try {
      if (!account?.address) {
        notification.success({
          message: "Wallet not connected",
          description: `Cannot fetch NFTs.`,
        });

        return;
      }

      setLoading(true);
      const data = await fetchNFTs(account?.address);
      const items = data.items || [];
      const formatted = items.map((item: any, idx: number) => ({
        id: item.id || `${idx}`,
        name: item.metadata?.name || 'Unnamed NFT',
        image: item.metadata?.image_url || 'https://placehold.co/40x40?text=NFT',
        value: parseFloat(item.token?.exchange_rate || '0') || 0
      }));
      setRwaList(formatted);
    } catch (err) {
      console.error('Error fetching NFTs:', err);
      setRwaList([]);
    } finally {
      setLoading(false);
    }
  };

  const calculatePayment = () => {
    if (!selectedAsset) return null;
    const ltv = 0.7;
    const loanAmount = selectedAsset.value * ltv;
    const interestRate = interestRates[duration];
    const interestAmount = (loanAmount * interestRate) / 100;
    return {
      principal: loanAmount,
      interest: interestAmount,
      total: loanAmount + interestAmount,
      rate: interestRate
    };
  };

  const paymentDetails = calculatePayment();

  return (
    <Modal
      title="Request New Loan"
      visible={visible}
      onCancel={onClose}
      width={700}
      footer={[
        <Button key="cancel" onClick={onClose}>
          Cancel
        </Button>,
        <Button 
          key="submit" 
          type="primary" 
          onClick={() => form.submit()}
          className="bg-red-500 hover:bg-red-600 border-none"
          disabled={!agreed || !selectedAsset}
        >
          Submit Request
        </Button>,
      ]}
    >
      <Form 
        form={form} 
        layout="vertical" 
        onFinish={(values) => {
          onSubmit({ ...values, paymentDetails });
          form.resetFields();
          setSelectedAsset(null);
          setAgreed(false);
          setDuration('30');
        }}
      >
        <Row gutter={[16, 16]} wrap>
          <Col xs={24} md={12}>
            <Form.Item
              name="asset"
              label="Collateral Asset"
              rules={[{ required: true, message: 'Please select an asset' }]}
            >
              <Select
                placeholder="Select RWA"
                onChange={(value) => {
                  const asset = rwaList.find(item => item.id === value);
                  setSelectedAsset(asset || null);
                  form.setFieldsValue({ amount: asset ? asset.value * 0.7 : 0 });
                }}
                optionLabelProp="label"
                onDropdownVisibleChange={(open) => setDropdownOpen(open)}
                notFoundContent={loading ? <Spin size="small" /> : 'No RWAs found'}
              >
                {rwaList.map(rwa => (
                  <Select.Option 
                    key={rwa.id} 
                    value={rwa.id}
                    label={rwa.name}
                  >
                    <div className="flex items-center">
                      <img 
                        src={rwa.image} 
                        alt={rwa.name} 
                        className="w-6 h-6 mr-2 rounded"
                      />
                      {rwa.name} (${rwa.value})
                    </div>
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="amount"
              label="Loan Amount (pUSD)"
            >
              <Input 
                type="number" 
                placeholder="Will auto-calculate" 
                readOnly 
                className="bg-gray-50"
              />
            </Form.Item>

            <Form.Item
              name="duration"
              label="Loan Duration"
              rules={[{ required: true, message: 'Please select duration' }]}
            >
              <Select
                placeholder="Select duration"
                onChange={(value: DurationKey) => setDuration(value)}
                value={duration}
              >
                <Select.Option value="30">1 Month (6%)</Select.Option>
                <Select.Option value="90">3 Months (9%)</Select.Option>
                <Select.Option value="180">6 Months (12%)</Select.Option>
              </Select>
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <div className="bg-gray-50 p-4 rounded-lg h-full">
              <h4 className="font-semibold mb-3">Loan Summary</h4>
              {paymentDetails ? (
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Principal (70% of value):</span>
                    <span>${paymentDetails.principal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Interest ({paymentDetails.rate}%):</span>
                    <span>${paymentDetails.interest.toLocaleString()}</span>
                  </div>
                  <Divider className="my-2" />
                  <div className="flex justify-between font-semibold">
                    <span>Total Repayment (pUSD):</span>
                    <span>${paymentDetails.total.toLocaleString()}</span>
                  </div>
                </div>
              ) : (
                <Text type="secondary">Select an asset to see loan details</Text>
              )}

              <Text type="danger" className="block mt-4 text-xs">
                <InfoCircleOutlined className="mr-1" />
                Late payments may result in liquidation of your RWA collateral
              </Text>
            </div>
          </Col>
        </Row>

        <Form.Item
          name="agreement"
          valuePropName="checked"
          rules={[
            {
              validator: (_, value) =>
                value ? Promise.resolve() : Promise.reject('You must agree to the terms'),
            },
          ]}
        >
          <Checkbox onChange={(e) => setAgreed(e.target.checked)}>
            I agree to the loan terms and understand the risks
          </Checkbox>
        </Form.Item>
      </Form>
    </Modal>
  );
};