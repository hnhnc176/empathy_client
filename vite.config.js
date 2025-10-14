import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig(({ command, mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    plugins: [
      react({
        // Enable Fast Refresh
        fastRefresh: true
      }),
      tailwindcss()
    ],
    
    // Development server configuration
    server: {
      port: 3000,
      open: true,
      hmr: {
        port: 3000,
        clientPort: 3000
      },
      proxy: {
        '/api': {
          target: env.VITE_API_BASE_URL || 'http://localhost:3019',
          changeOrigin: true,
          secure: false,
          ws: true
        }
      }
    },

    // Build configuration
    build: {
      // Output directory
      outDir: 'dist',
      
      // Generate source maps for production debugging
      sourcemap: mode === 'production' ? false : true,
      
      // Minification
      minify: mode === 'production' ? 'terser' : false,
      
      // Target modern browsers
      target: 'es2015'
    },

    // Define global constants
    define: {
      __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
      __BUILD_TIME__: JSON.stringify(new Date().toISOString())
    },

    // Path resolution
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'),
        '@components': resolve(__dirname, 'src/components'),
        '@pages': resolve(__dirname, 'src/pages'),
        '@utils': resolve(__dirname, 'src/utils'),
        '@assets': resolve(__dirname, 'src/assets'),
        '@config': resolve(__dirname, 'src/config'),
        '@services': resolve(__dirname, 'src/services'),
        '@hooks': resolve(__dirname, 'src/hooks')
      }
    },

    // Preview server (for production build testing)
    preview: {
      port: 3001,
      open: true
    }
  }
})
