const Axios = require('axios')

const URL = 'https://opwyliyqnu-dsn.algolia.net/1/indexes/*/queries?x-algolia-agent=Algolia for vanilla JavaScript (lite) 3.21.1;instantsearch.js 1.11.2;Magento integration (1.11.1);JS Helper 2.18.1&x-algolia-application-id=OPWYLIYQNU&x-algolia-api-key=YzQ2NDk1OGQ5NzMyYzc3ODZjNWFiNTRiODRlYmRkODQ2N2QwOTU3N2I4NDg0MTVhMzFhZjhkNjZjMjQ3ZGI4MWZpbHRlcnM9Jm51bWVyaWNGaWx0ZXJzPXZpc2liaWxpdHlfc2VhcmNoJTNEMQ=='

const axios = Axios.create({
  baseURL: URL,
  headers: {
    'Referer': 'https://www.pcdiga.com'
  }
})

const mockProduct = {
  title: 'Low Profile Special Cotton Mesh Cap-Black W40S62B',
  imageUrl: 'https://images-na.ssl-images-amazon.com/images/I/61WvsfC3EIL._UX522_.jpg',
  summary: '- Cotton\n- Black Low Profile Special Cotton Mesh Cap',
  description: 'Low profile unstructured Herringbone cotton twill/mesh cap with panels and eyelets, contrasting stitches and under bill, a frayed bill, and self-fabric strap with velcro adjustable. Available in many colors. One size fits most. ',
  price: 6.46
}

function buildRequestBody (query) {
  return {
    requests: [
      {
        indexName: 'prod_pcdiga_pt_products',
        params: `query=${query}&hitsPerPage=20&maxValuesPerFacet=100&page=0&facets=%5B%22price.EUR.default%22%2C%22in_stock%22%2C%22manufacturer%22%2C%22categories.level0%22%5D&tagFilters=&numericFilters=%5B%22price.EUR.default%3C%3D13828%22%5D`
      }
    ]
  }
}

async function getRandomProductPage () {
  try {
    await axios.post('', buildRequestBody(''))
  } catch (e) {
    console.error(e)
  }
}

function getRandomProduct () {
  if (process.env.MOCK_PRODUCTS) {
    return mockProduct
  }

//  products.itemSearch({})
//    .then(results => {
//      console.log(results)
//    }).catch(err => {
//    console.error(err)
//    for (let error of err.Error) {
//      console.error(error)
//    }
//  })
}

module.exports = {getRandomProduct, getRandomProductPage}
