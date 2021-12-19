import easy from "./crosswords/crosswords.1000.json";
import medium from "./crosswords/crosswords.250.json";
import advanced from "./crosswords/crosswords.70.json";
import expert from "./crosswords/crosswords.1.json";


export function getCrossword(level) {
    if (window.location.hash === "#debug") {
        console.log("Returning fake crossword");
        return {size: [3, 3],
                words: [{d:"Across", w: "ABC", s: [0,0]},
                        {d:"Down", w: "CDE", s: [2,0]}],
                letters: "ABCDE",
                unused:["BAC", "DEC", "ACE"]};
    }
    const levels = {easy:easy, medium:medium, advanced:advanced, expert:expert};
    const crosswords = levels[level];
    const idx = Math.floor(Math.random() * crosswords.length);
    return crosswords[idx];
}

