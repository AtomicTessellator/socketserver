#!/usr/bin/env bash
#
# Apply GitHub rulesets from JSON definitions.
#
# Usage:
#   .github/rulesets/apply.sh                  # dry-run (default)
#   .github/rulesets/apply.sh --apply          # create or update rulesets
#
# Requires: gh CLI authenticated with admin scope on the target repo.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO="$(gh repo view --json nameWithOwner -q .nameWithOwner)"
DRY_RUN=true

if [[ "${1:-}" == "--apply" ]]; then
  DRY_RUN=false
fi

echo "Repository: $REPO"
echo "Mode:       $(if $DRY_RUN; then echo 'DRY RUN'; else echo 'APPLY'; fi)"
echo ""

for ruleset_file in "$SCRIPT_DIR"/*.json; do
  name=$(python3 -c "import json,sys; print(json.load(open('$ruleset_file'))['name'])")
  echo "--- $name ($(basename "$ruleset_file"))"

  existing_id=$(gh api "repos/$REPO/rulesets" --jq ".[] | select(.name == \"$name\") | .id" 2>/dev/null || true)

  payload=$(python3 -c "
import json, sys
r = json.load(open('$ruleset_file'))
r.pop('\$schema', None)
r.pop('_meta', None)
json.dump(r, sys.stdout)
")

  if $DRY_RUN; then
    if [[ -n "$existing_id" ]]; then
      echo "  Would UPDATE (id: $existing_id)"
    else
      echo "  Would CREATE"
    fi
  else
    if [[ -n "$existing_id" ]]; then
      echo "  Updating (id: $existing_id)..."
      echo "$payload" | gh api "repos/$REPO/rulesets/$existing_id" --method PUT --input - > /dev/null
    else
      echo "  Creating..."
      echo "$payload" | gh api "repos/$REPO/rulesets" --method POST --input - > /dev/null
    fi
    echo "  Done."
  fi
  echo ""
done

echo "Finished."
