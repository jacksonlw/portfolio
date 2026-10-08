import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'

// One icon set, as in the AnyForm brand: Phosphor from its RSC-safe subpath.
const ICON_MESSAGE = 'Icons are Phosphor: import them from "@phosphor-icons/react/ssr".'

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            { name: '@phosphor-icons/react', allowTypeImports: true, message: ICON_MESSAGE }
          ],
          patterns: [{ group: ['@heroicons/*', 'lucide-react', 'lucide-react/*'], message: ICON_MESSAGE }]
        }
      ]
    }
  },
  globalIgnores(['.next/**', 'out/**', 'build/**', 'next-env.d.ts'])
])
