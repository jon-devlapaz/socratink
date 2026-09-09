import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

const rootDir = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
	root: 'src/ui',
	build: {
		outDir: '../../dist/client',
		emptyOutDir: true,
		rollupOptions: {
			input: {
				main: resolve(rootDir, 'src/ui/index.html'),
				login: resolve(rootDir, 'src/ui/login.html'),
			},
		},
	},
});
