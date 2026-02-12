#!/usr/bin/env node
/**
 * Deploy a specific manifest file to Goldsky.
 *
 * Goldsky's `goldsky subgraph deploy ... --path <dir>` expects the manifest to be named `subgraph.yaml`.
 * This script temporarily swaps `subgraph.yaml` with another manifest, runs the deploy, then restores it.
 *
 * Usage:
 *   node scripts/deploy-goldsky.js \
 *     --dir subgraphs/v3-pools \
 *     --manifest subgraph.swell-testnet.yaml \
 *     --subgraph symmetric-v-4-swell-testnet-pools \
 *     [--version 0.0.123] \
 *     [--tag swell-testnet]
 */
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

function getArg(flag) {
  const idx = process.argv.indexOf(flag);
  if (idx === -1) return undefined;
  return process.argv[idx + 1];
}

function hasFlag(flag) {
  return process.argv.includes(flag);
}

const dir = getArg('--dir') || '.';
const manifest = getArg('--manifest');
const subgraph = getArg('--subgraph');
const tag = getArg('--tag');
const version =
  getArg('--version') ||
  process.env.GOLDSKY_VERSION ||
  `0.0.${Math.floor(Date.now() / 1000)}`;

if (!manifest || !subgraph) {
  console.error(
    [
      'Missing required args.',
      'Required: --manifest <file> --subgraph <name>',
      'Optional: --dir <dir> --version <semver> --tag <tag>',
    ].join('\n')
  );
  process.exit(2);
}

const absDir = path.resolve(process.cwd(), dir);
const subgraphYaml = path.join(absDir, 'subgraph.yaml');
const desiredYaml = path.join(absDir, manifest);

if (!fs.existsSync(desiredYaml)) {
  console.error(`Manifest not found: ${desiredYaml}`);
  process.exit(2);
}

const original = fs.existsSync(subgraphYaml) ? fs.readFileSync(subgraphYaml, 'utf8') : null;
const desired = fs.readFileSync(desiredYaml, 'utf8');

try {
  fs.writeFileSync(subgraphYaml, desired);

  const nameAndVersion = `${subgraph}/${version}`;
  const args = ['subgraph', 'deploy', nameAndVersion, '--path', absDir];
  if (tag) args.push('--tag', tag);
  if (hasFlag('--verbose')) args.push('--verbose');

  const res = spawnSync('goldsky', args, { stdio: 'inherit' });
  if (res.error) {
    console.error(`Failed to execute 'goldsky': ${res.error.message}`);
    process.exit(1);
  }
  process.exit(res.status ?? 1);
} finally {
  if (original === null) {
    // If there was no subgraph.yaml before, clean up.
    try {
      fs.unlinkSync(subgraphYaml);
    } catch {
      // ignore
    }
  } else {
    fs.writeFileSync(subgraphYaml, original);
  }
}

