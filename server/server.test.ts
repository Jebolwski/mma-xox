import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { io as ioClient, Socket as ClientSocket } from 'socket.io-client';
import { v4 as uuidv4 } from 'uuid';

let httpServer: any;
let ioServer: Server;
let clientSocket1: ClientSocket;
let clientSocket2: ClientSocket;
const SERVER_URL = 'http://localhost:3001';

// Test ayarları
beforeAll(() => {
    return new Promise<void>((resolve) => {
        httpServer = createServer();
        ioServer = new Server(httpServer, {
            cors: {
                origin: '*',
                methods: ['GET', 'POST'],
            },
        });

        // Server event handlers
        const rooms = new Map();

        ioServer.on('connection', (socket) => {
            console.log('Test: Kullanıcı bağlandı:', socket.id);

            // Oda oluşturma
            socket.on('createRoom', () => {
                const roomId = uuidv4().substring(0, 6).toUpperCase();
                rooms.set(roomId, {
                    id: roomId,
                    players: [socket.id],
                });
                socket.join(roomId);
                socket.emit('roomCreated', roomId);
                console.log(`Test: Oda oluşturuldu: ${roomId}`);
            });

            // Odaya katılma
            socket.on('joinRoom', (roomId: string) => {
                const room = rooms.get(roomId);
                if (room && room.players.length < 2) {
                    room.players.push(socket.id);
                    socket.join(roomId);
                    socket.emit('joinedRoom', roomId);
                    ioServer.to(roomId).emit('gameStart', {
                        redPlayer: room.players[0],
                        bluePlayer: room.players[1],
                    });
                    console.log(`Test: Oyuncu ${socket.id} odaya katıldı: ${roomId}`);
                } else {
                    socket.emit('roomError', 'Oda bulunamadı veya dolu');
                }
            });

            // Oyun hamlesi
            socket.on('makeMove', (data: { roomId: string; move: any }) => {
                const room = rooms.get(data.roomId);
                if (room) {
                    room.gameState = data.move;
                    socket.to(data.roomId).emit('moveMade', data.move);
                    console.log(`Test: Hamle yapıldı: ${data.roomId}`);
                }
            });

            // Bağlantı koptuğunda
            socket.on('disconnect', () => {
                rooms.forEach((room, roomId) => {
                    if (room.players.includes(socket.id)) {
                        ioServer.to(roomId).emit('playerDisconnected');
                        rooms.delete(roomId);
                    }
                });
                console.log('Test: Kullanıcı bağlantısı kesildi:', socket.id);
            });
        });

        httpServer.listen(3001, () => {
            console.log('Test Server başladı: http://localhost:3001');
            resolve();
        });
    });
});

afterAll(() => {
    ioServer.close();
    httpServer.close();
});

// TESTLER
describe('Socket.io Oda ve Oyun Mekanikler', () => {

    it('Istemci başarıyla sunucuya bağlanabilir', () => {
        return new Promise<void>((resolve, reject) => {
            clientSocket1 = ioClient(SERVER_URL, {
                reconnection: true,
                reconnectionDelay: 100,
                reconnectionDelayMax: 500,
            });

            clientSocket1.on('connect', () => {
                expect(clientSocket1.connected).toBe(true);
                console.log('✓ İstemci başarıyla bağlandı');
                resolve();
            });

            clientSocket1.on('connect_error', (error) => {
                reject(new Error(`Bağlantı hatası: ${error}`));
            });

            setTimeout(() => {
                reject(new Error('Bağlantı zaman aşımı'));
            }, 5000);
        });
    });

    it('Kullanıcı başarıyla oda oluşturabilir', () => {
        return new Promise<void>((resolve, reject) => {
            clientSocket1.emit('createRoom');

            clientSocket1.on('roomCreated', (roomId: string) => {
                expect(roomId).toBeTruthy();
                expect(roomId.length).toBe(6);
                console.log(`✓ Oda başarıyla oluşturuldu: ${roomId}`);

                // roomId'yi sonraki test için kaydet
                (clientSocket1 as any).testRoomId = roomId;
                resolve();
            });

            setTimeout(() => {
                reject(new Error('roomCreated event alınamadı'));
            }, 5000);
        });
    });

    it('İkinci kullanıcı oda oluşturan ile aynı odaya katılabilir', () => {
        return new Promise<void>((resolve, reject) => {
            const roomId = (clientSocket1 as any).testRoomId;

            if (!roomId) {
                reject(new Error('Test odası bulunamadı'));
                return;
            }

            // İkinci istemci bağlan
            clientSocket2 = ioClient(SERVER_URL, {
                reconnection: true,
                reconnectionDelay: 100,
                reconnectionDelayMax: 500,
            });

            let gameStartReceived = false;

            clientSocket2.on('connect', () => {
                clientSocket2.emit('joinRoom', roomId);
            });

            clientSocket2.on('joinedRoom', (receivedRoomId: string) => {
                expect(receivedRoomId).toBe(roomId);
                console.log(`✓ İkinci kullanıcı odaya katıldı: ${roomId}`);
            });

            clientSocket2.on('gameStart', (data) => {
                if (!gameStartReceived) {
                    gameStartReceived = true;
                    expect(data.redPlayer).toBeTruthy();
                    expect(data.bluePlayer).toBeTruthy();
                    expect(data.bluePlayer).toBe(clientSocket2.id);
                    console.log('✓ Oyun başladı, her iki oyuncu bilgilendirildi');
                    resolve();
                }
            });

            setTimeout(() => {
                if (!gameStartReceived) {
                    reject(new Error('gameStart event alınamadı'));
                }
            }, 5000);
        });
    });

    it('Oyuncu hamle yapabilir ve diğer oyuncu bunu alır', () => {
        return new Promise<void>((resolve, reject) => {
            const roomId = (clientSocket1 as any).testRoomId;
            const testMove = { x: 0, y: 1, player: 'red' };

            clientSocket2.on('moveMade', (move) => {
                expect(move).toEqual(testMove);
                console.log('✓ İkinci oyuncu hamlesi başarıyla alındı');
                resolve();
            });

            clientSocket1.emit('makeMove', {
                roomId,
                move: testMove,
            });

            setTimeout(() => {
                reject(new Error('moveMade event alınamadı'));
            }, 5000);
        });
    });

    it('Üçüncü kullanıcı dolu odaya katılamaz', () => {
        return new Promise<void>((resolve, reject) => {
            const roomId = (clientSocket1 as any).testRoomId;

            const clientSocket3 = ioClient(SERVER_URL, {
                reconnection: true,
                reconnectionDelay: 100,
                reconnectionDelayMax: 500,
            });

            clientSocket3.on('connect', () => {
                clientSocket3.emit('joinRoom', roomId);
            });

            clientSocket3.on('roomError', (error: string) => {
                expect(error).toBe('Oda bulunamadı veya dolu');
                console.log('✓ Dolu odaya katılma başarıyla engellendi');
                clientSocket3.disconnect();
                resolve();
            });

            setTimeout(() => {
                clientSocket3.disconnect();
                reject(new Error('roomError event alınamadı'));
            }, 5000);
        });
    });

    it('Oyuncu bağlantısı kesildiğinde oda silinir', () => {
        return new Promise<void>((resolve, reject) => {
            // Yeni oda oluştur
            const newClient1 = ioClient(SERVER_URL, {
                reconnection: false,
            });

            newClient1.on('connect', () => {
                newClient1.emit('createRoom');
            });

            newClient1.on('roomCreated', (roomId: string) => {
                // İkinci client bağlan
                const newClient2 = ioClient(SERVER_URL, {
                    reconnection: false,
                });

                newClient2.on('connect', () => {
                    newClient2.emit('joinRoom', roomId);
                });

                newClient2.on('joinedRoom', () => {
                    // İlk client'ı kapat
                    newClient1.disconnect();

                    // Diğer client disconnect event almalı
                    newClient2.on('playerDisconnected', () => {
                        console.log('✓ Oyuncu bağlantı kesildiğinde diğeri bilgilendirildi');
                        newClient2.disconnect();
                        resolve();
                    });
                });

                setTimeout(() => {
                    newClient1.disconnect();
                    newClient2.disconnect();
                    reject(new Error('playerDisconnected event alınamadı'));
                }, 5000);
            });
        });
    });
});
