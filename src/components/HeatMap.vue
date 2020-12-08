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
      widthChart: 1350, // width of #scatter-plot svg
      heightChart: 450, // height of #scatter-plot svg
      padding: 80, // padding of chart
      paddingTop: 20,
      wordMonths: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August',
        'September', 'October', 'November', 'December'],
      // 10 count divergent color swatch for temp colors:
      // Divergent color scheme started as RdYlBu from https://observablehq.com/@d3/color-schemes
      // Colors converted to material design palate using https://materialmixer.co/
      legendColorBand: ['#b71c1c', '#d32f2f', '#ff7043', '#ffb74d', '#ffe082', '#e0f7fa', '#b2dfdb',
        '#80cbc4', '#5c6bc0', '#283593'],
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

      // console.log(this.stepScaleArr(
      // d3.min(this.heatData, (d) => this.baseTemperature + d.variance),
      // d3.max(this.heatData, (d) => this.baseTemperature + d.variance),
      // this.legendColorBand.length,
      // ));

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
      // twelve months, must set up array for scaleBand
        .domain([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11])
        .range([
          this.paddingTop,
          this.heightChart - this.padding,
        ]);

      // axis generator with no comma in the tick labels (year)
      const xAxis = d3.axisBottom(xScale)
        .ticks(20) // to get every ten years
        .tickFormat(d3.format('d')); // no comma in year

      // axis generator for y-axis
      const yAxis = d3.axisLeft(yScale)
        .tickFormat((d, i) => this.wordMonths[i]); // replace given  numbers with names of months

      // function declaration for tooltip div element
      const divTool = d3.select('#scatter-plot')
        .append('div')
        .attr('id', 'tooltip') // project requirement
        .style('opacity', 0);

      // color scale
      const colorScale = d3.scaleThreshold()
        // domain taken from example project
        // .domain([2.8, 3.9, 5.0, 6.1, 7.2, 8.3, 9.5, 10.6, 11.7, 12.8])
        .domain(this.stepScaleArr(
          d3.min(this.heatData, (d) => this.baseTemperature + d.variance),
          d3.max(this.heatData, (d) => this.baseTemperature + d.variance),
          this.legendColorBand.length,
        ))
        // color swatch given warm to cold, reverse
        .range(this.legendColorBand.reverse());

      /*       // group legend elements together
       *       const legendG = svg.append('g')
       *         .attr('id', 'legend') // project requirement
       *         .attr('transform', `translate(${this.widthChart - this.padding - 200},
       *           ${this.padding - 30} )`);
       */

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
        .attr('x', (d) => xScale(d.year))
        // months given in numberic value, convert to array value
        .attr('y', (d) => yScale(d.month - 1))
        // divide visible width of chart by the length of data / number of months in a year
        .attr('width', (this.widthChart - this.padding) / (this.heatData.length / 12))
        // divide visible hieght of chart by number of months in a year
        .attr('height', (this.heightChart - this.padding) / 12)
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
            .attr('data-year', d.year) // project requirement
            .attr('class', 'tooltip')
            .html(`<p>
              <span class="toolHeading">${d.year} - ${this.wordMonths[d.month - 1]}</span><br/>
              <span>Temp: ${d3.format('0.2f')(this.baseTemperature + d.variance)}&deg;</span><br/>
              <span>Variance: ${d3.format('0.2f')(d.variance)}&deg;</span>
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

    // Takes in the minimum and maxiumum of a range of numbers; count is the number of steps between
    //  each value; returns an array with length of count starting with the min and ending with the
    //  max.
    stepScaleArr(min, max, count) {
      const arr = [];
      const step = (max - min) / count;
      // to return an array the size of count
      // const arrSize = count + 1;
      for (let i = 1; i < count + 1; i += 1) {
        arr.push(d3.format('0.2f')(min + i * step));
      }
      return arr;
    },

  },
};
</script>

<template>
  <div class="container-scatter-plot">
    <h2
      id="description"
      class="chart-title">
      1753 - 2015<br/>
      Base Temperature: {{ baseTemperature }}&deg;C
    </h2>
    <div
      id="scatter-plot"
      class="scatter-plot">
    </div>
  </div>
</template>

<style lang="scss">
/*
 * NB: Do not scope this component's style! D3 won't be able to see it!!!
 */

.container-scatter-plot {
  //background-color: $chart-background;
  // border-radius: 15px;
  // box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23);
  // height: 600px;
  // margin: auto;
  //width: 1200px;
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
  padding: 0.5rem 0.6rem;
  position: absolute;

  & .toolHeading {
    font-weight: bold;
  }
}
</style>
