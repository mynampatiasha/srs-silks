async function test() {
  try {
    const loginRes = await fetch('http://localhost:5000/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@srs.in', password: 'admin123' })
    });
    const loginData = await loginRes.json();
    const token = loginData.token;
    console.log('Token:', token.substring(0, 15) + '...');
    
    const catRes = await fetch('http://localhost:5000/api/categories/admin', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` 
      },
      body: JSON.stringify({ name: 'TestCat', desc: 'Test' })
    });
    const catData = await catRes.json();
    console.log('Create Cat:', catData);
    
    if (catData.category && catData.category._id) {
      const delRes = await fetch(`http://localhost:5000/api/categories/admin/${catData.category._id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const delData = await delRes.json();
      console.log('Delete Cat:', delData);
    }
  } catch (err) {
    console.error('Error:', err.message);
  }
}
test();
