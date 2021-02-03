# tempMap 1. 미세먼지 api 받아오기
#Project/tempMap



TemperatureMap을 사용해, 우리나라 미세먼지를 Overlay하는 프로젝트이다.
TemperatureMap에 관한 내용만을 볼려면, Chap3부터 보는것을 추천
api는 공공데이터 포털의 데이터를 사용한다.

## 측정소 정보 api
[측정소 리스트](https://www.data.go.kr/iim/api/selectAPIAcountView.do)
* url : http://openapi.airkorea.or.kr/openapi/services/rest/MsrstnInfoInqireSvc/getMsrstnList
* parameter
	* serviceKey : ###
	* numOfRows: 한페이지 결과수 (default 10)
	* pageNo: 페이지 번호 (default 1)
	* addr : 주소, 해당 주소의 측정소 리턴(없으면 모든 측정소 리턴)
	* stationName: 측정소 이름, 해당 이름이 포함된 측정소 리턴(없으면 모든 측정소 리턴)
ex)`http://openapi.airkorea.or.kr/openapi/services/rest/MsrstnInfoInqireSvc/getMsrstnList?numOfRows=566&pageNo=1&serviceKey=yt0l1Mg%2FKtX60m%2B69cYQn%2BOIKLJEq3NMxGQDtVon3JJMgJMV4aRyIEChiBKM1Gi6EzwmOeP1dNQRSRTlPg9cvg%3D%3D`

전국에 있는 측정소의 리스트를 받아오는 api이다.
측정소는 총 566개 정도 있고, 파라미터로 쿼리값(주소, 이름)을 넘기지 않으면, 모든 측정소 리스트가 출력된다. (numOfRows : 566, pageNo: 1)로 

측정소 정보로는
* 측정소 이름
* 주소
* 년도
* 제공기관
* 사진
* 지도
* manageName
* 측정가능한 요소
* latitude
* longitude
가 있다.
[image:C41C0600-2903-46F0-81D6-B98F6A952772-1666-00000D25E40B2C44/스크린샷 2021-02-03 오후 5.02.04.png]
**측정소 정보 리스트를 가져오는 이유는 2가지 이다**

1. 후에 기술할 특정 측정소에서는 한번에 한 측정소의 실시간 측정정보 조회를 조회할 수 있기 때문에 모든 측정소의 정보를 얻기 위해서는 모든 측정소의 이름이 필요하다. 
2. 측정소의 위치 정보(lat, lng)를 알기 위해서

이제 해당 api로 모든 측정소의 정보를 받아왔으니, 측정소 마다 실시간 측정정보를 얻을 수 있다.




## 측정소 실시간 측정정보 조회 api
[측정소 실시간 조회](https://www.data.go.kr/tcs/dss/selectApiDataDetailView.do?publicDataPk=15073861)
* url: http://apis.data.go.kr/B552584/ArpltnInforInqireSvc/getMsrstnAcctoRltmMesureDnsty
* parameter
	* serviceKey: ##
	* returnType: json, xml
	* numOfRows, pageNo: 동일, 만약 가장 최근의 하나만 조회하고 싶으면 1, 1로 세팅할것
	* stationName: 조회하려는 측정소 이름
	* dataTerm: DAILY, MONTH, 3MONTH 요청 데이터 기간 1일, 1개월, 3개월
	* ver: 버전별 상세 결과 참고 1.0

ex)`http://apis.data.go.kr/B552584/ArpltnInforInqireSvc/getMsrstnAcctoRltmMesureDnsty?serviceKey=yt0l1Mg%2FKtX60m%2B69cYQn%2BOIKLJEq3NMxGQDtVon3JJMgJMV4aRyIEChiBKM1Gi6EzwmOeP1dNQRSRTlPg9cvg%3D%3D&returnType=xml&numOfRows=1&pageNo=1&stationName=종로구&dataTerm=DAILY&ver=1.0`


리턴정보:
[image:17D3F513-2426-4958-AFCA-4350C362010E-1666-00000F066975BB6D/스크린샷 2021-02-03 오후 5.36.24.png]

특정 측정소의 실시간 정보를 가져오는 api이다
현재부터 원하는 시점까지의 정보가 조회 가능하다.
측정소가 많다보니 측정기가 고장나거나 제대로 측정이 되지 않는 측정소 또한 많이 존재한다. 그런 측정소는 리턴에 Flag를 보면 확인 가능하다.
또한 Flag에는 정상이라고 나오지만, 비정상적인 측정값(ex 음수)을 가지는 측정소 또한 고장난 측정소 이므로 이 두개를 가지고 정상적인 값을 가져오는 측정소만 따로 빼내야 한다.

결과적으로 얻는 데이터
```javascript
{
    "stationName": "반송로", 
    "latitude": "35.234141", 
    "longitude": "128.664624", 
    "item": "SO2, CO, O3, NO2, PM10, PM2.5", 
    "oper": "경상남도보건환경연구원", 
    "addr": "경남 창원시 의창구 원이대로 450(시설관리공단 실내수영장 앞)", 
    "pm10Value": "45", "pm25Value": "26"
}
```

지금까지의 결과를 파이썬 코드로 정리해 보겠다
```python
import requests
from pprint import pprint
import xmltodict
import json
import time
#모듈 선언이다.

data = requests.get('http://openapi.airkorea.or.kr/openapi/services/rest/MsrstnInfoInqireSvc/getMsrstnList?serviceKey=yt0l1Mg%2FKtX60m%2B69cYQn%2BOIKLJEq3NMxGQDtVon3JJMgJMV4aRyIEChiBKM1Gi6EzwmOeP1dNQRSRTlPg9cvg%3D%3D&numOfRows=556&pageNo=1')
dicts = xmltodict.parse(data.text)
jsons = json.loads(json.dumps(dicts))
jsonData = jsons['response']['body']['items']['item']
#측정소 리스트들을 가져와 사용할 수 있게 가공하는 코드다.
returnData = []
tmp = {}
for i in jsonData:
    tmp = {}
    tmp['stationName'] = i['stationName']
    tmp['latitude'] = i['dmX']
    tmp['longitude'] = i['dmY']
    tmp['item'] = i['item']
    tmp['oper'] = i['oper']
    tmp['addr'] = i['addr']
		#모든 측정소의 정보를 Dict 배열로 만든다
    try:
			#여기서 에러(측정값이 없음, 또는 미세먼지를 측정하지 않을 수 있음)가 발생할 수 있으므로 try문을 사용한다.
        pmData = requests.get('http://apis.data.go.kr/B552584/ArpltnInforInqireSvc/getMsrstnAcctoRltmMesureDnsty?serviceKey=yt0l1Mg%2FKtX60m%2B69cYQn%2BOIKLJEq3NMxGQDtVon3JJMgJMV4aRyIEChiBKM1Gi6EzwmOeP1dNQRSRTlPg9cvg%3D%3D&returnType=json&numOfRows=1&pageNo=1&stationName=' + str(tmp['stationName']) + '&dataTerm=DAILY&ver=1.0')
        if pmData.json()['response']['body']['items'][0]['pm10Flag'] == None or pmData.json()['response']['body']['items'][0]['pm10Value'] != '-':
            tmp['pm10Value'] = pmData.json()['response']['body']['items'][0]['pm10Value']
            tmp['pm25Value'] = pmData.json()['response']['body']['items'][0]['pm25Value']
            returnData.append(tmp)
				#특정 측정소의 실시간 데이터를 분석해, 미세먼지, 초미세 먼지 데이터를 정상적으로 모두 가지고 있으면 리턴 배열에 추가한다.
    except:
        pass
# 여기서 코드는, 데이터를 따로 저장하기 위한 코드다.           
now = time.localtime()
fileName = "%04d.%02d.%02d.%02d.00.미세먼지데이터.txt" % (now.tm_year, now.tm_mon, now.tm_mday, now.tm_hour)
with open('/Users/jhkim_mac/Desktop/ketiProject/temperatureMap/미세먼지데이터/' + fileName, 'w', encoding = "UTF-8-sig") as f:
    f.write(json.dumps(returnData, ensure_ascii=False))
    f.close()
```

위의 파이썬 예제에서는 동기로 모든 api호출(500개 가량)을 보내기 때문에 상대적으로 시간이 많이 걸린다. 그렇기 때문에 가능하면 비동기 코드로 바꿔서 실행하는 것을 권장한다.

























