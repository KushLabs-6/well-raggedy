import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import SkateGame from './SkateGame';
import { db } from './firebase';
import { collection, addDoc, onSnapshot, query, orderBy, deleteDoc, doc } from 'firebase/firestore';

// 8 Merch Products (T-Shirts focused)
const productsData = [
  { id: 'raggedy-tee-1', name: 'Kingston Punk Core Tee', priceJMD: 'J$4,500.00', priceUSD: '$30.00 USD', category: 'Apparel', badge: '100% COTTON', badgeType: 'badge-acid', image: '/Merch/IMG_3085.PNG', description: 'Heavyweight vintage washed t-shirt.' },
  { id: 'raggedy-tee-2', name: 'Trenchtown Thrash Tee', priceJMD: 'J$4,500.00', priceUSD: '$30.00 USD', category: 'Apparel', badge: 'LAST 5 LEFT', badgeType: 'badge-pink', image: '/Merch/IMG_3086.PNG', description: 'Widened fit optimized for transition skating.' },
  { id: 'raggedy-tee-3', name: 'Rude Boy Custom Tee', priceJMD: 'J$4,500.00', priceUSD: '$30.00 USD', category: 'Apparel', badge: 'NEW', badgeType: 'badge-acid', image: '/Merch/IMG_3087.PNG', description: 'Silicon print graphic on chest.' },
  { id: 'raggedy-tee-4', name: 'Speedwheels Logo Tee', priceJMD: 'J$4,500.00', priceUSD: '$30.00 USD', category: 'Apparel', badge: 'RESTOCKED', badgeType: 'badge-pink', image: '/Merch/IMG_3088.PNG', description: 'High-performance moisture wicking.' },
  { id: 'raggedy-tee-5', name: 'Downtown Grind Tee', priceJMD: 'J$4,500.00', priceUSD: '$30.00 USD', category: 'Apparel', badge: 'EXCLUSIVE', badgeType: 'badge-acid', image: '/Merch/IMG_3089.PNG', description: 'Heavyweight vintage washed t-shirt with screen-printed distressed logo.' },
  { id: 'raggedy-tee-6', name: 'Raggedy Street Tee', priceJMD: 'J$4,500.00', priceUSD: '$30.00 USD', category: 'Apparel', badge: 'PREMIUM', badgeType: 'badge-pink', image: '/Merch/IMG_3090.PNG', description: 'Premium cotton blend.' },
  { id: 'raggedy-tee-7', name: 'Skate Beanie / Cap Combo', priceJMD: 'J$2,500.00', priceUSD: '$16.00 USD', category: 'Apparel', badge: 'ONE SIZE', badgeType: 'badge-acid', image: '/Merch/IMG_3091.PNG', description: 'Comfortable headwear for skate sessions.' },
  { id: 'raggedy-tee-8', name: 'Trenchtown Shred Tee', priceJMD: 'J$4,500.00', priceUSD: '$30.00 USD', category: 'Apparel', badge: 'LIMITED', badgeType: 'badge-pink', image: '/Merch/IMG_3092.PNG', description: 'High-performance tee with custom print.' }
];

// Skate and Tour video pool
const mediaPool = [
  { type: 'skate', src: '/Clips/clip 2.mp4' },
  { type: 'skate', src: '/Clips/clip 3.mp4' },
  { type: 'tour', src: '/Tour/1dac3bc3-11dc-43be-9956-8f1cb643aa25.mp4' },
  { type: 'tour', src: '/Tour/303f2b6c-419a-4e95-8703-77f110ee3a15.mp4' },
  { type: 'tour', src: '/Tour/741de489-96d9-4071-87a5-a9a3f81d637b.mp4' }
];

const tourImages = [
  '/Tour/04b7b34b-8107-4209-bfdc-32abc9a9fefa.jpg',
  '/Tour/07d30bbd-3542-42fb-b1d4-b3869a0e85cf.jpg',
  '/Tour/1a8b59dd-9657-4758-be9f-9a2dcb84ce6a.jpg',
  '/Tour/1c98634a-796b-43ec-84c1-6a5ed6ade7a1.jpg'
];

function App() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  
  // Media rotation
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [currentTourIndex, setCurrentTourIndex] = useState(0);

  // Firestore Data
  const [tags, setTags] = useState([]);
  const [feedPosts, setFeedPosts] = useState([]);

  // Form states
  const [newTag, setNewTag] = useState('');
  const [newTagColor, setNewTagColor] = useState('#BAFF1A');
  const [feedText, setFeedText] = useState('');
  const [feedImgUrl, setFeedImgUrl] = useState('');

  // Audio Refs
  const bgMusic = useRef(null);
  const hasPlayedIntro = useRef(false);

  useEffect(() => {
    // Setup entering sound
    bgMusic.current = new Audio('/sounds/sound entering website/AUD-20260727-WA0002.opus');
    bgMusic.current.loop = false;

    // Load Firebase Data
    try {
      const qTags = query(collection(db, 'graffiti_wall'), orderBy('timestamp', 'asc'));
      const unsubTags = onSnapshot(qTags, (snapshot) => {
        setTags(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      });

      const qFeed = query(collection(db, 'raggedy_feed'), orderBy('timestamp', 'desc'));
      const unsubFeed = onSnapshot(qFeed, (snapshot) => {
        setFeedPosts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      });

      return () => { unsubTags(); unsubFeed(); };
    } catch(e) {
      console.warn("Firebase not properly configured yet.", e);
    }
  }, []);

  // Background Media Rotator
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMediaIndex((prev) => (prev + 1) % mediaPool.length);
    }, 15000); // rotate every 15s
    return () => clearInterval(interval);
  }, []);

  // Tour Section Rotator
  useEffect(() => {
    const tourInterval = setInterval(() => {
      setCurrentTourIndex((prev) => (prev + 1) % tourImages.length);
    }, 5000);
    return () => clearInterval(tourInterval);
  }, []);

  const handleAddTag = async (e) => {
    e.preventDefault();
    if (!newTag.trim()) return;

    const randomX = Math.floor(Math.random() * 80) + 5; 
    const randomY = Math.floor(Math.random() * 70) + 10; 
    const randomRotate = Math.floor(Math.random() * 20) - 10;

    try {
      await addDoc(collection(db, 'graffiti_wall'), {
        name: newTag.trim(),
        color: newTagColor,
        x: randomX,
        y: randomY,
        rotate: randomRotate,
        timestamp: new Date()
      });
      setNewTag('');
    } catch(e) {
      console.error("Error adding tag:", e);
      // Fallback if Firebase fails
      setTags([...tags, { id: Date.now().toString(), name: newTag.trim(), color: newTagColor, x: randomX, y: randomY, rotate: randomRotate }]);
    }
  };

  const handlePostFeed = async (e) => {
    e.preventDefault();
    if (!feedText.trim() && !feedImgUrl.trim()) return;
    try {
      await addDoc(collection(db, 'raggedy_feed'), {
        text: feedText,
        imageUrl: feedImgUrl,
        timestamp: new Date()
      });
      setFeedText('');
      setFeedImgUrl('');
    } catch(e) {
      console.error("Error posting to feed:", e);
    }
  };

  const deleteTag = async (id) => {
    try {
      await deleteDoc(doc(db, 'graffiti_wall', id));
    } catch(e) {
      console.error("Error deleting tag:", e);
      setTags(tags.filter(t => t.id !== id));
    }
  };

  const deletePost = async (id) => {
    try {
      await deleteDoc(doc(db, 'raggedy_feed', id));
    } catch(e) {
      console.error("Error deleting post:", e);
      setFeedPosts(feedPosts.filter(p => p.id !== id));
    }
  };

  const playSiteMusic = () => {
    if (bgMusic.current && bgMusic.current.paused && !hasPlayedIntro.current) {
      hasPlayedIntro.current = true;
      bgMusic.current.play().catch(e => {
        console.error("Audio blocked:", e);
        hasPlayedIntro.current = false;
      });
    }
  };

  // Cart operations
  const addToCart = (product) => {
    const existing = cart.find(item => item.product.id === product.id);
    if (existing) {
      setCart(cart.map(item => item.product.id === product.id ? { ...item, qty: item.qty + 1 } : item));
    } else {
      setCart([...cart, { product, qty: 1 }]);
    }
    setCartOpen(true);
  };

  const totalUSD = cart.reduce((acc, item) => acc + (parseFloat(item.product.priceUSD.replace(/[^0-9.]/g, '')) * item.qty), 0);
  const totalJMD = cart.reduce((acc, item) => acc + (parseFloat(item.product.priceJMD.replace(/[^0-9.]/g, '')) * item.qty), 0);

  const handleCheckout = () => {
    const text = `*NEW WELL RAGGEDY BOOKING / MERCH ORDER*%0A%0A` + 
      cart.map(item => `- *${item.product.name}* x${item.qty} -- ${item.product.priceJMD}`).join('%0A') +
      `%0A%0A*Total USD:* $${totalUSD.toFixed(2)} USD%0A*Total JMD:* J$${totalJMD.toLocaleString()}.00%0A%0A_Please confirm!_`;
    
    window.open(`https://wa.me/18768659312?text=${text}`, '_blank');
  };

  const handleTourBooking = () => {
    const text = `*NEW TOUR BOOKING INQUIRY*%0A%0AHi FroggBoss, I am interested in booking a Well Raggedy Skate Tour across Jamaica!`;
    window.open(`https://wa.me/18768659312?text=${text}`, '_blank');
  };

  const triggerSecretAdmin = () => {
    const pwd = prompt("Enter Secret Admin Password:");
    if (pwd === 'raggedy2026') {
      setIsAdmin(true);
      alert("Admin Mode Unlocked");
    }
  };

  return (
    <div onClick={playSiteMusic}>
      <div className="crt-overlay"></div>
      
      {/* Dynamic Background Rotator */}
      <div className="video-bg-container">
        <video 
          key={mediaPool[currentMediaIndex].src} 
          className="video-bg" 
          autoPlay 
          loop 
          muted 
        >
          <source src={mediaPool[currentMediaIndex].src} type="video/mp4" />
        </video>
        <div className="video-tint"></div>
      </div>

      {/* Main Header / Navigation */}
      <header style={{ padding: '2rem', borderBottom: '1px solid var(--border-grunge)', background: 'rgba(7,7,9,0.9)', backdropFilter: 'blur(10px)', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '1200px', margin: '0 auto', flexWrap: 'wrap', gap: '1rem' }}>
          
          <div className="logo-container" onClick={triggerSecretAdmin}>
            <img 
              src="/Logo/logo.jpg" 
              onError={(e) => { e.target.onerror = null; e.target.src = "/Logo/2660D49E-D11B-40B4-90C9-1330D611EDD0.jpg" }}
              className="logo-main" 
              alt="Well Raggedy Logo" 
            />
          </div>

          <nav style={{ display: 'flex', gap: '2rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <a href="#tours" style={{ color: 'white', textDecoration: 'none', fontWeight: 900 }}>TOURS</a>
            <a href="#merch" style={{ color: 'white', textDecoration: 'none', fontWeight: 900 }}>MERCH</a>
            <a href="#feed" style={{ color: 'white', textDecoration: 'none', fontWeight: 900 }}>FEED</a>
            <a href="#wall" style={{ color: 'white', textDecoration: 'none', fontWeight: 900 }}>GRAFFITI WALL</a>
            <a href="#game" style={{ color: 'white', textDecoration: 'none', fontWeight: 900 }}>SKATE GAME</a>
          </nav>

          <button 
            onClick={() => setCartOpen(true)} 
            className="btn-punk" 
            style={{ background: 'var(--primary-pink)', color: 'white', padding: '0.6rem 1.2rem' }}
          >
            🛒 CART ({cart.reduce((a,b) => a+b.qty, 0)})
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container" style={{ minHeight: '90vh', display: 'flex', alignItems: 'center' }}>
        <div style={{ maxWidth: '750px', textAlign: 'left' }}>
          <div style={{ display: 'inline-block', background: 'var(--primary-pink)', color: 'white', padding: '0.4rem 1rem', fontFamily: 'var(--font-punk)', transform: 'rotate(-3deg)', marginBottom: '1.5rem', border: '2px solid white' }}>
            SKATE CULTURE & JAMAICA TOURS
          </div>
          <h1 style={{ fontSize: 'clamp(3.5rem, 10vw, 6.5rem)', textTransform: 'uppercase', lineHeight: 0.9, marginBottom: '2rem' }} className="glitch-text">
            WELL RAGGEDY
          </h1>
          <p style={{ fontSize: '1.3rem', color: 'var(--text-gray)', lineHeight: 1.6, marginBottom: '3rem', maxWidth: '650px' }}>
            Tour Jamaica like a local. Skate the streets, explore the island, and wear the official uniform. Hosted by FroggBoss Well Raggedy.
          </p>
          <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
            <button onClick={handleTourBooking} className="btn-punk">BOOK A TOUR VIA WHATSAPP</button>
            <a href="https://www.instagram.com/froggboss/" target="_blank" rel="noreferrer" className="btn-punk" style={{ background: '#000', color: 'var(--primary-acid)' }}>
              @FROGGBOSS IG
            </a>
          </div>
        </div>
      </section>

      {/* Tours Section */}
      <section id="tours" className="container" style={{ background: '#0D0D11', borderTop: '4px solid var(--border-grunge)', borderBottom: '4px solid var(--border-grunge)', padding: '6rem 2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <span className="spray-paint" style={{ fontSize: '1.5rem' }}>ISLAND WIDE</span>
          <h2 style={{ fontSize: 'clamp(2.5rem, 8vw, 4.5rem)', textTransform: 'uppercase', fontFamily: 'var(--font-punk)', marginTop: '0.5rem' }}>SKATE TOURS</h2>
          <p style={{ color: 'var(--text-gray)', maxWidth: '600px', margin: '0 auto', fontSize: '1.1rem' }}>
            Hit the streets and explore Jamaica with FroggBoss. Check out our latest tour highlights.
          </p>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap' }}>
          <div style={{ width: '100%', maxWidth: '600px', borderRadius: '12px', overflow: 'hidden', border: '4px solid var(--primary-acid)' }}>
            <img src={tourImages[currentTourIndex]} alt="Tour Highlight" style={{ width: '100%', height: '400px', objectFit: 'cover' }} />
          </div>
          <div style={{ width: '100%', maxWidth: '600px', borderRadius: '12px', overflow: 'hidden', border: '4px solid var(--primary-pink)' }}>
            <video src={mediaPool.find(m => m.type === 'tour').src} autoPlay loop muted style={{ width: '100%', height: '400px', objectFit: 'cover' }} />
          </div>
        </div>
        <div style={{ textAlign: 'center', marginTop: '3rem' }}>
          <button onClick={handleTourBooking} className="btn-punk">REQUEST A CUSTOM TOUR</button>
        </div>
      </section>

      {/* Merch Section */}
      <section id="merch" className="container" style={{ padding: '6rem 2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
          <span className="spray-paint-pink" style={{ fontSize: '1.5rem' }}>OFFICIAL APPAREL</span>
          <h2 style={{ fontSize: 'clamp(2.5rem, 8vw, 4.5rem)', textTransform: 'uppercase', fontFamily: 'var(--font-punk)', marginTop: '0.5rem' }}>MERCH SHOP</h2>
        </div>
        <div className="merch-grid">
          {productsData.map((prod) => (
            <div key={prod.id} className="merch-card">
              <div className="merch-img-container">
                <span className={`merch-badge ${prod.badgeType === 'badge-pink' ? 'badge-limited' : 'badge-acid'}`}>{prod.badge}</span>
                <img src={prod.image} alt={prod.name} className="merch-img" />
              </div>
              <div className="merch-info">
                <h3 style={{ fontSize: '1.4rem', fontWeight: 900, marginBottom: '0.8rem', color: 'white' }}>{prod.name}</h3>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                  <span style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--primary-acid)' }}>{prod.priceJMD}</span>
                  <button onClick={() => addToCart(prod)} className="btn-punk" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}>+ ADD</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Well Raggedy Feed */}
      <section id="feed" className="container" style={{ background: '#0D0D11', borderTop: '4px solid var(--border-grunge)', borderBottom: '4px solid var(--border-grunge)', padding: '6rem 2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <span className="spray-paint" style={{ fontSize: '1.5rem' }}>COMMUNITY</span>
          <h2 style={{ fontSize: 'clamp(2.5rem, 8vw, 4.5rem)', textTransform: 'uppercase', fontFamily: 'var(--font-punk)', marginTop: '0.5rem' }}>WELL RAGGEDY FEED</h2>
        </div>
        
        {isAdmin && (
          <div style={{ maxWidth: '600px', margin: '0 auto 4rem', padding: '2rem', background: '#1a1a24', borderRadius: '12px', border: '2px solid var(--primary-acid)' }}>
            <h3 style={{ color: 'var(--primary-acid)', marginBottom: '1rem' }}>Admin: Post to Feed</h3>
            <form onSubmit={handlePostFeed} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <input type="text" placeholder="Image URL (optional)" value={feedImgUrl} onChange={e => setFeedImgUrl(e.target.value)} style={{ padding: '0.8rem', background: '#000', color: 'white', border: '1px solid var(--border-grunge)' }} />
              <textarea placeholder="Write a post..." value={feedText} onChange={e => setFeedText(e.target.value)} rows={3} style={{ padding: '0.8rem', background: '#000', color: 'white', border: '1px solid var(--border-grunge)' }} />
              <button type="submit" className="btn-punk" style={{ alignSelf: 'flex-start' }}>POST</button>
            </form>
          </div>
        )}

        <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {feedPosts.length === 0 ? <p style={{ textAlign: 'center', color: 'var(--text-gray)' }}>No posts yet. Check back soon!</p> : null}
          {feedPosts.map(post => (
            <div key={post.id} style={{ background: '#111116', padding: '2rem', borderRadius: '12px', border: '1px solid var(--border-grunge)' }}>
              {isAdmin && <button onClick={() => deletePost(post.id)} style={{ float: 'right', background: 'red', color: 'white', border: 'none', padding: '0.5rem', cursor: 'pointer' }}>Delete</button>}
              {post.imageUrl && <img src={post.imageUrl} alt="Feed Post" style={{ width: '100%', maxHeight: '400px', objectFit: 'cover', borderRadius: '8px', marginBottom: '1rem' }} />}
              <p style={{ fontSize: '1.2rem', lineHeight: 1.6 }}>{post.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Guestbook Graffiti Wall */}
      <section id="wall" className="container" style={{ padding: '6rem 2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
          <span className="spray-paint-pink" style={{ fontSize: '1.5rem' }}>MARK THE STREET</span>
          <h2 style={{ fontSize: 'clamp(2.5rem, 8vw, 4.5rem)', textTransform: 'uppercase', fontFamily: 'var(--font-punk)', marginTop: '0.5rem' }}>GRAFFITI SIGN BOARD</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '4rem', alignItems: 'center' }}>
          <div className="guestbook-wall">
            {tags.map((tag) => (
              <span 
                key={tag.id} 
                className="graffiti-tag" 
                onClick={() => isAdmin && deleteTag(tag.id)}
                style={{ 
                  color: tag.color, 
                  position: 'absolute', 
                  left: `${tag.x}%`, 
                  top: `${tag.y}%`, 
                  transform: `rotate(${tag.rotate}deg)`,
                  textShadow: `0 0 10px ${tag.color}80`,
                  cursor: isAdmin ? 'pointer' : 'default'
                }}
              >
                {tag.name}
              </span>
            ))}
          </div>
          <div style={{ background: '#111116', padding: '2.5rem', borderRadius: '20px', border: '2px solid var(--border-grunge)' }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: '2rem' }}>SPRAY YOUR TAG</h3>
            <form onSubmit={handleAddTag} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <input type="text" maxLength={18} required value={newTag} onChange={e => setNewTag(e.target.value)} placeholder="e.g. DREADLOCKS" style={{ background: '#000', border: '1px solid var(--border-grunge)', padding: '1rem', borderRadius: '8px', color: 'white', fontSize: '1rem' }} />
              <div style={{ display: 'flex', gap: '1rem' }}>
                {['#BAFF1A', '#FF0055', '#00E6FF', '#FFFFFF'].map((color) => (
                  <button key={color} type="button" onClick={() => setNewTagColor(color)} style={{ width: '35px', height: '35px', borderRadius: '50%', background: color, border: newTagColor === color ? '4px solid white' : 'none', cursor: 'pointer' }} />
                ))}
              </div>
              <button type="submit" className="btn-punk">💨 SPRAY THE WALL</button>
            </form>
          </div>
        </div>
      </section>

      {/* Skate Game Section */}
      <section id="game" className="container" style={{ background: '#0D0D11', borderTop: '4px solid var(--border-grunge)', padding: '6rem 2rem', textAlign: 'center' }}>
        <h2 style={{ fontSize: 'clamp(2.5rem, 8vw, 4.5rem)', textTransform: 'uppercase', fontFamily: 'var(--font-punk)', marginBottom: '2rem' }}>SKATE PARK GAME</h2>
        <SkateGame />
      </section>

      {/* Footer */}
      <footer style={{ padding: '4rem 0', background: '#000', borderTop: '4px solid var(--border-grunge)', textAlign: 'center' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem' }}>
          <h2 style={{ fontFamily: 'var(--font-punk)', fontSize: '2.5rem', color: 'var(--primary-acid)', marginBottom: '1.5rem' }}>WELL RAGGEDY</h2>
          <p style={{ color: 'var(--text-gray)', fontSize: '0.95rem', maxWidth: '500px', margin: '0 auto 1.5rem' }}>
            Built for raw skaters and island explorers. Follow <a href="https://www.instagram.com/froggboss/" style={{color:'var(--primary-pink)'}}>@FroggBoss</a>.
          </p>
          <div style={{ color: 'white', fontSize: '1rem', marginBottom: '2rem' }}>
            website designed <a href="https://www.instagram.com/thekingfromkingston/" target="_blank" rel="noreferrer" style={{color: 'var(--primary-acid)', textDecoration: 'none', fontWeight: 'bold'}}>@TheKingFromKingston</a>
          </div>
          <div style={{ color: 'var(--text-gray)', fontSize: '0.8rem' }}>
            © 2026 Well Raggedy Skate Co. Kingston, Jamaica. All Rights Reserved.
          </div>
        </div>
      </footer>

      {/* Shopping Cart Slide-out Panel */}
      <div className={`cart-panel ${cartOpen ? 'open' : ''}`}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem', borderBottom: '2px solid var(--border-grunge)', paddingBottom: '1.5rem' }}>
          <h3 style={{ fontFamily: 'var(--font-punk)', fontSize: '1.8rem', color: 'var(--primary-acid)' }}>CART</h3>
          <button onClick={() => setCartOpen(false)} style={{ background: 'none', border: 'none', color: 'white', fontSize: '1.5rem', cursor: 'pointer' }}>❌</button>
        </div>
        <div style={{ flexGrow: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {cart.length === 0 ? (
            <p style={{ textAlign: 'center', color: 'var(--text-gray)', marginTop: '2rem' }}>Cart is empty.</p>
          ) : (
            cart.map((item, idx) => (
              <div key={idx} style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <img src={item.product.image} alt={item.product.name} style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '8px' }} />
                <div style={{ flexGrow: 1 }}>
                  <div style={{ fontWeight: 'bold' }}>{item.product.name}</div>
                  <div style={{ color: 'var(--primary-acid)' }}>{item.product.priceJMD} (x{item.qty})</div>
                </div>
              </div>
            ))
          )}
        </div>
        {cart.length > 0 && (
          <div style={{ marginTop: 'auto', paddingTop: '2rem', borderTop: '2px solid var(--border-grunge)' }}>
            <button onClick={handleCheckout} className="btn-punk" style={{ width: '100%' }}>📱 WHATSAPP CHECKOUT</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
