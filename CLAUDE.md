# Output & Verification Rules
- Do NOT capture screenshots or spawn browser verification tools automatically after making updates.
- Capture screenshots only when explicitly instructed in a prompt.
- Do not rewrite entire files when making small updates. Output only diffs or specific line modifications.
- Skip conversational greetings, pleasantries, filler text, or summaries of changes made unless explicitly requested.
- Provide implementations directly without lengthy step-by-step reasoning explanations.

# Execution Efficiency & Tool Directives
- Avoid invoking multi-agent workflows or sub-agents unless explicitly instructed.
- Do not generate or query external search tools, notebook edit tools, or background schedulers.
- Do NOT read full files to locate variable names, functions, or UI elements. Perform targeted searches using `ast-grep` or `rg` (ripgrep) first.
- Pipe all git status and diff commands through local log cleaning scripts if available (`git status --short`).
- Avoid verbose logging flags on terminal output. Use `--quiet` or `--silent` flags when available.
- Do not run `cat` on entire HTML or JS files over 100 lines. Read targeted line ranges using `sed` or line-specific range tools.
