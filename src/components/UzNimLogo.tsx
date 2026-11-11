import React from 'react';
import { UZNIM_LOGO_BASE64, UZNIM_LOGO_SRC } from '../assets/logo';

export const UzNimLogo: React.FC<{ 
  className?: string; 
  size?: number;
  width?: number;
  height?: number;
}> = ({ 
  className = '', 
  size = 52,
  width,
  height,
}) => {
  // Original logo dimensions: 107 x 76 (aspect ratio ~ 1.408)
  const calculatedHeight = height || size;
  const calculatedWidth = width || Math.round(calculatedHeight * 1.408);

  return (
    <img 
      src={UZNIM_LOGO_BASE64 || UZNIM_LOGO_SRC}
      alt="O‘zbekiston Milliy Metrologiya Instituti logotipi"
      width={calculatedWidth}
      height={calculatedHeight}
      className={`inline-block object-contain select-none ${className}`}
      style={{
        height: `${calculatedHeight}px`,
        width: `${calculatedWidth}px`,
        maxWidth: '100%',
      }}
      loading="eager"
      decoding="sync"
    />
  );
};

export const UzakkBadge: React.FC<{
  height?: number;
  className?: string;
}> = ({
  height = 104,
  className = '',
}) => {
  return (
    <img
      src="/assets/aistudio/uzakk_b31df24f.png"
      alt="ILAC-MRA va O‘ZAKK akkreditatsiya belgisi (O‘ZAK.KL.0013)"
      className={`inline-block object-contain select-none ${className}`}
      style={{
        height: `${height}px`,
        width: 'auto',
        maxWidth: '100%',
      }}
      loading="eager"
      decoding="sync"
    />
  );
};

export const QrCodeSvg: React.FC<{ size?: number; text?: string; className?: string }> = ({ 
  size = 104, 
  className = '' 
}) => {
  return (
    <img
      src="/assets/aistudio/qr-code_2e7a8d81.png"
      alt="O‘zMMI QR-kod"
      width={size}
      height={size}
      className={`inline-block select-none shrink-0 ${className}`}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        objectFit: 'fill',
      }}
      loading="eager"
      decoding="sync"
    />
  );
};

