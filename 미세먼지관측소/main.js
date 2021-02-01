

import { data } from './data.js';
var gap = 0.3

console.log(data)
var container = document.getElementById('map');                 //지도를 그릴 element
var options = {
    center: new kakao.maps.LatLng(33.450701, 126.570667),
    level: 9
};                                                              //지도의 설정 정보

var map = new kakao.maps.Map(container, options);               // 맵 객체 생성

var mapProjection = map.getProjection()
var point;

var drawnStation = []
for (var i = 0; i < data.length; i++) {
    var content = `
                <div class ="label">                                                    
                    ${data[i].pm10Value}<br>                                            
                </div>
            `;

    // 커스텀 오버레이가 표시될 위치입니다 
    var position = new kakao.maps.LatLng(data[i].latitude, data[i].longitude);

    // 커스텀 오버레이를 생성합니다
    var customOverlay = new kakao.maps.CustomOverlay({
        position: position,
        content: content
    });

    if (noStationAround(data[i].latitude, data[i].longitude)) {
        customOverlay.setMap(map);
        drawnStation.push(data[i])
    }
}

function noStationAround(latitude, longitude){  
    var x0 = parseFloat(longitude) - gap;
    var x1 = parseFloat(longitude) + gap;
    var y0 = parseFloat(latitude) + gap;
    var y1 = parseFloat(latitude) - gap;


    for (var i = 0; i < drawnStation.length; i++){
        if (y0 > drawnStation[i].latitude && y1 < drawnStation[i].latitude){
            if (x0 < drawnStation[i].longitude && x1 > drawnStation[i].longitude){
                return false;
            }
        }
    }
    return true;
}



function countAppearStation(){ 
    var appearStation = []
    var count = 0;
    for (var i = 0; i < drawnStation.length; i++){
        if (appearOnScreen(drawnStation[i].latitude, drawnStation[i].longitude)) {
            appearStation.push(drawnStation[i])
            count++
        }
    }
    console.log(count);
    console.log(appearStation)
}


function appearOnScreen(latitude, longitude){
    var x0 = 0;
    var y0 = 0;

    var x1 = window.innerWidth;
    var y1 = window.innerHeight;


    var coordinate = map.getProjection()
    var point00 = new kakao.maps.Point(x0, y0)
    var point11 = new kakao.maps.Point(x1, y1)



    if (latitude > coordinate.coordsFromContainerPoint(point11).Ma && latitude < coordinate.coordsFromContainerPoint(point00).Ma){
        if (longitude < coordinate.coordsFromContainerPoint(point11).La && longitude > coordinate.coordsFromContainerPoint(point00).La){            
            return true;
        }
    }
    return false;
}

kakao.maps.event.addListener(map, 'dragend', () => {
    countAppearStation();
})

