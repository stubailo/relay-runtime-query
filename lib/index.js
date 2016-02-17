'use strict';

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.initTemplateStringTransformer = initTemplateStringTransformer;

var _babelRelayPluginLibRelayQLTransformer = require('babel-relay-plugin/lib/RelayQLTransformer');

var _babelRelayPluginLibRelayQLTransformer2 = _interopRequireDefault(_babelRelayPluginLibRelayQLTransformer);

var _babelRelayPluginLibInvariant = require('babel-relay-plugin/lib/invariant');

var _babelRelayPluginLibInvariant2 = _interopRequireDefault(_babelRelayPluginLibInvariant);

var _graphqlUtilitiesIntrospectionQuery = require('graphql/utilities/introspectionQuery');

var _require = require('babel-relay-plugin/lib/GraphQL');

var buildClientSchema = _require.utilities_buildClientSchema.buildClientSchema;

function getSchema(schemaProvider) {
  var introspection = typeof schemaProvider === 'function' ? schemaProvider() : schemaProvider;
  (0, _babelRelayPluginLibInvariant2['default'])(typeof introspection === 'object' && introspection && typeof introspection.__schema === 'object' && introspection.__schema, 'Invalid introspection data supplied to `getBabelRelayPlugin()`. The ' + 'resulting schema is not an object with a `__schema` property.');
  return buildClientSchema(introspection);
}

function transform(schema, query) {
  var transformer = new _babelRelayPluginLibRelayQLTransformer2['default'](schema, {});
  var processed = transformer.processDocumentText(query, 'queryName');
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
//       debugger;
//       const processed = transformer.processDocumentText(queryString, 'queryName');
//       return processed;
//     }
//
//     callback(parseQueryString);
//   });
// }

function initTemplateStringTransformer(schemaJson) {
  var schema = getSchema(schemaJson);
  var transformer = new _babelRelayPluginLibRelayQLTransformer2['default'](schema, {});

  function parseQueryString(queryString) {
    var processed = transformer.processDocumentText(queryString, 'queryName');
    return processed;
  }

  return parseQueryString;
}
