/**
 * Renders ASCII art on a virtual canvas and transfers it to the given canvas.
 * @param {HTMLCanvasElement | OffscreenCanvas} canvas - The canvas to draw on.
 * @param {Array<Array<{char: string, color: string}>>} asciiArtArray - The ASCII art array to render.
 */
function renderAsciiArt(canvas, asciiArtArray) {
    // Define min and max values for font size and resolution
    const minFontSize = 4;
    const maxFontSize = 24;
    const minResolution = 1;
    const maxResolution = 1000;
  
    // Calculate resolution based on the width of the ASCII art array
    const resolution = asciiArtArray[0].length;
  
    // Ensure resolution is within the allowed range
    const clampedResolution = Math.max(minResolution, Math.min(maxResolution, resolution));
  
    // Calculate font size based on the resolution
    const fontSize = minFontSize + (maxFontSize - minFontSize) * ((maxResolution - clampedResolution) / (maxResolution - minResolution));
    const lineHeight = fontSize; // Set line height equal to font size
  
    // Calculate dimensions based on ASCII art array
    const canvasWidth = resolution * fontSize;
    const canvasHeight = asciiArtArray.length * lineHeight;
  
    // Create a virtual canvas
    const virtualCanvas = new OffscreenCanvas(canvasWidth, canvasHeight);
    const virtualContext = virtualCanvas.getContext('2d');
    
    // Set font style
    virtualContext.font = `${fontSize}px monospace`;
    virtualContext.textBaseline = 'top';
    
    // Clear virtual canvas
    virtualContext.clearRect(0, 0, virtualCanvas.width, virtualCanvas.height);
    
    // Draw each character in the ASCII art array on the virtual canvas
    for (let y = 0; y < asciiArtArray.length; y++) {
      const row = asciiArtArray[y];
      for (let x = 0; x < row.length; x++) {
        const cell = row[x];
        virtualContext.fillStyle = cell.color || '#000'; // Default to black if color is null
        virtualContext.fillText(cell.char, x * fontSize, y * lineHeight);
      }
    }
  
    // Initialize the offscreen canvas size
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
  
    // Transfer the virtual canvas to the actual canvas
    const context = canvas.getContext('2d');
    context.drawImage(virtualCanvas, 0, 0);
  }
  
  export { renderAsciiArt };
  