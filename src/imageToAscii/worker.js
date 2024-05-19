import { createImageToAsciiArt } from './createImageToAsciiArt.js';
import { renderAsciiArt } from './renderAsciiArt.js';
import { asciiArtToFile } from '../utils/asciiArtToFile.js';

let offscreenCanvas;

self.addEventListener('message', async (event) => {
  const { method, config, offscreen, imageFile } = event.data;

  if (method === 'init') {
    offscreenCanvas = offscreen;
  }

  if (method === 'render') {
    try {
      const asciiArtArray = await createImageToAsciiArt(imageFile, config);
      renderAsciiArt(offscreenCanvas, asciiArtArray); // Render directly on the offscreen canvas
      
      // Generate file content based on the ASCII art and config
      const fileBlob = await asciiArtToFile(asciiArtArray, config);
      const fileName = `ascii_${imageFile.name.replace(/\.[^/.]+$/, '')}.${fileBlob.type === 'text/plain' ? 'txt' : 'html'}`;

      // Send the file object back to the main thread
      self.postMessage({ method: 'renderComplete', file: { blob: fileBlob, name: fileName }, asciiArtArray });
    } catch (error) {
      self.postMessage({ method: 'error', error: error.message });
    }
  }
});
