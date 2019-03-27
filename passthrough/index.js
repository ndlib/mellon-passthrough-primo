const fetch = require('node-fetch')

exports.handler = async (event, context, lambdaCallback) => {
  try {
    const url = exports.queryUrl(event)
    const result = await exports.queryResult(url)
    const response = await exports.createLambdaResponse(result)

    lambdaCallback(null, response)
    return
  } catch (e) {
    lambdaCallback(e, exports.errorResponse(e))
  }
}

exports.queryUrl = (event) => {
  const query = event.path + "?" + encodeURIComponent(Object.keys(event.queryStringParameters).map(key => key + '=' + event.queryStringParameters[key]).join('&'))
  return process.env.PASSTHROUGH_URL + query
}

exports.queryResult = (url, testFetch) => {
  let methodFetch = fetch
  if (testFetch) {
    methodFetch = testFetch
  }
  const requestHeaders = {
      method: "get",
      headers: { "Authorization": "apikey " + process.env.PRIMO_API_KEY }
  }
  return methodFetch(url, requestHeaders)
}

exports.createLambdaResponse = async (result) => {
  const body = await result.text()
  return response = {
    statusCode: result.status,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Content-Type": result.headers.get("Content-type"),
      "x-nd-version": process.env.VERSION,
    },
    body: body
  }
}

exports.errorResponse = (error) => {
  return response = {
    statusCode: 500,
    body: JSON.stringify({ error: "Unable to Process Request"}),
    headers: {
      "Access-Control-Allow-Origin" : "*", // Required for CORS support to work
      "x-nd-version": process.env.VERSION,
      "Content-Type": "application/json",
    },
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
    (err, data) => {
      if (err) {
        console.log("ERROR:")
        console.error(JSON.stringify(JSON.parse(err), null, 2))
      } else {
        console.log(JSON.stringify(JSON.parse(data.body), null, 2))
      }
    }
  )
}
