/**
 * Safe LocalStorage wrapper that prevents QuotaExceededError or SecurityError
 * from crashing the React application tree.
 */

export function safeSetItem(key: string, value: string): boolean {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (err) {
    console.warn(`[SafeStorage] localStorage quota exceeded or error on key "${key}":`, err);

    // If quota exceeded on properties, save a slimmed-down offline cache without heavy data URLs
    if (key === 'yama_properties') {
      try {
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed)) {
          const lightweightProperties = parsed.map((p) => {
            // Keep cover image if external URL or short; otherwise truncate long data URLs for offline storage
            const safeImage =
              typeof p.image === 'string' && p.image.startsWith('data:') && p.image.length > 80000
                ? 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80'
                : p.image;

            const safeImages = Array.isArray(p.images)
              ? p.images.map((img: string) =>
                  typeof img === 'string' && img.startsWith('data:') && img.length > 80000
                    ? safeImage
                    : img
                )
              : [safeImage];

            // Strip heavy embedded video data URLs from local storage cache
            const safeVideoUrl =
              typeof p.videoUrl === 'string' && p.videoUrl.startsWith('data:')
                ? ''
                : p.videoUrl;

            return {
              ...p,
              image: safeImage,
              images: safeImages,
              videoUrl: safeVideoUrl,
            };
          });

          localStorage.setItem(key, JSON.stringify(lightweightProperties));
          return true;
        }
      } catch {}
    }
    return false;
  }
}

export function safeGetItem(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function safeRemoveItem(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch {}
}
