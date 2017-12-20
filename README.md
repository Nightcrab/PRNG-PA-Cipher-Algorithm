# Polyalphabetic Cipher Algorithm (Node.js)
A symmetric key encryption program that pseudo-randomly shuffles alphabets based on 3-character sections of key. After creating all alphabets stored in the key, reapplies the cipher to the key to create the next array of substitution alphabets.

Step-through of cipher process:

1. The cipher takes a string of plaintext and a string that is the key (The key's length should be a multiple of 3)
2. The first 3 characters of the key are used to seed a random number, which shuffles an alphabet of A-Z, a-z, 0-9 and several other characters.
3. Step 2 is repeated for all 3-long sections of the key, creating an array of substitution alphabets (stored as maps with the original alphabet letter as the key and its substitution equivalent as the value)
4. Apply 1st alphabet to 1st plaintext character, 2nd alphabet to 2nd character, etc. for as many alphabets as are stored in the array.
5. The subPolyB function which is responsible for shuffling and applying alphabets is called with the first parameter(the plaintext) as the key, and the second (key to cipher with) as the key's reverse.
6. Steps 1 through 5 are repeated over and over until all of the characters of plaintext are converted to characters of ciphertext.
7. Ciphertext is returned.
