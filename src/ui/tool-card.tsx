import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { toolStateLabel, visibleToolOutput, type DisplayedToolCall } from './tool-state.ts';

export function ToolList({ calls }: { calls: readonly DisplayedToolCall[] }) {
	if (!calls.length) return null;
	return <div className="tool-list">
		{calls.map(call => {
			const state = toolStateLabel(call.state);
			const output = visibleToolOutput(call);
			return <Card key={call.id} className="tool-card" role="article" data-state={call.state}
				aria-label={`${call.name}, ${state}`} aria-live={call.state === 'running' ? 'polite' : undefined}>
				<CardHeader className="tool-card-head">
					<CardTitle className="tool-card-name">{call.name}</CardTitle>
					<span className="tool-card-state">{state}</span>
				</CardHeader>
				{output && <pre className="tool-card-output">{output}</pre>}
			</Card>;
		})}
	</div>;
}
