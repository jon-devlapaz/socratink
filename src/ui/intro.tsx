import { Button } from '@/components/ui/button';

const starters = ['I keep mixing up', 'I want to understand why', 'Check whether I really understand'];

export function Intro() {
	return (
		<section className="intro" aria-labelledby="intro-title">
			<h1 id="intro-title">Make the thinking your own.</h1>
			<p>
				Bring something you want to understand. Your tutor asks questions and offers hints as you work through it.
			</p>
		</section>
	);
}

export function IntroStarters({ onSelect }: { onSelect: (starter: string) => void }) {
	return (
		<ul className="intro-starters" aria-label="Ways to start">
			{starters.map((starter) => (
				<li key={starter}>
					<Button variant="outline" className="intro-starter" type="button" onClick={() => onSelect(starter)}>
						{starter}…
					</Button>
				</li>
			))}
		</ul>
	);
}
