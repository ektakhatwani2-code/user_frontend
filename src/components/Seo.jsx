import { Helmet } from 'react-helmet-async';

const SITE_URL = 'https://ektaacouture.store';
const SITE_NAME = 'Ektaa Couture';
const DEFAULT_TITLE = 'Ektaa Couture - Handwoven Fashion & Designer Sarees';
const DEFAULT_DESCRIPTION =
  'Shop authentic handwoven sarees, designer suits, and traditional Indian couture at Ektaa Couture. Curated collections, fast shipping across India.';
const DEFAULT_OG_IMAGE = `${SITE_URL}/og-default.jpg`;

const Seo = ({
  title,
  description = DEFAULT_DESCRIPTION,
  path = '',
  image,
  type = 'website',
  noindex = false,
  jsonLd,
}) => {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : DEFAULT_TITLE;
  const canonical = `${SITE_URL}${path}`;
  const ogImage = image || DEFAULT_OG_IMAGE;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonical} />
      {noindex ? (
        <meta name="robots" content="noindex,nofollow" />
      ) : (
        <meta name="robots" content="index,follow,max-image-preview:large" />
      )}

      <meta property="og:type" content={type} />
      <meta property="og:url" content={canonical} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content="en_IN" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      {jsonLd &&
        (Array.isArray(jsonLd) ? jsonLd : [jsonLd]).map((data, i) => (
          <script key={i} type="application/ld+json">
            {JSON.stringify(data)}
          </script>
        ))}
    </Helmet>
  );
};

export default Seo;
