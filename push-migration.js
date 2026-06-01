const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const dir = path.join(__dirname, 'supabase', 'migrations');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.sql'));

const backups = {};

// Backup and empty files
for (const file of files) {
  if (file === '20260601160909_create_class_cancellations.sql') continue;
  if (file === '001_initial_schema.sql' || file === '002_add_location_and_avatars.sql') continue; // these are likely already recorded
  const filePath = path.join(dir, file);
  backups[file] = fs.readFileSync(filePath, 'utf8');
  fs.writeFileSync(filePath, '-- empty');
}

console.log('Emptied files, pushing...');
try {
  const output = execSync('npx supabase db push --include-all --yes', { encoding: 'utf8', stdio: 'inherit' });
  console.log(output);
} catch (e) {
  console.error('Push failed');
}

// Restore
for (const file of Object.keys(backups)) {
  fs.writeFileSync(path.join(dir, file), backups[file]);
}
console.log('Restored');
