import { getColorValue } from './getColorValue.js';

/**
 * RGB 값을 밝기로 변환합니다.
 * @param {number} r - 빨강 값.
 * @param {number} g - 초록 값.
 * @param {number} b - 파랑 값.
 * @returns {number} - 밝기 값.
 */
function rgbToBrightness(r, g, b) {
  const redWeight = 0.299;
  const greenWeight = 0.587;
  const blueWeight = 0.114;
  const brightness = redWeight * r + greenWeight * g + blueWeight * b;
  return Math.max(0, Math.min(255, brightness));
}

/**
 * Sobel 에지 디텍션을 적용합니다.
 * @param {Array<number>} brightnessData - 밝기 데이터 배열.
 * @param {number} width - 이미지의 너비.
 * @param {number} height - 이미지의 높이.
 * @param {number} edgeScale - 에지 강도 스케일 (0 ~ 255).
 * @returns {Array<number>} - 에지 강도 배열.
 */
function applySobelEdgeDetection(brightnessData, width, height, edgeScale) {
  const kernelX = [
    [-1, 0, 1],
    [-2, 0, 2],
    [-1, 0, 1]
  ];

  const kernelY = [
    [-1, -2, -1],
    [0, 0, 0],
    [1, 2, 1]
  ];

  const edgeData = new Array(brightnessData.length).fill(0);

  // 에지 스케일을 유효한 범위로 클램핑 (0 ~ 255)
  edgeScale = Math.max(0, Math.min(255, edgeScale));

  // 에지 스케일이 0이면 에지 디텍션을 적용하지 않음
  if (edgeScale === 0) {
    return brightnessData;
  }

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      let gx = 0;
      let gy = 0;

      for (let ky = -1; ky <= 1; ky++) {
        for (let kx = -1; kx <= 1; kx++) {
          const pixel = brightnessData[(y + ky) * width + (x + kx)];
          gx += kernelX[ky + 1][kx + 1] * pixel;
          gy += kernelY[ky + 1][kx + 1] * pixel;
        }
      }

      let edgeMagnitude = Math.sqrt(gx * gx + gy * gy);
      edgeMagnitude = edgeMagnitude * (edgeScale / 255); // 에지 강도 스케일 적용
      edgeData[y * width + x] = Math.max(0, Math.min(255, edgeMagnitude));
    }
  }

  return edgeData;
}

/**
 * 플로이드-스타인버그 디더링을 밝기 값에 적용합니다.
 * @param {Array<number>} brightnessData - 밝기 데이터 배열.
 * @param {number} width - 이미지의 너비.
 * @param {number} height - 이미지의 높이.
 * @param {number} quality - 디더링 품질 (0.0 ~ 1.0).
 * @param {string} chars - 아스키 문자 목록.
 */
function applyFloydSteinbergDithering(brightnessData, width, height, quality, chars) {
  const ditherFactors = [
    { offset: 1, factor: 7 / 16 },
    { offset: width - 1, factor: 3 / 16 },
    { offset: width, factor: 5 / 16 },
    { offset: width + 1, factor: 1 / 16 }
  ];

  const adjustmentFactor = quality * 2; // 품질 변화를 더 극적으로 하기 위한 조정

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const index = y * width + x;
      const oldBrightness = brightnessData[index];
      const newBrightness = Math.round(oldBrightness / 255 * (chars.length - 1)) * (255 / (chars.length - 1));
      brightnessData[index] = newBrightness;
      const error = oldBrightness - newBrightness;

      ditherFactors.forEach(({ offset, factor }) => {
        const adjustedFactor = factor * adjustmentFactor;
        const newIndex = index + offset;
        if (newIndex >= 0 && newIndex < brightnessData.length) {
          brightnessData[newIndex] += error * adjustedFactor;
          brightnessData[newIndex] = Math.max(0, Math.min(255, brightnessData[newIndex])); // 클램핑 추가
        }
      });
    }
  }
}

/**
 * 이미지 데이터를 아스키 아트로 변환합니다.
 * @param {ImageData} imageData - 변환할 이미지 데이터.
 * @param {ImageToAsciiConfig} config - 아스키 변환을 위한 설정.
 * @returns {Array<Array<{char: string, color: string}>>} - 문자와 색상의 2D 배열.
 */
function convertImageDataToAscii(imageData, config) {
  const { colorMode, monochromeColor, chars = '@%#*+=-:. ', ditheringQuality = 1.0, edgeScale = 255 } = config;
  const { data, width, height } = imageData;
  
  const brightnessData = [];
  const asciiArtArray = [];
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const offset = (y * width + x) * 4;
      const r = data[offset];
      const g = data[offset + 1];
      const b = data[offset + 2];
      const a = data[offset + 3];
      
      if (a === 0) {
        brightnessData.push(255);
        continue;
      }
      
      const brightness = rgbToBrightness(r, g, b);
      brightnessData.push(brightness);
    }
  }

  const edgeData = applySobelEdgeDetection(brightnessData, width, height, edgeScale);

  // 밝기 데이터와 에지 데이터를 결합합니다.
  for (let i = 0; i < brightnessData.length; i++) {
    brightnessData[i] = (brightnessData[i] + edgeData[i]) / 2;
  }

  // 디더링 품질이 0보다 클 때만 디더링 적용
  if (ditheringQuality > 0) {
    applyFloydSteinbergDithering(brightnessData, width, height, ditheringQuality, chars);
  }
  
  for (let y = 0; y < height; y++) {
    const row = [];
    
    for (let x = 0; x < width; x++) {
      const brightness = brightnessData[y * width + x];
      const charIndex = Math.floor((brightness / 255) * (chars.length - 1));
      const char = chars[charIndex] || ' '; // 유효한 인덱스 보장
      const colorValue = colorMode === 'monochrome' ? monochromeColor : getColorValue(data[(y * width + x) * 4], data[(y * width + x) * 4 + 1], data[(y * width + x) * 4 + 2], colorMode);
      
      row.push({ char, color: colorValue });
    }
    
    asciiArtArray.push(row);
  }
  
  return asciiArtArray;
}

export { convertImageDataToAscii };
