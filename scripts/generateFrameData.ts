const fs = require("fs");

const SPRITE_WIDTH = 96;
const SPRITE_HEIGHT = 128;
const COLUMNS = 3;
const ROWS = 4;

const frames = [];
let frameIndex = 0;

for (let row = 0; row < ROWS; row++) {
  for (let col = 0; col < COLUMNS; col++) {
    frames.push({
      filename: `frame_${frameIndex}`,
      x: col * SPRITE_WIDTH,
      y: row * SPRITE_HEIGHT,
      w: SPRITE_WIDTH,
      h: SPRITE_HEIGHT,
    });
    frameIndex++;
  }
}

fs.writeFileSync("./assets/frames.json", JSON.stringify({ frames }));
