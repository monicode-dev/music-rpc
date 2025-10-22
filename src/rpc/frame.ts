import type { ClearStatusPayload, StatusPayload } from "./payload.ts";

export class StatusFrame {
    opcode: number = 1; // FRAME
    payload: StatusPayload | ClearStatusPayload;

    constructor(payload: StatusPayload | ClearStatusPayload) {
        this.payload = payload;
    }

    public encode(): Uint8Array {
        const json = new TextEncoder().encode(JSON.stringify(this.payload));
        const buf = new Uint8Array(8 + json.length); 
        const view = new DataView(buf.buffer);

        view.setUint32(0, this.opcode, true);
        view.setUint32(4, json.length, true); 
        buf.set(json, 8);
        return buf;
    }

    public static async decode(conn: Deno.Conn): Promise<unknown> {
        const header = new Uint8Array(8);
        await conn.read(header);
        const view = new DataView(header.buffer);
        const opcode = view.getUint32(0, true);
        const length = view.getUint32(4, true);

        // Then the JSON body
        const body = new Uint8Array(length);
        await conn.read(body);
        const payload = JSON.parse(new TextDecoder().decode(body));
        return { opcode, payload };
    }
}
