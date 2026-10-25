# Practices: what to keep and what to change

I reviewed my own repos to see which habits held up with agents writing most of the code and
which ones didn't. The template in [`template/`](../template) is the result.

- [keep.md](keep.md): habits that worked, and where the template carries them forward.
- [change.md](change.md): habits that cost time or trust, what replaces them, and why.
- Per-repo steps are in [`docs/migrations/`](../docs/migrations).

## How the review worked

- I read every repo through `gh` and local clones, read-only. No other repo was changed.
- Public repos (shadow-army, shadow-docs, post-it-board, trace-workbench, Personal-Portfolio)
  are named with specific files.
- Private repos (replay-studio, switchyard, Obsidian-codex-setup and others) are named, but
  their findings stay general. These notes include no file contents, no PR links and no
  internal details.
- Each item says what was seen and which template file covers it. When a claim is a
  judgement rather than something I checked, it says so.

Each list is about habits, not people. Most of the "change" items exist because an earlier
repo got something working fast, and that was the right call at the time.
