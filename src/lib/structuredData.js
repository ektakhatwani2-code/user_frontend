const SITE_URL = 'https://ektaacouture.store';
const SITE_NAME = 'Ektaa Couture';

export const organizationSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: SITE_NAME,
  url: SITE_URL,
  logo: `${SITE_URL}/logo.jpeg`,
  sameAs: [],
});

export const websiteSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: SITE_NAME,
  url: SITE_URL,
  potentialAction: {
    '@type': 'SearchAction',
    target: `${SITE_URL}/collections/all?search={search_term_string}`,
    'query-input': 'required name=search_term_string',
  },
});

export const productSchema = (product) => {
  if (!product) return null;

  const images = (product.images || [])
    .filter((img) => img && img.url)
    .map((img) => img.url);

  const tracked = product.inventory?.trackQuantity !== false;
  const qty = product.inventory?.quantity ?? 0;
  const allowBackorder = product.inventory?.allowBackorder === true;

  let availability = 'https://schema.org/InStock';
  if (tracked && qty === 0) {
    availability = allowBackorder
      ? 'https://schema.org/BackOrder'
      : 'https://schema.org/OutOfStock';
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: product.seo?.metaDescription || product.description,
    image: images.length ? images : undefined,
    sku: product.sku || undefined,
    brand: { '@type': 'Brand', name: SITE_NAME },
    offers: {
      '@type': 'Offer',
      url: `${SITE_URL}/product/${product.slug}`,
      priceCurrency: 'INR',
      price: product.price,
      availability,
      itemCondition: 'https://schema.org/NewCondition',
    },
  };
};

export const breadcrumbSchema = (items) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((item, idx) => ({
    '@type': 'ListItem',
    position: idx + 1,
    name: item.name,
    item: `${SITE_URL}${item.path}`,
  })),
});
