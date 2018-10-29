index = require('./index')

// mock processes.env

test('query', () => {
  const event = {
    path: "/primo/v1/pnxs",
    queryStringParameters: { inst: "NDU", search_scope: "spec_coll", q: "any,contains,book" },
  }

  console.log(index.queryUrl(event))
})
