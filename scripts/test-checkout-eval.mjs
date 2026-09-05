async function test() {
  const res = await fetch('https://checkout.razorpay.com/v1/checkout.js');
  const code = await res.text();

  const fakeWindow = {
    location: { href: 'https://razorpay-rishik.vercel.app/checkout', origin: 'https://razorpay-rishik.vercel.app' },
    addEventListener: () => {},
    removeEventListener: () => {},
    Razorpay: {
      config: {
        api: 'https://razorpay-rishik.vercel.app/api/rzp/'
      }
    }
  };

  const fakeDoc = {
    createElement: () => ({ setAttribute: () => {}, style: {}, addEventListener: () => {} }),
    head: { appendChild: () => {} },
    body: { appendChild: () => {} },
    querySelector: () => null,
    querySelectorAll: () => [],
  };

  try {
    const fn = new Function('window', 'document', 'self', code);
    fn(fakeWindow, fakeDoc, fakeWindow);

    console.log('Razorpay constructor defined:', typeof fakeWindow.Razorpay);
    if (typeof fakeWindow.Razorpay === 'function') {
      const instance = new fakeWindow.Razorpay({ key: 'rzp_test_123', order_id: 'order_123' });
      console.log('Instance created successfully!');
    }
  } catch (err) {
    console.error('Eval result:', err.message);
  }
}
test();
