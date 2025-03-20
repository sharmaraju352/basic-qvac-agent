const { QvacToolBase } = require('qvac-lib-tool-base')

const schema = [
  {
    type: 'function',
    function: {
      name: 'getPrice',
      description: 'Returns the price for a given digital asset such as bitcoin, ethereum, etc.',
      parameters: {
        type: 'object',
        properties: [
          {
            name: 'asset',
            description: 'The digital asset to retrieve the price for (e.g. "bitcoin", "ethereum")',
            type: 'string'
          }
        ],
        required: ['asset']
      }
    }
  }
]

async function getPrice (asset) {
  asset = asset.toLowerCase()
  const prices = {
    bitcoin: 60000,
    ethereum: 3000,
    litecoin: 150
  }

  if (Object.prototype.hasOwnProperty.call(prices, asset)) {
    return prices[asset]
  } else {
    return `Price for asset "${asset}" is not available.`
  }
}

class PriceTool extends QvacToolBase {
  name = 'PriceTool'
  description = 'A tool to get prices for digital assets like Bitcoin and Ethereum'

  constructor () {
    super({ getPrice }, schema)
  }
}

module.exports = { Tool: PriceTool }
