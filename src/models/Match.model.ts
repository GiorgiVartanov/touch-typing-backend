import mongoose, { Document, Schema } from "mongoose"

export interface id_list {
  [id: string]: string
}

export interface FakeWordsProps {
  type: "FakeWords"
  letter: string
  amount: number
  minAmountOfSyllables: number
  maxAmountOfSyllables: number
  minLengthOfWord?: number
  maxLengthOfWord?: number
}

export interface Timers {
  [muid: string]: NodeJS.Timeout
}

export interface WordsProps {
  type: "CorpusWords"
  amount: number
}

export interface SentencesProps {
  type: "Sentences"
  amount: number
}

export type RequestProps = FakeWordsProps | WordsProps | SentencesProps

export interface MatchState {
  players: PlayerMapState
  text: string
  time_limit: number
  user_limit: number
  date: Date
  has_started?: boolean
  active_players: number
  spectators: id_list
  request?: RequestProps
}

export interface PlayerState {
  WPM: number
  has_finished?: boolean
  username?: string
  wants_to_see_result?: boolean
  rating: number
}

export interface PlayerMapState {
  [sid: string]: PlayerState
}

export interface MatchInterface extends MatchState, Document {}

const matchSchema: Schema<MatchInterface> = new Schema<MatchInterface>({
  players: {
    type: Schema.Types.Map,
    of: new Schema(
      {
        WPM: {
          type: Number,
          required: true,
        },
        rating: {
          type: Number,
          required: true,
        },
      },
      { _id: false }
    ),
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

export default mongoose.model<MatchInterface>("Match", matchSchema)
