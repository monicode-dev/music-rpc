import { getCurrentSong, Song } from "./player/song.ts";
import { correctArt } from "./player/art.ts";
import { IPCClient } from "./rpc/ipc.ts";

const CLIENT_ID = "1427168009285275679";

const client = new IPCClient();

let lastGoodArt = ""

let lastSong: Song = {
    title: "",
    artists: [],
    album: "",
    artUrl: lastGoodArt,
    position: 0,
    length: 0
}

async function updateStatus() {
    console.log("Updating song data...");
    const currentSong = await getCurrentSong();

    if (!currentSong) {
        console.log("No song detectable");
        return
    }

    lastSong = currentSong;


    if (lastGoodArt.length == 0 || (currentSong.title != lastSong.title && currentSong.artUrl.startsWith("file://"))) {
        console.log(`New song: ${currentSong.title} - ${currentSong.artists.join(", ")}`);

        currentSong.artUrl = lastGoodArt = await correctArt(currentSong.title, currentSong.artists[0])
    }

    const songStart = Date.now() - currentSong.position;
    const songEnd = songStart + currentSong.length;
    
    const status = {
        type: 2,
        name: "Music",
        details: currentSong.title,
        state: currentSong.artists.join(", "),
        status_display_type: 1,
        timestamps: { start: songStart, end: songEnd },
        assets: {
            large_image: lastGoodArt,
        },
    }
    
    console.log("Updating activity status...");
    
    client.setStatus(status);
}


client.init(CLIENT_ID).then(async () => {
    console.log("Discord RPC ready!");
    await updateStatus();

    setInterval(() => {
        updateStatus()
    }, 5_000);
});
