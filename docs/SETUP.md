# window-pet: setup

1. Run `./install.sh`. It copies the widget into Übersicht, compiles
   `setup/windowd.swift` to `~/.config/widgetsuite/windowd`, and installs a
   LaunchAgent so the daemon runs at login.
2. Refresh Übersicht (menu bar icon → Refresh All). The pet drops in from the
   top of the screen.
3. Optionally pick a palette in `~/.config/widgetsuite/window-pet.json`.
4. Optionally install the [Agent Fleet](https://github.com/jke48222/agent-fleet-widget) widget for moods.

See the [README](../README.md) for what the widget shows and how it decides.
