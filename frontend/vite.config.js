// vite.config.js
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import Icons from 'unplugin-icons/vite'
import path from 'path'

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '')
  
  // Create a properly formatted env object with string values
  const envWithStringValues = {}
  Object.keys(env).forEach(key => {
    envWithStringValues[key] = JSON.stringify(env[key])
  })
  
  return {
    plugins: [
      vue(),
      Icons({
        compiler: 'vue3',
        autoInstall: true,
      }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@shared': path.resolve(__dirname, '../shared'),
      },
    },
    optimizeDeps: {
      include: ['firebase/app', 'firebase/auth', 'firebase/firestore', 'firebase/storage', 'firebase/analytics'],
    },
    // Add server proxy configuration
    server: {
      proxy: {
        '/api': {
          target: 'http://localhost:3000',
          changeOrigin: true,
          secure: false,
          // Optional: log proxy requests
          configure: (proxy, _options) => {
            proxy.on('error', (err, _req, _res) => {
              console.log('proxy error', err);
            });
            proxy.on('proxyReq', (proxyReq, req, _res) => {
              console.log('Sending Request to the Target:', req.method, req.url);
            });
            proxy.on('proxyRes', (proxyRes, req, _res) => {
              console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
            });
          },
        },
      },
    },
    // Vite options tailored for Vercel deployments
    build: {
      rollupOptions: {
        external: ['@shared/firebase'],
      },
    },
    define: {
      // Support both process.env and import.meta.env
      'process.env': env,
      // Ensure VITE_ prefixed variables are properly exposed
      ...envWithStringValues
    }
  }
})