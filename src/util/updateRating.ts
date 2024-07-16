import { PlayerMapState, PlayerState } from "../models/Match.model"

const updateRating = (players: PlayerMapState): number[] => {
  let position = 1
  const rating_changes: number[] = [] as number[]
  for (const player in players) {
    let expected_position = calculateExpectedPosition(player, players)
    let added_rating = ((expected_position - position) * 100) / Object.keys(players).length

    rating_changes.push(added_rating)
    ++position
  }
  return rating_changes
}

export default updateRating

const calculateExpectedPosition = (sid: string, players: PlayerMapState) => {
  let position = 1
  for (const player in players) {
    if (sid != player) {
      position += calculateLosingProbability(players[sid], players[player])
    }
  }
  return position
}

const calculateLosingProbability = (player1: PlayerState, player2: PlayerState) => {
  const rating1 = player1.rating ? player1.rating : 0
  const rating2 = player2.rating ? player2.rating : 0
  return 1 / (1 + 10 ** ((rating1 - rating2) / 400))
}
