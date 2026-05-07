const WebSocket = require('ws');
const tabId = 'E748942DD9153E19CD855CFE19F85E1B';
const ws = new WebSocket('ws://localhost:9222/devtools/page/' + tabId);
ws.on('open', () => {
  const js = `JSON.stringify(Array.from(document.querySelectorAll('a')).map(l => ({text: l.textContent.trim(), href: l.href})))`;
  ws.send(JSON.stringify({id:1, method:'Runtime.evaluate', params:{expression:js, returnByValue:true}}));
});
ws.on('message', (data) => {
  const msg = JSON.parse(data.toString());
  if(msg.id === 1) {
    const links = JSON.parse(msg.result.result.value);
    links.forEach(l => console.log(l.text + ' -> ' + l.href));
    process.exit(0);
  }
});
ws.on('error', (e) => { console.log('WS error:', e.message); process.exit(1); });
setTimeout(() => { console.log('timeout'); process.exit(1); }, 10000);
