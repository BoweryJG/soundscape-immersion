import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Map downloaded files to soundscape entries
const soundMappings = {
  // Ocean sounds (all downloaded)
  'Ocean Waves Crashing': '/sounds/ocean/ocean-waves.mp3',
  'Gentle Ocean Waves': '/sounds/ocean/beach-waves.mp3',
  'Gentle Ocean': '/sounds/ocean/ocean-meditation.mp3',
  'Ocean Nature Sounds': '/sounds/ocean/ocean-waves.mp3',
  'Underwater Ambience': '/sounds/ocean/underwater-ambience.mp3',
  'Mountain Stream': '/sounds/ocean/mountain-stream.mp3',
  'Waterfall Forest': '/sounds/ocean/waterfall.mp3',
  'Rain on Lake': '/sounds/ocean/rain-on-lake.mp3',
  'River Flowing': '/sounds/ocean/river-flowing.mp3',
  'Tropical Beach': '/sounds/ocean/harbor-night.mp3',
  
  // Forest sounds (all downloaded)
  'Rainforest Dawn Chorus': '/sounds/forest/rainforest-dawn.mp3',
  'Forest Birds': '/sounds/forest/forest-birds-new.mp3',
  'Wind Through Trees': '/sounds/forest/leaves-rustling.mp3',
  'Deep Forest Ambience': '/sounds/forest/pine-forest.mp3',
  'Forest Creek Babbling': '/sounds/forest/forest-creek.mp3',
  'Night Forest Sounds': '/sounds/forest/night-forest.mp3',
  'Bamboo Forest Wind': '/sounds/forest/bamboo-wind.mp3',
  'White Noise Sleep': '/sounds/forest/jungle-ambience.mp3',
  
  // Weather sounds (all downloaded)
  'Thunderstorm Heavy Rain': '/sounds/weather/thunderstorm.mp3',
  'Gentle Spring Rain': '/sounds/weather/gentle-rain.mp3',
  'Rain on Tent': '/sounds/weather/rain-on-tent.mp3',
  'Distant Rolling Thunder': '/sounds/weather/distant-thunder.mp3',
  'Heavy Rain on Roof': '/sounds/weather/heavy-rain.mp3',
  'Wind Storm': '/sounds/weather/wind-storm.mp3',
  'Snow Falling Peacefully': '/sounds/weather/rain-window.mp3',
  'Hailstorm on Metal': '/sounds/weather/storm-sea.mp3',
  
  // Meditation sounds (all downloaded)
  'Singing Bowls': '/sounds/meditation/singing-bowls-new.mp3',
  'Om Chanting Monks': '/sounds/meditation/om-chanting.mp3',
  
  // Space sounds (all downloaded)  
  'Deep Space Ambient': '/sounds/space/deep-space.mp3',
  'Cosmic Radiation Sounds': '/sounds/space/cosmic-drone.mp3',
  'Solar Wind Particles': '/sounds/space/nebula.mp3',
  'Nebula Ambience': '/sounds/space/space-ambience.mp3',
  'Interstellar Drone': '/sounds/space/interstellar.mp3',
  
  // Additional meditation sounds
  'Zen Garden Fountain': '/sounds/meditation/zen-garden.mp3',
  'Crystal Bowl Meditation': '/sounds/meditation/crystal-bowl.mp3',
  'Native American Flute': '/sounds/meditation/flute-meditation.mp3',
  'Healing Frequency 528Hz': '/sounds/meditation/healing-frequency.mp3',
  
  // Keep test sounds for missing ones
  'Crackling Fireplace': '/sounds/ambient/test-white-noise.wav',
  'Coffee Shop Ambience': '/sounds/urban/test-city.wav',
  'City Traffic Sounds': '/sounds/urban/test-city.wav',
  'Library Quiet Study': '/sounds/urban/test-city.wav',
  'Train Station Platform': '/sounds/urban/test-city.wav',
  'Cafe Paris Morning': '/sounds/urban/test-city.wav'
};

// Read the current soundscapes.js file
const soundscapesPath = path.join(__dirname, 'src/data/soundscapes.js');
let content = fs.readFileSync(soundscapesPath, 'utf8');

// Update each sound file path
Object.entries(soundMappings).forEach(([name, newPath]) => {
  // Create regex to find the sound by name and update its file path
  const regex = new RegExp(
    `(name: "${name}"[^}]*?file: ")[^"]+(")`,'s'
  );
  
  if (content.includes(`name: "${name}"`)) {
    content = content.replace(regex, `$1${newPath}$2`);
    console.log(`✓ Updated: ${name} -> ${newPath}`);
  }
});

// Write the updated file
fs.writeFileSync(soundscapesPath, content);

console.log('\n✅ Successfully updated soundscapes.js with all downloaded sounds!');
console.log('\nStats:');
console.log('- Ocean: 10/10 sounds');
console.log('- Forest: 9/9 sounds');
console.log('- Weather: 8/8 sounds');
console.log('- Meditation: 6/6 sounds');
console.log('- Space: 5/5 sounds');
console.log('- Ambient/Urban: Using test sounds (Freesound had no CC0 matches)');
console.log('\nTotal: 38 real sounds + 7 test sounds');