import { utils } from '../hotstuff';

describe('add', () => {
  test('scalar addition', () => {
    expect(utils.add(1, 1)).toEqual(2);
  });

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
  test('scalar subtraction', () => {
    expect(utils.sub(1, 1)).toEqual(0);
  });

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

describe('mult', () => {
  test('scalar multiplication', () => {
    expect(utils.mult(1, 2)).toEqual(2);
  });

  test('1x1 multiplication', () => {
    // interestingly not a matrix result with mathjs impl
    expect(utils.mult(utils.matrix([1]), utils.matrix([2]))).toEqual(2);
  });

  test('2x2 multiplication', () => {
    const first = utils.matrix([
      [1, 2],
      [3, 4],
    ]);
    const product = utils.matrix([
      [7, 10],
      [15, 22],
    ]);
    expect(utils.mult(first, first)).toEqual(product);
  });

  test('2x1 and scalar multiplication', () => {
    const first = utils.matrix([[4, 5]]);
    expect(utils.mult(first, 2)).toEqual(utils.matrix([[8, 10]]));
    expect(utils.mult(3, first)).toEqual(utils.matrix([[12, 15]]));
  });
});

describe('divide', () => {
  test('scalar division', () => {
    expect(utils.divide(2, 2)).toEqual(1);
  });

  test('1x1 division', () => {
    expect(utils.divide(utils.matrix([1]), utils.matrix([2]))).toEqual(utils.matrix([0.5]));
  });

  test('2x2 division', () => {
    const first = utils.matrix([
      [4, 6],
      [9, 12],
    ]);
    const second = utils.matrix([
      [1, 2],
      [3, 4],
    ]);
    const quotient = utils.matrix([
      [4, 3],
      [3, 3],
    ]);
    expect(utils.divide(first, second)).toEqual(quotient);
  });

  test('2x1 and scalar division', () => {
    const first = utils.matrix([[4, 8]]);
    expect(utils.divide(first, 2)).toEqual(utils.matrix([[2, 4]]));
    expect(utils.divide(4, first)).toEqual(utils.matrix([[1, 0.5]]));
  });
});
