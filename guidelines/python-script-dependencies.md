# Python one-off scripts — don't assume a package is there; use `uv run --with`

A hook, skill or ad hoc `python3` run that needs a package outside the standard library. Not a
project with its own `pyproject.toml` or lockfile (`uv sync`/`uv add` there), and not a vendored
script, which isn't yours to hand-edit.

1. **A missing package**
   - Never assume it is installed
   - No hand-rolled stdlib substitute when `import` fails: it silently returns wrong values on
     edge cases a real parser catches
   - Ad hoc `python3 -c "..."` or a throwaway script: `uv run --with <package> python3 script.py`,
     an on-demand isolated environment with no venv and no global install
   - No `uv`: say so and ask before installing anything; never a global `pip install`

2. **A script worth keeping**
   - PEP 723 inline metadata, so `uv run <file>` alone resolves its deps; `uv add --script <file>
     <package>` writes it:

     ```python
     # /// script
     # dependencies = ["pyyaml"]
     # ///
     ```

3. **YAML: `yq` or pyyaml, by task shape**
   - `yq` (mikefarah's Go binary) for YAML from a shell, including SKILL.md-style frontmatter
     (`yq --front-matter=extract`); not a stdlib substitute for pyyaml
   - A single value read or a quick in-place edit, no other logic: `yq`
   - Real logic (several validation rules, branching, structured error handling): pyyaml via
     `uv run --with`
