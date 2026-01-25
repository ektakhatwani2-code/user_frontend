import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiSearch, FiX, FiTrendingUp } from 'react-icons/fi';
import { useUI } from '../../context/UIContext';
import api from '../../services/api';

const SearchModal = () => {
  const { isSearchModalOpen, closeSearchModal } = useUI();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  // Popular search suggestions
  const popularSearches = [
    'Saree',
    'Kurti',
    'Cotton',
    'Silk',
    'Handloom',
    'Festive',
    'Wedding',
    'Casual'
  ];

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      setRecentSearches(JSON.parse(saved).slice(0, 5));
    }
  }, []);

  // Focus input when modal opens
  useEffect(() => {
    if (isSearchModalOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isSearchModalOpen]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isSearchModalOpen) {
      setQuery('');
      setResults([]);
      setShowResults(false);
      setSuggestions([]);
    }
  }, [isSearchModalOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        closeSearchModal();
      }
    };

    if (isSearchModalOpen) {
      window.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      window.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [isSearchModalOpen, closeSearchModal]);

  // Search products with debounce
  useEffect(() => {
    const searchProducts = async () => {
      if (query.trim().length < 2) {
        setResults([]);
        setShowResults(false);
        // Show suggestions based on query
        if (query.trim().length > 0) {
          const filtered = popularSearches.filter(s =>
            s.toLowerCase().includes(query.toLowerCase())
          );
          setSuggestions(filtered);
        } else {
          setSuggestions([]);
        }
        return;
      }

      setIsLoading(true);
      setSuggestions([]);
      try {
        // Try searching with the query
        const response = await api.get('/products', {
          params: {
            search: query,
            limit: 8,
            status: 'active'
          }
        });
        if (response.data.success) {
          setResults(response.data.products || []);
          setShowResults(true);
        }
      } catch (error) {
        console.error('Search error:', error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    const debounceTimer = setTimeout(searchProducts, 300);
    return () => clearTimeout(debounceTimer);
  }, [query]);

  const saveRecentSearch = (searchTerm) => {
    const updated = [searchTerm, ...recentSearches.filter(s => s !== searchTerm)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('recentSearches', JSON.stringify(updated));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      saveRecentSearch(query.trim());
      closeSearchModal();
      navigate(`/collections/all?search=${encodeURIComponent(query.trim())}`);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setQuery(suggestion);
    saveRecentSearch(suggestion);
    closeSearchModal();
    navigate(`/collections/all?search=${encodeURIComponent(suggestion)}`);
  };

  const handleResultClick = () => {
    if (query.trim()) {
      saveRecentSearch(query.trim());
    }
    closeSearchModal();
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('recentSearches');
  };

  if (!isSearchModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={closeSearchModal}
      />

      {/* Search Container */}
      <div className="relative bg-white shadow-xl">
        <div className="container-custom px-4 py-6">
          {/* Search Form */}
          <form onSubmit={handleSubmit} className="relative">
            <div className="flex items-center gap-4">
              <div className="flex-1 relative">
                <FiSearch
                  size={20}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search products..."
                  className="w-full pl-12 pr-4 py-3 border border-form-border rounded-lg text-text-primary focus:outline-none focus:border-primary"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery('')}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <FiX size={18} />
                  </button>
                )}
              </div>
              <button
                type="button"
                onClick={closeSearchModal}
                className="p-2 text-text-primary hover:text-primary transition-colors"
                aria-label="Close search"
              >
                <FiX size={24} />
              </button>
            </div>
          </form>

          {/* Suggestions - shown when query is short */}
          {!showResults && query.trim().length < 2 && (
            <div className="mt-4 max-h-[60vh] overflow-y-auto">
              {/* Autocomplete suggestions */}
              {suggestions.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-text-primary mb-3">Suggestions</h4>
                  <div className="flex flex-wrap gap-2">
                    {suggestions.map((suggestion) => (
                      <button
                        key={suggestion}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="px-3 py-1.5 bg-gray-100 rounded-full text-sm text-text-body hover:bg-primary hover:text-white transition-colors"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Recent Searches */}
              {recentSearches.length > 0 && !query && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-medium text-text-primary">Recent Searches</h4>
                    <button
                      onClick={clearRecentSearches}
                      className="text-xs text-text-body hover:text-primary"
                    >
                      Clear all
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {recentSearches.map((search, index) => (
                      <button
                        key={index}
                        onClick={() => handleSuggestionClick(search)}
                        className="px-3 py-1.5 border border-border rounded-full text-sm text-text-body hover:border-primary hover:text-primary transition-colors"
                      >
                        {search}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Popular Searches */}
              {!query && (
                <div>
                  <h4 className="text-sm font-medium text-text-primary mb-3 flex items-center gap-2">
                    <FiTrendingUp size={16} />
                    Popular Searches
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {popularSearches.map((search) => (
                      <button
                        key={search}
                        onClick={() => handleSuggestionClick(search)}
                        className="px-3 py-1.5 bg-gray-100 rounded-full text-sm text-text-body hover:bg-primary hover:text-white transition-colors"
                      >
                        {search}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="mt-4 py-8 text-center text-text-body">
              <div className="inline-block w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mb-2"></div>
              <p>Searching...</p>
            </div>
          )}

          {/* Search Results */}
          {showResults && !isLoading && (
            <div className="mt-4 max-h-[60vh] overflow-y-auto">
              {results.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {results.map((product) => (
                    <Link
                      key={product._id}
                      to={`/product/${product.slug}`}
                      onClick={handleResultClick}
                      className="group"
                    >
                      <div className="aspect-[3/4] bg-gray-100 rounded-lg overflow-hidden mb-2">
                        <img
                          src={product.images?.[0]?.url || '/placeholder.jpg'}
                          alt={product.title || product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <h4 className="text-sm font-medium text-text-primary line-clamp-1 group-hover:text-primary transition-colors">
                        {product.title || product.name}
                      </h4>
                      <p className="text-sm text-text-body">
                        {product.compareAtPrice ? (
                          <>
                            <span className="text-primary font-medium">
                              ₹{product.price?.toLocaleString()}
                            </span>
                            <span className="line-through ml-2 text-gray-400">
                              ₹{product.compareAtPrice.toLocaleString()}
                            </span>
                          </>
                        ) : (
                          <span>₹{product.price?.toLocaleString()}</span>
                        )}
                      </p>
                    </Link>
                  ))}
                </div>
              ) : query.trim().length >= 2 ? (
                <div className="py-8 text-center text-text-body">
                  <p className="mb-4">No products found for "{query}"</p>
                  <p className="text-sm">Try searching for:</p>
                  <div className="flex flex-wrap justify-center gap-2 mt-3">
                    {popularSearches.slice(0, 4).map((search) => (
                      <button
                        key={search}
                        onClick={() => handleSuggestionClick(search)}
                        className="px-3 py-1.5 bg-gray-100 rounded-full text-sm text-text-body hover:bg-primary hover:text-white transition-colors"
                      >
                        {search}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}

              {/* View All Results */}
              {results.length > 0 && (
                <div className="mt-6 text-center">
                  <button
                    onClick={handleSubmit}
                    className="inline-block px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors"
                  >
                    View all results for "{query}"
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchModal;
