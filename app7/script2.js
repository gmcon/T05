// Configuración del gráfico
const width = 300;
const height = 300;
const margin = { top: 20, right: 20, bottom: 50, left: 60 };

// Crear SVG con márgenes
const svg = d3.select("#chart")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom);

// Añadir fondo blanco que cubre toda el área, incluidos márgenes
svg.append("rect")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .attr("fill", "white");

// Añadir grupo para el gráfico con márgenes
const chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

// Datos iniciales para el gráfico
let data = [{ intensity: fieldIntensity, direction: Math.random() * 10 }];

// Escaladores
const xScale = d3.scaleLinear().domain([0, 10]).range([0, width]);
const yScale = d3.scaleLinear().domain([0, 10]).range([height, 0]);

// Ejes
const xAxis = d3.axisBottom(xScale);
const yAxis = d3.axisLeft(yScale);

// Agregar los ejes al gráfico
chartGroup.append("g")
    .attr("transform", `translate(0,${height})`)
    .call(xAxis);

chartGroup.append("g")
    .call(yAxis);

// Etiquetas
chartGroup.append("text")
    .attr("text-anchor", "middle")
    .attr("x", width / 2)
    .attr("y", height + margin.bottom - 10)
    .text("Intensidad")
    .style("font-size", "12px");

chartGroup.append("text")
    .attr("text-anchor", "middle")
    .attr("x", -height / 2)
    .attr("y", -margin.left + 20)
    .attr("transform", "rotate(-90)")
    .text("Dirección")
    .style("font-size", "12px");

// Función para actualizar el gráfico
function updateChart(intensity) {
    // Agregar nuevo punto de datos
    const newDirection = Math.random() * 10;
    data.push({ intensity: intensity, direction: newDirection });

    // Mantener solo los últimos 20 datos
    if (data.length > 20) data.shift();

    // Actualizar escalas
    xScale.domain([0, d3.max(data, d => d.intensity)]);
    yScale.domain([0, d3.max(data, d => d.direction)]);

    // Unir datos a los puntos
    const points = chartGroup.selectAll("circle").data(data);

    // Entrar y agregar nuevos puntos
    points.enter()
        .append("circle")
        .attr("cx", d => xScale(d.intensity))
        .attr("cy", d => yScale(d.direction))
        .attr("r", 5) // Radio del punto
        .attr("fill", "steelblue");

    // Actualizar posiciones de los puntos existentes
    points.transition()
        .duration(750)
        .attr("cx", d => xScale(d.intensity))
        .attr("cy", d => yScale(d.direction));

    // Salir y eliminar puntos que ya no son necesarios
    points.exit().remove();
}

// Event listener para actualizar el gráfico cuando se cambie la intensidad
document.getElementById("intensity").addEventListener("input", function (e) {
    updateChart(e.target.value);
});
