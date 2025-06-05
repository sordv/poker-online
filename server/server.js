// для сервера с подключениями в реальном времени
const express = require('express');
const { Server } = require('socket.io');
const http = require('http');

// для работы с файлами
const path = require('path');
const fs = require('fs');

// инициализация сервера
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
	cors: {
		origin: "*",
		methods: ["GET", "POST"]
	}
});

app.use(express.static(path.join(__dirname, '../public')));
app.use(express.json());

// создаем папку data если она отсутсвует
if (!fs.existsSync(path.join(__dirname, 'data'))) {
	fs.mkdirSync(path.join(__dirname, 'data'));
}

// создаем файл accounts.json если он отсутсвует
const accountsFile = path.join(__dirname, 'data/accounts.json');
if (!fs.existsSync(accountsFile)) {
	fs.writeFileSync(accountsFile, JSON.stringify({ users: [] }, null, 2));
}

// подключение модуля регистрации, входа
const { initAuth } = require('./authManager');
initAuth(app);

// подключение модуля создания, подключения к комнате
const RoomManager = require('./roomManager');
const roomManager = new RoomManager(io);
roomManager.initRooms();

// роут на главное меню
app.get('/', (req, res) => {
	res.sendFile(path.join(__dirname, '../public/pages/index.html'));
});

// роут на страницу комнаты
app.get('/room.html', (req, res) => {
	res.sendFile(path.join(__dirname, '../public/pages/room.html'));
});

// при выключении сервера
process.on('SIGINT', () => {
	console.log('ВЫКЛЮЧЕНИЕ СЕРВЕРА');
	io.close();
	server.close(() => {
		process.exit(0);
	});
});

// сервер на порту 3000
server.listen(3000, () => {
	console.log('СЕРВЕР ЗАПУЩЕН')
});