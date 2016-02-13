export {version} from "../package.json";

export async function sleep(ms) {
  await new Promise(resolve => setTimeout(resolve, ms));
  return ms;
}

import RelayQLTransformer from 'babel-relay-plugin/lib/RelayQLTransformer';
const {utilities_buildClientSchema: {buildClientSchema}} = require('babel-relay-plugin/lib/GraphQL');
import invariant from 'babel-relay-plugin/lib/invariant';

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

export function transform(schemaJson, query) {
  const schema = getSchema(schemaJson);
  const transformer = new RelayQLTransformer(schema, {});

  const processed = transformer.processDocumentText(query, 'queryName');

  return processed;
}
