/**
 * Reads an image file and converts it to a Base64 string.
 * @param {File} file - The image file to read.
 * @returns {Promise<string>} - A promise that resolves to the Base64 string of the image.
 */
function readImageFileAsBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onloadend = () => {
        resolve(reader.result);
      };
      
      reader.onerror = reject;
  
      reader.readAsDataURL(file);
    });
  }
  
  export { readImageFileAsBase64 };
  