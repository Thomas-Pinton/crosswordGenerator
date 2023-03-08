/*

Find all words, size and coordinates
(min 3 size)

word = {
    start:
    size:
    direction:
    letters:
}

Fill with words, starting from biggest to smallest

*/

const TAM_MIN_PALAVRA = 4;

let gridSize = { x: 9, y: 14 };

let grid = [
    [0, 1, 0, 0, 1, 0, 0, 1, 0],
    [0, 1, 1, 1, 1, 1, 1, 1, 0],
    [0, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1],
    [0, 1, 1, 1, 1, 1, 0, 1, 1],
    [0, 1, 0, 1, 1, 1, 1, 0, 1],
    [1, 1, 1, 0, 1, 0, 0, 1, 1],
    [0, 1, 1, 1, 1, 1, 0, 1, 1],
    [0, 1, 0, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 0, 1, 0, 1, 1],
    [0, 1, 0, 1, 1, 1, 1, 0, 1],
    [1, 1, 1, 0, 1, 1, 1, 1, 1],
    [0, 1, 0, 1, 1, 1, 0, 1, 1],
    [0, 0, 1, 1, 1, 1, 1, 1, 1],
];

let words = [];

let wordBank = [];

for (var i = 0; i < 22; i++) {
    wordBank[i] = new Array();
}

// 👇️ if using ES6 Imports uncomment line below
// import {readFileSync, promises as fsPromises} from 'fs';
const {promises: fsPromises} = require('fs');

// ✅ read file ASYNCHRONOUSLY
async function asyncReadFile(filename) {
  try {
    const contents = await fsPromises.readFile(filename, 'utf-8');

    const wordBankBig = contents.split(/\r?\n/);

    // separando palavras por tamanho
    for (var i = 0; i < wordBankBig.length; i++)
    {
        wordBank[wordBankBig[i].length].push(wordBankBig[i]);
    }

  } catch (err) {
    console.log(err);
  }
}

function findWords()
{
    for (var i = 0; i < gridSize.y; i++)
    {
        for (var j = 0; j < gridSize.x; j++)
        {
            if (grid[i][j] == 1) // all empty are candidates
            {
                if (i-1 < 0 || grid[i-1][j] == 0) 
                // se o anterior estiver fora do mapa pode ser começo de palavra
                {
                    let length = getLengthY(j, i);
                    if (length >= TAM_MIN_PALAVRA)
                    {
                        words.push({
                            start: [i, j],
                            size: length,
                            direction: 'y',
                            letters: []
                        })
                    }
                }
                if (j-1 < 0 || grid[i][j-1] == 0)
                {
                    let length = getLengthX(j, i);
                    if (length > TAM_MIN_PALAVRA)
                    {
                        words.push({
                            start: [i, j],
                            size: length,
                            direction: 'x',
                            letters: []
                        })
                    }
                }
            }
        }   
    }
}

function fillGrid()
{
    for (let q in words)
    {
        if (words[q].direction == 'x')
        {
            words[q].size += 3;
        }
    }
    words.sort((a, b) => b.size - a.size);
    for (let q in words)
    {
        if (words[q].direction == 'x')
        {
            words[q].size -= 3;
        }
    }

    console.log(words);

    for (let j in words)
    {
        let word = words[j];
        console.log('word', word);
        // atualizar com as letras já colocadas
        for (var i = 0; i < word.size; i++)
        {
            if (word.direction == 'x')
            {
                word.letters[i] = grid[word.start[0]][word.start[1] + i];
            }
            else 
            {
                word.letters[i] = grid[word.start[0] + i][word.start[1]];
            }
        }

        for (var k in wordBank[word.size])
        {
            var bankWord = wordBank[word.size][getRandomInt(0, wordBank[word.size].length - 1)];
            if (wordFits(bankWord, word))
            {
                for (var i = 0; i < word.size; i++)
                {
                    if (word.direction == 'x')
                    {
                        grid[word.start[0]][word.start[1] + i] = bankWord[i];
                    }
                    else 
                    {
                        grid[word.start[0] + i][word.start[1]] = bankWord[i];
                    }
                    word.letters[i] = bankWord[i];
                }
            }
        }

    }
}

function wordFits(bankWord, word)
{
    for (var i = 0; i < word.letters.length; i++)
    {
        if (word.letters[i] != 1)
        {
            if (bankWord[i] != word.letters[i])
                return 0;
        }
    }
    return 1;
}

function getLengthX(x, y)
{
    var i;
    for (i = 1; i+x < gridSize.x && grid[y][x + i]; i++)
    {
    }
    return i;
}

function getLengthY(x, y)
{
    var t;
    for (t = 1; t+y < gridSize.y && grid[y + t][x]; t++)
    {
    }
    return t;
}

async function doCrossword()
{
    await asyncReadFile('./palavras.txt');
    findWords();
    fillGrid();
    console.log(grid);
    console.log(words);

    var wrongWords = 0;

    for (var i in words)
    {
        for (var j in words[i].letters)
        {
            if (words[i].letters[j] == 1)
            {
                wrongWords++;
                break;
            }
        }
    }

    console.log("The amount of wrong words is: ", wrongWords);

    const teste = grid.map(row => row.map(x => x.toString()))

    const matrixArray = teste.map(row => [...row]); // convert matrix to array of arrays

    const jsonData = JSON.stringify(matrixArray);

    var fs = require('fs');
    fs.writeFile('grid.json', jsonData, 'utf-8', (err) => {
        if (err) throw err;
        console.log('Matrix written to file');
    });
}

doCrossword();


function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
  
