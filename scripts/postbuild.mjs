import { writeFileSync } from 'node:fs';

const environment = process.argv[2];

if (!['testing', 'production'].includes(environment)) {
  throw new Error(`Ambiente de postbuild inválido: ${environment ?? '(vacío)'}`);
}

const isTesting = environment === 'testing';

writeFileSync(
  'dist/robots.txt',
  isTesting
    ? 'User-agent: *\nDisallow: /\n'
    : 'User-agent: *\nAllow: /\n',
  'utf8',
);

writeFileSync(
  'dist/_headers',
  isTesting
    ? '/*\n  X-Robots-Tag: noindex, nofollow, noarchive\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: strict-origin-when-cross-origin\n'
    : '/*\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: strict-origin-when-cross-origin\n',
  'utf8',
);

console.log(`Postbuild ${environment} aplicado.`);
