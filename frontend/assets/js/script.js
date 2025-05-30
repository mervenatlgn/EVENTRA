document.addEventListener("DOMContentLoaded", () => {
  // API base URL tanımı
  const API_BASE_URL = 'http://localhost/EVENTRA/api';

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

  // DUYURULARIN GETİRİLMESİ VE SADECE ADMİNDE SİLME BUTONLARININ EKLENMESİ
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
  const announcementForm = document.querySelector(".add-announcement form");
  if (announcementForm) {
    announcementForm.addEventListener("submit", function (e) {
      e.preventDefault();

      const title = announcementForm.querySelector("input[name='title']").value.trim();
      const message = announcementForm.querySelector("textarea[name='message']").value.trim();

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
            announcementForm.reset();
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

  // ETKİNLİKLERİN GETİRİLMESİ VE ADMİNDE SİLME BUTONLARININ EKLENMESİ
  const eventList = document.querySelector('.event-list');
  const isAdmin = window.location.href.includes('admin_events.html');
  const eventForm = document.getElementById('eventForm');
  const categoryFilter = document.querySelector('.category-filter');

  // Sayfa yüklendiğinde etkinlikleri getir
  if (eventList) {
    loadEvents();
  }

  // Kategori filtresi değiştiğinde
  if (categoryFilter) {
    categoryFilter.addEventListener('change', (e) => {
      if (e.target.name === 'category') {
        loadEvents(e.target.value);
      }
    });
  }

  async function loadEvents(category = 'all') {
    try {
      const response = await fetch(`${API_BASE_URL}/fetch_event.php${category !== 'all' ? '?category=' + category : ''}`);
      const events = await response.json();
      eventList.innerHTML = '';
      events.forEach(event => renderEventCard(event, eventList, isAdmin));
    } catch (err) {
      eventList.innerHTML = '<p>Etkinlikler yüklenemedi.</p>';
      console.error(err);
    }
  }

  function renderEventCard(event, container, isAdmin) {
    const card = document.createElement('div');
    card.classList.add('event-card');
    
    // Tarihi formatla
    const eventDate = new Date(event.date);
    const formattedDate = eventDate.toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    // İçeriği ayrı bir div'e al
    const contentDiv = document.createElement('div');
    contentDiv.className = 'event-card-content';
    contentDiv.innerHTML = `
      <h3>${event.title}</h3>
      <p><strong>Yer:</strong> ${event.place}</p>
      <p><strong>Tarih:</strong> ${formattedDate}</p>
      <p><strong>Fiyat:</strong> ${event.price} ₺</p>
      <p><strong>Kategori:</strong> ${event.category}</p>
    `;
    card.appendChild(contentDiv);

    if (isAdmin) {
      const deleteBtn = document.createElement('button');
      deleteBtn.classList.add('delete-btn');
      deleteBtn.textContent = 'Sil';
      deleteBtn.onclick = () => deleteEvent(event.id);
      card.appendChild(deleteBtn);
    } else {
      // Sepete Ekle butonu
      const addToCartBtn = document.createElement('button');
      addToCartBtn.className = 'btn btn-blue';
      addToCartBtn.textContent = 'Sepete Ekle';
      addToCartBtn.onclick = () => {
        fetch('http://localhost/EVENTRA/api/add_cart.php', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: 'id=' + encodeURIComponent(event.id)
        })
          .then(res => res.json())
          .then(data => {
            if (data.success) {
              alert('Etkinlik sepete eklendi.');
            } else {
              alert('Hata: ' + data.message);
            }
          })
          .catch(err => {
            console.error(err);
            alert('Sepete ekleme işlemi başarısız.');
          });
      };
      card.appendChild(addToCartBtn);
    }

    container.appendChild(card);
  }

  // Etkinlik formu gönderimi
  if (eventForm) {
    eventForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      const formData = new FormData(eventForm);
      const eventData = {
        title: formData.get('title'),
        place: formData.get('place'),
        category: formData.get('category'),
        date: formData.get('date'),
        price: formData.get('price')
      };

      try {
        const response = await fetch(`${API_BASE_URL}/add_event.php`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(eventData)
        });

        const data = await response.json();
        
        if (data.success) {
          alert('Etkinlik başarıyla eklendi!');
          eventForm.reset();
          loadEvents();
        } else {
          alert('Hata: ' + (data.message || 'Etkinlik eklenemedi.'));
        }
      } catch (err) {
        console.error('Etkinlik ekleme hatası:', err);
        alert('Etkinlik eklenirken bir hata oluştu.');
      }
    });
  }

  function deleteEvent(id) {
    if (!confirm('Bu etkinliği silmek istediğinize emin misiniz?')) return;

    fetch('http://localhost/EVENTRA/api/delete_event.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ id: id })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          alert('Etkinlik başarıyla silindi.');
          loadEvents(); // Etkinlik listesini yenile
        } else {
          alert('Hata: ' + data.message);
        }
      })
      .catch(err => {
        console.error('Silme hatası:', err);
        alert('Silme işlemi sırasında bir hata oluştu.');
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
      
      // İlgi alanlarını al
      const interests = Array.from(e.target.querySelectorAll('input[name="interests[]"]:checked'))
        .map(checkbox => checkbox.value);

      if (!email || !password || !fullname) {
        alert("Lütfen tüm alanları doldurun.");
        return;
      }

      const data = await postData('http://localhost/EVENTRA/api/register.php', {
        email,
        password,
        fullname,
        interests: interests.join(',') // İlgi alanlarını virgülle ayrılmış string olarak gönder
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

  // Kullanıcıları çek ve admin panelinde göster
  function fetchUsers() {
    fetch('http://localhost/EVENTRA/api/fetch_users.php')
      .then(res => res.json())
      .then(users => {
        const container = document.querySelector('.user-list');
        if (!container) return;
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
      });
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

  // Profil sayfası işlemleri
  if (window.location.href.includes('user_profile.html')) {
    fetch('http://localhost/EVENTRA/api/active_user.php', { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (!data.success || !data.user) return;
        const user = data.user;
        document.querySelector('.profile-details').innerHTML = `
          <p><strong>Ad Soyad:</strong> ${user.fullname}</p>
          <p><strong>E-posta:</strong> ${user.email}</p>
          <p><strong>İlgi Alanları:</strong> ${user.interests || '-'}</p>
          <p><strong>Hesap durumu:</strong> ${user.is_approved == 1 ? 'Onaylı Kullanıcı' : 'onaylanmamış hesap'}</p>
        `;
      });
  }

  // --- SEPETİM (CART) ---
  const cartList = document.querySelector('.cart-list');
  if (cartList) {
    loadCart();
  }

  async function loadCart() {
    try {
      const response = await fetch('http://localhost/EVENTRA/api/fetch_event.php');
      const events = await response.json();
      const cartEvents = events.filter(e => e.is_in_cart == 1);
      cartList.innerHTML = '';
      const cartTotalDiv = document.querySelector('.cart-total');
      let total = 0;
      if (cartEvents.length === 0) {
        cartList.innerHTML = '<p>Sepetiniz boş.</p>';
        if (cartTotalDiv) cartTotalDiv.textContent = '';
        return;
      }
      cartEvents.forEach(event => {
        renderCartItem(event, cartList);
        total += parseFloat(event.price) || 0;
      });
      if (cartTotalDiv) {
        cartTotalDiv.textContent = `Toplam Fiyat: ${total.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}`;
      }
    } catch (err) {
      cartList.innerHTML = '<p>Sepet yüklenemedi.</p>';
      const cartTotalDiv = document.querySelector('.cart-total');
      if (cartTotalDiv) cartTotalDiv.textContent = '';
      console.error(err);
    }
  }

  function renderCartItem(event, container) {
    const item = document.createElement('div');
    item.className = 'cart-item';
    const contentDiv = document.createElement('div');
    contentDiv.className = 'cart-item-content';
    contentDiv.innerHTML = `
      <h4>${event.title}</h4>
      <p><strong>Yer:</strong> ${event.place}</p>
      <p><strong>Tarih:</strong> ${new Date(event.date).toLocaleDateString('tr-TR')}</p>
      <p><strong>Fiyat:</strong> ${event.price} ₺</p>
      <p><strong>Kategori:</strong> ${event.category}</p>
    `;
    item.appendChild(contentDiv);
    // Kaldır butonu
    const removeBtn = document.createElement('button');
    removeBtn.className = 'btn-remove';
    removeBtn.textContent = 'Kaldır';
    removeBtn.onclick = () => removeFromCart(event.id);
    item.appendChild(removeBtn);
    container.appendChild(item);
  }

  function removeFromCart(eventId) {
    fetch('http://localhost/EVENTRA/api/remove_cart.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: 'id=' + encodeURIComponent(eventId)
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          loadCart();
          loadEvents(); // Sepetten çıkarınca etkinlik listesini de güncelle
        } else {
          alert('Hata: ' + data.message);
        }
      })
      .catch(err => {
        alert('Sepetten çıkarma işlemi başarısız.');
        console.error(err);
      });
  }
});
