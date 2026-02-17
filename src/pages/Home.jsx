import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Button from '../components/common/Button';
import Loader from '../components/common/Loader';

const Home = () => {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCollections();
  }, []);

  const fetchCollections = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/collections`);
      if (response.data.success) {
        setCollections(response.data.collections);
      }
    } catch (error) {
      console.error('Error fetching collections:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loader fullScreen />;
  }

  return (
    <div>
      {/* Collection Banner Sections - Stacked Vertically */}
      {collections.length > 0 ? (
        collections.map((collection) => (
          <section
            key={collection._id}
            className="relative w-full h-[400px] sm:h-[500px] md:h-[600px] lg:h-[700px] flex items-center justify-center overflow-hidden group"
          >
            {/* Background Image with Overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-black/50">
              {collection.bannerImage?.url ? (
                <img
                  src={collection.bannerImage.url}
                  alt={collection.bannerImage.alt || collection.name}
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                />
              ) : (
                <div className="w-full h-full bg-gray-400"></div>
              )}
            </div>

            {/* Content */}
            <div className="relative z-10 text-center text-white px-4 sm:px-6 md:px-8">
              <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4 md:mb-5 uppercase tracking-wide text-white">
                {collection.name}
              </h2>
              <p className="text-xs sm:text-sm md:text-base mb-5 sm:mb-6 md:mb-8 font-light tracking-wide max-w-lg md:max-w-xl mx-auto leading-relaxed text-white">
                {collection.description}
              </p>
              <Link to={`/collections/${collection.slug}`}>
                <Button
                  size="lg"
                  className="bg-primary text-white hover:bg-primary-hover transition-all duration-300 border-2 border-primary hover:border-primary-hover px-6 sm:px-8 md:px-10 py-3 sm:py-3.5 md:py-4 text-xs font-semibold tracking-widest uppercase"
                >
                  SHOP NOW
                </Button>
              </Link>
            </div>

            {/* Decorative Element */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50"></div>
          </section>
        ))
      ) : (
        <section className="container-custom py-20 text-center">
          <h2 className="text-3xl font-bold text-text-primary mb-4">
            Welcome to Ektaa Couture
          </h2>
          <p className="text-text-body mb-8">
            Our collections are being curated. Please check back soon!
          </p>
        </section>
      )}

      {/* Location & Contact Section */}
      <section className="bg-gray-50 py-20 sm:py-24 md:py-32">
        <div className="container-custom px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center max-w-7xl mx-auto">
            {/* Left Side - Contact Details */}
            <div className="text-center lg:text-left">
              <h2 className="text-base text-gray-500 mb-8" style={{ fontSize: '14px' }}>
                Contact Us
              </h2>

              <div className="space-y-6">
                <div>
                  <p className="text-text-primary" style={{ fontSize: '14px', lineHeight: '1.8' }}>
                    <span className="font-semibold">Email:</span>{' '}
                    <a href="mailto:Ektacouture04@gmail.com" className="hover:text-primary transition-colors font-normal">
                      Ektacouture04@gmail.com
                    </a>
                  </p>
                </div>

                <div>
                  <p className="text-text-primary" style={{ fontSize: '14px', lineHeight: '1.8' }}>
                    <span className="font-semibold">Call:</span>{' '}
                    <a href="tel:+918462000416" className="hover:text-primary transition-colors font-normal">
                      +91 84620 00416
                    </a>
                  </p>
                </div>

                <div>
                  <p className="text-text-primary" style={{ fontSize: '14px', lineHeight: '1.8' }}>
                    <span className="font-semibold">Address:</span>{' '}
                    <span className="font-normal">
                      M-11 Sec-1, Avanti Vihar, ATM Chowk, Raipur, Chhattisgarh
                    </span>
                  </p>
                </div>

                <div className="pt-2">
                  <p className="text-text-primary italic" style={{ fontSize: '14px' }}>
                    By Appointment Only - Please call and confirm before visiting
                  </p>
                </div>

                <div className="pt-4">
                  <a
                    href="https://maps.google.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 border-2 border-primary text-primary hover:bg-primary hover:text-white transition-all duration-300 uppercase tracking-widest"
                    style={{ fontSize: '12px', fontWeight: '600' }}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    GET DIRECTIONS
                  </a>
                </div>
              </div>
            </div>

            {/* Right Side - Brand Name */}
            <div className="flex items-center justify-center lg:justify-end">
              <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-bold text-text-primary" style={{ letterSpacing: '0.1em' }}>
                EKTAA COUTURE
              </h1>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
