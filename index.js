const fetch = require('node-fetch')

exports.handler = async (event, context, lambdaCallback) => {
  try {
    const query = event.path + "?" + Object.keys(event.queryStringParameters).map(key => key + '=' + event.queryStringParameters[key]).join('&')
    const url = process.env.PASSTHROUGH_URL
    let res = await fetch(url + query)
    const body = await res.text()
    const headers = {
      "Access-Control-Allow-Origin": "*",
      "Content-Type": res.headers.get("Content-type"),
    }

    const response = {
        statusCode: 200,
        headers: headers,
        body: body
    }

    lambdaCallback(null, response)
  } catch (e) {
    console.error(e)
  }
}


// node -e "require('./index').test()"
exports.test = () => {
  exports.handler(
    {
      path: "/ndu_local",
      queryStringParameters: { preview: true, query: "query" },
    },
    {},
    (err, data) => { console.log(JSON.stringify(JSON.parse(data.body), null, 2)) }
  )
}
