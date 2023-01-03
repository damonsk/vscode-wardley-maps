# Usage 
## To set the title
**Example:**
```
title My Wardley Map
```

------------------------
## To create a component
```
component Name [Visibility (Y Axis), Maturity (X Axis)]
```
**Example:**
```
component Customer [0.9, 0.5]
component Cup of Tea [0.9, 0.5]
```

------------------------
## To create a market
```
market Name [Visibility (Y Axis), Maturity (X Axis)]
```
**Example:**
```
market Customer [0.9, 0.5]
market Cup of Tea [0.9, 0.5]
evolve Customer 0.9 (market)
```

------------------------
## Inertia - component likely to face resistance to change.
```
component Name [Visibility (Y Axis), Maturity (X Axis)] inertia
```
**Example:**
```
component Customer [0.95, 0.5] inertia
component Cup of Tea [0.9, 0.5] inertia
market Cup of Tea [0.9, 0.5] inertia
```
------------------------
## To evolve a component
```
evolve Name (X Axis)
```
**Example:**
```
evolve Customer 0.8
evolve Cup of Tea evolve 0.8
```

------------------------
## To link components
**Example:**
```
Start Component->End Component
Customer->Cup of Tea
```

------------------------
## To indicate flow
**Example:**
```
Start Component+<>End Component
Customer+<>Cup of Tea
```

------------------------
## To set component as pipeline:
```
pipeline Component Name [X Axis (start), X Axis (end)]
```
**Example:**
```
pipeline Customer [0.15, 0.9]
pipeline Customer
```

------------------------
## To indicate flow - past components only
**Example:**
```
Start Component+<End Component
Hot Water+<Kettle
```

------------------------
## To indicate flow - future components only
**Example:**
``` 
Start Component+>End Component
Hot Water+>Kettle
```

------------------------
## To indicate flow - with label
**Example:**
```
Start Component+'insert text'>End Component
Hot Water+'$0.10'>Kettle
```

------------------------
## Pioneers, Settlers, Townplanners area
Add areas indicating which type of working approach supports component development
**Example:**
```
pioneers [<visibility>, <maturity>, <visibility2>, <maturity2>]
settlers [0.59, 0.43, 0.49, 0.63]
townplanners [0.31, 0.74, 0.15, 0.95]
```

------------------------
## Build, buy, outsource components
Highlight a component with a build, buy, or outsource method of execution
**Example:**
```
build <component>
buy <component>
outsource <component>
component Customer [0.9, 0.2] (buy)
component Customer [0.9, 0.2] (build)
component Customer [0.9, 0.2] (outsource)
evolve Customer 0.9 (outsource)
evolve Customer 0.9 (buy)
evolve Customer 0.9 (build)
```

------------------------
## Link submap to a component
Add a reference link to a submap. A component becomes a link to an other Wardley Map
**Example:**
```
submap Component [<visibility>, <maturity>] url(urlName)
url urlName [URL]
submap Website [0.83, 0.50] url(submapUrl)
url submapUrl [https://onlinewardleymaps.com/#clone:qu4VDDQryoZEnuw0ZZ]
```

------------------------
## Stages of Evolution
Change the stages of evolution labels on the map
**Example:**
```
evolution First->Second->Third->Fourth
evolution Novel->Emerging->Good->Best
```

------------------------
## Y-Axis Labels
Change the text of the y-axis labels
**Example:**
```
y-axis Label->Min->Max
y-axis Value Chain->Invisible->Visible
```

------------------------
## Add notes
Add text to any part of the map
**Example:**
```
note Note Text [0.9, 0.5]
note +future development [0.9, 0.5]
```

------------------------
## Available styles
Change the look and feel of a map
**Example:**
```
style wardley
style handwritten
style colour
```

------------------------
