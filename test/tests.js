import assert from "assert";
import { introspectStarwars } from './introspectStarwars';

describe("graphql", () => {
  it("can introspect star wars", async () => {
    const result = await introspectStarwars();

    assert.ok(result.data);
    assert.ok(result.data.__schema);
  });
});
