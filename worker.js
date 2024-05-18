self.onmessage = async (e) => {
  const { imageDataURL, resolution, colorMode, asciiChars } = e.data;
  const characters = asciiChars || ' !"#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~';
  drawAsciiArt(imageDataURL, resolution, colorMode, characters);
};

async function drawAsciiArt(imageDataURL, resolution, colorMode, asciiChars) {
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

  const asciiArtData = pixelsToAscii(imageData, colorMode, ASCII_CHARS);
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

  const asciiBlob = await asciiCanvas.convertToBlob();
  const blobURL = URL.createObjectURL(asciiBlob);

  const bitmapResult = await createImageBitmap(asciiCanvas);
  
  self.postMessage({ blobURL: blobURL, text: asciiArtData.text, htmlText: asciiArtData.htmlText, bitmap: bitmapResult, width: asciiArtData.width, height: asciiArtData.height }, [bitmapResult]);
}

function pixelsToAscii(imageData, colorMode, ASCII_CHARS) {
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
      const color = getColor(r, g, b, colorMode);
      row.push({ char: char, color: color });
      rowText += char;
      rowHtml += `<span style="color: ${color};">${char}</span>`;
    }
    asciiData.push(row);
    asciiText += rowText + '\n';
    htmlText += rowHtml + '\n';
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

function getColor(r, g, b, mode) {
  switch (mode) {
    case 'monochrome':
      return `rgb(0,0,0)`
    case 'grayscale':
      const gray = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
      return `rgb(${gray},${gray},${gray})`;
    case '16colors':
      return get16Color(r, g, b);
    case '256colors':
      return get256Color(r, g, b);
    case 'fullcolor':
    default:
      return `rgb(${r},${g},${b})`;
  }
}

function get16Color(r, g, b) {
  const levels = [0, 128, 255];
  const red = levels[Math.round(r / 128)];
  const green = levels[Math.round(g / 128)];
  const blue = levels[Math.round(b / 128)];
  return `rgb(${red},${green},${blue})`;
}

function get256Color(r, g, b) {
  const levels = [0, 95, 135, 175, 215, 255];
  const red = levels[Math.round(r / 51)];
  const green = levels[Math.round(g / 51)];
  const blue = levels[Math.round(b / 51)];
  return `rgb(${red},${green},${blue})`;
}
