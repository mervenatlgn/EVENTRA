document.addEventListener("DOMContentLoaded", () => {

  async function postData(url = '', data = {}) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      const text = await response.text();
      console.log("Sunucudan dönen ham cevap:", text);

      return JSON.parse(text);
    } catch (error) {
      alert("Sunucuya bağlanılamadı veya gelen veri hatalı.");
      throw error;
    }
  }

  // DUYURULARI GETİR VE (SADECE ADMİNDE) SİLME BUTONLARINI EKLE
  fetch('http://localhost/EVENTRA/api/fetch_announcement.php')
    .then(response => response.json())
    .then(data => {
      const container = document.querySelector('.announcement-list');
      container.innerHTML = '';

      if (data.length === 0) {
        container.innerHTML = '<p>Henüz duyuru yok.</p>';
        return;
      }

      const isAdminPage = window.location.href.includes("admin_announcements.html");

      data.forEach(item => {
        const card = document.createElement('div');
        card.classList.add('announcement-card');
        card.dataset.id = item.id;

        const title = document.createElement('h3');
        title.textContent = item.title;

        const message = document.createElement('p');
        message.innerHTML = item.message.replace(/\n/g, '<br>');

        card.appendChild(title);
        card.appendChild(message);

        // Sil butonu sadece admin sayfasında eklenecek
        if (isAdminPage) {
          const deleteBtn = document.createElement('button');
          deleteBtn.classList.add('delete-btn');
          deleteBtn.textContent = 'Sil';

          deleteBtn.addEventListener('click', function () {
            if (confirm('Bu duyuruyu silmek istediğine emin misin?')) {
              fetch('http://localhost/EVENTRA/api/delete_announcement.php', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: 'id=' + item.id
              })
                .then(response => response.json())
                .then(result => {
                  if (result.success) {
                    alert('Duyuru silindi!');
                    location.reload();
                  } else {
                    alert('Silme başarısız: ' + result.message);
                  }
                })
                .catch(err => {
                  console.error('Silme hatası:', err);
                  alert('Bir hata oluştu.');
                });
            }
          });

          card.appendChild(deleteBtn);
        }

        container.appendChild(card);
      });
    })
    .catch(err => {
      console.error('Duyurular yüklenirken hata:', err);
      document.querySelector('.announcement-list').innerHTML = '<p>Yüklenirken hata oluştu.</p>';
    });

  // DUYURU EKLEME
  const form = document.querySelector(".add-announcement form");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();

      const title = form.querySelector("input[name='title']").value.trim();
      const message = form.querySelector("textarea[name='message']").value.trim();

      if (title === "" || message === "") {
        alert("Lütfen tüm alanları doldurun.");
        return;
      }

      const formData = new FormData();
      formData.append("title", title);
      formData.append("message", message);

      fetch('http://localhost/EVENTRA/api/add_announcement.php', {
        method: "POST",
        body: formData
      })
        .then(response => response.json())
        .then(data => {
          if (data.success) {
            alert("Duyuru başarıyla eklendi!");
            form.reset();
            location.reload();
          } else {
            alert("Hata: " + data.message);
          }
        })
        .catch(error => {
          console.error("Hata:", error);
          alert("Beklenmedik bir hata oluştu.");
        });
    });
  }

  // ŞİFRE DEĞİŞTİRME
  const changeForm = document.getElementById('changePasswordForm');
  if (changeForm) {
    changeForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const email = e.target.email.value.trim();
      const currentPassword = e.target.currentPassword.value.trim();
      const newPassword = e.target.newPassword.value.trim();
      const confirmPassword = e.target.confirmPassword.value.trim();

      if (!email || !currentPassword || !newPassword || !confirmPassword) {
        alert("Lütfen tüm alanları doldurun.");
        return;
      }

      if (newPassword !== confirmPassword) {
        alert("Yeni şifreler uyuşmuyor.");
        return;
      }

      try {
        const response = await postData('http://localhost/EVENTRA/api/change_password.php', {
          email,
          current_password: currentPassword,
          new_password: newPassword
        });

        if (response.success) {
          alert("Şifre başarıyla güncellendi. Giriş sayfasına yönlendiriliyorsunuz.");
          window.location.href = "index.html";
        } else {
          alert("Hata: " + response.message);
        }
      } catch (err) {
        console.error("Şifre değiştirme hatası:", err);
      }
    });
  }

  // KAYIT FORMU
  const registerForm = document.getElementById('registerForm');
  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const email = e.target.email.value.trim();
      const password = e.target.password.value.trim();
      const fullname = e.target.fullname.value.trim();

      if (!email || !password || !fullname) {
        alert("Lütfen tüm alanları doldurun.");
        return;
      }

      const data = await postData('http://localhost/EVENTRA/api/register.php', {
        email,
        password,
        fullname
      });

      if (data.success) {
        alert('Kayıt başarılı! Yönetici onayını bekleyin...');
        registerForm.reset();
      } else {
        alert('Hata: ' + data.message);
      }
    });
  }

  // GİRİŞ FORMU
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const email = e.target.email.value.trim();
      const password = e.target.password.value.trim();

      if (!email || !password) {
        alert("Email ve şifre boş olamaz.");
        return;
      }

      try {
        const data = await postData('http://localhost/EVENTRA/api/login.php', { email, password });
        console.log('Login response:', data);

        // Önce redirect kontrolü
        if (data.redirect) {
          alert(data.message || "Yönlendiriliyorsunuz...");
          window.location.href = 'change_password.html';
          return;
        }

        // Başarısız giriş kontrolü
        if (!data.success) {
          alert(data.message || 'Giriş başarısız.');
          return;
        }

        // Admin yönlendirme
        if (data.is_admin) {
          window.location.href = 'admin_announcements.html';
          return;
        }

        // Şifresi değiştirilmemiş kullanıcı kontrolü
        if (data.user.changed_password == 0) {
          window.location.href = 'change_password.html';
          return;
        }

        // Normal kullanıcı yönlendirmesi
        window.location.href = 'user_announcements.html';

      } catch (error) {
        console.error("Login sırasında hata:", error);
      }
    });
  }

  async function fetchUsers() {
  try {
    const response = await fetch('http://localhost/EVENTRA/api/fetch_users.php');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const users = await response.json();

    const container = document.querySelector('.user-list');
    container.innerHTML = '';

    if (!users.length) {
      container.innerHTML = '<p>Henüz kullanıcı yok.</p>';
      return;
    }

    users.forEach(user => {
      const userCard = document.createElement('div');
      userCard.classList.add('user-card');

      const approved = parseInt(user.is_approved, 10) === 1;

      userCard.innerHTML = `
        <p>${user.fullname} (${user.email})</p>
        <button class="approve-btn" ${approved ? 'disabled style="background:gray;cursor:default;font-style:italic;"' : ''}>
          ${approved ? 'Onaylı Kullanıcı' : 'Onayla'}
        </button>
      `;

      container.appendChild(userCard);

      const approveBtn = userCard.querySelector('.approve-btn');
      if (!approveBtn.disabled) {
        approveBtn.addEventListener('click', () => {
          approveUser(user.id, user.fullname, approveBtn);
        });
      }
    });

  } catch (error) {
    
    console.error('fetchUsers error:', error);
  }
}


  // Kullanıcı onaylama fonksiyonu
  function approveUser(userId, fullName, button) {
    fetch('http://localhost/EVENTRA/api/approve_user.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          alert(`${fullName} kullanıcısı onaylandı.`);
          button.textContent = 'Onaylı Kullanıcı';
          button.disabled = true;
          button.style.fontStyle = 'italic';
          button.style.backgroundColor = 'gray';
          button.style.cursor = 'default';
        } else {
          alert('Onaylama işlemi sırasında hata oluştu: ' + (data.message || 'Bilinmeyen hata'));
        }
      })
      .catch(err => {
        alert('Sunucu hatası: ' + err.message);
      });
  }

  // Sayfa yüklendiğinde kullanıcıları çek
  fetchUsers();

});
