const socket = io();

// переподключение
let attempts = 0;
const maxAttempts = 3;

function connectSocket() {
	socket.io.on('reconnect_attempt', () => {
		attempts++;
		if (attempts > maxAttempts) {
			alert('Не удалось подключиться. Обновите страницу.');
			window.location.href = '/';
		}
	});

	socket.io.on('reconnect', () => {
		attempts = 0;
		const roomId = new URLSearchParams(window.location.search).get('room');
		if (roomId) {
			window.location.href = '/';
		}
	});
}

connectSocket();