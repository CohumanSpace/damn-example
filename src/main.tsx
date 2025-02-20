import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { ConvexProvider, ConvexReactClient } from 'convex/react';
import { ThemeProvider } from './components/theme-provider.tsx';
import { Toaster } from '@/components/ui/toaster.tsx';

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <ConvexProvider client={convex}>
        <App />
        <Toaster />
      </ConvexProvider>
    </ThemeProvider>
  </StrictMode>,
);
