/**
 * Converts ASCII art array and config to a text or HTML file.
 * @param {Array<Array<{char: string, color: string}>>} asciiArtArray - The ASCII art array to convert.
 * @param {Object} config - The configuration used for the ASCII art.
 * @returns {Promise<Blob>} - A promise that resolves to a Blob representing the file.
 */
function asciiArtToFile(asciiArtArray, config) {
    return new Promise((resolve, reject) => {
      try {
        let fileContent;
        let fileType;
  
        if (config.colorMode === 'monochrome') {
          // Generate plain text content
          fileContent = asciiArtArray.map(row => row.map(cell => cell.char).join('')).join('\n');
          fileType = 'text/plain';
        } else {
          // Generate HTML content
          fileContent = '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>ASCII Art</title>';
          fileContent += '<style>body { font-family: monospace; white-space: pre; }</style></head><body><div>';
  
          for (let y = 0; y < asciiArtArray.length; y++) {
            fileContent += '<p>';
            const row = asciiArtArray[y];
            for (let x = 0; x < row.length; x++) {
              const cell = row[x];
              const colorStyle = ` style="color: ${cell.color}"`;
              fileContent += `<span${colorStyle}>${cell.char}</span>`;
            }
            fileContent += '</p>';
          }
  
          fileContent += '</div></body></html>';
          fileType = 'text/html';
        }
  
        const blob = new Blob([fileContent], { type: fileType });
        resolve(blob);
      } catch (error) {
        reject(error);
      }
    });
  }
  
  export { asciiArtToFile };  