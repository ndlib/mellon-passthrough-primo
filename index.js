const fetch = require('node-fetch')

exports.handler = async (event, context, lambdaCallback) => {
  try {
    const query = event.path + "?" + encodeURIComponent(Object.keys(event.queryStringParameters).map(key => key + '=' + event.queryStringParameters[key]).join('&'))
//    const url = process.env.PASSTHROUGH_URL + query
    let url = "https://api-na.hosted.exlibrisgroup.com" + query

    const requestHeaders = {
        method: "get",
        headers: { "Authorization": "apikey " + process.env.PRIMO_API_KEY }
    }

    let res = await fetch(url, requestHeaders )
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
      path: "/primo/v1/pnxs",
      queryStringParameters: { inst: "NDU", search_scope: "spec_coll", q: "any,contains,book" },
    },
    {},
    (err, data) => { console.log(JSON.stringify(JSON.parse(data.body), null, 2)) }
  )
}
