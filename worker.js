const ASCII_CHARS = Array.from({ length: 95 }, (_, i) => String.fromCharCode(i + 32));

self.onmessage = async (e) => {
  const { imageDataURL, resolution, isColor } = e.data;

  const blob = await fetch(imageDataURL).then(res => res.blob());
  const bitmap = await createImageBitmap(blob);

  const offscreenCanvas = new OffscreenCanvas(resolution, resolution * bitmap.height / bitmap.width);
  const ctx = offscreenCanvas.getContext('2d');
  ctx.drawImage(bitmap, 0, 0, offscreenCanvas.width, offscreenCanvas.height);
  const imageData = ctx.getImageData(0, 0, offscreenCanvas.width, offscreenCanvas.height);

  const asciiArtData = pixelsToAscii(imageData, resolution, isColor);
  const asciiCanvas = new OffscreenCanvas(asciiArtData.width, asciiArtData.height);
  const asciiCtx = asciiCanvas.getContext('2d');

  asciiCtx.font = '10px monospace';
  asciiCtx.clearRect(0, 0, asciiCanvas.width, asciiCanvas.height);

  asciiArtData.data.forEach((row, y) => {
    row.forEach((cell, x) => {
      asciiCtx.fillStyle = cell.color;
      asciiCtx.fillText(cell.char, x * 10, y * 10);
    });
  });

  const bitmapResult = asciiCanvas.transferToImageBitmap();
  self.postMessage({ bitmap: bitmapResult, width: asciiArtData.width, height: asciiArtData.height, text: asciiArtData.text, htmlText: asciiArtData.htmlText }, [bitmapResult]);
};

function pixelsToAscii(imageData, resolution, isColor) {
  const { width, height, data } = imageData;
  const cellSize = 10;
  const asciiData = [];
  let asciiText = '';
  let htmlText = '<pre style="font: 10px monospace; line-height: 10px;">';
  for (let y = 0; y < height; y++) {
    const row = [];
    let rowText = '';
    let rowHtml = '';
    for (let x = 0; x < width; x++) {
      const offset = (y * width + x) * 4;
      const r = data[offset];
      const g = data[offset + 1];
      const b = data[offset + 2];
      const avg = (r + g + b) / 3;
      const charIndex = Math.floor((avg / 255) * (ASCII_CHARS.length - 1));
      const char = ASCII_CHARS[charIndex];
      const color = isColor ? `rgb(${r},${g},${b})` : `rgb(${avg},${avg},${avg})`;
      row.push({ char: char, color: color });
      rowText += char;
      rowHtml += isColor ? `<span style="color: ${color};">${char}</span>` : char;
    }
    asciiData.push(row);
    asciiText += rowText + '\n';
    htmlText += rowHtml + '\n';
  }
  htmlText += '</pre>';
  return {
    width: width * cellSize,
    height: height * cellSize,
    data: asciiData,
    text: asciiText,
    htmlText: htmlText
  };
}
