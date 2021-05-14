
// import { data } from "./data.js"
// window.map = L.map('map').setView([36, 128], 8);
// L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png').addTo(map);

// L.marker([36, 127]).addTo(map)
// console.log(data)
// var count = 0;
// data.forEach(data => {    
//     L.marker([36, 127]).addTo(map)
// })

import { HeatMap as HeatMap } from './heatmap.js';
import { data as data } from './data.js'
// fetch('//kiotapi.kweather.co.kr/kmap/dong.api')
window.map = L.map('map').setView([36, 128], 8);
L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png').addTo(map);

var heatmap = new HeatMap()

var count = 0;
window.onload = function () {
    heatmap.init();
    heatmap.drawCanvas();
}

window.addEventListener('resize', e => {
    heatmap.drawCanvas();
})

map.on('move', () => {
    heatmap.drawCanvas();
})

