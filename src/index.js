import {register} from 'babel-core'
import polyfill from 'babel-polyfill'
import bot from 'methods'
bot.run()
.catch(err=>{
  console.log(`Global Error ${err}`)
  process.exit(1)
})