// versor ships no types — minimal declaration for the API we use.
declare module 'versor' {
  type Rotation = [number, number, number];
  interface Versor {
    (rotation: Rotation): [number, number, number, number];
    cartesian(coordinates: [number, number]): [number, number, number];
    rotation(q: [number, number, number, number]): Rotation;
    delta(
      v0: [number, number, number],
      v1: [number, number, number],
    ): [number, number, number, number];
    multiply(
      a: [number, number, number, number],
      b: [number, number, number, number],
    ): [number, number, number, number];
    interpolate(a: Rotation, b: Rotation): (t: number) => Rotation;
  }
  const versor: Versor;
  export default versor;
}
