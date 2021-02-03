# [tempMap] 4. 4지점 벡터로 그라데이션 만들기

Demo: http://211.214.35.45:16000/Chap4

Chap3에서는 위에서 아래로의 그라데이션만 그려보았다.
여기서는 4 모퉁이의 value값을 설정해 설정한 value값으로 나타나는 그라데이션을 그려볼 것이다.
windMap의 Chap1과 유사하다.

Chap3과 다른점은 Chap3에서는 value가 행을 지날수록 점진적으로 증가했지만, 여기서는 각 지점에서 bilinear interpolation을 통해 보간값을 구해 그 값을 토대로 픽셀(10 * 10)을 그려낸다.

그러기 위해 추가된 함수, 변수가 있다.

```javascript
var A = [
    { 'x': 0, 'y': 0, 'value': 80},
    { 'x': 1000, 'y': 0, 'value' : 50},
    { 'x': 0, 'y': 1000, 'value' : 20},
    { 'x': 1000, 'y': 1000, 'value' : 80}
]
//4 모퉁이의 value다.

function getValue(vec_x, vec_y) {
    var x = vec_x
    var y = vec_y

    d1 = x - A[0]['x']
    d2 = A[1]['x'] - x

    let x1_val = (d1 / (d1 + d2)) * A[1].value + (d2 / (d1 + d2)) * A[0].value
    
    

    let x1 = { 'x': x, 'y': A[0].y, 'value' : x1_val}
    
    let x2_val = (d1 / (d1 + d2)) * A[3].value + (d2 / (d1 + d2)) * A[2].value
    
    
    let x2 = { 'x': x, 'y': A[3].y, 'value' : x2_val}
    
    d3 = y - x1.y
    d4 = x2.y - y

    result_val = (d3 / (d3 + d4)) * x2_val + (d4 / (d3 + d4)) * x1_val
    return result_val
}
//특정 지점 (x, y) 에서 value를 구하기 위한 보간 함수다.
```

