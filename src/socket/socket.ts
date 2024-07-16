import { Server as HttpServer } from "http"
import { Socket, Server } from "socket.io"
import { v4 } from "uuid" //Purpose is to hide socket.id from other users. Also to assign a unique id to each active game.
import { MatchState, PlayerMapState, RequestProps, Timers, id_list } from "../models/Match.model"
import Match from "../models/Match.model"
import jwt from "jsonwebtoken"
import User from "../models/User.model"
import generateFakeWords from "../util/generateFakeWords"
import Letter from "../models/Letter.model"
import Word from "../models/Word.model"
import Sentence from "../models/Sentence.model"
import updateRating from "../util/updateRating"

//Too MANY details... :OOOOOO
export class ServerSocket {
  public static instance: ServerSocket
  public io: Server

  //list of all the active users.
  public users: id_list
  //list of usernames of each user.
  public usernames: id_list
  //each match
  public matches: { [match_id: string]: MatchState }
  //each player is assigned to a match.
  public user_to_match: id_list
  //countdown of each active match
  public timers: Timers

  constructor(server: HttpServer) {
    ServerSocket.instance = this
    this.users = {}
    this.matches = {}
    this.user_to_match = {}
    this.usernames = {}
    this.timers = {}
    this.io = new Server(server, {
      serveClient: false,
      pingInterval: 10000,
      pingTimeout: 5000,
      cookie: false,
      cors: {
        origin: process.env.CLIENT_URL,
        credentials: true,
      },
    })

    this.io.on("connection", this.StartListeners)
  }

  StartListeners = (socket: Socket) => {
    socket.on(
      "handshake",
      async (
        token: string | null,
        username: string | undefined,
        callback: (
          username: string,
          uid: string,
          users: string[],
          match_id: string | undefined,
          matches: { [match_id: string]: MatchState }
        ) => void
      ) => {
        const reconnected = Object.values(this.users).includes(socket.id)

        if (reconnected) {
          const uid = this.GetUidFromSocketID(socket.id)
          if (uid) {
            const usernameOld = this.usernames[uid]
            const users = Object.values(this.users)
            const match_id = this.user_to_match[uid]

            callback(usernameOld, uid, users, match_id, this.matches)
            return
          }
        }

        const uid = v4()
        this.users[uid] = socket.id

        //for valid users, assign them their usernames...
        if (token) {
          try {
            // verify  token
            const decoded: any = jwt.verify(token, process.env.JWT_SECRET)

            // get user from the token
            const user = await User.findById(decoded.id).select("-password")

            if (user && user.username === username) {
              // არ ვიცი, გიომ ეს მითხრა ქენიო თუ სხვა რამე თქვა...
              if (Object.values(this.usernames).includes(username)) {
                console.log("disconnecting user: ", username)
                this.SendMessage("already_connected", [socket.id])
                socket.disconnect()
                delete this.users[uid]
                return
              }
              this.usernames[uid] = username
            }
          } catch (err) {
            if (err.name === "TokenExpiredError") {
              // Handle token expired error
              console.error("Token has expired")
            } else {
              // Handle other errors
              console.error("JWT verification failed:", err.message)
            }
          }
        }

        if (this.usernames[uid] === undefined)
          //For guests...
          this.usernames[uid] = this.generateUserName(uid)
        const users = Object.values(this.users)
        callback(this.usernames[uid], uid, users, undefined, this.matches)

        this.SendMessage(
          "user_connected",
          users.filter((id) => id !== socket.id),
          users
        )
      }
    )
    //როცა თამაშს მორჩა, და დადისქონექთდა საიტიდან, მაგისი user_to_game[uid] დარჩენილია მაინც. წაიშლება მაშინ, როცა თამაში მორჩება.
    //თუ სულ ბოლოღაა დარჩენილი დაწყებულ თამაშში და გავიდა უცბად, ორჯერ გადაიგზავნება თამაშის update ერთი user_disconnected, მეორე: game_modified
    socket.on("disconnect", () => {
      const uid = this.GetUidFromSocketID(socket.id)

      if (uid) {
        let match_modified: boolean = this.user_to_match[uid] !== undefined

        //If the user hasn't finished the match, but disconnected for some reason...
        if (match_modified) this.removeMatchUser(uid)

        delete this.users[uid]
        delete this.usernames[uid]

        const users = Object.values(this.users)

        this.SendMessage("user_disconnected", users, {
          uid: socket.id,
          matches: match_modified ? this.matches : undefined,
        })
      }
    })

    socket.on(
      "create_match",
      async (
        req: RequestProps,
        time_limit: number,
        user_limit: number,
        callback: (match_id: string, matches: { [match_id: string]: MatchState }) => void
      ) => {
        const uid = this.GetUidFromSocketID(socket.id)
        if (uid && this.user_to_match[uid] === undefined) {
          const match_id = v4()
          const initial_players: PlayerMapState = {}
          const creator_user = await User.findOne({ username: this.usernames[uid] })
          let user_rating = 0
          if (creator_user) {
            user_rating = creator_user.rating
          }

          initial_players[uid] = {
            WPM: 0,
            has_finished: false,
            username: this.usernames[uid],
            wants_to_see_result: true,
            rating: user_rating,
          }
          this.matches[match_id] = {
            request: req,
            players: initial_players,
            text: "",
            time_limit: time_limit,
            user_limit: user_limit,
            date: new Date(),
            has_started: false,
            active_players: 1,
            spectators: {},
          }
          this.user_to_match[uid] = match_id

          //initialize the game for The Creator:
          callback(match_id, this.matches)
          //Send the message to everyone, but THE CREATOR
          this.SendMessage(
            "match_added",
            Object.values(this.users).filter((id) => socket.id !== id),
            this.matches
          )
        }
      }
    )

    socket.on("join_match", async (match_id: string, callback: () => void) => {
      const uid = this.GetUidFromSocketID(socket.id)
      if (uid && this.user_to_match[uid] === undefined) {
        //User wasn't playing or spectating.
        this.user_to_match[uid] = match_id
        //players who will be notified (those who haven't left the game)
        let keys = Object.keys(this.matches[match_id].players).filter(
          (key) => this.matches[match_id].players[key].wants_to_see_result === true
        )
        if (this.matches[match_id].has_started !== true) {
          //join as a player
          this.matches[match_id].active_players++
          const joining_user = await User.findOne({ username: this.usernames[uid] })
          let user_rating = 0
          if (joining_user) {
            user_rating = joining_user.rating
          }
          this.matches[match_id].players[uid] = {
            WPM: 0,
            has_finished: false,
            username: this.usernames[uid],
            wants_to_see_result: true,
            rating: user_rating,
          }
          keys.push(uid)
          if (keys.length === this.matches[match_id].user_limit) {
            this.matches[match_id].has_started = true
            const text: string = await generateText(this.matches[match_id].request) //text will be sent to all the users after the game starts.
            this.matches[match_id].text = text
            this.insertTimer(match_id, this.matches[match_id].time_limit * 1000) //add a timer.
            this.SendMessage("match_modified", this.getSocketIdsFromUids(keys), this.matches) //Can be changed to taking a specific game and modifying games[gid] only... probably should do that...
          }
          //probably should only update the specific game, instead of the whole games object.
          this.SendMessage(
            "matches_modified",
            Object.values(this.users).filter((id) => this.user_to_match[id] === undefined),
            this.matches
          )
        } else {
          //Join as a spectator.
          this.matches[match_id].spectators[uid] = this.usernames[uid]
          keys = keys.concat(Object.keys(this.matches[match_id].spectators))
          this.SendMessage("match_modified", this.getSocketIdsFromUids(keys), this.matches)
        }
        callback() //navigates users to the match on the frontend
      }
    })

    socket.on("leave_match", (match_id: string, callback: () => void) => {
      const uid = this.GetUidFromSocketID(socket.id)
      if (
        uid &&
        this.user_to_match[uid] === match_id &&
        this.matches[match_id] &&
        (this.matches[match_id].players[uid] || this.matches[match_id].spectators[uid])
      ) {
        if (this.matches[match_id].players[uid])
          this.matches[match_id].players[uid].wants_to_see_result = false
        this.removeMatchUser(uid)
        callback()
        this.SendMessage("matches_modified", Object.values(this.users), this.matches)
      }
    })

    socket.on(
      "modify_match",
      (match_id: string, currentWordIndex: number, callback: () => void) => {
        callback()
        const uid = this.GetUidFromSocketID(socket.id)
        //only active players modify the match, not the spectators or anyone else.
        if (uid && this.matches[match_id] && this.matches[match_id].players[uid] !== undefined) {
          this.matches[match_id].players[uid].WPM = currentWordIndex
          //players (who want\have to be updated) + spectators
          const keys = Object.keys(this.matches[match_id].players)
            .filter((key) => this.matches[match_id].players[key].wants_to_see_result === true)
            .concat(Object.keys(this.matches[match_id].spectators))
          //have to change this to only update this.games[game_id] nothing else...
          this.SendMessage("match_modified", this.getSocketIdsFromUids(keys), this.matches)
        }
      }
    )

    //some cheater may send incorrect user_wpm, have to take care of that...
    socket.on("user_finish", async (user_wpm: number, match_id: string, callback: () => {}) => {
      callback()
      console.log("user finished with wpm: ", user_wpm)
      const uid = this.GetUidFromSocketID(socket.id)
      if (uid) {
        this.matches[match_id].players[uid].WPM = user_wpm
        this.matches[match_id].players[uid].has_finished = true
        this.matches[match_id].active_players--
        this.removeMatchUser(uid)
      }
    })
  }

  GetUidFromSocketID = (id: string) => {
    return Object.keys(this.users).find((uid) => this.users[uid] === id)
  }

  SendMessage = (name: string, users: string[], payload?: Object) => {
    users.forEach((id) =>
      payload ? this.io.to(id).emit(name, payload) : this.io.to(id).emit(name)
    )
  }

  //Maybe delete the match locally but save it in the database, and send all the active users the match_id to that object from the database
  removeMatchUser = async (uid: string) => {
    if (this.user_to_match[uid]) {
      const match_id = this.user_to_match[uid]
      if (this.matches[match_id].spectators[uid] !== undefined) {
        //spectator leaves
        delete this.matches[match_id].spectators[uid]
        delete this.user_to_match[uid]
      } else {
        //active player leaves
        //user left an active match without finishing, or left a match room
        if (this.matches[match_id].players[uid].has_finished !== true)
          this.matches[match_id].active_players--

        if (this.matches[match_id].has_started) {
          //if the match has started and the user has left without finishing it.
          if (this.matches[match_id].players[uid].has_finished !== true) {
            this.matches[match_id].players[uid].WPM = -1
            this.matches[match_id].players[uid].has_finished = true
            this.matches[match_id].players[uid].wants_to_see_result = false //necessary if a player closed\refreshed the tab
            delete this.user_to_match[uid]
          }
        } else {
          delete this.matches[match_id].players[uid]
          delete this.user_to_match[uid]
        }

        if (this.matches[match_id].active_players === 0) {
          //no active players
          //I copy "players" separately, since objects are assigned by reference by default (not desired when it's deleted afterwards from another object (check code below))
          const match_to_store = {
            ...this.matches[match_id],
            players: { ...this.matches[match_id].players },
            spectators: { ...this.matches[match_id].spectators },
          }
          //remove every spectator
          const match_has_finished = this.matches[match_id].has_started
          if (match_has_finished === true) {
            //removing connected users from the match
            Object.keys(this.matches[match_id].players).forEach((uid) => {
              //players
              if (this.user_to_match[uid] !== undefined) delete this.user_to_match[uid]
              delete this.matches[match_id].players[uid]
            })
            //removing spectators
            Object.keys(this.matches[match_id].spectators).forEach((uid) => {
              delete this.user_to_match[uid]
              delete this.matches[match_id].spectators[uid]
            })
          }
          //deleting the match object from the list of matches...
          delete this.matches[match_id]
          //deleting the timer object from the list of timers
          if (match_id in this.timers) delete this.timers[match_id]

          //If the match has finished, then add it to the DATABASE
          if (match_has_finished === true) {
            //update the rating of the players
            const users_for_rating_change = this.sortTheDictionary(match_to_store.players)
            const rating_changes: number[] = updateRating(users_for_rating_change)

            //list of users to be updated:
            //active players who want to see the result
            let keys = Object.keys(match_to_store.players).filter(
              (key) => match_to_store.players[key].wants_to_see_result === true
            )
            //active spectators
            keys = keys.concat(Object.keys(match_to_store.spectators))
            //sort the user list by WPM:
            match_to_store.players = this.sortTheDictionary(match_to_store.players)
            //convert into a BeAuTiFul FoRm
            const beautiful_dictionary: PlayerMapState = {}
            Object.values(match_to_store.players).forEach(
              (val) => (beautiful_dictionary[val.username] = { WPM: val.WPM, rating: val.rating })
            )
            match_to_store.players = beautiful_dictionary
            //save match to the database
            const res = await Match.create(match_to_store)
            //navigate connected users to history
            this.SendMessage("match_finished", this.getSocketIdsFromUids(keys), {
              matches: this.matches,
              match_id: res._id,
            })
            //notify everyone about the match update.
            this.SendMessage("matches_modified", Object.values(this.users), this.matches)
            let position = 0
            for (const player in users_for_rating_change) {
              if (users_for_rating_change[player].username) {
                const user = await User.findOne({
                  username: users_for_rating_change[player].username,
                })
                if (user) {
                  await User.updateOne(
                    { username: user.username },
                    { $inc: { rating: rating_changes[position] } }
                  )
                  this.SendMessage(
                    "rating_changes",
                    this.getSocketIdsFromUids([player]),
                    user.rating + rating_changes[position]
                  )
                }
              }
              ++position
            }
            return
          }
        }
      }
      //can be modified to... hmm... give to users who need it... idk, somehow don't send the whole database to every user...
      this.SendMessage("match_modified", Object.values(this.users), this.matches)
    }
  }

  generateUserName = (uid: string) => {
    return "Guest-" + uid.slice(0, 10)
  }

  getSocketIdsFromUids = (uids: string[]) => {
    return uids.map((id) => this.users[id])
  }

  sortTheDictionary = (dict: PlayerMapState) => {
    let users_to_sort = Object.keys(dict).map((key) => {
      return { key: key, val: dict[key] }
    })
    users_to_sort.sort((a, b) => b.val.WPM - a.val.WPM)
    let sorted_dictionary: PlayerMapState = {} as PlayerMapState
    users_to_sort.forEach((el) => (sorted_dictionary[el.key] = el.val))
    return sorted_dictionary
  }

  insertTimer = (match_id: string, duration: number): void => {
    this.timers[match_id] = setTimeout(() => {
      if (match_id in this.timers) {
        //in case match finishes before the timeout.
        for (const uid in this.matches[match_id].players) {
          if (this.matches[match_id].players[uid].has_finished !== true) {
            this.matches[match_id].players[uid].has_finished = true
            this.matches[match_id].active_players--
            this.matches[match_id].players[uid].WPM =
              ((this.matches[match_id].players[uid].WPM / 100) *
                this.matches[match_id].text.length *
                (60 / this.matches[match_id].time_limit)) /
              7
          }
          this.removeMatchUser(uid)
        }
        if (match_id in this.timers) delete this.timers[match_id]
      }
    }, duration)
  }
}

//Duplicate code, same functions are defined in Practice Controller.
const generateText = async (req: RequestProps): Promise<string> => {
  if (req.type == "FakeWords") {
    const letterItem = await Letter.findOne({ letter: req.letter })
    const fakeWords = generateFakeWords(
      letterItem,
      req.amount,
      req.minAmountOfSyllables,
      req.maxAmountOfSyllables,
      req.minLengthOfWord,
      req.maxLengthOfWord
    )
    return fakeWords
  } else if (req.type == "CorpusWords") {
    const data = await Word.aggregate([{ $sample: { size: req.amount } }])
    return data.map((el: { _id: string; word: string; count: number }) => el.word).join(" ")
  } else if (req.type == "Sentences") {
    const data = await Sentence.aggregate([{ $sample: { size: req.amount } }])
    return data.map((el: { _id: string; sentence: string }) => el.sentence).join(". ")
  } else {
    console.log("request type not implemented")
    return ""
  }
}
