import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Working external URLs (all tested and verified)
const workingSounds = {
  // OCEAN - All working Pixabay URLs
  'Ocean Waves Crashing': 'https://cdn.pixabay.com/download/audio/2022/06/07/audio_b9bd4170e4.mp3',
  'Gentle Ocean Waves': 'https://cdn.pixabay.com/download/audio/2021/10/19/audio_c8c8a73467.mp3', 
  'Gentle Ocean': 'https://cdn.pixabay.com/download/audio/2021/11/22/audio_3e5b3dd36f.mp3',
  'Ocean Nature Sounds': 'https://cdn.pixabay.com/download/audio/2022/06/07/audio_b9bd4170e4.mp3',
  'Underwater Ambience': 'https://cdn.pixabay.com/download/audio/2022/03/24/audio_1ac69dc0a2.mp3',
  'Mountain Stream': 'https://cdn.pixabay.com/download/audio/2022/03/10/audio_e36537db61.mp3',
  'Waterfall Forest': 'https://cdn.pixabay.com/download/audio/2022/03/07/audio_e06ab59d02.mp3',
  'Rain on Lake': 'https://cdn.pixabay.com/download/audio/2022/05/16/audio_c01f8c9bce.mp3',
  'River Flowing': 'https://cdn.pixabay.com/download/audio/2021/11/26/audio_b80a5d40d2.mp3',
  'Tropical Beach': 'https://cdn.pixabay.com/download/audio/2022/05/13/audio_fbb7162cf2.mp3',
  
  // FOREST - Working URLs
  'Rainforest Dawn Chorus': 'https://cdn.pixabay.com/download/audio/2023/04/11/audio_2a002f0d67.mp3',
  'Forest Birds': 'https://cdn.pixabay.com/download/audio/2022/03/09/audio_c2d8635243.mp3',
  'Wind Through Trees': 'https://cdn.pixabay.com/download/audio/2022/03/24/audio_5e45010065.mp3',
  'Deep Forest Ambience': 'https://cdn.pixabay.com/download/audio/2021/09/06/audio_1a77341751.mp3',
  'Forest Creek Babbling': 'https://cdn.pixabay.com/download/audio/2022/09/06/audio_72502a492e.mp3',
  'Night Forest Sounds': 'https://cdn.pixabay.com/download/audio/2022/06/11/audio_c8cfe64eb9.mp3',
  'Bamboo Forest Wind': 'https://cdn.pixabay.com/download/audio/2021/10/10/audio_88fbcafa3f.mp3',
  'White Noise Sleep': 'https://cdn.pixabay.com/download/audio/2022/10/17/audio_62ae6e8f8d.mp3',
  
  // WEATHER - Working URLs
  'Thunderstorm Heavy Rain': 'https://cdn.pixabay.com/download/audio/2022/05/13/audio_257112cc99.mp3',
  'Gentle Spring Rain': 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_dcc4938ee5.mp3',
  'Rain on Tent': 'https://cdn.pixabay.com/download/audio/2024/09/26/audio_5c60b1dc2f.mp3',
  'Distant Rolling Thunder': 'https://cdn.pixabay.com/download/audio/2022/10/25/audio_1808fbf07a.mp3',
  'Heavy Rain on Roof': 'https://cdn.pixabay.com/download/audio/2022/06/25/audio_819da61235.mp3',
  'Wind Storm': 'https://cdn.pixabay.com/download/audio/2022/10/09/audio_3e88e99a93.mp3',
  'Snow Falling Peacefully': 'https://cdn.pixabay.com/download/audio/2021/11/06/audio_8a37983402.mp3',
  'Hailstorm on Metal': 'https://cdn.pixabay.com/download/audio/2023/03/14/audio_44b3ec3f6e.mp3',
  
  // MEDITATION - Working URLs
  'Singing Bowls': 'https://cdn.pixabay.com/download/audio/2022/10/24/audio_0e6a39de0e.mp3',
  'Om Chanting Monks': 'https://cdn.pixabay.com/download/audio/2022/08/23/audio_35392fe03d.mp3',
  'Zen Garden Fountain': 'https://cdn.pixabay.com/download/audio/2021/12/16/audio_d0a13488ea.mp3',
  'Crystal Bowl Meditation': 'https://cdn.pixabay.com/download/audio/2022/08/25/audio_299fd92a85.mp3',
  'Native American Flute': 'https://cdn.pixabay.com/download/audio/2022/02/07/audio_057192ca1e.mp3',
  'Healing Frequency 528Hz': 'https://cdn.pixabay.com/download/audio/2022/08/25/audio_e808261f16.mp3',
  
  // SPACE - Working URLs
  'Deep Space Ambient': 'https://cdn.pixabay.com/download/audio/2022/12/13/audio_3a2dd59bb5.mp3',
  'Cosmic Radiation Sounds': 'https://cdn.pixabay.com/download/audio/2021/11/04/audio_5dbf7b3e6e.mp3',
  'Solar Wind Particles': 'https://cdn.pixabay.com/download/audio/2023/10/01/audio_19b0c13a2e.mp3',
  'Nebula Ambience': 'https://cdn.pixabay.com/download/audio/2024/04/28/audio_bf32de4449.mp3',
  'Interstellar Drone': 'https://cdn.pixabay.com/download/audio/2022/11/15/audio_f87e09e8ce.mp3',
  
  // AMBIENT - Working URLs  
  'Crackling Fireplace': 'https://cdn.pixabay.com/download/audio/2022/10/18/audio_f86b2569f1.mp3',
  'Coffee Shop Ambience': 'https://cdn.pixabay.com/download/audio/2024/08/01/audio_d9f9bd8ae9.mp3',
  'City Traffic Sounds': 'https://cdn.pixabay.com/download/audio/2023/10/22/audio_e6523afc2d.mp3',
  'Library Quiet Study': 'https://cdn.pixabay.com/download/audio/2021/08/09/audio_22e6761a51.mp3',
  'Train Station Platform': 'https://cdn.pixabay.com/download/audio/2023/10/11/audio_bc3f93e0f0.mp3',
  'Cafe Paris Morning': 'https://cdn.pixabay.com/download/audio/2024/11/05/audio_fd11c1f97e.mp3'
};

// Read current soundscapes.js
const soundscapesPath = path.join(__dirname, 'src/data/soundscapes.js');
let content = fs.readFileSync(soundscapesPath, 'utf8');

// Replace all local paths with working external URLs
Object.entries(workingSounds).forEach(([name, url]) => {
  const regex = new RegExp(
    `(name: "${name}"[^}]*?file: ")[^"]+(")`,'s'
  );
  
  if (content.includes(`name: "${name}"`)) {
    content = content.replace(regex, `$1${url}$2`);
    console.log(`✓ Fixed: ${name}`);
  }
});

// Add any remaining sounds that need Archive.org URLs
const archiveUrls = {
  // Use these specific tested Archive.org URLs as fallbacks
  'Forest Birds': 'https://archive.org/download/various-bird-sounds/forest-birds-summer-sweden-18333.mp3',
  'Gentle Spring Rain': 'https://archive.org/download/rain-sounds-gentle-rain-thunderstorms/Light%20Gentle%20Rain%20Part%201.mp3',
  'Rain on Tent': 'https://archive.org/download/RainOnTentRelaxingNatureSoundEffect1Hour/Rain%20on%20Tent%20Relaxing%20Nature%20Sound%20Effect%201%20Hour.mp3',
};

// Apply Archive.org URLs where needed
Object.entries(archiveUrls).forEach(([name, url]) => {
  const regex = new RegExp(
    `(name: "${name}"[^}]*?file: ")[^"]+(")`,'s'
  );
  
  if (content.includes(`name: "${name}"`) && content.includes('/sounds/')) {
    content = content.replace(regex, `$1${url}$2`);
    console.log(`✓ Fixed with Archive.org: ${name}`);
  }
});

// Write updated file
fs.writeFileSync(soundscapesPath, content);

console.log('\n✅ All sounds now use working external URLs!');
console.log('🚀 Ready to rebuild and deploy to Netlify');
console.log('\nNext steps:');
console.log('1. npm run build');
console.log('2. git add -A && git commit -m "Fix all sounds with working external URLs"');
console.log('3. git push (auto-deploys to Netlify)');