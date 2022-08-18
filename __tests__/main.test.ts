import { execute } from "../src/main";

import * as process from "process"
import * as cp from "child_process"
import * as path from "path"
import { describe, expect, test } from "@jest/globals"

describe("Test", function () {
  test("test", async function () {
    await execute()
  })
})
