import { useEffect, useState } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { FiFilter, FiX } from 'react-icons/fi';
import axios from 'axios';
import ProductCard from '../components/product/ProductCard';
import Loader from '../components/common/Loader';
import Button from '../components/common/Button';
import Seo from '../components/Seo';
import { breadcrumbSchema } from '../lib/structuredData';

const Collections = () => {
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const isAllProducts = slug === 'all';

  const [collection, setCollection] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);

  // Filters - separate input state from applied filters
  const [sortBy, setSortBy] = useState('-createdAt');
  const [minPriceInput, setMinPriceInput] = useState('');
  const [maxPriceInput, setMaxPriceInput] = useState('');
  const [appliedMinPrice, setAppliedMinPrice] = useState('');
  const [appliedMaxPrice, setAppliedMaxPrice] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Get search query from URL
  const searchQuery = searchParams.get('search') || '';

  useEffect(() => {
    fetchData();
    window.scrollTo(0, 0);
  }, [slug, page, sortBy, appliedMinPrice, appliedMaxPrice, searchQuery]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (isAllProducts) {
        // Fetch all products
        await fetchAllProducts();
      } else {
        // Fetch collection and its products
        await fetchCollectionProducts();
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterProductsByPrice = (products) => {
    if (!appliedMinPrice && !appliedMaxPrice) return products;

    return products.filter(product => {
      const price = product.price || 0;
      const min = appliedMinPrice ? parseFloat(appliedMinPrice) : 0;
      const max = appliedMaxPrice ? parseFloat(appliedMaxPrice) : Infinity;
      return price >= min && price <= max;
    });
  };

  const fetchAllProducts = async () => {
    const params = {
      page: 1, // Fetch all for client-side filtering when price filter is active
      limit: (appliedMinPrice || appliedMaxPrice) ? 100 : 12,
      sort: sortBy,
      status: 'active',
    };

    // Add price params (backend might support these)
    if (appliedMinPrice) {
      params.minPrice = appliedMinPrice;
      params['price[gte]'] = appliedMinPrice;
    }
    if (appliedMaxPrice) {
      params.maxPrice = appliedMaxPrice;
      params['price[lte]'] = appliedMaxPrice;
    }
    if (searchQuery) params.search = searchQuery;

    const response = await axios.get(`${import.meta.env.VITE_API_URL}/products`, { params });

    if (response.data.success) {
      let filteredProducts = response.data.products;

      // Apply client-side price filtering as fallback
      if (appliedMinPrice || appliedMaxPrice) {
        filteredProducts = filterProductsByPrice(filteredProducts);
      }

      // Handle pagination for filtered results
      const startIndex = (page - 1) * 12;
      const paginatedProducts = filteredProducts.slice(startIndex, startIndex + 12);

      setProducts(paginatedProducts);
      setTotalPages(Math.ceil(filteredProducts.length / 12) || 1);
      setTotalProducts(filteredProducts.length);
    }
  };

  const fetchCollectionProducts = async () => {
    const params = {
      page: 1,
      limit: (appliedMinPrice || appliedMaxPrice) ? 100 : 12,
      sort: sortBy,
    };

    // Add price params (backend might support these)
    if (appliedMinPrice) {
      params.minPrice = appliedMinPrice;
      params['price[gte]'] = appliedMinPrice;
    }
    if (appliedMaxPrice) {
      params.maxPrice = appliedMaxPrice;
      params['price[lte]'] = appliedMaxPrice;
    }

    const response = await axios.get(
      `${import.meta.env.VITE_API_URL}/collections/${slug}/products`,
      { params }
    );

    if (response.data.success) {
      setCollection(response.data.collection);

      let filteredProducts = response.data.products;

      // Apply client-side price filtering as fallback
      if (appliedMinPrice || appliedMaxPrice) {
        filteredProducts = filterProductsByPrice(filteredProducts);
      }

      // Handle pagination for filtered results
      const startIndex = (page - 1) * 12;
      const paginatedProducts = filteredProducts.slice(startIndex, startIndex + 12);

      setProducts(paginatedProducts);
      setTotalPages(Math.ceil(filteredProducts.length / 12) || 1);
      setTotalProducts(filteredProducts.length);
    }
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
    setPage(1);
  };

  const handleApplyFilters = () => {
    setAppliedMinPrice(minPriceInput);
    setAppliedMaxPrice(maxPriceInput);
    setPage(1);
    setShowFilters(false);
  };

  const handleClearFilters = () => {
    setMinPriceInput('');
    setMaxPriceInput('');
    setAppliedMinPrice('');
    setAppliedMaxPrice('');
    setSortBy('-createdAt');
    setPage(1);
    setShowFilters(false);
  };

  const hasActiveFilters = appliedMinPrice || appliedMaxPrice || sortBy !== '-createdAt';
  const hasSearchOrFilters = searchQuery || hasActiveFilters;

  if (loading && page === 1) {
    return <Loader fullScreen />;
  }

  const seoTitle = isAllProducts
    ? searchQuery
      ? `Search: ${searchQuery}`
      : 'All Products'
    : collection?.seo?.metaTitle || collection?.name || 'Collection';
  const seoDescription = isAllProducts
    ? 'Browse the full Ektaa Couture catalogue — handwoven sarees, designer suits, and traditional Indian couture.'
    : collection?.seo?.metaDescription ||
      collection?.description ||
      `Shop the ${collection?.name || ''} collection at Ektaa Couture.`;
  const seoPath = `/collections/${slug || 'all'}`;
  const collectionBreadcrumb = [
    { name: 'Home', path: '/' },
    {
      name: isAllProducts ? 'All Products' : collection?.name || 'Collection',
      path: seoPath,
    },
  ];

  return (
    <div>
      <Seo
        title={seoTitle}
        description={seoDescription}
        path={seoPath}
        noindex={Boolean(searchQuery)}
        jsonLd={breadcrumbSchema(collectionBreadcrumb)}
      />
      {/* Collection Banner */}
      {!isAllProducts && collection && (
        <div className="bg-gray-100 py-8 sm:py-12 md:py-16">
          <div className="container-custom text-center px-4 sm:px-6">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-text-primary mb-3 sm:mb-4">
              {collection.name}
            </h1>
            <p className="text-sm sm:text-base md:text-lg text-text-body max-w-2xl mx-auto">
              {collection.description}
            </p>
          </div>
        </div>
      )}

      {isAllProducts && (
        <div className="bg-gray-100 py-8 sm:py-12 md:py-16">
          <div className="container-custom text-center px-4 sm:px-6">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-text-primary mb-3 sm:mb-4">
              {searchQuery ? `Search: "${searchQuery}"` : 'All Products'}
            </h1>
            <p className="text-sm sm:text-base md:text-lg text-text-body">
              {searchQuery
                ? `Showing results for "${searchQuery}"`
                : 'Browse our entire collection of handwoven textiles'}
            </p>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="container-custom py-6 sm:py-8 px-4 sm:px-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs sm:text-sm text-text-body mb-6 sm:mb-8">
          <Link to="/" className="hover:text-primary">Home</Link>
          <span>/</span>
          <span className="text-text-primary truncate">
            {isAllProducts ? 'All Products' : collection?.name || 'Collection'}
          </span>
        </nav>

        {/* Toolbar */}
        <div className="flex items-center justify-between mb-4 sm:mb-6 gap-3 sm:gap-4 flex-wrap">
          {/* Results Count */}
          <p className="text-text-body" style={{ fontSize: '14px' }}>
            <span className="hidden sm:inline">Showing</span> {products.length > 0 ? ((page - 1) * 12) + 1 : 0} - {Math.min(page * 12, totalProducts)} of {totalProducts}
          </p>

          <div className="flex items-center gap-2 sm:gap-4">
            {/* Mobile Filter Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden flex items-center gap-2 px-3 sm:px-4 py-2 border border-border rounded hover:border-primary transition-colors text-sm"
            >
              <FiFilter size={16} className="sm:hidden" />
              <FiFilter size={18} className="hidden sm:block" />
              <span className="hidden xs:inline">Filters</span>
              {hasActiveFilters && (
                <span className="w-2 h-2 bg-primary rounded-full"></span>
              )}
            </button>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={handleSortChange}
              className="px-2 sm:px-4 py-2 text-sm border border-form-border rounded-full focus:outline-none focus:border-primary bg-white"
              style={{ fontSize: '14px' }}
            >
              <option value="-createdAt">Newest</option>
              <option value="createdAt">Oldest</option>
              <option value="price">Price: Low-High</option>
              <option value="-price">Price: High-Low</option>
              <option value="title">Name: A-Z</option>
              <option value="-title">Name: Z-A</option>
            </select>
          </div>
        </div>

        {/* Active Filters Display */}
        {hasSearchOrFilters && (
          <div className="flex flex-wrap items-center gap-2 mb-6 sm:mb-8">
            <span className="text-sm text-text-body">Active filters:</span>
            {searchQuery && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                Search: {searchQuery}
                <button
                  onClick={() => window.location.href = '/collections/all'}
                  className="ml-1 hover:text-primary-hover"
                >
                  <FiX size={14} />
                </button>
              </span>
            )}
            {appliedMinPrice && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                Min: ₹{appliedMinPrice}
                <button
                  onClick={() => {
                    setMinPriceInput('');
                    setAppliedMinPrice('');
                  }}
                  className="ml-1 hover:text-primary-hover"
                >
                  <FiX size={14} />
                </button>
              </span>
            )}
            {appliedMaxPrice && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                Max: ₹{appliedMaxPrice}
                <button
                  onClick={() => {
                    setMaxPriceInput('');
                    setAppliedMaxPrice('');
                  }}
                  className="ml-1 hover:text-primary-hover"
                >
                  <FiX size={14} />
                </button>
              </span>
            )}
            {hasActiveFilters && (
              <button
                onClick={handleClearFilters}
                className="text-sm text-primary hover:underline ml-2"
              >
                Clear all
              </button>
            )}
          </div>
        )}

        <div className="flex gap-8">
          {/* Sidebar Filters - Desktop */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-24 border border-border rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-text-primary">Filters</h3>
                {hasActiveFilters && (
                  <button
                    onClick={handleClearFilters}
                    className="text-sm text-primary hover:underline"
                  >
                    Clear All
                  </button>
                )}
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-text-primary mb-3">
                  Price Range
                </label>
                <div className="space-y-3">
                  <input
                    type="number"
                    placeholder="Min Price"
                    value={minPriceInput}
                    onChange={(e) => setMinPriceInput(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-form-border rounded-full focus:outline-none focus:border-primary"
                    style={{ fontSize: '14px' }}
                  />
                  <input
                    type="number"
                    placeholder="Max Price"
                    value={maxPriceInput}
                    onChange={(e) => setMaxPriceInput(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-form-border rounded-full focus:outline-none focus:border-primary"
                    style={{ fontSize: '14px' }}
                  />
                </div>
              </div>

              <Button onClick={handleApplyFilters} className="w-full">
                Apply Filters
              </Button>
            </div>
          </aside>

          {/* Mobile Filters Modal */}
          {showFilters && (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 lg:hidden">
              <div className="fixed right-0 top-0 bottom-0 w-full max-w-sm bg-white shadow-xl overflow-y-auto">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-text-primary">Filters</h3>
                    <button onClick={() => setShowFilters(false)}>
                      <FiX size={24} />
                    </button>
                  </div>

                  {/* Price Range */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-text-primary mb-3">
                      Price Range
                    </label>
                    <div className="space-y-3">
                      <input
                        type="number"
                        placeholder="Min Price"
                        value={minPriceInput}
                        onChange={(e) => setMinPriceInput(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-form-border rounded-full focus:outline-none focus:border-primary"
                        style={{ fontSize: '14px' }}
                      />
                      <input
                        type="number"
                        placeholder="Max Price"
                        value={maxPriceInput}
                        onChange={(e) => setMaxPriceInput(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-form-border rounded-full focus:outline-none focus:border-primary"
                        style={{ fontSize: '14px' }}
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Button onClick={handleApplyFilters} className="w-full">
                      Apply Filters
                    </Button>
                    {hasActiveFilters && (
                      <Button
                        onClick={handleClearFilters}
                        variant="secondary"
                        className="w-full"
                      >
                        Clear All
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Products Grid */}
          <div className="flex-1">
            {loading ? (
              <div className="flex justify-center py-16">
                <Loader />
              </div>
            ) : products.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {products.map((product) => (
                    <ProductCard key={product._id} product={product} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-1 sm:gap-2 mt-8 sm:mt-12">
                    <Button
                      onClick={() => setPage(page - 1)}
                      disabled={page === 1}
                      variant="secondary"
                      className="px-3 sm:px-4 py-2 text-xs sm:text-sm"
                    >
                      <span className="hidden sm:inline">Previous</span>
                      <span className="sm:hidden">Prev</span>
                    </Button>

                    <div className="flex items-center gap-1 sm:gap-2">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
                        // Show first, last, current, and adjacent pages
                        if (
                          pageNum === 1 ||
                          pageNum === totalPages ||
                          (pageNum >= page - 1 && pageNum <= page + 1)
                        ) {
                          return (
                            <button
                              key={pageNum}
                              onClick={() => setPage(pageNum)}
                              className={`w-8 h-8 sm:w-10 sm:h-10 rounded text-xs sm:text-sm ${
                                page === pageNum
                                  ? 'bg-primary text-white'
                                  : 'border border-border hover:border-primary'
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        } else if (pageNum === page - 2 || pageNum === page + 2) {
                          return <span key={pageNum} className="text-xs sm:text-sm">...</span>;
                        }
                        return null;
                      })}
                    </div>

                    <Button
                      onClick={() => setPage(page + 1)}
                      disabled={page === totalPages}
                      variant="secondary"
                      className="px-3 sm:px-4 py-2 text-xs sm:text-sm"
                    >
                      Next
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-16">
                <p className="text-lg text-text-body mb-4">
                  No products found {hasActiveFilters && 'matching your filters'}
                </p>
                {hasActiveFilters && (
                  <Button onClick={handleClearFilters} variant="secondary">
                    Clear Filters
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Collections;
