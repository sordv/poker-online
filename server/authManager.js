// для работы с файлами
const path = require('path');
const fs = require('fs');

const bcrypt = require('bcryptjs'); // для хэширования паролей
const { v4: uuidv4 } = require('uuid'); // для генерации уникальных id

const hash_hard = 10; // сложность хэша
const accounts_file = path.join(__dirname, 'data/accounts.json'); // путь к файлу с аккаунтами

// чтение файла с аккаунтами
function readAccounts() {
	try {
		if (!fs.existsSync(accounts_file)) { return { users: [] }; }

		const data = fs.readFileSync(accounts_file, 'utf-8');
		if (!data.trim()) { return { users: [] }; }

		return JSON.parse(data);
	} catch (err) {
		console.error('Ошибка при чтении accounts.json', err);
		return { users: [] };
	}
}

// запись в файл с аккаунтами
function writeAccounts(accounts) {
	try {
		fs.writeFileSync(accounts_file, JSON.stringify(accounts, null, 2), 'utf-8');
	} catch (err) {
		console.error('Ошибка записи в accounts.json', err);
	}
}

// регистрация, вход
function initAuth(app) {
	// регистрация аккаунта
	app.post('/api/auth/create', async (req, res) => {
		const { login, password } = req.body;
		console.log(`[Auth] Попытка создания аккаунта: ${login}`);

		const accounts = readAccounts();

		if (accounts.users.some(u => u.login === login)) {
			console.log(`[Auth] Ошибка: логин ${login} уже занят`);
			return res.status(400).json({ error: 'Логин уже занят' });
		}

		const hashedPassword = await bcrypt.hash(password, hash_hard);
		const newUser = {
			id: uuidv4(),
			login,
			password: hashedPassword,
			rating: 10
		};

		accounts.users.push(newUser);
		writeAccounts(accounts);

		console.log(`[Auth] Создан новый аккаунт: ${login}`);
		res.json({
			token: newUser.id,
			login: newUser.login,
			rating: newUser.rating
		});
	});

	// вход в аккаунт
	app.post('/api/auth/login', async (req, res) => {
		const { login, password } = req.body;
		console.log(`[Auth] Попытка входа: ${login}`);

		const accounts = readAccounts();
		const user = accounts.users.find(u => u.login === login);

		if (!user) {
			console.log(`[Auth] Ошибка входа: неверный логин ${login}`);
			return res.status(401).json({ error: 'Неверные данные' });
		}

		const match = await bcrypt.compare(password, user.password);
		if (!match) {
			console.log(`[Auth] Ошибка входа: неверный пароль для ${login}`);
			return res.status(401).json({ error: 'Неверные данные' });
		}

		console.log(`[Auth] Успешный вход: ${login}`);
		res.json({
			token: user.id,
			login: user.login,
			rating: user.rating
		});
	});

	// проверка токена
	app.post('/api/auth/validate', (req, res) => {
		const { token } = req.body;
		console.log(`[Auth] Проверка токена`);

		const accounts = readAccounts();
		const user = accounts.users.find(u => u.id === token);

		if (!user) {
			console.log(`[Auth] Ошибка: недействительный токен`);
			return res.status(401).json({ error: 'Недействительный токен' });
		}

		res.json({
			login: user.login,
			rating: user.rating
		});
	});
}

module.exports = { initAuth };