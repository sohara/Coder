import type { NextApiRequest, NextApiResponse } from "next";
import Docker from "dockerode";
import { randomBytes } from "crypto";

const docker = new Docker();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const body = req.body;

  if (isExpectedBody(body)) {
    const { code } = body;
    try {
      const result = await runCodeInDocker(code);
      res.status(200).json({ result });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.status(400).json({ error: "Unexpected request data" });
  }
}

type ExecuteBody = {
  code: string;
};

function isExpectedBody(body: any): body is ExecuteBody {
  return typeof body === "object" && typeof body.code === "string";
}

async function runCodeInDocker(code: string): Promise<string> {
  const TIMEOUT_MS = 5000; // Set the time limit to 5 seconds
  const tempDir = `/tmp/${randomBytes(8).toString("hex")}`;
  const fileName = `${tempDir}/script.js`;

  const container = await docker.createContainer({
    Image: "node:20", // Use the Node.js 20 image
    Cmd: [
      "sh",
      "-c",
      `mkdir -p ${tempDir} && echo "${code
        .replace(/"/g, '\\"')
        .replace(/\n/g, "\\n")}" > ${fileName} && node ${fileName}`,
    ],
    AttachStdout: true,
    AttachStderr: true,
    Tty: false,
  });

  let timeoutId: NodeJS.Timeout;

  const timeoutPromise = new Promise<void>((_, reject) => {
    timeoutId = setTimeout(async () => {
      try {
        await container.stop({ t: 0 }); // Force stop immediately
      } catch (error) {
        // Ignore stop errors as the container might have already stopped
      }
      reject(new Error("Execution timed out"));
    }, TIMEOUT_MS);
  });

  const executionPromise = new Promise<string>((resolve, reject) => {
    container.start(async (err) => {
      if (err) {
        clearTimeout(timeoutId);
        return reject(err);
      }

      container.wait(async (err, data) => {
        if (err) {
          clearTimeout(timeoutId);
          return reject(err);
        }

        container.logs(
          {
            follow: true,
            stdout: true,
            stderr: true,
          },
          async (err, stream) => {
            if (err) {
              clearTimeout(timeoutId);
              return reject(err);
            }

            let output = "";
            stream?.on("data", (chunk) => {
              output += chunk.toString();
            });

            stream?.on("end", async () => {
              clearTimeout(timeoutId);
              resolve(output);
              // Remove the container after resolving
              await container.remove();
            });

            stream?.on("error", async (err) => {
              clearTimeout(timeoutId);
              reject(err);
              // Remove the container after rejecting
              await container.remove();
            });
          },
        );
      });
    });
  });

  return Promise.race([timeoutPromise, executionPromise]).finally(async () => {
    // Ensure container removal in case of timeout
    await container.remove().catch(() => {
      // Ignore removal errors
    });
  });
}
