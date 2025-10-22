import dayjs from "dayjs";
// import { existsSync } from '@std/fs'

// deno-lint-ignore no-explicit-any
export function logger(message: any) {
    const date = dayjs()
    const dateLogFormat = date.format("MM/DD/YYYY @ HH:mm");
    // const dateFileNameFormat = date.format("MM-DD-YYYY-HH_mm");

    // if (!Deno.env.has("LOG_FILE_NAME")) Deno.env.set("LOG_FILE_NAME", dateFileNameFormat)

    const logLine = `[${dateLogFormat}] ${message}`
    
    // if (!existsSync("./logs", { isDirectory: true })) Deno.mkdirSync("./logs")

    // Deno.writeTextFileSync(`./logs/${Deno.env.get("LOG_FILE_NAME")}.log`, logLine + "\n", { append: true })
    console.log(logLine);
}
