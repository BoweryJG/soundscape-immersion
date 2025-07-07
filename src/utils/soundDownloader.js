import axios from 'axios';
import fs from 'fs';
import path from 'path';

// Sound sources configuration
const SOUND_SOURCES = {
  ocean: [
    { name: 'deep-ocean-waves.mp3', url: 'https://cdn.pixabay.com/download/audio/2021/11/09/audio_0f63fb5d14.mp3' },
    { name: 'underwater-ambience.mp3', url: 'https://cdn.pixabay.com/download/audio/2022/03/24/audio_1ac69dc0a2.mp3' },
    { name: 'tropical-beach.mp3', url: 'https://cdn.pixabay.com/download/audio/2022/05/13/audio_fbb7162cf2.mp3' },
    { name: 'mountain-stream.mp3', url: 'https://cdn.pixabay.com/download/audio/2022/03/10/audio_e36537db61.mp3' },
    { name: 'rain-on-lake.mp3', url: 'https://cdn.pixabay.com/download/audio/2022/05/16/audio_c01f8c9bce.mp3' },
    { name: 'ocean-cave.mp3', url: 'https://cdn.pixabay.com/download/audio/2023/04/04/audio_8b6b06f3f1.mp3' },
    { name: 'waterfall.mp3', url: 'https://cdn.pixabay.com/download/audio/2022/03/07/audio_e06ab59d02.mp3' },
    { name: 'harbor-night.mp3', url: 'https://cdn.pixabay.com/download/audio/2021/11/25/audio_1a44e60e84.mp3' },
    { name: 'gentle-river.mp3', url: 'https://cdn.pixabay.com/download/audio/2021/11/26/audio_b80a5d40d2.mp3' },
    { name: 'ocean-meditation.mp3', url: 'https://cdn.pixabay.com/download/audio/2022/10/12/audio_45f5c0fe23.mp3' }
  ],
  forest: [
    { name: 'rainforest-dawn.mp3', url: 'https://cdn.pixabay.com/download/audio/2022/06/07/audio_61e39e7431.mp3' },
    { name: 'bamboo-wind.mp3', url: 'https://cdn.pixabay.com/download/audio/2021/11/25/audio_91a4035a90.mp3' },
    { name: 'forest-birds.mp3', url: 'https://cdn.pixabay.com/download/audio/2022/03/09/audio_c610232c26.mp3' },
    { name: 'night-forest.mp3', url: 'https://cdn.pixabay.com/download/audio/2022/11/16/audio_b2db0f9efa.mp3' },
    { name: 'morning-birds.mp3', url: 'https://cdn.pixabay.com/download/audio/2024/02/20/audio_8b0276f1f5.mp3' },
    { name: 'leaves-rustling.mp3', url: 'https://cdn.pixabay.com/download/audio/2022/03/24/audio_a906f210e8.mp3' },
    { name: 'woodpecker.mp3', url: 'https://cdn.pixabay.com/download/audio/2022/03/14/audio_cbf61e8d3d.mp3' },
    { name: 'pine-forest.mp3', url: 'https://cdn.pixabay.com/download/audio/2022/10/18/audio_a88174ce7b.mp3' },
    { name: 'jungle-ambience.mp3', url: 'https://cdn.pixabay.com/download/audio/2022/06/14/audio_7b0f8f96f3.mp3' },
    { name: 'forest-creek.mp3', url: 'https://cdn.pixabay.com/download/audio/2022/04/27/audio_cdcbf012fb.mp3' }
  ],
  weather: [
    { name: 'thunderstorm.mp3', url: 'https://cdn.pixabay.com/download/audio/2022/05/13/audio_6a2ac9cc95.mp3' },
    { name: 'gentle-rain.mp3', url: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_acbbf80ff9.mp3' },
    { name: 'wind-storm.mp3', url: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_2d93dd10e8.mp3' },
    { name: 'rain-on-tent.mp3', url: 'https://cdn.pixabay.com/download/audio/2021/12/19/audio_c7830a7a03.mp3' },
    { name: 'distant-thunder.mp3', url: 'https://cdn.pixabay.com/download/audio/2021/11/06/audio_19339c228e.mp3' },
    { name: 'heavy-rain.mp3', url: 'https://cdn.pixabay.com/download/audio/2022/11/15/audio_f63b1e01b2.mp3' },
    { name: 'rain-window.mp3', url: 'https://cdn.pixabay.com/download/audio/2024/09/18/audio_ce17a90277.mp3' },
    { name: 'storm-sea.mp3', url: 'https://cdn.pixabay.com/download/audio/2022/11/27/audio_fcc8a92ec2.mp3' }
  ],
  urban: [
    { name: 'coffee-shop.mp3', url: 'https://cdn.pixabay.com/download/audio/2022/03/24/audio_76f6b85076.mp3' },
    { name: 'city-traffic.mp3', url: 'https://cdn.pixabay.com/download/audio/2024/03/09/audio_d01a00dadd.mp3' },
    { name: 'train-station.mp3', url: 'https://cdn.pixabay.com/download/audio/2022/10/31/audio_cf3ab8b2ce.mp3' },
    { name: 'cafe-ambience.mp3', url: 'https://cdn.pixabay.com/download/audio/2022/03/20/audio_d0e1cd8fce.mp3' },
    { name: 'library-quiet.mp3', url: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_a8b4d1d21f.mp3' }
  ],
  space: [
    { name: 'deep-space.mp3', url: 'https://cdn.pixabay.com/download/audio/2021/12/13/audio_dcfff51e7e.mp3' },
    { name: 'cosmic-drone.mp3', url: 'https://cdn.pixabay.com/download/audio/2022/08/31/audio_cd5c38055f.mp3' },
    { name: 'nebula.mp3', url: 'https://cdn.pixabay.com/download/audio/2023/03/28/audio_adcc1a2b9f.mp3' },
    { name: 'space-ambience.mp3', url: 'https://cdn.pixabay.com/download/audio/2024/04/23/audio_ddbed97dc9.mp3' },
    { name: 'interstellar.mp3', url: 'https://cdn.pixabay.com/download/audio/2023/10/31/audio_8e45fc8c97.mp3' }
  ],
  meditation: [
    { name: 'singing-bowls.mp3', url: 'https://cdn.pixabay.com/download/audio/2022/03/10/audio_c8c8a73467.mp3' },
    { name: 'om-chanting.mp3', url: 'https://cdn.pixabay.com/download/audio/2022/11/22/audio_c5f4e96eac.mp3' },
    { name: 'zen-garden.mp3', url: 'https://cdn.pixabay.com/download/audio/2023/09/04/audio_c4e5033bb2.mp3' },
    { name: 'crystal-bowl.mp3', url: 'https://cdn.pixabay.com/download/audio/2022/06/14/audio_e628a3f0f9.mp3' },
    { name: 'flute-meditation.mp3', url: 'https://cdn.pixabay.com/download/audio/2022/08/25/audio_3c37de7c65.mp3' },
    { name: 'healing-frequency.mp3', url: 'https://cdn.pixabay.com/download/audio/2023/03/15/audio_7bc0f5d355.mp3' },
    { name: 'binaural-beats.mp3', url: 'https://cdn.pixabay.com/download/audio/2024/02/09/audio_bb0b7d1e09.mp3' }
  ],
  ambient: [
    { name: 'white-noise.mp3', url: 'https://cdn.pixabay.com/download/audio/2022/03/12/audio_5659419fb2.mp3' },
    { name: 'pink-noise.mp3', url: 'https://cdn.pixabay.com/download/audio/2023/03/20/audio_c7aa0dc42f.mp3' },
    { name: 'fireplace.mp3', url: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_8fe0295a48.mp3' },
    { name: 'cat-purring.mp3', url: 'https://cdn.pixabay.com/download/audio/2022/06/17/audio_1ee25cd9dc.mp3' },
    { name: 'wind-chimes.mp3', url: 'https://cdn.pixabay.com/download/audio/2022/04/07/audio_5b1df08bb1.mp3' }
  ]
};

export async function downloadSound(url, filePath) {
  try {
    const response = await axios({
      method: 'GET',
      url: url,
      responseType: 'stream'
    });
    
    const writer = fs.createWriteStream(filePath);
    response.data.pipe(writer);
    
    return new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });
  } catch (error) {
    console.error(`Error downloading ${filePath}:`, error.message);
    throw error;
  }
}

export async function downloadAllSounds() {
  const baseDir = path.join(process.cwd(), 'public', 'sounds');
  const results = { success: [], failed: [] };
  
  for (const [category, sounds] of Object.entries(SOUND_SOURCES)) {
    const categoryDir = path.join(baseDir, category);
    
    for (const sound of sounds) {
      const filePath = path.join(categoryDir, sound.name);
      try {
        await downloadSound(sound.url, filePath);
        console.log(`✓ Downloaded: ${category}/${sound.name}`);
        results.success.push(`${category}/${sound.name}`);
      } catch (error) {
        console.error(`✗ Failed: ${category}/${sound.name}`);
        results.failed.push(`${category}/${sound.name}`);
      }
    }
  }
  
  return results;
}