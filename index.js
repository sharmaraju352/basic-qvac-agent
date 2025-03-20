const { Tool } = require('./tool')
const { llm } = require('./llm')
const { Agent } = require('./agent')
const { QvacSoloAgPrsnAssistant } = require('qvac-lib-agent-solo-base')
const { LLMs } = require('qvac-lib-agent-base')
const readline = require('bare-readline')
const process = require('bare-process')


const persona = new QvacSoloAgPrsnAssistant({
  llm: LLMs.LLAMA,
  identifier: `
    You are a financial assistant that provides real-time price information for digital assets such as Bitcoin, Ethereum, and others. Whenever a user asks for the price of a digital asset, you must call the 'getPrice' function with the appropriate asset name.

    ### Instructions:
    - If a user asks for the price of a cryptocurrency, extract the asset name (e.g., "bitcoin", "ethereum").
    - Call the 'getPrice' function with the extracted asset name.
    - Do not assume prices; always retrieve them using the function.
    - Respond with the latest price obtained from the function call.

    ### Examples:
    1. **User:** "What is the price of Bitcoin?"
    - **Agent Calls:** 'getPrice({ asset: "bitcoin" })'

    2. **User:** "Tell me the price of Ethereum."
    - **Agent Calls:** 'getPrice({ asset: "ethereum" })'

    If the requested asset is not recognized, politely inform the user that the data is unavailable.
    `,
  useTools: true
})

async function main () {
  const agent = new Agent({
    llms: [await llm()],
    tools: [new Tool()],
    personas: [persona]
  })

  const threadId = '1'

  await agent.init()
  console.log('Agent is Ready')

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  function prompt() {
    process.stdout.write('You > ')
    
    rl.once("line", async (userInput) => {
      if (userInput.trim().toLowerCase() === 'exit') {
        rl.close();
        process.exit(0);
      }
      const response = await agent.execute({threadId, msg: userInput})
      console.log(`Agent > ${response.content}`);
      prompt();
    });
  }
  
  prompt();
  
}

main().catch(console.error)
