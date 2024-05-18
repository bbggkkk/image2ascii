const worker = new Worker('worker.js');
let asciiText = ''; // ASCII 텍스트를 저장할 변수
let isColor = false; // 컬러 여부를 저장할 변수

document.getElementById('generate').addEventListener('click', () => {
  const fileInput = document.getElementById('upload');
  const resolutionInput = document.getElementById('resolution');
  const colorInput = document.getElementById('color');
  const generateButton = document.getElementById('generate');
  const downloadButton = document.getElementById('download');

  const resolution = parseInt(resolutionInput.value, 10);
  isColor = colorInput.checked;

  if (resolution <= 0) {
    alert('Resolution must be greater than 0');
    return;
  }

  const file = fileInput.files[0];
  if (file) {
    // 버튼 비활성화
    fileInput.disabled = true;
    resolutionInput.disabled = true;
    colorInput.disabled = true;
    generateButton.disabled = true;
    generateButton.textContent = 'Processing...';

    const reader = new FileReader();
    reader.onload = (e) => {
      worker.postMessage({ imageDataURL: e.target.result, resolution: resolution, isColor: isColor });
    };
    reader.readAsDataURL(file);
  }
});

worker.onmessage = (e) => {
  const { bitmap, width, height, text, htmlText } = e.data;
  asciiText = isColor ? htmlText : text; // 컬러 여부에 따라 저장할 텍스트 결정
  const canvas = document.getElementById('asciiCanvas');
  const ctx = canvas.getContext('bitmaprenderer');

  canvas.width = width;
  canvas.height = height;
  ctx.transferFromImageBitmap(bitmap);

  // 버튼 활성화
  document.getElementById('upload').disabled = false;
  document.getElementById('resolution').disabled = false;
  document.getElementById('color').disabled = false;
  document.getElementById('generate').disabled = false;
  document.getElementById('generate').textContent = 'Generate ASCII Art';
  document.getElementById('download').disabled = false;
};

document.getElementById('download').addEventListener('click', () => {
  const blob = new Blob([asciiText], { type: isColor ? 'text/html' : 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = isColor ? 'ascii_art.html' : 'ascii_art.txt';
  a.click();
  URL.revokeObjectURL(url);
});
