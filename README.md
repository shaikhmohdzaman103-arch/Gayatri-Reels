# Gayatri reels — quick start

A ready-to-use project folder for Claude Code.

## What's here

```
CLAUDE.md        the standing brief — Claude Code reads this automatically
brand/           logo + four team portraits (for HeyGen avatars)
scripts/         scripts/NN-keyword.md — one file per reel
clips/           raw HeyGen renders, one file per line
reels/           finished MP4s
```

## First run

```bash
cd gayatri-reels
claude
```

Claude Code loads `CLAUDE.md` at startup. You do not need to paste the brief.

## Connect HeyGen once

```bash
claude mcp add --transport http heygen https://mcp.heygen.com/mcp/v1/
```

Then inside Claude Code run `/mcp` and sign in with OAuth.

## Then ask for one thing at a time

```
Read CLAUDE.md. SERVICE: Finance, Ops & SOP Setup.
AUDIENCE: promoter, ₹10–100 Cr, manufacturing.
Write scripts/06-system.md — 35 seconds, two speakers, max 9 lines.
Show me the script only.
```

Approve the script, then render, then assemble. Three prompts, three phases.

## Rules of thumb

- **Script before clips.** Words are free; renders cost credits.
- **One line at a time.** HeyGen renders one speaker per clip; the conversation
  is made in the edit.
- **Keep CLAUDE.md under ~300 lines.** It is charged to context every session.
  Add a line when something goes wrong; delete a line when it stops being true.
- **`/compact` between phases.** The render loop leaves polling noise you don't need.

## If you ever need to regenerate the brief

Inside Claude Code, run `/init`. It writes a fresh `CLAUDE.md` from whatever is in
the folder — useful as a starting point, but it will be thinner than this one.
Keep this version as the source of truth.
