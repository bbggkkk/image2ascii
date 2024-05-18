const worker = new Worker('worker.js');
let asciiText = ''; // ASCII 텍스트를 저장할 변수
let colorMode = 'monochrome'; // 기본 색상 모드

const fileInput = document.getElementById('upload');
const resolutionInput = document.getElementById('resolution');
const colorModeSelect = document.getElementById('colorMode');
const asciiCharsInput = document.getElementById('asciiChars');
const generateButton = document.getElementById('generate');
const downloadButton = document.getElementById('download');

// 파일이 선택되지 않은 경우 버튼 비활성화
fileInput.addEventListener('change', () => {
  generateButton.disabled = !fileInput.files.length;
});

generateButton.addEventListener('click', () => {
  const resolution = parseInt(resolutionInput.value, 10);
  colorMode = colorModeSelect.value;
  const asciiChars = asciiCharsInput.value || ' !"#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~';

  if (resolution <= 0) {
    alert('Resolution must be greater than 0');
    return;
  }

  const file = fileInput.files[0];
  if (file) {
    // 버튼 비활성화
    fileInput.disabled = true;
    resolutionInput.disabled = true;
    colorModeSelect.disabled = true;
    asciiCharsInput.disabled = true;
    generateButton.disabled = true;
    generateButton.textContent = 'Processing...';

    const reader = new FileReader();
    reader.onload = (e) => {
      worker.postMessage({ imageDataURL: e.target.result, resolution: resolution, colorMode: colorMode, asciiChars: asciiChars });
    };
    reader.readAsDataURL(file);
  }
});

worker.onmessage = async (e) => {
  const { blobURL, text, htmlText, bitmap, width, height } = e.data;
  asciiText = colorMode === 'monochrome' ? text : htmlText; // 컬러 여부에 따라 저장할 텍스트 결정

  const canvas = document.getElementById('asciiCanvas');
  const ctx = canvas.getContext('2d');

  const imgBitmap = await createImageBitmap(bitmap);

  canvas.width = width;
  canvas.height = height;
  ctx.drawImage(imgBitmap, 0, 0);

  // 버튼 및 파일 입력 필드 상태 초기화
  fileInput.disabled = false;
  resolutionInput.disabled = false;
  colorModeSelect.disabled = false;
  asciiCharsInput.disabled = false;
  generateButton.disabled = false; // 파일이 선택되지 않았으므로 버튼 비활성화
  generateButton.textContent = 'Generate ASCII Art';
  downloadButton.disabled = false;
};

downloadButton.addEventListener('click', () => {
  const blob = new Blob([asciiText], { type: colorMode === 'monochrome' ? 'text/plain' : 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = colorMode === 'monochrome' ? 'ascii_art.txt' : 'ascii_art.html';
  a.click();
  URL.revokeObjectURL(url);
});

// 초기 상태에서는 버튼 비활성화
generateButton.disabled = true;
downloadButton.disabled = true;
