import { XMLParser } from "fast-xml-parser";
import { readFileSync } from "fs";

interface Song {
    key: string[];
    integer: number[];
    string: string[];
    date: string[];
}

export const parseXml = (path: string) => {
    const XMLdata = readFileSync(path, "utf8");

    const parser = new XMLParser();
    const jObj = parser.parse(XMLdata);

    const songs: Song[] = jObj["plist"]["dict"]["dict"]["dict"];

    const searchTerms: string[] = [];

    for (const song of songs) {
        const title = song["string"][0];
        const artist = song["string"][1];

        searchTerms.push(`${title} ${artist}`);
    }

    return searchTerms;
};
