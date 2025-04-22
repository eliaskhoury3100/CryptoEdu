"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Lock, User, Menu, X } from "lucide-react"
import { useEffect, useState } from "react"
import { LogOut } from "lucide-react"

interface User {
  id: number;
  name?: string;
  email: string;
}

export default function Navbar() {
  const pathname = usePathname()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const router = useRouter()


  useEffect(() => {

    const handleStorageChange = () => {
      const userJson = localStorage.getItem("user");
      if (userJson) {
        const user = JSON.parse(userJson);
        setUser(user);
        setIsLoggedIn(true);
      } else {
        setUser(null);
        setIsLoggedIn(false);
      }
    };

    handleStorageChange();
  
  }, [])

  const routes = [
    { href: "/", label: "Home" },
    { href: "/ciphers/affine", label: "Affine" },
    { href: "/ciphers/caesar", label: "Caesar" },
    { href: "/ciphers/vigenere", label: "Vigenère" },
    { href: "/ciphers/playfair", label: "Playfair" },
    { href: "/ciphers/hill", label: "Hill" },
    { href: "/ciphers/euclid", label: "Extended Euclid" },
  ]

  // --- Logout ---
  const handleLogout = () => {
    // Clear localStorage and update the state accordingly
    localStorage.removeItem("user")
    setIsLoggedIn(false)
    setUser(null)
    router.push("/login")
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center">
          <Link href="/" className="flex items-center">
            <Lock className="h-6 w-6 text-emerald-600 mr-2" />
            <span className="font-bold text-xl bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
              CryptoEdu
            </span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "text-sm font-medium transition-colors hover:text-emerald-600",
                pathname === route.href ? "text-emerald-600 border-b-2 border-emerald-600" : "text-gray-600"
              )}
            >
              {route.label}
            </Link>
          ))}
        </nav>

        {!isLoggedIn && (
          <div className="hidden md:flex items-center space-x-4">
            <Link href="/login">
              <Button variant="outline" className="border-emerald-500 text-emerald-700 hover:bg-emerald-50">
                <User className="mr-2 h-4 w-4" /> Login
              </Button>
            </Link>
          </div>
        )}

        {isLoggedIn && user && (
          <div className="hidden md:flex items-center space-x-4">
            <span className="font-bold text-sm bg-blue-50 p-3 rounded-md">{user.name || user.email}</span>
            <Button
              variant="outline"
              onClick={handleLogout}
              className="border-red-300 text-red-600 hover:bg-red-50"
            >
              <LogOut className="mr-2 h-4 w-4" /> Logout
            </Button>
          </div>
        )}

        {/* Mobile Menu Button */}
        <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? <X className="h-6 w-6 text-emerald-600" /> : <Menu className="h-6 w-6 text-emerald-600" />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden border-t py-4 bg-white">
          <div className="container space-y-4">
            {routes.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                className={cn(
                  "block py-2 text-sm font-medium transition-colors hover:text-emerald-600",
                  pathname === route.href ? "text-emerald-600" : "text-gray-600"
                )}
                onClick={() => setIsMenuOpen(false)}
              >
                {route.label}
              </Link>
            ))}
            {!isLoggedIn && (
              <div className="pt-4 border-t">
                <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                  <Button className="w-full bg-gradient-to-r from-emerald-500 to-blue-500">
                    <User className="mr-2 h-4 w-4" /> Login / Register
                  </Button>
                </Link>
              </div>
            )}
            {isLoggedIn && (
              <div className="pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={handleLogout}
                  className="border-red-300 text-red-600 hover:bg-red-50"
                >
                  <LogOut className="mr-2 h-4 w-4" /> Logout
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
