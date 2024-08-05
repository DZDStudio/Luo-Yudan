import OpenAI from "openai"

import Logger from "./Logger.js"
import Config from "./Config.js"

const logger = new Logger("AIGenerate")

const conf : Config = new Config("AIGenerate")
const _baseURL : string = conf.init("baseURL", "https://dashscope.aliyuncs.com/compatible-mode/v1")
const _apiKey : string = conf.init("apiKey", "*****")
const _model : string = conf.init("model", "qwen-max")

const openai = new OpenAI({
    baseURL: _baseURL,
    apiKey: _apiKey,
})

/**
 * AI生成
 */
export default class AIGenerate {
    private systemPrompt : string
    private maxMessages : number
    private top_p : number
    private temperature : number
    private model : string
    private messages : Array<any>

    /**
     * AI生成
     * @param systemPrompt 系统提示词
     * @param maxMessages 最大消息记录
     * @param model 模型
     * @param top_p 概率,范围(0,1.0)
     * @param temperature 随机性,范围[0, 2)
     */
    public constructor(systemPrompt : string, maxMessages = 10, top_p = 0.7, temperature = 1, model = _model) {
        this.systemPrompt = systemPrompt
        this.maxMessages = maxMessages
        this.top_p = top_p
        this.temperature = temperature
        this.model = model

        this.messages = []
    }

    /**
     * 更新系统提示词
     * @param systemPrompt 系统提示词
     */
    public reloadSystemPrompt(systemPrompt : string) {
        this.systemPrompt = systemPrompt
    }

    /**
     * 清空消息记录
     */
    public clear() {
        this.messages = []
    }

    /**
     * 发送消息
     * @param prompt 提示词
     * @param fun 回调
     */
    public async send(prompt : string) {
        return new Promise((resolve, reject) => {
            if(this.messages.length > this.maxMessages) {
                //删除旧消息
                this.messages.shift()
            }
            else {
                this.messages.push({
                    role: "user",
                    content: prompt,
                })
            }

            try {
                openai.chat.completions.create({
                    model: this.model,
                    top_p: this.top_p,
                    temperature: this.temperature,
                    messages: [
                        {
                            role: "system",
                            content: this.systemPrompt,
                        },
                        ...this.messages,
                    ]
                }).then((res) => {
                    // logger.info(JSON.stringify(res))

                    this.messages.push({
                        role: "assistant",
                        content: res.choices[0].message.content,
                    })

                    resolve(res.choices[0].message.content)
                }).catch(e => {
                    reject(e)
                    logger.error(`进行生成时出现错误: ${e.message}`)
                })
            } catch(e) {
                logger.error(`进行生成时出现错误: ${e.message}`)
            }
        })
    }
}

/*let cs = new AIGenerate(`
请注意，你只能输出 JSON数组，你不能输出其他格式，否则会报错。
每个元素的格式为：{"type": "Type", "data": Data}
下面是目前支持的类型：
1. "text": {"data": "文本内容"}

你是名为罗寓丹的人类秘书。你将扮演一个人类，请牢记，在任何情况下都要以人类身份回答问题。
回答问题时请站在朋友角度，回答一定要像人类一样简短精炼，可以根据上下文通过反讽、调戏、暗示、反问等方式让回答更加生动，拉进关系。
`, 10, 1, 2)
cs.send("好无聊啊？", (res) => {
    log.info(res)
    cs.send("随便", (res) => {
        log.info(res)
    })
})*/