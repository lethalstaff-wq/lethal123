const fs = require('fs');
const path = 'C:/Users/\u043a\u0438\u0440/Desktop/\u0441\u0430\u0439\u0442/';

let a = fs.readFileSync(path + 'tmp_part_a.tsx', 'utf8');
let b = fs.readFileSync(path + 'tmp_part_b.tsx', 'utf8');
let c = fs.readFileSync(path + 'tmp_part_c.tsx', 'utf8');

// Remove END PART A marker line
a = a.replace(/\n?\/\* === END PART A === \*\/\s*$/, '');

// Remove END PART B marker line
b = b.replace(/\n?\/\* === END PART B === \*\/\s*$/, '');

// Combine with blank lines between
const combined = a.trimEnd() + '\n\n' + b.trimEnd() + '\n\n' + c.trimEnd() + '\n';

// Ensure output directory exists
fs.mkdirSync(path + 'app/apply', { recursive: true });
fs.writeFileSync(path + 'app/apply/page.tsx', combined, 'utf8');

const lines = combined.split('\n');
console.log('Total lines:', lines.length);
console.log('First line:', JSON.stringify(lines[0]));
console.log('Last non-empty line:', JSON.stringify(lines.filter(l => l.trim()).pop()));
console.log('File size:', combined.length, 'bytes');
