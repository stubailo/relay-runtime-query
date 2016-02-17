import RelayQLTransformer from 'babel-relay-plugin/lib/RelayQLTransformer';
const {utilities_buildClientSchema: {buildClientSchema}} = require('babel-relay-plugin/lib/GraphQL');
import invariant from 'babel-relay-plugin/lib/invariant';
import RelayQLPrinter from 'babel-relay-plugin/lib/RelayQLPrinter';
import { introspectionQuery } from 'graphql/utilities/introspectionQuery';
import { transformFromAst } from 'babel-core';

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

let fragmentIndex = 0;
const fragmentCache = {};

function encodeFragmentIndex(index) {
  return '$$$' + index + '$$$';
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
//       debugger;
//       const processed = transformer.processDocumentText(queryString, 'queryName');
//       return processed;
//     }
//
//     callback(parseQueryString);
//   });
// }

const t = {
  arrayExpression(array) {
    return array;
  },
  nullLiteral() {
    return null;
  },
  valueToNode(value) {
    return value;
  },
  objectExpression(propertyArray) {
    const obj = {};

    propertyArray.forEach((property) => {
      if (property.value.__identifier) {
        throw new Error("Don't support identifiers yet");
      }

      obj[property.key] = property.value;
    });

    return obj;
  },
  identifier(identifierName) {
    return {
      __identifier: identifierName
    };
  },
  objectProperty(nameIdentifier, value) {
    return {
      key: nameIdentifier.__identifier,
      value: value
    };
  },

  // Only used once, to return a definition object in `print`
  returnStatement(expressionToReturn) {
    return {
      __fakeReturnStatement: expressionToReturn
    };
  },

  // Used twice - for runtime errors, and to return a definition object in `print`
  blockStatement(arrayOfStatements) {
    return {
      __fakeBlockStatement: arrayOfStatements
    };
  },

  functionExpression(name, substitutionIdentifiers, printedDocumentReturnBlockStatement) {
    const query = printedDocumentReturnBlockStatement.__fakeBlockStatement[0].__fakeReturnStatement;

    const querySubstitutionFunction = function () {
      return query;
    }

    return querySubstitutionFunction;
  },

  callExpression(func, args) {
    if (args && args.length > 0) { throw new Error("Args not implemented lol") }
    // I don't know what this does lol, maybe it's an IIFE?
    return func();
  }
};

export function initTemplateStringTransformer(schemaJson) {
  const schema = getSchema(schemaJson);
  const transformer = new RelayQLTransformer(schema, {});

  function parseQueryString(queryString) {
    const definition = transformer.processDocumentText(queryString, 'queryName');
    const options = {};
    const Printer = RelayQLPrinter(t, options);

    const printed = new Printer('wtf??', {})
      .print(definition, []);
    //
    // // Generate a new index for this fragment
    // fragmentIndex++;
    // const thisQueryIndex = fragmentIndex;
    //
    // printed.toString = function () {
    //   return encodeFragmentIndex(thisQueryIndex);
    // }

    return printed;
  }

  return parseQueryString;
}
