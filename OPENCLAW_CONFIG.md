# OpenClaw Auto-Approve Configuration

## Goal
Allow enPlace development workflow without desktop approval prompts.

## Config Location
Edit your OpenClaw gateway config file (usually `/etc/openclaw/config.yaml` or `~/.openclaw/config.yaml`)

## Recommended Auto-Approve Rules

```yaml
tools:
  exec:
    # Allow common git commands (no approval needed)
    allowlist:
      - "git status"
      - "git add *"
      - "git commit *"
      - "git push *"
      - "git pull *"
      - "git log *"
      - "git checkout *"
      - "git clone *"
      - "git stash *"
      - "ls *"
      - "cat *"
      - "find *"
    
    # Node/Expo development (add these for server-side Expo)
    allowlist:
      - "npm install*"
      - "npm start*"
      - "npx expo*"
      - "node *"
      - "cd * && npm *"
    
    # File operations that are read-only or safe
    allowlist:
      - "grep *"
      - "head *"
      - "tail *"
      - "wc -l *"
      - "which *"

# Optional: Auto-approve for specific channels
channels:
  telegram:
    tools:
      exec:
        # Less strict for Telegram (you trust your phone)
        security: allowlist  # instead of "deny" or "full"
```

## Even Simpler: Per-Session Override

If you want **all** exec commands approved for this session without prompts:

```yaml
sessions:
  - name: "enPlace-Dev"
    sessionKey: "main"
    tools:
      exec:
        security: allowlist  # Auto-approve safe commands
        allowlist:
          - "*"  # Allow everything (use with caution!)
```

## Apply Config

After editing, restart OpenClaw:
```bash
sudo systemctl restart openclaw
# or
openclaw gateway restart
```

## Current Workaround (Until Configured)

Keep desktop browser tab open at:
`https://your-openclaw-instance/chat`

Even when chatting on phone, approvals show there.

---

*Created: 2026-02-06*
