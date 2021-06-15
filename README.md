# d3-heat-map

[Live Demo Here](https://bradleyhop.github.io/d3-heatmap-build/)

Data Visualization Project for freeCodeCamp.org Data Visualization Project:
Visualize Data with a Heat Map. This implementation uses Vue & D3 as the main technology stacks.

## Project Info

See the [User
Stories](https://www.freecodecamp.org/learn/data-visualization/data-visualization-projects/visualize-data-with-a-heat-map)
for project requirements.

## Testing

freeCodeCamp offers a script that will test each User Story point. To test,
select the testing component, choose 'D3 Heat Map' from the drop-down menu, and
hit 'Run Tests'. Select the 'Tests' button to see details of test.

## Take-Aways

Choosing the appropriate D3 scale method was particularly challenging. I chose
`scaleTime()` for the x-axis since the year data is given as an integer, and D3
can handle that data type without converting it to a `Date()` object. For the
y-axis, I chose `scaleBand()`, which needs an ordered list for the domain.
Creating an array of months in order and giving the index on the months works.

I chose a ten-count divergent color swatch for displaying data ranges: Divergent
color scheme started as RdYlBu from https://observablehq.com/@d3/color-schemes
To make my project seems more professional, I converted the suggested color
swatch to a material design palate using https://materialmixer.co/

My legend show the lowest value and highest values showing the full ranged of
data values. The legend in the demo project did not, which I'm not sure if
that's a standard of these kinds of graphs or not. It made sense to show the
whole range, so there you have it.

As I do more of these D3 projects, I find that I tend to reuse more and more
chunks of code. In future projects, I may further break the project into more
components instead of having the full D3 chart in one vue file; for example, one
vue file for the legend, the other for the axes, one for the drawing of the
data, etc. I think this could even further ease development and make for a more
efficient workflow.
