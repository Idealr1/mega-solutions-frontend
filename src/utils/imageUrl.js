/**
 * Normalizes image URLs from the API to ensure they point to the correct storage base.
 * Handles discrepancies between localhost:80 and 127.0.0.1:8000.
 */
export const getImageUrl = (path) => {
    if (!path) return null;

    // If it's already a full URL but points to localhost (missing port 8000), fix it
    if (typeof path === 'string' && path.startsWith('http')) {
        const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api';
        const apiRoot = apiBase.replace(/\/api\/?$/, ''); // e.g., http://127.0.0.1:8000

        // If the URL has 'localhost/storage' or '127.0.0.1/storage' without port 8000
        if (path.includes('localhost/storage') && !path.includes(':8000')) {
            return path.replace('localhost', '127.0.0.1:8000');
        }
        if (path.includes('127.0.0.1/storage') && !path.includes(':8000')) {
            return path.replace('127.0.0.1', '127.0.0.1:8000');
        }

        return path;
    }

    // If it's a relative path, prepend the API root
    const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api';
    const apiRoot = apiBase.replace(/\/api\/?$/, '');
    const suffix = path.startsWith('/') ? path : `/${path}`;

    return `${apiRoot}${suffix}`;
};

export default getImageUrl;
