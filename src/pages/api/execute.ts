// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import Docker from "dockerode";

const docker = Docker();

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
  const container = await docker.createContainer({
    Image: "node:20", // Use the Node.js 18 image
    Cmd: ["node", "-e", code],
    AttachStdout: true,
    AttachStderr: true,
    Tty: false,
  });

  return new Promise((resolve, reject) => {
    container.start((err, data) => {
      if (err) {
        return reject(err);
      }

      container.wait((err, data) => {
        if (err) {
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
              return reject(err);
            }

            let output = "";
            stream.on("data", (chunk) => {
              output += chunk.toString();
            });

            stream.on("end", async () => {
              await container.remove();
              resolve(output);
            });

            stream.on("error", async (err) => {
              await container.remove();
              reject(err);
            });
          },
        );
      });
    });
  });
}
