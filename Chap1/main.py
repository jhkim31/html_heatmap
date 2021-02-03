import requests
from pprint import pprint
import xmltodict
import json
import time

data = requests.get('http://openapi.airkorea.or.kr/openapi/services/rest/MsrstnInfoInqireSvc/getMsrstnList?serviceKey=yt0l1Mg%2FKtX60m%2B69cYQn%2BOIKLJEq3NMxGQDtVon3JJMgJMV4aRyIEChiBKM1Gi6EzwmOeP1dNQRSRTlPg9cvg%3D%3D&numOfRows=556&pageNo=1')
dicts = xmltodict.parse(data.text)
jsons = json.loads(json.dumps(dicts))

jsonData = jsons['response']['body']['items']['item']
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
    try:
        pmData = requests.get('http://apis.data.go.kr/B552584/ArpltnInforInqireSvc/getMsrstnAcctoRltmMesureDnsty?serviceKey=yt0l1Mg%2FKtX60m%2B69cYQn%2BOIKLJEq3NMxGQDtVon3JJMgJMV4aRyIEChiBKM1Gi6EzwmOeP1dNQRSRTlPg9cvg%3D%3D&returnType=json&numOfRows=1&pageNo=1&stationName=' + str(tmp['stationName']) + '&dataTerm=DAILY&ver=1.0')
        if pmData.json()['response']['body']['items'][0]['pm10Flag'] == None or pmData.json()['response']['body']['items'][0]['pm10Value'] != '-':
            tmp['pm10Value'] = pmData.json()['response']['body']['items'][0]['pm10Value']
            tmp['pm25Value'] = pmData.json()['response']['body']['items'][0]['pm25Value']
            returnData.append(tmp)
    except:
        pass
        
    





now = time.localtime()

fileName = "%04d.%02d.%02d.%02d.00.미세먼지데이터.txt" % (now.tm_year, now.tm_mon, now.tm_mday, now.tm_hour)


 
with open('/Users/jhkim_mac/Desktop/ketiProject/temperatureMap/미세먼지데이터/' + fileName, 'w', encoding = "UTF-8-sig") as f:
    f.write(json.dumps(returnData, ensure_ascii=False))
    f.close()
    
