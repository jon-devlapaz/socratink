import { Button } from '@/components/ui/button';
import wordmark from './brand-wordmark.png';

export function NotFoundPage() {
	return (
		<main className="app-canvas not-found" aria-labelledby="not-found-title">
			<img className="not-found-wordmark" src={wordmark} alt="Socratink" />
			<p className="not-found-code">404</p>
			<h1 id="not-found-title">Page not found</h1>
			<nav aria-label="Find your way back">
				<Button asChild variant="link">
					<a href="/">Home</a>
				</Button>
				<Button asChild variant="link">
					<a href="/login">Sign in</a>
				</Button>
			</nav>
		</main>
	);
}
