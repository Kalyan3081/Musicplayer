/**
 * Extracts the dominant color from an image URL
 * @param {string} imageUrl - URL of the image
 * @returns {Promise<string>} - Promise that resolves to a hex color
 */
export const extractDominantColor = (imageUrl) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "Anonymous"; // Handle CORS issues
    
    img.onload = () => {
      // Create a canvas element
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      
      // Set canvas size to a small sampling area (top left portion of image)
      canvas.width = Math.min(img.width, 50);
      canvas.height = Math.min(img.height, 50);
      
      // Draw the image on the canvas
      context.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      // Get pixel data - focusing on the top left corner for color
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height).data;
      
      // Calculate average RGB in top 25% of the image
      const sampleSize = Math.floor(canvas.width * canvas.height * 0.25);
      let r = 0, g = 0, b = 0;
      
      // Sample pixels for dominant color (top portion of image)
      for (let i = 0; i < sampleSize * 4; i += 4) {
        r += imageData[i];
        g += imageData[i + 1];
        b += imageData[i + 2];
      }
      
      // Calculate average
      r = Math.floor(r / sampleSize);
      g = Math.floor(g / sampleSize);
      b = Math.floor(b / sampleSize);
      
      // Convert to hex
      const hexColor = rgbToHex(r, g, b);
      
      // Clean up
      canvas.remove();
      
      // Return the color
      resolve(hexColor);
    };
    
    img.onerror = () => {
      // If there's an error, return a default color
      reject("#8e44ad");
    };
    
    img.src = imageUrl;
  });
};

/**
 * Converts RGB values to a hex color string
 * @param {number} r - Red value (0-255)
 * @param {number} g - Green value (0-255)
 * @param {number} b - Blue value (0-255)
 * @returns {string} - Hex color string
 */
const rgbToHex = (r, g, b) => {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
};

/**
 * Calculate if a color is light or dark
 * @param {string} hexColor - Hex color
 * @returns {boolean} - True if light, false if dark
 */
export const isLightColor = (hexColor) => {
  // Convert hex to RGB
  const r = parseInt(hexColor.substring(1, 3), 16);
  const g = parseInt(hexColor.substring(3, 5), 16);
  const b = parseInt(hexColor.substring(5, 7), 16);
  
  // Calculate perceived brightness using the formula
  // (299*R + 587*G + 114*B) / 1000
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  
  // Return true if light (brightness > 128), false if dark
  return brightness > 128;
}; 