# Cobinhood Bot
## Installation
$ git clone https://bitbucket.org/uselessmining/cobinhood_bot

$ yarn global add pm2

$ yarn install

$ yarn build

### default location is  ./env_config/bid/bid-bdg.json
$ mv sample_config env_config

There is a config sample in root folder 

$ cd ./env_config/bid && mv bid-sample.json bid-bdg.json && cd ../../  

$ node bot.js bid-bdg && pm2 logs bid-bdg

*$ pm2 logs bid-bdg

*$ pm2 status

*$ pm2 delete bid-bdg

*$ pm2 kill

### Other
*$ viso

edit ~/.bashrc and source ~/.bashrc

## Recommend conemu install

https://sourceforge.net/projects/conemu/

## Structure

### BID MODE UML
[Bid]( https://goo.gl/64YsAu )

### ASK MODE UML
[Ask]( https://goo.gl/1j7z2X )

### TODO

node -r dotenv/config ./dist/cmd dotenv_config_path=./env_config/bid/ins.env

### Configuration Translate
### Bid Mode

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
### Ask Mode
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
