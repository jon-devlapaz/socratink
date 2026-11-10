import { defineConfig } from 'vite';

// Server bundle: dist/app.mjs (the Hono app, for Vercel) and dist/server.mjs (Node entry).
export default defineConfig({
	build: {
		ssr: true,
		target: 'node22',
		outDir: 'dist',
		sourcemap: true,
		rollupOptions: {
			input: { app: 'src/app.ts', server: 'src/server.ts' },
			output: { format: 'es', entryFileNames: '[name].mjs', chunkFileNames: 'chunks/[name]-[hash].mjs' },
		},
	},
});
