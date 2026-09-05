async function main() {
  const res = await fetch('https://checkout.razorpay.com/v1/checkout.js');
  const text = await res.text();
  let idx = 0;
  while ((idx = text.indexOf('api.razorpay.com', idx + 1)) !== -1) {
    console.log('--- Occurrence at', idx, '---');
    console.log(text.slice(Math.max(0, idx - 100), Math.min(text.length, idx + 100)));
  }
}
main().catch(console.error);
