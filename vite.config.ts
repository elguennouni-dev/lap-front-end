import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      
      // 🛑 FIX: Define 'global' and 'process' for sockjs-client compatibility
      define: {
        // Required fix for global is not defined error
        global: 'window', 
        
        // Prevents reference errors if libraries try to access process.env 
        // (often necessary when using Node-compatible libraries in a browser environment)
        'process.env': {}, 

        // Keep existing definitions
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});