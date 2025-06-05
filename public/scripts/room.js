document.addEventListener('DOMContentLoaded', () => {
	const urlParams = new URLSearchParams(window.location.search);
	const roomId = urlParams.get('room');

	if (!roomId) {
		window.location.href = '/';
		return;
	}

	document.getElementById('roomIdDisplay').textContent = roomId;

	const token = localStorage.getItem('pokerToken');
	if (!token) {
		window.location.href = '/';
		return;
	}

	socket.emit('joinRoom', {
		roomId,
		user: {
			id: token,
			login: localStorage.getItem('pokerLogin'),
			rating: parseInt(localStorage.getItem('pokerRating')),
			// Не устанавливаем isAdmin здесь - сервер сам определит
		}
	});

	document.getElementById('leaveRoomBtn').addEventListener('click', () => {
		socket.emit('leaveRoom');
		window.location.href = '/';
	});
});

socket.on('roomUpdate', (data) => {
	const playersList = document.getElementById('playersList');
	const currentUserId = localStorage.getItem('pokerToken');

	playersList.innerHTML = data.users.map(user => `
    <div class="player ${user.id === currentUserId ? 'current-player' : ''}">
      ${user.login} (${user.rating})
      ${user.isAdmin ? '👑' : ''}
    </div>
  `).join('');
});

socket.on('disconnect', () => {
	alert('Disconnected from server. Reconnecting...');
});

socket.on('connect', () => {
	const urlParams = new URLSearchParams(window.location.search);
	const roomId = urlParams.get('room');
	const token = localStorage.getItem('pokerToken');

	if (roomId && token) {
		socket.emit('joinRoom', {
			roomId,
			user: {
				id: token,
				login: localStorage.getItem('pokerLogin'),
				rating: parseInt(localStorage.getItem('pokerRating'))
			}
		});
	}
});

socket.on('serverShutdown', () => {
	alert('Сервер перезапускается. Вы будете перенаправлены на главную страницу.');
	window.location.href = '/';
});

socket.on('forceDisconnect', () => {
	localStorage.removeItem('currentRoom');
});