async function test() {
  try {
    const res = await fetch('http://localhost:5000/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'test',
        email: 'test' + Date.now() + '@test.com',
        password: 'test',
        role: 'Student'
      })
    });
    const data = await res.json();
    console.log("Status:", res.status);
    console.log("Response:", data);
  } catch (err) {
    console.log("Error:", err.message);
  }
}
test();
