import assert from "assert";
import { introspectStarwars } from './introspectStarwars';
import { initTemplateStringTransformer } from '../src/index';
import fs from 'fs';
import path from 'path';

// Needed because some of the compiled stuff refers to Relay.QL.__frag
import Relay from 'react-relay';


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


describe("runtime query transformer", async () => {
  let transform;

  before(async () => {
    const result = await introspectStarwars();

    transform = initTemplateStringTransformer(result.data);
  });

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
    const transformed = transform`
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
    const transformed = transform`
      query FetchLukeQuery {
        human(id: "1000") {
          name
        }
      }
    `;

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
    const transformed = transform`
      query FetchSomeIDQuery($someId: String!) {
        human(id: $someId) {
          name
        }
      }
    `;

    const expected = Relay.QL`
      query FetchSomeIDQuery($someId: String!) {
        human(id: $someId) {
          name
        }
      }
    `;

    assert.deepEqual(transformed, expected);
  });

  it("can transform a query fragment", async () => {
    const transformed = transform`
      fragment HumanFragment on Human {
        name
        homePlanet
      }
    `;

    const expected = Relay.QL`
      fragment HumanFragment on Human {
        name
        homePlanet
      }
    `;

    assert.deepEqual(transformed, expected);
  });

  it("can transform a query with fragment substitution", async () => {
    function getFragmentRuntime() {
      return transform`
        fragment on Human {
          name
          homePlanet
        }
      `;
    }

    const transformed = transform`
      query FetchSomeIDQuery {
        human(id: $someId) {
          ${getFragmentRuntime()}
        }
      }
    `;

    console.log(transformed);

    // function f() {
    //   function getFragmentRelayQL() {
    //     return Relay.QL`
    //       fragment on Human {
    //         name
    //         homePlanet
    //       }
    //     `;
    //   }
    //
    //   const expected = Relay.QL`
    //     query FetchSomeIDQuery {
    //       human(id: $someId) {
    //         ${getFragmentRelayQL()}
    //       }
    //     }
    //   `;
    // }
    //
    // console.log(f.toString());
  });
});
