// vite.config.js
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import Icons from 'unplugin-icons/vite'
import path from 'path'

export default defineConfig(({ mode }) => {
  // Load only VITE_ prefixed environment variables for security
  const env = loadEnv(mode, process.cwd(), 'VITE_')
  
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
        '@shared': path.resolve(__dirname, './src'),
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
        // No external dependencies needed
      },
    },
    define: {
      // Only expose specific environment variables for security
      'process.env.NODE_ENV': JSON.stringify(mode),
      // Ensure VITE_ prefixed variables are properly exposed
      ...envWithStringValues
    }
  }
})