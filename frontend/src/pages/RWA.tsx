import React, { useState, useEffect  } from 'react';
import { Form, Input, InputNumber, Button, Upload, notification } from "antd"
import { Card, List, Avatar, Typography, Divider } from 'antd';
import { UploadOutlined } from "@ant-design/icons"
import { upload } from "thirdweb/storage";
import { thirdWebClient } from '../lib/client';
import { useActiveAccount } from 'thirdweb/react'
import { mintRWA, getNFTs } from '../contracts/rwa'

const { Text } = Typography;

const RWA: React.FC = () => {
    const [form] = Form.useForm();
    const account = useActiveAccount();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [nfts, setNfts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true)

    const onFinish = async (values: any) => {
        const { name, ticker, amount, image } = values
        const file = image[0].originFileObj
        setIsSubmitting(true);
    
        if (!file) {
            notification.error({
                message: "Mint failed",
                description: "Image file not found!",
            });
            return
        }
    
        try {
            // First, upload the image and get its IPFS URL.
            const imageUri = await upload({
                client: thirdWebClient,
                files: [file]
            });
            
            // Then, upload the metadata, including the image URI.
            const metadataUri = await upload({
                client: thirdWebClient,
                files: [{
                name: `${name}_metadata.json`,
                data: JSON.stringify({
                    name,
                    description: `${ticker} token with ${amount} supply`,
                    image: imageUri,
                    attributes: [
                    { trait_type: "Ticker", value: ticker },
                    { trait_type: "Amount", value: amount }
                    ]
                })
                }]
            });

            // How to directly access example:
            // https://ipfs.io/ipfs/QmQ2ZvrxD587GXdX9rctkurvtPG85j9cqZs9Lvp73jQs4a/plume_network1716480863760.png
            // https://ipfs.io/ipfs/Qme4tjYpXxxzQcyU7P72v87drhirK13S61GFLAqM7RxwgT/Asset%20Test_metadata.json

            const mintResult = await mintRWA(
                account,
                name,
                ticker,
                BigInt(amount),
                metadataUri
            );

            if (mintResult.status) {
                notification.success({
                    message: "Mint Successful",
                    description: (
                        <span>
                            RWA NFT minted successfully!  
                            <a 
                                href={`https://testnet-explorer.plumenetwork.xyz/tx/${mintResult.transactionHash}`} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                style={{ marginLeft: 8 }}
                            >
                                View transaction
                            </a>
                        </span>
                    ),
                    duration: 4.5,
                });
            } else {
                notification.error({
                    message: "Mint failed",
                    description: "Failed to mint RWA NFT!",
                });
            }
        } catch (err) {
            console.error(err)
            notification.error({
                message: "Mint failed",
                description: "Failed to mint RWA NFT!",
            });
        } finally {
            form.resetFields();
            setIsSubmitting(false);

            await fetchNFTs();
        }
    }

    const normFile = (e: any) => {
        if (Array.isArray(e)) return e
        return e?.fileList
    }

    const fetchNFTs = async () => {
        try {
          setLoading(true);
          const fetchedNFTs = await getNFTs(); 
          setNfts(fetchedNFTs);
        } catch (error) {
          console.error("Failed to fetch NFTs:", error);
          notification.error({
            message: "Error",
            description: "Failed to load NFT list",
          });
        } finally {
          setLoading(false);
        }
    };

    useEffect(() => {
        fetchNFTs();
    }, []);

    return (
        <div className="bg-[#F9F9F9] min-h-screen">
            <section className="bg-white text-black py-24 px-6 text-center font-sans">
                <p className="text-gray-600 text-lg max-w-2xl mx-auto mb-10">
                    Tokenize your physical assets in seconds.
                </p>

                <div className="max-w-xl mx-auto bg-white shadow-xl rounded-2xl p-8 text-left">
                    <Form
                        form={form}
                        layout="vertical"
                        onFinish={onFinish}
                        initialValues={{ amount: 1 }}
                    >
                        <Form.Item
                        name="name"
                        label="Asset Name"
                        rules={[{ required: true, message: "Asset name is required" }]}
                        >
                            <Input placeholder="e.g. Real Estate Bond" />
                        </Form.Item>

                        <Form.Item
                        name="ticker"
                        label="Ticker"
                        rules={[{ required: true, message: "Ticker is required" }]}
                        >
                            <Input placeholder="e.g. REBOND" />
                        </Form.Item>

                        <Form.Item
                        name="amount"
                        label="Token Supply"
                        rules={[{ required: true, type: "number", min: 1 }]}
                        >
                            <InputNumber 
                                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                style={{ width: '100%' }} className="w-full" min={1} placeholder="e.g. 1000" />
                        </Form.Item>

                        <Form.Item
                            name="image"
                            label="Asset Image"
                            valuePropName="fileList"
                            getValueFromEvent={normFile}
                            rules={[{ required: true, message: "Image is required" }]}
                        >
                            <Upload
                                listType="picture-card"
                                accept="image/*"
                                maxCount={1}
                                beforeUpload={() => false}
                            >
                                <Button icon={<UploadOutlined />}></Button>
                            </Upload>
                        </Form.Item>

                        <Form.Item>
                            <Button
                                type="primary"
                                htmlType="submit"
                                className="w-full bg-blue-600 hover:bg-blue-700 rounded-xl"
                                loading={isSubmitting}
                            >
                                Mint RWA NFT
                            </Button>
                        </Form.Item>
                    </Form>
                </div>

                {/* LIST RWA */}
                {/* <div className="max-w-6xl mx-auto mt-8 bg-white shadow-xl rounded-2xl p-8">
                    <Divider orientation="left" orientationMargin={0}>
                        <Text strong style={{ fontSize: '1.25rem' }}>Your RWA NFTs</Text>
                    </Divider>
                    
                    <List
                        grid={{ gutter: 16, xs: 1, sm: 2, md: 3 }}
                        dataSource={nfts}
                        loading={loading}
                        renderItem={(nft) => (
                        <List.Item>
                            <Card>
                                <Card.Meta
                                    avatar={<Avatar src={nft.imageUrl} />}
                                    title={nft.name}
                                    description={
                                    <>
                                        <Text strong>Ticker: {nft.ticker}</Text><br />
                                        <Text>Supply: { `${nft.currentSupply}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</Text><br />
                                        <Text type="secondary" style={{ fontSize: '0.8rem' }}>
                                        Token ID: {nft.tokenId}
                                        </Text>
                                    </>
                                    }
                                />
                            </Card>
                        </List.Item>
                        )}
                    />
                </div> */}
            </section>
        </div>
    )
}

export default RWA
