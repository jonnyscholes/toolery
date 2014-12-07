[toolery.me](http://toolery.me)
===============================

Everyday I need to make lots of little conversions and calculations when taking designs from Photoshop files to the web.

This is a little tool I made to make all of that easier for myself (and perhaps others). The idea is that I should just 
have to paste my clipboard or type into in a single input field. Any conceivable conversion would be made for me instantly with 
no further input. It should do its best to make assumptions about my input - with the knowledge that this is made for front end developers.

Features
========

## Color conversion 

Supports following formats:

- RGB - rgb(0, 0, 0)
- RGBA - rgba(0, 0, 0, 0)
- HEX - #000000
- Adobe #1 - R:0 G:0 B:0
- Adobe #2 - (R0 / G0 / B0)

(See [fuzzy-color](https://github.com/jonnyscholes/fuzzy-color) for complete docs on supported color conversions)

## Meaningful color names

Uses  [namethatcolor.js](http://chir.ag/projects/ntc/) by Chirag Mehta to find a suitable name for any color. Sets up a 
sass variable for you to copy pasta.

## Unit conversion

From / to the following formats:

- rem
- in (inches)
- cm (centimeters)
- pc (picas)
- mm (milimeters)
- pt (points)
- px (pixels)
- deg (degrees)
- rad (radians)
- s (seconds)
- ms (miliseconds)

## WCAG color contrast test

Currently only supports AAA compliance. AA, A etc coming soon. You can swap the background color to the current color 
by clicking on the WCAG example (I know, not intuitive redesign coming soon).

## Keyboard key code

Shows the key code for the last pressed key.

## String metrics

Shows the amount of characters and words in the input field.

If you think of anything it needs submit an issue :)

License
========

MIT