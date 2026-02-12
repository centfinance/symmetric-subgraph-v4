## Deploying these subgraphs to Goldsky (Swellchain)

Goldsky supports Swellchain subgraphs using network slugs:
- **Swellchain mainnet**: `swell`
- **Swellchain testnet**: `swell-testnet`

This repo was originally set up for The Graph manifests like `subgraph.swellchain-sepolia.yaml`. Goldsky expects a
manifest named **`subgraph.yaml`** in the deployed directory, and the `network:` field must match Goldsky’s supported
network slugs.

To support that, we generate **Goldsky-compatible manifests**:
- `subgraph.swell-testnet.yaml` (generated from `networks.json`)

### One-time setup

1. Install Goldsky CLI (macOS/Linux):

```bash
curl https://goldsky.com | sh
```

2. Create an API key in Goldsky dashboard, then:

```bash
goldsky login
```

### Generate manifests

From repo root:

```bash
pnpm install
pnpm generate-manifests
```

### Deploy: Swellchain testnet (swell-testnet)

These scripts will temporarily swap `subgraph.yaml` during deploy so Goldsky picks up the right manifest.
Each deploy uses a unique version `0.0.<epochSeconds>` and tags it `swell-testnet`.

#### Pools

```bash
pnpm pools deploy:goldsky:swell-testnet
```

#### Vault

```bash
pnpm vault deploy:goldsky:swell-testnet
```

Note: `deploy:goldsky:swell-testnet` runs `codegen:swell-testnet` first to ensure the `build/` folder (which Goldsky
packages) was built from the **Goldsky-compatible** manifest (i.e. `network: swell-testnet`), not `swellchain-sepolia`.

### Goldsky query endpoints

Goldsky endpoints are project-scoped and look like:

`https://api.goldsky.com/api/public/<project_id>/subgraphs/<subgraph-name>/<version-or-tag>/gn`

Once deployed, you can use the `swell-testnet` tag in the URL (recommended).
You can copy the exact endpoint from the Goldsky dashboard for each subgraph/tag.

