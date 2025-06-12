import type { AppProps } from 'next/app';
import { AppProvider } from '@/context/AppContext';
import '@/styles/globals.css'; // If using Tailwind with PostCSS

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <AppProvider>
      <Component {...pageProps} />
    </AppProvider>
  );
}

export default MyApp;
