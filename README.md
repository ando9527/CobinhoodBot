# Cobinhood Bot V2
This is version 2 cobinhood bot, the primary changed is using websocket.

# UML

[Bid Orders Logic](https://mermaidjs.github.io/mermaid-live-editor/#/edit/eyJjb2RlIjoiZ3JhcGggVERcblhbRmluYWwgQ29uZmlybWF0aW9uPGJyLz5NYWtlIHN1cmUgdGhlIHByaWNlIGlzIHJpZ2h0LiBdIC0tPiBZe0NvbmZpcm0gdGhlIG1pbmltYWwgcHJvZml0IDxici8-Q29uZmlybSB0aGUgcHJpY2Ugb2YgIHVuZGVyIGxpbWl0IDxici8-Q29uZmlybSBkZWFsIGlzIGdlbmVyYWwgcHJpY2UgdG8gdGhlIHRoaXJkIG1hcmtldH1cblktLT4gfFlFU3xaW0RvIG5vdGhpbmddXG5ZLS0-fE5PfFphW0FsZXJ0IC8gU3RvcCBpbnN0YW5jZV1cblxuQVtHZXQgYWxsIHRoZSBwcmljZSBvZiBiaWQgb3JkZXIgaW50byBvbmUgcG9vbCBdIC0tPiBMW1JlbW92ZSB0aGUgZHVzdCBwcmljZSBvcmRlcl0gXG5MIC0tPiBKW1JlbW92ZSB0aGUgcHJpY2UgdW5kZXIgcHJvZml0XVxuSiAtLT4gQltSZW1vdmUgdGhlIHByaWNlIHdheSBoaWdoZXIgdGhhbiB0aGlyZCBtYWtyZXRdXG5CIC0tPiBLW0NvbmZpcm0gdGhlIHByaWNlIG9mIG9yZGVycyB1bmRlciBsaW1pdF1cbksgLS0-IEh7Q29uZmlybSB0aGUgY3VycmVudCBvcmRlciBzdGlsbCBpbiBwb29sfSBcbkggLS0-IHxOT3xFXG5ILS0-ICB8WUVTfEN7VmVyaWZ5IGN1cnJlbnQgb3JkZXIgaXMgaGlnaGVzdCBwcmljZX1cbkMgLS0-IHxZRVN8RFtWZXJpZnkgY3VycmVudCBvcmRlciBuZWVkIHRvIGJlIGNoYW5nZWRdXG5EIC0tPiB8WUVTfCBGW2xvd2VyIHBpcmNlXVxuRCAtLT4gfE5PfCBHW1RvIHRoZSBmaW5hbCBjb25maXJtYXRpb24uXVxuQy0tPiB8Tk98RVtiZSB0aGUgaGlnaGVzdCBwcmljZV1cblxuIiwibWVybWFpZCI6eyJ0aGVtZSI6ImRlZmF1bHQifX0)

[Ask Orders Logic]( https://goo.gl/1j7z2X ) (obsolete)


# Configuration Translate
Bid mode

```json

{
  "apps": [
    {
      "name": "bid-bdg", 設定名稱
      "script": "dist/index.js",
      "autorestart": false,
      "args": [
        "--color"
      ],
      "env": {
        "NODE_ENV": "production",
        "BOT_API_SECRET": "", 金鑰
        "BOT_WATCH_ONLY": "false", 觀察者模式
        "BOT_INTERVAL_SECOND": "180", 排程秒數，每X秒做一次動作
        "BOT_IFTTT_ENABLE": "true", IFTTT通知設定
        "BOT_IFTTT_KEY": "",
        "BOT_IFTTT_EVENT": "cbb", 
        "BOT_ASSET_TYPE": "eth", 資產類型
        "BOT_PRODUCT_TYPE": "bdg", 產品類型
        "BOT_MODE": "bid", 模式
        "BOT_QUANTITY_COMPARE_PERCENTAGE": "20", 掛單總資產比較和移動 單位百分比
        "BOT_OP_PERCENTAGE": "10", 大盤價格標準10% = 範圍容許大盤價格110%內
        "BOT_TOTAL_PRICE_LIMIT": "0.2", 此單總價格不可以超過此資產數量
        "BOT_BUY_ORDER_ID": "", 不需設定
        "BOT_PROFIT_LIMIT_PERCENTAGE": "10" 限制利潤百分比
      },
      "env_production": {}
    }
  ]
}

```
Ask Mode
```json
{
  "apps": [
    {
      "name": "ask-ngc", 設定名稱
      "script": "dist/index.js",
      "autorestart": false,
      "no_daemon": true,
      "args": [
        "--color"
      ],
      "env": {
        "NODE_ENV": "production",
        "BOT_API_SECRET": "", 金鑰
        "BOT_WATCH_ONLY": "false", 觀察者模式
        "BOT_INTERVAL_SECOND": "180", 排程秒數，每X秒做一次動作
        "BOT_IFTTT_ENABLE": "true", IFTTT通知設定
        "BOT_IFTTT_KEY": "",
        "BOT_IFTTT_EVENT": "cbb",
        "BOT_ASSET_TYPE": "eth", 資產類型
        "BOT_PRODUCT_TYPE": "ngc", 產品類型
        "BOT_MODE": "ask", 模式
        "BOT_SELL_ORDER_ID": "", 不需設定
        "BOT_QUANTITY_COMPARE_PERCENTAGE": "20", 掛單總資產比較和移動 單位百分比
        "BOT_PROFIT_LIMIT_PERCENTAGE": 5, 限制利潤百分比
        "BOT_PRODUCT_COST": "0.0009706" 成本
      },
      "env_production": {}
    }
  ]
}
```

# Websocket message
### Orderbook
```javascript
// Orderbook
​​​​​{"h":["order-book.ABT-ETH.1E-7","2","u"],"d":{"bids":[["0.0013309","1","1620.38"]],"asks":[]}}​​​​​
{
  "h": ["order-book.HQX-ETH.1E-7", "2", "s"],
  "d": {
    "bids": [
      ["0.0000414", "1", "1000"],
      ["0.0000413", "1", "9711.75"],
      ["0.0000412", "1", "17620.57645631"],
      ["0.000041", "1", "1000"],
      ["0.0000408", "1", "979"],
      ["0.0000406", "1", "1916"],
      ["0.0000405", "1", "3000"],
      ["0.0000401", "1", "11541.471"],
      ["0.00004", "1", "13027.21375"],
      ["0.0000395", "1", "5160"],
      ["0.0000394", "1", "19949.23857868"],
      ["0.0000393", "1", "12368.956743"],
      ["0.0000382", "2", "18709.09476438"],
      ["0.0000381", "1", "16924.92283464"],
      ["0.000038", "2", "4605.63157895"],
      ["0.0000362", "4", "12402"],
      ["0.0000361", "1", "16094.18288444"],
      ["0.000036", "1", "9100"],
      ["0.0000355", "1", "700"],
      ["0.0000342", "1", "8500"],
      ["0.0000341", "1", "822.61484376"],
      ["0.0000335", "2", "4000"],
      ["0.0000311", "1", "8500"],
      ["0.000031", "1", "20000"],
      ["0.0000296", "1", "836"],
      ["0.0000278", "1", "5000"],
      ["0.0000277", "1", "20000"],
      ["0.0000236", "1", "836"],
      ["0.0000202", "1", "5000"],
      ["0.0000192", "1", "2000"],
      ["0.0000191", "1", "20000"],
      ["0.000018", "1", "900"],
      ["0.0000168", "1", "10000"],
      ["0.0000167", "1", "1000"],
      ["0.0000064", "1", "6547.26515625"],
      ["0.0000063", "1", "25000"],
      ["0.0000059", "2", "1672"],
      ["0.0000058", "3", "2508"],
      ["0.0000036", "3", "2508"],
      ["0.0000035", "1", "25869.56522458"],
      ["0.0000024", "1", "15046.24877083"],
      ["0.0000023", "1", "48338.29662156"],
      ["0.0000016", "1", "18332.2618125"],
      ["0.0000015", "1", "57451.12476067"],
      ["0.0000012", "1", "18055.498525"],
      ["0.0000011", "1", "20000"],
      ["0.000001", "1", "14444.39882"],
      ["0.0000009", "1", "200000"],
      ["0.0000006", "1", "80980.00000043"]
    ],
    "asks": [
      ["0.0000426", "1", "10516.5791"],
      ["0.0000429", "1", "12034.5339"],
      ["0.000043", "1", "8700"],
      ["0.0000441", "1", "2000"],
      ["0.0000444", "1", "1410"],
      ["0.0000445", "1", "3000"],
      ["0.0000449", "1", "22429.38962273"],
      ["0.000045", "1", "1000"],
      ["0.0000453", "1", "2051"],
      ["0.0000455", "1", "10000"],
      ["0.0000456", "1", "10000"],
      ["0.0000458", "1", "40786.02271258"],
      ["0.0000461", "1", "840"],
      ["0.0000462", "2", "5911"],
      ["0.0000465", "2", "60511"],
      ["0.000047", "1", "10000"],
      ["0.0000489", "1", "1000.00000001"],
      ["0.000049", "1", "8504.29716505"],
      ["0.0000495", "1", "1000"],
      ["0.0000499", "2", "11243.61399548"],
      ["0.00005", "2", "15000"],
      ["0.000051", "1", "6690"],
      ["0.0000514", "2", "6819"],
      ["0.0000519", "1", "1000"],
      ["0.000052", "1", "1624.70495496"],
      ["0.000053", "1", "1750"],
      ["0.0000534", "2", "1672"],
      ["0.0000536", "1", "6000"],
      ["0.0000537", "1", "1736"],
      ["0.0000538", "3", "3008"],
      ["0.0000539", "1", "836"],
      ["0.000054", "1", "5000"],
      ["0.0000545", "1", "836"],
      ["0.0000549", "1", "5000"],
      ["0.000055", "7", "26238"],
      ["0.0000552", "1", "688.88168352"],
      ["0.0000555", "2", "3000"],
      ["0.0000557", "1", "2000"],
      ["0.000056", "1", "1000"],
      ["0.0000566", "1", "5000"],
      ["0.0000568", "1", "1000"],
      ["0.0000572", "1", "364.99962522"],
      ["0.0000575", "1", "901"],
      ["0.0000577", "1", "836"],
      ["0.0000578", "1", "836"],
      ["0.0000579", "3", "4736"],
      ["0.000058", "5", "15623"],
      ["0.0000582", "1", "4002"],
      ["0.0000589", "1", "1800"],
      ["0.000059", "2", "5900"],
      ["0.0000595", "2", "15998"],
      ["0.0000598", "1", "2153.9996292"],
      ["0.0000599", "1", "11802.3093636"],
      ["0.00006", "16", "44957.18039578"],
      ["0.0000601", "1", "6000"],
      ["0.0000607", "1", "1600"],
      ["0.000061", "3", "14520.29875668"],
      ["0.0000616", "1", "2023.62008762"],
      ["0.000062", "4", "14200.2434572"],
      ["0.0000621", "1", "3000"],
      ["0.0000622", "1", "1000"],
      ["0.0000625", "1", "9000"],
      ["0.0000628", "1", "6000"],
      ["0.0000636", "5", "11413"],
      ["0.000064", "1", "1550"],
      ["0.0000648", "1", "926.83318284"],
      ["0.000065", "2", "3501"],
      ["0.0000654", "1", "1500"],
      ["0.000066", "1", "44485.39444176"],
      ["0.0000663", "1", "5336"],
      ["0.0000664", "1", "18000"],
      ["0.0000672", "1", "20000"],
      ["0.0000674", "1", "2300"],
      ["0.0000686", "1", "6555.96077679"],
      ["0.0000699", "1", "2089.09644319"],
      ["0.00007", "13", "23557"],
      ["0.0000777", "1", "5023"],
      ["0.0000779", "1", "30279.87117795"],
      ["0.00008", "2", "4441.96078432"],
      ["0.0000803", "1", "5858"],
      ["0.0000871", "1", "1132.12812794"],
      ["0.0000874", "1", "3380"],
      ["0.0000909", "1", "5260.02889144"],
      ["0.0000924", "1", "2500"],
      ["0.0000925", "1", "2547.308675"],
      ["0.0000929", "1", "3244.31801801"],
      ["0.0000995", "1", "1000"],
      ["0.0000999", "1", "8151.51515151"],
      ["0.0001", "4", "12897.24005293"],
      ["0.0001495", "1", "810"],
      ["0.0001499", "1", "4500"],
      ["0.00015", "1", "100000"],
      ["0.000151", "1", "5000"],
      ["0.00019", "1", "1215"],
      ["0.0002", "1", "5000"],
      ["0.0002099", "1", "10000"],
      ["0.00021", "1", "5000"],
      ["0.00022", "1", "5000"],
      ["0.00023", "1", "5000"],
      ["0.00024", "1", "5000"],
      ["0.00025", "1", "5000"],
      ["0.00044", "1", "5000"],
      ["0.0007495", "1", "810"],
      ["0.0009998", "1", "5000"],
      ["0.001", "1", "810"],
      ["0.009999", "1", "5000"]
    ]
  }
}
```



```javascript
// Cancel Order
{"h":["order","2","u","0"],"d":["74a4c4f8-c637-4bb7-a2dc-bf24bfsafdsa","1527984639089","1527985606251","ETH-USDT","cancelled","cancelled","ask","591.64","0","0.035","0"]}

// Order partially filled
{"h":["order","2","u","0"],"d":["17e7de41-6adb-4695-901f-308d2becc64b","1528271149364","","MFG-ETH","partially_filled","executed","ask","0.0000334","0.0000334","9000","4173.15793413"]}
```
### Order
```json
{"h":["order","2","u","0"],"d":["45df1042-74ad-4076-b381-8d016a78e5e8","1528783171573","","ABT-ETH","partially_filled","executed","ask","0.0012799","0.0012799","326","77.261"]}
```


## Error message
### Balance locked 
```javascript
{"h":["modify-order-undefined","2","error","4021","balance_locked"],"d":[]}
```
### Modify rejected
```javascript
{"h":["order","2","u","0"],"d":["6136e360-da2c-4f7e-bcc9-d938d878a6c0","1529438496388","","FSN-ETH","open","modify_rejected","bid","0.0000001","0","50","0"]}
```
### Order filled
```javascript
 {"h":["order","2","u","0"],"d":["4bcf1133-18df-4517-85f9-a1b92ef7d3d0","1528335379002","1529452889470","BEE-ETH","filled","executed","bid","0.0000462","0.0000462","4300","4300"]}
 {"h":["order","2","u","0"],"d":["9dd05bb9-9d0c-4745-b7c7-b08bc38019d1","1529422784241","1529424981918","LYM-ETH","filled","executed","ask","0.000122","0.0001226370680111","5000","5000"]}
```

### Order Canceled
```javascript
 {"h":["order","2","u","0"],"d":["306d755b-ceb7-47f8-801d-4ac58b8fb04d","1528933311735","1529316981529","HQX-ETH","cancelled","cancelled","bid","0.0000403","0.0000451","7000","836"]}
  {"h":["order","2","u","0"],"d":["961cf7e9-a145-4a29-95d2-d252c1692c0b","1529186590761","1529187794446","MFG-ETH","cancelled","cancelled","ask","0.0000283","0.0000283","4300","3000"]}
```

### Partially filled modified
```javascript
{"id":"1e1f5dd1-cc9d-4c47-b0b8-c6145eb6812b","timestamp":1529582634489,"trading_pair_id":"LALA-ETH","state":"partially_filled","event":"modified","side":"ask","price":0.0000716,"eq_price":0.0000643,"size":3480,"filled":1050.324}
```

### Event

opened: order placed.
modified: order modified.
executed: order executed/matched.
triggered: conditional order been triggered.
cancelled: order cancelled.
cancel_pending: server is processing cancelation.
cancel_rejected: cancel request is rejected.
modify_rejected: modify request is rejected.
execute_rejected: rejected while executing.
trigger_rejected: rejected while triggering.


### State
queued
open
partially_filled
filled
cancelled
pending_cancellation
rejected
triggered
pending_modification

### Event format
```javascript
const id = order[0]
const timestamp = parseFloat(order[1])
const trading_pair_id = order[3]
const state = order[4]
const event = order[5]
const side = order[6]
const price = parseFloat(order[7])
const eq_price = parseFloat(order[8])
const size = parseFloat(order[9])
const filled = parseFloat(order[10]
)
```

### Pending Modification
```javascript
 {"h":["","2","u","0","modify-order-1e1f5dd1-cc9d-4c47-b0b8-c6145eb6812b"],"d":["1e1f5dd1-cc9d-4c47-b0b8-c6145eb6812b","1529582634489","","LALA-ETH","pending_modification","","ask","0.0000708","0.0000643","3480","1050.324"]}
```

### Modify order
```javascript
 {"h":["order","2","u","0"],"d":["1e1f5dd1-cc9d-4c47-b0b8-c6145eb6812b","1529582634489","","LALA-ETH","partially_filled","modified","ask","0.0000708","0.0000643","3480","1050.324"]}
```

 ### getCurrentOrder
```javascript
 {"id":"1e1f5dd1-cc9d-4c47-b0b8-c6145eb6812b","trading_pair_id":"LALA-ETH","side":"ask","type":"limit","price":0.0000599,"size":3480,"filled":1050.324,"state":"partially_filled","timestamp":"1529582634489","eq_price":0.0000643,"completed_at":null}
 ```

### Send without ws connection
```javascript
 2018-06-23 14:23:17.9210 error: Error: UNMET_ERROR_MESSAGE Raw onMessage: {"h":["","2","error","4005","invalid_payload"],"d":[]}
 ```
