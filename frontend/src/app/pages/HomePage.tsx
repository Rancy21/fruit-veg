import { useState } from "react";
import { Link } from "react-router";
import { Search, ShoppingBasket, Leaf, ChevronRight, Star, Truck, Shield, RefreshCw, Heart } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { useCart } from "../../contexts/CartContext";

const HERO_IMG = "https://images.unsplash.com/photo-1557844352-761f2565b576?w=1600&h=900&fit=crop&auto=format";
const STAND_IMG = "https://images.unsplash.com/photo-1604200657090-ae45994b2451?w=800&h=1000&fit=crop&auto=format";

const products = [
  {
    id: 1,
    name: "Alphonso Mangoes",
    origin: "Ratnagiri, India",
    price: "₹240",
    unit: "per kg",
    tag: "Seasonal",
    rating: 4.9,
    reviews: 312,
    category: "Fruits",
    img: "https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=600&h=600&fit=crop&auto=format",
    color: "#f0c040",
    wishlisted: false,
  },
  {
    id: 2,
    name: "Heirloom Tomatoes",
    origin: "Tuscany, Italy",
    price: "₹180",
    unit: "per 500g",
    tag: "Organic",
    rating: 4.7,
    reviews: 218,
    category: "Vegetables",
    img: "https://images.unsplash.com/photo-1485637701894-09ad422f6de6?w=600&h=600&fit=crop&auto=format",
    color: "#e8631a",
    wishlisted: false,
  },
  {
    id: 3,
    name: "Puy Lentils",
    origin: "Le Puy, France",
    price: "₹320",
    unit: "per kg",
    tag: "Heritage",
    rating: 4.8,
    reviews: 145,
    category: "Legumes",
    img: "https://images.unsplash.com/photo-1612257416648-ee7a6c533b4f?w=600&h=600&fit=crop&auto=format",
    color: "#8aab8a",
    wishlisted: false,
  },
  {
    id: 4,
    name: "Blood Oranges",
    origin: "Sicily, Italy",
    price: "₹290",
    unit: "per 6 pcs",
    tag: "Limited",
    rating: 4.9,
    reviews: 97,
    category: "Fruits",
    img: "https://images.unsplash.com/photo-1608679627228-a8393e0f3fa5?w=600&h=600&fit=crop&auto=format",
    color: "#c84030",
    wishlisted: false,
  },
  {
    id: 5,
    name: "Borlotti Beans",
    origin: "Veneto, Italy",
    price: "₹260",
    unit: "per kg",
    tag: "Artisan",
    rating: 4.6,
    reviews: 83,
    category: "Legumes",
    img: "https://images.unsplash.com/photo-1728931339661-1ea66004a2e6?w=600&h=600&fit=crop&auto=format",
    color: "#d4846a",
    wishlisted: false,
  },
  {
    id: 6,
    name: "Medjool Dates",
    origin: "Jordan Valley",
    price: "₹480",
    unit: "per 250g",
    tag: "Premium",
    rating: 5.0,
    reviews: 201,
    category: "Fruits",
    img: "https://images.unsplash.com/photo-1550989460-0adf9ea622e2?w=600&h=600&fit=crop&auto=format",
    color: "#b87040",
    wishlisted: false,
  },
];

const categories = ["All", "Fruits", "Legumes", "Vegetables", "Seasonal"];

const features = [
  { icon: Truck, label: "Farm-Direct Delivery", sub: "Next-day to your door" },
  { icon: Leaf, label: "100% Organic", sub: "Certified & traceable" },
  { icon: Shield, label: "Quality Guarantee", sub: "Or your money back" },
  { icon: RefreshCw, label: "Zero Waste Packaging", sub: "Compostable materials" },
];

export default function HomePage() {
  const { isAuthenticated, isAdmin, logout } = useAuth();
  const { itemCount } = useCart();
  const [activeCategory, setActiveCategory] = useState("All");
  const [wishlist, setWishlist] = useState<number[]>([]);
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const filtered = activeCategory === "All"
    ? products
    : products.filter((p) => p.category === activeCategory);

  function toggleWishlist(id: number) {
    setWishlist((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  return (
    <div
      className="min-h-screen bg-background text-foreground overflow-x-hidden"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-4"
        style={{ background: "rgba(11,26,11,0.85)", backdropFilter: "blur(16px)", borderBottom: "1px solid rgba(242,236,224,0.08)" }}
      >
        <Link to="/" className="flex items-center gap-2">
          <Leaf className="text-accent" size={22} />
          <span className="text-xl font-semibold tracking-tight" style={{ fontFamily: "'Playfair Display', serif", color: "#f2ece0" }}>
            Verdura
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-1 px-4 py-2 rounded-full text-sm"
          style={{ background: "rgba(30,56,30,0.8)", border: "1px solid rgba(242,236,224,0.12)" }}
        >
          <Search size={15} className="text-muted-foreground" />
          <input
            type="text"
            placeholder="Search produce, legumes…"
            className="bg-transparent outline-none pl-2 w-56 text-foreground placeholder-muted-foreground text-sm"
          />
        </div>

        <div className="flex items-center gap-6">
          <Link to="/products" className="hidden md:block text-sm text-muted-foreground hover:text-foreground cursor-pointer transition-colors">Shop</Link>
          <Link to="/search" className="hidden md:block text-sm text-muted-foreground hover:text-foreground cursor-pointer transition-colors">Search</Link>
          <Link to="/orders" className="hidden md:block text-sm text-muted-foreground hover:text-foreground cursor-pointer transition-colors">Orders</Link>
          {isAdmin && (
            <Link to="/admin/products" className="hidden md:block text-sm text-muted-foreground hover:text-foreground cursor-pointer transition-colors">Admin</Link>
          )}
          <span className="hidden md:block text-sm text-muted-foreground hover:text-foreground cursor-pointer transition-colors">Origins</span>
          <span className="hidden md:block text-sm text-muted-foreground hover:text-foreground cursor-pointer transition-colors">Journal</span>
          {isAuthenticated ? (
            <button
              onClick={logout}
              className="hidden md:block text-sm text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
            >
              Logout
            </button>
          ) : (
            <Link to="/login" className="hidden md:block text-sm text-muted-foreground hover:text-foreground cursor-pointer transition-colors">
              Login
            </Link>
          )}
          <Link to="/cart" className="relative">
            <ShoppingBasket size={20} className="text-foreground" />
            {itemCount > 0 && (
              <span className="absolute -top-2 -right-2 w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-semibold"
                style={{ background: "#e8631a", color: "#fff" }}
              >
                {itemCount}
              </span>
            )}
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative w-full overflow-hidden" style={{ height: "92vh", minHeight: 560 }}>
        <img
          src={HERO_IMG}
          alt="Lush spread of fresh vegetables and fruits at a market"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(11,26,11,0.88) 0%, rgba(11,26,11,0.55) 55%, rgba(11,26,11,0.2) 100%)" }} />

        <div className="relative h-full flex flex-col justify-end pb-20 px-8 md:px-16 max-w-5xl">
          <div className="mb-4 inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium tracking-widest uppercase"
            style={{ background: "rgba(240,192,64,0.15)", border: "1px solid rgba(240,192,64,0.35)", color: "#f0c040" }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-accent inline-block animate-pulse" />
            Harvest Season Now Open
          </div>

          <h1 className="font-bold leading-[1.05] mb-5"
            style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(2.8rem, 6vw, 5.5rem)", color: "#f2ece0" }}
          >
            Nature's Finest,<br />
            <em style={{ color: "#f0c040" }}>Delivered Daily.</em>
          </h1>

          <p className="text-base md:text-lg mb-8 max-w-lg leading-relaxed" style={{ color: "rgba(242,236,224,0.72)" }}>
            Farm-direct fruits and heritage legumes, sourced from small growers and delivered to your kitchen the next morning.
          </p>

          <div className="flex flex-wrap gap-3">
            <Link
              to="/products"
              className="flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold transition-all hover:scale-105"
              style={{ background: "#e8631a", color: "#fff" }}
            >
              Shop the Harvest <ChevronRight size={16} />
            </Link>
            <button
              className="flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold border transition-all hover:bg-white/5"
              style={{ borderColor: "rgba(242,236,224,0.3)", color: "#f2ece0" }}
            >
              Our Story
            </button>
          </div>
        </div>

        {/* Stat strip */}
        <div className="absolute bottom-0 right-0 hidden lg:flex items-center gap-8 px-10 py-5 rounded-tl-2xl"
          style={{ background: "rgba(18,34,18,0.9)", backdropFilter: "blur(12px)" }}
        >
          {[["2,400+", "Varieties"], ["47", "Partner Farms"], ["4.9★", "Avg Rating"]].map(([val, label]) => (
            <div key={label} className="text-center">
              <div className="text-2xl font-bold" style={{ fontFamily: "'Playfair Display', serif", color: "#f0c040" }}>{val}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES BAR */}
      <section className="border-b border-border" style={{ background: "#122212" }}>
        <div className="max-w-6xl mx-auto px-6 py-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          {features.map(({ icon: Icon, label, sub }) => (
            <div key={label} className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: "rgba(232,99,26,0.15)" }}
              >
                <Icon size={17} style={{ color: "#e8631a" }} />
              </div>
              <div>
                <div className="text-sm font-medium text-foreground">{label}</div>
                <div className="text-xs text-muted-foreground">{sub}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* PRODUCTS */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <p className="text-xs tracking-widest uppercase text-muted-foreground mb-1">Curated Selection</p>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "2.2rem", color: "#f2ece0", lineHeight: 1.2 }}>
              Market Picks
            </h2>
          </div>

          {/* Category tabs */}
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className="px-4 py-1.5 rounded-full text-sm transition-all"
                style={{
                  background: activeCategory === cat ? "#e8631a" : "rgba(30,56,30,0.8)",
                  color: activeCategory === cat ? "#fff" : "#8aab8a",
                  border: `1px solid ${activeCategory === cat ? "#e8631a" : "rgba(242,236,224,0.1)"}`,
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((product) => (
            <div
              key={product.id}
              className="group rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1"
              style={{ background: "#122212", border: "1px solid rgba(242,236,224,0.08)" }}
            >
              <div className="relative overflow-hidden" style={{ height: 220, background: "#0d1a0d" }}>
                <img
                  src={product.img}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-108"
                  style={{ transform: "scale(1.01)" }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />

                {/* Tag */}
                <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wide"
                  style={{ background: product.color + "22", color: product.color, border: `1px solid ${product.color}44` }}
                >
                  {product.tag}
                </span>

                {/* Wishlist */}
                <button
                  className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110"
                  style={{ background: "rgba(11,26,11,0.7)", backdropFilter: "blur(6px)" }}
                  onClick={() => toggleWishlist(product.id)}
                >
                  <Heart
                    size={15}
                    style={{
                      color: wishlist.includes(product.id) ? "#e8631a" : "#f2ece0",
                      fill: wishlist.includes(product.id) ? "#e8631a" : "none",
                    }}
                  />
                </button>
              </div>

              <div className="p-4">
                <div className="flex items-start justify-between mb-1">
                  <div>
                    <h3 className="font-semibold text-foreground" style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.05rem" }}>
                      {product.name}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">{product.origin}</p>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-foreground" style={{ fontSize: "1.1rem" }}>{product.price}</span>
                    <p className="text-xs text-muted-foreground">{product.unit}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1 mb-4 mt-2">
                  <Star size={12} fill="#f0c040" color="#f0c040" />
                  <span className="text-xs font-medium text-foreground">{product.rating}</span>
                  <span className="text-xs text-muted-foreground">({product.reviews})</span>
                </div>

                <Link
                  to="/products"
                  className="block w-full py-2 rounded-xl text-sm font-semibold text-center transition-all hover:opacity-90 active:scale-95"
                  style={{ background: "rgba(232,99,26,0.15)", color: "#e8631a", border: "1px solid rgba(232,99,26,0.25)" }}
                >
                  View Products
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* EDITORIAL SPLIT BANNER */}
      <section className="max-w-6xl mx-auto px-6 pb-16">
        <div className="rounded-3xl overflow-hidden grid md:grid-cols-2" style={{ background: "#122212", border: "1px solid rgba(242,236,224,0.08)" }}>
          <div className="relative overflow-hidden" style={{ minHeight: 360, background: "#0d1a0d" }}>
            <img
              src={STAND_IMG}
              alt="A vibrant fruit stand at a local market"
              className="w-full h-full object-cover opacity-80"
            />
            <div className="absolute inset-0" style={{ background: "linear-gradient(to right, rgba(18,34,18,0.15), rgba(18,34,18,0.5))" }} />
          </div>

          <div className="flex flex-col justify-center p-10 md:p-12">
            <p className="text-xs tracking-widest uppercase text-muted-foreground mb-3">Our Philosophy</p>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "2rem", color: "#f2ece0", lineHeight: 1.25 }} className="mb-5">
              From Soil to<br />
              <em style={{ color: "#f0c040" }}>Your Table.</em>
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground mb-7">
              Every variety we carry is grown by farmers we know by name. We visit each partner farm twice a year, tasting the harvest and choosing only what earns a place in our crates. No middlemen. No cold-storage warehouses.
            </p>
            <div className="grid grid-cols-2 gap-4 mb-7">
              {[["47", "Partner Farms"], ["Zero", "Pesticides"], ["< 24h", "Farm to Door"], ["100%", "Traceable"]].map(([val, label]) => (
                <div key={label} className="p-3 rounded-xl" style={{ background: "rgba(30,56,30,0.6)", border: "1px solid rgba(242,236,224,0.07)" }}>
                  <div className="font-bold text-lg" style={{ fontFamily: "'Playfair Display', serif", color: "#f0c040" }}>{val}</div>
                  <div className="text-xs text-muted-foreground">{label}</div>
                </div>
              ))}
            </div>
            <button className="self-start flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all hover:scale-105"
              style={{ background: "#e8631a", color: "#fff" }}
            >
              Meet Our Farmers <ChevronRight size={15} />
            </button>
          </div>
        </div>
      </section>

      {/* NEWSLETTER */}
      <section className="border-t border-border" style={{ background: "#0d1a0d" }}>
        <div className="max-w-xl mx-auto px-6 py-16 text-center">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-5"
            style={{ background: "rgba(240,192,64,0.15)", border: "1px solid rgba(240,192,64,0.25)" }}
          >
            <Leaf size={22} style={{ color: "#f0c040" }} />
          </div>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.8rem", color: "#f2ece0" }} className="mb-2">
            The Harvest Letter
          </h2>
          <p className="text-sm text-muted-foreground mb-7 leading-relaxed">
            Weekly notes on what's in season, new arrivals from the farms, and recipes from our kitchen.
          </p>
          {subscribed ? (
            <div className="px-6 py-3 rounded-full text-sm font-medium" style={{ background: "rgba(138,171,138,0.15)", color: "#8aab8a", border: "1px solid rgba(138,171,138,0.25)" }}>
              You're on the list — welcome to the harvest.
            </div>
          ) : (
            <form
              className="flex gap-2"
              onSubmit={(e) => { e.preventDefault(); if (email) setSubscribed(true); }}
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="flex-1 px-4 py-3 rounded-full text-sm outline-none text-foreground placeholder-muted-foreground"
                style={{ background: "#1e381e", border: "1px solid rgba(242,236,224,0.12)" }}
              />
              <button
                type="submit"
                className="px-5 py-3 rounded-full text-sm font-semibold transition-all hover:scale-105"
                style={{ background: "#e8631a", color: "#fff" }}
              >
                Subscribe
              </button>
            </form>
          )}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-border px-8 py-6 flex flex-col md:flex-row items-center justify-between gap-3"
        style={{ background: "#0b1a0b" }}
      >
        <div className="flex items-center gap-2">
          <Leaf size={16} className="text-accent" />
          <span style={{ fontFamily: "'Playfair Display', serif", color: "#8aab8a", fontSize: "0.9rem" }}>Verdura</span>
        </div>
        <p className="text-xs text-muted-foreground">© 2026 Verdura. All harvests reserved.</p>
        <div className="flex gap-5 text-xs text-muted-foreground">
          {["Privacy", "Terms", "Contact"].map((item) => (
            <span key={item} className="hover:text-foreground cursor-pointer transition-colors">{item}</span>
          ))}
        </div>
      </footer>
    </div>
  );
}
