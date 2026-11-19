import { feedback } from '../config/feedback.ts';

type AppUser = { id: string; email: string };
type AppContext = { session_id: string; client: string; environment: string };
type ToolArguments = Record<string, string | Record<string, string>>;
type RpcReply = { id?: number; error?: unknown; result?: unknown };
const protocol = '2025-03-26';

export async function sendAgentFeedback(token: string, user: AppUser | undefined, context: AppContext, args: ToolArguments) {
	const headers = new Headers({
		Authorization: `Bearer ${token}`,
		Accept: 'application/json, text/event-stream',
		'Content-Type': 'application/json',
		'X-Modem-App-Context': jsonHeader(context),
	});
	if (user) headers.set('X-Modem-App-User', jsonHeader(user));
	const signal = AbortSignal.timeout(feedback.timeoutMs);
	let requestId = 0;
	async function request(method: string, params?: object) {
		const id = method === 'notifications/initialized' ? undefined : ++requestId;
		const response = await fetch(feedback.mcp, {
			method: 'POST', headers, signal, redirect: 'error',
			body: JSON.stringify({ jsonrpc: '2.0', method, id, params }),
		});
		if (!response.ok || id === undefined) {
			await response.body?.cancel();
			if (id !== undefined || response.status !== 202) throw new Error('Modem could not complete the request.');
			return;
		}
		if (method === 'initialize') {
			const session = response.headers.get('Mcp-Session-Id');
			if (session) headers.set('Mcp-Session-Id', session);
		}
		const reply = await readReply(response, id);
		if (!reply || reply.error || reply.result === undefined) throw new Error('Modem could not complete the request.');
		return reply.result;
	}
	try {
		const initialized = await request('initialize', {
			protocolVersion: protocol, capabilities: {}, clientInfo: { name: context.client, version: '1' },
		}) as { protocolVersion?: string } | undefined;
		if (initialized?.protocolVersion !== protocol) return 'unavailable';
		headers.set('MCP-Protocol-Version', protocol);
		await request('notifications/initialized');
		try {
			const result = await request('tools/call', { name: feedback.toolName, arguments: args }) as {
				isError?: boolean; content?: { type: string; text?: string }[]; structuredContent?: { id?: string };
			};
			if (result.isError) return 'rejected';
			const text = result.content?.find((item) => item.type === 'text')?.text;
			let body: { id?: unknown } | undefined;
			if (text && !result.structuredContent) {
				try { body = JSON.parse(text); } catch { /* No structured receipt. */ }
			}
			const id = result.structuredContent?.id ?? body?.id;
			return typeof id === 'string' && id ? 'accepted' : 'unconfirmed';
		} catch {
			return 'unconfirmed';
		}
	} catch {
		return 'unavailable';
	} finally {
		if (headers.has('Mcp-Session-Id')) {
			await fetch(feedback.mcp, {
				method: 'DELETE', headers, redirect: 'error', signal: AbortSignal.timeout(1_000),
			}).then((response) => response.body?.cancel()).catch(() => {});
		}
	}
}

async function readReply(response: Response, id: number): Promise<RpcReply | undefined> {
	const type = response.headers.get('Content-Type');
	if (type?.startsWith('application/json')) {
		const reply = await response.json() as RpcReply;
		return reply.id === id ? reply : undefined;
	}
	if (!type?.startsWith('text/event-stream') || !response.body) {
		await response.body?.cancel();
		return undefined;
	}
	const reader = response.body.pipeThrough(new TextDecoderStream()).getReader();
	let buffer = '';
	try {
		for (;;) {
			const { value, done } = await reader.read();
			if (done) return undefined;
			buffer += value;
			let boundary: RegExpExecArray | null;
			while ((boundary = /\r?\n\r?\n/.exec(buffer))) {
				const event = buffer.slice(0, boundary.index);
				buffer = buffer.slice(boundary.index + boundary[0].length);
				const data = event.split(/\r?\n/).filter((line) => line.startsWith('data:'))
					.map((line) => line.slice(5).trimStart()).join('\n');
				if (!data) continue;
				const reply = JSON.parse(data) as RpcReply;
				if (reply.id === id) return reply;
			}
		}
	} finally {
		await reader.cancel().catch(() => {});
	}
}

function jsonHeader(value: object): string {
	const json = JSON.stringify(value);
	return /[^\u0020-\u007e]/.test(json) ? encodeURIComponent(json) : json;
}
