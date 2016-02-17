import assert from "assert";
import { introspectStarwars } from './introspectStarwars';
import { initTemplateStringTransformer } from '../src/index';
import fs from 'fs';
import path from 'path';

// Uncomment the below to generate a new schema JSON
// describe("graphql", () => {
//   it("can introspect star wars", async () => {
//     const result = await introspectStarwars();
//
//     fs.writeFileSync(path.join(__dirname, "starwars.json"),
//       JSON.stringify(result, null, 2));
//
//     assert.ok(result.data);
//     assert.ok(result.data.__schema);
//   });
// });

describe("runtime query transformer", () => {
  it("can be initialized with an introspected query", async () => {
    const result = await introspectStarwars();
    const transformer = initTemplateStringTransformer(result.data);
  });

  it("can compile a Relay.QL query", () => {
    Relay.QL`
      query HeroNameQuery {
        hero {
          name
        }
      }
    `;
  });

  it("can transform a simple query", async () => {
    const result = await introspectStarwars();
    const transformer = initTemplateStringTransformer(result.data);
    const transformed = transformer(`
      query HeroNameAndFriendsQuery {
        hero {
          id
          name
          friends {
            name
          }
        }
      }
    `);

    const expected = Relay.QL`
      query HeroNameAndFriendsQuery {
        hero {
          id
          name
          friends {
            name
          }
        }
      }
    `;

    assert.deepEqual(transformed, expected);
  });

  it("can transform a query with arguments", async () => {
    const result = await introspectStarwars();
    const transformer = initTemplateStringTransformer(result.data);
    const transformed = transformer(`
      query FetchLukeQuery {
        human(id: "1000") {
          name
        }
      }
    `);

    const expected = Relay.QL`
      query FetchLukeQuery {
        human(id: "1000") {
          name
        }
      }
    `;

    assert.deepEqual(transformed, expected);
  });

  it("can transform a query with variables", async () => {
    const result = await introspectStarwars();
    const transformer = initTemplateStringTransformer(result.data);
    const transformed = transformer(`
      query FetchSomeIDQuery($someId: String!) {
        human(id: $someId) {
          name
        }
      }
    `);

    const expected = Relay.QL`
      query FetchSomeIDQuery($someId: String!) {
        human(id: $someId) {
          name
        }
      }
    `;

    assert.deepEqual(transformed, expected);
  });
});
