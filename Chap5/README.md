# [tempMap] 5. 지도위에 overlay하기
#Project/tempMap

Chap4에서는 4 격자위에서만 그렸지만 여기서는 여러 격자에서 Bilinear Interpolation하게 된다. 원리는 WindMap의 Chap5와 동일하니 참고하기 바란다.

완성본 사진이다.
[image:E85A1254-63A0-4354-A308-04D28AF198D2-1666-00001D5E973DC80E/스크린샷 2021-02-03 오후 10.10.08.png] [image:CC1DC940-0AD3-43A0-946D-ABD72BC27432-1666-00001D6026C6DC1A/스크린샷 2021-02-03 오후 10.10.15.png] [image:6816C2E8-9060-4553-A25B-6CEF27848932-1666-00001D65F09315E4/스크린샷 2021-02-03 오후 10.10.40.png] [image:B54F40A1-BC1C-49E9-8596-4A430B3D43B3-1666-00001D633CE3427B/스크린샷 2021-02-03 오후 10.10.28.png]

우선 Chap2를 통해 GridData를 얻었다는것을 알고있다.
이번챕터에서는 전체화면을 10 * 10 pixel로 전부 채울것이다.

---
1. 지도의 dom의 x, y에서 lat, lng 구하기
->
2. 구한 lat, lng가 해당하는 grid 찾기
->
3. 구한 grid에서 해당 lat, lng의 보간값 구하기 (bilinear interpolation)
->
4. 얻은 보간값으로 픽셀 색칠하기.
---
위와같은 순서로 진행된다.






## dom의 x,y 에서 lat,lng 구하기
```javascript
var point = new kakao.maps.Point(x, y)
var latitude = coordinate.coordsFromContainerPoint(point).Ma
var longitude = coordinate.coordsFromContainerPoint(point).La
```


## 2. lat, lng 가 해당하는 grid 구하기
```javascript
function selectGrid(latitude, longitude) {
    var gridlng = Math.floor(((longitude * 10 - minlng * 10) / (gap * 10)));		//계산을 위해 10을 곱함
    var gridlat = Math.floor(((maxlat * 10 - latitude * 10) / (gap * 10)));
    return [gridlat, gridlng]
}
```
특정 위.경도가 해당하는 grid를 구하는 메소드는 windmap이랑 동일하다.
`현재 경도 - 최소 경도(boundary) / gap`
ex) min : 126, current : 129, gap : 0.5 = 6
즉 grid의 6번열 이라는 의미이다.

## 3. 해당 grid에서 lat, lng의 보간값 구하기 (bilinear interpolation)
```javascript
function getValue(x, y) {
    var point = new kakao.maps.Point(x, y)
    var latitude = coordinate.coordsFromContainerPoint(point).Ma
    var longitude = coordinate.coordsFromContainerPoint(point).La
    if (latitude <= minlat || latitude >= maxlat) return 10 
    if (longitude <= minlng || longitude >= maxlng) return 10

    var gridn = selectGrid(latitude, longitude);                            // 현재 벡터에서 그리드 계산
    var g00 = grid[gridn[0]][gridn[1]]
    var g10 = grid[gridn[0]][gridn[1] + 1]
    var g01 = grid[gridn[0] + 1][gridn[1]]
    var g11 = grid[gridn[0] + 1][gridn[1] + 1]
    // 현재 좌표를 감싸는 네(4) 그리드 계산

    return interpolate(latitude, longitude, g00, g10, g01, g11, gridn)
    // return getRandomArbitrary(20,20);
}


//위도와 경도를 가지고 적절한 그리드 리턴 (경도 0.25 단위 , 위도 0.25 단위로 쪼개어져 있음.)
function selectGrid(latitude, longitude) {

    var gridlng = Math.floor(((longitude * 10 - minlng * 10) / (gap * 10)))
    var gridlat = Math.floor(((maxlat * 10 - latitude * 10) / (gap * 10)))

    return [gridlat, gridlng]
}

//위도 경도. 그리드로 보간값 계산
var interpolate = function (latitude, longitude, g00, g10, g01, g11, gridn) {
    var x = (longitude % gap) * (1 / gap)

    var d1 = x
    var d2 = 1 - x

    var x1_vector_x
    var x2_vector_x
    try {
        x1_vector_x = d1 * g10[2] + d2 * g00[2]
        x2_vector_x = d1 * g11[2] + d2 * g01[2]
    } catch (error) {
        debugger;
    }
    var y = (latitude % gap) * (1 / gap)
    var d4 = y
    var d3 = 1 - y
    var result_vector_x = d3 * x2_vector_x + d4 * x1_vector_x
    return result_vector_x                //보간값 리턴
}
```


## 얻은 보간값으로 픽셀 색칠하기.
```javascript
function drawCanvas() {
    var g = 0;
    var r = 0;
    var pixelGap = 10
    var maxValue = 50;
    var minValue = 10;
    var centerValue = (maxValue + minValue) / 2;
    var value = 0;
    for (var i = 0; i < canvas.height / pixelGap; i++) {
        for (var j = 0; j < canvas.width / pixelGap; j++) {
            var x = pixelGap * j;
            var y = pixelGap * i;
            value = getValue(x, y);
            if (value > centerValue) {
                r = 255;
                g = 255 - ((value - centerValue) / (maxValue - centerValue)) * 255
            } else {
                g = 255;
                r = 255 * ((value - minValue) / (centerValue - minValue))
            }
            // r = 255;
            // g = 255 - ((value - minValue) / (maxValue - minValue)) * 255
            ctx.fillStyle = "rgb(" + r + "," + g + ",0)"
            ctx.fillRect(x, y, pixelGap, pixelGap);
        }
    }
}
```



