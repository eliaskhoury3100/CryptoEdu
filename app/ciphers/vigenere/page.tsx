"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Lock, Unlock } from "lucide-react"

export default function VigenereCipher() {
  const [plaintext, setPlaintext] = useState("")
  const [ciphertext, setCiphertext] = useState("")
  const [key, setKey] = useState("")
  const [activeTab, setActiveTab] = useState("encrypt")
  const [stepByStep, setStepByStep] = useState<string[]>([])
  const [keyStream, setKeyStream] = useState("")

  // Generate key stream (repeated key to match plaintext length)
  const generateKeyStream = (text: string, key: string) => {
    if (!key) return ""

    let result = ""
    let keyIndex = 0

    // Filter out non-alphabetic characters from the key
    const filteredKey = key.toUpperCase().replace(/[^A-Z]/g, "")

    if (filteredKey.length === 0) return ""

    for (let i = 0; i < text.length; i++) {
      const char = text[i]

      // Only use key for alphabetic characters
      if (/[a-zA-Z]/.test(char)) {
        result += filteredKey[keyIndex % filteredKey.length]
        keyIndex++
      } else {
        result += " " // Placeholder for non-alphabetic characters
      }
    }

    return result
  }

  const encryptMessage = () => {
    if (!key) return

    const generatedKeyStream = generateKeyStream(plaintext, key)
    setKeyStream(generatedKeyStream)

    let cipher = ""
    const steps: string[] = []
    steps.push(`Starting with plaintext: ${plaintext}`)
    steps.push(`Using key: ${key}`)
    steps.push(`Generated key stream: ${generatedKeyStream}`)

    for (let i = 0; i < plaintext.length; i++) {
      const char = plaintext[i]

      // Skip non-alphabetic characters
      if (!/[a-zA-Z]/.test(char)) {
        cipher += char
        continue
      }

      // Determine if uppercase or lowercase
      const isUpperCase = char === char.toUpperCase()
      const base = isUpperCase ? 65 : 97

      // Convert plaintext character to 0-25 range
      const p = char.toUpperCase().charCodeAt(0) - 65

      // Get corresponding key character (already uppercase)
      const k = generatedKeyStream[i].charCodeAt(0) - 65

      // Apply Vigenère encryption formula
      const encryptedVal = (p + k) % 26

      // Convert back to ASCII and maintain case
      const encryptedChar = String.fromCharCode(encryptedVal + (isUpperCase ? 65 : 97))

      steps.push(
        `Character '${char}' (${p}) + Key '${generatedKeyStream[i]}' (${k}) = (${p} + ${k}) mod 26 = ${encryptedVal} → '${encryptedChar}'`,
      )

      cipher += encryptedChar
    }

    setCiphertext(cipher)
    setStepByStep(steps)
  }

  const decryptMessage = () => {
    if (!key) return

    const generatedKeyStream = generateKeyStream(ciphertext, key)
    setKeyStream(generatedKeyStream)

    let plain = ""
    const steps: string[] = []
    steps.push(`Starting with ciphertext: ${ciphertext}`)
    steps.push(`Using key: ${key}`)
    steps.push(`Generated key stream: ${generatedKeyStream}`)

    for (let i = 0; i < ciphertext.length; i++) {
      const char = ciphertext[i]

      // Skip non-alphabetic characters
      if (!/[a-zA-Z]/.test(char)) {
        plain += char
        continue
      }

      // Determine if uppercase or lowercase
      const isUpperCase = char === char.toUpperCase()
      const base = isUpperCase ? 65 : 97

      // Convert ciphertext character to 0-25 range
      const c = char.toUpperCase().charCodeAt(0) - 65

      // Get corresponding key character (already uppercase)
      const k = generatedKeyStream[i].charCodeAt(0) - 65

      // Apply Vigenère decryption formula
      let decryptedVal = (c - k) % 26
      // Handle negative modulo
      if (decryptedVal < 0) decryptedVal += 26

      // Convert back to ASCII and maintain case
      const decryptedChar = String.fromCharCode(decryptedVal + (isUpperCase ? 65 : 97))

      steps.push(
        `Character '${char}' (${c}) - Key '${generatedKeyStream[i]}' (${k}) = (${c} - ${k}) mod 26 = ${decryptedVal} → '${decryptedChar}'`,
      )

      plain += decryptedChar
    }

    setPlaintext(plain)
    setStepByStep(steps)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-emerald-700">Vigenère Cipher</h1>
        <p className="mt-2 text-gray-600">
          A polyalphabetic substitution cipher that uses a keyword to determine multiple shift values
        </p>
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
                  <CardTitle className="text-emerald-700">Encryption</CardTitle>
                  <CardDescription>Convert plaintext to ciphertext using the Vigenère cipher</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
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
                    <Label htmlFor="key">Key</Label>
                    <Input
                      id="key"
                      placeholder="Enter encryption key (word or phrase)"
                      value={key}
                      onChange={(e) => setKey(e.target.value)}
                    />
                    <p className="text-xs text-gray-500">Only alphabetic characters in the key will be used</p>
                  </div>

                  <div className="space-y-2">
                    <Button
                      onClick={encryptMessage}
                      disabled={!plaintext || !key}
                      className="w-full bg-emerald-600 hover:bg-emerald-700"
                    >
                      <Lock className="mr-2 h-4 w-4" /> Encrypt
                    </Button>
                  </div>

                  {ciphertext && (
                    <div className="space-y-2 pt-4 border-t">
                      <Label htmlFor="ciphertext">Ciphertext</Label>
                      <div className="p-4 bg-blue-50 rounded-md font-mono break-all">{ciphertext}</div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="decrypt">
              <Card>
                <CardHeader>
                  <CardTitle className="text-blue-700">Decryption</CardTitle>
                  <CardDescription>Convert ciphertext back to plaintext using the Vigenère cipher</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
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
                    <Label htmlFor="key-decrypt">Key</Label>
                    <Input
                      id="key-decrypt"
                      placeholder="Enter decryption key (word or phrase)"
                      value={key}
                      onChange={(e) => setKey(e.target.value)}
                    />
                    <p className="text-xs text-gray-500">Only alphabetic characters in the key will be used</p>
                  </div>

                  <div className="space-y-2">
                    <Button
                      onClick={decryptMessage}
                      disabled={!ciphertext || !key}
                      className="w-full bg-blue-600 hover:bg-blue-700"
                    >
                      <Unlock className="mr-2 h-4 w-4" /> Decrypt
                    </Button>
                  </div>

                  {plaintext && (
                    <div className="space-y-2 pt-4 border-t">
                      <Label htmlFor="plaintext-output">Plaintext</Label>
                      <div className="p-4 bg-emerald-50 rounded-md font-mono break-all">{plaintext}</div>
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
                  <h3 className="font-bold">Key Generation</h3>
                  <p>The key is repeated to match the length of the plaintext, creating a key stream.</p>
                  {keyStream && (
                    <div className="mt-2 p-3 bg-blue-50 rounded-md">
                      <p className="font-mono break-all">Key Stream: {keyStream}</p>
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="font-bold">Encryption</h3>
                  <p>For each letter in the plaintext:</p>
                  <p className="p-2 bg-gray-50 rounded-md mt-1 font-mono">C = (P + K) mod 26</p>
                  <p className="mt-1">Where P is the plaintext letter and K is the corresponding key letter</p>
                </div>

                <div>
                  <h3 className="font-bold">Decryption</h3>
                  <p>For each letter in the ciphertext:</p>
                  <p className="p-2 bg-gray-50 rounded-md mt-1 font-mono">P = (C - K) mod 26</p>
                  <p className="mt-1">Where C is the ciphertext letter and K is the corresponding key letter</p>
                </div>

                <div>
                  <h3 className="font-bold">Historical Note</h3>
                  <p>
                    Named after Blaise de Vigenère, although it was actually first described by Giovan Battista Bellaso
                    in 1553.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

