#!/usr/bin/env bash
# /team-agents --panes helper — peek at tmux panes and map to agents
# Usage: bash ~/.claude/skills/team-agents/scripts/panes.sh [team-name]

TEAM_NAME="${1:-}"
SESSION=$(tmux display-message -p '#S' 2>/dev/null)

if [ -z "$SESSION" ]; then
  echo "Not in a tmux session — pane view unavailable"
  exit 0
fi

# Get pane count
PANE_COUNT=$(tmux list-panes -t "$SESSION" | wc -l)

# Load team members if team name given
MEMBERS=""
if [ -n "$TEAM_NAME" ]; then
  TEAM_CONFIG="$HOME/.claude/teams/$TEAM_NAME/config.json"
  if [ -f "$TEAM_CONFIG" ]; then
    MEMBERS=$(python3 -c "
import json
config = json.load(open('$TEAM_CONFIG'))
for m in config.get('members', []):
    print(m['name'])
" 2>/dev/null)
  fi
fi

MEMBER_COUNT=$(echo "$MEMBERS" | grep -c . 2>/dev/null || echo 0)

echo ""
echo "🖥 Team Panes — $SESSION ($PANE_COUNT panes)"
echo ""
echo "  Pane  Size      Model        Ctx    Agent        Status"
echo "  ───── ───────── ──────────── ────── ──────────── ──────────"

TEAM_IDX=0
for i in $(seq 0 $((PANE_COUNT - 1))); do
  # Get pane size
  SIZE=$(tmux list-panes -t "$SESSION" -F "#{pane_index} #{pane_width}x#{pane_height}" 2>/dev/null | awk -v idx="$i" '$1==idx {print $2}')

  # Capture last 3 lines for status
  CAPTURE=$(tmux capture-pane -t "$SESSION:0.$i" -p 2>/dev/null | tail -3)

  # Extract model
  MODEL=$(echo "$CAPTURE" | grep -oP '(Opus|Sonnet|Haiku) [0-9.]+' | head -1)
  [ -z "$MODEL" ] && MODEL="unknown"

  # Extract context percentage
  CTX=$(echo "$CAPTURE" | grep -oP 'ctx \d+%' | head -1 | sed 's/ctx //')
  [ -z "$CTX" ] && CTX=$(echo "$CAPTURE" | grep -oP '\d+%' | tail -1)
  [ -z "$CTX" ] && CTX="?"

  # Determine status
  if echo "$CAPTURE" | grep -q '^❯'; then
    STATUS="idle"
  else
    STATUS="working"
  fi

  # Map agent name
  if [ "$i" -eq 0 ]; then
    AGENT="team-lead"
    STATUS="← YOU"
  elif [ -n "$MEMBERS" ] && [ "$TEAM_IDX" -lt "$MEMBER_COUNT" ]; then
    # Map team agents to highest pane numbers (they spawn last)
    FIRST_TEAM_PANE=$((PANE_COUNT - MEMBER_COUNT))
    if [ "$i" -ge "$FIRST_TEAM_PANE" ]; then
      AGENT_IDX=$((i - FIRST_TEAM_PANE))
      AGENT=$(echo "$MEMBERS" | sed -n "$((AGENT_IDX + 1))p")
      [ -z "$AGENT" ] && AGENT="(other)"
    else
      AGENT="(other)"
    fi
  else
    AGENT="(other)"
  fi

  printf "  %-5s %-9s %-12s %-6s %-12s %s\n" "$i" "$SIZE" "$MODEL" "$CTX" "$AGENT" "$STATUS"
done

echo ""
if [ -n "$TEAM_NAME" ]; then
  TEAM_PANES=$((MEMBER_COUNT))
  OTHER_PANES=$((PANE_COUNT - 1 - TEAM_PANES))
  echo "  Team: $TEAM_NAME | Agents: $TEAM_PANES/$((PANE_COUNT-1)) panes | Non-team: $OTHER_PANES"
else
  echo "  💡 Pass team name: bash panes.sh <team-name>"
fi
echo ""
