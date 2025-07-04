
import React, { useState, useEffect } from 'react';
import Board from './Board';
import { socket } from '../socket';
import './Game.css';

const Game: React.FC = () => {
  const [playerName, setPlayerName] = useState('');
  const [room, setRoom] = useState('');
  const [game, setGame] = useState<any>(null);
  const [player, setPlayer] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [chat, setChat] = useState<{ player: string, message: string }[]>([]);

  useEffect(() => {
    socket.on('game_update', (updatedGame) => {
      setGame(updatedGame);
    });

    socket.on('player_assign', (player) => {
      setPlayer(player);
    });

    socket.on('chat_message', (message) => {
      setChat((prevChat) => [...prevChat, message]);
    });

    socket.on('invalid_move', (message) => {
      alert(message);
    });

    return () => {
      socket.off('game_update');
      socket.off('player_assign');
      socket.off('chat_message');
      socket.off('invalid_move');
    };
  }, []);

  const handleJoinGame = () => {
    if (playerName && room) {
      socket.emit('join_game', { playerName, room });
    }
  };

  const handleClick = (i: number) => {
    if (game.turn === player) {
      socket.emit('make_move', { room, index: i });
    } else {
      alert('Not your turn');
    }
  };

  const handleSendMessage = () => {
    if (message) {
      socket.emit('chat_message', { room, message: { player: playerName, message } });
      setMessage('');
    }
  };

  const winner = game && calculateWinner(game.board);
  let status;
  if (winner) {
    status = `Winner: ${winner}`;
  } else if (game && game.board.every((square: any) => square !== null)) {
    status = 'Draw';
  } else if (game) {
    status = `Next player: ${game.turn}`;
  }

  return (
    <div className="game">
      {!game ? (
        <div>
          <input
            type="text"
            placeholder="Enter your name"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
          />
          <input
            type="text"
            placeholder="Enter room name"
            value={room}
            onChange={(e) => setRoom(e.target.value)}
          />
          <button onClick={handleJoinGame}>Join Game</button>
        </div>
      ) : (
        <div className="game-container">
          <div className="game-board">
            <Board squares={game.board} onClick={handleClick} />
            <div className="game-info">
              <div>{status}</div>
              <div>You are player: {player}</div>
            </div>
          </div>
          <div className="chat-container">
            <div className="chat-messages">
              {chat.map((msg, index) => (
                <div key={index}><strong>{msg.player}:</strong> {msg.message}</div>
              ))}
            </div>
            <div className="chat-input">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              />
              <button onClick={handleSendMessage}>Send</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

function calculateWinner(squares: (string | null)[]) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a];
    }
  }
  return null;
}

export default Game;
