/**
 * Reads an image file and returns a Promise that resolves to an ImageBitmap.
 * @param {File} imageFile - The image file to read.
 * @returns {Promise<ImageBitmap>} - A promise that resolves to an ImageBitmap.
 */
async function readImageFile(imageFile) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async function(event) {
        try {
          const imageBitmap = await createImageBitmap(new Blob([event.target.result]));
          resolve(imageBitmap);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = reject;
      reader.readAsArrayBuffer(imageFile);
    });
  }
  
  export { readImageFile };
  