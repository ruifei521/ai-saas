const WebSocket = require('ws');
const tabId = process.argv[2];
const ws = new WebSocket('ws://localhost:9222/devtools/page/' + tabId);
ws.on('open', () => {
  const js = `JSON.stringify(Array.from(document.querySelectorAll('input, textarea')).map(el => ({name: el.name, id: el.id, type: el.type, value: el.value, placeholder: el.placeholder})))`;
  ws.send(JSON.stringify({id:1, method:'Runtime.evaluate', params:{expression:js, returnByValue:true}}));
});
ws.on('message', (data) => {
  const msg = JSON.parse(data.toString());
  if(msg.id === 1) {
    const inputs = JSON.parse(msg.result.result.value);
    inputs.forEach(i => {
      if(i.value || i.name) console.log(i.name + ' (' + i.type + ') = ' + i.value + (i.placeholder ? ' [placeholder: ' + i.placeholder + ']' : ''));
    });
    process.exit(0);
  }
});
ws.on('error', (e) => { console.log('WS error:', e.message); process.exit(1); });
setTimeout(() => { console.log('timeout'); process.exit(1); }, 10000);
