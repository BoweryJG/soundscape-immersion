import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const FREESOUND_TOKEN = 'VkYOvuNCg3QbFskSA8SywWRqtOFTBPCFA0lTywTf';
const BASE_URL = 'https://freesound.org/apiv2';

// Sound queries for each category
const soundQueries = {
  ocean: [
    { query: 'ocean waves', name: 'ocean-waves.mp3' },
    { query: 'underwater ambience', name: 'underwater-ambience.mp3' },
    { query: 'beach waves', name: 'beach-waves.mp3' },
    { query: 'mountain stream', name: 'mountain-stream.mp3' },
    { query: 'waterfall', name: 'waterfall.mp3' },
    { query: 'rain lake', name: 'rain-on-lake.mp3' },
    { query: 'river flowing', name: 'river-flowing.mp3' },
    { query: 'ocean meditation', name: 'ocean-meditation.mp3' },
    { query: 'harbor night', name: 'harbor-night.mp3' },
    { query: 'gentle river', name: 'gentle-river.mp3' }
  ],
  forest: [
    { query: 'forest birds', name: 'forest-birds-new.mp3' },
    { query: 'rainforest ambience', name: 'rainforest-dawn.mp3' },
    { query: 'bamboo wind', name: 'bamboo-wind.mp3' },
    { query: 'night forest crickets', name: 'night-forest.mp3' },
    { query: 'morning birds', name: 'morning-birds.mp3' },
    { query: 'leaves rustling', name: 'leaves-rustling.mp3' },
    { query: 'pine forest', name: 'pine-forest.mp3' },
    { query: 'jungle ambience', name: 'jungle-ambience.mp3' },
    { query: 'forest creek', name: 'forest-creek.mp3' }
  ],
  weather: [
    { query: 'thunderstorm', name: 'thunderstorm.mp3' },
    { query: 'gentle rain', name: 'gentle-rain.mp3' },
    { query: 'wind storm', name: 'wind-storm.mp3' },
    { query: 'rain tent', name: 'rain-on-tent.mp3' },
    { query: 'distant thunder', name: 'distant-thunder.mp3' },
    { query: 'heavy rain', name: 'heavy-rain.mp3' },
    { query: 'rain window', name: 'rain-window.mp3' },
    { query: 'storm sea', name: 'storm-sea.mp3' }
  ],
  meditation: [
    { query: 'tibetan singing bowl', name: 'singing-bowls-new.mp3' },
    { query: 'om chanting', name: 'om-chanting.mp3' },
    { query: 'zen garden', name: 'zen-garden.mp3' },
    { query: 'crystal bowl', name: 'crystal-bowl.mp3' },
    { query: 'meditation flute', name: 'flute-meditation.mp3' },
    { query: 'healing frequency', name: 'healing-frequency.mp3' }
  ],
  space: [
    { query: 'space ambience', name: 'deep-space.mp3' },
    { query: 'cosmic drone', name: 'cosmic-drone.mp3' },
    { query: 'nebula', name: 'nebula.mp3' },
    { query: 'space atmosphere', name: 'space-ambience.mp3' },
    { query: 'interstellar', name: 'interstellar.mp3' }
  ],
  ambient: [
    { query: 'white noise', name: 'white-noise.mp3' },
    { query: 'pink noise', name: 'pink-noise.mp3' },
    { query: 'fireplace crackling', name: 'fireplace.mp3' },
    { query: 'cat purring', name: 'cat-purring.mp3' },
    { query: 'wind chimes', name: 'wind-chimes.mp3' }
  ],
  urban: [
    { query: 'coffee shop ambience', name: 'coffee-shop.mp3' },
    { query: 'city traffic', name: 'city-traffic.mp3' },
    { query: 'train station', name: 'train-station.mp3' },
    { query: 'cafe ambience', name: 'cafe-ambience.mp3' },
    { query: 'library quiet', name: 'library-quiet.mp3' }
  ]
};

// Helper to make API requests
async function apiRequest(endpoint) {
  return new Promise((resolve, reject) => {
    const url = `${BASE_URL}${endpoint}${endpoint.includes('?') ? '&' : '?'}token=${FREESOUND_TOKEN}`;
    
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

// Download file from URL
async function downloadFile(url, filepath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filepath);
    
    https.get(url + '?token=' + FREESOUND_TOKEN, (response) => {
      if (response.statusCode === 302 || response.statusCode === 301) {
        // Follow redirect
        https.get(response.headers.location, (res) => {
          res.pipe(file);
          file.on('finish', () => {
            file.close();
            resolve();
          });
        }).on('error', reject);
      } else {
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          resolve();
        });
      }
    }).on('error', reject);
  });
}

// Search and download sounds
async function searchAndDownload(category, query, filename) {
  try {
    console.log(`\nSearching for: ${query}`);
    
    // Search for sounds (CC0 license, duration 30s-5min)
    const searchResults = await apiRequest(
      `/search/text/?query=${encodeURIComponent(query)}&license=cc0&duration=[30 TO 300]&sort=downloads_desc&fields=id,name,duration,filesize,previews`
    );
    
    if (searchResults.results && searchResults.results.length > 0) {
      const sound = searchResults.results[0];
      console.log(`Found: ${sound.name} (${Math.round(sound.duration)}s)`);
      
      // Get full sound details
      const soundDetails = await apiRequest(`/sounds/${sound.id}/`);
      
      // Download the preview (high quality MP3)
      const outputPath = path.join(__dirname, 'public', 'sounds', category, filename);
      const downloadUrl = soundDetails.previews['preview-hq-mp3'];
      
      console.log(`Downloading to: ${category}/${filename}`);
      await downloadFile(downloadUrl, outputPath);
      
      console.log(`✓ Downloaded: ${filename}`);
      return true;
    } else {
      console.log(`✗ No results found for: ${query}`);
      return false;
    }
  } catch (error) {
    console.error(`✗ Error downloading ${query}:`, error.message);
    return false;
  }
}

// Main download function
async function downloadAllSounds() {
  console.log('🎵 Starting Freesound bulk download...\n');
  
  let totalDownloaded = 0;
  let totalFailed = 0;
  
  for (const [category, sounds] of Object.entries(soundQueries)) {
    console.log(`\n📁 Category: ${category.toUpperCase()}`);
    console.log('='.repeat(40));
    
    for (const { query, name } of sounds) {
      const success = await searchAndDownload(category, query, name);
      if (success) {
        totalDownloaded++;
      } else {
        totalFailed++;
      }
      
      // Rate limit: wait 500ms between requests
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
  
  console.log('\n' + '='.repeat(50));
  console.log(`✅ Download Complete!`);
  console.log(`✓ Successfully downloaded: ${totalDownloaded} sounds`);
  console.log(`✗ Failed: ${totalFailed} sounds`);
  console.log('='.repeat(50));
  
  // Update soundscapes.js
  if (totalDownloaded > 0) {
    console.log('\n📝 Run update-soundscapes.js to update the sound paths');
  }
}

// Run the download
downloadAllSounds().catch(console.error);