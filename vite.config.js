import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url)),
        },
    },
    server: {
        port: 3000,
        open: true,
        proxy: {
            '/api': {
                target: 'https://emdbe.ducbkdn.space',
                changeOrigin: true,
                secure: false,
                rewrite: (path) => path,
            },
            '/auth': {
                target: 'https://emdbe.ducbkdn.space',
                changeOrigin: true,
                secure: false,
                rewrite: (path) => path,
            },
        },
    },
});
