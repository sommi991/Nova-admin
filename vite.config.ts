import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import checker from 'vite-plugin-checker'
import compression from 'vite-plugin-compression'
import analyzer from 'vite-plugin-analyzer'
import path from 'path'

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  
  const isProd = mode === 'production'
  const isDev = mode === 'development'
  const isAnalyze = mode === 'analyze'

  return {
    plugins: [
      react({
        fastRefresh: isDev,
        babel: {
          plugins: [
            isDev && require.resolve('react-refresh/babel'),
          ].filter(Boolean),
        },
      }),
      
      // TypeScript checker
      checker({
        typescript: true,
        eslint: {
          lintCommand: 'eslint "./src/**/*.{ts,tsx}"',
          dev: { logLevel: ['error'] },
        },
        overlay: {
          initialIsOpen: false,
          position: 'tl',
        },
      }),

      // Compression for production
      isProd && compression({
        algorithm: 'gzip',
        ext: '.gz',
        threshold: 1024,
        deleteOriginFile: false,
      }),

      isProd && compression({
        algorithm: 'brotliCompress',
        ext: '.br',
        threshold: 1024,
        deleteOriginFile: false,
      }),

      // Bundle analyzer
      isAnalyze && analyzer(),
    ].filter(Boolean),

    // Base public path
    base: '/',

    // Build configuration
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: isProd ? 'hidden' : true,
      minify: isProd ? 'terser' : false,
      target: 'es2020',
      modulePreload: true,
      
      rollupOptions: {
        input: {
          main: path.resolve(__dirname, 'index.html'),
        },
        output: {
          manualChunks: (id) => {
            // React core
            if (id.includes('node_modules/react/') || 
                id.includes('node_modules/react-dom/') ||
                id.includes('node_modules/react-router-dom/')) {
              return 'vendor-react'
            }
            
            // UI libraries
            if (id.includes('node_modules/framer-motion/') ||
                id.includes('node_modules/lucide-react/') ||
                id.includes('node_modules/recharts/')) {
              return 'vendor-ui'
            }
            
            // State management
            if (id.includes('node_modules/zustand/') ||
                id.includes('node_modules/immer/')) {
              return 'vendor-state'
            }
            
            // 3D libraries
            if (id.includes('node_modules/three/') ||
                id.includes('node_modules/@react-three/')) {
              return 'vendor-3d'
            }
            
            // Data utilities
            if (id.includes('node_modules/@faker-js/') ||
                id.includes('node_modules/date-fns/') ||
                id.includes('node_modules/uuid/')) {
              return 'vendor-data'
            }
            
            // Vendor chunk for everything else
            if (id.includes('node_modules')) {
              return 'vendor'
            }
          },
          chunkFileNames: isProd 
            ? 'assets/js/[name]-[hash].js'
            : 'assets/js/[name].js',
          entryFileNames: isProd
            ? 'assets/js/[name]-[hash].js'
            : 'assets/js/[name].js',
          assetFileNames: (assetInfo) => {
            const info = assetInfo.name?.split('.') || []
            const ext = info[info.length - 1]
            
            if (/\.(png|jpe?g|gif|svg|webp|ico)$/.test(assetInfo.name || '')) {
              return `assets/images/[name]-[hash].[ext]`
            }
            
            if (/\.(woff2?|ttf|eot)$/.test(assetInfo.name || '')) {
              return `assets/fonts/[name]-[hash].[ext]`
            }
            
            return `assets/[name]-[hash].[ext]`
          },
        },
      },

      terserOptions: isProd ? {
        compress: {
          drop_console: true,
          drop_debugger: true,
          pure_funcs: ['console.log', 'console.info', 'console.debug'],
        },
        format: {
          comments: false,
        },
      } : undefined,

      // Report compressed size
      reportCompressedSize: true,

      // Chunk size warning limit
      chunkSizeWarningLimit: 1000,
    },

    // Development server
    server: {
      port: 3000,
      host: true,
      open: true,
      strictPort: true,
      historyApiFallback: true,
      
      proxy: {
        '/api': {
          target: env.VITE_API_URL || 'http://localhost:4000',
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
        '/ws': {
          target: env.VITE_WS_URL || 'ws://localhost:4000',
          ws: true,
        },
      },

      // Warmup files for faster dev startup
      warmup: {
        clientFiles: [
          './src/main.tsx',
          './src/App.tsx',
          './src/pages/**/*.tsx',
          './src/components/**/*.tsx',
        ],
      },
    },

    // Preview server
    preview: {
      port: 5000,
      host: true,
      open: true,
      strictPort: true,
    },

    // Resolve aliases
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@components': path.resolve(__dirname, './src/components'),
        '@pages': path.resolve(__dirname, './src/pages'),
        '@hooks': path.resolve(__dirname, './src/hooks'),
        '@utils': path.resolve(__dirname, './src/utils'),
        '@types': path.resolve(__dirname, './src/types'),
        '@services': path.resolve(__dirname, './src/services'),
        '@store': path.resolve(__dirname, './src/store'),
        '@assets': path.resolve(__dirname, './src/assets'),
        '@styles': path.resolve(__dirname, './src/styles'),
      },
    },

    // Environment variables
    define: {
      'process.env': {},
      __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
      __APP_NAME__: JSON.stringify(process.env.npm_package_name),
      __DEV__: isDev,
      __PROD__: isProd,
    },

    // CSS configuration
    css: {
      modules: {
        localsConvention: 'camelCase',
        scopeBehaviour: 'local',
      },
      preprocessorOptions: {
        scss: {
          additionalData: '@import "./src/styles/variables.scss";',
        },
      },
      postcss: {
        plugins: [
          require('tailwindcss'),
          require('autoprefixer'),
        ],
      },
    },

    // Dependency optimization
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'react-router-dom',
        'framer-motion',
        'zustand',
        'immer',
        'axios',
        'date-fns',
        'recharts',
        'lucide-react',
      ],
      exclude: ['@faker-js/faker'],
    },

    // ESBuild options
    esbuild: {
      logOverride: { 'this-is-undefined-in-esm': 'silent' },
      supported: {
        'top-level-await': true,
      },
    },

    // Performance hints
    logLevel: isProd ? 'silent' : 'info',
    clearScreen: false,
  }
})
