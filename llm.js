const Hyperswarm = require('hyperswarm')
const Corestore = require('corestore')
const Hyperbee = require('hyperbee')
const HyperDriveDL = require('qvac-lib-dl-hyperdrive')
const { MLCLlamaQ4F16 } = require('@tetherto/qvac-lib-inference-addon-mlc-llama-3_2_1b-q4f16_1')
const process = require('bare-process')
const { QvacSoloAgLlmLlama } = require('qvac-lib-agent-solo-base')

const HYPERBEE_KEY = '6d15c77f4bbfbe61f761307faa07a2657a5e5060e1d2336bf16fb8074e662fb3'
const MODEL_KEY = 'llama-3_2_1b-q4f16_1'
const config = require('./1b-config.json')

async function llama () {
  const store = new Corestore('./store')
  const dbStore = store.namespace('db')
  const swarm = new Hyperswarm()
  swarm.on('connection', conn => {
    dbStore.replicate(conn)
  })
  const core = dbStore.get({ key: Buffer.from(HYPERBEE_KEY, 'hex') })
  const db = new Hyperbee(core, {
    keyEncoding: 'utf-8',
    valueEncoding: 'binary'
  })

  await core.ready()
  const foundPeers = dbStore.findingPeers()
  swarm.join(core.discoveryKey)
  swarm.flush().then(() => foundPeers())

  const driveKey = await db.get(MODEL_KEY)

  const hdStore = store.namespace('hd')
  const hdDL = new HyperDriveDL({
    key: `hd://${driveKey.value.toString('hex')}`,
    store: hdStore
  })

  const args = {
    loader: hdDL,
    opts: {}
  }

  const qvacAgLlmLlama = new QvacSoloAgLlmLlama({
    model: new MLCLlamaQ4F16(args, config)
  })

  return qvacAgLlmLlama

  // const model = qvacAgLlmLlama.model
  // await model.load()

  // try {
  //     const query =
  //         'Hello, can you suggest a game I can play with my 1 year old daughter?'

  //     const messages = [
  //         {
  //             role: 'system',
  //             content: 'You are a helpful, respectful and honest assistant.'
  //         },
  //         { role: 'user', content: query }
  //     ]

  //     const response = await model.run(messages)
  //     const buffer = []

  //     await response
  //         .onUpdate(data => {
  //             process.stdout.write(data)
  //             buffer.push(data)
  //         })
  //         .await()

  //     console.log('\n')
  //     console.log('Full response:\n', buffer.join(''))
  // } finally {
  //     await model.unload()
  // }
}

// main().catch(console.error)

module.exports = { llm: llama }
