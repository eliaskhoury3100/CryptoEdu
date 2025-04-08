"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Lock, Unlock } from "lucide-react"

export default function PlayfairCipher() {
  const [plaintext, setPlaintext] = useState("")
  const [ciphertext, setCiphertext] = useState("")
  const [key, setKey] = useState("")
  const [keyMatrix, setKeyMatrix] = useState<string[][]>([])
  const [activeTab, setActiveTab] = useState("encrypt")
  const [stepByStep, setStepByStep] = useState<string[]>([])
  const [preparedText, setPreparedText] = useState("")

  // Generate the 5x5 key matrix whenever the key changes
  useEffect(() => {
    if (key) {
      generateKeyMatrix()
    }
  }, [key])

  // Generate the 5x5 key matrix
  const generateKeyMatrix = () => {
    // Initialize the matrix
    const matrix: string[][] = Array(5)
      .fill(null)
      .map(() => Array(5).fill(""))

    // Process the key (convert to lowercase, remove duplicates and non-alphabetic characters)
    const processedKey = key.toLowerCase().replace(/[^a-z]/g, "")
    const uniqueKey = [...new Set(processedKey.split(""))].join("")

    // Create a 26-letter alphabet (excluding 'j')
    const alphabet = "abcdefghiklmnopqrstuvwxyz" // Note: 'j' is excluded

    // Fill the matrix with the key first, then the remaining alphabet
    let keyIndex = 0
    let alphabetIndex = 0

    // Track used letters
    const usedLetters = new Set()

    // Add key letters to the matrix
    for (let i = 0; i < 5; i++) {
      for (let j = 0; j < 5; j++) {
        if (keyIndex < uniqueKey.length) {
          const letter = uniqueKey[keyIndex] === "j" ? "i" : uniqueKey[keyIndex]
          if (!usedLetters.has(letter)) {
            matrix[i][j] = letter
            usedLetters.add(letter)
          } else {
            j-- // Try again with the next letter
          }
          keyIndex++
        } else {
          // Fill with remaining alphabet
          while (alphabetIndex < alphabet.length) {
            const letter = alphabet[alphabetIndex]
            alphabetIndex++
            if (!usedLetters.has(letter)) {
              matrix[i][j] = letter
              usedLetters.add(letter)
              break
            }
          }
        }
      }
    }

    setKeyMatrix(matrix)
  }

  // Prepare text for Playfair encryption (handle double letters and odd length)
  const prepareText = (text: string) => {
    // Convert to lowercase and remove non-alphabetic characters
    let prepared = text.toLowerCase().replace(/[^a-z]/g, "")

    // Replace 'j' with 'i'
    prepared = prepared.replace(/j/g, "i")

    // Insert 'x' between double letters
    let result = ""
    for (let i = 0; i < prepared.length; i++) {
      result += prepared[i]
      if (i < prepared.length - 1 && prepared[i] === prepared[i + 1]) {
        result += "x"
      }
    }

    // Add 'x' if the length is odd
    if (result.length % 2 !== 0) {
      result += "x"
    }

    return result
  }

  // Find the position of a letter in the key matrix
  const findPosition = (letter: string) => {
    for (let i = 0; i < 5; i++) {
      for (let j = 0; j < 5; j++) {
        if (keyMatrix[i][j] === letter) {
          return { row: i, col: j }
        }
      }
    }
    return { row: -1, col: -1 } // Should never happen if input is properly sanitized
  }

  const encryptMessage = () => {
    if (!key || keyMatrix.length === 0) return

    // Prepare the plaintext
    const prepared = prepareText(plaintext)
    setPreparedText(prepared)

    let cipher = ""
    const steps: string[] = []
    steps.push(`Starting with plaintext: ${plaintext}`)
    steps.push(`Prepared text: ${prepared}`)

    // Process digraphs
    for (let i = 0; i < prepared.length; i += 2) {
      const first = prepared[i]
      const second = prepared[i + 1]

      const pos1 = findPosition(first)
      const pos2 = findPosition(second)

      let newFirst = ""
      let newSecond = ""

      // Same row
      if (pos1.row === pos2.row) {
        newFirst = keyMatrix[pos1.row][(pos1.col + 1) % 5]
        newSecond = keyMatrix[pos2.row][(pos2.col + 1) % 5]
        steps.push(
          `Digraph '${first}${second}' - Same row: (${pos1.row},${pos1.col}) & (${pos2.row},${pos2.col}) → '${newFirst}${newSecond}'`,
        )
      }
      // Same column
      else if (pos1.col === pos2.col) {
        newFirst = keyMatrix[(pos1.row + 1) % 5][pos1.col]
        newSecond = keyMatrix[(pos2.row + 1) % 5][pos2.col]
        steps.push(
          `Digraph '${first}${second}' - Same column: (${pos1.row},${pos1.col}) & (${pos2.row},${pos2.col}) → '${newFirst}${newSecond}'`,
        )
      }
      // Rectangle
      else {
        newFirst = keyMatrix[pos1.row][pos2.col]
        newSecond = keyMatrix[pos2.row][pos1.col]
        steps.push(
          `Digraph '${first}${second}' - Rectangle: (${pos1.row},${pos1.col}) & (${pos2.row},${pos2.col}) → '${newFirst}${newSecond}'`,
        )
      }

      cipher += newFirst + newSecond
    }

    setCiphertext(cipher)
    setStepByStep(steps)
  }

  const decryptMessage = () => {
    if (!key || keyMatrix.length === 0) return

    let plain = ""
    const steps: string[] = []
    steps.push(`Starting with ciphertext: ${ciphertext}`)

    // Prepare the ciphertext (just ensure it's clean)
    const prepared = ciphertext
      .toLowerCase()
      .replace(/[^a-z]/g, "")
      .replace(/j/g, "i")

    // Process digraphs
    for (let i = 0; i < prepared.length; i += 2) {
      if (i + 1 >= prepared.length) break // Ensure we have a complete digraph

      const first = prepared[i]
      const second = prepared[i + 1]

      const pos1 = findPosition(first)
      const pos2 = findPosition(second)

      let newFirst = ""
      let newSecond = ""

      // Same row
      if (pos1.row === pos2.row) {
        newFirst = keyMatrix[pos1.row][(pos1.col - 1 + 5) % 5] // +5 to handle negative modulo
        newSecond = keyMatrix[pos2.row][(pos2.col - 1 + 5) % 5]
        steps.push(
          `Digraph '${first}${second}' - Same row: (${pos1.row},${pos1.col}) & (${pos2.row},${pos2.col}) → '${newFirst}${newSecond}'`,
        )
      }
      // Same column
      else if (pos1.col === pos2.col) {
        newFirst = keyMatrix[(pos1.row - 1 + 5) % 5][pos1.col]
        newSecond = keyMatrix[(pos2.row - 1 + 5) % 5][pos2.col]
        steps.push(
          `Digraph '${first}${second}' - Same column: (${pos1.row},${pos1.col}) & (${pos2.row},${pos2.col}) → '${newFirst}${newSecond}'`,
        )
      }
      // Rectangle
      else {
        newFirst = keyMatrix[pos1.row][pos2.col]
        newSecond = keyMatrix[pos2.row][pos1.col]
        steps.push(
          `Digraph '${first}${second}' - Rectangle: (${pos1.row},${pos1.col}) & (${pos2.row},${pos2.col}) → '${newFirst}${newSecond}'`,
        )
      }

      plain += newFirst + newSecond
    }

    // Note: In a real application, you would want to remove the 'x' characters that were added during encryption
    // This is a simplified version that doesn't handle that

    setPlaintext(plain)
    setStepByStep(steps)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-blue-700">Playfair Cipher</h1>
        <p className="mt-2 text-gray-600">A digraph substitution cipher that encrypts pairs of letters</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="encrypt">Encrypt</TabsTrigger>
              <TabsTrigger value="decrypt">Decrypt</TabsTrigger>
            </TabsList>

            <TabsContent value="encrypt">
              <Card>
                <CardHeader>
                  <CardTitle className="text-blue-700">Encryption</CardTitle>
                  <CardDescription>Convert plaintext to ciphertext using the Playfair cipher</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="key">Key</Label>
                    <Input
                      id="key"
                      placeholder="Enter encryption key (word or phrase)"
                      value={key}
                      onChange={(e) => setKey(e.target.value)}
                    />
                    <p className="text-xs text-gray-500">The key is used to generate the 5x5 matrix</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="plaintext">Plaintext</Label>
                    <Input
                      id="plaintext"
                      placeholder="Enter text to encrypt"
                      value={plaintext}
                      onChange={(e) => setPlaintext(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Button
                      onClick={encryptMessage}
                      disabled={!plaintext || !key}
                      className="w-full bg-blue-600 hover:bg-blue-700"
                    >
                      <Lock className="mr-2 h-4 w-4" /> Encrypt
                    </Button>
                  </div>

                  {ciphertext && (
                    <div className="space-y-2 pt-4 border-t">
                      <Label htmlFor="ciphertext">Ciphertext</Label>
                      <div className="p-4 bg-emerald-50 rounded-md font-mono break-all">{ciphertext}</div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="decrypt">
              <Card>
                <CardHeader>
                  <CardTitle className="text-emerald-700">Decryption</CardTitle>
                  <CardDescription>Convert ciphertext back to plaintext using the Playfair cipher</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="key-decrypt">Key</Label>
                    <Input
                      id="key-decrypt"
                      placeholder="Enter decryption key (word or phrase)"
                      value={key}
                      onChange={(e) => setKey(e.target.value)}
                    />
                    <p className="text-xs text-gray-500">The key is used to generate the 5x5 matrix</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ciphertext-input">Ciphertext</Label>
                    <Input
                      id="ciphertext-input"
                      placeholder="Enter text to decrypt"
                      value={ciphertext}
                      onChange={(e) => setCiphertext(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Button
                      onClick={decryptMessage}
                      disabled={!ciphertext || !key}
                      className="w-full bg-emerald-600 hover:bg-emerald-700"
                    >
                      <Unlock className="mr-2 h-4 w-4" /> Decrypt
                    </Button>
                  </div>

                  {plaintext && (
                    <div className="space-y-2 pt-4 border-t">
                      <Label htmlFor="plaintext-output">Plaintext</Label>
                      <div className="p-4 bg-blue-50 rounded-md font-mono break-all">{plaintext}</div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-emerald-700">Playfair Matrix</CardTitle>
              <CardDescription>The 5x5 key matrix used for encryption/decryption</CardDescription>
            </CardHeader>
            <CardContent>
              {keyMatrix.length > 0 ? (
                <div className="grid grid-cols-5 gap-1">
                  {keyMatrix.map((row, rowIndex) =>
                    row.map((letter, colIndex) => (
                      <div
                        key={`${rowIndex}-${colIndex}`}
                        className="aspect-square flex items-center justify-center border rounded-md bg-blue-50 font-mono text-lg"
                      >
                        {letter.toUpperCase()}
                      </div>
                    )),
                  )}
                </div>
              ) : (
                <div className="p-4 text-center text-gray-500">
                  <p>Enter a key to generate the matrix</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-blue-700">Step-by-Step Explanation</CardTitle>
              <CardDescription>See how the cipher works in detail</CardDescription>
            </CardHeader>
            <CardContent>
              {stepByStep.length > 0 ? (
                <div className="space-y-3">
                  {stepByStep.map((step, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-md">
                      <p className="text-sm">{step}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center text-gray-500">
                  <p>Perform an operation to see the step-by-step explanation</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-emerald-700">How It Works</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-sm">
                <div>
                  <h3 className="font-bold">Key Matrix</h3>
                  <p>
                    A 5x5 matrix is created using the key, filling remaining spaces with the alphabet (excluding J).
                  </p>
                </div>

                <div>
                  <h3 className="font-bold">Text Preparation</h3>
                  <p>The plaintext is prepared by:</p>
                  <ul className="list-disc pl-5 space-y-1 mt-1">
                    <li>Replacing J with I</li>
                    <li>Inserting X between repeated letters</li>
                    <li>Adding X if the length is odd</li>
                  </ul>
                  {preparedText && (
                    <div className="mt-2 p-3 bg-blue-50 rounded-md">
                      <p className="font-mono break-all">Prepared: {preparedText}</p>
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="font-bold">Encryption Rules</h3>
                  <p>For each pair of letters:</p>
                  <ul className="list-disc pl-5 space-y-1 mt-1">
                    <li>If in the same row: use letters to the right (wrapping around)</li>
                    <li>If in the same column: use letters below (wrapping around)</li>
                    <li>If in different rows and columns: use letters at the corners of the rectangle</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-bold">Historical Note</h3>
                  <p>Invented by Charles Wheatstone in 1854, but named after Lord Playfair who promoted its use.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

