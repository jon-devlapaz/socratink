import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { guestTurnLimit } from '../config/guest-turns.ts';
import type { AuthProviders } from './session.ts';

export function AuthGateCard({ providers }: { providers: AuthProviders }) {
	return (
		<Card className="chat-gate-card gap-0 rounded-none border-x-0 shadow-none" role="status" aria-live="polite">
			<p className="chat-gate-message">
				You’ve had {guestTurnLimit} turns. Sign in to save your conversation and keep learning.
			</p>
			<div className="chat-gate-actions">
				{providers.google && <Button asChild variant="outline" className="chat-gate-btn chat-gate-google">
					<a href="/api/auth/google/login">Continue with Google</a>
				</Button>}
				{providers.github && <Button asChild variant="outline" className="chat-gate-btn chat-gate-github">
					<a href="/api/auth/github/login">Continue with GitHub</a>
				</Button>}
			</div>
		</Card>
	);
}
