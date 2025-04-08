"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Clock, Trash2, ArrowRight, LogOut } from "lucide-react"

// Define the history item type
interface HistoryItem {
  id: string
  timestamp: string
  cipherType: string
  input: string
  output: string
  operation: "encrypt" | "decrypt"
  key?: string
}

export default function HistoryPage() {
  const router = useRouter()
  const [user, setUser] = useState<{ name?: string; email: string } | null>(null)
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [activeTab, setActiveTab] = useState("all")

  // Mock history data
  const mockHistory: HistoryItem[] = [
    {
      id: "1",
      timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 minutes ago
      cipherType: "Caesar",
      input: "Hello World",
      output: "Khoor Zruog",
      operation: "encrypt",
      key: "3",
    },
    {
      id: "2",
      timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 minutes ago
      cipherType: "Affine",
      input: "Cryptography",
      output: "Wvqfzuyvkfpq",
      operation: "encrypt",
      key: "a=5, b=8",
    },
    {
      id: "3",
      timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
      cipherType: "Vigenère",
      input: "Secret Message",
      output: "Klgvxm Qwklety",
      operation: "encrypt",
      key: "KEY",
    },
    {
      id: "4",
      timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(), // 45 minutes ago
      cipherType: "Playfair",
      input: "Meet me at noon",
      output: "Lddu ld bu oppo",
      operation: "encrypt",
      key: "CIPHER",
    },
    {
      id: "5",
      timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(), // 1 hour ago
      cipherType: "Hill",
      input: "Attack at dawn",
      output: "Hgfhpx hg whzm",
      operation: "encrypt",
      key: "2x2 matrix",
    },
    {
      id: "6",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
      cipherType: "Caesar",
      input: "Khoor Zruog",
      output: "Hello World",
      operation: "decrypt",
      key: "3",
    },
  ]

  useEffect(() => {
    // Check if user is logged in
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      setUser(JSON.parse(storedUser))
      // In a real app, we would fetch history from an API
      setHistory(mockHistory)
    } else {
      // Redirect to login if not logged in
      router.push("/login")
    }
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem("user")
    router.push("/login")
  }

  const handleDeleteItem = (id: string) => {
    setHistory(history.filter((item) => item.id !== id))
  }

  const handleClearHistory = () => {
    if (confirm("Are you sure you want to clear your entire history?")) {
      setHistory([])
    }
  }

  const filteredHistory =
    activeTab === "all" ? history : history.filter((item) => item.cipherType.toLowerCase() === activeTab)

  // Format timestamp to readable format
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleString()
  }

  if (!user) {
    return <div className="container mx-auto p-8 text-center">Loading...</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-emerald-700">Encryption History</h1>
          <p className="mt-2 text-gray-600">View and manage your previous encryption and decryption operations</p>
        </div>

        <div className="mt-4 md:mt-0 flex flex-col md:flex-row items-start md:items-center gap-4">
          <div className="bg-blue-50 p-3 rounded-md">
            <p className="text-sm text-blue-700">
              Logged in as <span className="font-bold">{user.name || user.email}</span>
            </p>
          </div>

          <Button variant="outline" onClick={handleLogout} className="border-red-300 text-red-600 hover:bg-red-50">
            <LogOut className="mr-2 h-4 w-4" /> Logout
          </Button>
        </div>
      </div>

      <div className="mb-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex justify-between items-center">
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="caesar">Caesar</TabsTrigger>
              <TabsTrigger value="affine">Affine</TabsTrigger>
              <TabsTrigger value="vigenère">Vigenère</TabsTrigger>
              <TabsTrigger value="playfair">Playfair</TabsTrigger>
              <TabsTrigger value="hill">Hill</TabsTrigger>
            </TabsList>

            <Button variant="destructive" size="sm" onClick={handleClearHistory} disabled={history.length === 0}>
              <Trash2 className="mr-2 h-4 w-4" /> Clear History
            </Button>
          </div>

          <TabsContent value={activeTab} className="mt-6">
            {filteredHistory.length > 0 ? (
              <div className="space-y-4">
                {filteredHistory.map((item) => (
                  <Card key={item.id} className="overflow-hidden">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg flex items-center">
                            {item.cipherType} Cipher
                            <Badge
                              className={`ml-3 ${item.operation === "encrypt" ? "bg-emerald-500" : "bg-blue-500"}`}
                            >
                              {item.operation === "encrypt" ? "Encrypted" : "Decrypted"}
                            </Badge>
                          </CardTitle>
                          <CardDescription className="flex items-center mt-1">
                            <Clock className="h-3 w-3 mr-1" /> {formatTime(item.timestamp)}
                          </CardDescription>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteItem(item.id)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-gray-500">Input</p>
                          <p className="font-mono bg-gray-50 p-2 rounded-md break-all">{item.input}</p>
                        </div>

                        <div className="flex items-center justify-center">
                          <div className="flex flex-col items-center">
                            <ArrowRight className="h-5 w-5 text-gray-400" />
                            <p className="text-xs text-gray-500 mt-1">Key: {item.key}</p>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <p className="text-sm font-medium text-gray-500">Output</p>
                          <p className="font-mono bg-gray-50 p-2 rounded-md break-all">{item.output}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center p-8 bg-gray-50 rounded-lg">
                <p className="text-gray-500">No history found for this cipher type.</p>
                <Button variant="outline" className="mt-4" onClick={() => router.push("/")}>
                  Go to Dashboard
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

