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

    const searchTerms = parseXml("playlist.xml");

    const browser = await playwright[browserType].launch();
    const context = await browser.newContext();

    const progressBars = new cliProgress.MultiBar({
        format: "||" + colors.cyan("{bar}") + "||" + colors.green(" {filename}"),
        clearOnComplete: false,
        hideCursor: true,
        forceRedraw: true,
    });

    let count = 0;
    await PromisePool.withConcurrency(5)
        .for(searchTerms)
        .process(async (searchTerm, index, pool) => {
            const bar = progressBars.create(4, 0, { filename: `(${count++}) ${searchTerm}` });

            const page = await context.newPage();
            const url = baseUrl + "/#" + encodeURIComponent(searchTerm);
            await page.goto(url);
            bar.update(1);
            await page.waitForLoadState("load");

            const downloadAnchor = await page.waitForSelector(".sm2_link");
            const downloadUrl = await downloadAnchor?.getAttribute("href");
            bar.update(2);

            if (downloadUrl) {
                const fileName = filenamify(searchTerm + ".mp3");
                await downloadFile(baseUrl + downloadUrl, "./music/" + fileName);
                bar.update(4);
            }
            await page.close();
            bar.update(4);

            setTimeout(() => {
                bar.stop();
                progressBars.remove(bar);
            }, 1000);
        });

    progressBars.stop();
    await browser.close();
}

main();
