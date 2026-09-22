# window-pet

> A small robot that lives behind your windows: it stands on their edges, rides them, falls when they close, and sleeps when nothing happens.

[![Release](https://img.shields.io/github/v/release/jke48222/window-pet-widget?label=release)](https://github.com/jke48222/window-pet-widget/releases/latest) [![License: MIT](https://img.shields.io/github/license/jke48222/window-pet-widget)](LICENSE) ![Platform: macOS](https://img.shields.io/badge/platform-macOS-lightgrey)

[Übersicht gallery](https://tracesof.net/uebersicht-widgets/) · [Widget suite](https://github.com/jke48222/widget-suite) · [Download](https://github.com/jke48222/window-pet-widget/releases/latest) · [Setup guide](docs/SETUP.md) · [Troubleshooting](docs/TROUBLESHOOTING.md)

A widget for [Übersicht](http://tracesof.net/uebersicht/). Übersicht draws every
widget behind your app windows, so the pet is a creature of the gaps: it walks
the desktop floor, climbs onto the top edges of windows where nothing covers it,
peeks out from beside them, rides a window while you drag it, and falls when you
close the one under its feet. Leave it alone long enough and it sleeps. If the
[Agent Fleet](https://github.com/jke48222/agent-fleet-widget) widget is installed
it also has moods: busy while agents run, and a small speech bubble when one is
waiting on you.

The sprites are the [WindowPet](https://github.com/jke48222/WindowPet) app's own
frames (MIT), in four palettes. Window geometry comes from `windowd`, a
200-line Swift daemon that `install.sh` compiles for you; it reads window bounds
and z-order only, which needs no permission, and streams them to the widget on
127.0.0.1.

![screenshot](media/screenshot.png)

## Requirements

- macOS with [Übersicht](https://tracesof.net/uebersicht/) installed (`brew install --cask ubersicht`)
- Xcode Command Line Tools for `swiftc` (`xcode-select --install`), so `install.sh` can compile the daemon. Without it the pet still works, on a once-per-two-seconds snapshot
- No macOS permissions: bounds, layer, and PID only, never window titles or contents

## Install

If you don't have Übersicht yet:

```sh
brew install --cask ubersicht
```

**One-click.** Clone the repo and run the installer. It copies the widget into Übersicht's widgets folder, installs any helper scripts, and runs setup if the widget needs it. Safe to re-run.

```sh
git clone https://github.com/jke48222/window-pet-widget.git
cd window-pet-widget && ./install.sh
```

**Manual.** Download `window-pet.widget.zip` from the [latest release](https://github.com/jke48222/window-pet-widget/releases/latest), unzip it, and put the `window-pet.widget` folder in `~/Library/Application Support/Übersicht/widgets/`. Then refresh Übersicht (menu bar icon → Refresh All).

Blank widget? Run `./check.sh` for a pass/fail diagnosis, or see [docs/TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md).

## How it works

- **Platforms.** Every refresh the widget takes the top edge of each window
  and subtracts the parts that any other window would hide, keeping segments
  at least a pet wide. The desktop floor (above the Dock) is always a platform.
- **Physics.** Walking at 58 px/s, jumping with a small arc to a platform in
  reach, falling under gravity onto whatever is below, landing with a bounce.
  Standing on a window means moving with it; if the window vanishes, the pet
  drops.
- **Behavior.** Idle, look around, fidget, blink, walk, jump, sleep, on a
  timer with some randomness. Calm mood sleeps after half a minute of nothing,
  with pixel z's drifting up; landing kicks up a puff of dust; alert mood jumps
  and shows a pixel speech bubble.
- **Geometry.** `windowd` polls `CGWindowListCopyWindowInfo` twenty times a
  second and pushes a snapshot as server-sent events whenever something moved.
  Without it, the widget's command takes a snapshot every two seconds via
  `osascript` and the pet reacts a beat late.

## Configuration

Optional. Create `~/.config/widgetsuite/window-pet.json`:

```json
{ "palette": "sakura", "size": 72, "speed": 1 }
```

Palettes: `midnight`, `sakura`, `seafoam`, `tinplate`. Size is the sprite's
on-screen height in pixels (40 to 160).

## Customization

- Speeds, jump strength, gravity, and the idle timers are constants inside `Engine` in `index.jsx`.
- `setup/windowd.swift` is the daemon; `setup/windows.jxa` is the no-compiler fallback.
- The daemon runs as a LaunchAgent named `com.widgetsuite.windowd`; `launchctl bootout gui/$(id -u) ~/Library/LaunchAgents/com.widgetsuite.windowd.plist` stops it.

## Bundled files

- `window-pet.widget/index.jsx` — the widget
- `window-pet.widget/sprites/` — four palettes of frames
- `window-pet.widget/fonts/` — Press Start 2P for the speech bubble, SIL Open Font License, see `fonts/OFL.txt`
- `setup/windowd.swift` — the geometry daemon
- `setup/windows.jxa` — the fallback snapshot script
- `setup/configure.sh` — compiles the daemon and installs the LaunchAgent
- `install.sh` / `install.command` — one-click installer (copies the widget into Übersicht and installs any helpers)
- `check.sh` — read-only setup diagnostics; prints pass/fail per item

## Related widgets

Part of the [Übersicht Widget Suite](https://github.com/jke48222/widget-suite): 16 widgets that share one design system.

- [Animated Wallpaper](https://github.com/jke48222/animated-wallpaper-widget)
- [Clipboard History](https://github.com/jke48222/clipboard-history-widget)
- [Daily AI Prompt](https://github.com/jke48222/daily-ai-prompt-widget)
- [Daily Astronomy Photo](https://github.com/jke48222/daily-astronomy-photo-widget)
- [Daily Tarot](https://github.com/jke48222/daily-tarot-widget)
- [GitHub Contributions](https://github.com/jke48222/github-contributions-widget)
- [Now Playing](https://github.com/jke48222/now-playing-widget)
- [Recent Album Covers](https://github.com/jke48222/recent-album-covers-widget)
- [Recent Downloads](https://github.com/jke48222/recent-downloads-widget)
- [Rotating 3D Model](https://github.com/jke48222/rotating-3d-model-widget)
- [Spinning Globe](https://github.com/jke48222/spinning-globe-widget)
- [Wallpaper Switcher](https://github.com/jke48222/wallpaper-switcher-widget)
- [Keys & Pads](https://github.com/jke48222/keys-and-pads-widget)
- [Agent Fleet](https://github.com/jke48222/agent-fleet-widget)
- [Pi Fleet](https://github.com/jke48222/pi-fleet-widget)

## License

MIT. See [LICENSE](LICENSE).

## Author

Jalen Edusei <jalen.edusei@gmail.com>
