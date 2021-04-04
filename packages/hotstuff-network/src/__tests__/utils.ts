import { utils } from '../hotstuff';

const product = utils.matrix([
  [10, 13],
  [22, 29],
]);

describe('add', () => {
  test('1x1 addition', () => {
    expect(utils.add(utils.matrix([1]), utils.matrix([1]))).toEqual(utils.matrix([2]));
  });

  test('2x2 addition', () => {
    const first = utils.matrix([
      [1, 2],
      [3, 4],
    ]);
    const second = utils.matrix([
      [2, 3],
      [4, 5],
    ]);
    const sum = utils.matrix([
      [3, 5],
      [7, 9],
    ]);
    expect(utils.add(first, second)).toEqual(sum);
  });

  test('2x1 and scalar addition', () => {
    const first = utils.matrix([[1, 2]]);
    expect(utils.add(first, 3)).toEqual(utils.matrix([[4, 5]]));
    expect(utils.add(4, first)).toEqual(utils.matrix([[5, 6]]));
  });

  // TODO: Implement some form of broadcasting?
  // test('2x2 + 2x1 addition', () => {
  //   const first = hotstuff.matrix([
  //     [1, 2],
  //     [3, 4],
  //   ]);
  //   const second = hotstuff.matrix([[2, 3]]);
  //   const sum = hotstuff.matrix([
  //     [3, 5],
  //     [4, 6],
  //   ]);
  //   expect(hotstuff.add(first, second)).toEqual(sum);
  // });
});

describe('sub', () => {
  test('1x1 subtraction', () => {
    expect(utils.sub(utils.matrix([1]), utils.matrix([1]))).toEqual(utils.matrix([0]));
  });

  test('2x2 subtraction', () => {
    const first = utils.matrix([
      [2, 3],
      [4, 5],
    ]);
    const second = utils.matrix([
      [1, 2],
      [3, 4],
    ]);
    const sum = utils.matrix([
      [1, 1],
      [1, 1],
    ]);
    expect(utils.sub(first, second)).toEqual(sum);
  });

  test('2x1 and scalar subtraction', () => {
    const first = utils.matrix([[4, 5]]);
    expect(utils.sub(first, 3)).toEqual(utils.matrix([[1, 2]]));
    expect(utils.sub(4, first)).toEqual(utils.matrix([[0, -1]]));
  });
});
// test('multiply matrices', () => {
//   expect(math.multiply(first, second)).toEqual(product);
// });
