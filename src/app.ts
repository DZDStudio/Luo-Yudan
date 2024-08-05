import Logger from "./Logger.js"
import Event from "./Event.js"
import { LLOneBot } from "./LLOneBot.js"
async function main() {
    console.log(`DZDMCWeb 后端开始加载...`)

    const logger : Logger = new Logger("Main")

    logger.info(`正在加载事件管理器...`)
    const en : Event = new Event()
    en.create("system.start")

    logger.info(`正在加载 LLOneBot...`)
    new LLOneBot()

    logger.info(`正在加载 AIChat...`)
    import("./AIChat.js")

    en.trigger("system.start")

    logger.info(`DZDMCWeb 后端加载完成！`)
}

await main().catch(err => {
    console.error(err)
})