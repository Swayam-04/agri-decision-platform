async function test() {
  const routes = ['/', '/disease-detect', '/disease-risk', '/profit-predict', '/price-forecast', '/risk-advisory'];
  for (const r of routes) {
    const res = await fetch('http://localhost:3001' + r);
    console.log(r, res.status);
  }
}
test();
