import { StatusFrame } from "./frame.ts";
import { ClearStatusPayload, type Status, StatusPayload } from "./payload.ts";

export class IPCClient {
    private conn?: Deno.Conn;
    private socketPath: string;

    constructor() {
        const isWin = Deno.build.os === "windows";

        if (isWin) {
            this.socketPath = "\\\\?\\pipe\\discord-ipc-";
        } else {
            const runtimeDir = Deno.env.get("XDG_RUNTIME_DIR") ||
                `${Deno.env.get("HOME")}/.config/discord`;
            this.socketPath = `${runtimeDir}/discord-ipc-`;
        }
    }

    public async init(clientId: string) {
        for (let i = 0; i < 10; i++) {
            try {
                this.conn = await Deno.connect({
                    transport: "unix",
                    path: this.socketPath + i,
                });
                break;
            } catch (_) {
                console.log(`Socket not at ${this.socketPath + i}`);
            }
        }

        if (this.conn) {
            const json = new TextEncoder().encode(
                JSON.stringify({ v: 1, client_id: clientId }),
            );
            const buf = new Uint8Array(8 + json.length);
            const view = new DataView(buf.buffer);

            view.setUint32(0, 0, true);
            view.setUint32(4, json.length, true);
            buf.set(json, 8);

            this.conn.write(buf);

            // deno-lint-ignore no-explicit-any
            const res = await StatusFrame.decode(this.conn) as any;
            if (res.opcode == 2 || res.payload.evt != "READY") {
                throw new Error("Could not connect to the discord-ipc socket");
            }
        } else {
            throw new Error("Could not connect to the discord-ipc socket");
        }
    }

    public setStatus(status: Status) {
        this.send(new StatusFrame(new StatusPayload(status)));
    }

    public clearStatus() {
        this.send(new StatusFrame(new ClearStatusPayload()));
    }

    private async send(frame: StatusFrame) {
        if (this.conn) {
            await this.conn.write(frame.encode());
        }
    }

    public async close() {
        if (this.conn) {
            await this.conn.write(new Uint8Array([2, 0, 0, 0, 2, 0, 0, 0, 123, 125]))
        }
    }
}
