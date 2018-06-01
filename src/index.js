import {register} from 'babel-core'
import polyfill from 'babel-polyfill'
import bot from 'methods'
import store from './reducer';
import { sendIfttt } from './utils/utils';
import config from './config'

bot.run()
.catch(async(err)=>{
  console.log(`Global Error ${err}`)
  const record = utils.removeProperty(store.getState(), 'config')
  await sendIfttt(
    `${config.mode} - ${config.symbol} - ${error.message}`,
    JSON.stringify(record),
  )
  process.exit(1)
})