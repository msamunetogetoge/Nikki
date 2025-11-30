export type TestCase = { name: string; fn: () => unknown | Promise<unknown> }
export type TestSuite = { name: string; tests: TestCase[] }

export async function runTestSuites(suites: TestSuite[]) {
  let failures = 0

  for (const suite of suites) {
    console.log(`Suite: ${suite.name}`)
    for (const test of suite.tests) {
      try {
        await test.fn()
        console.log(`  ✅ ${test.name}`)
      } catch (error) {
        failures++
        console.error(`  ❌ ${test.name}`)
        console.error(error)
      }
    }
  }

  if (failures > 0) {
    console.error(`\n${failures} test(s) failed`)
    Deno.exit(1)
  }

  console.log("\nAll tests passed")
}
