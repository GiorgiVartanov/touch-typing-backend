import { Server as HttpServer } from 'http';
import { Socket, Server } from 'socket.io';
import { v4 } from 'uuid'; //Purpose is to hide socket.id from other users. Also to assign a unique id to each active game.
import { GameState, MatchState, id_list } from '../models/Game.model';
import Game from "../models/Game.model"
import jwt from "jsonwebtoken"
import User from "../models/User.model"

//Too MANY details... :OOOOOO
export class ServerSocket {
    public static instance: ServerSocket;
    public io: Server;

    //list of all the active users.
    public users: id_list;
    //list of usernames of each user.
    public usernames: id_list;
    //each game 
    public games: { [guid: string]: GameState };
    //each player is assigned to a game. 
    public user_to_game: id_list;

    constructor(server: HttpServer) {
        ServerSocket.instance = this;
        this.users        = {};
        this.games        = {};
        this.user_to_game = {};
        this.usernames    = {};
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

        socket.on('handshake', async (token: string | null, username: string | undefined, callback: (username: string, uid: string, users: string[], game_id: string | undefined, games: { [gid: string]: GameState }) => void) => {

            const reconnected = Object.values(this.users).includes(socket.id);

            if (reconnected) {

                const uid = this.GetUidFromSocketID(socket.id);
                const username = this.usernames[uid];
                const users = Object.values(this.users);
                const game_id = this.user_to_game[uid]
                //const games = Object.values(this.games);

                if (uid) {
                    callback(username, uid, users, game_id, this.games);
                    return;
                }
            }

            const uid = v4();
            this.users[uid] = socket.id;

            if(token) { //for valid users, assign them their usernames...
                // verify  token
                const decoded: any = jwt.verify(token, process.env.JWT_SECRET)

                // get user from the token
                const user = await User.findById(decoded.id).select("-password")     
                
                if(user && user.username === username){ // არ ვიცი, გიომ ეს მითხრა ქენიო თუ სხვა რამე თქვა...
                    if(Object.values(this.usernames).includes(username)){
                        console.log("disconnecting user: ", username)
                        this.SendMessage("already_connected", [socket.id])
                        socket.disconnect()
                        delete this.users[uid]
                        return;
                    }
                    this.usernames[uid] = username
                }
            }

            if(this.usernames[uid] === undefined) //For guests...
                this.usernames[uid] = this.generateUserName(uid);
            const users = Object.values(this.users);
            //const games = Object.values(this.games);
            callback(this.usernames[uid], uid, users, undefined, this.games);

            this.SendMessage(
                'user_connected',
                users.filter((id) => id !== socket.id),
                users
            );
        });
        //როცა თამაშს მორჩა, და დადისქონექთდა საიტიდან, მაგისი user_to_game[uid] დარჩენილია მაინც. წაიშლება მაშინ, როცა თამაში მორჩება.
        //თუ სულ ბოლოღაა დარჩენილი დაწყებულ თამაშში და გავიდა უცბად, ორჯერ გადაიგზავნება თამაშის update ერთი user_disconnected, მეორე: game_modified
        socket.on('disconnect', () => {

            const uid = this.GetUidFromSocketID(socket.id);

            if (uid) {                
                let game_modified: boolean = this.user_to_game[uid] !== undefined;        
                
                //If the user hasn't finished the match, but disconnected for some reason...
                if(game_modified)
                    this.removeGameUser(uid);
            
                delete this.users[uid];
                delete this.usernames[uid];

                const users = Object.values(this.users);

                this.SendMessage('user_disconnected', users, {uid: socket.id, games: (game_modified ? this.games : undefined)});
            }
        });

        socket.on('create_game', (text: string, time_limit: number, user_limit: number,
             callback: (game_id: string, games: { [gid: string]: GameState }) => void) => {
            const uid = this.GetUidFromSocketID(socket.id);
            if(uid && this.user_to_game[uid]===undefined) {
                const game_id = v4();
                const initial_gul : MatchState = {};
                initial_gul[uid] = {
                    WPM: 0,
                    has_finished: false,
                    username: this.usernames[uid],
                    wants_to_see_result: true,
                }
                this.games[game_id] = {
                    gul: initial_gul,
                    text: text,
                    time_limit: time_limit,
                    user_limit: user_limit,
                    date: new Date,
                    has_started: false,
                    active_players: 1,
                    spectators: {},
                }
                this.user_to_game[uid] = game_id;

                //initialize the game for The Creator:
                callback(game_id, this.games);
                //Send the message to everyone, but THE CREATOR
                this.SendMessage('game_added', Object.values(this.users).filter(id=>socket.id!==id), this.games);
            }
        });

        socket.on('join_game', (gid: string, callback: ()=>void) => {
            const uid = this.GetUidFromSocketID(socket.id);
            if(uid && this.user_to_game[uid]===undefined){ //User isn't playing or spectating. 
                this.user_to_game[uid] = gid;
                //players to be updated (those who hasn't left the game)
                let keys = Object.keys(this.games[gid].gul).filter(key=>this.games[gid].gul[key].wants_to_see_result===true);
                if(this.games[gid].has_started !== true){ //join as a player
                    this.games[gid].active_players++;
                    this.games[gid].gul[uid] = {
                        WPM: 0,
                        has_finished: false,
                        username: this.usernames[uid],
                        wants_to_see_result: true,
                    };
                    keys.push(uid)   
                    if(keys.length === this.games[gid].user_limit) {
                        this.games[gid].has_started = true;
                        this.SendMessage('match_modified', this.getSocketIdsFromUids(keys), this.games) //Can be changed to taking a specific game and modifying games[gid] only... probably should do that...
                    }
                    //probably should only update the specific game, instead of the whole games object.
                    this.SendMessage('game_modified',Object.values(this.users).filter(id => this.user_to_game[id]===undefined), this.games)             
                } else { //Join as a spectator.
                    this.games[gid].spectators[uid] = this.usernames[uid]
                    keys = keys.concat(Object.keys(this.games[gid].spectators))
                    this.SendMessage('match_modified', this.getSocketIdsFromUids(keys), this.games)
                }
                callback() //navigates users to the game on the frontend                    
            }
        });

        socket.on('leave_game', (game_id: string, callback: ()=>void) => {
            const uid = this.GetUidFromSocketID(socket.id);
            if(uid && this.user_to_game[uid] === game_id && this.games[game_id] && this.games[game_id].gul[uid]){
                this.games[game_id].gul[uid].wants_to_see_result = false,
                this.removeGameUser(uid);
                callback()
                this.SendMessage('game_modified', Object.values(this.users), this.games)
            }
        })

        socket.on('modify_match', (game_id: string, currentWordIndex: number, callback: ()=>void) => {
            callback();
            const uid = this.GetUidFromSocketID(socket.id);
            //only active players modify the match, not the spectators or anyone else.
            if(this.games[game_id] && this.games[game_id].gul[uid]!== undefined){
                this.games[game_id].gul[uid].WPM = currentWordIndex;            
                //players (who want\have to be updated) + spectators
                const keys = Object.keys(this.games[game_id].gul)
                    .filter(key => this.games[game_id].gul[key].wants_to_see_result === true)
                    .concat(Object.keys(this.games[game_id].spectators))
                //have to change this to only update this.games[game_id] nothing else...
                this.SendMessage("match_modified", this.getSocketIdsFromUids(keys), this.games)
            }
        })

        //some cheater may send incorrect user_wpm, have to take care of that...
        socket.on('user_finish', async (user_wpm: number, game_id: string, callback: ()=>{}) => {
            callback();
            console.log("user finished with wpm: ", user_wpm);
            const uid = this.GetUidFromSocketID(socket.id);
            this.games[game_id].gul[uid].WPM = user_wpm;        
            this.games[game_id].gul[uid].has_finished = true;
            this.games[game_id].active_players--;
            this.removeGameUser(uid);
        })
    };

    GetUidFromSocketID = (id: string) => {
        return Object.keys(this.users).find((uid) => this.users[uid] === id);
    };

    SendMessage = (name: string, users: string[], payload?: Object) => {
        users.forEach((id) => (payload ? this.io.to(id).emit(name, payload) : this.io.to(id).emit(name)));
    };

    //Maybe delete the game locally but save it in the database, and send all the active users the game_id to that object from the database
    removeGameUser = async (uid: string) => {
        if(this.user_to_game[uid]) {
            const game_id = this.user_to_game[uid]
            if(this.games[game_id].spectators[uid] !== undefined) { //spectator leaves
                delete this.games[game_id].spectators[uid]
                delete this.user_to_game[uid]
            } else { //active player leaves
                //user left an active game without finishing, or left a game room
                if(this.games[game_id].gul[uid].has_finished !== true)
                    this.games[game_id].active_players--
            
                if(this.games[game_id].has_started) {
                    //if the match has started and the user has left without finishing it.
                    if(this.games[game_id].gul[uid].has_finished !== true) {
                        this.games[game_id].gul[uid].WPM = -1
                        this.games[game_id].gul[uid].has_finished = true
                        this.games[game_id].gul[uid].wants_to_see_result = false //necessary if a player closed\refreshed the tab
                        delete this.user_to_game[uid];
                    }
                } else {
                    delete this.games[game_id].gul[uid]
                    delete this.user_to_game[uid]
                }

                if(this.games[game_id].active_players === 0) { //no active players
                    //I copy "gul" separately, since it's assigned by reference by default (not desired when it's deleted afterwards from another object (check code below))
                    const game_to_store = {...this.games[game_id], gul: {...this.games[game_id].gul}, spectators: {...this.games[game_id].spectators}}
                    //remove every spectator
                    const game_has_finished = this.games[game_id].has_started
                    if(game_has_finished === true){ //removing connected users from the game
                        Object.keys(this.games[game_id].gul).forEach(uid=>{ //players
                            if(this.user_to_game[uid]!==undefined)
                                delete this.user_to_game[uid]
                            delete this.games[game_id].gul[uid]
                        });
                        Object.keys(this.games[game_id].spectators).forEach(uid=>{ //spectators
                            delete this.user_to_game[uid]
                            delete this.games[game_id].spectators[uid]
                        })
                    }
                    //deleting the game object from the list of games...
                    delete this.games[game_id]       

                    //If the game has finished, then add it to the DATABASE 
                    if(game_has_finished === true) {
                        //list of users to be updated:
                        //active players who want to see the result
                        let keys = Object.keys(game_to_store.gul).filter(key=>game_to_store.gul[key].wants_to_see_result===true)
                        //active spectators
                        keys = keys.concat(Object.keys(game_to_store.spectators))
                        //sort the user list by WPM:
                        game_to_store.gul = this.sortTheDictionary(game_to_store.gul)
                        //convert into a BeAuTiFul FoRm
                        const beautiful_dictionary : MatchState = {}
                        Object.values(game_to_store.gul).forEach((val)=>beautiful_dictionary[val.username]={WPM: val.WPM})
                        game_to_store.gul = beautiful_dictionary
                        //save match to the database
                        const res = await Game.create(game_to_store)  
                        //navigate connected users to history
                        this.SendMessage("match_finished", this.getSocketIdsFromUids(keys),{ games: this.games, game_id: res._id })
                        //notify everyone about the game update.
                        this.SendMessage("game_modified", Object.values(this.users), this.games)
                        return
                    }
                }
            }
            //can be modified to... hmm... give to users who need it... idk, somehow don't send the whole database to every user...
            this.SendMessage("match_modified", Object.values(this.users), this.games)
        }            
    }

    generateUserName = (uid: string) => {
        return "Guest-"+uid.slice(0,10);
    }

    getSocketIdsFromUids = (uids: string[]) => {
        return uids.map(id => this.users[id])
    }

    sortTheDictionary = (dict: MatchState) => {
        let users_to_sort = Object.keys(dict).map(key=>{
            return {key:key, val: dict[key]}
        });
        users_to_sort.sort( (a, b) => b.val.WPM - a.val.WPM );
        let sorted_dictionary : MatchState = {} as MatchState
        users_to_sort.forEach(el=>sorted_dictionary[el.key]=el.val)
        return sorted_dictionary
    }
}