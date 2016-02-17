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

  function templateStringTag(quasis, expressions) {
    const processedTemplateLiteral = processTemplateLiteral(quasis, expressions, 'queryName');
    const processedTemplateText = transformer.processTemplateText(processedTemplateLiteral.templateText, 'queryName', 'propName');
    const definition = transformer.processDocumentText(processedTemplateText, 'queryName');

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

  return templateStringTag;
}

// Attempted lift from https://github.com/facebook/relay/blob/0be965c3c92c48499b452e953d823837838df962/scripts/babel-relay-plugin/src/RelayQLTransformer.js#L114-L148
// Returns { substitutions, templateText, variableNames }
// Who knows why they are called quasis??
function processTemplateLiteral(quasis, expressions, documentName) {
  const chunks = [];
  const variableNames = {};
  const substitutions = [];

  quasis.forEach((chunk, ii) => {
    chunks.push(chunk);

    if (ii !== quasis.length - 1) {
      const name = 'RQL_' + ii;
      const value = expressions[ii];

      substitutions.push({name, value});

      if (/:\s*$/.test(chunk)) {
        invariant(
          false, // this.options.substituteVariables,
          'You supplied a GraphQL document named `%s` that uses template ' +
          'substitution for an argument value, but variable substitution ' +
          'has not been enabled.',
          documentName
        );
        chunks.push('$' + name);
        variableNames[name] = undefined;
      } else {
        chunks.push('...' + name);
      }
    }
  });

  return {substitutions, templateText: chunks.join('').trim(), variableNames};
}
