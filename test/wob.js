import test from 'ava'
import { wobMaker } from '../src/reducer/wob';
test.serial('wobMaker', async t => {
  const data = wobMaker()
  t.pass()
})
const orderBook = 
const state = ​​​​​{ bids: ​​​​​
  ​​​​​   [ { price: 0.0001061, count: 4, size: 14418.1836 },​​​​​
  ​​​​​     { price: 0.0001052, count: 1, size: 1248.55688 },​​​​​
  ​​​​​     { price: 0.0000902, count: 4, size: 11490.022 },​​​​​
  ​​​​​     { price: 0.0000901, count: 1, size: 3339.341 },​​​​​
  ​​​​​     { price: 0.00009, count: 1, size: 956.806267 },​​​​​
  ​​​​​     { price: 0.0000888, count: 1, size: 7402.169905 },​​​​​
  ​​​​​     { price: 0.0000873, count: 1, size: 4629.418705 },​​​​​
  ​​​​​     { price: 0.0000853, count: 1, size: 1500 },​​​​​
  ​​​​​     { price: 0.0000852, count: 1, size: 22819.498883 },​​​​​
  ​​​​​     { price: 0.000085, count: 1, size: 20000 },​​​​​
  ​​​​​     { price: 0.000083, count: 1, size: 3000 },​​​​​
  ​​​​​     { price: 0.00008, count: 2, size: 1800 },​​​​​
  ​​​​​     { price: 0.000075, count: 1, size: 1000 },​​​​​
  ​​​​​     { price: 0.0000717, count: 1, size: 3500 },​​​​​
  ​​​​​     { price: 0.0000711, count: 1, size: 1000 },​​​​​
  ​​​​​     { price: 0.000071, count: 1, size: 49193.886724 },​​​​​
  ​​​​​     { price: 0.00007, count: 2, size: 1650 },​​​​​
  ​​​​​     { price: 0.00006, count: 1, size: 800 },​​​​​
  ​​​​​     { price: 0.0000533, count: 1, size: 4000 },​​​​​
  ​​​​​     { price: 0.0000532, count: 1, size: 11076.642492 },​​​​​
  ​​​​​     { price: 0.0000472, count: 1, size: 11000 },​​​​​
  ​​​​​     { price: 0.0000122, count: 1, size: 28844.368847 },​​​​​
  ​​​​​     { price: 0.0000111, count: 1, size: 145416.666665 },​​​​​
  ​​​​​     { price: 0.000011, count: 1, size: 143100 },​​​​​
  ​​​​​     { price: 0.000005, count: 1, size: 11500 },​​​​​
  ​​​​​     { price: 0.0000031, count: 1, size: 30000 },​​​​​
  ​​​​​     { price: 0.000003, count: 1, size: 153900 },​​​​​
  ​​​​​     { price: 0.000002, count: 1, size: 25000 },​​​​​
  ​​​​​     { price: 0.0000016, count: 1, size: 240625 },​​​​​
  ​​​​​     { price: 0.0000011, count: 1, size: 20000 },​​​​​
  ​​​​​     { price: 0.000001, count: 6, size: 390826.65833527 },​​​​​
  ​​​​​     { price: 5e-7, count: 1, size: 80000 },​​​​​
  ​​​​​     { price: 2e-7, count: 3, size: 600000 },​​​​​
  ​​​​​     { price: 1e-7, count: 1, size: 500000 } ],​​​​​
  ​​​​​  asks: ​​​​​
  ​​​​​   [ { price: 0.0001108, count: 4, size: 16666.144 },​​​​​
  ​​​​​     { price: 0.0001119, count: 1, size: 6364.102792 },​​​​​
  ​​​​​     { price: 0.000112, count: 1, size: 500 },​​​​​
  ​​​​​     { price: 0.0001144, count: 1, size: 500 },​​​​​
  ​​​​​     { price: 0.000115, count: 1, size: 2612.217791 },​​​​​
  ​​​​​     { price: 0.00012, count: 3, size: 1692.122773 },​​​​​
  ​​​​​     { price: 0.0001225, count: 1, size: 561.209834 },​​​​​
  ​​​​​     { price: 0.0001232, count: 1, size: 1157.901262 },​​​​​
  ​​​​​     { price: 0.0001236, count: 1, size: 106.117983 },​​​​​
  ​​​​​     { price: 0.0001254, count: 1, size: 4500 },​​​​​
  ​​​​​     { price: 0.0001255, count: 2, size: 3796.14867 },​​​​​
  ​​​​​     { price: 0.0001256, count: 1, size: 418 },​​​​​
  ​​​​​     { price: 0.0001277, count: 1, size: 678.531 },​​​​​
  ​​​​​     { price: 0.0001284, count: 1, size: 11787.30245 },​​​​​
  ​​​​​     { price: 0.0001299, count: 1, size: 1430 },​​​​​
  ​​​​​     { price: 0.00013, count: 2, size: 11824.325104 },​​​​​
  ​​​​​     { price: 0.0001324, count: 1, size: 1888.612608 },​​​​​
  ​​​​​     { price: 0.000133, count: 2, size: 8705.290834 },​​​​​
  ​​​​​     { price: 0.0001335, count: 1, size: 2820.562402 },​​​​​
  ​​​​​     { price: 0.000135, count: 2, size: 1689.712 },​​​​​
  ​​​​​     { price: 0.0001393, count: 1, size: 5000 },​​​​​
  ​​​​​     { price: 0.0001399, count: 1, size: 367 },​​​​​
  ​​​​​     { price: 0.00014, count: 4, size: 14045.048447 },​​​​​
  ​​​​​     { price: 0.0001434, count: 1, size: 730 },​​​​​
  ​​​​​     { price: 0.0001449, count: 1, size: 2000 },​​​​​
  ​​​​​     { price: 0.00015, count: 6, size: 9758.020342 },​​​​​
  ​​​​​     { price: 0.0001525, count: 1, size: 375 },​​​​​
  ​​​​​     { price: 0.000155, count: 1, size: 1148 },​​​​​
  ​​​​​     { price: 0.00016, count: 1, size: 15000 },​​​​​
  ​​​​​     { price: 0.0001685, count: 2, size: 975 },​​​​​
  ​​​​​     { price: 0.0001699, count: 1, size: 3000 },​​​​​
  ​​​​​     { price: 0.00017, count: 3, size: 22987 },​​​​​
  ​​​​​     { price: 0.000175, count: 2, size: 1215.71 },​​​​​
  ​​​​​     { price: 0.000176, count: 1, size: 5011 },​​​​​
  ​​​​​     { price: 0.0001819, count: 1, size: 2749.209062 },​​​​​
  ​​​​​     { price: 0.000184, count: 1, size: 385 },​​​​​
  ​​​​​     { price: 0.0001954, count: 1, size: 500 },​​​​​
  ​​​​​     { price: 0.000198, count: 1, size: 400 },​​​​​
  ​​​​​     { price: 0.0001998, count: 1, size: 5000 },​​​​​
  ​​​​​     { price: 0.0001999, count: 1, size: 3800 },​​​​​
  ​​​​​     { price: 0.0002, count: 3, size: 3780.645742 },​​​​​
  ​​​​​     { price: 0.000207, count: 1, size: 8672.36 },​​​​​
  ​​​​​     { price: 0.00022, count: 1, size: 14000 },​​​​​
  ​​​​​     { price: 0.00023, count: 1, size: 3073.75661145 },​​​​​
  ​​​​​     { price: 0.00024, count: 1, size: 300 },​​​​​
  ​​​​​     { price: 0.00025, count: 3, size: 3805 },​​​​​
  ​​​​​     { price: 0.0002542, count: 1, size: 3974.423947 },​​​​​
  ​​​​​     { price: 0.00026, count: 1, size: 386.231828 },​​​​​
  ​​​​​     { price: 0.0002637, count: 1, size: 1000 },​​​​​
  ​​​​​     { price: 0.0003, count: 2, size: 687 },​​​​​
  ​​​​​     { price: 0.0003089, count: 1, size: 26000 },​​​​​
  ​​​​​     { price: 0.00035, count: 1, size: 300 },​​​​​
  ​​​​​     { price: 0.0004, count: 2, size: 1300 },​​​​​
  ​​​​​     { price: 0.00042, count: 1, size: 14509.857745 },​​​​​
  ​​​​​     { price: 0.00045, count: 1, size: 300 },​​​​​
  ​​​​​     { price: 0.0005, count: 1, size: 300 },​​​​​
  ​​​​​     { price: 0.0006, count: 1, size: 1000 },​​​​​
  ​​​​​     { price: 0.0007, count: 1, size: 1000 },​​​​​
  ​​​​​     { price: 0.00077, count: 1, size: 1000 },​​​​​
  ​​​​​     { price: 0.000783, count: 1, size: 1000 },​​​​​
  ​​​​​     { price: 0.000799, count: 1, size: 1000 },​​​​​
  ​​​​​     { price: 0.0008, count: 1, size: 1000 },​​​​​
  ​​​​​     { price: 0.000811, count: 1, size: 1000 },​​​​​
  ​​​​​     { price: 0.000814, count: 1, size: 1000 },​​​​​
  ​​​​​     { price: 0.000835, count: 1, size: 1000 },​​​​​
  ​​​​​     { price: 0.0009, count: 5, size: 15500 },​​​​​
  ​​​​​     { price: 0.00095, count: 1, size: 20000 },​​​​​
  ​​​​​     { price: 0.000958, count: 1, size: 1000 },​​​​​
  ​​​​​     { price: 0.000959, count: 1, size: 1000 },​​​​​
  ​​​​​     { price: 0.00099, count: 1, size: 2000 },​​​​​
  ​​​​​     { price: 0.001, count: 3, size: 7000 },​​​​​
  ​​​​​     { price: 0.001159, count: 1, size: 430.075 },​​​​​
  ​​​​​     { price: 0.00116, count: 1, size: 1348.487193 },​​​​​
  ​​​​​     { price: 0.0072, count: 1, size: 600 },​​​​​
  ​​​​​     { price: 0.0074, count: 1, size: 7426.99392 },​​​​​
  ​​​​​     { price: 0.0078, count: 1, size: 4000 },​​​​​
  ​​​​​     { price: 0.00936, count: 1, size: 4391.28 },​​​​​
  ​​​​​     { price: 0.013, count: 1, size: 5114.85 },​​​​​
  ​​​​​     { price: 0.072, count: 1, size: 520 },​​​​​
  ​​​​​     { price: 0.074, count: 1, size: 10000 },​​​​​
  ​​​​​     { price: 0.099, count: 1, size: 1000 },​​​​​
  ​​​​​     { price: 0.1, count: 1, size: 5000 },​​​​​
  ​​​​​     { price: 0.999999, count: 1, size: 500 },​​​​​
  ​​​​​     { price: 1, count: 1, size: 1000 },​​​​​
  ​​​​​     { price: 9.9999999, count: 1, size: 500 },​​​​​
  ​​​​​     { price: 100000, count: 1, size: 21260 },​​​​​
  ​​​​​     { price: 999999, count: 1, size: 500 } ] }​​​​​


