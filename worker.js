self.onmessage = async (e) => {
  const { imageDataURL, resolution, colorMode, asciiChars } = e.data;
  const characters = asciiChars || '$@B%8&WM#*oahkbdpqwmZOQ0CLQJYUXzvcunxrjft/\\|)(1}{][?-_+~<>i!lI;:,^`\'. ';
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
  const usedColors = new Set();
  let asciiText = '';
  let htmlText = '<pre style="font: 10px monospace; line-height: 10px;">';
  let styleTag = '<style>';

  const luminance = (r, g, b) => 0.299 * r + 0.587 * g + 0.114 * b;

  // 최대 밝기와 최소 밝기 계산
  let minLuminance = Infinity;
  let maxLuminance = -Infinity;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const offset = (y * width + x) * 4;
      const r = data[offset];
      const g = data[offset + 1];
      const b = data[offset + 2];
      const lum = luminance(r, g, b);
      if (lum < minLuminance) minLuminance = lum;
      if (lum > maxLuminance) maxLuminance = lum;
    }
  }

  // 밝기를 정규화하여 ASCII 문자 선택
  for (let y = 0; y < height; y++) {
    const row = [];
    let rowText = '';
    let rowHtml = '';
    for (let x = 0; x < width; x++) {
      const offset = (y * width + x) * 4;
      const r = data[offset];
      const g = data[offset + 1];
      const b = data[offset + 2];
      const lum = luminance(r, g, b);
      const normalizedLum = (lum - minLuminance) / (maxLuminance - minLuminance);
      const charIndex = Math.floor(normalizedLum * (ASCII_CHARS.length - 1));
      const char = ASCII_CHARS[charIndex];
      const { colorClass, color } = getColorClass(r, g, b, colorMode);
      usedColors.add(colorClass);
      row.push({ char: char, color: color });
      rowText += char;
      rowHtml += `<span class="${colorClass}">${char}</span>`;
    }
    asciiData.push(row);
    asciiText += rowText + '\n';
    htmlText += rowHtml + '\n';
  }
  htmlText += '</pre>';

  if (colorMode !== 'monochrome') {
    styleTag += generateColorClasses(Array.from(usedColors), colorMode);
    styleTag += '</style>';
    htmlText = styleTag + htmlText;
  }

  return {
    data: asciiData,
    text: asciiText,
    htmlText: htmlText,
    width: width * cellSize,
    height: height * cellSize
  };
}

function getColorClass(r, g, b, mode) {
  let colorClass, color;
  switch (mode) {
    case 'monochrome':
      colorClass = 'c-0-0-0';
      color = 'rgb(0,0,0)';
      break;
    case 'grayscale':
      const gray = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
      colorClass = `c-${gray}-${gray}-${gray}`;
      color = `rgb(${gray},${gray},${gray})`;
      break;
    case '16colors':
      colorClass = get16ColorClass(r, g, b);
      color = `rgb(${colorClass.split('-').slice(1).join(',')})`;
      break;
    case '256colors':
      colorClass = get256ColorClass(r, g, b);
      color = `rgb(${colorClass.split('-').slice(1).join(',')})`;
      break;
    case 'fullcolor':
    default:
      colorClass = `c-${r}-${g}-${b}`;
      color = `rgb(${r},${g},${b})`;
      break;
  }
  return { colorClass, color };
}

function get16ColorClass(r, g, b) {
  const levels = [0, 128, 255];
  const red = levels[Math.round(r / 128)];
  const green = levels[Math.round(g / 128)];
  const blue = levels[Math.round(b / 128)];
  return `c16-${red}-${green}-${blue}`;
}

function get256ColorClass(r, g, b) {
  const levels = [0, 95, 135, 175, 215, 255];
  const red = levels[Math.round(r / 51)];
  const green = levels[Math.round(g / 51)];
  const blue = levels[Math.round(b / 51)];
  return `c256-${red}-${green}-${blue}`;
}

function generateColorClasses(usedColors, mode) {
  let classes = '';
  usedColors.forEach(colorClass => {
    const match = colorClass.match(/c(16|256)?-(\d+)-(\d+)-(\d+)/);
    if (match) {
      const [, , r, g, b] = match;
      classes += `.${colorClass} { color: rgb(${r},${g},${b}); }\n`;
    }
  });
  return classes;
}
