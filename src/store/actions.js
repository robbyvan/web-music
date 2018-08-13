import * as types from './mutation-types';
import { playMode } from 'common/js/config';
import { shuffle } from 'common/js/util';
import { saveSearch, deleteSearch, clearSearch } from 'common/js/cache';

function findIndex(list, song) {
  return list.findIndex(item => item.id === song.id);
}

export function selectPlay({ commit, state }, { list, index }) {
  commit(types.SET_SEQUENCE_LIST, list);
  if (state.mode === playMode.random) {
    let randomList = shuffle(list);
    commit(types.SET_PLAYLIST, randomList);
    index = findIndex(randomList, list[index]);
  } else {
    commit(types.SET_PLAYLIST, list);
  }
  commit(types.SET_CURRENT_INDEX, index);
  commit(types.SET_FULL_SCREEN, true);
  commit(types.SET_PLAYING_STATE, true);
}

export function randomPlay({ commit }, { list }) {
  commit(types.SET_PLAY_MODE, playMode.random);
  commit(types.SET_SEQUENCE_LIST, list);
  let randomList = shuffle(list);
  commit(types.SET_PLAYLIST, randomList);
  commit(types.SET_CURRENT_INDEX, 0);
  commit(types.SET_FULL_SCREEN, true);
  commit(types.SET_PLAYING_STATE, true);
}

export function insertSong({ commit, state }, song) {
  const playlist = state.playlist.slice(0);
  const sequenceList = state.sequenceList.slice(0);
  let currentIndex = state.currentIndex;
  // 当前歌曲
  const currentSong = playlist[currentIndex];
  // 查询是否有选择的歌曲
  const fpIndex = findIndex(playlist, song);
  // 插入位置
  currentIndex += 1;
  // 插入歌曲
  playlist.splice(currentIndex, 0, song);
  // 已有
  if (fpIndex > -1) {
    if (currentIndex > fpIndex) {
      playlist.splice(fpIndex, 1);
      currentIndex -= 1;
    } else {
      playlist.splice(fpIndex + 1, 1);
    }
  }

  const currentSIndex = findIndex(sequenceList, currentSong) + 1;
  const fsIndex = findIndex(sequenceList, song);
  sequenceList.splice(currentIndex, 0, song);
  if (fsIndex > -1) {
    if (currentSIndex > fsIndex) {
      sequenceList.splice(fsIndex, 1);
    } else {
      sequenceList.splice(fsIndex + 1, 1);
    }
  }

  commit(types.SET_PLAYLIST, playlist);
  commit(types.SET_SEQUENCE_LIST, playlist);
  commit(types.SET_CURRENT_INDEX, currentIndex);
  commit(types.SET_FULL_SCREEN, true);
  commit(types.SET_PLAYING_STATE, true);
}

export function saveSearchHistory({ commit }, query) {
  commit(types.SET_SEARCH_HISTORY, saveSearch(query));
}

export function deleteSearchHistory({ commit }, query) {
  commit(types.SET_SEARCH_HISTORY, deleteSearch(query));
}

export function clearSearchHistory({ commit }) {
  commit(types.SET_SEARCH_HISTORY, clearSearch());
}
