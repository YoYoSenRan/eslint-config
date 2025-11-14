import { describe, it } from "vitest";
import { eslint } from "../../src";
import { assertIntegrationResults, lintIntegrationFixture, loadIntegrationFixture } from "../helpers/integration-testing";

describe("集成夹具：formatters-css", () => {
  it("通过 format/prettier 校验 CSS", async () => {
    const fixture = loadIntegrationFixture("formatters-css");
    const composer = eslint(fixture.options.config ?? {});
    const flatConfigs = await composer.toConfigs();

    const results = await lintIntegrationFixture(flatConfigs, fixture);
    assertIntegrationResults(results, fixture);
  });
});
