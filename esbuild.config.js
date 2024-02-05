require('esbuild').build({
  entryPoints: ['./dist/index.js'],
  bundle: true,
  platform: 'node',
  outfile: './index.js',
  target: 'node20',
  external: ['pg-hstore', 'swagger-ui-express'],
});
