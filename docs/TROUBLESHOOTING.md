# window-pet: troubleshooting

Run `./check.sh` first; it prints a pass/fail line per item.

- **The pet only walks along the bottom of the screen.** The daemon is not running, or windows have no free space above their edges. Check `curl http://127.0.0.1:41727/` prints `windowd ok`; if not, run `./install.sh` again and look at `/tmp/windowd.log`.
- **install.sh says swiftc is missing.** Run `xcode-select --install`, then `./install.sh` again. Until then the fallback snapshot is used.
- **It vanishes.** It is behind a window. Move the window and it is still there; that is the point.
- **It moves a beat late while I drag a window.** The fallback is in use (see the first item).
- **Wrong screen.** The widget picks the display whose size matches its own layer; on mixed-size multi-monitor setups it prefers the main display.
