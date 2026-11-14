export type HostedEnvironment = Readonly<{
	NODE_ENV?: string;
	VERCEL?: string;
}>;

export function isHostedEnvironment(environment: HostedEnvironment): boolean {
	return environment.NODE_ENV === 'production' || environment.VERCEL === '1';
}
