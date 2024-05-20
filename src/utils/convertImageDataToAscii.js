import { getColorValue } from './getColorValue.js';

/**
 * Converts RGB values to brightness.
 * @param {number} r - The red component.
 * @param {number} g - The green component.
 * @param {number} b - The blue component.
 * @returns {number} - The brightness value.
 */
function rgbToBrightness(r, g, b) {
  // 고정된 보정치
  const redWeight = 0.299;
  const greenWeight = 0.587;
  const blueWeight = 0.114;

  // 보정된 밝기 계산
  const brightness = redWeight * r + greenWeight * g + blueWeight * b;

  // 밝기 값이 0에서 255 사이에 있도록 보장
  return Math.max(0, Math.min(255, brightness));
}

/**
 * Converts image data to ASCII art based on the provided configuration.
 * @param {ImageData} imageData - The image data to convert.
 * @param {ImageToAsciiConfig} config - The configuration for the ASCII conversion.
 * @returns {Array<Array<{char: string, color: string}>>} - A 2D array of characters and their colors.
 */
function convertImageDataToAscii(imageData, config) {
  const { colorMode, monochromeColor, chars } = config;
  const { data, width, height } = imageData;
  
  const asciiArtArray = [];
  
  for (let y = 0; y < height; y++) {
    const row = [];
    
    for (let x = 0; x < width; x++) {
      const offset = (y * width + x) * 4;
      const r = data[offset];
      const g = data[offset + 1];
      const b = data[offset + 2];
      const a = data[offset + 3];
      
      if (a === 0) {
        row.push({ char: ' ', color: null });
        continue;
      }
      
      let colorValue;
      switch (colorMode) {
        case 'monochrome':
          colorValue = monochromeColor;
          break;
        case 'grayscale':
        case 'color-4':
        case 'color-8':
        case 'color-16':
        case 'color-24':
          colorValue = getColorValue(r, g, b, colorMode);
          break;
        default:
          colorValue = ' ';
          break;
      }

      const brightness = rgbToBrightness(r, g, b);
      const charIndex = Math.floor(((255 - brightness) / 255) * (chars.length - 1));
      row.push({ char: chars[charIndex], color: colorValue });
    }
    
    asciiArtArray.push(row);
  }
  
  return asciiArtArray;
}

export { convertImageDataToAscii };
