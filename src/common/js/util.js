function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

// shuffle: 遍历数组, 取0->i的整数j, 交换i,j内容
export function shuffle(arr) {
  let _arr = arr.slice(0);
  for (let i = 0; i < _arr.length; ++i) {
    let j = getRandomInt(0, i);
    let t = _arr[i];
    _arr[i] = _arr[j];
    _arr[j] = t;
  }
  return _arr;
}

// debounce
export function debounce(func, delay) {
  let timer;
  return function(...args) {
    if (timer) {
      clearTimeout(timer);
    }
    timer = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
}
