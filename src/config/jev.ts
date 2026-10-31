export type JevConnection = {
	readonly apiKey: string;
	readonly baseUrl: string;
	readonly timeoutMs: number;
};

type JevEnvironment = Readonly<{
	TYPESAFE_API_KEY?: string;
	TYPESAFE_BASE_URL?: string;
	NF_PROJECT_ID?: string;
	NODE_ENV?: string;
	VERCEL?: string;
}>;

const typesafeBaseUrl = 'https://api.typesafe.ai';

// A Jev reading is worth one model turn's wait only while it stays near Jev's ~100 ms.
const jevTimeoutMs = 1500;

// No key means no Jev calls: learner text reaches TypeSafe only when the operator opts in.
// TYPESAFE_BASE_URL exists for local fakes; hosted environments always use TypeSafe.
export function resolveJevConnection(environment: JevEnvironment): JevConnection | undefined {
	const apiKey = environment.TYPESAFE_API_KEY?.trim();
	if (!apiKey) return undefined;
	const hosted =
		environment.NODE_ENV === 'production' || environment.VERCEL === '1' || Boolean(environment.NF_PROJECT_ID);
	const override = environment.TYPESAFE_BASE_URL?.trim();
	return { apiKey, baseUrl: !hosted && override ? override : typesafeBaseUrl, timeoutMs: jevTimeoutMs };
}

export const jevConnection = resolveJevConnection(process.env);
