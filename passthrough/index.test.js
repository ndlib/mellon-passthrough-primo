index = require('./index')

describe("primo passthrough", () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    jest.resetModules() // this is important for the process env replacement
    process.env = { ...OLD_ENV }
    // setup relavant env variables.
    process.env.PRIMO_API_KEY = "primokey"
    process.env.PASSTHROUGH_URL = "primourl"
    process.env.VERSION = "test"

    // this resets the mocks added to the fetch mock between test runs
    fetch.resetMocks()
  })

  afterEach(() => {
   process.env = OLD_ENV;
  })

  test('query uri gets formatted correctly from the event', () => {
    const event = {
      path: "/path",
      queryStringParameters: { var1: "var1", var2: "var2", var3: "var3" },
    }
    const url = index.queryUrl(event)

    // uses the passtrhough url from env
    expect(url).toMatch(/primourl/)
    // passes the path back to the url from the event passthrough
    expect(url).toMatch(/path/)
    // creates a query string from all the data from the event queryStringParameters
    expect(url).toMatch(/\?var1%3Dvar1%26var2%3Dvar2%26var3%3Dvar3/)
  })

  test('it passes the url and headers to the fetch', async () => {
    fetch.mockResponseOnce(JSON.stringify({ data: '12345' }))

    const response = await index.queryResult("http://google.com", fetch)
    const headers = {
      "headers": {
        "Authorization": "apikey primokey", // from env
      },
      "method": "get",
    }

    expect(fetch).toHaveBeenCalledWith("http://google.com", headers)
  })

  test("it builds a response body from a fetched response", async () => {
    const textFunction = jest.fn(() => Promise.resolve('body data')) // mock of the promise that gets the text of the fetched url
    const headersGet = jest.fn((d) => d) // mock a headers function to get returns the name of the header
    // the full mock a result from fetch that is used.s
    let result = { text: textFunction,  headers: { get: headersGet }, status: "status"}

    const test = {
      body: "body data", // from the response.
      headers: {
        "Access-Control-Allow-Origin": "*", // added implicitly
        "Content-Type": "Content-type", // passed through from the response headers
        "x-nd-version": "test", // passed from env
      },
      "statusCode": "status", // passed through from the response
    }

    const response = await index.createLambdaResponse(result)

    expect(response).toEqual(test)
  })

  test("it catches errors in a generic 500 error response", () => {
    const response = (err, data) => {
      //expect(err).toBeDefined()
      const test = {
        "body": "{\"error\":\"Unable to Process Request\"}",
        "headers": {
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json",
          "x-nd-version": "test"
        },
        "statusCode": 500
      }
      expect(data).toEqual(test)
    }

    index.handler({}, {}, response)
  })

})
