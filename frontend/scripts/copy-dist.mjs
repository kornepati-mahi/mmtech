import { cpSync, existsSync, mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

/**
 * Copies the Vite build output to the repository root as well.
 *
 * Vercel can build the project with either the repository root or `frontend`
 * as the project root. `outputDirectory` is resolved relative to that root, so
 * this copy guarantees that `<root>/dist` always exists and holds the build.
 */
const here = dirname(fileURLToPath(import.meta.url)) // <repo>/frontend/scripts
const frontendRoot = resolve(here, '..') // <repo>/frontend
const repoRoot = resolve(frontendRoot, '..') // <repo>

const source = resolve(frontendRoot, 'dist')
const target = resolve(repoRoot, 'dist')

if (!existsSync(source)) {
  console.warn('[copy-dist] no build output found at', source)
  process.exit(0)
}

mkdirSync(repoRoot, { recursive: true })
cpSync(source, target, { recursive: true })
console.log('[copy-dist] copied build output to', target)
