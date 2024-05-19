/**
 * Converts a number to a two-digit hex string.
 * @param {number} value - The number to convert.
 * @returns {string} - The two-digit hex string.
 */
function toHex(value) {
    return value.toString(16).padStart(2, '0');
}

/**
 * Converts RGB values to a hex color string.
 * @param {number} r - The red component.
 * @param {number} g - The green component.
 * @param {number} b - The blue component.
 * @returns {string} - The hex color string.
 */
function rgbToHex(r, g, b) {
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * Maps RGB values to the corresponding color value based on the color mode.
 * @param {number} r - The red component.
 * @param {number} g - The green component.
 * @param {number} b - The blue component.
 * @param {string} colorMode - The color mode (e.g., 'color-4', 'color-8', etc.).
 * @returns {string} - The resulting hex color value.
 */
function getColorValue(r, g, b, colorMode) {
    switch (colorMode) {
        case 'grayscale':
            const grayscale = Math.round((r + g + b) / 3);
            return rgbToHex(grayscale, grayscale, grayscale);
        case 'color-4':
            return get4BitColor(r, g, b);
        case 'color-8':
            return get8BitColor(r, g, b);
        case 'color-16':
            return get16BitColor(r, g, b);
        case 'color-24':
            return rgbToHex(r, g, b);
        default:
            const defaultGrayscale = Math.round((r + g + b) / 3);
            return rgbToHex(
                defaultGrayscale,
                defaultGrayscale,
                defaultGrayscale
            );
    }
}

/**
 * Converts RGB values to 4-bit color and returns as hex.
 * @param {number} r - The red component.
 * @param {number} g - The green component.
 * @param {number} b - The blue component.
 * @returns {string} - The 4-bit hex color value.
 */
function get4BitColor(r, g, b) {
    const r4 = (r >> 6) * 85; // Scale to 0-255
    const g4 = (g >> 6) * 85;
    const b4 = (b >> 6) * 85;
    return rgbToHex(r4, g4, b4);
}

/**
 * Converts RGB values to 8-bit color and returns as hex.
 * @param {number} r - The red component.
 * @param {number} g - The green component.
 * @param {number} b - The blue component.
 * @returns {string} - The 8-bit hex color value.
 */
function get8BitColor(r, g, b) {
    const r8 = (r >> 5) * 36; // Scale to 0-255
    const g8 = (g >> 5) * 36;
    const b8 = (b >> 6) * 85;
    return rgbToHex(r8, g8, b8);
}

/**
 * Converts RGB values to 16-bit color and returns as hex.
 * @param {number} r - The red component.
 * @param {number} g - The green component.
 * @param {number} b - The blue component.
 * @returns {string} - The 16-bit hex color value.
 */
function get16BitColor(r, g, b) {
    const r16 = (r >> 3) * 8; // Scale to 0-255
    const g16 = (g >> 2) * 4;
    const b16 = (b >> 3) * 8;
    return rgbToHex(r16, g16, b16);
}

export { getColorValue };
