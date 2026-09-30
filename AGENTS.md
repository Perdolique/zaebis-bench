# Benchmark instructions

This repository compares models on the same task. Keep each benchmark run separate so that earlier results do not influence later runs.

## Prepare a benchmark

When the user asks for a benchmark with a model and reasoning effort, prepare its directory and hand the task back to the user. Do not run the prompt or build, install, test, or deploy anything during preparation.

1. Check the current working directory. Use the known location of this file to identify the repository root without searching other run directories.
2. Get the model and reasoning effort from the request. Ask for any missing or unclear value before creating the directory.
3. Form the directory name from the model and effort. Use lowercase letters, replace spaces with hyphens, and keep version dots. For example, `gpt 6.1 sol high` becomes `gpt-6.1-sol-high`.
4. The target must be a direct child of the repository root. Use its absolute path so that a request made inside another run does not create a nested run.
5. Check only whether that exact target path exists. If it exists, stop and ask the user what to do. Do not read, reuse, clear, or overwrite it, even if it is the current working directory. Do not add a suffix on your own.
6. Create the target directory. If creation reports that the path already exists, follow the same stop-and-ask rule.
7. Read only the repository-root `prompt.md` and `wrangler.jsonc` as preparation inputs. Use `prompt.md` as the benchmark prompt and `wrangler.jsonc` as the deployment template. Preserve the prompt text; do not rewrite it or add requirements.
8. Copy the root `wrangler.jsonc` into the new directory. Keep its account settings. Set `name` in the copy to the run directory name with dots replaced by dashes. For example, `gpt-6.1-sol-high` becomes `gpt-6-1-sol-high`.
9. Create `AGENTS.md` inside the new directory using the template below. Replace `{{MODEL}}` and `{{EFFORT}}` with the requested values. Replace `{{PROMPT_SNAPSHOT}}` with the full current contents of root `prompt.md`, including its original language and formatting. Do not use a link, summary, translation, or placeholder instead of the prompt. This copy records the exact task for the run, even if root `prompt.md` changes later.
10. Check that the new `AGENTS.md` contains the requested model, effort, isolation rules, and an exact copy of the prompt. Check that the copied `wrangler.jsonc` keeps the template's account settings and has the expected Worker name. Do not start the benchmark.
11. Reply with the absolute target path, a shell-quoted `cd` command, and these manual steps:

    - Change to the target directory in the terminal.
    - Start a new Codex chat from that directory, rather than resume or fork this chat. Select the requested model and reasoning effort.
    - Send: `Сделай мне так, как написано в AGENTS.md`.

    The user does not need to copy the benchmark prompt into the chat. End preparation there; the user starts the benchmark manually.

Changing directories does not clear chat history. A new chat is needed to avoid carrying context from preparation or earlier runs into the benchmark.

## Run instructions template

Use this template only when creating a new run's `AGENTS.md`. The placeholders must be replaced during preparation. The benchmark prompt belongs at the end of the file, so its contents can be copied without rewriting them.

```markdown
# Benchmark run

- Model: {{MODEL}}
- Reasoning effort: {{EFFORT}}

## Task

When the user asks you to follow this file, carry out the benchmark prompt below in this directory. This run is already prepared: do not create another run directory or repeat the preparation handoff.

Use the prompt snapshot in this file as the task. Do not read the repository's root prompt.md or replace this snapshot with a newer version. Keep this file unchanged during benchmark implementation so the original task remains recorded.

## Isolation

- Keep project files, dependencies, commands, and generated output inside this directory. Do not implement the benchmark in the repository root.
- Do not list, open, search, or copy from sibling run directories, including through tools, scripts, browser access, or symlinks.
- Do not use another model's or effort's results as examples or references.
- Do not read previous chats, saved task histories, or memories to learn about other benchmark runs.
- Limit file searches and project commands to this directory. Do not search the repository root or inspect Git history for earlier results. Shared root instructions may be loaded as guidance, not as permission to read root files.
- Wrangler may use the user's normal global authentication files. Keep its logs and generated output inside this directory. This exception does not allow access to other benchmark runs.
- If you need information outside this directory, ask the user instead of inspecting other runs.

## Benchmark prompt

{{PROMPT_SNAPSHOT}}
```

## Work inside a benchmark directory

When the user asks you to follow the run's `AGENTS.md`, carry out its embedded benchmark prompt there. The directory is already prepared; do not create a new one or repeat the handoff. Keep project files, dependencies, commands, and generated output inside that directory. Do not implement the benchmark in the repository root.

- Do not list, open, search, or copy from sibling run directories, including through tools, scripts, browser access, or symlinks.
- Do not use results from another model or effort as examples or references.
- Do not read previous chats, saved task histories, or memories to learn about other benchmark runs.
- Limit file searches and project commands to the current benchmark directory. Do not search the repository root or inspect Git history for earlier results.
- The shared root instructions may be loaded as guidance. The root prompt is read only during preparation and copied into the run's `AGENTS.md`. Use that snapshot during the run; do not read the current root prompt or other root files.
- Wrangler may use the user's normal global authentication files. Keep its logs and generated output inside this directory. This exception does not allow access to other benchmark runs.
- If you need information outside the allowed directory, ask the user instead of inspecting another run.

## Repository maintenance

These preparation rules apply to benchmark requests. Explicit requests to edit shared files such as `README.md`, `prompt.md`, or `AGENTS.md` are repository maintenance and may be handled in the root. They do not allow reading benchmark directories unless the user explicitly asks for it.
