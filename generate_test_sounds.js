import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Generate a simple sine wave sound file for testing
function generateSineWave(frequency, duration, sampleRate = 44100) {
  const numSamples = duration * sampleRate;
  const samples = new Float32Array(numSamples);
  
  for (let i = 0; i < numSamples; i++) {
    samples[i] = Math.sin(2 * Math.PI * frequency * i / sampleRate);
  }
  
  return samples;
}

// Convert to WAV format
function floatTo16BitPCM(output, offset, input) {
  for (let i = 0; i < input.length; i++, offset += 2) {
    const s = Math.max(-1, Math.min(1, input[i]));
    output.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
  }
}

function writeWAVFile(filename, samples, sampleRate = 44100) {
  const length = samples.length * 2 + 44;
  const buffer = new ArrayBuffer(length);
  const view = new DataView(buffer);
  
  // WAV header
  const writeString = (offset, string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };
  
  writeString(0, 'RIFF');
  view.setUint32(4, length - 8, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(36, 'data');
  view.setUint32(40, samples.length * 2, true);
  
  floatTo16BitPCM(view, 44, samples);
  
  fs.writeFileSync(filename, Buffer.from(buffer));
}

// Create test sounds in different categories
const testSounds = [
  { dir: 'ocean', name: 'test-ocean-wave.wav', frequency: 100, duration: 2 },
  { dir: 'forest', name: 'test-forest-birds.wav', frequency: 800, duration: 2 },
  { dir: 'meditation', name: 'test-meditation.wav', frequency: 528, duration: 3 },
  { dir: 'space', name: 'test-space-drone.wav', frequency: 60, duration: 3 },
  { dir: 'ambient', name: 'test-white-noise.wav', frequency: 440, duration: 2 },
  { dir: 'weather', name: 'test-rain.wav', frequency: 200, duration: 2 },
  { dir: 'urban', name: 'test-city.wav', frequency: 300, duration: 2 }
];

console.log('Generating test sound files...\n');

testSounds.forEach(({ dir, name, frequency, duration }) => {
  const dirPath = path.join(__dirname, 'public', 'sounds', dir);
  const filePath = path.join(dirPath, name);
  
  console.log(`Creating ${dir}/${name} (${frequency}Hz, ${duration}s)`);
  
  const samples = generateSineWave(frequency, duration);
  writeWAVFile(filePath, samples);
});

console.log('\n✓ Test sound files created successfully!');
console.log('\nThese are simple sine wave tones for testing audio playback.');
console.log('Replace them with real soundscape files when available.');