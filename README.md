# Zaebis Bench

A small LLM benchmark: give different models the same prompt, ask them to build the same website, and compare the results.

The task is to make a button that says **«сделать заебись»** (roughly, "make it fucking awesome"). Clicking it should trigger effects. Fast, repeated clicks should turn the page into visual chaos.

## How it works

1. Give each model the same [benchmark prompt](prompt.md).
2. Let each model plan, build, and deploy the website.
3. Try the results and compare how well each model handled the same task.

## Benchmarks

| Model | Reasoning effort | Run | Public site |
| --- | --- | --- | --- |
| GPT-6.1 Sol | high | [gpt-6.1-sol-high](gpt-6.1-sol-high/) | [Open site](https://gpt-6-1-sol-high.perd.workers.dev/) |

## Deployment

During preparation, copy [wrangler.jsonc](wrangler.jsonc) into the new run directory. Set its `name` to the directory name with dots replaced by dashes. Keep its account settings. The default assets directory is `public`; change it if the app uses another output directory.

Once the site is ready, run `vp run deploy` from the run directory. Wrangler uses your regular login. If the login is missing or expired, run `vpx wrangler login` first.

## Benchmark prompt

See [prompt.md](prompt.md) for the benchmark prompt in Russian. It combines the task requirements into one prompt, with grammar fixes and repetition removed.

## License

[Unlicense](LICENSE).
