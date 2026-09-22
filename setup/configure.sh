#!/usr/bin/env bash
# Compiles the window-geometry daemon and installs a LaunchAgent so it runs at login.
CFG="${CFG:-$HOME/.config/widgetsuite}"; DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"; mkdir -p "$CFG"
PL="$HOME/Library/LaunchAgents/com.widgetsuite.windowd.plist"
if command -v swiftc >/dev/null 2>&1; then
  if swiftc -O -framework AppKit -framework Network "$DIR/windowd.swift" -o "$CFG/windowd" 2>/tmp/windowd-build.log; then
    echo "    compiled $CFG/windowd"
    mkdir -p "$HOME/Library/LaunchAgents"
    cat > "$PL" <<EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0"><dict>
  <key>Label</key><string>com.widgetsuite.windowd</string>
  <key>ProgramArguments</key><array><string>$CFG/windowd</string></array>
  <key>RunAtLoad</key><true/>
  <key>KeepAlive</key><true/>
  <key>StandardErrorPath</key><string>/tmp/windowd.log</string>
</dict></plist>
EOF
    launchctl bootout "gui/$(id -u)" "$PL" >/dev/null 2>&1 || true
    if launchctl bootstrap "gui/$(id -u)" "$PL" 2>/dev/null; then echo "    daemon running as LaunchAgent com.widgetsuite.windowd"; else echo "    could not start the LaunchAgent; run $CFG/windowd manually"; fi
  else
    echo "    compile failed; see /tmp/windowd-build.log. The pet will use the 2-second fallback."
  fi
else
  echo "    swiftc not found (xcode-select --install). The pet will use the 2-second fallback snapshot."
fi
