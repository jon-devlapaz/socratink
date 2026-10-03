import type { FlueExecutionInterceptor } from '@flue/runtime';
import type { MiddlewareHandler } from 'hono';
import { betaInviteError, betaPausedError, betaSignInError, type BetaAccessPolicy } from '../config/beta-access.ts';
import { userIdFromConversationId } from '../config/session.ts';
import type { AuthDb } from './auth-db.ts';
import { sessionFromContext } from './session.ts';

export { betaInviteError, betaPausedError, betaSignInError } from '../config/beta-access.ts';

type BetaAccessOptions = {
	policy: BetaAccessPolicy;
	authDb: Pick<AuthDb, 'findUserById' | 'findAliasOwner'>;
};

class BetaAccessError extends Error {
	readonly error: typeof betaInviteError | typeof betaPausedError;

	constructor(error: typeof betaInviteError | typeof betaPausedError) {
		super(error.message);
		this.name = error.type;
		this.error = error;
	}
}

async function assertBetaAccess(options: BetaAccessOptions, userId: string | undefined): Promise<void> {
	if (!userId) throw new BetaAccessError(betaInviteError);
	const owner = await options.authDb.findAliasOwner(userId) ?? userId;
	const user = await options.authDb.findUserById(owner);
	if (!user || !options.policy.invitedEmails.has(user.email.trim().toLowerCase())) {
		throw new BetaAccessError(betaInviteError);
	}
	if (options.policy.paused) throw new BetaAccessError(betaPausedError);
}

export function requireBetaAdmission(options: BetaAccessOptions): MiddlewareHandler {
	return async (context, next) => {
		if (context.req.method !== 'POST' || context.req.path.endsWith('/abort')) return next();
		const session = sessionFromContext(context);
		if (session?.kind !== 'registered') return context.json({ error: betaSignInError }, 403);
		try {
			await assertBetaAccess(options, session.userId);
		} catch (error) {
			if (!(error instanceof BetaAccessError)) throw error;
			return context.json({ error: error.error }, error.error.type === 'beta_paused' ? 503 : 403);
		}
		return next();
	};
}

// Admission is not execution: queued work, retries, and recovery must recheck
// access before every provider call, without requiring the original cookie.
export function createBetaModelGuard(options: BetaAccessOptions): FlueExecutionInterceptor {
	return async (operation, context, next) => {
		if (operation.type === 'model') {
			await assertBetaAccess(options, userIdFromConversationId(context.instanceId));
		}
		return next();
	};
}
