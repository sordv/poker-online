document.addEventListener('DOMContentLoaded', () => {
    // нажатие на создать комнату
    document.getElementById('createRoomBtn').addEventListener('click', () => {
        const token = localStorage.getItem('pokerToken');
        if (!token) return alert('Сначала выполните вход!');

        socket.emit('createRoom', {
            id: token,
            login: localStorage.getItem('pokerLogin'),
            rating: parseInt(localStorage.getItem('pokerRating'))
        });
    });

    // нажатие на присоединиться к комнате
    document.getElementById('joinRoomBtn').addEventListener('click', () => {
        const token = localStorage.getItem('pokerToken');
        const roomId = document.getElementById('roomIdInput').value.trim();

        if (!token) return alert('Сначала выполните вход!');
        if (!roomId) return alert('Введите ID комнаты!');

        socket.emit('joinRoom', {
            roomId,
            user: {
                id: token,
                login: localStorage.getItem('pokerLogin'),
                rating: parseInt(localStorage.getItem('pokerRating'))
            }
        });
    });

    // перенаправление на страницу комнаты по ее ID
    socket.on('roomCreated', (roomId) => {
        window.location.href = `/room.html?room=${roomId}`;
    });

    // обновление комнаты
    socket.on('roomUpdate', (data) => {
        if (window.location.pathname === '/room.html') return;
        window.location.href = `/room.html?room=${data.roomId}`;
    });
});