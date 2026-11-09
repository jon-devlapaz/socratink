export type LogRecord = { seq: number; writes: string };
export type LogState = { format: number; nextId: number; commits: LogRecord[] };
export type LogLease = {
	state: LogState;
	assertOwned: () => void;
	append: (seq: number, writes: string, nextId: number) => Promise<void>;
	mintId: () => Promise<number>;
	cancelThrough: () => Promise<number>;
	close: () => Promise<void>;
};
export type LogBackend = {
	exists: (namespace: string) => Promise<boolean>;
	read: (namespace: string) => Promise<LogState>;
	claim: (namespace: string) => Promise<LogLease | undefined>;
	cancel: (namespace: string, through: number) => Promise<void>;
	close: () => Promise<void>;
};
export const logFormat = 1;
export const maximumId = Number.MAX_SAFE_INTEGER;
export const emptyLog = (): LogState => ({ format: logFormat, nextId: 2, commits: [] });
