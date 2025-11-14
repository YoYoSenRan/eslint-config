import { describe, it } from "vitest";
import { eslint } from "../../src";
import { assertIntegrationResults, lintIntegrationFixture, loadIntegrationFixture } from "../helpers/integration-testing";

describe("集成夹具：ignores-dist", () => {
  it("默认忽略 dist 等构建目录", async () => {
    const fixture = loadIntegrationFixture("ignores-dist");
    const composer = eslint(fixture.options.config ?? {});
    const flatConfigs = await composer.toConfigs();

    const results = await lintIntegrationFixture(flatConfigs, fixture);
    assertIntegrationResults(results, fixture);
  });
});
