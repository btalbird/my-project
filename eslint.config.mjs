import { createRequire } from "module"

const require = createRequire(import.meta.url)

const nextCore = require("eslint-config-next/core-web-vitals")
const nextTypescript = require("eslint-config-next/typescript")

const eslintConfig = [
  {
    ignores: ["node_modules/**", ".next/**", "out/**", "build/**", "next-env.d.ts"],
  },
  ...nextCore,
  ...nextTypescript,
]

export default eslintConfig
