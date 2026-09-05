async function run() {
  const res = await fetch('https://checkout.razorpay.com/v1/checkout.js');
  const text = await res.text();
  const matches = text.match(/https:\/\/[a-zA-Z0-9.-]+\.razorpay\.com[^\s"'\`\)\]\}]*/g);
  console.log(Array.from(new Set(matches)));
}
run();
