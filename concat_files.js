const fs = require('fs');
const path = require('path');

const base = __dirname;
const a = fs.readFileSync(path.join(base, 'tmp_part_a.tsx'), 'utf8');
const b = fs.readFileSync(path.join(base, 'tmp_part_b.tsx'), 'utf8');
const c = fs.readFileSync(path.join(base, 'tmp_part_c.tsx'), 'utf8');

const combined = a + '\n\n' + b + '\n\n' + c;
fs.writeFileSync(path.join(base, 'app', 'apply', 'page.tsx'), combined);

const lines = combined.split('\n').length;
console.log('SUCCESS: Written ' + lines + ' lines to app/apply/page.tsx');
console.log('Part A: ' + a.split('\n').length + ' lines');
console.log('Part B: ' + b.split('\n').length + ' lines');
console.log('Part C: ' + c.split('\n').length + ' lines');
