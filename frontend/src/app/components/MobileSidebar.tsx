import { useState, useEffect } from "react"
import { Link } from "react-router"
import { useAuth } from "../../contexts/AuthContext"
import { Leaf, X, Home, ShoppingBag, Search, FileText, User, LogOut, Shield } from "lucide-react"

interface MobileSidebarProps {
  isOpen: boolean
  onClose: () => void
}

export default function MobileSidebar({ isOpen, onClose }: MobileSidebarProps) {
  const { user, isAuthenticated, isAdmin, logout } = useAuth()

  // Close sidebar on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm md:hidden"
        onClick={onClose}
      />

      {/* Sidebar */}
      <div className="fixed left-0 top-0 z-50 h-full w-80 max-w-[85vw] bg-card border-r shadow-2xl md:hidden overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <Link to="/" className="flex items-center gap-2" onClick={onClose}>
            <Leaf className="text-accent" size={22} />
            <span className="text-xl font-semibold tracking-tight" style={{ fontFamily: "'Playfair Display', serif", color: "#f2ece0" }}>
              Verdura
            </span>
          </Link>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-accent transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* User Info */}
        {isAuthenticated && user && (
          <div className="p-4 border-b bg-muted/30">
            <p className="font-semibold text-sm">{user.full_name || user.username}</p>
            <p className="text-xs text-muted-foreground">{user.email}</p>
          </div>
        )}

        {/* Navigation Links */}
        <div className="p-4 space-y-1">
          <p className="text-xs font-semibold uppercase text-muted-foreground mb-3 px-3">
            Menu
          </p>
          
          <Link
            to="/"
            onClick={onClose}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-foreground hover:bg-accent transition-colors"
          >
            <Home className="h-5 w-5" />
            Home
          </Link>

          <Link
            to="/products"
            onClick={onClose}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-foreground hover:bg-accent transition-colors"
          >
            <ShoppingBag className="h-5 w-5" />
            Shop
          </Link>

          <Link
            to="/search"
            onClick={onClose}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-foreground hover:bg-accent transition-colors"
          >
            <Search className="h-5 w-5" />
            Search
          </Link>

          <button
            onClick={onClose}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-foreground hover:bg-accent transition-colors w-full"
          >
            <FileText className="h-5 w-5" />
            Origins
          </button>

          <button
            onClick={onClose}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-foreground hover:bg-accent transition-colors w-full"
          >
            <FileText className="h-5 w-5" />
            Journal
          </button>
        </div>

        {/* User Actions */}
        <div className="p-4 space-y-1 border-t">
          <p className="text-xs font-semibold uppercase text-muted-foreground mb-3 px-3">
            Account
          </p>

          {isAuthenticated ? (
            <>
              <Link
                to="/profile"
                onClick={onClose}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-foreground hover:bg-accent transition-colors"
              >
                <User className="h-5 w-5" />
                Profile
              </Link>

              <Link
                to="/orders"
                onClick={onClose}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-foreground hover:bg-accent transition-colors"
              >
                <ShoppingBag className="h-5 w-5" />
                My Orders
              </Link>

              {isAdmin && (
                <Link
                  to="/admin"
                  onClick={onClose}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-primary hover:bg-primary/10 transition-colors"
                >
                  <Shield className="h-5 w-5" />
                  Admin Dashboard
                </Link>
              )}

              <button
                onClick={() => {
                  logout()
                  onClose()
                }}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors w-full"
              >
                <LogOut className="h-5 w-5" />
                Log out
              </button>
            </>
          ) : (
            <Link
              to="/login"
              onClick={onClose}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-foreground hover:bg-accent transition-colors"
            >
              <User className="h-5 w-5" />
              Login
            </Link>
          )}
        </div>
      </div>
    </>
  )
}
