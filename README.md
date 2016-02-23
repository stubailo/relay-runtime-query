# relay-runtime-query

Run Relay without transpiling all of your queries ahead of time.

```
npm install relay-runtime-query
```

Currently works with **Relay 0.7.1**.

## Usage

Initialize a template string transformer function from a GraphQL server URL. In the callback, you will have a function that can transform arbitrary GraphQL queries according to your server schema.

```js
import { initTemplateStringTransformerFromUrl } from 'relay-runtime-query'

initTemplateStringTransformerFromUrl('/graphql', (func) => {
  Relay.QL = func;

  ReactDOM.render(
    <Relay.RootContainer
      Component={App}
      route={new AppHomeRoute()}
    />,
    document.getElementById('root')
  );
});
```

Alternatively, you can fetch the introspection query yourself and call `initTemplateStringTransformer` directly:

```js
graphQLFetcher(url, { query: introspectionQuery }).then(result => {
  const schemaJson = result.data;
  Relay.QL = initTemplateStringTransformer(schemaJson));
});
```

## Example

Check out the [example app](https://github.com/meteor/relay-runtime-query/tree/master/example). It is built with the Meteor 1.3 beta build tool, and doesn't include the Relay babel plugin at all. You can easily change your server or client code at will, and the right parts of the app will rebuild. No need to run any build scripts manually after you change your schema.

## Why?

It can sometimes be inconvenient that you need a specific babel plugin to compile `Relay.QL` template strings at build time. Specifically, you need to:

1. Compile your server
2. Run the introspection query and save the result to a file
3. Pass that result into a Babel 6 plugin to compile your client code
4. Run your client

This has several consequences, in particular:

1. You absolutely need to use Babel 6
2. You can't easily develop the client and server in parallel (if one person is working on both) because of the multitude of compilation steps above
3. You can't play around with queries in the browser console since they won't be compiled so that Relay will understand them

With this package, you can avoid all the drawbacks above when developing your app by compiling your queries at runtime.

## Caveats

At this stage, the package is more of a proof of concept, but I expect it will greatly help me with my exploration of Relay. Perhaps it will help you too, and perhaps you can help me improve the implementation!

1. This should only be used in development and testing, since it will no doubt slow down your application. I'd suggest using the actual `babel-relay-plugin` when deploying a real app to production.
2. Sane error handling has not yet been implemented. It should be pretty simple to add nice error support for schema validation, so you still get many of the benefits of pre-compiling your schema.
