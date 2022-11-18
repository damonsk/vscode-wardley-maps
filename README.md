# Wardley Maps for Visual Studio Code

Adds the ability to render and edit Wardley Maps within Visual Studio Code.  This extention leverages the engine from OnlineWardleyMaps.com and therefore all maps created using OnlineWardleyMaps are compatible with this extension and vice-versa.

## Supported Formats

`*.wm`, `*.owm`

## How to install

Launch VS Code Quick Open (<kbd>CTRL</kbd>+<kbd>P</kbd> / <kbd>CMD</kbd>+<kbd>P</kbd>), paste the following command, and press enter.

`ext install damonsk.vscode-wardley-maps`

## Features

This initial release brings with it basic syntax highlighting for Wardley Maps and the ability to render the map within VSCode.  From the Command Palette select 

`Wardley Maps: Display Map`

Auto completions and snippets accessible by pressing <kbd>CTRL</kbd>+<kbd>Space</kbd>
 in `*.wm`, `*.owm` file. 

 <kbd>CTRL</kbd>+<kbd>Click</kbd> within the Map to quick link components (see May Release Note below).

## Example Maps

To understand the capabilities and features available from this extension, clone the following repository which contains example maps - <https://github.com/damonsk/wardley-maps-examples>

## Usage
A list of all commands can be found [here](./usage.md)

## Known Issues

Only one map can be rendered at any given time, we'll look to address with future release.

## Release Notes

## May 2021 - (Version 1.0.12)

# Quality of Life Improvements

## Quick Adding Components 

Until today, the only way to add new map components is via the editor.  This QoL improvement will allow you to double click anywhere on the map to quickly place a component.  Key bindings are present, Press Enter to add or Escape to cancel.

## Quick Linking Components

Until today, the only way to link components was via the editor.  This QoL improvement will allow you to click and point to create a new link.  To do this, first press CTRL or CMD if MacOS.  You'll notice component that can be linked will have a blue drop shadow.  Whilst keeping CTRL/CMD pressed, Click the component and begin to move your mouse.  You'll notice a line will start to draw.  Next, go to the compoent you'd like to connect (whilst keeping CTRL/CMD pressed) and finally click to complete the link.

1. Press and hold CTRL/CMD throughout the process.
2. Click the start component.
3. Move your mouse to the end component.
4. Click the end component.
5. Release CTRL/CMD.
6. Done.

At any point, you can release CTRL/CMD and the linking process will cancel.

![Display Code Snippets](https://docs.onlinewardleymaps.com/assets/qol-may-2021.gif)

# Bugfixes

A small bug presented itself when dragging/dropping components (the maptext was not correctly updated with new coordinates) when the first line of the maptext was either a comment or blank line

### 0.0.6

Added in `ecosystem` components. Improved layout.

### 0.0.6

Added in intellisense/auto completions, snippets and improved code highlighting.  Auto completions accessible via <kbd>CTRL</kbd>+<kbd>Space</kbd>.

### 0.0.1

Initial release of Wardley Maps.

**Enjoy!**