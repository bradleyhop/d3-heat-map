<script>
import * as d3 from 'd3';

export default {
  name: 'HeatMap',

  data() {
    return {
      // api provided by freeCodeCamp
      dataURL:
      'https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json',
      heatData: undefined, // placeholder for fetch'ed data
      baseTemperature: undefined, // placeholder for text interpolation in graph description
      widthChart: 1350, // width of #heatmap svg
      heightChart: 600, // height of #heatmap svg
      legendWidth: 1350 / 3, // width of #legend; a third of width of chart
      padding: 80, //  general padding for chart
      paddingTop: 20, // padding on top
      paddingBottom: 70, // room for the legend at bottom of svg and map axis label
      paddingLeft: 15, // room for map y axis label
      wordMonths: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August',
        'September', 'October', 'November', 'December'],
      // 10 count divergent color swatch for temp colors:
      // Divergent color scheme started as RdYlBu from https://observablehq.com/@d3/color-schemes
      // Colors converted to material design palate using https://materialmixer.co/
      colorBand: ['#283593', '#5c6bc0', '#80cbc4', '#b2dfdb', '#e0f7fa', '#fff9c4', '#ffe082',
        '#ffb74d', '#ff7043', '#d32f2f', '#b71c1c'],
    };
  },

  created() {
    fetch(this.dataURL)
      .then((response) => response.json())
      .then((data) => {
        // store obj within vue
        this.heatData = data.monthlyVariance; // array of data
        this.baseTemperature = data.baseTemperature; // base temp
      })
      .then(() => this.graphInit())
      .catch((error) => console.log(error));
  },

  methods: {
    // called by mounted() after async data is successfully fetch'ed
    graphInit() {
      const minTemp = d3.min(this.heatData, (d) => this.baseTemperature + d.variance);
      const maxTemp = d3.max(this.heatData, (d) => this.baseTemperature + d.variance);

      // choose element to draw our svg
      const svg = d3.select('#heatmap')
        .append('svg')
        .attr('width', this.widthChart)
        .attr('height', this.heightChart);

      /*
       * SCALES
       */

      // setup scale on x-axis (year)
      const xScale = d3.scaleTime()
      // minus and plus one year to give padding for the data
        .domain([
          d3.min(this.heatData, (d) => d.year),
          d3.max(this.heatData, (d) => d.year + 1),
        ])
        .range([
          this.padding + this.paddingLeft,
          this.widthChart - this.padding,
        ]);

      // setup scale on y-axis (months)
      const yScale = d3.scaleBand()
        .domain(
          // twelve months, must set up numbered array for scaleBand
          this.wordMonths.map((m) => this.wordMonths.indexOf(m)),
        )
        .range([
          this.paddingTop,
          this.heightChart - this.padding - this.paddingBottom,
        ]);

      // assign colors to a range between two numbers
      const colorScale = d3.scaleThreshold()
        .domain(this.stepScaleArr(
          minTemp,
          maxTemp,
          this.colorBand.length,
        ))
        .range(this.colorBand);

      /*
       * GROUPS
       */

      // axis generator with no comma in the tick labels (year)
      const xAxis = d3.axisBottom(xScale)
        .ticks(20) // to get every ten years
        .tickFormat(d3.format('d')); // no comma in year

      // axis generator for y-axis
      const yAxis = d3.axisLeft(yScale)
        .tickFormat((d, i) => this.wordMonths[i]); // replace given  numbers with names of months

      // svg group for the mapping of data; helps keep data graphics separate from axis
      const map = svg.append('g')
        .attr('class', 'map');

      // function declaration for tooltip div element
      const divTool = d3.select('#heatmap')
        .append('g')
        .style('opacity', 0);

      /*
       * DRAW
       */

      // draw x-axis
      svg.append('g')
        .attr('transform', `translate(0,
          ${this.heightChart - this.padding - this.paddingBottom})`)
        .attr('id', 'x-axis') // project requirement
        .call(xAxis);

      // draw y-axis
      svg.append('g')
        .attr('transform', `translate(${this.padding + this.paddingLeft}, 0)`)
        .attr('id', 'y-axis') // project requirement
        .call(yAxis);

      // draw data points as rectangles with tooltip popup on mouseover
      map.selectAll('rect')
        .data(this.heatData)
        .enter()
        .append('rect')
        .attr('class', 'cell') // project requirement
        .attr('x', (d) => xScale(d.year))
        // months given in numeric value, convert to array value
        .attr('y', (d) => yScale(d.month - 1))
        // divide visible width of chart by the length of data / number of months in a year;
        //  take into account padding on both sides!
        .attr('width', (this.widthChart - this.padding - this.padding)
          / (this.heatData.length / this.wordMonths.length))
        // divide visible height of chart by number of months in a year
        .attr('height', (this.heightChart - this.padding - this.paddingTop - this.paddingBottom) / 12)
        // color based on temp
        .attr('fill', (d) => colorScale(this.baseTemperature + d.variance))
        // next three attributes are project requirements
        .attr('data-year', (d) => d.year)
        .attr('data-month', (d) => d.month - 1) // project wanting array-style counting?!
        .attr('data-temp', (d) => d3.format('0.2f')(this.baseTemperature + d.variance))
        // hover to show value with tooltip as defined in divTool above
        .on('mouseover', (event, d) => {
          divTool
            .style('opacity', 1)
            .style('display', 'flex') // to align items vertically in css; also display
            .attr('id', 'tooltip') // project requirement
            .attr('class', 'tooltip')
            .attr('data-year', d.year) // project requirement
            .html(`<p>
              <span class="toolHeading">${d.year} - ${this.wordMonths[d.month - 1]}</span><br/>
              <span>Temp: ${d3.format('0.2f')(this.baseTemperature + d.variance)}&deg;</span><br/>
              <span>Variance: ${d3.format('0.2f')(d.variance)}&deg;</span>
            </p>`)
            // funky offsets here because of setting .heatmap to display: relative;
            .style('top', `${event.pageY - 80}px`)
            .style('left', `${event.pageX - 55}px`);
        })
        .on('mouseout', () => {
          divTool
            .style('opacity', 0)
            .style('display', 'none');
        });

      /*
       * LEGEND
       */

      // Using https://bl.ocks.org/mbostock/4573883 to help build the legend scale
      const legend = svg.append('g')
        .attr('id', 'legend'); // project requirement

      const legendScale = d3.scaleLinear()
        .domain([
          minTemp,
          maxTemp,
        ])
        .range([
          0,
          this.legendWidth,
        ]);

      const legendAxis = d3.axisBottom(legendScale)
        .tickSize(30)
        // add min temp to label range b/c not in domain
        .tickValues([d3.format('0.2f')(minTemp)].concat(colorScale.domain()))
        .tickFormat(d3.format('0.2f'));

      // draw legend axis
      legend.attr('transform',
        `translate(${this.padding + this.paddingLeft},
          ${this.heightChart - this.paddingTop - 70})`)
        .call(legendAxis);

      legend.selectAll('rect')
      // see for explanation:
      //  https://stackoverflow.com/questions/48161257/understanding-invertextent-in-a-threshold-scale
        .data(colorScale.range().map((color) => {
          const d = colorScale.invertExtent(color);
          // to set lowest range
          if (d[0] === undefined) d[0] = d3.format('0.2f')(minTemp);
          // to set highest range
          if (d[1] === undefined) d[1] = d3.format('0.2f')(maxTemp);
          return d;
        }))
        .enter()
        .append('rect')
        .attr('class', 'legend-cell')
        .attr('x', (d) => legendScale(d[0]))
        .attr('width', (d) => legendScale(d[1]) - legendScale(d[0]))
        .attr('height', 20)
        // deviating from example because this works
        .attr('fill', (d, i) => this.colorBand[i]);

      /*
       * AXIS LABELS
       */

      // x-axis label
      svg.append('text')
        .attr('class', 'axis-label')
        .attr('text-anchor', 'end')
        .attr('x', this.widthChart / 2) // center ;)
        .attr('y', this.heightChart - this.padding - 30) // pushes text down
        .text('YEAR');

      // y-axis label
      svg.append('text')
        .attr('class', 'axis-label')
        .attr('text-anchor', 'end')
        .attr('x', -200) // higher negative value pushes text down
        .attr('y', 30) // higher positive value pushes text to the right
        .attr('transform', 'rotate(-90)') // vertical text
        .text('MONTH');

      // legend-axis label
      svg.append('text')
        .attr('class', 'axis-label')
        .attr('text-anchor', 'end')
        .attr('x', (this.widthChart / 3))
        .attr('y', this.heightChart - 30)
        .text('Temperature Variance in Degrees Celcius');
    },

    // Takes in the minimum and maximum of a range of numbers; count is the number of steps between
    //  each value; returns an array with length of count starting with the min and ending with the
    //  max.
    stepScaleArr(min, max, count) {
      const arr = [];
      const step = (max - min) / count;
      const base = min;
      for (let i = 1; i < count + 1; i += 1) {
        arr.push(d3.format('0.2f')(base + i * step));
      }
      return arr;
    },

  },
};
</script>

<template>
  <div class="container-heatmap">
    <h2
      id="description"
      class="chart-title">
      1753 - 2015<br/>
      Base Temperature: {{ baseTemperature }}&deg;C
    </h2>
    <div
      id="heatmap"
      class="heatmap">
    </div>
  </div>
</template>

<style lang="scss">
/*
 * NB: Do not scope this component's style! D3 won't be able to see it!?!?!
 */

.chart-title {
  color: $text-gray;
  font-family: Roboto, Helvetica, Arial, sans-serif;
  margin-bottom: 0;
}

// axis markers
.tick {
  color: $text-gray;
  font-family: "Open Sans", sans-serif;
}

.cell:hover {
  outline: 1px solid #000;
}

.axis-label {
  font-size: 0.8rem;
  font-style: italic;
  font-family: Roboto, Helvetica, sans-serif;
}

.legend-text {
  font-size: 0.9rem;
}

.tooltip {
  align-items: center;
  background: $mouseover;
  border-radius: 5px;
  border-style: none;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23);
  color: $mouseover-text;
  font-family: Roboto, Helvetica, Arial, sans-serif;
  font-size: 13px;
  padding: 0.5rem 0.6rem;
  position: absolute;

  & .toolHeading {
    font-weight: bold;
  }
}
</style>
