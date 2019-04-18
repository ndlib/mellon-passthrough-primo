// Exposing dependencies to allow mocking
const deps = {};
deps.AWS = require('aws-sdk');
deps.querystring = require('querystring');
deps.fetch = require('node-fetch');
deps.loadConfig = require('load-config');
deps.log = console.log;
deps.error = console.error;
exports.deps = deps;

const appConfigPath = process.env.APP_CONFIG_PATH;

var config;
const requiredConfigKeys = ['passthrough_url', 'primo_api_key', 'primo_sandbox_api_key'];

exports.handler = async (event, context, lambdaCallback) => {
  if (config) {
    await exports.passthrough(config, event, context, lambdaCallback);
  } else {
    config = await deps.loadConfig(appConfigPath, requiredConfigKeys);
    await exports.passthrough(config, event, context, lambdaCallback);
  }
  return
}

exports.passthrough = async (config, event, context, lambdaCallback) => {
  try {
    const url = exports.queryUrl(config, event)
    const result = await exports.queryResult(url)
    const response = await exports.createLambdaResponse(result)
    
    lambdaCallback(null, response)
    return
  } catch (e) {
    lambdaCallback(e, exports.errorResponse(e))
  }
}

exports.queryUrl = (config, event) => {
  const query = event.path + "?" + encodeURIComponent(Object.keys(event.queryStringParameters).map(key => key + '=' + event.queryStringParameters[key]).join('&'))
  return config.passthrough_url + query
}

exports.queryResult = (config, url, testFetch) => {
  let methodFetch = deps.fetch
  if (testFetch) {
    methodFetch = testFetch
  }
  const requestHeaders = {
      method: "get",
      headers: { "Authorization": "apikey " + config.primo_api_key }
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
