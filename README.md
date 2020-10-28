# Wardley Maps for Visual Studio Code

[![Mentioned in Awesome Wardley Maps](https://awesome.re/mentioned-badge-flat.svg)](https://github.com/wardley-maps-community/awesome-wardley-maps#apps)

Adds the ability to render and edit Wardley Maps within Visual Studio Code.  This extention leverages the engine from OnlineWardleyMaps.com and therefore all maps created using OnlineWardleyMaps are compatible with this extension and vice-versa.

## Supported Formats

`*.wm`, `*.owm`

## How to install

Launch VS Code Quick Open (Ctrl+P), paste the following command, and press enter.

`ext install damonsk.vscode-wardley-maps`

## Features

This initial release brings with it basic syntax highlighting for Wardley Maps and the ability to render the map within VSCode.  From the Command Palette select 

`Wardley Maps: Display Map`.

## Example Maps

To understand the capabilities and features available from this extension, clone the following repository which contains example maps - <https://github.com/damonsk/wardley-maps-examples>

## Known Issues

Only one map can be rendered at any given time, we'll look to address with future release.

## Release Notes

Here is a brief change history for the extention 

### 0.0.1

Initial release of Wardley Maps.

**Enjoy!**

---

## Developing this extension

This extension requires a package (`wmlandscape`) to generated from <https://github.com/damonsk/onlinewardleymaps>

    yarn package