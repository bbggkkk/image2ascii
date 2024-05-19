import './control.js';

document.addEventListener('DOMContentLoaded', () => {
  const errorDialog = document.getElementById('errorDialog');
  const canvasElement = document.getElementById('asciiArtCanvas');

  errorDialog.show();

  const worker = new Worker('/src/imageToAscii/worker.js', { type: 'module' });

  let offscreenCanvas;
  let currentAsciiArtArray;
  let currentConfig;
  let currentFile;
  const generateBtn = document.getElementById('generateBtn');

  if (canvasElement.transferControlToOffscreen) {
    offscreenCanvas = canvasElement.transferControlToOffscreen();
    worker.postMessage({ method: 'init', offscreen: offscreenCanvas }, [offscreenCanvas]);
  } else {
    // Fallback for browsers that do not support OffscreenCanvas
    offscreenCanvas = canvasElement;
    worker.postMessage({ method: 'init', offscreen: offscreenCanvas });
  }

  worker.addEventListener('message', (event) => {
    const { method, error, file, asciiArtArray } = event.data;

    if (method === 'renderComplete') {
      console.log('Render complete');
      currentAsciiArtArray = asciiArtArray;
      currentFile = file;

      // Re-enable the input fields and remove loading class from the button
      enableInputs();
      generateBtn.classList.remove('loading');

      // Show the download button
      const downloadBtn = document.getElementById('downloadBtn');
      downloadBtn.style.display = 'block';
    } else if (method === 'error') {
      console.error('Error generating ASCII art:', error);
      alert('Resolution is off the charts!'); //추후에 md-dialog로 변경
      enableInputs();
      generateBtn.classList.remove('loading');
    }
  });

  document.addEventListener('generateAsciiArt', (event) => {
    const { config, imageFile } = event.detail;
    currentConfig = config;

    worker.postMessage({ method: 'render', config: currentConfig, imageFile });
  });

  document.addEventListener('downloadAsciiArt', () => {
    if (currentFile) {
      const url = URL.createObjectURL(currentFile.blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = currentFile.name;
      a.click();
      URL.revokeObjectURL(url);
    }
  });

  function enableInputs() {
    document.querySelectorAll('#resolution, #colorMode, #monochromeColor, #charSet, #imageUpload, #uploadButton, #generateBtn, #monochrome-wrap').forEach(input => {
      input.disabled = false;
    });
  }
});
