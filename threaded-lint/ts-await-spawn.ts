import { spawn } from "child_process";

export default (
  command: string,
  args?: string[],
  options?: any
): Promise<string> => {
  const child = spawn(command, args, options);
  let stdout = "";
  let stderr = "";

  if (child.stdout) {
    child.stdout.on("data", data => {
      stdout += data + "\n";
    });
  }

  if (child.stderr) {
    child.stderr.on("data", data => {
      stderr += data + "\n";
    });
  }

  const promise = new Promise<string>((resolve, reject) => {
    child.on("error", reject);

    child.on("exit", code => {
      if (code === 0) {
        resolve(stdout);
      } else {
        const err = new Error(
          `child exited with code ${code ??
            "null"}\noutput: ${stdout}\nerror: ${stderr}`
        );
        /*(err.code = code;
        err.stderr = stderr;*/
        reject(err);
      }
    });
  });

  //promise.child = child;

  return promise;
};
