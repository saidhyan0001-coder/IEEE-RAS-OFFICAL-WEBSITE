import { createPasswordHash } from '../api/_lib/auth.js';

if (!process.stdin.isTTY || typeof process.stdin.setRawMode !== 'function') {
  throw new Error('Run this command in an interactive terminal so your password is not echoed.');
}

let password = '';
process.stdout.write('Enter the new admin password (input hidden): ');
process.stdin.setRawMode(true);
process.stdin.setEncoding('utf8');
process.stdin.resume();
process.stdin.on('data', (character) => {
  if (character === '\u0003') {
    process.stdin.setRawMode(false);
    process.exit(130);
  }
  if (character === '\r' || character === '\n') {
    process.stdin.setRawMode(false);
    process.stdin.pause();
    if (password.length < 12) {
      process.stderr.write('\nUse a password with at least 12 characters.\n');
      process.exitCode = 1;
      return;
    }
    process.stdout.write(`\nADMIN_PASSWORD_HASH=${createPasswordHash(password)}\n`);
    password = '';
    return;
  }
  if (character === '\u007f' || character === '\b') {
    password = password.slice(0, -1);
    return;
  }
  if (character >= ' ') password += character;
});
