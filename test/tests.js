import assert from "assert";
import { introspectStarwars } from './introspectStarwars';
import { initTemplateStringTransformer } from '../src/index';
import RelayContext from 'react-relay/lib/RelayContext';

describe("graphql", () => {
  it("can introspect star wars", async () => {
    const result = await introspectStarwars();

    assert.ok(result.data);
    assert.ok(result.data.__schema);
  });
});

describe("relay context", () => {
  it("can be imported and initialized", () => {
    const store = new RelayContext();
  });
});

describe("runtime query transformer", () => {
  it("can be initialized with an introspected query", async () => {
    const result = await introspectStarwars();
    const transformer = initTemplateStringTransformer(result.data);
  });

  it("can transform a simple query", async () => {
    const result = await introspectStarwars();
    const transformer = initTemplateStringTransformer(result.data);
    const transformed = transformer(`
      query HeroNameQuery {
        hero {
          name
        }
      }
    `);

  });
});
