import {register} from 'babel-core'
import polyfill from 'babel-polyfill'
import bot from 'methods'
import store from './reducer';
import { sendIfttt } from './utils/utils';
import config from './config'

bot.run()
.catch(async(error)=>{
  console.log(`Global Error ${error}`)
  console.log(store.getState());
  const record = Object.assign({},store.getState(),{config:null})
  await sendIfttt(
    `${config.mode} - ${config.symbol} - ${error.message}`,
    JSON.stringify(record),
  )
  process.exit(1)
})