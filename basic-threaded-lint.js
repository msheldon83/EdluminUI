const fs = require("fs/promises");

const threshold = 1000000;

async function divvyUp(parent) {
  const biteSizedChunks = [];
  const children = await fs.readdir(parent, { withFileTypes: true });
  let totalSize = 0;
  children.forEach(async child => {
    childPath = `${parent}/${child.name}`;
    if (child.isFile()) {
      biteSizedChunks.push(childPath);
    } else {
      const stat = await fs.stat(childPath);
      if (stat.size < threshold) {
        console.log("thresh");
        biteSizedChunks.push(childPath);
      } else {
        console.log("rec");
        biteSizedChunks.push(...(await divvyUp(childPath)));
      }
    }
  });
  return biteSizedChunks;
}

(async function main() {
  const eslint = new (require("eslint").ESLint)();
  console.log(divvyUp("modules"));
})().catch(error => {
  process.exitCode = 1;
  console.error(error);
});
