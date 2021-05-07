import { HeatMap as HeatMap } from './heatmap.js';

window.map = L.map('map').setView([36, 128], 8);
L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png').addTo(map);

var heatmap = new HeatMap()

window.onload = function () {
    heatmap.init();
    heatmap.drawCanvas();
}

document.getElementById('heatmap').addEventListener('click', e => {
    heatmap.toggleHeatMap()
})

window.addEventListener('resize', e => {
    heatmap.drawCanvas();
})

map.on('move', () => {
    heatmap.drawCanvas();
})

