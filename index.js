module.exports = cb => {
  let done = false;
  let interrupt, interruptPromise = new Promise((resolve, reject) => {
    interrupt = ({ error, value }) => error ? reject(error) : resolve({ done, value });
  });

  const breakPromise = promise => Promise.race([promise, interruptPromise]);

  const breakIterator = iterator => ({
    async next(value) {
      if (done) return { done };
      return Promise.race([iterator.next(value), interruptPromise]);
    },
    return (value) {
      if (done) return { done };
      done = true;
      interrupt({ value });
      return iterator.return(value);
    },
    throw (error) {
      if (done) return { done };
      done = true;
      interrupt({ error });
      return iterator.throw(error);
    },
    [Symbol.asyncIterator]() { return this; }
  });

  const breaker = i => {
    if (!i) {
      throw new Error('Expected an iterator or a promise');
    } else if (i.next) {
      return breakIterator(i);
    } else if (i[Symbol.asyncIterator]) {
      return breakIterator(i[Symbol.asyncIterator]());
    } else if (i[Symbol.iterator]) {
      return breakIterator(i[Symbol.iterator]());
    } else if (i.then) {
      return breakPromise(i);
    } else {
      throw new Error('Expected an iterator or a promise');
    }
  };

  const generator = cb(breaker);

  return (...args) => breakIterator(generator(...args));
};
