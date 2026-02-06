# OpenClaw Auto-Approve Configuration

## User Preference (REMEMBER THIS)
**Config format: JSON** (`openclaw.json` not YAML)

---

## Goal
Allow enPlace development workflow without desktop approval prompts.

## Config Location
Edit your OpenClaw gateway config file:
- `/etc/openclaw/openclaw.json` (system-wide)
- `~/.openclaw/openclaw.json` (user-specific)
- `~/.config/openclaw/openclaw.json` (XDG config)

## Recommended Auto-Approve Rules (JSON)

```json
{
  "tools": {
    "exec": {
      "security": "allowlist",
      "allowlist": [
        "git status",
        "git add *",
        "git commit *",
        "git push *",
        "git pull *",
        "git log *",
        "git checkout *",
        "git clone *",
        "git stash *",
        "ls *",
        "cat *",
        "find *",
        "grep *",
        "head *",
        "tail *",
        "wc -l *",
        "which *",
        "npm install*",
        "npm start*",
        "npx expo*",
        "node *",
        "curl *"
      ]
    }
  }
}
```

## Even Simpler: Allow Everything (Use with Caution)

```json
{
  "tools": {
    "exec": {
      "security": "allowlist",
      "allowlist": ["*"]
    }
  }
}
```

## Apply Config

After editing, restart OpenClaw:
```bash
sudo systemctl restart openclaw
# or
openclaw gateway restart
```

## Current Workaround (Until Configured)

Keep desktop browser tab open at your OpenClaw web interface.

Even when chatting on phone, approvals show there.

---

*Config format: JSON (not YAML)*  
*Created: 2026-02-06*
