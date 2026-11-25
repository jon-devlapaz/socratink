import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createElement } from 'react';
import { renderToString } from 'react-dom/server';
import tailwindcss from '@tailwindcss/vite';
import { createServer, defineConfig, type Plugin, type ViteDevServer } from 'vite';
import { appConfig } from './src/config/app.config.ts';

const rootDir = dirname(fileURLToPath(import.meta.url));
const ui = resolve(rootDir, 'src/ui');
const alias = { '@': ui };

function renderPages(): Plugin {
	let renderer: Promise<ViteDevServer> | undefined;
	return {
		name: 'socratink-static-pages',
		transformIndexHtml: {
			order: 'pre',
			async handler(html, { path, server }) {
				const pageServer = server ?? await (renderer ??= createServer({
					root: ui,
					configFile: false,
					resolve: { alias },
					server: { middlewareMode: true, watch: null, hmr: false },
					appType: 'custom',
				}));
				const { ChatPage, LoginPage, NotFoundPage } = await pageServer.ssrLoadModule('/pages.tsx');
				const page = path === '/login.html' ? LoginPage : path === '/404.html' ? NotFoundPage : ChatPage;
				return html.replace('<!--page-->', () => renderToString(createElement(page)));
			},
		},
		async closeBundle() {
			await (await renderer)?.close();
		},
	};
}

const htmlConstants: Record<string, string> = {
	THEME_STORAGE_KEY: appConfig.themeStorageKey,
	TYPE_SIZE_STORAGE_KEY: appConfig.typeSizeStorageKey,
};

export default defineConfig({
	root: ui,
	resolve: { alias },
	plugins: [renderPages(), tailwindcss(), {
		name: 'socratink-html-constants',
		transformIndexHtml: (html) => html.replace(/%SOCRATINK_([A-Z_]+)%/g, (placeholder, name: string) => {
			const value = htmlConstants[name];
			if (value === undefined) throw new Error(`Unknown HTML constant ${placeholder}`);
			return value;
		}),
	}, {
		name: 'vercel-web-analytics',
		apply: 'build',
		transformIndexHtml(_html, { path }) {
			if (process.env.VERCEL_ENV !== 'production' || (path !== '/index.html' && path !== '/login.html')) return;
			return [{
				tag: 'script',
				attrs: { defer: true, src: '/_vercel/insights/script.js' },
				injectTo: 'head',
			}];
		},
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
