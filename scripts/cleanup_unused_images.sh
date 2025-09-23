#!/usr/bin/env bash
# Cleanup unused images in images/ by scanning project files for references.
# Usage:
#   bash scripts/cleanup_unused_images.sh           # dry run (shows what would be deleted)
#   bash scripts/cleanup_unused_images.sh --apply   # actually deletes unused images
#
# Safe by default (dry-run). Scans *.html, *.css, *.js for "images/<file>" or "<basename>".

set -euo pipefail

APPLY=0
if [[ "${1:-}" == "--apply" || "${1:-}" == "-y" ]]; then
  APPLY=1
fi

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
IMAGES_DIR="${ROOT_DIR}/images"

if [[ ! -d "${IMAGES_DIR}" ]]; then
  echo "images/ directory not found at: ${IMAGES_DIR}"
  exit 1
fi

# Collect content files to scan (exclude heavy/irrelevant dirs)
mapfile -t CONTENT_FILES < <(
  find "${ROOT_DIR}" -type f \( -name "*.html" -o -name "*.css" -o -name "*.js" \) \
    -not -path "${ROOT_DIR}/.git/*" \
    -not -path "${ROOT_DIR}/node_modules/*" \
    -not -path "${ROOT_DIR}/scripts/*" \
    -not -path "${IMAGES_DIR}/*"
)

if [[ ${#CONTENT_FILES[@]} -eq 0 ]]; then
  echo "No content files (*.html, *.css, *.js) found. Exiting to avoid accidental deletions."
  exit 0
fi

TOTAL=0
KEPT=0
REMOVED=0

echo "Scanning for unused images in: images/"
echo "Mode: $([[ ${APPLY} -eq 1 ]] && echo DELETE || echo DRY-RUN)"

shopt -s nullglob
for IMG_PATH in "${IMAGES_DIR}"/*; do
  [[ -f "${IMG_PATH}" ]] || continue
  BASENAME="$(basename -- "${IMG_PATH}")"

  # Skip non-image/metadata files (we only target common image extensions)
  case "${BASENAME,,}" in
    .ds_store|.gitkeep) continue ;;
    *.png|*.jpg|*.jpeg|*.gif|*.webp|*.svg|*.avif|*.ico) ;;
    *) continue ;;
  esac

  ((TOTAL++))

  # Look for either the relative path or just the basename in case of differing prefixes
  if grep -R -F --quiet -- "images/${BASENAME}" "${CONTENT_FILES[@]}" || \
     grep -R -F --quiet -- "${BASENAME}" "${CONTENT_FILES[@]}"; then
    echo "KEEP   images/${BASENAME}"
    ((KEPT++))
  else
    if [[ ${APPLY} -eq 1 ]]; then
      rm -f -- "${IMG_PATH}"
      echo "DELETE images/${BASENAME}"
      ((REMOVED++))
    else
      echo "DRY    images/${BASENAME}  (unused, would delete)"
      ((REMOVED++))
    fi
  fi
done
shopt -u nullglob

echo "-------------------------------------------"
echo "Total images scanned in images/: ${TOTAL}"
echo "Kept:    ${KEPT}"
echo "$([[ ${APPLY} -eq 1 ]] && echo 'Deleted' || echo 'Would delete'): ${REMOVED}"
echo "-------------------------------------------"
if [[ ${APPLY} -eq 0 ]]; then
  echo "Run: bash scripts/cleanup_unused_images.sh --apply  to actually delete the unused images."
fi
