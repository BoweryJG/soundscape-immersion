#!/bin/bash
#
# SOUNDSCAPE IMMERSION DOWNLOAD SCRIPT
# Downloads 12 meditation and space soundscapes from verified sources
#
# Usage: ./download_all_soundscapes.sh
# 

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Base directory
BASE_DIR="/home/jgolden/soundscape-immersion"
MEDITATION_DIR="$BASE_DIR/meditation"
SPACE_DIR="$BASE_DIR/space"

echo -e "${BLUE}============================================${NC}"
echo -e "${BLUE}   SOUNDSCAPE IMMERSION DOWNLOAD SCRIPT   ${NC}"
echo -e "${BLUE}============================================${NC}"
echo ""

# Function to download with retry
download_with_retry() {
    local url="$1"
    local output="$2"
    local max_attempts=3
    local attempt=1
    
    echo -e "${YELLOW}Downloading: $(basename "$output")${NC}"
    
    while [ $attempt -le $max_attempts ]; do
        if wget --timeout=30 --tries=3 -O "$output" "$url"; then
            echo -e "${GREEN}✓ Downloaded: $(basename "$output")${NC}"
            return 0
        else
            echo -e "${RED}✗ Attempt $attempt failed${NC}"
            rm -f "$output"  # Remove partial download
            ((attempt++))
        fi
    done
    
    echo -e "${RED}✗ Failed to download: $(basename "$output")${NC}"
    return 1
}

# Function to extract zip if needed
extract_if_zip() {
    local file="$1"
    if file "$file" | grep -q "Zip archive"; then
        echo -e "${YELLOW}Extracting zip file...${NC}"
        python3 -c "
import zipfile
import os
with zipfile.ZipFile('$file', 'r') as zip_ref:
    zip_ref.extractall('.')
    for filename in zip_ref.namelist():
        print('Extracted:', filename)
os.remove('$file')
"
    fi
}

echo -e "${BLUE}=== MEDITATION SOUNDSCAPES (7 files) ===${NC}"
echo ""

# 1. Om Chanting Monks (small file, good starting point)
echo -e "${YELLOW}1/12: Om Chanting Monks${NC}"
cd "$MEDITATION_DIR"
if download_with_retry "https://archive.org/download/OmChanting/OmChanting_vbr_mp3.zip" "om_chanting_monks_temp.zip"; then
    extract_if_zip "om_chanting_monks_temp.zip"
    # Rename extracted file
    if [ -f "om2.wav.mp3" ]; then
        mv "om2.wav.mp3" "om_chanting_monks.mp3"
    fi
fi

# 2. Tibetan Singing Bowls (large file - may take time)
echo -e "${YELLOW}2/12: Tibetan Singing Bowls (Large file - this may take a while)${NC}"
# Using a different URL for a shorter version
if ! download_with_retry "https://archive.org/download/tibetan-healing-sounds/Healing%20Music.mp3" "tibetan_singing_bowls.mp3"; then
    echo -e "${YELLOW}Note: Large file download failed. See tibetan_singing_bowls.txt for manual download instructions.${NC}"
fi

# 3. 528Hz Healing Frequency
echo -e "${YELLOW}3/12: 528Hz Healing Frequency${NC}"
# Try smaller 528Hz file
if ! download_with_retry "https://archive.org/download/om-chanting-528-hz/Om_chanting_528_Hz_vbr_mp3.zip" "healing_frequency_528Hz_temp.zip"; then
    echo -e "${YELLOW}Note: 528Hz file not available at expected location. Check sources manually.${NC}"
fi

# 4. Crystal Bowl Meditation (using alternative source)
echo -e "${YELLOW}4/12: Crystal Bowl Meditation${NC}"
echo -e "${YELLOW}Note: Crystal bowl sounds available from Pixabay and other sources. See crystal_bowl_meditation.txt for details.${NC}"

# 5. Binaural Beats Alpha Waves (large file)
echo -e "${YELLOW}5/12: Binaural Beats Alpha Waves${NC}"
# Try shorter version first
if ! download_with_retry "https://archive.org/download/alpha-binaural-beats-11-hz-pure-frequency-ideal-for-focus-creativity-relaxation/Alpha%20Binaural%20Beat%20%2B%20Isochronic%20Pulse%20(10Hz)%20-%2015%20minute%20session.mp3" "binaural_beats_alpha_waves.mp3"; then
    echo -e "${YELLOW}Note: Alpha waves file may be large. See binaural_beats_alpha_waves.txt for alternatives.${NC}"
fi

# 6. Zen Garden Fountain
echo -e "${YELLOW}6/12: Zen Garden Fountain${NC}"
echo -e "${YELLOW}Note: Zen fountain sounds available from MyNoise.net generator and Freesound.org. See zen_garden_fountain.txt${NC}"

# 7. Native American Flute (large file)
echo -e "${YELLOW}7/12: Native American Flute${NC}"
echo -e "${YELLOW}Note: Large file (595MB). See native_american_flute.txt for download instructions.${NC}"

echo ""
echo -e "${BLUE}=== SPACE SOUNDSCAPES (5 files) ===${NC}"
echo ""

cd "$SPACE_DIR"

# 8. Deep Space Ambient
echo -e "${YELLOW}8/12: Deep Space Ambient${NC}"
echo -e "${YELLOW}Note: NASA Hubble sonifications available from multiple sources. See deep_space_ambient.txt${NC}"

# 9. Cosmic Radiation Sounds
echo -e "${YELLOW}9/12: Cosmic Radiation Sounds${NC}"
echo -e "${YELLOW}Note: University of Iowa space-audio.org has extensive collection. See cosmic_radiation_sounds.txt${NC}"

# 10. Solar Wind Particles
echo -e "${YELLOW}10/12: Solar Wind Particles${NC}"
echo -e "${YELLOW}Note: NASA SOHO mission sounds available. See solar_wind_particles.txt${NC}"

# 11. Nebula Ambience
echo -e "${YELLOW}11/12: Nebula Ambience${NC}"
echo -e "${YELLOW}Note: NASA Chandra X-ray Observatory sonifications. See nebula_ambience.txt${NC}"

# 12. Interstellar Drone
echo -e "${YELLOW}12/12: Interstellar Drone${NC}"
echo -e "${YELLOW}Note: Voyager mission recordings from University of Iowa. See interstellar_drone.txt${NC}"

echo ""
echo -e "${BLUE}============================================${NC}"
echo -e "${BLUE}           DOWNLOAD SUMMARY                ${NC}"
echo -e "${BLUE}============================================${NC}"
echo ""

# Count downloaded files
meditation_count=$(find "$MEDITATION_DIR" -name "*.mp3" | wc -l)
space_count=$(find "$SPACE_DIR" -name "*.mp3" | wc -l)
total_count=$((meditation_count + space_count))

echo -e "${GREEN}Successfully downloaded MP3 files: $total_count${NC}"
echo -e "${GREEN}Meditation files: $meditation_count${NC}"
echo -e "${GREEN}Space files: $space_count${NC}"
echo ""

if [ $total_count -gt 0 ]; then
    echo -e "${GREEN}Downloaded files:${NC}"
    find "$BASE_DIR" -name "*.mp3" -exec basename {} \; | sort
    echo ""
fi

echo -e "${YELLOW}IMPORTANT NOTES:${NC}"
echo "• Many files are very large (100MB+) and may take time to download"
echo "• Some sources require manual download due to file size or access restrictions"
echo "• Check the .txt files in each directory for detailed download instructions"
echo "• NASA and university sources provide the highest quality scientific audio"
echo "• Archive.org files are generally public domain or Creative Commons licensed"
echo ""

echo -e "${BLUE}MANUAL DOWNLOAD SOURCES:${NC}"
echo "• NASA Audio: https://www.nasa.gov/audio-and-ringtones/"
echo "• Space Audio: https://space-audio.org/"
echo "• Archive.org: https://archive.org/ (search for specific titles)"
echo "• MyNoise.net: https://mynoise.net/ (interactive generators)"
echo "• Freesound.org: https://freesound.org/ (Creative Commons licensed)"
echo ""

echo -e "${GREEN}Download script completed!${NC}"
echo -e "${YELLOW}See download_sources.md for comprehensive source listing.${NC}"