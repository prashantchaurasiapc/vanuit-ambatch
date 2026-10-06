/**
 * Storage Helper Utility
 * Prevents QuotaExceededError crashes when writing to localStorage.
 */

export const safeSetItem = (key, value) => {
  try {
    const stringified = typeof value === 'string' ? value : JSON.stringify(value);
    localStorage.setItem(key, stringified);
  } catch (error) {
    console.warn(`[Storage Warning] Failed to write key "${key}":`, error);
    
    // QuotaExceededError Recovery: Clean up redundant legacy keys
    try {
      localStorage.removeItem('app_quotes_v1');
      localStorage.removeItem('app_quotes');
      localStorage.removeItem('app_leads');
      localStorage.removeItem('app_tasks');
      
      const stringified = typeof value === 'string' ? value : JSON.stringify(value);
      localStorage.setItem(key, stringified);
      console.log(`[Storage Recovery] Successfully saved "${key}" after clearing legacy keys.`);
    } catch (innerError) {
      console.error(`[Storage Error] Unable to save "${key}" even after recovery cleanup:`, innerError);
    }
  }
};

export const safeGetItem = (key, fallback = null) => {
  try {
    const item = localStorage.getItem(key);
    return item !== null ? item : fallback;
  } catch (e) {
    console.warn(`[Storage Warning] Failed to read key "${key}":`, e);
    return fallback;
  }
};

/**
 * Compress an Image File or DataURL using Canvas HTML5 API
 * Reduces photo payload size to ~50-150KB for safe storage and instant loading.
 */
export const compressImage = (fileOrDataUrl, maxDimension = 1200, quality = 0.82) => {
  return new Promise((resolve) => {
    try {
      const img = new Image();
      const processImage = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            maxDimension = height;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedDataUrl);
      };

      img.onload = processImage;
      img.onerror = () => {
        // Fallback to original if compression fails
        if (typeof fileOrDataUrl === 'string') resolve(fileOrDataUrl);
        else resolve(URL.createObjectURL(fileOrDataUrl));
      };

      if (typeof fileOrDataUrl === 'string') {
        img.src = fileOrDataUrl;
      } else {
        const reader = new FileReader();
        reader.onload = (e) => {
          img.src = e.target.result;
        };
        reader.readAsDataURL(fileOrDataUrl);
      }
    } catch (e) {
      console.warn('[Image Compress Error]', e);
      resolve(typeof fileOrDataUrl === 'string' ? fileOrDataUrl : '');
    }
  });
};

