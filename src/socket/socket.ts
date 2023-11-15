import { Server as HttpServer } from 'http';
import { Socket, Server } from 'socket.io';
import { v4 } from 'uuid';
import { Game } from '../models/Game.model';

interface id_list {
    [id: string] : string
}

export class ServerSocket {
    public static instance: ServerSocket;
    public io: Server;

    //list of all the active users.
    public users: id_list;
    //each game 
    public games: { [gid: string]: Game };
    //each player is assigned to a game. 
    public user_to_game: id_list;

    constructor(server: HttpServer) {
        ServerSocket.instance = this;
        this.users        = {};
        this.games        = {};
        this.user_to_game = {};
        this.io = new Server(server, {
            serveClient: false,
            pingInterval: 10000,
            pingTimeout: 5000,
            cookie: false,
            cors: {
                origin: process.env.CLIENT_URL,
                credentials: true
            }
        });

        this.io.on('connection', this.StartListeners);
    }

    StartListeners = (socket: Socket) => {

        socket.on('handshake', (callback: (uid: string, users: string[], game_id: string | undefined, games: { [gid: string]: Game }) => void) => {

            const reconnected = Object.values(this.users).includes(socket.id);

            if (reconnected) {

                const uid = this.GetUidFromSocketID(socket.id);
                const users = Object.values(this.users);
                const game_id = this.user_to_game[uid]
                //const games = Object.values(this.games);

                if (uid) {
                    callback(uid, users, game_id, this.games);
                    return;
                }
            }

            const uid = v4();
            this.users[uid] = socket.id;

            const users = Object.values(this.users);
            //const games = Object.values(this.games);
            callback(uid, users, undefined, this.games);

            this.SendMessage(
                'user_connected',
                users.filter((id) => id !== socket.id),
                users
            );
        });

        socket.on('disconnect', () => {

            const uid = this.GetUidFromSocketID(socket.id);

            if (uid) {
                delete this.users[uid];
                
                let game_modified: boolean = this.user_to_game[uid] !== undefined;        

                if(game_modified)
                    this.removeGameUser(uid);

                const users = Object.values(this.users);

                this.SendMessage('user_disconnected', users, {uid: socket.id, games: (game_modified ? this.games : undefined)});
            }
        });

        socket.on('create_game', (text: string, time_limit: number, user_limit: number, callback: (game_id: string, games: { [gid: string]: Game }) => void) => {
            const uid = this.GetUidFromSocketID(socket.id);
            if(uid && this.user_to_game[uid]===undefined) {
                const game_id = v4();
                this.games[game_id] = {
                    gul: [uid],
                    text: text,
                    time_limit: time_limit,
                    user_limit: user_limit,
                }
                this.user_to_game[uid] = game_id;
                callback(game_id, this.games);

                this.SendMessage('game_added', Object.values(this.users).filter(id=>socket.id!==id), this.games);
            }
        });

        socket.on('join_game', (gid: string, callback: (gid: string )=>void) => {
            const uid = this.GetUidFromSocketID(socket.id);
            if(uid && this.user_to_game[uid]===undefined){                
                if(this.games[gid].gul.length<this.games[gid].user_limit){
                    this.user_to_game[uid] = gid;
                    this.games[gid].gul.push(uid);
                    callback(gid);       
                    this.SendMessage('game_modified',Object.values(this.users).filter(id=>this.user_to_game[id]===undefined),this.games)             
                }
            }
        });

        socket.on('leave_game', (game_id: string, callback: ()=>void) => {
            const uid = this.GetUidFromSocketID(socket.id);
            if(uid && this.user_to_game[uid]===game_id){
                this.removeGameUser(uid);
                callback()
                this.SendMessage('game_modified', Object.values(this.users), this.games)
            }
        })
    };

    GetUidFromSocketID = (id: string) => {
        return Object.keys(this.users).find((uid) => this.users[uid] === id);
    };

    SendMessage = (name: string, users: string[], payload?: Object) => {
        users.forEach((id) => (payload ? this.io.to(id).emit(name, payload) : this.io.to(id).emit(name)));
    };

    removeGameUser = (uid: string) => {
        if(this.user_to_game[uid]) {
            const game_id = this.user_to_game[uid]                    
            if(this.games[game_id].gul.length > 1) {
                this.games[game_id].gul = 
                this.games[game_id].gul.filter(id=>id!=uid)
            } else {
                delete this.games[game_id]                        
            }
            delete this.user_to_game[uid]
        }            
    }
}