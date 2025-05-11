'use client';

import { useEffect } from 'react';

interface StructuredDataProps {
  data: Record<string, any>;
}

export default function StructuredData({ data }: StructuredDataProps) {
  useEffect(() => {
    // Add the structured data to the page
    const script = document.createElement('script');
    script.setAttribute('type', 'application/ld+json');
    script.textContent = JSON.stringify(data);
    document.head.appendChild(script);

    // Clean up when component unmounts
    return () => {
      document.head.removeChild(script);
    };
  }, [data]);

  // This component doesn't render anything
  return null;
}
