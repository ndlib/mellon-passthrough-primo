index = require('./index')

describe("primo passthrough", () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    jest.resetModules() // this is important
    process.env = { ...OLD_ENV }
    process.env.PRIMO_API_KEY = "primokey"
    process.env.PASSTHROUGH_URL = "primourl"

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

    // uses the passtrhough url
    expect(url).toMatch(/primourl/)
    // passes the path back to the url
    expect(url).toMatch(/path/)
    // creates a query string from all the data.
    expect(url).toMatch(/\?var1%3Dvar1%26var2%3Dvar2%26var3%3Dvar3/)
  })

  test('it passes the url and headers to the fetch', async () => {
    fetch.mockResponseOnce(JSON.stringify({ data: '12345' }))

    const response = await index.queryResult("http://google.com", fetch)
    const headers = {
      "headers": {
        "Authorization": "apikey primokey",
      },
      "method": "get",
    }

    expect(fetch).toHaveBeenCalledWith("http://google.com", headers)

  })

  test("it builds a response body from a fetched response", async () => {
    const textFunction = jest.fn(() => Promise.resolve('body data'))
    const headersGet = jest.fn((d) => d)
    let result = { text: textFunction,  headers: { get: headersGet }}

    const test = {
      body: "body data",
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "Content-type"
      },
      "statusCode": 200,
    }

    const response = await index.createLambdaResponse(result)

    expect(response).toEqual(test)
  })
})
