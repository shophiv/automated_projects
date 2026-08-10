import { useEffect, useState } from 'react';

export const useBarcode = (onScan: (barcode: string) => void) => {
  const [buffer, setBuffer] = useState('');

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing inside an input element unless it's designated
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
        return;
      }

      if (e.key === 'Enter') {
        if (buffer.trim().length > 0) {
          onScan(buffer.trim());
          setBuffer('');
        }
        return;
      }

      if (e.key.length === 1) {
        setBuffer((prev) => prev + e.key);
        clearTimeout(timeout);
        timeout = setTimeout(() => {
          setBuffer('');
        }, 100); // barcode scanner speed threshold
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      clearTimeout(timeout);
    };
  }, [buffer, onScan]);
};