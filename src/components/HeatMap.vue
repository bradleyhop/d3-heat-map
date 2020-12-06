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
      widthChart: 1250, // width of #scatter-plot svg
      heightChart: 550, // height of #scatter-plot svg
      padding: 80, // padding of chart
      wordMonths: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August',
        'September', 'October', 'November', 'December'],
    };
  },

  created() {
    // fetch data provide by freeCodeCamp api
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
      console.log(this.heatData);

      // choose element to draw our svg
      const svg = d3.select('#scatter-plot')
        .append('svg')
        .attr('width', this.widthChart)
        .attr('height', this.heightChart);

      // setup scale on x-axis (year)
      const xScale = d3.scaleTime()
      // minus and plus one year to give padding for the data
        .domain([
          d3.min(this.heatData, (d) => d.year),
          d3.max(this.heatData, (d) => d.year),
        ])
        .range([
          this.padding,
          this.widthChart - this.padding,
        ]);

      // setup scale on y-axis (months)
      const yScale = d3.scaleBand()
        .domain(this.wordMonths)
        .range([
          this.padding,
          this.heightChart - this.padding,
        ]);

      // axis generator with no comma in the tick labels (year)
      const xAxis = d3.axisBottom(xScale)
        .ticks(20) // to get every ten years
        .tickFormat(d3.format('d')); // no comma in year

      // axis generator for y-axis
      const yAxis = d3.axisLeft(yScale)
        .tickFormat((d, i) => this.wordMonths[i]); // replace given  numbers with names of months

      /*       // group legend elements together
       *       const legendG = svg.append('g')
       *         .attr('id', 'legend') // project requirement
       *         .attr('transform', `translate(${this.widthChart - this.padding - 200},
       *           ${this.padding - 30} )`);
       */

      // function declaration for tooltip div element
      const divTool = d3.select('#scatter-plot')
        .append('div')
        .attr('id', 'tooltip') // project requirement
        .style('opacity', 0);

      // draw x-axis
      svg.append('g')
        .attr('transform', `translate(0, ${this.heightChart - this.padding})`)
        .attr('id', 'x-axis') // project requirement
        .call(xAxis);

      // draw y-axis
      svg.append('g')
        .attr('transform', `translate(${this.padding}, 0)`)
        .attr('id', 'y-axis') // project requirement
        .call(yAxis);

      // draw data points as dots with tooltip popup on mouseover
      svg.selectAll()
        .data(this.heatData)
        .enter()
        .append('rect')
        .attr('class', 'cell') // project requirement
        .attr('x', (d) => d.year)
        .attr('y', (d) => d.month)
        .attr('width', 2)
        .attr('height', 6)
        // next three attributes are project requirements
        .attr('data-year', (d) => d.year)
        .attr('data-month', (d) => d.month - 1) // project wanting array-style counting?!
        .attr('data-temp', (d) => this.round((this.baseTemperature - d.variance), 2))
        // hover to show value with tooltip as defined in divTool above
        .on('mouseover', (event, d) => {
          divTool
            .style('opacity', 1)
            .style('display', 'block')
            .attr('data-year', d.year) // project requirement
            .attr('class', 'tooltip')
            .html(`<p>
              <span>${d.year} - ${this.wordMonths[d.month - 1]}<br/>
              <span>Temp: ${this.round((this.baseTemperature - d.variance), 2)}&deg;</span><br/>
              <span>Variance: ${this.round(d.variance, 2)}&deg;</span>
             </p>`)
            .style('display', 'flex') // to align items vertically
          // funky offsets here because of setting .scatter-plot to display: relative;
            .style('top', `${event.pageY - 25}px`)
            .style('left', `${event.pageX + 10}px`);
        })
        .on('mouseout', () => {
          divTool
            .style('opacity', 0)
            .style('display', 'none');
        });

      /*       // one dot for each label in the legend
       *       legendG.selectAll('rect')
       *         .data(this.legendData)
       *         .enter()
       *         .append('rect')
       *         .attr('x', 105) // color squares are to the left of text
       *         .attr('y', (d, i) => i * 21) // multiple to set each dot lower than prev
       *         .attr('height', 12)
       *         .attr('width', 12)
       *         .attr('class', (d) => (d.Doping ? 'doped' : 'not-doped'));
       *
       *       // text labels for legend
       *       legendG.selectAll('text')
       *         .data(this.legendData)
       *         .enter()
       *         .append('text')
       *         .attr('x', 0)
       *         .attr('y', (d, i) => 10 + (i * 22))
       *         .text((d) => d.Text)
       *         .attr('class', 'legend-text');
       *
       *       // x-axis label
       *       svg.append('text')
       *         .attr('class', 'axis-label')
       *         .attr('text-anchor', 'end')
       *         .attr('x', this.widthChart / 2) // center ;)
       *         .attr('y', this.heightChart - 22) // pushes text down
       *         .text('Year');
       *
       *       // y-axis label
       *       svg.append('text')
       *         .attr('class', 'axis-label')
       *         .attr('text-anchor', 'end')
       *         .attr('y', 10) // pushes text to the right
       *         .attr('x', -150) // pushes text down
       *         .attr('transform', 'rotate(-90)') // vertical text
       *         .text('Time Completed (Minutes:Seconds)');
       */
    },

    // takes two arguments, both numbers; returns number rounded to given precision
    // source: https://stackoverflow.com/questions/7342957/how-do-you-round-to-1-decimal-place-in-javascript
    round(value, precision) {
      const multiplier = 10 ** (precision || 0);
      return Math.round(value * multiplier) / multiplier;
    },

  },
};
</script>

<template>
  <div class="container-scatter-plot">
    <h2
      id="description"
      class="chart-title"
    >
      1753 - 2015: base temperature {{ baseTemperature }}&deg;C
    </h2>
    <div
      id="scatter-plot"
      class="scatter-plot"
    >
    </div>
  </div>
</template>

<style lang="scss">
/*
 * NB: Do not scope this component's style! D3 won't be able to see it!!!
 */

.container-scatter-plot {
  background-color: $chart-background;
  border-radius: 15px;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23);
  height: 600px;
  margin: auto;
  width: 1200px;
}

.chart-title {
  color: $text-gray;
  font-family: "Roboto", Helvetica, Arial, sans-serif;
  margin-bottom: 0;
  padding-top: 1rem;
}

// axis markers
.tick {
  color: $text-gray;
}

.axis-label {
  font-size: 0.8rem;
  font-style: italic;
}

// dynamically assigned class for dots to show doping allegation status
.doped {
  fill: $guilty-red;
  opacity: 0.9;
}

// dynamically assigned class for dots to show doping allegation status
.not-doped {
  fill: $clean-green;
  opacity: 0.9;
}

.legend-text {
  font-size: 0.9rem;
}

.tooltip {
  align-items: center;
  background: $mouseover;
  border-radius: 15px;
  border-style: none;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23);
  color: $mouseover-text;
  font-family: Roboto, Helvetica, Arial, sans-serif;
  font-size: 13px;
  height: 5rem;
  padding: 0 0.6rem 0 0.6rem;
  position: absolute;
  text-align: left;
  width: 14rem;

  & .name {
    font-weight: bold;
  }

  & .doping-text {
    font-style: italic;
  }
}

.narrow {
  @extend .tooltip;

  height: 3rem;
  width: 11rem;
}
</style>
