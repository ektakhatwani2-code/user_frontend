import { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';

const CollectionContext = createContext();

export const useCollections = () => {
  const context = useContext(CollectionContext);
  if (!context) {
    throw new Error('useCollections must be used within CollectionProvider');
  }
  return context;
};

export const CollectionProvider = ({ children }) => {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCollections = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/collections');
      if (response.data.success) {
        // Only show visible collections, sorted by sortOrder
        const visibleCollections = response.data.collections
          .filter((collection) => collection.isVisible)
          .sort((a, b) => a.sortOrder - b.sortOrder);
        setCollections(visibleCollections);
      }
    } catch (err) {
      console.error('Error fetching collections:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCollections();
  }, []);

  const value = {
    collections,
    loading,
    error,
    refetchCollections: fetchCollections,
  };

  return (
    <CollectionContext.Provider value={value}>
      {children}
    </CollectionContext.Provider>
  );
};

export default CollectionContext;
