// หากล็อกอินแล้วให้กลับไปหน้าแรก
try { if (localStorage.getItem('token')) { window.location.replace('/'); } } catch (e) {}

function showLogin() {
  document.getElementById('loginForm').style.display = '';
  document.getElementById('registerForm').style.display = 'none';
}
function showRegister() {
  document.getElementById('loginForm').style.display = 'none';
  document.getElementById('registerForm').style.display = '';
}

document.getElementById('showRegister').addEventListener('click', (e) => { e.preventDefault(); showRegister(); });
document.getElementById('showLogin').addEventListener('click', (e) => { e.preventDefault(); showLogin(); });

// Login handler
document.getElementById('loginForm').addEventListener('submit', async function (e) {
  e.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const btn = e.target.querySelector('button[type="submit"]');
  const msg = document.getElementById('msg');
  btn.disabled = true;
  msg.textContent = 'กำลังส่ง...';
  try {
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    if (res.ok) {
      const data = await res.json().catch(() => ({}));
      msg.textContent = 'เข้าสู่ระบบสำเร็จ';
      if (data.token) localStorage.setItem('token', data.token);
      setTimeout(() => { window.location.href = '/'; }, 600);
    } else {
      const err = await res.json().catch(() => ({ message: res.statusText }));
      msg.textContent = err.message || 'ล็อกอินไม่สำเร็จ';
    }
  } catch (err) {
    msg.textContent = 'เครือข่ายขัดข้อง';
  } finally {
    btn.disabled = false;
  }
});

// Register handler
document.getElementById('registerForm').addEventListener('submit', async function (e) {
  e.preventDefault();
  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('regEmail').value.trim();
  const password = document.getElementById('regPassword').value;
  const passwordConfirm = document.getElementById('regPasswordConfirm').value;
  const btn = e.target.querySelector('button[type="submit"]');
  const msg = document.getElementById('regMsg');
  if (password !== passwordConfirm) { msg.textContent = 'รหัสผ่านไม่ตรงกัน'; return; }
  if (password.length < 6) { msg.textContent = 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร'; return; }
  btn.disabled = true; msg.textContent = 'กำลังสมัคร...';
  try {
    const res = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      // หาก API คืน token ให้เก็บและไปหน้าแรก
      if (data.token) {
        localStorage.setItem('token', data.token);
        msg.textContent = 'สมัครสำเร็จ กำลังเข้าสู่ระบบ...';
        setTimeout(() => { window.location.href = '/'; }, 600);
      } else {
        msg.textContent = 'สมัครสมาชิกสำเร็จ โปรดล็อกอิน';
        setTimeout(() => { showLogin(); }, 800);
      }
    } else {
      msg.textContent = data.message || 'สมัครสมาชิกไม่สำเร็จ';
    }
  } catch (err) {
    msg.textContent = 'เครือข่ายขัดข้อง';
  } finally {
    btn.disabled = false;
  }
});
