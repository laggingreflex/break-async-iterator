const breakAI = require('.')

const stdin /* never resolves */ = process.stdin;

const problem = async function*() {
  try {
    for await (const i of stdin) {
      yield i
    }
  } finally {
    process.stdin.pause();
  }
};

const solution = breakAI(breakable => async function*() {
  try {
    for await (const i of breakable(stdin)) {
      yield i
    }
  } finally {
    process.stdin.pause();
  }
});

async function test() {

  // const iterator = problem();
  const iterator = solution();

  let timeout;
  setTimeout(() => {
    iterator.return('done');
    timeout = setTimeout(() => {
      console.log(`failed`);
      process.stdin.pause();
      process.exitCode = 1;
    });
  }, 1000);

  for await (const output of iterator) {
    console.log({ output });
    break
  }

  clearTimeout(timeout);
  console.log(`success`);
}

test().catch(error => process.exitCode = (console.error(error), 1))
