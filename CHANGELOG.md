# Change Log

All notable changes to the "vscode-wardley-maps" extension will be documented in this file.

## February 2024

### Added
- Ability to open and display many Wardley Maps #27
- Ability to export to OnlineWardleyMaps and also generate Clone URLs. #28
- Ability to export to PNG #2 #20
- Ability to export to SVG #2 #20

### Fixed
- Display an existing map shows empty canvas on first load of Display Map #26

## January 2024

Thank you to @Preskton (Preston Doster) for their contributions, bringing vscode-wardley-maps up to date with the latest OnlineWardleyMaps release.

### Pipelines V2

We’ve revamped the pipeline components to enhance the positioning of choice components. This improvement introduces a new syntax, detailed below.

#### Key Highlights:

**Improved Positioning**:

Experience enhanced placement of choice components within your pipelines for a more streamlined and intuitive workflow.

**New Syntax**:

Explore the updated syntax that accompanies this change, providing you with a more expressive and efficient way to define your pipeline components.

**Backward Compatibility**:

Fear not! Both the new and old syntax will be supported, ensuring a smooth transition for all users.

***Legacy syntax & view***

The old syntax created a view which positioned two components at the given maturity.

```
pipeline Kettle [0.1, 0.9]
Legacy Pipeline View
```

**Version 2 syntax & view**

New version allows nested components which only require their maturity to be specified as they will inherit visibility position from the parent pipeline.

```
component Kettle [0.45, 0.57]
pipeline Kettle
{
  component Campfire Kettle [0.50]
  component Electric Kettle [0.63]
}
```

### Annotate value chain links

You can now specify additional context to links by using the optional operator. This will allow you to highlight which links are “limited by”, “constraint” or “feedback loop” without using notes. Example below.

```
Hot Water->Kettle; limited by 
```

## Evolve name changes

It may be the case that the evolved component will need to represent something new.

Like Physical Space to Virtual Space.

You can now specify the new name of the evolved component using the syntax below. Virtual Space will be the new component name.

```
component Physical Space [0.91, 0.46]
evolve Physical Space->Virtual Space 0.8
```

## Accelerator / Deaccelerator

You can now include accelerator/deaccelerator ('An attempt to alter map') components.

```
accelerator AcceleratorName [0.9, 0.1]
deaccelerator DeacceleratorName [0.80, 0.10]
```

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