import * as types from './mutation-typees'

export const selectPlay = function ({commit, state}, {list, index}) {
  commit(types.SET_CURRENT_INDEX, index)
  commit(types.SET_PLAYLIST, list)
  commit(types.SET_SEQUENCE_LIST, list)
  commit(types.SET_PLAYING_STATE, true)
  commit(types.SET_FULLSCREEN, true)
}
