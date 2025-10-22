import { mbApi } from "./song.ts";

export async function correctArt(songTitle: string, songArtist: string): Promise<string> {
    try {
        console.log("Fetching album art...");

        const query = `recording:${songTitle} AND artist:${songArtist}`;
        const recording = (await mbApi.search("recording", { query: query, limit: 5 })).recordings[0];

        if (recording.releases) {
            const art = (await fetch(`https://coverartarchive.org/release/${recording.releases[0].id}/front`));

            if (art.status >= 400) {
                console.log(`An error occured in fetching the album cover.`);
                return "";
            }

            console.log(`Got: ${art.url}`);
            return art.url;
        } else {
            console.log(`An error occured in fetching the album cover.`);
            return "";
        }
    } catch {
        return "";
    }
}
