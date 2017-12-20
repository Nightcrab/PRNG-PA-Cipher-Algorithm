var alphabetplus = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890,.'\"! ".split(''); //Keys and text to encrypt/decrypt should use characters from this alphabet for maximum security
var srand = require("seedrandom"); //requires davidbao's seedrandom Node module, found at https://www.npmjs.com/package/seedrandom

function rand(min, max)
{
	let randomnum = srand();
	return Math.floor(randomnum() * max) + min;  
}

function generateString(returnlength)
{
    let randomnum = srand();
    let nstring = '';
    let length = Math.floor((randomnum())*20)+1;
    for (let i=0;i<length;i++)
    {
    	nstring += alphabetplus[rand(0, alphabetplus.length)];
    }
    return nstring+"."; //Function to generate a string of random content and length, which is added to the beginning of every message.
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

function polyB(string, key, reverse)
{
    let nstring = '';
    let nkey = '';
    key = key.split('');
    let okey = key.slice(0);
    if (!reverse)
    {
        string = generateString() + string; //Add random string to beginning of plaintext.
    }
    string = string.split('');
    for (j=0;j<string.length;j+=(key.length/3)) //Loop to iterate through plaintext in sections equivalent to how many characters the key can cipher before needing to be regenerated.
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
        for (let i = 0 ; i < key.length ; i += (key.length/3))
        {
            nkey += subPolyB(key.slice(0).join(''), key.slice(0).reverse().join(''), i); //Apply cipher to the key (as plaintext) using the key backwards as a key.
        }
        console.log("key was ciphered : "+key.slice(0).join('')+" : "+nkey);
        key = nkey.split('');
        if (key == okey)
        {
            return "key has repeated";
        }
    }
    return nstring; //return ciphertext
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
//This creates 68*68*68 or 314,432 possible alphabets for every character of plain/ciphertext.

console.log(polyB("Encrypt this text", "Key", false)); //Encrypt the input text 
console.log(polyB("MDZiB.6NA8nV'9iopn\".0JnFx9AwXgj\"aec", "Key", true)); //Decrypt the input text (be sure to backslash all quote marks)
