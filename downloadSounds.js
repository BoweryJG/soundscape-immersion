import { downloadAllSounds } from './src/utils/soundDownloader.js';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('Starting download of all soundscapes...');
console.log('This may take a few minutes...\n');

downloadAllSounds()
  .then(results => {
    console.log('\n=== Download Complete ===');
    console.log(`✓ Successfully downloaded: ${results.success.length} files`);
    console.log(`✗ Failed downloads: ${results.failed.length} files`);
    
    if (results.failed.length > 0) {
      console.log('\nFailed files:');
      results.failed.forEach(file => console.log(`  - ${file}`));
    }
  })
  .catch(error => {
    console.error('Download process failed:', error);
  });