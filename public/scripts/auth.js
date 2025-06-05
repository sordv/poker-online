document.addEventListener('DOMContentLoaded', () => {
	const token = localStorage.getItem('pokerToken');

	if (token) {
		// валидация токена
		// если токен проходит валидацию - загружаем пользователя и показывает showUserInfo
		// если не проходит или токена нет - showLoginForm
		fetch('/api/auth/validate', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ token })
		})
			.then(res => res.json())
			.then(data => {
				if (data.error) { showLoginForm(); }
				else { showUserInfo(data.login, data.rating); }
			})
			.catch(() => showLoginForm());
	} else { showLoginForm(); }
});

// отображение содержание для входа
function showLoginForm() {
	const userBlock = document.getElementById('userBlock');
	userBlock.innerHTML = `
    <input type="text" id="loginInput" placeholder="Логин">
    <input type="password" id="passwordInput" placeholder="Пароль">
    <button id="loginBtn">Войти</button>
    <button id="createAccountBtn">Зарегистрироваться</button>
  `;

	document.getElementById('loginBtn').addEventListener('click', login);
	document.getElementById('createAccountBtn').addEventListener('click', createAccount);
}

// отображение содержание информации о пользователе
function showUserInfo(login, rating) {
	const userBlock = document.getElementById('userBlock');
	userBlock.innerHTML = `
    <div class="user-info">
      <span>${login}</span>
      <span>Рейтинг: ${rating}</span>
    </div>
  `;
}

// выполнение логина
function login() {
	// получение значений
	const login = document.getElementById('loginInput').value.trim();
	const password = document.getElementById('passwordInput').value.trim();

	// запрос на логин
	fetch('/api/auth/login', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({ login, password })
	})
		.then(res => res.json())
		.then(data => {
			if (data.error) {
				// ошибка
				alert(data.error);
			} else {
				// сохранение данных в localStorage
				localStorage.setItem('pokerToken', data.token);
				localStorage.setItem('pokerLogin', data.login);
				localStorage.setItem('pokerRating', data.rating);
				// отображение информации о пользователе
				showUserInfo(data.login, data.rating);
			}
		});
}

// выполнение регистрации
function createAccount() {
	// получение значений
	const login = document.getElementById('loginInput').value.trim();
	const password = document.getElementById('passwordInput').value.trim();

	// запрос на регистрацию
	fetch('/api/auth/create', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({ login, password })
	})
		.then(res => res.json())
		.then(data => {
			if (data.error) {
				alert(data.error);
			} else {
				localStorage.setItem('pokerToken', data.token);
				localStorage.setItem('pokerLogin', data.login);
				localStorage.setItem('pokerRating', data.rating);
				showUserInfo(data.login, data.rating);
			}
		});
}

function setupLogout() {
	const logoutBtn = document.createElement('button');
	logoutBtn.textContent = 'Выйти';
	logoutBtn.id = 'logoutBtn';
	logoutBtn.style.marginTop = '10px';
	logoutBtn.addEventListener('click', logout);

	const userBlock = document.getElementById('userBlock');
	if (userBlock.querySelector('.user-info')) {
		userBlock.querySelector('.user-info').appendChild(logoutBtn);
	}
}

function logout() {
	localStorage.removeItem('pokerToken');
	localStorage.removeItem('pokerLogin');
	localStorage.removeItem('pokerRating');
	showLoginForm();
}

// Обновляем showUserInfo
function showUserInfo(login, rating) {
	const userBlock = document.getElementById('userBlock');
	userBlock.innerHTML = `
    <div class="user-info">
      <span>${login}</span>
      <span>Рейтинг: ${rating}</span>
    </div>
  `;
	setupLogout();
}