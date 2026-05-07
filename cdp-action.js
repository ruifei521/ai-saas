const WebSocket = require('ws');
const tabId = process.argv[2] || 'E748942DD9153E19CD855CFE19F85E1B';
const method = process.argv[3] || 'click';
const selector = process.argv[4] || '';

const ws = new WebSocket('ws://localhost:9222/devtools/page/' + tabId);

if (method === 'click') {
  ws.on('open', () => {
    // Click the "编辑" link (edit OAuth app)
    const js = `
      const links = document.querySelectorAll('a');
      for(const l of links) {
        if(l.textContent.trim() === '编辑') { l.click(); return 'clicked edit'; }
      }
      // Try clicking the app name link
      for(const l of links) {
        if(l.textContent.trim() === '人工智能软件') { l.click(); return 'clicked app name'; }
      }
      return 'no link found';
    `;
    ws.send(JSON.stringify({id:1, method:'Runtime.evaluate', params:{expression:js, returnByValue:true}}));
  });
  ws.on('message', (data) => {
    const msg = JSON.parse(data.toString());
    if(msg.id === 1) {
      console.log(msg.result.result.value);
      process.exit(0);
    }
  });
} else if (method === 'gettext') {
  ws.on('open', () => {
    ws.send(JSON.stringify({id:1, method:'Runtime.evaluate', params:{expression:'document.title + "|||" + document.body.innerText.substring(0, 5000)', returnByValue:true}}));
  });
  ws.on('message', (data) => {
    const msg = JSON.parse(data.toString());
    if(msg.id === 1) {
      console.log(msg.result.result.value);
      process.exit(0);
    }
  });
}
ws.on('error', (e) => { console.log('WS error:', e.message); process.exit(1); });
setTimeout(() => { console.log('timeout'); process.exit(1); }, 10000);
