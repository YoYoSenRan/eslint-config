import { describe, it } from "vitest";
import { eslint } from "../../src";
import { assertIntegrationResults, lintIntegrationFixture, loadIntegrationFixture } from "../helpers/integration-testing";

describe("集成夹具：jsdoc-docs", () => {
  it("要求返回值说明", async () => {
    const fixture = loadIntegrationFixture("jsdoc-docs");
    const configs = await eslint(fixture.options.config ?? {}).toConfigs();
    const results = await lintIntegrationFixture(configs, fixture);
    assertIntegrationResults(results, fixture);
  });
});
