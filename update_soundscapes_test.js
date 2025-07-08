import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Map test files to soundscape entries
const testSoundMappings = {
  'ocean': '/sounds/ocean/test-ocean-wave.wav',
  'forest': '/sounds/forest/test-forest-birds.wav',
  'meditation': '/sounds/meditation/test-meditation.wav',
  'space': '/sounds/space/test-space-drone.wav',
  'ambient': '/sounds/ambient/test-white-noise.wav',
  'weather': '/sounds/weather/test-rain.wav',
  'urban': '/sounds/urban/test-city.wav'
};

// Also map the successfully downloaded files
const downloadedFiles = {
  'forest-birds': '/sounds/forest/forest-birds.mp3',
  'singing-bowls': '/sounds/meditation/singing-bowls.mp3'
};

// Read the current soundscapes.js file
const soundscapesPath = path.join(__dirname, 'src/data/soundscapes.js');
let content = fs.readFileSync(soundscapesPath, 'utf8');

// Update only the first soundscape in each category with local test files
const categories = ['ocean', 'forest', 'meditation', 'space', 'ambient', 'weather', 'urban'];

categories.forEach(category => {
  // Find first occurrence of each category
  const regex = new RegExp(`category: "${category}",\\s*file: "([^"]+)"`, 'i');
  
  if (testSoundMappings[category]) {
    content = content.replace(regex, `category: "${category}",\n    file: "${testSoundMappings[category]}"`);
  }
});

// Update specific entries with downloaded files
content = content.replace(
  /name: "Forest Birds[^"]*",\s*category: "forest",\s*file: "[^"]+"/,
  `name: "Forest Birds",\n    category: "forest",\n    file: "${downloadedFiles['forest-birds']}"`
);

content = content.replace(
  /name: "[^"]*Singing Bowls[^"]*",\s*category: "meditation",\s*file: "[^"]+"/,
  `name: "Singing Bowls",\n    category: "meditation",\n    file: "${downloadedFiles['singing-bowls']}"`
);

// Write the updated file
fs.writeFileSync(soundscapesPath, content);

console.log('✓ Updated soundscapes.js with local test files');
console.log('\nTest files mapped:');
Object.entries(testSoundMappings).forEach(([category, file]) => {
  console.log(`  ${category}: ${file}`);
});
console.log('\nDownloaded files mapped:');
Object.entries(downloadedFiles).forEach(([name, file]) => {
  console.log(`  ${name}: ${file}`);
});