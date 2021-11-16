import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import { version } from '../package.json';

const directions = {
    Down: start => (i => [start[0], start[1] + i]),
    Across: start => (i => [start[0] + i, start[1]])
};

function mapDirection(word) {
    return directions[word.d](word.s)
}

function mapWord(word) {
    const dir = mapDirection(word);
    const letters = Array.from(word.w);
    const items = letters.map((l,i) => [l, dir(i)]);
    return items;
}

function calculatePad(crossword) {
    let pad = Object();
    for(const word of crossword.words) {
        for(const [l, pos] of mapWord(word)) {
            pad[pos] = {
                l:l,
                guess:null
            };
        }
    }
    return pad;
}

function Square(props) {
    return (
        <button className="square" onClick={props.onClick}>
            {props.value}
        </button>
    );
}

function shuffle(array) {
    array = array.slice();
    for (let i = array.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

class Guessbox extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            letters: props.letters.map((x) => ({l: x, used: false})),
            value: ""
        }
    }

    handleSubmit() {
        if (this.state.value.length < 3)
            return;
        this.props.onGuess(this.state.value);
        this.clear();
    }

    handleShuffle() {
        this.setState({
            ...this.state,
            letters: shuffle(this.state.letters)
        })
    }

    handleClear() {
        this.clear();
    }

    handleDelete() {
        const last = this.state.value.slice(-1);
        const letter = this.state.letters.find(l => (l.used && l.l == last))
        this.setState({
            ...this.state,
            letters: this.state.letters.map(l => (l === letter) ? {...l, used:false} : l),
            value: this.state.value.slice(0, -1)
        })
    }

    clear() {
        this.setState({
            ...this.state,
            letters: this.state.letters.map(l => ({...l, used:false})),
            value: ""
        })
    }

    handleClick(i) {
        if (this.state.letters[i].used)
            return;
        const letters = this.state.letters.slice();
        letters[i].used = true;
        const value = this.state.value + letters[i].l
        this.setState({
            ...this.state,
            letters: letters,
            value: value
        })
    }

    renderLetter(l, i) {
        if (l.used) {
            return (
                <span key={i}
                      className="cell used">
                    {l.l}
                </span>
            );
        } else {
            return (
                <span key={i}
                      className="cell available"
                      onClick={(e) => this.handleClick(i)}>
                    {l.l}
                </span>
            );
        }
    }

    render() {
        return (
            <div className="guessbox">
                <div className="word">
                    <span key="x"
                          className="letter">
                        :
                    </span>
                    {Array.from(this.state.value).map((l,i) => (
                        <span key={i}
                              className="letter">
                            {l}
                        </span>
                    ))}
                    <button onClick={(e)=>this.handleDelete()}>⏪</button>
                </div>
                <div className="chooser">
                    {this.state.letters.map((l,i) => this.renderLetter(l, i))}
                </div>
                <div className="actions">
                    <button onClick={(e) => this.handleShuffle()}>
                        Shuffle
                    </button>
                    <button onClick={(e) => this.handleClear()}>
                        Clear
                    </button>
                    <button onClick={(e) => this.handleSubmit()}
                            className="go">
                        Go
                    </button>
                </div>
            </div>
        );
    }
}




function range(x) {
    let iter = [];
    for(let i = 0; i < x; i++) {
        iter.push(i);
    }
    return iter;
}

class Game extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            history: [],
            pad: calculatePad(props.crossword),
            guesses: [],
            cols: range(props.crossword.size[0]),
            rows: range(props.crossword.size[1]),
            crossword: props.crossword
        };
    }

    isRepeatGuess(w) {
        let history = this.state.history;
        const isw = x => x.w === w;
        const fnot = f => ((...args) => !f(...args))
        const repeat = history.find(isw)
        if (repeat) {
            history = [
                {
                    ...repeat,
                    repeat: 1 + (repeat.repeat || 0)}
            ].concat(history.filter(fnot(isw)))
            this.setState({
                ...this.state,
                history: history
            });
            return true;
        }
        return false;
    }

    handleGuess(w) {
        if (this.isRepeatGuess(w)) {
            return;
        }
        let history = this.state.history;
        let guesses = this.state.guesses;
        let pad = this.state.pad;
        const hit = this.props.crossword.words.find(x=>x.w===w);
        if (hit) {
            pad = {...this.state.pad}
            guesses = guesses.concat([w])
            history = [{w:w, k:history.length, guess:true}].concat(history)
            for(const [l, pos] of mapWord(hit)) {
                pad[pos] = {
                    l:l,
                    guess:guesses.length
                };
            }
        } else {
            const known = this.props.crossword.unused.find(x=>x===w);
            history = [{w:w, k:history.length, guess:false, known:!!known}].concat(history)
        }
        const newState = {
            ...this.state,
            history: history,
            pad: pad,
            guesses: guesses
        };
        console.log(w, hit, newState);
        this.setState(newState);
    }

    handleHint(x,y) {
        let history = this.state.history;
        let pad = {...this.state.pad};
        let cell = pad[[x,y]];
        const w = ("?" + x + ',' + y);
        history = [{x:x, y:y,
                    k:history.length,
                    hint:cell.l,
                    w: w
                   }].concat(history);
        pad[[x,y]] = {
            ...cell,
            hint: 1 + (cell.hint || 0)
        };
        this.setState({
            ...this.state,
            history: history,
            pad: pad
        });
    }

    renderCell(x,y) {
        let p = this.state.pad[[x,y]];
        let k = x;
        let l;
        let opt = {};
        if (p === undefined) {
            opt.className="cell void";
            l="";
        } else if (p.guess === null && (p.hint || 0) < this.props.hintLimit) {
            opt.className="cell empty";
            opt.onClick = e => this.handleHint(x,y);
            l=" ";
        } else if (p.guess < this.state.guesses.length) {
            opt.className="cell solved";
            l=p.l;
        } else {
            opt.className="cell solved guessed";
            l=p.l;
        }

        if (p && p.hint && p.hint >= this.props.hintLimit) {
            opt.className += " hint";
        }

        return (
            <td key={k}>
                <div {...opt}>
                    <span>{l}</span>
                </div>
            </td>
        );
    }

    renderRow(y) {
        return (
            <tr className="board-row" key={y}>
                {this.state.cols.map(x => this.renderCell(x,y))}
            </tr>
        );
    }

    renderPad() {
        return (
            <div className="board">
                <table className="board">
                    <tbody>
                        {this.state.rows.map(y => this.renderRow(y))}
                    </tbody>
                </table>
            </div>
        );
    }

    render() {
        const letters = Array.from(this.props.crossword.letters).slice().sort();
        return (
            <div className="game">
                {this.renderPad()}
                <br/>
                <div className="guessbox">
                    <Guessbox
                        letters={letters}
                        onGuess={(w) => this.handleGuess(w)}
                    />
                </div>
                <div className="history">
                    <ul>
                        {this.state.history.map((w,i)=>(
                            <li key={w.k}
                                className={((w.guess) ? "guess" :
                                            ((w.known) ? "known" : "weird"))}>
                                {w.w} {w.repeat &&
                                       <span>
                                           {"➰".repeat(w.repeat)}
                                       </span>}
                            </li>))}
                    </ul>
                </div>
            </div>
        );
    }
}

class App extends React.Component {
    constructor(props) {
        super(props);
        let crosswords = [{
            "size": [10, 11],
            "letters": "nemudoma",
            "words": [
                {"d": "Across", "w": "amd", "s": [4, 8]},
                {"d": "Across", "w": "amen", "s": [6, 9]},
                {"d": "Down", "w": "ane", "s": [2, 1]},
                {"d": "Down", "w": "dam", "s": [4, 7]},
                {"d": "Across", "w": "dan", "s": [1, 5]},
                {"d": "Across", "w": "dano", "s": [1, 1]},
                {"d": "Across", "w": "dno", "s": [6, 1]},
                {"d": "Across", "w": "dom", "s": [7, 5]},
                {"d": "Down", "w": "doma", "s": [8, 0]},
                {"d": "Down", "w": "domu", "s": [4, 0]},
                {"d": "Down", "w": "don", "s": [5, 3]},
                {"d": "Down", "w": "duo", "s": [6, 1]},
                {"d": "Down", "w": "med", "s": [7, 3]},
                {"d": "Down", "w": "menda", "s": [3, 3]},
                {"d": "Across", "w": "nad", "s": [2, 7]},
                {"d": "Down", "w": "ned", "s": [1, 3]},
                {"d": "Down", "w": "nem", "s": [2, 7]},
                {"d": "Across", "w": "nemudoma", "s": [1, 3]},
                {"d": "Down", "w": "oda", "s": [6, 7]},
                {"d": "Across", "w": "oman", "s": [6, 7]},
                {"d": "Down", "w": "ona", "s": [8, 5]},
                {"d": "Across", "w": "one", "s": [0, 8]}],
            "unused": ["modem", "domen", "moda", "ano", "emu",
                       "domena", "duma", "mona", "dona", "eon",
                       "mena", "onda", "demon", "amon", "nomad",
                       "meno", "neo", "dao", "omen", "neum", "mone",
                       "medo", "oma", "moden", "memo", "meda",
                       "umen", "nom", "moa", "mamon", "omamen",
                       "noma", "mond", "mun", "neuma"]},
                          {"size": [10, 7], "letters": "fizi\u010den",
                           "words": [{"d": "Across", "w": "fen", "s": [3, 5]},
                                     {"d": "Down", "w": "fin", "s": [1, 3]},
                                     {"d": "Across", "w": "fizi\u010den", "s": [1, 3]},
                                     {"d": "Down", "w": "fi\u010d", "s": [8, 0]},
                                     {"d": "Across", "w": "ini", "s": [6, 1]},
                                     {"d": "Down", "w": "niz", "s": [3, 1]},
                                     {"d": "Down", "w": "ni\u010d", "s": [7, 3]},
                                     {"d": "Down", "w": "ni\u010de", "s": [6, 0]},
                                     {"d": "Across", "w": "zen", "s": [1, 1]},
                                     {"d": "Across", "w": "\u010dez", "s": [7, 5]},
                                     {"d": "Down", "w": "\u010din", "s": [5, 3]}],
                           "unused": []},
                          {"size": [10, 11], "letters": "coprati",
                           "words": [{"d": "Down", "w": "art", "s": [2, 7]},
                                     {"d": "Across", "w": "cia", "s": [0, 7]},
                                     {"d": "Across", "w": "coprati", "s": [0, 5]}, {"d": "Down", "w": "ort", "s": [8, 8]}, {"d": "Down", "w": "par", "s": [7, 6]}, {"d": "Across", "w": "pari", "s": [1, 3]}, {"d": "Across", "w": "pat", "s": [0, 9]}, {"d": "Across", "w": "pir", "s": [7, 6]}, {"d": "Down", "w": "pot", "s": [8, 2]}, {"d": "Down", "w": "pri", "s": [6, 3]}, {"d": "Across", "w": "pro", "s": [6, 3]}, {"d": "Down", "w": "proti", "s": [1, 3]}, {"d": "Across", "w": "prt", "s": [4, 9]}, {"d": "Down", "w": "ptica", "s": [4, 1]}, {"d": "Across", "w": "rop", "s": [7, 8]}, {"d": "Down", "w": "tip", "s": [4, 7]}, {"d": "Across", "w": "tipa", "s": [4, 7]}, {"d": "Across", "w": "top", "s": [2, 1]}, {"d": "Down", "w": "tra", "s": [2, 1]}, {"d": "Down", "w": "tri", "s": [5, 5]}], "unused": ["ropa", "pota", "opat", "tir", "por", "ati", "rio", "opira", "car", "trio", "cipra", "port", "trop", "rit", "porta", "trp", "copat", "oprati", "rac", "opica", "api", "oprta", "rap", "irt", "otip", "cap", "tari", "copati", "tor", "tropa", "trip", "pirat", "trap", "oprt", "pita", "part", "rita", "ric", "potica", "ica", "prati", "cri", "rota", "tora", "opa", "pica", "pora", "tica", "arco", "cip", "prta", "tropi", "capo", "ratio", "orati", "pira", "cora", "ropati", "tap", "capri", "cita", "prot", "cotar", "pair", "ciao", "prat", "racio", "piar", "cop", "cota", "cipa", "irta", "oti", "otar", "aport", "pato"]},
                          {"size": [10, 10], "letters": "trapeza", "words": [{"d": "Down", "w": "art", "s": [2, 0]}, {"d": "Down", "w": "ata", "s": [1, 3]}, {"d": "Down", "w": "ate", "s": [6, 0]}, {"d": "Down", "w": "era", "s": [4, 6]}, {"d": "Down", "w": "eta", "s": [4, 0]}, {"d": "Across", "w": "etapa", "s": [5, 5]}, {"d": "Down", "w": "par", "s": [8, 1]}, {"d": "Down", "w": "para", "s": [7, 4]}, {"d": "Across", "w": "pare", "s": [0, 5]}, {"d": "Across", "w": "pat", "s": [3, 4]}, {"d": "Down", "w": "pater", "s": [5, 2]}, {"d": "Across", "w": "per", "s": [0, 1]}, {"d": "Down", "w": "pet", "s": [3, 4]}, {"d": "Across", "w": "peta", "s": [1, 8]}, {"d": "Down", "w": "pre", "s": [8, 7]}, {"d": "Across", "w": "rape", "s": [6, 7]}, {"d": "Down", "w": "rep", "s": [2, 7]}, {"d": "Down", "w": "rez", "s": [6, 7]}, {"d": "Across", "w": "ter", "s": [3, 6]}, {"d": "Across", "w": "trapeza", "s": [2, 2]}], "unused": ["teza", "petar", "reza", "repa", "raz", "prt", "trp", "zeta", "zet", "tara", "rap", "pera", "trap", "paz", "part", "rapa", "ara", "area", "trapa", "prta", "zara", "tap", "parte", "peza", "raza", "tra", "prat", "parta", "trapez", "prata", "arpa", "pazar", "zar", "zatrep", "trz", "ret"]},
                          {"size": [11, 10], "letters": "lepoti\u010dka", "words": [{"d": "Down", "w": "akt", "s": [4, 7]}, {"d": "Across", "w": "ali", "s": [1, 6]}, {"d": "Across", "w": "kola", "s": [1, 1]}, {"d": "Down", "w": "kot", "s": [8, 3]}, {"d": "Down", "w": "lepa", "s": [6, 5]}, {"d": "Across", "w": "lepoti\u010dka", "s": [1, 3]}, {"d": "Down", "w": "let", "s": [2, 6]}, {"d": "Down", "w": "leta", "s": [1, 3]}, {"d": "Across", "w": "leto", "s": [6, 5]}, {"d": "Down", "w": "o\u010de", "s": [2, 1]}, {"d": "Across", "w": "plat", "s": [6, 1]}, {"d": "Down", "w": "pla\u010d", "s": [7, 0]}, {"d": "Across", "w": "pot", "s": [6, 7]}, {"d": "Across", "w": "potek", "s": [0, 8]}, {"d": "Down", "w": "tako", "s": [4, 0]}, {"d": "Down", "w": "tla", "s": [9, 1]}, {"d": "Down", "w": "tok", "s": [8, 7]}], "unused": ["pa\u010d", "pol", "pet", "tak", "o\u010di", "telo", "koli", "tik", "pokal", "ekipa", "lep", "to\u010dka", "takole", "poleti", "kopa\u010d", "peti", "pik", "loka", "plati", "tek", "klop", "ako", "paket", "tipa", "tal", "petka", "\u010delo", "lek", "kleti", "pe\u010di", "tip", "kota", "o\u010ditek", "po\u010deti", "tale", "peta", "\u010dop", "pil", "itak", "pe\u010dat", "lik", "pota", "teka", "te\u010di", "po\u010ditek", "polet", "pe\u010d", "top", "kip", "kit", "pika", "lepota", "elita", "opat", "eta", "klet", "pel", "kapo", "pilot", "topel", "pakt", "o\u010dka", "\u010dok", "alpe", "kol", "etika", "paleto", "peti\u010d", "ati", "\u010dela", "kap", "tlak", "lok", "pak", "tipalo", "pekla", "lipa", "\u010dile", "ko\u010da", "pat", "pola", "kali", "pike", "pila", "teka\u010d", "\u010deta", "ple\u010da", "peka", "\u010det", "eti", "to\u010da", "\u010dip", "tipka", "pti\u010d", "opel", "plot", "kal", "\u010dek", "lat", "poka", "lipe", "opla", "eko", "pok", "paki", "lit", "ko\u010d", "o\u010dali", "\u010dital", "apel", "to\u010di", "poet", "klepa\u010d", "poli\u010d", "\u010dopa", "ka\u010d", "o\u010ditka", "oli", "polt", "oklep", "topi\u010d", "ila", "pi\u010dlo", "\u010deti", "alt", "kopati", "takle", "koti", "kotel", "kopel", "tolpa", "o\u010da", "ti\u010d", "kopal", "ilo", "kle\u010d", "polka", "kape", "pikl", "ki\u010d", "kop", "\u010dik", "kola\u010d", "peki", "api", "optika", "poetika", "klati", "kotla", "pek", "kopa", "lot", "eto", "pal\u010dek", "kapi\u010d", "\u010deka", "pi\u010del", "poeta", "opeka", "laik", "petak", "po\u010dek", "kita", "\u010dil", "tika", "otip", "kepa", "peklo", "petko", "kopi\u010d", "pti\u010de", "polk", "o\u010dek", "pilo", "pelo", "potika", "tol\u010di", "poli", "\u010dokat", "pokati", "pti\u010dka", "kali\u010d", "pita", "le\u010di", "\u010dita", "pti\u010dek", "letak", "lak", "alo", "kopat", "le\u010do", "atek", "lopati", "plato", "ti\u010da", "teli\u010dka", "liko", "laket", "\u010dipka", "tol", "poetik", "ple\u010d", "opa", "polke", "pe\u010da", "klep", "o\u010dak", "aki", "teko", "lopa", "atol", "pe\u010dal", "le\u010da", "\u010dokati", "po\u010d", "lop", "ikt", "peka\u010d", "lo\u010d", "tolk", "laki", "ple\u010dat", "pe\u010dka", "klopa", "italo", "kep", "pa\u010di", "plitek", "tolik", "pieta", "tle", "tepka", "toli", "tola", "ate", "kila", "tap", "\u010dep", "tila", "tali", "optik", "tikal", "lakot", "etik", "olika", "epika", "ti\u010dek", "tle\u010di", "lepak", "toplek", "tekila", "laki\u010d", "opal", "pilotka", "oka", "\u010dap", "kapitol", "\u010dak", "otela", "pako", "plitka", "\u010dao", "otep", "potka", "li\u010dka", "kli", "poli\u010dek", "ilka", "kle\u010dati", "kaptol", "eia", "pole\u010di", "\u010dopka", "til", "kle\u010da", "plet", "kopt", "\u010doka", "alk", "ti\u010dka", "itako", "oti", "oklepati", "ipak", "to\u010d", "tolka\u010d", "kotli\u010d", "pi\u010dka", "topika", "\u010delika", "pe\u010dak", "poklati", "opeka\u010d", "klo", "ke\u010d", "pote\u010di", "lo\u010dek", "koli\u010d", "okel", "\u010depa", "klope", "kolt", "klip", "kilt", "kelt", "ope\u010di", "klap", "pilka", "ke\u010dap", "kalo", "epik", "akel", "eki", "tkalo", "pleti", "pato", "otka"]},
                          {"size": [11, 10], "letters": "\u0161ahiranje", "words": [{"d": "Across", "w": "aha", "s": [2, 8]}, {"d": "Down", "w": "aja", "s": [1, 5]}, {"d": "Down", "w": "haj", "s": [8, 7]}, {"d": "Across", "w": "hej", "s": [0, 3]}, {"d": "Down", "w": "hi\u0161a", "s": [6, 0]}, {"d": "Across", "w": "hi\u0161na", "s": [5, 1]}, {"d": "Across", "w": "jan", "s": [5, 3]}, {"d": "Down", "w": "jar", "s": [2, 7]}, {"d": "Across", "w": "jara", "s": [0, 1]}, {"d": "Down", "w": "jih", "s": [2, 3]}, {"d": "Down", "w": "naj", "s": [7, 3]}, {"d": "Down", "w": "na\u0161", "s": [6, 5]}, {"d": "Across", "w": "raj", "s": [0, 7]}, {"d": "Down", "w": "raja", "s": [4, 5]}, {"d": "Down", "w": "raje", "s": [1, 0]}, {"d": "Down", "w": "raj\u0161i", "s": [9, 0]}, {"d": "Down", "w": "ra\u0161", "s": [3, 0]}, {"d": "Across", "w": "\u0161ah", "s": [6, 7]}, {"d": "Across", "w": "\u0161ahiranje", "s": [0, 5]}], "unused": ["hrana", "era", "ane", "ran", "rana", "ina", "jera", "ra\u0161a", "hren", "arena", "rajh", "nehaj", "ni\u0161a", "rajha", "han", "ni\u0161", "reja", "hja", "\u0161ajn", "jen", "jerina", "arija", "rena", "je\u0161", "aren", "jin", "\u0161ara", "ara", "area", "rja", "rajni", "\u0161en", "jeri", "nih", "jeran", "rej", "rije", "re\u0161", "jaa", "jerin", "\u0161ar", "naje", "hiranje", "\u0161raj", "jer", "nara", "jare", "renij", "\u0161in", "hara", "rajna", "hijena", "eia", "rajni\u0161", "\u0161ir", "nja", "harija", "jah", "nihaj", "arha", "\u0161eri", "arni", "\u0161erija", "nareja", "hinje", "hena", "hija", "naa", "\u0161iren", "\u0161er", "rin", "inje", "arhe", "hir"]},
                          {"size": [10, 11], "letters": "tapravi", "words": [{"d": "Down", "w": "iva", "s": [3, 0]}, {"d": "Down", "w": "par", "s": [1, 5]}, {"d": "Across", "w": "piva", "s": [0, 9]}, {"d": "Down", "w": "prav", "s": [8, 1]}, {"d": "Across", "w": "pravi", "s": [1, 2]}, {"d": "Down", "w": "pri", "s": [6, 4]}, {"d": "Across", "w": "prvi", "s": [6, 4]}, {"d": "Down", "w": "riva", "s": [3, 6]}, {"d": "Down", "w": "rtv", "s": [2, 2]}, {"d": "Across", "w": "tapravi", "s": [0, 6]}, {"d": "Down", "w": "tip", "s": [1, 0]}, {"d": "Down", "w": "tri", "s": [5, 0]}, {"d": "Across", "w": "via", "s": [2, 4]}, {"d": "Down", "w": "vir", "s": [7, 7]}, {"d": "Down", "w": "vrat", "s": [5, 6]}, {"d": "Down", "w": "vrata", "s": [4, 2]}, {"d": "Across", "w": "vrati", "s": [3, 8]}, {"d": "Across", "w": "vrt", "s": [7, 2]}], "unused": ["pari", "tipa", "para", "art", "ata", "tir", "vita", "trava", "ati", "pat", "avt", "prt", "vip", "rit", "trp", "tara", "api", "pav", "rap", "irt", "tari", "trip", "pirat", "piv", "pir", "trap", "pita", "part", "rapa", "rita", "ara", "prati", "avra", "trapa", "prta", "vari", "var", "vata", "pava", "ava", "pira", "pravit", "tap", "varati", "vitra", "pair", "tra", "prat", "vatra", "tiara", "parta", "piar", "tvar", "atari", "prata", "arpa", "irta", "tvi"]},
                          {"size": [10, 10], "letters": "fatalizem", "words": [{"d": "Across", "w": "ali", "s": [7, 6]}, {"d": "Down", "w": "ata", "s": [1, 6]}, {"d": "Across", "w": "eta", "s": [3, 2]}, {"d": "Across", "w": "fatalizem", "s": [0, 4]}, {"d": "Down", "w": "imela", "s": [1, 0]}, {"d": "Down", "w": "lat", "s": [8, 0]}, {"d": "Down", "w": "let", "s": [8, 6]}, {"d": "Down", "w": "leta", "s": [7, 3]}, {"d": "Across", "w": "mala", "s": [5, 1]}, {"d": "Down", "w": "mali", "s": [5, 1]}, {"d": "Across", "w": "malta", "s": [5, 8]}, {"d": "Across", "w": "mati", "s": [0, 8]}, {"d": "Across", "w": "met", "s": [1, 1]}, {"d": "Across", "w": "tam", "s": [0, 6]}, {"d": "Down", "w": "tem", "s": [2, 4]}, {"d": "Down", "w": "tema", "s": [3, 1]}, {"d": "Down", "w": "tif", "s": [3, 7]}, {"d": "Down", "w": "tim", "s": [5, 6]}], "unused": ["ime", "film", "tla", "zatem", "tal", "tale", "izlet", "meta", "meti", "zima", "mit", "faza", "miza", "time", "metal", "elita", "team", "mate", "azil", "teza", "ati", "fiat", "tama", "alfa", "eti", "zlat", "tima", "mita", "mat", "lit", "tamle", "zala", "alma", "ala", "mel", "ila", "zalet", "file", "alt", "zeta", "zet", "mil", "laz", "lama", "lame", "elfa", "mela", "zali", "metla", "zel", "ami", "mata", "mleti", "fatima", "laza", "lim", "fama", "fila", "zal", "mazati", "zmleti", "izmet", "atila", "tami", "tle", "fil", "ate", "zamet", "tila", "tali", "zameti", "taf", "zila", "amal", "zlet", "altea", "lata", "eia", "til", "lift", "efa", "lem", "feta", "atemi", "lema", "izem", "fla", "metil"]},
                          {"size": [11, 10], "letters": "misti\u010den", "words": [{"d": "Across", "w": "ime", "s": [1, 4]}, {"d": "Down", "w": "imeti", "s": [9, 1]}, {"d": "Across", "w": "isti", "s": [1, 1]}, {"d": "Down", "w": "iti", "s": [7, 7]}, {"d": "Down", "w": "meni", "s": [3, 3]}, {"d": "Across", "w": "met", "s": [2, 8]}, {"d": "Down", "w": "mini", "s": [4, 0]}, {"d": "Across", "w": "misti\u010den", "s": [3, 3]}, {"d": "Down", "w": "miti", "s": [7, 0]}, {"d": "Down", "w": "nem", "s": [8, 5]}, {"d": "Down", "w": "nit", "s": [4, 6]}, {"d": "Across", "w": "niti", "s": [6, 1]}, {"d": "Across", "w": "ni\u010d", "s": [8, 5]}, {"d": "Down", "w": "sem", "s": [2, 6]}, {"d": "Across", "w": "sin", "s": [2, 6]}, {"d": "Down", "w": "tem", "s": [6, 3]}, {"d": "Down", "w": "tim", "s": [1, 3]}, {"d": "Across", "w": "\u010dim", "s": [6, 7]}], "unused": ["mest", "istem", "sit", "mesti", "smeti", "tenis", "meti", "te\u010di", "mit", "me\u010d", "time", "\u010dist", "sen", "se\u010di", "net", "\u010det", "sten", "eti", "sim", "set", "ten", "\u010deti", "\u010din", "sneti", "ti\u010d", "siten", "sine", "ste\u010di", "nesti", "sti", "eis", "mesi\u010d", "tin", "ini", "meniti", "mis", "semi", "smet", "se\u010d", "ni\u010de", "metin", "ne\u010dist", "sini\u010d", "snet", "tein", "ni\u010des", "ni\u010dti"]},
                          {"size": [11, 10], "letters": "zelenkast", "words": [{"d": "Down", "w": "elan", "s": [6, 2]}, {"d": "Across", "w": "las", "s": [7, 6]}, {"d": "Down", "w": "lek", "s": [7, 6]}, {"d": "Down", "w": "let", "s": [5, 0]}, {"d": "Down", "w": "leta", "s": [1, 3]}, {"d": "Across", "w": "nas", "s": [0, 6]}, {"d": "Down", "w": "nek", "s": [7, 0]}, {"d": "Down", "w": "neka", "s": [4, 4]}, {"d": "Down", "w": "seka", "s": [9, 6]}, {"d": "Down", "w": "stal", "s": [2, 6]}, {"d": "Across", "w": "tak", "s": [5, 8]}, {"d": "Down", "w": "tale", "s": [3, 1]}, {"d": "Across", "w": "teka", "s": [5, 2]}, {"d": "Down", "w": "tla", "s": [8, 4]}, {"d": "Across", "w": "tlak", "s": [0, 8]}, {"d": "Across", "w": "zelenkast", "s": [0, 4]}, {"d": "Across", "w": "zlat", "s": [0, 1]}], "unused": ["kazen", "san", "enak", "znak", "znesek", "senat", "last", "tek", "akt", "tal", "les", "lesa", "stekel", "zelena", "letna", "kan", "knez", "eta", "klet", "teza", "lasten", "stan", "sen", "ane", "slak", "zatekel", "sena", "net", "stena", "sten", "aneks", "steza", "tele", "tesna", "kal", "zelen", "lat", "ete", "kneza", "kant", "sel", "sla", "set", "lesen", "tesen", "len", "stalen", "nak", "tank", "kaz", "nesla", "lan", "natek", "ten", "zalet", "sak", "alt", "sela", "takle", "zeta", "zet", "steka", "lesk", "laz", "sekta", "klas", "nat", "nalet", "tenka", "teke", "klan", "zen", "skelet", "zaselek", "lene", "sekt", "sat", "tesla", "letak", "lak", "leska", "zel", "atek", "tenek", "ska", "laket", "eks", "enes", "kes", "kesa", "lenta", "steklen", "sek", "sene", "zelenka", "zal", "sanke", "asket", "slan", "tle", "ate", "kas", "teleks", "enka", "lesket", "sake", "kneset", "laks", "selen", "kenta", "skat", "zas", "zlet", "tlesk", "klen", "senta", "akne", "stanek", "alk", "stela", "skela", "lateks", "senka", "netek", "snet", "tnk", "stek", "naz", "kasne", "kelt", "tesa", "akel", "kasten", "tenk", "etan", "zek"]},
                          {"size": [11, 10], "letters": "invalid", "words": [{"d": "Down", "w": "ali", "s": [8, 3]}, {"d": "Across", "w": "dan", "s": [5, 7]}, {"d": "Down", "w": "din", "s": [2, 7]}, {"d": "Down", "w": "divan", "s": [9, 5]}, {"d": "Across", "w": "dlan", "s": [6, 1]}, {"d": "Across", "w": "dva", "s": [2, 2]}, {"d": "Across", "w": "ida", "s": [0, 1]}, {"d": "Down", "w": "ila", "s": [4, 0]}, {"d": "Down", "w": "ina", "s": [6, 3]}, {"d": "Across", "w": "invalid", "s": [3, 5]}, {"d": "Across", "w": "iva", "s": [7, 8]}, {"d": "Across", "w": "ivan", "s": [6, 3]}, {"d": "Down", "w": "lani", "s": [7, 5]}, {"d": "Down", "w": "liv", "s": [7, 1]}, {"d": "Down", "w": "nad", "s": [2, 0]}, {"d": "Across", "w": "vadi", "s": [0, 7]}, {"d": "Across", "w": "val", "s": [1, 4]}, {"d": "Down", "w": "vid", "s": [5, 5]}, {"d": "Down", "w": "vila", "s": [1, 4]}, {"d": "Down", "w": "vili", "s": [3, 2]}], "unused": ["via", "davi", "linda", "lan", "lina", "diva", "vdan", "dina", "idila", "naliv", "dia", "ini", "navil", "div", "dai", "vladin", "nav", "inda", "vani", "vidin", "lavin", "dil", "dila"]},
                          {"size": [11, 10], "letters": "breznica", "words": [{"d": "Across", "w": "ane", "s": [6, 2]}, {"d": "Across", "w": "ban", "s": [1, 6]}, {"d": "Down", "w": "bar", "s": [5, 6]}, {"d": "Across", "w": "bazen", "s": [5, 6]}, {"d": "Across", "w": "bir", "s": [4, 1]}, {"d": "Across", "w": "brce", "s": [1, 3]}, {"d": "Down", "w": "brez", "s": [4, 1]}, {"d": "Across", "w": "cen", "s": [8, 1]}, {"d": "Down", "w": "cena", "s": [8, 1]}, {"d": "Down", "w": "enica", "s": [9, 5]}, {"d": "Across", "w": "izbranec", "s": [2, 8]}, {"d": "Down", "w": "niz", "s": [3, 6]}, {"d": "Down", "w": "rab", "s": [1, 1]}, {"d": "Down", "w": "rabi", "s": [6, 1]}, {"d": "Down", "w": "razen", "s": [7, 4]}, {"d": "Down", "w": "reza", "s": [2, 3]}, {"d": "Across", "w": "zbira", "s": [4, 4]}], "unused": ["neba", "izbran", "era", "riba", "bran", "ran", "car", "cia", "ina", "rez", "bric", "zec", "raz", "zbran", "baz", "bena", "izba", "zrnec", "rabin", "rac", "cezar", "zen", "brca", "zbir", "bre", "rena", "aren", "breza", "ric", "ica", "abe", "cri", "cin", "zenica", "ibe", "bizaren", "brica", "bia", "brna", "ibar", "caen", "brin", "nac", "brc", "arzen", "zebra", "bec", "riza", "ber", "cer", "zrnce", "erc", "naci", "cizar", "bac", "rezina", "ciba", "cian", "iba", "bira", "abi", "eia", "ribez", "benica", "zib", "nic", "brzin", "bez", "bazin", "brzina", "arni", "zar", "breznica", "ziba", "nerc", "naz", "beznica", "barin", "beza", "rin", "eci", "bri"]},
                          {"size": [10, 10], "letters": "dihanje", "words": [{"d": "Down", "w": "ane", "s": [2, 4]}, {"d": "Down", "w": "dah", "s": [6, 5]}, {"d": "Down", "w": "dai", "s": [4, 0]}, {"d": "Down", "w": "dan", "s": [3, 2]}, {"d": "Down", "w": "dej", "s": [1, 2]}, {"d": "Down", "w": "dih", "s": [3, 6]}, {"d": "Across", "w": "dihanje", "s": [3, 2]}, {"d": "Down", "w": "hej", "s": [8, 0]}, {"d": "Down", "w": "hja", "s": [5, 2]}, {"d": "Down", "w": "ideja", "s": [8, 4]}, {"d": "Down", "w": "ina", "s": [6, 0]}, {"d": "Across", "w": "jaden", "s": [5, 6]}, {"d": "Across", "w": "jan", "s": [1, 4]}, {"d": "Across", "w": "jed", "s": [1, 6]}, {"d": "Down", "w": "jen", "s": [1, 6]}, {"d": "Across", "w": "jih", "s": [7, 4]}, {"d": "Across", "w": "nad", "s": [7, 8]}, {"d": "Down", "w": "naj", "s": [7, 2]}, {"d": "Across", "w": "nehaj", "s": [1, 8]}], "unused": ["ide", "ida", "han", "edin", "dina", "din", "ajde", "ajd", "hajdi", "dia", "jin", "heda", "ned", "nih", "ajdi", "jad", "had", "haj", "nadih", "hajd", "naje", "hijena", "eia", "inda", "nja", "jah", "nihaj", "hinje", "hena", "jedan", "hajde", "hija", "dien", "inje"]},
                          {"size": [10, 11], "letters": "pravljica", "words": [{"d": "Down", "w": "ali", "s": [8, 5]}, {"d": "Across", "w": "cilj", "s": [2, 9]}, {"d": "Across", "w": "cipra", "s": [1, 2]}, {"d": "Down", "w": "jar", "s": [5, 5]}, {"d": "Down", "w": "para", "s": [7, 0]}, {"d": "Across", "w": "pav", "s": [6, 3]}, {"d": "Across", "w": "pij", "s": [0, 7]}, {"d": "Down", "w": "pil", "s": [4, 7]}, {"d": "Down", "w": "prav", "s": [3, 2]}, {"d": "Across", "w": "pravi", "s": [4, 7]}, {"d": "Across", "w": "pravljica", "s": [0, 5]}, {"d": "Down", "w": "pri", "s": [6, 3]}, {"d": "Down", "w": "prvi", "s": [1, 4]}, {"d": "Across", "w": "val", "s": [6, 1]}, {"d": "Down", "w": "vic", "s": [1, 0]}, {"d": "Down", "w": "vir", "s": [4, 0]}], "unused": ["pravica", "par", "pari", "iva", "piva", "lica", "april", "palica", "raj", "vila", "alica", "vala", "plava", "vaja", "vilar", "lipa", "car", "vaj", "pila", "via", "prijava", "raja", "cia", "alija", "pliva", "liv", "vip", "ala", "cvi", "livar", "ila", "palac", "rac", "riva", "jara", "api", "prija", "cila", "raca", "rap", "lava", "aja", "rjav", "cap", "lira", "valj", "piv", "arija", "pir", "pala", "rapa", "pvc", "ric", "ica", "avla", "ara", "cri", "avra", "valjar", "pica", "rja", "cip", "privaja", "vari", "var", "vica", "pava", "ril", "ava", "plav", "pilar", "pira", "jaa", "aca", "lavra", "racija", "cal", "capri", "capa", "plac", "vrl", "rival", "pair", "piar", "palacij", "alva", "cipa", "japi", "arpa", "vpij", "pavji", "jav", "plavica", "paca", "ral", "lavrica", "laj", "avija", "cala", "parica", "ajvar", "pajac", "jaca", "vija"]},
                          {"size": [10, 11], "letters": "prevlada", "words": [{"d": "Across", "w": "dala", "s": [4, 9]}, {"d": "Down", "w": "dar", "s": [7, 8]}, {"d": "Across", "w": "del", "s": [7, 8]}, {"d": "Down", "w": "dpa", "s": [7, 4]}, {"d": "Down", "w": "dva", "s": [8, 2]}, {"d": "Down", "w": "dve", "s": [8, 6]}, {"d": "Across", "w": "lep", "s": [2, 1]}, {"d": "Down", "w": "lepa", "s": [6, 1]}, {"d": "Down", "w": "lev", "s": [5, 4]}, {"d": "Across", "w": "per", "s": [0, 7]}, {"d": "Down", "w": "prav", "s": [4, 1]}, {"d": "Down", "w": "pred", "s": [2, 6]}, {"d": "Across", "w": "prevlada", "s": [2, 6]}, {"d": "Across", "w": "rad", "s": [0, 9]}, {"d": "Down", "w": "red", "s": [1, 3]}, {"d": "Across", "w": "reda", "s": [1, 3]}, {"d": "Down", "w": "val", "s": [5, 8]}, {"d": "Across", "w": "vlada", "s": [4, 4]}], "unused": ["padel", "rada", "par", "vred", "real", "vera", "para", "predal", "led", "leva", "drava", "eva", "pel", "predala", "rep", "era", "alpe", "vladar", "reala", "vala", "plava", "vel", "pare", "ved", "drva", "veda", "drev", "repa", "lada", "vre", "apel", "pravda", "pre", "ala", "ped", "ave", "reva", "ver", "pedal", "perla", "pav", "rap", "lava", "varda", "pera", "vedra", "rave", "vrela", "pad", "pala", "rapa", "delava", "avla", "ara", "area", "avra", "perl", "adler", "earl", "var", "pava", "preval", "deva", "prevala", "ava", "plav", "padar", "lavra", "apela", "lera", "vrl", "rape", "alva", "vrel", "areal", "arpa", "vpad", "drap", "vada", "ral", "dra", "vpadel", "pled", "drav", "adra"]}
                         ];
        const idx = Math.floor(Math.random() * crosswords.length);
        this.state = {
            crossword: crosswords[idx]
        }
    }

    render() {
        return (
            <div>
                <Game
                    crossword={this.state.crossword}
                    hintLimit={5}
                />
                <footer>
                    v: {version}
                </footer>
            </div>
        )
    }
}

// ========================================

ReactDOM.render(
    <App />,
    document.getElementById('root')
);

