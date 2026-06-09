/* global d3 */

// public/js/charts/traffic-chart.js

// Configuration & Glassmorphism Palette
const margin = { top: 20, right: 20, bottom: 20, left: 20 };
const width = 300 - margin.left - margin.right;
const height = 300 - margin.top - margin.bottom;
const radius = Math.min(width, height) / 2;

// Holographic/Glassmorphic vibrant color palette
const colorScale = d3.scaleOrdinal()
    .domain(['Direct', 'Social', 'Search', 'Referrals'])
    .range(['#ff007f', '#00f0ff', '#7000ff', '#ffaa00']); 

// Create SVG Container
const svg = d3.select("#traffic-chart-container")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${(width + margin.left + margin.right) / 2}, ${(height + margin.top + margin.bottom) / 2})`);

// Define Div for Tooltip (Ensure it has glassmorphism styles in CSS)
const tooltip = d3.select("body")
    .append("div")
    .attr("class", "chart-tooltip")
    .style("opacity", 0)
    .style("position", "absolute")
    .style("pointer-events", "none");

// Setup Pie and Arc generators
const pie = d3.pie()
    .value(d => d.value)
    .sort(null); // Maintain data order

const arc = d3.arc()
    .innerRadius(radius * 0.6) // This creates the donut hole
    .outerRadius(radius * 0.9);

const arcHover = d3.arc()
    .innerRadius(radius * 0.6)
    .outerRadius(radius * 0.95); // Expands slightly on hover

/**
 * Renders or updates the Donut Chart using D3 transitions
 * @param {Array} data - Array of objects: [{ source: 'Direct', value: 120 }, ...]
 */
export function renderChart(data) {
    const totalTraffic = d3.sum(data, d => d.value);

    // Join data to path elements
    const arcs = svg.selectAll(".arc")
        .data(pie(data), d => d.data.source);

    // 1. EXIT old elements
    arcs.exit()
        .transition()
        .duration(500)
        .attrTween("d", arcTweenOut)
        .remove();

    // 2. ENTER new elements
    const arcsEnter = arcs.enter()
        .append("path")
        .attr("class", "arc")
        .attr("fill", d => colorScale(d.data.source))
        .style("stroke", "rgba(255, 255, 255, 0.15)") // Glassmorphic edge
        .style("stroke-width", "2px")
        .style("cursor", "pointer")
        .each(function(d) { this._current = { startAngle: d.startAngle, endAngle: d.startAngle }; }); // Store initial angles

    // 3. MERGE and Update transitions
    arcs.merge(arcsEnter)
        .transition()
        .duration(750)
        .attrTween("d", arcTweenUpdate);

    // Add Interactivity (Hover Effects & Tooltip)
    svg.selectAll(".arc")
        .on("mouseover", function(event, d) {
            d3.select(this)
                .transition()
                .duration(200)
                .attr("d", arcHover)
                .style("filter", "drop-shadow(0px 0px 8px rgba(0, 240, 255, 0.5))");

            const percentage = totalTraffic > 0 ? ((d.data.value / totalTraffic) * 100).toFixed(1) : 0;

            tooltip.transition().duration(200).style("opacity", 1);
            tooltip.html(`
                <strong>${d.data.source}</strong><br/>
                Clicks: ${d.data.value}<br/>
                Share: ${percentage}%
            `);
        })
        .on("mousemove", function(event) {
            tooltip
                .style("left", (event.pageX + 15) + "px")
                .style("top", (event.pageY - 15) + "px");
        })
        .on("mouseleave", function() {
            d3.select(this)
                .transition()
                .duration(200)
                .attr("d", arc)
                .style("filter", "none");

            tooltip.transition().duration(200).style("opacity", 0);
        });
}

// Interpolators for smooth WebSocket animations
function arcTweenUpdate(a) {
    const i = d3.interpolate(this._current, a);
    this._current = i(0);
    return t => arc(i(t));
}

function arcTweenOut(a) {
    const i = d3.interpolate(a, { startAngle: a.endAngle, endAngle: a.endAngle });
    return t => arc(i(t));
}