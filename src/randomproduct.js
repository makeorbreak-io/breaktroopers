const Axios = require('axios')

const URL = 'https://opwyliyqnu-dsn.algolia.net/1/indexes/*/queries?x-algolia-agent=Algolia for vanilla JavaScript (lite) 3.21.1;instantsearch.js 1.11.2;Magento integration (1.11.1);JS Helper 2.18.1&x-algolia-application-id=OPWYLIYQNU&x-algolia-api-key=YzQ2NDk1OGQ5NzMyYzc3ODZjNWFiNTRiODRlYmRkODQ2N2QwOTU3N2I4NDg0MTVhMzFhZjhkNjZjMjQ3ZGI4MWZpbHRlcnM9Jm51bWVyaWNGaWx0ZXJzPXZpc2liaWxpdHlfc2VhcmNoJTNEMQ=='

const axios = Axios.create({
  baseURL: URL,
  headers: {
    'Referer': 'https://www.pcdiga.com'
  }
})

function buildRequestBody (query) {
  return {
    requests: [
      {
        indexName: 'prod_pcdiga_pt_products',
        params: `query=${query}&hitsPerPage=1`
      }
    ]
  }
}

function formatProduct (product) {
  return {
    name: product.name,
    price: parseFloat(product.price.EUR.default),
    imageUrl: product.image_url
  }
}

function isProductValid (product) {
  return product && product.hasOwnProperty('price') && product.hasOwnProperty('name') && product.hasOwnProperty('image_url')
}

async function getRandomProduct () {
  if (process.env.NODE_ENV === 'test') {
    return {
      name: 'Fake Name',
      price: 100,
      imageUrl: 'http://via.placeholder.com/300'
    }
  }

  try {
    const randQuery = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 2)
    const response = await axios.post('', buildRequestBody(randQuery))

    let product = response.data.results[0].hits[0]

    if (!isProductValid(product)) {
      return getRandomProduct()
    }

    return formatProduct(response.data.results[0].hits[0])
  } catch (e) {
    console.error(e)
  }
}

module.exports = getRandomProduct
