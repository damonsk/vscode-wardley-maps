import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
	plugins: [react()],
	root: './src',
	publicDir: '../public',
	resolve: {
		alias: {
			'next/router': path.resolve(__dirname, 'src/shims/next-router.js'),
			'@mui/styles': path.resolve(__dirname, 'src/shims/mui-styles.js'),
		}
	},
	build: {
		outDir: '../build',
		emptyOutDir: true,
		rollupOptions: {
			input: path.resolve(__dirname, 'src/index.html'),
			output: {
				entryFileNames: 'static/js/[name].[hash].js',
				chunkFileNames: 'static/js/[name].[hash].js',
				assetFileNames: 'static/[ext]/[name].[hash].[ext]',
				sourcemapExcludeSources: false
			}
		},
		sourcemap: mode === 'development' ? 'inline' : true,
		minify: mode === 'development' ? false : 'esbuild',
		target: 'es2020'
	},
	css: {
		preprocessorOptions: {
			scss: {
				// Remove automatic Bootstrap import to avoid conflicts
				// Import Bootstrap manually in component files if needed
			}
		}
	},
	define: {
		// Define any global constants here if needed
		'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development')
	},
	server: {
		port: 3000,
		open: false,
		cors: true,
		sourcemapIgnoreList: false
	},
	optimizeDeps: {
		include: [
			'react',
			'react-dom',
			'react-bootstrap',
			'@mui/material',
			'@mui/icons-material',
			'styled-components'
		]
	}
}))
