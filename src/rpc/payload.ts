export interface Timestamps {
    start: number
    end: number
}

export enum DisplayType {
    NAME,
    STATE,
    DETAILS
}

export interface Assets {
    large_image?: string
    large_text?: string
    large_url?: string
    small_image?: string
    small_text?: string
    small_url?: string
}

export interface Status {
    type: number
    name: string
    details: string
    state: string
    timestamps: Timestamps
    status_display_type: DisplayType
    assets: Assets
}

export class StatusPayload {
    public cmd: string = "SET_ACTIVITY"
    public args: { pid: number, activity: Status }
    public nonce: `${string}-${string}-${string}-${string}-${string}`

    constructor(status: Status) {
        this.args = {
            pid: Deno.pid,
            activity: status
        }
        
        this.nonce = crypto.randomUUID()
    }
}