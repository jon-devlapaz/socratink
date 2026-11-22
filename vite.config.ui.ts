import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import { appConfig } from './src/config/app.config.ts';

const rootDir = dirname(fileURLToPath(import.meta.url));
const htmlConstants: Record<string, string> = {
	THEME_STORAGE_KEY: appConfig.themeStorageKey,
	TYPE_SIZE_STORAGE_KEY: appConfig.typeSizeStorageKey,
};

export default defineConfig({
	root: 'src/ui',
	plugins: [{
		name: 'socratink-html-constants',
		transformIndexHtml: (html) => html.replace(/%SOCRATINK_([A-Z_]+)%/g, (placeholder, name: string) => {
			const value = htmlConstants[name];
			if (value === undefined) throw new Error(`Unknown HTML constant ${placeholder}`);
			return value;
		}),
	}],
	build: {
		outDir: '../../dist/client',
		emptyOutDir: true,
		rollupOptions: {
			input: {
				main: resolve(rootDir, 'src/ui/index.html'),
				login: resolve(rootDir, 'src/ui/login.html'),
				notFound: resolve(rootDir, 'src/ui/404.html'),
			},
		},
	},
});
