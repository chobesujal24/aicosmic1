const Jimp = require("jimp");

async function main() {
  const image = await Jimp.read("public/logo.png");
  image.scan(0, 0, image.bitmap.width, image.bitmap.height, function (x, y, idx) {
    const red = this.bitmap.data[idx + 0];
    const green = this.bitmap.data[idx + 1];
    const blue = this.bitmap.data[idx + 2];
    
    const maxVal = Math.max(red, green, blue);
    // Set alpha to pixel brightness (black becomes transparent, white remains opaque)
    this.bitmap.data[idx + 3] = maxVal; 
    
    // Make the actual color pure white for a clean logo
    this.bitmap.data[idx + 0] = 255;
    this.bitmap.data[idx + 1] = 255;
    this.bitmap.data[idx + 2] = 255;
  });
  
  await image.writeAsync("public/logo-transparent.png");
  console.log("Created transparent logo!");
}

main().catch(console.error);
