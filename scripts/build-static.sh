#!/usr/bin/env bash
# ============================================================================
# Statischer Export (GitHub Pages / Capacitor).
#
# Die App enthält 15 API-Routen (KI-Funktionen), die mit `output: 'export'`
# nicht kompatibel sind. Für den statischen Build werden sie temporär
# entfernt und danach wiederhergestellt. next.config.ts verzweigt über
# NEXT_PUBLIC_STATIC_EXPORT=1 in den Export-Modus (mit Hinweis-Banner in der
# App, dass Server-Funktionen in dieser Variante fehlen).
# ============================================================================
set -euo pipefail

BACKUP_DIR="$(mktemp -d)"
RESTORE_API=0

cleanup() {
  if [ "$RESTORE_API" -eq 1 ]; then
    rm -rf src/app/api
    cp -r "$BACKUP_DIR/api" src/app/api
    echo "[build-static] API-Routen wiederhergestellt."
  fi
  rm -rf "$BACKUP_DIR"
}
trap cleanup EXIT

if [ -d src/app/api ]; then
  echo "[build-static] API-Routen sichern und entfernen ..."
  cp -r src/app/api "$BACKUP_DIR/api"
  rm -rf src/app/api
  RESTORE_API=1
fi

echo "[build-static] Statischen Export erstellen (NEXT_PUBLIC_STATIC_EXPORT=1) ..."
NEXT_PUBLIC_STATIC_EXPORT=1 npx next build

echo "[build-static] Fertig. Ausgabe liegt in ./out/"
