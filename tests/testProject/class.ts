// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
type TestType = { a: string, b: string }
export class Foo {
  public bar (a: string, b: string): string {
    return a + b
  }

  static baz (a: number, b: number): number {
    return a + b
  }

  public asd (a: TestType): string {
    return '42'
  }

  public tt1 (a: string, ...b: string[]): TestType {
    return { a: '42', b: '42' }
  }
}

export const foobarFn = (a: number, b: number, c: number): void => {}
export function foobarFn2 (a: number, b: number, c: number): void {}
