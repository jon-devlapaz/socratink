export function requireElement<T extends Element>(selector: string, root: ParentNode = document): T {
	const node = root.querySelector<T>(selector);
	if (!node) throw new Error(`Socratink chat markup is missing ${selector}.`);
	return node;
}
