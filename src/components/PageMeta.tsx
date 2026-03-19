import { Helmet } from 'react-helmet-async';

const SITE_NAME = 'RePaw';
const BASE_URL = 'https://repaw-pi.vercel.app';
const DEFAULT_DESCRIPTION = 'RePawは犬服のリユースを通じて環境保護と動物保護団体への支援を実現します。高品質な犬服を手頃な価格で提供し、持続可能な社会づくりに貢献しています。';

interface PageMetaProps {
    title?: string;
    description?: string;
    image?: string;
    path?: string;
    type?: 'website' | 'article' | 'product';
    noindex?: boolean;
    jsonLd?: object;
}

export default function PageMeta({
    title,
    description,
    image,
    path,
    type = 'website',
    noindex = false,
    jsonLd,
}: PageMetaProps) {
    const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} - 犬服のリユースで社会貢献`;
    const desc = description || DEFAULT_DESCRIPTION;
    const canonical = path ? `${BASE_URL}${path}` : BASE_URL;

    return (
        <Helmet>
            <title>{fullTitle}</title>
            <meta name="description" content={desc} />
            <link rel="canonical" href={canonical} />
            {noindex && <meta name="robots" content="noindex,nofollow" />}

            {/* OGP */}
            <meta property="og:site_name" content={SITE_NAME} />
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={desc} />
            <meta property="og:type" content={type} />
            <meta property="og:url" content={canonical} />
            {image && <meta property="og:image" content={image} />}

            {/* Twitter Card */}
            <meta name="twitter:card" content={image ? 'summary_large_image' : 'summary'} />
            <meta name="twitter:title" content={fullTitle} />
            <meta name="twitter:description" content={desc} />
            {image && <meta name="twitter:image" content={image} />}

            {/* JSON-LD */}
            {jsonLd && (
                <script type="application/ld+json">
                    {JSON.stringify(jsonLd)}
                </script>
            )}
        </Helmet>
    );
}
