// dist/tutor-probe.mjs exists only after `pnpm build`. @ts-ignore stays valid
// both before that file exists and after a local build.
// @ts-ignore
import probe from '../dist/tutor-probe.mjs';

export default probe;
