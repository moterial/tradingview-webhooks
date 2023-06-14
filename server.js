const express = require('express');
const axios = require('axios');

const app = express();
const port = 3000;

app.use(express.json());

// OKX API credentials
const apiKey = 'bf562a2f-6e57-4da3-8bf5-3665f8925769';
const apiSecret = '019576B91ED668CE4FB8456658738B0B';
const apiPassphrase = 'Q@bgJf67R';
const apiUrl = 'https://www.okex.com';

// Define a route for sending the buy order
app.post('/buy-crypto', async (req, res) => {
  const symbol = req.body.symbol;
  const quantity = parseFloat(req.body.quantity);
  const price = parseFloat(req.body.price);
  
  var stopLossPrice = 0;
  var takeProfitPrice = 0;
  var takeProfitPrice2 = 0;

  if (!symbol || !quantity || !price) {
    return res.status(400).json({ error: 'Symbol, quantity, and price fields are required in the request body.' });
  }

  
  if (req.body.signal == 'buy'){
    stopLossPrice = (price * 0.985).toFixed(2);
    takeProfitPrice = (price * 1.015).toFixed(2);
    takeProfitPrice2 = (price * 1.02).toFixed(2);
  }
  else{
    stopLossPrice = (price * 1.015).toFixed(2);
    takeProfitPrice = (price * 0.985).toFixed(2);
    takeProfitPrice2 = (price * 0.98).toFixed(2);
  }

  const endpoint = '/api/v5/trade/order';
    const body = {
      instId: symbol,
      tdMode: 'cross',
      side: req.body.signal,
      ordType: 'limit',
      px: price.toFixed(2),
      sz: quantity.toFixed(8),
      ccy: 'USDT',
      clOrdId: Date.now().toString(),
      slTriggerPx: stopLossPrice,
      slOrdPx: -1,
      //模擬測試
    profitTargets: [
    {
        targetPx:takeProfitPrice,
        targetQty: (quantity * 0.5).toFixed(8) // 50% of the quantity
    },
    {
        targetPx: takeProfitPrice2,
        targetQty: quantity.toFixed(8) // 100% of the quantity
    }
    ],




      
    };

    // Generate timestamp and signature
  const timestamp = Date.now().toString();
  const method = 'POST';
  const url = `${apiUrl}${endpoint}`;
  const signString = `${timestamp}${method}${endpoint}${JSON.stringify(body)}`;
  const signature = generateSignature(apiSecret, signString);

  // Set the request headers
  const headers = {
    'OK-ACCESS-KEY': apiKey,
    'OK-ACCESS-SIGN': signature,
    'OK-ACCESS-TIMESTAMP': timestamp,
    'OK-ACCESS-PASSPHRASE': apiPassphrase,
    'x-simulated-trading': 1,
    'Content-Type': 'application/json'
  };

  try {
    // const response = await axios.post(url, body, { headers });
    res.json(body);
  } catch (error) {
    res.status(500).json({ error: 'Error sending buy order.' });
  }


   
});

// Generate signature for OKX API request
function generateSignature(secretKey, signString) {
  const hmac = require('crypto').createHmac('sha256', secretKey);
  return hmac.update(signString).digest('base64');
}

// async function sendBuyOrder(symbol, quantity1, price1, res) {
//     const quantity = parseFloat(quantity1);
//     const price = parseFloat(price1); 
    


// }

// async function sendSellOrder(symbol, quantity1, price1, res) {
//     const quantity = parseFloat(quantity1);
//     const price = parseFloat(price1); 


//     const endpoint = '/api/v5/trade/order';
//     const body = {
//       instId: symbol,
//       tdMode: 'cross',
//       side: 'buy',
//       ordType: 'limit',
//       px: price.toFixed(2),
//       sz: quantity.toFixed(8),
//       ccy: 'USDT',
//       clOrdId: Date.now().toString(),
//       profitTargets: [
//         {
//           targetPx:takeProfitPrice,
//           targetQty: (quantity * 0.5).toFixed(8) // 50% of the quantity
//         },
//         {
//           targetPx: takeProfitPrice2,
//           targetQty: quantity.toFixed(8) // 100% of the quantity
//         }
//       ],
//       stopLoss: {
//         stopPx: stopLossPrice // Stop loss price
//       }
//     };

//     // Generate timestamp and signature
//   const timestamp = Date.now().toString();
//   const method = 'POST';
//   const url = `${apiUrl}${endpoint}`;
//   const signString = `${timestamp}${method}${endpoint}${JSON.stringify(body)}`;
//   const signature = generateSignature(apiSecret, signString);

//   // Set the request headers
//   const headers = {
//     'OK-ACCESS-KEY': apiKey,
//     'OK-ACCESS-SIGN': signature,
//     'OK-ACCESS-TIMESTAMP': timestamp,
//     'OK-ACCESS-PASSPHRASE': apiPassphrase,
//     'Content-Type': 'application/json'
//   };

//   try {
//     const response = await axios.post(url, body, { headers });
//     res.json(response.data);
//   } catch (error) {
//     res.status(500).json({ error: 'Error sending buy order.' });
//   }
// }

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
