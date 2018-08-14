import storage from 'good-storage';

const SEARCH_KEY = '__search__';
const SEARCH_MAX_LENGTH = 15;

const PLAY_KEY = '__play__';
const PLAY_MAX_LENGTH = 100;

function insertArray(arr, val, compare, maxLen) {
  const index = arr.findIndex(compare);
  // 如果就是第一位, 直接返回
  if (index === 0) {
    return;
  }
  // 如果已有了, 先删掉旧的
  if (index > 0) {
    arr.splice(index, 1);
  }
  // 没有 || 删掉旧的后: 添加
  arr.unshift(val);
  if (maxLen && arr.length > maxLen) {
    arr.pop();
  }
}

export function saveSearch(q) {
  let searches = storage.get(SEARCH_KEY, []);
  insertArray(searches, q, item => item === q, SEARCH_MAX_LENGTH);
  storage.set(SEARCH_KEY, searches);
  return searches;
}

export function loadSearch() {
  return storage.get(SEARCH_KEY, []);
}

function deleteFromArray(arr, compare) {
  const index = arr.findIndex(compare);
  if (index > -1) {
    arr.splice(index, 1);
  }
}

export function deleteSearch(q) {
  let searches = storage.get(SEARCH_KEY, []);
  deleteFromArray(searches, item => item === q);
  storage.set(SEARCH_KEY, searches);
  return searches;
}

export function clearSearch() {
  storage.remove(SEARCH_KEY);
  return [];
}

export function savePlay(song) {
  let songs = storage.get(PLAY_KEY, []);
  insertArray(songs, song, item => item.id === song.id, PLAY_MAX_LENGTH);
  storage.set(PLAY_KEY, songs);
  return songs;
}

export function loadPlay() {
  return storage.get(PLAY_KEY, []);
}
