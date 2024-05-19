/**
 * Resizes an image to the specified width while maintaining the aspect ratio.
 * @param {ImageBitmap} image - The ImageBitmap to resize.
 * @param {number} width - The target width for the resized image.
 * @returns {Promise<ImageBitmap>} - A promise that resolves to a new resized ImageBitmap.
 */
function resizeImage(image, width) {
    const aspectRatio = image.height / image.width;
    const height = Math.round(width * aspectRatio);
    
    const offscreenCanvas = new OffscreenCanvas(width, height);
    const context = offscreenCanvas.getContext('2d');
    
    context.drawImage(image, 0, 0, width, height);
    
    return offscreenCanvas.transferToImageBitmap();
  }
  
  export { resizeImage };
  