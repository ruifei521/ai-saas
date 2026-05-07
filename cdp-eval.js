const WebSocket = require('ws');
const tabId = process.argv[2] || 'E748942DD9153E19CD855CFE19F85E1B';
const ws = new WebSocket('ws://localhost:9222/devtools/page/' + tabId);
ws.on('open', () => {
  ws.send(JSON.stringify({id:1, method:'Runtime.evaluate', params:{expression:'document.title + "|||" + document.body.innerText.substring(0, 3000)', returnByValue:true}}));
});
ws.on('message', (data) => {
  const msg = JSON.parse(data.toString());
  if(msg.id === 1) {
    console.log(msg.result.result.value);
    process.exit(0);
  }
});
ws.on('error', (e) => { console.log('WS error:', e.message); process.exit(1); });
setTimeout(() => { console.log('timeout'); process.exit(1); }, 10000);
