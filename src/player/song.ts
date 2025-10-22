import { MusicBrainzApi } from "musicbrainz-api";
import { mprisGetSong } from "./mpris.ts";

export const mbApi = new MusicBrainzApi({
    appName: "music-rpc",
    appVersion: "1.0.0",
    appContactInfo: "monika@monicode.dev",
});

export interface Song {
    title: string;
    artists: string[];
    album: string;
    artUrl: string;
    position: number;
    length: number;
}

export async function getCurrentSong(): Promise<Song | null> {
    if (Deno.build.os != "windows" && Deno.build.os != "darwin") {
        const songData: Song | null = await mprisGetSong();

        return songData
    } else if (Deno.build.os == "windows") {
        throw new Error("Not done");
    } else if (Deno.build.os == "darwin") {
        throw new Error("Not done");
    } else {
        throw new Error("Unsupported OS! Contact <monika@monicode.dev>");
    }
}
