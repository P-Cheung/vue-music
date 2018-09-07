import * as types from './mutation-typees'
import {shuffle} from '@/common/js/util'
import {playMode} from '@/common/js/config'
import {saveSearch, deleteSearch, clearSearch, savePlay, saveFavorite, deleteFavorite} from '@/common/js/cache'

function getIndex (list, song) {
  return list.findIndex(item => {
    return item.id === song.id
  })
}

export const selectPlay = function ({commit, state}, {list, index}) {
  commit(types.SET_SEQUENCE_LIST, list)
  if (state.mode === playMode.random) {
    let randomlist = shuffle(list)
    commit(types.SET_PLAYLIST, randomlist)
    index = getIndex(randomlist, list[index])
  } else {
    commit(types.SET_PLAYLIST, list)
  }
  commit(types.SET_CURRENT_INDEX, index)
  commit(types.SET_PLAYING_STATE, true)
  commit(types.SET_FULLSCREEN, true)
}

export const randomPlay = function ({commit}, {list}) {
  commit(types.SET_PLAYING_MODE, playMode.random)
  commit(types.SET_SEQUENCE_LIST, list)
  commit(types.SET_PLAYLIST, shuffle(list))
  commit(types.SET_CURRENT_INDEX, 0)
  commit(types.SET_PLAYING_STATE, true)
  commit(types.SET_FULLSCREEN, true)
}

export const insertSong = function ({commit, state}, song) {
  let playlist = state.playlist.slice()
  let sequencelist = state.sequencelist.slice()
  let currentIndex = state.currentIndex

  let currentSong = playlist[currentIndex] // 当前歌曲
  let fpIndex = getIndex(playlist, song) // 插入之前该歌曲是否在列表中

  currentIndex++
  playlist.splice(currentIndex, 0, song)

  if (fpIndex > -1) {
    if (fpIndex < currentIndex) {
      playlist.splice(fpIndex, 1)
      currentIndex--
    } else {
      fpIndex++
      playlist.splice(fpIndex, 1)
    }
  }

  // 插入到sequencelist
  let currentSIndex = getIndex(sequencelist, currentSong) + 1 // 当前播放的歌曲在sequencelist中的索引+1(插入位置)
  let fsIndex = getIndex(sequencelist, song)
  sequencelist.splice(currentSIndex, 0, song)

  if (fsIndex > -1) {
    if (currentSIndex > fsIndex) {
      sequencelist.splice(fsIndex, 1)
    } else {
      sequencelist.splice(fsIndex + 1, 1)
    }
  }

  commit(types.SET_PLAYLIST, playlist)
  commit(types.SET_SEQUENCE_LIST, sequencelist)
  commit(types.SET_CURRENT_INDEX, currentIndex)
  commit(types.SET_FULLSCREEN, true)
  commit(types.SET_PLAYING_STATE, true)
}

export const saveSearchHistory = function ({commit}, query) {
  commit(types.SET_SEARCH_HISTORY, saveSearch(query))
}

export const deleteSearchHistory = function ({commit}, query) {
  commit(types.SET_SEARCH_HISTORY, deleteSearch(query))
}

export const clearSearchHistory = function ({commit}) {
  commit(types.SET_SEARCH_HISTORY, clearSearch())
}

export const deleteSong = function ({commit, state}, song) {
  let playlist = state.playlist.slice()
  let sequencelist = state.sequencelist.slice()
  let currentIndex = state.currentIndex

  let pIndex = getIndex(playlist, song)
  playlist.splice(pIndex, 1)
  let sIndex = getIndex(sequencelist, song)
  sequencelist.splice(sIndex, 1)
  if (currentIndex > pIndex || currentIndex === playlist.length) {
    currentIndex--
  }

  commit(types.SET_CURRENT_INDEX, currentIndex)
  commit(types.SET_PLAYLIST, playlist)
  commit(types.SET_SEQUENCE_LIST, sequencelist)

  commit(types.SET_PLAYING_STATE, playlist.length > 0)
}

export const deleteSonglist = function ({commit}) {
  commit(types.SET_PLAYLIST, [])
  commit(types.SET_SEQUENCE_LIST, [])
  commit(types.SET_CURRENT_INDEX, -1)
  commit(types.SET_PLAYING_STATE, false)
}

export const savePlayHistory = function ({commit}, song) {
  commit(types.SET_PLAY_HISTORY, savePlay(song))
}

export const saveFavoriteList = function ({commit}, song) {
  commit(types.SET_FAVORITE_LIST, saveFavorite(song))
}

export const deleteFavoriteList = function ({commit}, song) {
  commit(types.SET_FAVORITE_LIST, deleteFavorite(song))
}
