import React, { useEffect, useState } from 'react';
import { Card, Col, Row, Skeleton, Button } from 'antd';
import { getListingMetadata } from '../lib/metadata';
import { fetchListings } from '../contracts/marketplace';
import { plumeRwaContract } from '../contracts/rwa';

const Marketplace: React.FC = () => {
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadListings = async () => {
      const fetchedListings = await fetchListings();
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

  const handleBuy = (listing: any) => {
    console.log('Buying listing:', listing);
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
      <section className="text-black py-24 px-6 text-center font-sans">
        <Row gutter={[16, 16]}>
          {loading
            ? renderSkeletons()
            : listings.map((listing: any) => (
                <Col xs={24} sm={12} md={8} lg={6} key={listing.id}>
                  <Card
                    hoverable
                    cover={<img alt={listing.metadata?.name || 'Asset'} src={listing.metadata?.image} />}
                    className="shadow-md rounded-xl"
                  >
                    <Card.Meta
                      title={`${listing.metadata?.name} ( ${listing.metadata?.attributes[0]?.value} )` || 'Unnamed RWA'}
                      description={
                        <div className="text-sm text-gray-600">
                          <p>Price: {listing.pricePerUnit.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')} pUSD | Available: {listing.amountAvailable.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</p>
                        </div>
                      }
                    />
                  </Card>
                </Col>
              ))}
        </Row>
      </section>
    </div>
  );
};

export default Marketplace;