import React, { useEffect, useState } from 'react';
import { Card, Col, Row, Skeleton, Modal, Button,Form, Input, Typography, Image, notification } from 'antd';
import { ShoppingCartOutlined } from '@ant-design/icons'
import { getListingMetadata } from '../lib/metadata';
import { fetchListings, buyAsset } from '../contracts/marketplace';
import { plumeRwaContract } from '../contracts/rwa';
import { useActiveAccount } from 'thirdweb/react';
import { getTokenBalance } from '../contracts/token'
import useAuthStore from '../stores/authStore';
import { Listing } from '../types/marketplace';

const { Text } = Typography;

const Marketplace: React.FC = () => {
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingBuy, setLoadingBuy] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedListing, setSelectedListing] = useState<any>(null);
  const { balance, setBalance } = useAuthStore();
  const account = useActiveAccount();
  const [form] = Form.useForm();
  const watchedAmount = Form.useWatch('amount', form);

  useEffect(() => {
    const loadListings = async () => {
      const fetchedListings = await fetchListings();

      // If no listings, set loading false immediately
      if (!fetchedListings || fetchedListings.length === 0) {
        setListings([]);
        setLoading(false);
        return;
      }


      const listingsWithMetadata = await Promise.all(
        fetchedListings.map(async (listing: any) => {
          if (!listing?.tokenAddress || !listing?.tokenId) {
            console.warn("Skipping invalid listing", listing);
            return null;
          }
      
          try {
            const metadata = await getListingMetadata(plumeRwaContract, listing.tokenId);
            return { ...listing, metadata };
          } catch (error) {
            console.error(`Failed to fetch metadata for listing ${listing.id}`, error);
            return { ...listing, metadata: null };
          } finally {
            setLoading(false);
          }
        })
      );
      setListings(listingsWithMetadata.filter(Boolean));
    };

    loadListings();
  }, []);

  const fetchBalance = async () => {
      if (account?.address) {
          const userBalance = await getTokenBalance(account?.address);
          setBalance(userBalance);
      }
  };
  useEffect(() => {
    fetchBalance();
  }, [account, balance]);

  const openModal = (listing: any) => {
    setSelectedListing(listing);
    setIsModalOpen(true);
  };

  const handleBuy = async (
    account: any,
    listing: Listing,
    amount: bigint,
  ) => {
    setLoadingBuy(true);

    try {
      const totalPrice = BigInt(listing.pricePerUnit) * amount;
  
      const result = await buyAsset(account, BigInt(listing.id), amount, totalPrice);
  
      if (result.status) {
        notification.success({
          message: "Purchase successful",
          description: `Tx Hash: ${result.transactionHash}`,
        });
  
        form.resetFields();
  
        const updated = await fetchListings();
        const enriched = await Promise.all(
          updated.map(async (l) => {
            const metadata = await getListingMetadata(plumeRwaContract, l.tokenId);
            return { ...l, metadata };
          })
        );

        setListings(enriched);
      } else {
        notification.error({
          message: "Purchase failed",
          description: "Please try again.",
        });
      }
    } catch (err) {
      notification.error({
        message: "Error",
        description: String(err),
      });
    } finally {
      setLoadingBuy(false);
      setIsModalOpen(false);
      fetchBalance();
    }
  };

  const renderSkeletons = () => {
    return Array.from({ length: 8 }).map((_, idx) => (
      <Col xs={24} sm={12} md={8} lg={6} key={idx}>
        <Card className="shadow-md rounded-xl" cover={<Skeleton.Image style={{ width: '100%', height: 200 }} />}>
          <Skeleton active title={false} paragraph={{ rows: 2 }} />
        </Card>
      </Col>
    ));
  };

  return (
    <div className="bg-[#F9F9F9] min-h-screen py-10 px-6 bg-white">

      <div className="mb-4 pt-14 w-full text-center">
        <span className="inline-block bg-red-500 text-white text-sm font-semibold px-4 py-2 w-full rounded">
          This is a testnet Real-World Asset (RWA) on Plume and not a real asset. It is intended for testing and demonstration purposes only.
        </span>
      </div>

      <section className="text-blackpx-6 text-center font-sans">

      <Row gutter={[16, 16]}>
          {loading ? (
            renderSkeletons()
          ) : listings.length > 0 ? (
            listings.map((listing: any) => (
              <Col xs={24} sm={12} md={8} lg={6} key={listing.id}>
                <Card
                  hoverable
                  onClick={() => openModal(listing)}
                  className="group relative overflow-hidden rounded-xl shadow-md p-0 border-none"
                  styles={{ body: { display: 'none' } }}
                  cover={
                    <div className="relative overflow-hidden">
                      <img
                        alt={listing.metadata?.name || 'Asset'}
                        src={listing.metadata?.image}
                        className="w-full h-64 object-cover transition-transform duration-300 ease-in-out group-hover:scale-105"
                      />
                      <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/80 to-transparent text-white p-4 flex justify-between items-end text-sm">
                        <div>
                          <div className="font-semibold">{listing.metadata?.name}</div>
                          <div className="text-xs text-left">{listing.metadata?.attributes[0]?.value}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold">$ {listing.pricePerUnit.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</div>
                          <div className="text-xs">Price</div>
                        </div>
                      </div>
                    </div>
                  }
                />
              </Col>
            ))
          ) : (
            <Col span={24} className="text-center py-12">
              <div className="flex flex-col items-center justify-center">
                <ShoppingCartOutlined className="text-4xl text-gray-400 mb-4" />
                <h3 className="text-xl font-medium text-gray-600">No Listings Available</h3>
                <p className="text-gray-500 mt-2">There are currently no items in the marketplace</p>
              </div>
            </Col>
          )}
        </Row>
      </section>

      <Modal
        title={
          <div className="flex items-center space-x-4">
            <Image
              alt={selectedListing?.metadata?.name || 'Asset'}
              src={selectedListing?.metadata?.image}
              width={64}
              height={64}
              className="rounded-lg object-cover"
              preview={false}
            />
            <div>
              <div className="text-lg font-semibold">{selectedListing?.metadata?.name}</div>
              <div className="text-sm text-gray-500">
                {selectedListing?.metadata?.attributes[0]?.value}
              </div>
            </div>
          </div>
        }
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
      >
        <Form
          form={form}
          onFinish={({ amount }) => {
            if (selectedListing && account) {
              handleBuy(account, selectedListing, BigInt(amount));
            }
          }}
          layout="vertical"
        >
          <Form.Item>
            <Text>{selectedListing?.metadata?.description || 'No description available'}</Text>
          </Form.Item>

          <Form.Item
            label={
              <div className="flex justify-between w-full">
                <span>Amount to Buy</span>
                <span className="text-gray-500 font-normal">
                  &nbsp; | Available: {selectedListing?.amountAvailable?.toString() || '0'}
                </span>
              </div>
            }
            name="amount"
            rules={[
              { 
                required: true, 
                message: 'Please input amount to buy' 
              },
              { 
                validator: (_, value) => {
                  if (value < 1) {
                    return Promise.reject('Amount must be at least 1');
                  }
                  if (BigInt(value) > selectedListing?.amountAvailable) {
                    return Promise.reject(`Amount exceeds available supply`);
                  }
                  return Promise.resolve();
                }
              }
            ]}
          >
            <div className="space-y-1">
              <Input 
                type="number"
                name="amount"
                min={1}
                max={Number(selectedListing?.amountAvailable || 1)}
                onChange={(e) => {
                  const amount = e.target.value;
                  form.setFieldsValue({ amount });
                }}
              />
              <Text type="secondary" className="text-xs block text-right">
                Balance: {balance?.toString() || '0'} pUSD
              </Text>
            </div>
          </Form.Item>

          {/* Purchase Summary */}
          <div className="mb-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex justify-between mb-2">
              <Text type="secondary">Price per unit:</Text>
              <Text>
                {selectedListing?.pricePerUnit 
                  ? selectedListing.pricePerUnit.toString()
                  : '0'} pUSD
              </Text>
            </div>
            <div className="flex justify-between mb-2">
              <Text type="secondary">Quantity:</Text>
              <Text>{watchedAmount || '0'}</Text>
            </div>
            <div className="flex justify-between font-medium">
              <Text>Total Cost:</Text>
              <Text>
                {selectedListing?.pricePerUnit && watchedAmount
                  ? (selectedListing.pricePerUnit * BigInt(watchedAmount || 0)).toString()
                  : '0'} pUSD
              </Text>
            </div>
          </div>

          <Form.Item>
            <Button
              type="primary"
              danger
              htmlType="submit"
              block
              shape="round"
              loading={loadingBuy}
              disabled={!form.getFieldValue('amount')}
            >
              Buy
            </Button>
          </Form.Item>
        </Form>
      </Modal>

    </div>
  );
};

export default Marketplace;