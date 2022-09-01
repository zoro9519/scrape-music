import playwright from "playwright";
import { downloadFile } from "./download.js";
import { parseXml } from "./xml.js";
import colors from "ansi-colors";
import cliProgress from "cli-progress";
import { PromisePool } from "@supercharge/promise-pool";
import filenamify from "filenamify";
import { existsSync, mkdirSync } from "fs";

const browserType = "chromium";
const baseUrl = "https://slider.kz";

async function main() {
    const dir = "./music";
    if (!existsSync(dir)) {
        mkdirSync(dir);
    }

    const searchTerms = await parseXml("playlist.xml");

    const browser = await playwright[browserType].launch();
    const context = await browser.newContext();

    const progressBars = new cliProgress.MultiBar({
        format: "||" + colors.cyan("{bar}") + "||" + colors.green(" {filename}"),
        clearOnComplete: false,
        hideCursor: true,
        forceRedraw: true,
    });

    await PromisePool.withConcurrency(5)
        .for(searchTerms.slice(0, 1))
        .process(async ({ filename, searchTerm, attributes }, index) => {
            const bar = progressBars.create(4, 0, { filename: `(${index}) ${filename}` });

            const page = await context.newPage();
            const url = baseUrl + "/#" + encodeURIComponent(searchTerm);
            await page.goto(url);
            const pageLoaded = page.waitForLoadState("load");

            bar.update(1);
            await pageLoaded;

            const downloadAnchor = await page.waitForSelector(".sm2_link");
            const downloadUrl = await downloadAnchor?.getAttribute("href");
            bar.update(2);

            if (downloadUrl) {
                await downloadFile(baseUrl + downloadUrl, "./music/" + filenamify(filename), attributes);
            } else {
                console.log(colors.red(`Error downloading ${filename}`));
            }
            bar.update(3);

            await page.close();

            bar.update(4);

            setTimeout(() => {
                bar.stop();
                progressBars.remove(bar);
            }, 1000);
        });

    progressBars.stop();
    await browser.close();

    console.log(colors.cyan("Download Finished - Thanks for using this tool!"));
    process.exit(0);
}

main();
