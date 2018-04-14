const amazon = require('amazon-product-api')
const axios = require('axios')

const products = amazon.createClient({
  awsId: process.env.AWS_ACCESS_KEY_ID,
  awsSecret: process.env.AWS_SECRET_ACCESS_KEY,
  awsTag: process.env.AWS_TAG
})

const mockProduct = {
  title: 'Low Profile Special Cotton Mesh Cap-Black W40S62B',
  imageUrl: 'https://images-na.ssl-images-amazon.com/images/I/61WvsfC3EIL._UX522_.jpg',
  summary: '- Cotton\n- Black Low Profile Special Cotton Mesh Cap',
  description: 'Low profile unstructured Herringbone cotton twill/mesh cap with panels and eyelets, contrasting stitches and under bill, a frayed bill, and self-fabric strap with velcro adjustable. Available in many colors. One size fits most. ',
  price: 6.46
}

function getRandomProductPage () {
  axios.get('https://data.thimessolutions.com:8081/random')
    .then(result => console.log(result))
    .catch(err => console.error(err))
}

function getRandomProduct () {
  if (process.env.MOCK_PRODUCTS) {
    return mockProduct
  }

  products.itemSearch({})
    .then(results => {
      console.log(results)
    }).catch(err => {
      console.error(err)
      for (let error of err.Error) {
        console.error(error)
      }
    })
}

module.exports = {
  getRandomProduct,
  mockProduct
}
