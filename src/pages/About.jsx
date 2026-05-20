import Seo from '../components/Seo';

const About = () => {
  return (
    <div>
      <Seo
        title="About Us"
        description="Discover the story behind Ektaa Couture - celebrating India's rich textile heritage through handcrafted sarees and designer suits made by skilled artisans."
        path="/about"
      />
      {/* Hero Section */}
      <section className="bg-gray-100 py-12 sm:py-16 md:py-20">
        <div className="container-custom text-center px-4 sm:px-6">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-text-primary mb-4">
            About Ektaa Couture
          </h1>
          <p className="text-base sm:text-lg text-text-body max-w-2xl mx-auto">
            Celebrating India's Rich Textile Heritage
          </p>
        </div>
      </section>

      {/* Split Layout Section - Image Left, Description Right */}
      <section className="py-16 sm:py-20 md:py-24 bg-white">
        <div className="container-custom px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left Side - Image */}
            <div className="order-2 lg:order-1">
              <div className="relative overflow-hidden rounded-lg shadow-lg">
                <img
                  src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&h=1000&fit=crop&q=80"
                  alt="Ektaa Couture Fashion"
                  className="w-full h-auto object-cover"
                />
              </div>
            </div>

            {/* Right Side - Description */}
            <div className="order-1 lg:order-2 space-y-6">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-text-primary">
                Our Story
              </h2>

              <div className="space-y-4 text-text-body leading-relaxed" style={{ fontSize: '14px' }}>
                <p>
                  Each piece in our collection is a celebration of India's rich textile heritage.
                  We work closely with skilled artisans across India to bring you authentic,
                  handwoven fabrics that tell a story of tradition, craftsmanship, and timeless beauty.
                </p>

                <p>
                  At Ektaa Couture, we believe in preserving the art of handloom weaving while
                  creating contemporary designs that resonate with modern sensibilities. Our
                  collections feature exquisite sarees, each meticulously crafted with attention
                  to detail and a deep respect for traditional techniques.
                </p>

                <p>
                  From the intricate threadwork of EK TAAR to the elegant patterns of our Cutwork
                  collection, every saree represents hours of dedicated craftsmanship. We source
                  the finest materials and work directly with weavers to ensure fair practices
                  and exceptional quality.
                </p>

                <p>
                  Our mission is to make handwoven textiles accessible to discerning customers
                  who appreciate the value of handcrafted luxury. Whether you're looking for
                  everyday elegance or festive grandeur, our collections offer something special
                  for every occasion.
                </p>
              </div>

              <div className="pt-4">
                <h3 className="text-xl font-semibold text-text-primary mb-3">
                  Why Choose Us
                </h3>
                <ul className="space-y-2 text-text-body" style={{ fontSize: '14px' }}>
                  <li className="flex items-start">
                    <span className="text-primary mr-2">•</span>
                    <span>100% Authentic Handwoven Textiles</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-2">•</span>
                    <span>Direct Partnership with Artisan Weavers</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-2">•</span>
                    <span>Premium Quality Materials</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-2">•</span>
                    <span>Contemporary Designs with Traditional Roots</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-2">•</span>
                    <span>Sustainable and Ethical Practices</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Craftsmanship Section */}
      <section className="py-16 sm:py-20 md:py-24 bg-gray-50">
        <div className="container-custom px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-text-primary mb-4">
              The Art of Handloom
            </h2>
            <p className="text-text-body max-w-2xl mx-auto" style={{ fontSize: '14px' }}>
              Every saree in our collection is a masterpiece of traditional weaving,
              created with passion and precision by skilled artisans.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold text-text-primary mb-3">Traditional Techniques</h3>
              <p className="text-text-body" style={{ fontSize: '14px' }}>
                We preserve age-old weaving methods passed down through generations,
                ensuring each piece carries the authentic essence of Indian textile heritage.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold text-text-primary mb-3">Quality Materials</h3>
              <p className="text-text-body" style={{ fontSize: '14px' }}>
                From pure silk to fine cotton, we source only the highest quality materials
                to create textiles that are both beautiful and durable.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold text-text-primary mb-3">Artisan Support</h3>
              <p className="text-text-body" style={{ fontSize: '14px' }}>
                We work directly with weavers, ensuring fair compensation and supporting
                the continuation of traditional crafts in rural India.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
