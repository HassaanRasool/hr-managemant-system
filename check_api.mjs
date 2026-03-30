async function test() {
  try {
    const res = await fetch('http://localhost:3000/api/employees');
    const text = await res.text();
    console.log("Status:", res.status);
    console.log("Headers:", Object.fromEntries(res.headers.entries()));
    try {
      const json = JSON.parse(text);
      console.log("JSON parsed successfully:", JSON.stringify(json, null, 2).substring(0, 1000));
    } catch {
      console.log("TEXT body:", text.substring(0, 1000));
    }
  } catch (e) {
    console.error("Fetch failed", e);
  }
}
test();
