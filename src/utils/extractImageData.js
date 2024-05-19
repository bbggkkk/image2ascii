/**
 * Extracts image data from an HTMLImageElement using OffscreenCanvas and returns it.
 * @param {HTMLImageElement} image - The image element.
 * @param {number} resolution - The resolution for the ASCII art.
 * @returns {ImageData} - The image data.
 */
function extractImageData(image, resolution) {
    const offscreenCanvas = new OffscreenCanvas(resolution, resolution);
    const context = offscreenCanvas.getContext('2d');

    // Calculate aspect ratio and set canvas dimensions
    const aspectRatio = image.width / image.height;
    offscreenCanvas.width = resolution;
    offscreenCanvas.height = Math.round(resolution / aspectRatio);

    // Draw the image onto the canvas
    context.drawImage(
        image,
        0,
        0,
        offscreenCanvas.width,
        offscreenCanvas.height
    );

    // Get the image data from the canvas
    return context.getImageData(
        0,
        0,
        offscreenCanvas.width,
        offscreenCanvas.height
    );
}

export { extractImageData };
