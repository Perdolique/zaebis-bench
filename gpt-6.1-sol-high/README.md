# Make it zaebis

A small interactive site. Each click adds bright effects. Rapid clicks create a combo and layer more effects. The intensity keeps growing. Sound is off by default. The site respects the browser's reduced-motion setting.

## Run locally

```sh
npm ci
npm run dev
```

Open <http://localhost:8787>.

## Check and deploy

```sh
vp run check
vp run deploy:check
vp run deploy
```

Deployment uses a regular `wrangler deploy` in the Cloudflare account set in `wrangler.jsonc`. The Worker is named `gpt-6-1-sol-high`, based on this directory's name with dots replaced by dashes.

If Wrangler is not logged in, or its login has expired, run `vpx wrangler login` once. After that, use `vp run deploy` for each deployment. The deployment has no temporary-account expiry.

Wrangler uses your regular login. Generated logs and cache stay in the ignored `.deploy-state` directory. Only the `public` directory is uploaded.

The site uses plain HTML, CSS, JavaScript, and Canvas. There is no build step or test suite.
