import { logger } from "../logger.ts";
import { Song } from "./song.ts";
import DBus from "dbus-next";

async function mprisPlayers(): Promise<string[] | null> {
    const proc = new Deno.Command("busctl", {
        args: ["list", "--user", "--acquired", "--no-legend"],
        stdout: "piped",
        stderr: "piped",
    }).spawn();
    
    const { stdout } = await proc.output();
    if (!stdout) return null

    const lines = new TextDecoder().decode(stdout).split("\n");
    const names = lines
    .map((l) => {
        l.trim();
        return l.split(" ")[0];
    })
        .filter((l) => l.startsWith("org.mpris.MediaPlayer2."));
        return names;
}

export async function mprisGetSong(): Promise<Song | null> {
    const names = await mprisPlayers();

    if (!names) {
        logger("No players detectable");
        return null
    }

    try {
        const bus = await DBus.sessionBus();

        const obj = await bus.getProxyObject(
            names[0],
            "/org/mpris/MediaPlayer2",
        );
        
        const props = obj.getInterface("org.freedesktop.DBus.Properties");
        
        const pos = await props.Get(
            "org.mpris.MediaPlayer2.Player",
            "Position",
        );

        const meta = await props.Get(
            "org.mpris.MediaPlayer2.Player",
            "Metadata",
        );
        
        bus.disconnect()

        return {
            title: meta.value["xesam:title"].value,
            artists: meta.value["xesam:artist"].value,
            album: meta.value["xesam:album"].value,
            artUrl: meta.value["mpris:artUrl"].value,
            position: Number(pos.value) / 1000,
            length: Number(meta.value["mpris:length"].value) / 1000
        };
    } catch (e) {
        logger(`An error occured getting song data: ${e}`);
        
        return null;
    }
}
