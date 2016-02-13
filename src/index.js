import RelayQLTransformer from 'babel-relay-plugin/lib/RelayQLTransformer';
const {utilities_buildClientSchema: {buildClientSchema}} = require('babel-relay-plugin/lib/GraphQL');
import invariant from 'babel-relay-plugin/lib/invariant';
import { introspectionQuery } from 'graphql/utilities/introspectionQuery';

function getSchema(schemaProvider: GraphQLSchemaProvider): GraphQLSchema {
  const introspection = typeof schemaProvider === 'function' ?
    schemaProvider() :
    schemaProvider;
  invariant(
    typeof introspection === 'object' && introspection &&
    typeof introspection.__schema === 'object' && introspection.__schema,
    'Invalid introspection data supplied to `getBabelRelayPlugin()`. The ' +
    'resulting schema is not an object with a `__schema` property.'
  );
  return buildClientSchema(introspection);
}

function transform(schema, query) {
  const transformer = new RelayQLTransformer(schema, {});
  const processed = transformer.processDocumentText(query, 'queryName');
  return processed;
}

// export function initTemplateStringTransformerFromUrl(url, callback) {
//   $.get(url, {
//     query: introspectionQuery
//   }, (data) => {
//     const schemaJson = data.data;
//     const schema = getSchema(schemaJson);
//     const transformer = new RelayQLTransformer(schema, {});
//
//     function parseQueryString(queryString) {
//       console.log("transforming", queryString);
//       debugger;
//       const processed = transformer.processDocumentText(queryString, 'queryName');
//       console.log(processed);
//       return processed;
//     }
//
//     callback(parseQueryString);
//   });
// }

export function initTemplateStringTransformer(schemaJson) {
  const schema = getSchema(schemaJson);
  const transformer = new RelayQLTransformer(schema, {});

  function parseQueryString(queryString) {
    const processed = transformer.processDocumentText(queryString, 'queryName');
    return processed;
  }

  return parseQueryString;
}
