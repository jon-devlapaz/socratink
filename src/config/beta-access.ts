import { isHostedEnvironment, type HostedEnvironment } from './hosted.ts';

export const betaSignInError = {
	type: 'beta_sign_in_required',
	message: 'Sign in with your invited account to start a reply.',
} as const;

export const betaInviteError = {
	type: 'beta_invite_required',
	message: 'This account is not invited to the beta. You can still read your conversation.',
} as const;

export const betaPausedError = {
	type: 'beta_paused',
	message: 'Beta replies are paused. You can still read your conversation.',
} as const;

export const learnerKeysUnavailableError = {
	type: 'learner_keys_unavailable',
	message: 'Socratink supplies model access for this beta. New provider connections are not available.',
} as const;

export function betaAccessErrorMessage(code: unknown, reason?: unknown): string | undefined {
	return [betaSignInError, betaInviteError, betaPausedError]
		.find((error) => error.type === code || error.message === reason)?.message;
}

export type BetaAccessPolicy = Readonly<{
	invitedEmails: ReadonlySet<string>;
	paused: boolean;
}>;

type BetaEnvironment = HostedEnvironment & Readonly<{
	SOCRATINK_BETA_INVITED_EMAILS?: string;
	SOCRATINK_BETA_PAUSED?: string;
}>;

export function resolveBetaAccess(environment: BetaEnvironment): BetaAccessPolicy | undefined {
	if (!isHostedEnvironment(environment)) return undefined;

	const paused = environment.SOCRATINK_BETA_PAUSED?.trim() ?? '1';
	if (paused !== '0' && paused !== '1') {
		throw new Error('SOCRATINK_BETA_PAUSED must be 0 or 1.');
	}
	const configured = environment.SOCRATINK_BETA_INVITED_EMAILS?.trim();
	const emails = configured ? configured.split(',').map((email) => email.trim().toLowerCase()) : [];
	if (emails.some((email) => !/^[^@\s*]+@[^@\s*]+\.[^@\s*]+$/.test(email))) {
		throw new Error('SOCRATINK_BETA_INVITED_EMAILS must contain exact comma-separated email addresses.');
	}
	if (paused === '0' && emails.length === 0) {
		throw new Error('SOCRATINK_BETA_INVITED_EMAILS is required before unpausing hosted replies.');
	}
	return { invitedEmails: new Set(emails), paused: paused === '1' };
}
