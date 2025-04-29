import React from "react"
import { Form, Input, InputNumber, Button, Upload, message } from "antd"
import { UploadOutlined } from "@ant-design/icons"
import { upload } from "thirdweb/storage";
import { thirdWebClient } from '../lib/client';

const RWA: React.FC = () => {
  const [form] = Form.useForm()

  const onFinish = async (values: any) => {
    const { name, ticker, amount, image } = values
    const file = image[0].originFileObj
  
    if (!file) {
      message.error("Image file not found!")
      return
    }
  
    try {
      message.loading("Uploading to IPFS...", 2)
  
        const metadataUri = await upload({
            client: thirdWebClient,
            files: [{
                name: `${name}_metadata.json`,
                data: JSON.stringify({
                name,
                description: `${ticker} token with ${amount} supply`,
                image: file,
                attributes: [
                    { trait_type: "Ticker", value: ticker },
                    { trait_type: "Amount", value: amount }
                ]
                })
            }]
        });
  
      console.log("Mint with metadata URI:", metadataUri)
  
      // TODO: Call smart contract mintRWA(name, ticker, amount, metadataURI)
  
      message.success("Mint request prepared!")
    } catch (err) {
      console.error(err)
      message.error("IPFS upload failed")
    }
  }

  const normFile = (e: any) => {
    if (Array.isArray(e)) return e
    return e?.fileList
  }

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
              <InputNumber className="w-full" min={1} placeholder="e.g. 1000" />
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
              >
                Mint RWA NFT
              </Button>
            </Form.Item>
          </Form>
        </div>
      </section>
    </div>
  )
}

export default RWA
