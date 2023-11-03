# Tsoogle - like google, but for your typescript project

Find functions or methods by approximate signature - return type, argument types or both.
Supports optional arguments, rest arguments and partial type checking.

Use tsoogle to:
* find the function you need
* explore how a datatype is used in your project

```bash
# find all that return a string
npx ts-node index.ts testproject.tsconfig.json ":string?"      
/Users/dot/code/tsoogle/tests/testProject/class.ts:4 bar(string,string): string
/Users/dot/code/tsoogle/tests/testProject/functions.ts:5 asd2(string,number): string
/Users/dot/code/tsoogle/tests/testProject/functions.ts:9 asd3(): boolean | Record<string, string>

# find all that return a string, have 2 arguments and their first argument is a string
npx ts-node index.ts testproject.tsconfig.json ":string?string,*"
/Users/dot/code/tsoogle/tests/testProject/class.ts:4 bar(string,string): string
/Users/dot/code/tsoogle/tests/testProject/functions.ts:1 asd(string,string): string
/Users/dot/code/tsoogle/tests/testProject/functions.ts:5 asd2(string,number): string

# find all that accept as parametes a string and a number and return anything
npx ts-node index.ts testproject.tsconfig.json ":*?string,number"
/Users/zlatinstanimirov/code/tsoogle/tests/testProject/functions.ts:5 asd2(string,number): string

# find all that accept as parameters a string and a number OR string and return anything
npx ts-node index.ts testproject.tsconfig.json ":*?string,number|string"
/Users/dot/code/tsoogle/tests/testProject/class.ts:4 bar(string,string): string
/Users/dot/code/tsoogle/tests/testProject/functions.ts:1 asd(string,string): string
/Users/dot/code/tsoogle/tests/testProject/functions.ts:5 asd2(string,number): strin

# it supports partial type checking
npx ts-node index.ts testproject.tsconfig.json ":*?{a&b}"
{ kind: 'both', returnTypes: [ '*' ], parameterTypes: [ [ '{a&b}' ] ] }
/Users/dot/code/tsoogle/tests/testProject/class.ts:12 asd(TestType): string
```

## Motivation

Text search is great, but it is not always the best way to find what you are looking for.

Symbol search is great, but it returns all references not just deffinitions and is relatively stiff.
You can't easily find all functions with 2 parameters of type A and B that return C | Promise<C> for example.

This is where tsoogle comes in - it allows to conviniently and fuzzily search for functions and methods by their signature.
Tsoogle was inspired by haskell's hoogle.

## Usage
```bash
npm i @stanimirovv/tsoogle
npx tsoogle <path to tsconfig.json> <query>
```

## Query language

Tsoogle has it's own tiny query language that we use to search for functions and methods.

### Form

### Basic examples

### ... Operator
if the first argument is ... then if any of the arguments match the function will be matched.
... can only be used as the first argument and ignore the 

### Partial type checking

Instead of the name of the argument you can



## Contributing
PR's are welcome, but please open an issue first to discuss the change you want to make.

For code to be accepted:
1 It must add a couple of tests for the new functionality
2 It must pass the existing tests
3 There must be no eslint errors

Basically must pass:
```bash
npm test && npm run lint
```