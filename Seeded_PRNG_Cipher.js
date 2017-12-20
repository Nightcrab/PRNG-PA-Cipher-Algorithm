var alphabetplus = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890,.'\"! -=()\n\r{}><:;`~@#$%&*|[]".split(''); //Keys and text to encrypt/decrypt should use characters from this alphabet for optimal security
var srand = require("seedrandom"); //requires davidbao's seedrandom Node module, found at https://www.npmjs.com/package/seedrandom
var fs = require('fs');
var keys = require("./keys.json");

require.extensions['.txt'] = function (module, filename) 
{
    module.exports = fs.readFileSync(filename, 'utf8');
};

function preCalcKeys(key, amount)
{
    let nkey = '';
    for (n=0;n<amount;n++)
    {
        for (let i = 0 ; i < key.length ; i += (key.length/3))
        {
            nkey += subPolyB(key, key.split('').reverse().join(''), i);
        }
        key = nkey;
        keys.push(key);
        nkey = '';
    }
    fs.writeFileSync("./keys.json", JSON.stringify(keys));
}

function rand(min, max)
{
    let randomnum = srand();
    return Math.floor(randomnum() * max) + min;  
}

function cleanString(string, alphabet)
{
    let reg = new RegExp("[^"+alphabet+"]", "g");
    string = string.replace(/[…]/g, '...');
    string = string.replace(/[”]/g, '"');
    return string.replace(reg, ''); //function to remove characters that aren't in the input alphabet - mainly targeted at problematic UTF-8 characters that tend to break the decryption process.
}

function generateString(Length)
{
    let randomnum = srand();
    let nstring = '';
    let length = Math.floor((randomnum())*20)+1; //20 can be replaced with any number, depending on how long you want your
	                                         //randomised prefix to be. Longer is generally better, as it creates
	                                         //more possible ciphertexts for any plaintext which increases effectiveness.
    if (Length != undefined)
    {
        length = Length;
    }
    for (let i=0;i<length;i++)
    {
    	nstring += alphabetplus[rand(0, alphabetplus.length)];
    }
    return nstring+".";//Function to generate a string of random content and length, which is added to the beginning of every message.
                       //This should prevent being able to identify correlation between messages that start with the same or similar sections of text. 
}

String.prototype.shuffle = function (seed) 
{
    let a = this.split(""),
        n = a.length;
    let randomnum = srand(seed);

    for(i=n-1;i>0;i--) 
    {
        let j = Math.floor(randomnum() * (i + 1));
        let tmp = a[i];
        a[i] = a[j];
        a[j] = tmp;
    }
    return a.join(""); //Randomly shuffle an alphabet using the Fisher-Yates Shuffle algorithm (any shuffling algorithm can be used in its place).
                       //The shuffle is determined by a seeded pseudo-random number using a section of the key as a seed.
}

function polyB(string, key, reverse, usePreCalc)
{
    let nstring = '';
    let nkey = '';
    string = cleanString(string, alphabetplus.slice(0).join(''));
    let okey = key;
    let iterations = 0;
    if (!reverse)
    {
        string = generateString() + string; //Add random string to beginning of plaintext.
    }
    for (let j=0;j<string.length;j+=(key.length/3)) //Loop to iterate through plaintext in sections equivalent to how many characters the key can cipher before needing to be regenerated.
    {
         if (!reverse)
        {
            nstring += subPolyB(string, key, j);
        }
        else
        {
            nstring += subPolyB(string, key, j, true);
        }
        nkey = '';
        iterations += 1;
        if (usePreCalc)
        {
            key = keys[j/(key.length/3)];
            continue;
        }
        for (let i = 0 ; i < key.length ; i += (key.length/3))
        {
            nkey += subPolyB(key, key.split('').reverse().join(''), i);
        }
        key = nkey;
    }
    return nstring;
}

function subPolyB(string, key, j, reverse)
{
    let nstring = '';
    let nAlphabets = [];
    for (let i=0;i<(key.length/3);i++)
    {
        if (i == 0)
        {
            for (let n=0;n<key.length;n+=3)
            {
                let map = {};
                nAlphabet = alphabetplus.slice(0).join('').shuffle(key[n]+key[n+1]+key[n+2]).split('');
                for (l=0;l<alphabetplus.length;l++)
                {
                    if (reverse)
                    {
                        map[nAlphabet[l]] = alphabetplus[l];
                        continue;
                    }
                    map[alphabetplus[l]] = nAlphabet[l];
                }
                nAlphabets.push(map);
            }
        }
        if (!nAlphabets[i][string[j+i]])
        {
            if (!string[j+i])
            {
                continue;
            }
            nstring += string[j+i];
            continue;
        }
        nstring += nAlphabets[i][string[j+i]];
    }
    return nstring;
}

//All keys must have a number of characters equal to a multiple of 3.
//This is because every 3 characters of the key correlates to exactly one substitution alphabet that is applied to one character of plaintext.
//This creates 91^3 or 753,571 possible alphabets for every character of plain/ciphertext.

preCalcKeys("Key", 100000); //This should only be run once with the key of your choice. If you're planning on using the same key many times, pre-calculating them will greatly optimise the encryption/decryption time. 
                            //All messages decrypted/encrypted need to have a character length that is less than the second parameter * key_length/3 otherwise it will run out of keys.
fs.writeFileSync("encrypted.txt", polyB(require('./plaintext.txt'), "Key", false, true)); //Encrypt the input .txt
fs.writeFileSync("decrypted.txt", polyB(require('./ciphertext.txt'), "Key", true, true)); //Decrypt the input .txt
