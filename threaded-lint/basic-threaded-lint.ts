import { Dirent, promises as fs } from "fs";
import * as async from "async";
import * as os from "os";
import { ESLint } from "eslint";
import spawn from "./ts-await-spawn";

const threshold = 1000000;

async function sliceFiles(
  parent: string
): Promise<[{ path: string; size: number }[], number, boolean]> {
  const biteSizedChunks = [];
  const children = await fs.readdir(parent, { withFileTypes: true });

  const childResults = await Promise.all(
    children.map(
      async (
        child: Dirent
      ): Promise<[{ path: string; size: number }[], number, boolean]> => {
        const childPath = `${parent}/${child.name}`;
        const stat = await fs.stat(childPath);
        if (child.isFile()) {
          if (child.name.endsWith(".gen.ts")) return [[], 0, false];
          return [".ts", ".tsx"].some(suff => child.name.endsWith(suff))
            ? [[{ path: childPath, size: stat.size }], stat.size, true]
            : [[], 0, false];
        } else {
          const [chunks, size, containsTs] = await sliceFiles(childPath);
          return containsTs
            ? [
                size < threshold ? [{ path: childPath, size }] : chunks,
                size,
                true,
              ]
            : [[], 0, false];
        }
      }
    )
  );

  return childResults.reduce(
    ([accChunks, accSize, accContains], [chunks, size, containsTs]) => [
      accChunks.concat(chunks),
      accSize + size,
      accContains || containsTs,
    ],
    [[], 0, false]
  );
}

function distributeWork(
  chunks: { path: string; size: number }[],
  workers: number
): [string[], number][] {
  const piles: [string[], number][] = Array(workers)
    .fill(0)
    .map(n => [[], 0]);
  chunks.sort(({ size: size1 }, { size: size2 }) => size1 - size2);
  while (chunks.length > 0) {
    const { path, size } = chunks.pop()!;
    piles[0][0].push(path);
    piles[0][1] += size;
    piles.sort(([f1, n1], [f2, n2]) => n1 - n2);
  }
  return piles;
}

export async function divvyUp(
  root: string,
  workers: number
): Promise<string[][]> {
  const [chunks, ,] = await sliceFiles(root);
  const piles = distributeWork(chunks, workers);
  return piles.map(([files, size]) => files);
}

export async function runLint<T>(
  piles: string[][],
  warnIgnored?: boolean
): Promise<void> {
  const tmp = await fs.mkdtemp(`${os.tmpdir()}/`);
  const lintData = await Promise.all(
    piles.map(
      async (files, i): Promise<ESLint.LintResult[]> => {
        const tmpFile = `${tmp}/${i}.json`;
        const warn = warnIgnored ? ["--warnIgnored"] : [];
        const buffer = await spawn(
          "node",
          [`${__dirname}/json-eslint.js`, tmpFile].concat(warn).concat(files)
        );
        return require(tmpFile) as ESLint.LintResult[];
      }
    )
  );
  const eslint = new ESLint();
  const formatter = await eslint.loadFormatter("stylish");
  console.log(
    formatter.format(lintData.reduce((acc, item) => acc.concat(item), []))
  );
}
