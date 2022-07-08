/* eslint-disable @typescript-eslint/no-var-requires */
// eslint-disable-next-line @typescript-eslint/no-var-requires, no-undef
const { build } = require('esbuild');

build({
  entryPoints: ['src/index.ts'],
  outdir: 'dist',
  bundle: true,

})