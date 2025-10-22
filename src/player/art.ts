import { logger } from "../logger.ts";
import { mbApi } from "./song.ts";

export async function correctArt(songTitle: string, songArtist: string): Promise<string> {
    try {
        logger("Fetching album art...");

        const query = `recording:${songTitle} AND artist:${songArtist}`;
        const recording = (await mbApi.search("recording", { query: query, limit: 5 })).recordings[0];

        if (recording.releases) {
            const art = (await fetch(`https://coverartarchive.org/release/${recording.releases[0].id}/front`));

            if (art.status >= 400) {
                logger(`An error occured in fetching the album cover.`);
                return "";
            }

            logger(`Got: ${art.url}`);
            return art.url;
        } else {
            logger(`An error occured in fetching the album cover.`);
            return "";
        }
    } catch {
        return "";
    }
}
