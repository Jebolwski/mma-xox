import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: "http://localhost:5173", // Frontend URL'iniz
        methods: ["GET", "POST"]
    }
});

interface Room {
    id: string;
    players: string[];
    gameState?: any;
    filters?: any;
}

const rooms: Map<string, Room> = new Map();

io.on('connection', (socket) => {
    console.log('Bir kullanıcı bağlandı:', socket.id);

    // Oda oluşturma
    socket.on('createRoom', () => {
        const roomId = uuidv4().substring(0, 6).toUpperCase();
        rooms.set(roomId, {
            id: roomId,
            players: [socket.id],
        });
        socket.join(roomId);
        socket.emit('roomCreated', roomId);
    });

    // Odaya katılma
    socket.on('joinRoom', (roomId: string) => {
        const room = rooms.get(roomId);
        if (room && room.players.length < 2) {
            room.players.push(socket.id);
            socket.join(roomId);
            socket.emit('joinedRoom', roomId);
            io.to(roomId).emit('gameStart', {
                redPlayer: room.players[0],
                bluePlayer: room.players[1]
            });
        } else {
            socket.emit('roomError', 'Oda bulunamadı veya dolu');
        }
    });

    // Filtre güncelleme
    socket.on('updateFilters', (data: { roomId: string, filters: any }) => {
        const room = rooms.get(data.roomId);
        if (room) {
            room.filters = data.filters;
            socket.to(data.roomId).emit('filtersUpdated', data.filters);
        }
    });

    // Oyun hamlesi
    socket.on('makeMove', (data: { roomId: string, move: any }) => {
        const room = rooms.get(data.roomId);
        if (room) {
            room.gameState = data.move;
            socket.to(data.roomId).emit('moveMade', data.move);
        }
    });

    // Bağlantı koptuğunda
    socket.on('disconnect', () => {
        rooms.forEach((room, roomId) => {
            if (room.players.includes(socket.id)) {
                io.to(roomId).emit('playerDisconnected');
                rooms.delete(roomId);
            }
        });
    });
});

httpServer.listen(3000, () => {
    console.log('Server çalışıyor: http://localhost:3000');
}); 