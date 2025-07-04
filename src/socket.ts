import { io } from 'socket.io-client';

const URL = 'https://tic-tac-toe-node-wicket.onrender.com:3000';
export const socket = io(URL);
