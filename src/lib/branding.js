import { useEffect, useState } from 'react';
import { apiRequest } from './api';

export const DEFAULT_BRANDING = {
  favicon: '/images/branding/ieee-ras-logo.png',
  officialIdentity: {
    jssateb: '/images/branding/jssateb-logo.png',
    ieee: '/images/branding/ieee-logo.png',
    ieeeRas: '/images/branding/ieee-ras-logo.png',
  },
};

export async function loadBranding() {
  const { assets } = await apiRequest('branding');
  const officialIdentity = { ...DEFAULT_BRANDING.officialIdentity };
  for (const asset of assets) {
    const key = asset.asset_key === 'ieeeRas' ? 'ieeeRas' : asset.asset_key;
    if (Object.hasOwn(officialIdentity, key)) officialIdentity[key] = asset.public_url;
  }
  return { favicon: officialIdentity.ieeeRas, officialIdentity };
}

export function useBranding() {
  const [branding, setBranding] = useState(DEFAULT_BRANDING);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let active = true;
    const refresh = async () => {
      try {
        const next = await loadBranding();
        if (active) {
          setBranding(next);
          setErrorMessage('');
        }
      } catch (error) {
        if (active) setErrorMessage(error.message);
      }
    };

    const handleUpdate = () => void refresh();
    void refresh();
    window.addEventListener('branding:updated', handleUpdate);
    return () => {
      active = false;
      window.removeEventListener('branding:updated', handleUpdate);
    };
  }, []);

  return { branding, errorMessage };
}

export function validateUploadedLogo(file) {
  const allowedTypes = ['image/png', 'image/jpeg', 'image/webp'];
  if (!file) return { valid: false, message: 'Select an image file first.' };
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, message: 'Choose a PNG, JPG, or WebP image. SVG uploads are disabled for safety.' };
  }
  if (file.size > 2 * 1024 * 1024) {
    return { valid: false, message: 'Logo files must be 2 MB or smaller.' };
  }
  return { valid: true, message: 'Approved logo file.' };
}

export async function validateImageDimensions(file) {
  const image = new Image();
  const objectUrl = URL.createObjectURL(file);
  try {
    const dimensions = await new Promise((resolve, reject) => {
      image.onload = () => resolve({ width: image.naturalWidth, height: image.naturalHeight });
      image.onerror = () => reject(new Error('The selected file is not a readable image.'));
      image.src = objectUrl;
    });

    if (dimensions.width < 32 || dimensions.height < 32 || dimensions.width > 4096 || dimensions.height > 4096) {
      throw new Error('Image dimensions must be between 32 × 32 and 4096 × 4096 pixels.');
    }
    return dimensions;
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}
