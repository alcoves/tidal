const fetch = require('node-fetch');
const { createHttpLink } = require('apollo-link-http');
const { InMemoryCache } = require('apollo-cache-inmemory');
const { ApolloClient } = require('apollo-client');

const baseUrl =
  process.env.NODE_ENV === 'production'
    ? 'https://api.bken.io/graphql'
    : 'http://localhost:4000/graphql';

const client = new ApolloClient({
  link: createHttpLink({
    uri: baseUrl,
    fetch: fetch,
  }),
  cache: new InMemoryCache(),
  request: (operation) => {
    operation.setContext({
      headers: {
        authorization: `SERVICE ${process.env.CONVERSION_API_KEY}`,
      },
    });
  },
});

module.exports = client;
