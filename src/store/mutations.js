import * as types from './mutation-typees'

const mutations = {
  [types.SET_SINGER] (state, singer) {
    state.singer = singer
  }
}

export default mutations
