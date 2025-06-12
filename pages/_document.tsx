import { Html, Head, Main, NextScript } from 'next/document';
import Script from 'next/script';

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* Tailwind CSS CDN */}
        <link href="https://cdn.tailwindcss.com" rel="stylesheet" />
        
        {/* pdf.js library */}
        <Script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js" strategy="beforeInteractive" />
        
        {/* mammoth.js library */}
        <Script src="https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.6.0/mammoth.browser.min.js" strategy="beforeInteractive" />
      </Head>
      <body className="bg-gray-100">
        <Main />
        <NextScript />
        {/* Configure pdf.js worker. This runs after pdf.js is loaded. */}
        <Script id="pdf-worker-config" strategy="afterInteractive">
          {`
            if (typeof pdfjsLib !== 'undefined') {
              pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
            } else {
              console.warn('pdfjsLib is not defined when trying to set workerSrc. Ensure pdf.min.js is loaded.');
            }
          `}
        </Script>
      </body>
    </Html>
  );
}
