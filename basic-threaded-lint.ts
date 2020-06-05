import { promises as fs } from "fs";
import * as async from "async";

const threshold = 1000000;

async function divvyUp(parent): Promise<[string[], number]> {
  const biteSizedChunks = [];
  const children = await fs.readdir(parent, { withFileTypes: true });
  let totalSize = 0;
  async.forEach(children, async child => {
    const childPath = `${parent}/${child.name}`;
    const stat = await fs.stat(childPath);
    if (child.isFile()) {
      totalSize += stat.size;
      biteSizedChunks.push(childPath);
    } else {
      const [chunks, size] = await divvyUp(childPath);
      if (size < threshold) {
        console.log("thresh");
        biteSizedChunks.push(childPath);
      } else {
        console.log("rec");
        biteSizedChunks.push(...chunks);
      }
    }
  });
  return [biteSizedChunks, totalSize];
}

(async function main() {
  const eslint = new (require("eslint").ESLint)();
  console.log(divvyUp("modules"));
})().catch(error => {
  process.exitCode = 1;
  console.error(error);
});
