import path from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig({
    root: path.resolve(__dirname, 'src/view'),
    publicDir: path.resolve(__dirname, 'public'),
    build: {
        outDir: path.resolve(__dirname, 'dist'),
        emptyOutDir: true,
    },
    server: {
        port: 5173,
    },
});
