import { describe, it } from "vitest";
import { eslint } from "../../src";
import { assertIntegrationResults, lintIntegrationFixture, loadIntegrationFixture } from "../helpers/integration-testing";

describe("集成夹具：disables-scripts", () => {
  it("脚本目录放宽 no-console", async () => {
    const fixture = loadIntegrationFixture("disables-scripts");
    const configs = await eslint(fixture.options.config ?? {}).toConfigs();
    const results = await lintIntegrationFixture(configs, fixture);
    assertIntegrationResults(results, fixture);
  });
});
