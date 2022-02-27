***

<p align="center">
  <img width="300" src="https://github.com/robinovitch61/hotstuff/blob/main/src/img/thermalmodel-logo.png">
</p>

***

# [thermalmodel.com](https://thermalmodel.com)

TODO:
- [x] Fix bug with dropdowns [5]
- [x] Change shift functionality to command/control (multi select, click and drag) [4]
- [x] Node color is temp [5]
- [x] Add the ability to change the plot/canvas/table size by dragging the borders [5]
- [x] Fix bug with runtime/timesteps not resetting [5]
- [x] More reasonable sig figs in plots (10th of degree) [5]
- [x] Theory explanation section/popup [5]
- [x] Differentiate between conduction and convection just for user tracking. Remove unidirectional option from app. No source/target terminology. [5]
- [x] Deal with math for radiative heat transfer (incomplete/wrong right now?) [5]
- [x] Limits on resizing panels [5]
- [x] Plot margin a percentage of domain rather than fixed val [5]
- [x] Multiple connection types per A <--> B connection (allow all combos except conduction + convection together) [5]
- [x] Clarify radiation resistance formula in theory [5]
- [x] Figure out why control-click not working on windows [5]
- [x] Remove unidirectional from hotstuff-network and standardize away from source/target naming [5]
- [x] Migrate to thermalmodel.com [5]
- [x] Disallow nodes being named the same thing [5]
- [x] Disallow selecting first/second node in connection table to generate duplicate [5]
- [x] Test hotstuff-network to error if identical connections passed in (e.g 2x A-B, conduction)
- [x] Visual validation on cell entries with tooltip describing invalid condition [5]
- [x] Escape or Enter while editing cell exits same as tab [5]
- [x] Limit num points and/or compress appState to not hit limits on localStorage - do not store results in browser, run model before exporting everything [5]
- [x] Handle app errors like too many timesteps [5]
- [x] Make model runtime errors more visible than just in console [4]
- [x] File export/import [5]
- [x] Heat transfer naming conventions correct (a to b, a is hotter than b to start) [5]
- [x] Optional notes field for nodes/connections in table. [5]
- [x] Min widths to table columns, notes unbounded [5]
- [x] Round to nearest 100s rather than 10s for heat transfer [5]
- [x] Visual difference to single, double connection lines amongst cond/conv/rad [5]
- [x] Images instead of emojis for cross-browser/OS compat [5]
- [x] Add info to canvas: [5]
  - [x] Power gen for each node (number in middle)
  - [x] Resistance between nodes (thickness changes with resistance)
- [x] Make node active in canvas when editing in table [5]
- [x] Fix hash pattern drawing over power gen box [5]
- [x] Copy/paste all selected with suffix to avoid nodes being named the same thing [5]
- [x] Tutorial popup instead of tutorial model [5]
- [x] Logo [5]
- [x] Fix clipping of connection lines when Fixed Temp [5]
- [ ] About section [5]
- [ ] Favicon [5]
- [ ] Fun default models [5]
- [ ] Put "Show Example" button in ModalControls header and remove reset [5]
- [ ] Visual glowup [5]:
  - [x] Tabs should scroll horizontally if table scrollable horizontally
  - [x] Weird hover thing in safari when click tabs
  - [ ] Model control panel more organized + responsive
  - [x] General buttons nicer
  - [ ] Add node/connection buttons arrangement
- [ ] Launch!

Future possible stuff:
- [ ] Resistance calculator [4]
  - [ ] Link to engineers edge website
  - [ ] Calculator pops up while editing
- [ ] Horizontal/vertical node position snap functionality for creating grid [1]
- [x] Reset all stored state button (with confirmation) - not important if not the tutorial [1]
