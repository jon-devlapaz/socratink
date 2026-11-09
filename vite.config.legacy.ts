import { flue } from '@flue/vite';
import { defineConfig } from 'vite';

// Compatibility fixture and rollback artifact; normal builds default to Pi.
export default defineConfig({
	plugins: [flue({ app: './src/legacy-app.ts' })],
	build: { outDir: 'dist/legacy' },
});
