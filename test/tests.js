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

    console.log(transformed);
  });
});
