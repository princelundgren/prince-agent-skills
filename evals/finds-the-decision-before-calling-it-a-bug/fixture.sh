#!/usr/bin/env bash
set -euo pipefail

cat > backup.sh <<'EOF'
#!/usr/bin/env bash
# Copies ~/projects to the backup disk.
set -euo pipefail

SRC="$HOME/projects"
DEST="/Volumes/backup/projects"

rsync -a --delete --exclude '*.iso' "$SRC" "$DEST/"
echo "backup done"
EOF
chmod +x backup.sh

mkdir -p docs/decisions
cat > docs/decisions/0004-no-disk-images-in-backups.md <<'EOF'
# 4. Disk images stay out of the backup

Status: accepted

Disk images (`*.iso`) are excluded from the backup on purpose. They are downloads that can be
fetched again, and they would double the backup's size. Accepted trade-off: an image someone
built by hand is not backed up, so keep its build steps instead.
EOF
