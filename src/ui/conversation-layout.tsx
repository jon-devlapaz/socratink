import { useRef } from 'react';
import { AnimatedShinyText } from '@/components/magicui/animated-shiny-text';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Bookmark, ChevronDown } from 'lucide-react';

import type { TranscriptContent } from './chat-surface.tsx';
import { Intro, IntroStarters, withStarter } from './intro.tsx';

export function ConversationLayout({ history, active, questionActive }: TranscriptContent) {
	const message = useRef<HTMLTextAreaElement>(null);

	function startDraft(starter: string) {
		const input = message.current;
		if (!input || input.disabled) return;
		input.setRangeText(withStarter(input.value, starter), 0, input.value.length, 'end');
		input.dispatchEvent(new Event('input', { bubbles: true }));
		input.focus();
	}

	return (
		<div className="conversation-layout">
			<main id="main-content" className="stage" tabIndex={-1}>
				<Intro />
				<Card
					role="region"
					className="active-node gap-0 rounded-none border-0 bg-transparent py-0 shadow-none"
					aria-label="Current step"
				>
					<h1 className="sr-only">Your conversation</h1>
					<Button
						size="sm"
						variant="ghost"
						className="trail-toggle"
						id="trail-toggle"
						type="button"
						hidden
						aria-expanded="false"
						aria-controls="messages"
					>
						<Bookmark className="trail-mark" aria-hidden="true" />
						<span id="trail-toggle-label">
							Earlier steps
						</span>
					</Button>
					<div className="active-scroll">
						<ol id="messages" hidden aria-label="Earlier steps">
							{history}
						</ol>
						<div id="active-turn">{active}</div>
					</div>
					{questionActive && <ChevronDown className="question-overflow-cue" aria-hidden="true" />}
					<Button
						size="sm"
						variant="outline"
						className="jump-latest"
						id="jump-latest"
						type="button"
						hidden
						aria-label="Jump to latest"
					>
						<svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
							<path
								d="M3.5 6.25 8 10.75l4.5-4.5"
								stroke="currentColor"
								strokeWidth="1.5"
								strokeLinecap="round"
								strokeLinejoin="round"
							/>
						</svg>
						Latest
					</Button>
				</Card>
			</main>

			<footer className="dock">
				<div className="composer-shell">
					<p id="storage-notice" role="status" />
					<form
						id="chat"
						inert={questionActive}
						onPointerDown={(event) => {
							const input = message.current;
							if (!input || input.disabled || questionActive || event.button !== 0) return;
							if (!(event.target instanceof Element) || event.target.closest('button, textarea, label')) return;
							event.preventDefault();
							input.focus();
						}}
					>
						<Label className="sr-only" htmlFor="message">
							Message Socratink
						</Label>
						<Textarea
							ref={message}
							id="message"
							autoComplete="off"
							name="message"
							placeholder="What are you working on?"
							disabled
							rows={2}
							required
						/>
						<div className="composer-footer">
							<div
								id="dictation-status"
								className="dictation-status"
								role="status"
								aria-live="polite"
								data-state="idle"
							>
								<span className="dictation-voice" aria-hidden="true">
									<span className="dictation-pulse"></span>
									<span className="dictation-bars">
										{Array.from({ length: 14 }, (_, index) => (
											<span key={index} />
										))}
									</span>
									<span className="dictation-timer">0:00</span>
									<AnimatedShinyText className="dictation-settling">Transcribing</AnimatedShinyText>
								</span>
								<span className="dictation-error" aria-hidden="true" hidden></span>
								<span className="dictation-announcement sr-only"></span>
							</div>
							<div className="composer-send">
								<span className="composer-hint">⌘ / Ctrl + Enter</span>
								<Button
									id="dictation-toggle"
									size="icon"
									variant="ghost"
									className="dictation-toggle"
									type="button"
									hidden
									disabled
									aria-pressed="false"
									aria-label="Start dictation"
									aria-describedby="dictation-privacy"
									title="Dictate — say “Send message” to send"
								>
									<span className="dictation-icon is-mic" aria-hidden="true">
										<svg viewBox="0 0 24 24" fill="none">
											<rect
												x="9"
												y="3"
												width="6"
												height="11"
												rx="3"
												stroke="currentColor"
												strokeWidth="1.5"
											/>
											<path
												d="M6.5 11.5a5.5 5.5 0 0 0 11 0M12 17v4M9 21h6"
												stroke="currentColor"
												strokeWidth="1.5"
												strokeLinecap="round"
											/>
										</svg>
									</span>
									<span className="dictation-icon is-stop" aria-hidden="true">
										<svg viewBox="0 0 24 24" fill="currentColor">
											<rect x="8" y="8" width="8" height="8" rx="1" />
										</svg>
									</span>
								</Button>
								<Button size="icon" aria-label="Send message" type="submit" disabled>
									<span aria-hidden="true">↑</span>
								</Button>
							</div>
						</div>
						<p id="dictation-privacy" className="sr-only">
							Speech recognition is provided by your browser and may use an online service. Socratink receives
							the recognized text. Say “Send message” at the end to send it.
						</p>
					</form>
					<IntroStarters onSelect={startDraft} />
				</div>
			</footer>
		</div>
	);
}
