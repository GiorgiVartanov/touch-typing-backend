import mongoose, { Document, Schema } from "mongoose"

export interface GameState {
    gul: MatchState,
    text: string, 
    time_limit: number, 
    user_limit: number,
    date: Date,
    has_started?: boolean,
    active_players: number,
} 

export interface MatchState {
    [sid:string]: {WPM: number, has_finished?: boolean, username?: string}
}

export interface GameInterface extends GameState, Document {
    guid: string,
}

const gameSchema : Schema<GameInterface> = new  Schema<GameInterface>({
    guid: {
        type: String,
        required: true,
    },    
    gul: {
        type: Schema.Types.Map,
        of: new Schema(
            {
                WPM: {
                    type: Number,
                    required: true,
                },
            },
            { _id: false }
        )
    },
    text: {
        type: String,
        required: true,
    },
    time_limit: {
        type: Number, 
        required: true,
    }, 
    user_limit: {
        type: Number,
        required: true,
    },
    date: {
        type: Date,
        required: true,
    },
})

export default mongoose.model<GameInterface>("Game", gameSchema)