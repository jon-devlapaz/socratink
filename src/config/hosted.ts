export type HostedEnvironment = Readonly<{
	NODE_ENV?: string;
	NF_PROJECT_ID?: string;
	VERCEL?: string;
}>;

export function isHostedEnvironment(environment: HostedEnvironment): boolean {
	return environment.NODE_ENV === 'production'
		|| Boolean(environment.NF_PROJECT_ID)
		|| environment.VERCEL === '1';
}
