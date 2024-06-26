import { readImageFileAsBase64 } from "../utils/readImageFileAsBase64.js";

window.addEventListener('DOMContentLoaded', () => {
    const dropZone = document.body; // 드래그 앤 드롭 영역을 body로 설정
    const app = document.getElementById('app');
    const imgWrapper = document.getElementById('image-wrapper');
    const img = document.getElementById('img');
    const form = document.getElementById('form');
    const monochromeColorInput = document.getElementById('monochromeColor');
    const uploadButton = document.getElementById('uploadButton');
    const imageUploadInput = document.getElementById('imageUpload');
    const resolutionInput = document.getElementById('resolution');
    const colorModeSelect = document.getElementById('colorMode');
    const charSetInput = document.getElementById('charSet');
    const ditheringQualityInput = document.getElementById('ditheringQuality');
    const generateBtn = document.getElementById('generateBtn');
    const downloadBtn = document.getElementById('downloadBtn');

    form.addEventListener('submit', (e) => {
        e.preventDefault();
    });
    
    uploadButton.addEventListener('click', imageUploadInput.click);
    imageUploadInput.addEventListener('input', imageInputHandler);
    monochromeColorInput.addEventListener('input', monochromeColorInputHandler);
    imageInputHandler({target: imageUploadInput});
    monochromeColorInputHandler({target: monochromeColorInput});

    // 드래그 앤 드롭 이벤트 핸들러 추가
    dropZone.addEventListener('dragover', (event) => {
        event.preventDefault();
        dropZone.classList.add('dragover');
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('dragover');
    });

    dropZone.addEventListener('drop', (event) => {
        event.preventDefault();
        dropZone.classList.remove('dragover');
        const files = event.dataTransfer.files;
        if (files.length > 0) {
            imageUploadInput.files = files;
            imageInputHandler({target:imageUploadInput});
        }
    });

    document.querySelectorAll('md-outlined-field md-slider').forEach(slider => {
        sliderInputHanlder({target:slider});
        slider.addEventListener('input', sliderInputHanlder);
    });

    generateBtn.addEventListener('click', () => {
        const config = Object.fromEntries([...document.querySelectorAll('.render-config')].map(configElement => [configElement.name, configElement.value]))
        const imageFile = imageUploadInput.files[0];

        console.dir(config);

        if (imageFile) {
            // Custom event to notify about generating ASCII art
            const generateEvent = new CustomEvent('generateAsciiArt', { detail: { config, imageFile } });
            document.dispatchEvent(generateEvent);

            // Disable inputs and add loading class to the button
            disableInputs();
            generateBtn.classList.add('loading');
        }
    });

    downloadBtn.addEventListener('click', () => {
        // Custom event to notify about downloading ASCII art
        const downloadEvent = new CustomEvent('downloadAsciiArt');
        document.dispatchEvent(downloadEvent);
    });

    function imageInputHandler(e){
        if(e.target.files.length > 0){
            readImageFileAsBase64(e.target.files[0]).then(async (base64) => {
                generateBtn.disabled = false;
                img.src = base64;
                app.classList.add('image-uploaded');
            });
        }else{
            generateBtn.disabled = true;
            img.removeAttribute('src');
            imgWrapper.removeAttribute('style');
            app.classList.remove('image-uploaded');
        }
    }

    function monochromeColorInputHandler(e){
        requestAnimationFrame(() => {
            const parent = e.target.parentNode;
            const colorText = parent.querySelector(':scope .color-text');
            const colorShape = parent.querySelector(':scope .color-shape');
            const color = e.target.value;
            
            colorText.innerText = color;
            colorShape.style.backgroundColor = color;
        })
    }

    function disableInputs() {
        document.querySelectorAll('.render-config-ui').forEach(input => {
            input.disabled = true;
        });
    }

    function sliderInputHanlder({target}){
        target.parentNode.querySelector('p').innerText = target.value;
    }
});
