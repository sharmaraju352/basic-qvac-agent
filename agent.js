const { QvacAgMsg, ENTITIES } = require('qvac-lib-agent-base')
const { QvacSoloAgent, SOLO_PERSONAS } = require('qvac-lib-agent-solo-base')

class CryptoPriceAgent extends QvacSoloAgent {
  name = 'CryptoPriceAgent'

  async main ({ msg }, history, llms) {
    const humanMsg = new QvacAgMsg({
      source: ENTITIES.USER,
      content: msg
    })

    history.addMsg(humanMsg)

    const maxToolLoop = 5
    let toolLoop = 0

    let llmResp = null

    while (toolLoop <= maxToolLoop) {
      llmResp = await llms.llama.assistant.infer()

      const llmMsg = new QvacAgMsg({
        source: ENTITIES.LLM,
        content: llmResp,
        persona: SOLO_PERSONAS.ASSISTANT
      })

      history.addMsg(llmMsg)

      if (llmMsg.target === ENTITIES.USER) {
        return llmMsg
      }

      const toolResp = await this.invokeTool(llmMsg)

      const toolMsg = new QvacAgMsg({
        source: ENTITIES.TOOL,
        artifacts: toolResp
      })

      history.addMsg(toolMsg)

      toolLoop++
    }

    return llmResp
  }
}
module.exports = { Agent: CryptoPriceAgent }
