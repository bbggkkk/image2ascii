import { readImageFile } from '../utils/readImageFile.js';
import { resizeImage } from '../utils/resizeImage.js';
import { extractImageData } from '../utils/extractImageData.js';
import { convertImageDataToAscii } from '../utils/convertImageDataToAscii.js';

/**
 * Converts an image file to ASCII art based on the provided configuration.
 * @param {File} imageFile - The image file to convert.
 * @param {ImageToAsciiConfig} config - The configuration for the ASCII conversion.
 * @returns {Promise<Array<Array<{char: string, color: string}>>>} - A promise that resolves to the resulting ASCII art array.
 */
async function createImageToAsciiArt(imageFile, config) {
  try {
    // 1. Read the image file to get an ImageBitmap
    let image = await readImageFile(imageFile);

    // 2. If colorMode is 'monochrome', increase contrast (commented out as requested)
    // if (config.colorMode === 'monochrome') {
    //   image = await increaseContrast(image, 1.5); // Adjust contrast factor as needed
    // }

    // 3. Resize the image based on the resolution
    image = await resizeImage(image, config.resolution);

    // 4. Extract image data from the ImageBitmap
    const imageData = extractImageData(image, config.resolution);

    // 5. Convert the image data to ASCII art
    const asciiArtArray = convertImageDataToAscii(imageData, config);

    return asciiArtArray;
  } catch (error) {
    throw new Error(`Failed to create ASCII art: ${error.message}`);
  }
}

export { createImageToAsciiArt };
