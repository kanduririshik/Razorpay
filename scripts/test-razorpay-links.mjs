import fs from 'fs';
import path from 'path';

// Load .env.production.local manually
const envContent = fs.readFileSync('.env.production.local', 'utf-8');
const env = {};
for (const line of envContent.split('\n')) {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    let val = match[2].trim();
    if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
    env[match[1].trim()] = val;
  }
}

const keyId = env.RAZORPAY_KEY_ID;
const keySecret = env.RAZORPAY_KEY_SECRET;

console.log('Testing Razorpay with Key:', keyId);

const authHeader = 'Basic ' + Buffer.from(`${keyId}:${keySecret}`).toString('base64');

async function check() {
  const listRes = await fetch('https://api.razorpay.com/v1/payment_links?count=50', {
    headers: { Authorization: authHeader }
  });
  const listData = await listRes.json();
  console.log('Total links returned:', listData.items?.length);
  if (listData.items) {
    const statuses = {};
    for (const item of listData.items) {
      statuses[item.status] = (statuses[item.status] || 0) + 1;
    }
    console.log('Statuses of payment links:', statuses);
    
    // Find unpaid ones
    const cancellable = listData.items.filter(i => i.status === 'created');
    console.log('Created (unpaid) links count:', cancellable.length);
    
    for (const item of cancellable.slice(0, 15)) {
      console.log(`Attempting cancel on ${item.id} (short_url: ${item.short_url})...`);
      const cancelRes = await fetch(`https://api.razorpay.com/v1/payment_links/${item.id}/cancel`, {
        method: 'POST',
        headers: { Authorization: authHeader }
      });
      const cancelData = await cancelRes.json();
      console.log(`Cancel result for ${item.id}:`, cancelData.status || cancelData.error?.description);
    }
  }
}

check().catch(console.error);
