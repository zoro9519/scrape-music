import fs from "fs";
import itunes from "itunes-data";

interface Song {
    Name: string;
    Artist: string;
    Composer: string;
    Album: string;
    Genre: string;
}

export const parseXml = async (path: string) => {
    const parser = itunes.parser();
    const stream = fs.createReadStream(path);

    const tracks: { searchTerm: string; filename: string; attributes: { [K: string]: any } }[] = [];

    parser.on("track", function (track: Song) {
        tracks.push({
            searchTerm: `${track.Name} ${track.Artist}`,
            filename: `${track.Artist} - ${track.Name}.mp3`,
            attributes: {
                artist: track.Artist,
                title: track.Name,
                album: track.Album,
                genre: track.Genre,
            },
        });
    });

    stream.pipe(parser);

    await new Promise<void>((res) => {
        stream.on("close", () => {
            res();
        });
    });

    return tracks;
};
