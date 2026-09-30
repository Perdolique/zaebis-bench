Создай сайт с кнопкой «сделать заебись». При каждом нажатии должно становиться заебись: запускай яркие, эффектные визуальные эффекты. Я хочу активно нажимать на кнопку, чтобы эффекты накладывались друг на друга и превращали страницу в зрелищный хаос. Чтобы с каждым новым нажатием было все заебистее и заебистее, вплоть до неприлично-абсурдного уровня заебистности.

Deploy the site to my Cloudflare account using these rules:

- Use the prepared `wrangler.jsonc`. Keep its `account_id` and point its assets directory at the site's output.
- Use the current run directory name for the Worker `name`, with dots replaced by dashes. For example, `gpt-6.1-sol-high` becomes `gpt-6-1-sol-high`.
- Add a `deploy` script to `package.json` so `vp run deploy` runs a regular `wrangler deploy` from this directory. Build the site first if needed.
- Use the user's regular Wrangler login. Do not override its global authentication directory.
- If the login is missing or expired, ask the user to run `vpx wrangler login`, then continue the deployment.
- Do not use an anonymous account or `--temporary`.
- Verify the published site and return its public URL.

Тесты писать не нужно.
