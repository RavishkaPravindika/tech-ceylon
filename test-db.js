import fs from 'fs';

const env = fs.readFileSync('.env.local', 'utf8');
const dbUrlMatch = env.match(/NEXT_PUBLIC_FIREBASE_DATABASE_URL=(.+)/);
const dbUrl = dbUrlMatch ? dbUrlMatch[1].trim() : null;

async function test() {
  const url = `${dbUrl}/products.json`;
  console.log("Fetching URL:", url);
  try {
    const res = await fetch(url);
    const data = await res.json();
    console.log("Response OK:", res.ok);
    console.log("Status:", res.status);
    console.log("Data keys:", data ? Object.keys(data).length : "null");
    if (data && typeof data === 'object') {
      const items = Object.values(data);
      console.log("First item slug:", items[0]?.slug);
      const match = items.find(i => i.slug === 'samsung-25w-pd-charger-with-cable-0tjz');
      console.log("Match found?", !!match);
    }
  } catch (e) {
    console.error("Error:", e);
  }
}

test();
