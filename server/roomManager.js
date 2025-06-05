class RoomManager {
	constructor(io) {
		this.io = io;
		this.rooms = new Map();
		console.log('[RoomManager] Инициализирован');
		// удаление комнат, созданных до запуска сервера
		this.clearAllRooms();
	}

	// удаление всех комнат
	clearAllRooms() {
		this.io.emit('forceDisconnect');
		this.rooms.clear();
		console.log('[RoomManager] Все комнаты очищены');
	}

	// создать уникальный ID комнаты
	generateRoomId() {
		const id = Math.floor(100 + Math.random() * 900);
		console.log(`[RoomManager] Сгенерирован ID комнаты: ${id}`);
		return id.toString();
	}

	// инициализация команыт
	initRooms() {
		this.io.on('connection', (socket) => {
			console.log(`[Socket] Новое подключение: ${socket.id}`);

			let currentRoomId = null;
			let currentUser = null;

			// подключение к комнате
			socket.on('joinRoom', ({ roomId, user }) => {
				console.log(`[Room] ${user.login} подключается к комнате ${roomId}`);
				currentUser = user;

				if (currentRoomId) {
					socket.leave(currentRoomId);
					this.removeUserFromRoom(currentRoomId, user.id);
				}

				currentRoomId = roomId;
				socket.join(roomId);

				this.addUserToRoom(roomId, { ...user, isAdmin: false });
				this.updateRoomUsers(roomId);
			});

			// создание комнаты
			socket.on('createRoom', (user) => {
				const roomId = this.generateRoomId();
				console.log(`[Room] ${user.login} создаёт комнату ${roomId}`);

				if (currentRoomId) {
					socket.leave(currentRoomId);
					this.removeUserFromRoom(currentRoomId, user.id);
				}

				currentRoomId = roomId;
				socket.join(roomId);

				// создатель становится админом
				this.addUserToRoom(roomId, { ...user, isAdmin: true });
				this.updateRoomUsers(roomId);
				socket.emit('roomCreated', roomId);
			});

			// покинуть комнату
			socket.on('leaveRoom', () => {
				if (currentRoomId && currentUser) {
					console.log(`[Room] ${currentUser.login} покидает комнату ${currentRoomId}`);
					socket.leave(currentRoomId);
					this.removeUserFromRoom(currentRoomId, currentUser.id);
					currentRoomId = null;
					currentUser = null;
				}
			});

			// отключиться от комнаты
			socket.on('disconnect', () => {
				if (currentRoomId && currentUser) {
					console.log(`[Socket] ${currentUser.login} отключился от комнаты ${currentRoomId}`);
					this.removeUserFromRoom(currentRoomId, currentUser.id);
				}
			});
		});
	}

	// добавление игрока в комнату
	addUserToRoom(roomId, user) {
		if (!this.rooms.has(roomId)) {
			this.rooms.set(roomId, {
				users: [],
				createdAt: new Date()
			});
		}

		const room = this.rooms.get(roomId);
		const existingUser = room.users.find(u => u.id === user.id);

		if (!existingUser) {
			room.users.push(user);
			if (room.users.length === 1) {
				user.isAdmin = true;
			}
		} else {
			user.isAdmin = existingUser.isAdmin;
		}
	}

	// удаление игрока из комнаты
	removeUserFromRoom(roomId, userId) {
		if (!this.rooms.has(roomId)) return;

		const room = this.rooms.get(roomId);
		const wasAdmin = room.users.some(u => u.id === userId && u.isAdmin);
		room.users = room.users.filter(u => u.id !== userId);

		// назначение нового админ
		if (wasAdmin && room.users.length > 0) {
			room.users[0].isAdmin = true;
			console.log(`[Room] Новый админ: ${room.users[0].login}`);
		}

		if (room.users.length === 0) {
			console.log(`[Room] Комната ${roomId} удалена`);
			this.rooms.delete(roomId);
		} else {
			this.updateRoomUsers(roomId);
		}
	}

	// обновление состава комнаты
	updateRoomUsers(roomId) {
		if (!this.rooms.has(roomId)) return;

		const room = this.rooms.get(roomId);
		this.io.to(roomId).emit('roomUpdate', {
			roomId,
			users: room.users
		});
	}
}

module.exports = RoomManager;