import axios from "axios";
import { createWriteStream } from "fs";
import ffmetadata from "ffmetadata";
import colors from "ansi-colors";
import { config } from "./config.js";

export async function downloadFile(
    fileUrl: string,
    outputLocationPath: string,
    attributes: Record<string, string>,
    createError: (message: string) => void
) {
    const writer = createWriteStream(outputLocationPath);

    return axios({
        method: "get",
        url: fileUrl,
        responseType: "stream",
    }).then((response) => {
        return new Promise((resolve, reject) => {
            response.data.pipe(writer);
            let error: Error | null = null;
            writer.on("error", (err) => {
                error = err;
                writer.close();
                createError(colors.yellow(err.message));
            });
            writer.on("close", async () => {
                if (!error) {
                    if (config.USE_FFMPEG) {
                        await new Promise<void>((resolve, reject) => {
                            ffmetadata.write(outputLocationPath, attributes, (err) => {
                                if (err) {
                                    createError(
                                        colors.red(
                                            `Error writing metadata to ${outputLocationPath}, this indicates a likely problem with the file. I would suggest manually downloading this file.`
                                        )
                                    );
                                }
                                resolve();
                            });
                        });
                    }

                    resolve(true);
                }
            });
        });
    });
}
