self.onmessage = async (e) => {
  const { imageDataURL, resolution, isColor, asciiChars } = e.data;
  const characters = asciiChars || 'ZYXWVUTSRQPONMLKJIHGFEDCBA@#$%&0987654321|\\/)(}{][zgmpqwbdyshkaeoftznxuvcrli!*+_~;:,^"\'-.` ';
  drawAsciiArt(imageDataURL, resolution, isColor, characters);
};

async function drawAsciiArt(imageDataURL, resolution, isColor, asciiChars) {
  const ASCII_CHARS = asciiChars.split('').filter((char, index, self) => self.indexOf(char) === index);

  const imageBlob = await fetch(imageDataURL).then(res => res.blob());
  const bitmap = await createImageBitmap(imageBlob);

  // Limit resolution to maximum width of 3000 pixels
  const width = Math.min(Math.round(resolution), 3000);
  const height = Math.round(width * bitmap.height / bitmap.width);

  // Ensure width and height are valid unsigned long values
  const validWidth = Math.max(1, width);
  const validHeight = Math.max(1, height);

  const offscreenCanvas = new OffscreenCanvas(validWidth, validHeight);
  const ctx = offscreenCanvas.getContext('2d');
  ctx.drawImage(bitmap, 0, 0, offscreenCanvas.width, offscreenCanvas.height);
  const imageData = ctx.getImageData(0, 0, offscreenCanvas.width, offscreenCanvas.height);

  const asciiArtData = pixelsToAscii(imageData, resolution, isColor, ASCII_CHARS);
  const asciiCanvas = new OffscreenCanvas(asciiArtData.width, asciiArtData.height);
  const asciiCtx = asciiCanvas.getContext('2d');

  asciiCtx.font = '10px monospace';
  asciiCtx.clearRect(0, 0, asciiCanvas.width, asciiCanvas.height);

  asciiArtData.data.forEach((row, y) => {
    row.forEach((cell, x) => {
      asciiCtx.fillStyle = isColor ? cell.color : '#000';
      asciiCtx.fillText(cell.char, x * 10, y * 10);
    });
  });

  const asciiBlob = await asciiCanvas.convertToBlob();
  const blobURL = URL.createObjectURL(asciiBlob);

  const bitmapResult = await createImageBitmap(asciiCanvas);
  
  self.postMessage({ blobURL: blobURL, text: asciiArtData.text, htmlText: asciiArtData.htmlText, bitmap: bitmapResult, width: asciiArtData.width, height: asciiArtData.height }, [bitmapResult]);
}

function pixelsToAscii(imageData, resolution, isColor, ASCII_CHARS) {
  const { width, height, data } = imageData;
  const cellSize = 10;
  const asciiData = [];
  let asciiText = '';
  let htmlText = '<pre style="font: 10px monospace; line-height: 10px;">';

  const luminance = (r, g, b) => 0.299 * r + 0.587 * g + 0.114 * b;

  for (let y = 0; y < height; y++) {
    const row = [];
    let rowText = '';
    let rowHtml = '';
    for (let x = 0; x < width; x++) {
      const offset = (y * width + x) * 4;
      const r = data[offset];
      const g = data[offset + 1];
      const b = data[offset + 2];
      const avg = luminance(r, g, b);
      const charIndex = Math.floor((avg / 255) * (ASCII_CHARS.length - 1));
      const char = ASCII_CHARS[charIndex];
      const color = isColor ? `rgb(${r},${g},${b})` : '#000';
      row.push({ char: char, color: color });
      rowText += char;
      rowHtml += isColor ? `<span style="color: ${color};">${char}</span>` : `<span style="color: #000;">${char}</span>`;
    }
    asciiData.push(row);
    asciiText += rowText + '\\n';
    htmlText += rowHtml + '\\n';
  }
  htmlText += '</pre>';
  return {
    data: asciiData,
    text: asciiText,
    htmlText: htmlText,
    width: width * cellSize,
    height: height * cellSize
  };
}
