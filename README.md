# EasyLang

This is a programming language made in JavaScript for beginners, who want to learn programming basics. It was made for fun so there may be some bugs.

# Usage

This repository is actually a web version of this language, so you dont need to install any packages, just go to the domain of the language and code!

# Documentation

## Variable declaration

variables that can be changed are created with "var":

```cs
var x = 1
```

constants, in another words variables, that can't be changed are initialized with a keyword "const", just like in JavaScript!:

```cs
const x = "you cannot change this variable lol"
```

## Data structures

- ### Strings
  Strings can be created with ""
  ```cs
  const x = "you cannot change this variable lol"
  ```
- ### Integers
  Numbers(the same as integers)
  ```cs
  const x = 1
  ```
- ### Floats
  Numbers(the same as integers)
  ```cs
  const x = 5.5
  ```
- ### Objects
  Objects here are similar to JSON objects! :)
  ```cs
  const x = { a: 5, b: "this is a string", c: { x: 67 } }
  ```
- ### Arrays
  Arrays are like objects but its elements don't have keys
  ```cs
  const x = [1, "string", {a:1,b:5,c:true}]
  ```
- ### Bools
  Bools are either true or false
  ```cs
  const x = [true,false]
  ```
  Bools in this language are not real, they are native variables and get evaluated into 0 or 1
- ### Null
  Null is empty value
  ```cs
  var x = null
  ```

## Functions

So functions is very interesting in this language - it can behave like a class

```cs
task main(){
  task add(a,b){
    write(a+b)
  }
  task substract(a,b){
    write(a-b)
  }
}

const func = main() //-> runs main, and gets every function and variable in the main
func.add(5,8)
func.substract(67,5)
```

Or functions can be normal functions:

```cs
task helloworld(){
  write("hello world!")
}

helloworld()
```

## Basic binary operations

There are multiple binary operations in EasyLang:

- Addition

```cs
write(2+2)
```

- Substraction

```cs
write(2-2)
```

- Multiplication

```cs
write(2*2)
```

- Division

```cs
write(2/2)
```

- Modulo

```cs
write(10%3)
```

## Logical binary operations

There are also many logical binary operations in EasyLang:

- AND

```cs
write(false and true) // -> output must be 0, so false
```

- OR

```cs
write(true or 2) // -> output must be 1, so true
```

- less than

```cs
write(2<3) // -> output must be 1, so true
```

- less than or equals

```cs
write(3<=2) // -> output must be 0, so false
```

- greater than

```cs
write(10>3) // -> output must be 1, so true
```

- greater than or equals

```cs
write(3>=3) // -> output must be 1, so true
```

- equals

```cs
write(2+2==4) // -> output must be 1, so true
```

## If statements

If statements in EasyLang are very simple -> if keyword, condition, body:

```cs
var x = 5
if(x==5){
  write("x is 5!")
}
```

You can do also if-else statement:

```cs
var x = 6
if(x<5){
  write("x is less than 5!")
} else {
  write("x is greater than 5!")
}
```

## Loops

There are two types of loops: quick one and normal

Quick one:

```cs
loop(i:10){
  write(i)
}
```

Normal one:

```cs
var i = 0
while(i<10){
  write(i)
  i=i+1
}
```

## Native functions and variables

- `input()` -> takes input from user, unfortunately in browser if its in the loop it can freeze other script and ui until the loop ends :(
- `write()` -> simply outputs the value
- `int()` -> takes a value as an argument and returns the parsed number version
- `toString()` -> takes a value as an argument and returns the parsed string version
- `math.sqrt()` -> takes a number as an argument and returns its square root
- `math.Pi` -> returns Pi
- `math.round()` -> takes a number as an argument and returns the nearest integer
- `math.cos()` -> takes a number as an argument and returns its cosine
- `math.sin()` -> takes a number as an argument and returns its sine
- `math.random()` -> takes a minimum and maximum value as arguments and returns a random number between them
- `string.len(string)` -> returns length of the string
- `string.split(string, char)` -> splits the string into an array and returns it
- `string.matches(string, pattern)` -> takes a string and a regular expression as arguments and returns the match(IMPORTANT! As the second argument you need to input regexp _without_ slashes, so like this -> '^(hello)')
- `string.replace(string, target, replacement)` -> returns a copy of the string where all occurrences of target are replaced with replacement

# Thats all, all bugs please report in issues and have fun!:D

## Also, huge thanks for [Tyler Laceby](https://github.com/tlaceby) for his amazing [series of videos](https://youtu.be/8VB5TY1sIRo?si=Bva4mwzAWNRfgMGq) explaining how parser and interpreter work!
