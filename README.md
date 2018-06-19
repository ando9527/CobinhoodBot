# Cobinhood Bot V2
This is version 2 cobinhood bot, the primary changed is communication go through websocket.

# UML

[Bid]( https://goo.gl/64YsAu )

[Ask]( https://goo.gl/1j7z2X )


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

// Cancel Order
{"h":["order","2","u","0"],"d":["74a4c4f8-c637-4bb7-a2dc-bf24bfsafdsa","1527984639089","1527985606251","ETH-USDT","cancelled","cancelled","ask","591.64","0","0.035","0"]}

// Order partially filled
{"h":["order","2","u","0"],"d":["17e7de41-6adb-4695-901f-308d2becc64b","1528271149364","","MFG-ETH","partially_filled","executed","ask","0.0000334","0.0000334","9000","4173.15793413"]}
```
### Order
```json
{"h":["order","2","u","0"],"d":["45df1042-74ad-4076-b381-8d016a78e5e8","1528783171573","","ABT-ETH","partially_filled","executed","ask","0.0012799","0.0012799","326","77.261"]}
```


### Error message 
```javascript
// Unknown error
{"h":["modify-order-undefined","2","error","4021","balance_locked"],"d":[]}
{["order","2","u","0"],"d":["6136e360-da2c-4f7e-bcc9-d938d878a6c0","1529438496388","","FSN-ETH","open","modify_rejected","bid","0.0000001","0","50","0"]}}
```

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