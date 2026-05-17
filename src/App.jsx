import React, { useState, useEffect, useRef } from 'react';
import './App.css';

// 8 Actual Merch Products Mapped to PNG assets
const productsData = [
  {
    id: 'raggedy-deck-rebel',
    name: 'Kingston Rebel Deck (8.25")',
    priceJMD: 'J$12,500.00',
    priceUSD: '$80.00 USD',
    category: 'Decks',
    badge: 'COLLECTORS PIECE',
    badgeType: 'badge-pink',
    image: '/Merch/IMG_3085.PNG',
    description: 'Ultra-tough 7-ply Canadian maple with custom distressed Kingston street-punk artwork. Perfect pop and extreme durability.'
  },
  {
    id: 'raggedy-deck-thrash',
    name: 'Trenchtown Thrash Deck (8.5")',
    priceJMD: 'J$12,500.00',
    priceUSD: '$80.00 USD',
    category: 'Decks',
    badge: 'LAST 5 LEFT',
    badgeType: 'badge-acid',
    image: '/Merch/IMG_3086.PNG',
    description: 'Widened deck optimized for transition skating and high-impact street drops. Features raw graffiti tags from local crews.'
  },
  {
    id: 'raggedy-griptape',
    name: 'Rude Boy Custom Griptape',
    priceJMD: 'J$3,200.00',
    priceUSD: '$20.00 USD',
    category: 'Accessories',
    badge: 'PRE-CUT',
    badgeType: 'badge-acid',
    image: '/Merch/IMG_3087.PNG',
    description: 'Silicon carbide formula providing the ultimate locked-in skate grip. Water-resistant back sheet with stylized Raggedy stencil graphics.'
  },
  {
    id: 'raggedy-wheels',
    name: 'Well Raggedy Speedwheels (54mm)',
    priceJMD: 'J$6,500.00',
    priceUSD: '$42.00 USD',
    category: 'Accessories',
    badge: '99A DUROMETER',
    badgeType: 'badge-pink',
    image: '/Merch/IMG_3088.PNG',
    description: 'High-performance urethane wheels formulated for the rough streets of Downtown Kingston. Anti-flatspot technology.'
  },
  {
    id: 'raggedy-tee-punk',
    name: 'Kingston Punk Core Tee',
    priceJMD: 'J$4,500.00',
    priceUSD: '$30.00 USD',
    category: 'Apparel',
    badge: '100% ORGANIC COTTON',
    badgeType: 'badge-acid',
    image: '/Merch/IMG_3089.PNG',
    description: 'Heavyweight vintage washed t-shirt with screen-printed distressed Well Raggedy skull-skate logo on back.'
  },
  {
    id: 'raggedy-hoodie-zipper',
    name: 'Raggedy Street Zipper Hoodie',
    priceJMD: 'J$9,500.00',
    priceUSD: '$60.00 USD',
    category: 'Apparel',
    badge: 'HEAVYWEIGHT 450GSM',
    badgeType: 'badge-pink',
    image: '/Merch/IMG_3090.PNG',
    description: 'Premium fleece lined zip-up hoodie featuring spray-painted stencil graphic effects and heavy metal zippers.'
  },
  {
    id: 'raggedy-beanie',
    name: 'Downtown Grind Skate Beanie',
    priceJMD: 'J$2,500.00',
    priceUSD: '$16.00 USD',
    category: 'Apparel',
    badge: 'ONE SIZE',
    badgeType: 'badge-acid',
    image: '/Merch/IMG_3091.PNG',
    description: 'Comfortable rib-knit beanie with a custom hand-sewn woven label. Designed to stay secure during technical skate sessions.'
  },
  {
    id: 'raggedy-socks',
    name: 'Trenchtown Shred Socks (3-Pack)',
    priceJMD: 'J$2,000.00',
    priceUSD: '$13.00 USD',
    category: 'Apparel',
    badge: 'CUSHIONED SOLE',
    badgeType: 'badge-pink',
    image: '/Merch/IMG_3092.PNG',
    description: 'High-performance crew socks with added arch support, mesh venting, and signature toxic-green jacquard skate patterns.'
  }
];

// Skate tricks for the Dice Generator
const skateTricks = [
  "Kickflip down a Trenchtown 4-stair",
  "360 Shuvit off a concrete curb",
  "Frontside 180 over a Kingston speedbump",
  "Heelflip onto a wooden palette",
  "Boardgrind along a rusty street rail",
  "Pop Shuvit through a toxic puddle",
  "Hardflip over a Raggedy trashcan",
  "Treflip down the harbor gap",
  "Nosegrind along a concrete planterbox"
];

function App() {
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [selectedClip, setSelectedClip] = useState('/Clips/clip 2.mp4');
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [quickviewProduct, setQuickviewProduct] = useState(null);
  
  // Skate trick generator state
  const [diceResult, setDiceResult] = useState('');
  const [isRolling, setIsRolling] = useState(false);

  // Guestbook graffiti tags state
  const [tags, setTags] = useState([
    { name: 'Dreadskate', color: '#BAFF1A', x: 10, y: 15, rotate: -3 },
    { name: 'RudeBoy99', color: '#FF0055', x: 45, y: 35, rotate: 5 },
    { name: 'KingstonShredder', color: '#00E6FF', x: 25, y: 65, rotate: -8 },
    { name: 'TrenchtownPunk', color: '#FFFFFF', x: 70, y: 20, rotate: 2 },
    { name: 'RaggedyCrew', color: '#BAFF1A', x: 60, y: 70, rotate: 4 }
  ]);
  const [newTag, setNewTag] = useState('');
  const [newTagColor, setNewTagColor] = useState('#BAFF1A');

  // Web Audio Synth setup
  const audioCtxRef = useRef(null);
  const [synthPlaying, setSynthPlaying] = useState(false);
  const [synthBeat, setSynthBeat] = useState(null);

  // Initialize Web Audio API safely
  const triggerSynthTone = (frequency, duration = 0.2, type = 'sine') => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      
      const ctx = audioCtxRef.current;
      
      // Safety resume in case browser blocked autoplay
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(frequency, ctx.currentTime);

      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      // Exponential release
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      console.warn("Web Audio Context not loaded yet: ", e);
    }
  };

  // Autoplay reggae-punk synth loop logic
  const toggleSynthBeat = () => {
    if (synthPlaying) {
      clearInterval(synthBeat);
      setSynthPlaying(false);
      setSynthBeat(null);
    } else {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
      }
      
      let step = 0;
      const interval = setInterval(() => {
        // Reggae Ska Offbeat Chord on steps 1, 3, 5, 7
        // Punk heavy bass note on steps 0, 2, 4, 6
        if (step % 2 === 0) {
          // Deep punchy bassline (Triangular wave)
          const bassFreqs = [73.42, 73.42, 82.41, 98.00]; // D2, D2, E2, G2
          const freq = bassFreqs[Math.floor(step / 2) % bassFreqs.length];
          triggerSynthTone(freq, 0.25, 'triangle');
        } else {
          // Offbeat chord sound (Sawtooth/Sine combination)
          triggerSynthTone(329.63, 0.1, 'sine'); // E4 chord sound
          triggerSynthTone(392.00, 0.1, 'sine'); // G4
        }
        step = (step + 1) % 8;
      }, 250); // 120 BPM (250ms per 8th note)
      
      setSynthBeat(interval);
      setSynthPlaying(true);
    }
  };

  useEffect(() => {
    return () => {
      if (synthBeat) clearInterval(synthBeat);
    };
  }, [synthBeat]);

  const handleRollDice = () => {
    setIsRolling(true);
    triggerSynthTone(150, 0.1, 'sawtooth');
    setTimeout(() => {
      triggerSynthTone(300, 0.15, 'sawtooth');
    }, 100);
    setTimeout(() => {
      triggerSynthTone(450, 0.2, 'sine');
      const randomTrick = skateTricks[Math.floor(Math.random() * skateTricks.length)];
      setDiceResult(randomTrick);
      setIsRolling(false);
    }, 600);
  };

  const handleAddTag = (e) => {
    e.preventDefault();
    if (!newTag.trim()) return;

    // Generate random graffiti positioning
    const randomX = Math.floor(Math.random() * 80) + 5; // 5% to 85%
    const randomY = Math.floor(Math.random() * 70) + 10; // 10% to 80%
    const randomRotate = Math.floor(Math.random() * 20) - 10; // -10deg to 10deg

    setTags([...tags, {
      name: newTag.trim(),
      color: newTagColor,
      x: randomX,
      y: randomY,
      rotate: randomRotate
    }]);
    
    // Play spray sound effect with synth noise
    triggerSynthTone(800, 0.4, 'triangle');

    setNewTag('');
  };

  // Cart operations
  const addToCart = (product, size = 'M') => {
    // Synth tap sound
    triggerSynthTone(600, 0.08, 'sine');
    
    const existing = cart.find(item => item.product.id === product.id && item.size === size);
    if (existing) {
      setCart(cart.map(item => 
        (item.product.id === product.id && item.size === size)
          ? { ...item, qty: item.qty + 1 }
          : item
      ));
    } else {
      setCart([...cart, { product, size, qty: 1 }]);
    }
    setCartOpen(true);
  };

  const removeFromCart = (productId, size) => {
    triggerSynthTone(200, 0.08, 'sine');
    setCart(cart.filter(item => !(item.product.id === productId && item.size === size)));
  };

  const updateQty = (productId, size, change) => {
    triggerSynthTone(400, 0.05, 'sine');
    setCart(cart.map(item => {
      if (item.product.id === productId && item.size === size) {
        const newQty = item.qty + change;
        return { ...item, qty: newQty < 1 ? 1 : newQty };
      }
      return item;
    }));
  };

  // Calculate totals
  const totalUSD = cart.reduce((acc, item) => acc + (parseFloat(item.product.priceUSD.replace(/[^0-9.]/g, '')) * item.qty), 0);
  const totalJMD = cart.reduce((acc, item) => acc + (parseFloat(item.product.priceJMD.replace(/[^0-9.]/g, '')) * item.qty), 0);

  const handleCheckout = () => {
    const text = `*NEW WELL RAGGEDY MERCH ORDER*%0A%0A` + 
      cart.map(item => `- *${item.product.name}* (Size: ${item.size}) x${item.qty} -- ${item.product.priceJMD}`).join('%0A') +
      `%0A%0A*Total USD:* $${totalUSD.toFixed(2)} USD%0A*Total JMD:* J$${totalJMD.toLocaleString()}.00%0A%0A_Please confirm stock and bank coordinates!_`;
    
    window.open(`https://wa.me/18762356884?text=${text}`, '_blank');
  };

  return (
    <>
      <div className="crt-overlay"></div>
      
      {/* Dynamic Background Skate Video */}
      <div className="video-bg-container">
        <video 
          key={selectedClip} 
          className="video-bg" 
          autoPlay 
          loop 
          muted={isMuted} 
          style={{ display: isPlaying ? 'block' : 'none' }}
        >
          <source src={selectedClip} type="video/mp4" />
        </video>
        <div className="video-tint"></div>
      </div>

      {/* Main Header / Navigation */}
      <header style={{ padding: '2rem', borderBottom: '1px solid var(--border-grunge)', background: 'rgba(7,7,9,0.9)', backdropFilter: 'blur(10px)', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '1200px', margin: '0 auto' }}>
          
          {/* Animated Wheel Logo */}
          <div className="logo-container" onClick={() => triggerSynthTone(1000, 0.3, 'sawtooth')}>
            <img 
              src="/Logo/2660D49E-D11B-40B4-90C9-1330D611EDD0.jpg" 
              className="logo-main" 
              alt="Well Raggedy Logo" 
            />
            <div style={{ position: 'absolute', top: '105%', left: '50%', transform: 'translateX(-50%)', whiteSpace: 'nowrap' }}>
              <span className="spray-paint" style={{ fontSize: '1rem' }}>WELL RAGGEDY</span>
            </div>
          </div>

          {/* Nav Links */}
          <nav style={{ display: 'flex', gap: '3rem', alignItems: 'center' }}>
            <a href="#merch" style={{ color: 'white', textDecoration: 'none', fontWeight: 900, fontSize: '1.1rem', letterSpacing: '1px' }} onClick={() => triggerSynthTone(500, 0.05)}>MERCH SHOP</a>
            <a href="#clips" style={{ color: 'white', textDecoration: 'none', fontWeight: 900, fontSize: '1.1rem', letterSpacing: '1px' }} onClick={() => triggerSynthTone(550, 0.05)}>TAPE CLIPS</a>
            <a href="#jam" style={{ color: 'white', textDecoration: 'none', fontWeight: 900, fontSize: '1.1rem', letterSpacing: '1px' }} onClick={() => triggerSynthTone(600, 0.05)}>PUNK BEAT JAM</a>
            <a href="#wall" style={{ color: 'white', textDecoration: 'none', fontWeight: 900, fontSize: '1.1rem', letterSpacing: '1px' }} onClick={() => triggerSynthTone(650, 0.05)}>GRAFFITI WALL</a>
          </nav>

          {/* Cart Icon & Audio controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <button 
              onClick={() => setIsMuted(!isMuted)} 
              className="btn-punk" 
              style={{ padding: '0.4rem 1rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '5px' }}
            >
              {isMuted ? '🔈 UNMUTE TAPE' : '🔊 MUTED'}
            </button>
            
            <button 
              onClick={() => setCartOpen(true)} 
              className="btn-punk" 
              style={{ background: 'var(--primary-pink)', color: 'white', padding: '0.6rem 1.2rem', display: 'flex', gap: '8px', alignItems: 'center' }}
            >
              🛹 <span>CART ({cart.reduce((a,b) => a+b.qty, 0)})</span>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container" style={{ minHeight: '90vh', display: 'flex', alignItems: 'center', position: 'relative' }}>
        <div style={{ maxWidth: '750px', zIndex: 10, textAlign: 'left' }}>
          <div style={{ display: 'inline-block', background: 'var(--primary-pink)', color: 'white', padding: '0.4rem 1rem', fontFamily: 'var(--font-punk)', transform: 'rotate(-3deg)', marginBottom: '1.5rem', border: '2px solid white' }}>
            RUDE BOY SKATE CULTURE
          </div>
          <h1 style={{ fontSize: 'clamp(3.5rem, 10vw, 6.5rem)', textTransform: 'uppercase', lineHeight: 0.9, marginBottom: '2rem' }} className="glitch-text">
            WELL RAGGEDY
          </h1>
          <p style={{ fontSize: '1.3rem', color: 'var(--text-gray)', lineHeight: 1.6, marginBottom: '3rem', maxWidth: '650px' }}>
            Born in Kingston. Rooted in authentic Jamaican Reggae Punk and raw street skating. Built to shred the concrete, trash the rules, and custom-outfit the rebel spirit.
          </p>
          <div style={{ display: 'flex', gap: '2rem' }}>
            <a href="#merch" className="btn-punk" style={{ textDecoration: 'none' }}>SHRED THE MERCH</a>
            <button onClick={handleRollDice} className="btn-punk" style={{ background: '#000', color: 'var(--primary-acid)', borderColor: 'var(--primary-acid)' }}>
              🎲 GENERATE A TRICK
            </button>
          </div>

          {/* Dynamic trick display */}
          {diceResult && (
            <div style={{ marginTop: '2.5rem', background: '#111116', padding: '1.5rem', borderLeft: '5px solid var(--primary-acid)', maxWidth: '500px', display: 'flex', flexDirection: 'column', gap: '0.5rem', animation: 'sprayFade 0.4s ease-out' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--primary-acid)', fontWeight: 'bold', textTransform: 'uppercase' }}>YOUR SKATE TRICK CHALLENGE:</span>
              <span style={{ fontSize: '1.3rem', fontWeight: 900, color: 'white', fontFamily: 'var(--font-punk)' }}>{diceResult}</span>
            </div>
          )}
        </div>
      </section>

      {/* Merch Section */}
      <section id="merch" className="container" style={{ background: '#0D0D11', borderTop: '4px solid var(--border-grunge)', borderBottom: '4px solid var(--border-grunge)', position: 'relative' }}>
        <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
          <span className="spray-paint" style={{ fontSize: '1.5rem' }}>OFFICIAL RELEASE</span>
          <h2 style={{ fontSize: 'clamp(2.5rem, 8vw, 4.5rem)', textTransform: 'uppercase', fontFamily: 'var(--font-punk)', marginTop: '0.5rem' }}>THE RAG-PACK MERCH DROP</h2>
          <p style={{ color: 'var(--text-gray)', maxWidth: '600px', margin: '0 auto', fontSize: '1.1rem' }}>
            Authentic, heavy-duty skate gear customized for absolute thrashing. Limited edition sizes. Shred ready.
          </p>
        </div>

        <div className="merch-grid">
          {productsData.map((prod) => (
            <div key={prod.id} className="merch-card">
              <div className="merch-img-container">
                <span className={`merch-badge ${prod.badgeType === 'badge-pink' ? 'badge-limited' : 'badge-acid'}`}>
                  {prod.badge}
                </span>
                <img src={prod.image} alt={prod.name} className="merch-img" />
              </div>
              <div className="merch-info">
                <span style={{ fontSize: '0.8rem', color: 'var(--primary-acid)', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.4rem' }}>{prod.category}</span>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 900, marginBottom: '0.8rem', color: 'white' }}>{prod.name}</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-gray)', lineHeight: 1.4, marginBottom: '1.5rem', flexGrow: 1 }}>{prod.description}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--primary-acid)' }}>{prod.priceJMD}</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-gray)' }}>{prod.priceUSD}</span>
                  </div>
                  <button 
                    onClick={() => setQuickviewProduct(prod)} 
                    className="btn-punk" 
                    style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', background: '#000', color: 'white', borderColor: 'white' }}
                  >
                    QUICK SHRED
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Video Background / Tape Clips Section */}
      <section id="clips" className="container" style={{ position: 'relative' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '5rem', alignItems: 'center' }} className="mobile-grid">
          
          {/* Simulated Retro CRT TV Screen for video */}
          <div style={{ position: 'relative', background: '#111116', padding: '1rem', border: '5px solid #3E3E4F', borderRadius: '20px', boxShadow: '0px 30px 60px rgba(0,0,0,0.8)' }}>
            <div style={{ position: 'relative', aspectRatio: '4/3', background: '#000', overflow: 'hidden', borderRadius: '10px' }}>
              <video 
                key={selectedClip} 
                src={selectedClip} 
                autoPlay 
                loop 
                muted 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <div style={{ position: 'absolute', top: '1.5rem', left: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(0,0,0,0.6)', padding: '0.3rem 0.6rem', borderRadius: '4px' }}>
                <div style={{ width: '10px', height: '10px', background: 'var(--primary-pink)', borderRadius: '50%', animation: 'floatLogo 1s ease-in-out infinite' }}></div>
                <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'white', letterSpacing: '1px' }}>REC</span>
              </div>
              <div style={{ position: 'absolute', bottom: '1.5rem', right: '1.5rem', background: 'rgba(0,0,0,0.6)', padding: '0.3rem 0.6rem', borderRadius: '4px', fontSize: '0.8rem', color: 'white' }}>
                VHS TAPE 0{selectedClip.includes('clip 2') ? '2' : '3'}
              </div>
            </div>
          </div>

          <div style={{ textAlign: 'left' }}>
            <span className="spray-paint-pink" style={{ fontSize: '1.5rem' }}>KINGSTON DIRT SHRED</span>
            <h2 style={{ fontSize: 'clamp(2.5rem, 6vw, 4rem)', textTransform: 'uppercase', fontFamily: 'var(--font-punk)', marginTop: '0.5rem', lineHeight: 1.1 }}>TAPE DECK CONTROLS</h2>
            <p style={{ color: 'var(--text-gray)', fontSize: '1.1rem', lineHeight: 1.6, marginBottom: '2.5rem' }}>
              Toggle the skater tapes to change the background video loops of the entire site. Swap tapes to set your style.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <button 
                onClick={() => { triggerSynthTone(400, 0.2); setSelectedClip('/Clips/clip 2.mp4'); }} 
                className="btn-punk" 
                style={{ background: selectedClip.includes('clip 2') ? 'var(--primary-acid)' : '#111116', color: selectedClip.includes('clip 2') ? '#000' : 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <span>🎥 PLAY TAPE 02: DOWNTOWN SPEED RUN</span>
                <span style={{ fontSize: '0.8rem' }}>1.0 MB</span>
              </button>

              <button 
                onClick={() => { triggerSynthTone(500, 0.2); setSelectedClip('/Clips/clip 3.mp4'); }} 
                className="btn-punk" 
                style={{ background: selectedClip.includes('clip 3') ? 'var(--primary-acid)' : '#111116', color: selectedClip.includes('clip 3') ? '#000' : 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <span>🎥 PLAY TAPE 03: TRENCHTOWN VERT JAM</span>
                <span style={{ fontSize: '0.8rem' }}>4.3 MB</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Reggae-Punk Beat Jam */}
      <section id="jam" className="container" style={{ background: '#0D0D11', borderTop: '4px solid var(--border-grunge)', borderBottom: '4px solid var(--border-grunge)' }}>
        <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
          <span className="spray-paint" style={{ fontSize: '1.5rem' }}>INTERACTIVE</span>
          <h2 style={{ fontSize: 'clamp(2.5rem, 8vw, 4.5rem)', textTransform: 'uppercase', fontFamily: 'var(--font-punk)', marginTop: '0.5rem' }}>PUNK REGGAE BEAT JAM</h2>
          <p style={{ color: 'var(--text-gray)', maxWidth: '600px', margin: '0 auto', fontSize: '1.1rem' }}>
            Tap the colorful pads to play synth basslines or classic offbeat Jamaican riddims, or turn on the automatic beat loop to shred while you browse!
          </p>
        </div>

        <div style={{ maxWidth: '700px', margin: '0 auto', background: '#161622', padding: '3rem', borderRadius: '30px', border: '3px solid var(--border-grunge)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontWeight: 'bold', fontSize: '1.2rem', color: 'white' }}>SYNTH JAMCONTROLLER</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-gray)', marginTop: '0.2rem' }}>100% Web Audio Synthesized Beat</div>
            </div>
            <button 
              onClick={toggleSynthBeat} 
              className="btn-punk" 
              style={{ background: synthPlaying ? 'var(--primary-pink)' : 'var(--primary-acid)', color: synthPlaying ? 'white' : 'black' }}
            >
              {synthPlaying ? '⏹️ STOP AUTOPLAY' : '▶️ AUTOPLAY SKA BEAT'}
            </button>
          </div>

          {/* Synth Jam Grid Pads */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem' }}>
            <button onClick={() => triggerSynthTone(110.00, 0.4, 'triangle')} className="sound-pad" style={{ borderLeft: '4px solid #FF0055' }}>
              <span style={{ fontSize: '1.5rem' }}>🔊</span>
              <span style={{ fontSize: '0.8rem', marginTop: '5px' }}>BASS A</span>
            </button>
            <button onClick={() => triggerSynthTone(130.81, 0.4, 'triangle')} className="sound-pad" style={{ borderLeft: '4px solid #FF0055' }}>
              <span style={{ fontSize: '1.5rem' }}>🔊</span>
              <span style={{ fontSize: '0.8rem', marginTop: '5px' }}>BASS C</span>
            </button>
            <button onClick={() => triggerSynthTone(146.83, 0.4, 'triangle')} className="sound-pad" style={{ borderLeft: '4px solid #FF0055' }}>
              <span style={{ fontSize: '1.5rem' }}>🔊</span>
              <span style={{ fontSize: '0.8rem', marginTop: '5px' }}>BASS D</span>
            </button>
            <button onClick={() => triggerSynthTone(164.81, 0.4, 'triangle')} className="sound-pad" style={{ borderLeft: '4px solid #FF0055' }}>
              <span style={{ fontSize: '1.5rem' }}>🔊</span>
              <span style={{ fontSize: '0.8rem', marginTop: '5px' }}>BASS E</span>
            </button>

            <button onClick={() => triggerSynthTone(329.63, 0.15, 'sine')} className="sound-pad" style={{ borderLeft: '4px solid #BAFF1A' }}>
              <span style={{ fontSize: '1.5rem' }}>🎸</span>
              <span style={{ fontSize: '0.8rem', marginTop: '5px' }}>SKA UP E</span>
            </button>
            <button onClick={() => triggerSynthTone(392.00, 0.15, 'sine')} className="sound-pad" style={{ borderLeft: '4px solid #BAFF1A' }}>
              <span style={{ fontSize: '1.5rem' }}>🎸</span>
              <span style={{ fontSize: '0.8rem', marginTop: '5px' }}>SKA UP G</span>
            </button>
            <button onClick={() => triggerSynthTone(440.00, 0.15, 'sine')} className="sound-pad" style={{ borderLeft: '4px solid #BAFF1A' }}>
              <span style={{ fontSize: '1.5rem' }}>🎸</span>
              <span style={{ fontSize: '0.8rem', marginTop: '5px' }}>SKA UP A</span>
            </button>
            <button onClick={() => triggerSynthTone(523.25, 0.15, 'sine')} className="sound-pad" style={{ borderLeft: '4px solid #BAFF1A' }}>
              <span style={{ fontSize: '1.5rem' }}>🎸</span>
              <span style={{ fontSize: '0.8rem', marginTop: '5px' }}>SKA UP C</span>
            </button>
          </div>
        </div>
      </section>

      {/* Guestbook Graffiti Wall */}
      <section id="wall" className="container" style={{ position: 'relative' }}>
        <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
          <span className="spray-paint-pink" style={{ fontSize: '1.5rem' }}>REBEL REGISTER</span>
          <h2 style={{ fontSize: 'clamp(2.5rem, 8vw, 4.5rem)', textTransform: 'uppercase', fontFamily: 'var(--font-punk)', marginTop: '0.5rem' }}>SIGN THE GRAFFITI WALL</h2>
          <p style={{ color: 'var(--text-gray)', maxWidth: '600px', margin: '0 auto', fontSize: '1.1rem' }}>
            Leave your skater tag, crew name, or country on our digital street wall! Spray paint your mark.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '4rem', alignItems: 'center' }} className="mobile-grid">
          
          {/* Interactive Wall */}
          <div className="guestbook-wall">
            {tags.map((tag, idx) => (
              <span 
                key={idx} 
                className="graffiti-tag" 
                style={{ 
                  color: tag.color, 
                  position: 'absolute', 
                  left: `${tag.x}%`, 
                  top: `${tag.y}%`, 
                  transform: `rotate(${tag.rotate}deg)`,
                  textShadow: `0 0 10px ${tag.color}80`
                }}
              >
                {tag.name}
              </span>
            ))}
          </div>

          {/* Form */}
          <div style={{ background: '#111116', padding: '2.5rem', borderRadius: '20px', border: '2px solid var(--border-grunge)' }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: '2rem' }}>SPRAY YOUR TAG</h3>
            <form onSubmit={handleAddTag} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', textAlign: 'left' }}>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-gray)', fontWeight: 'bold' }}>SKATER / CREW NAME</label>
                <input 
                  type="text" 
                  maxLength={18} 
                  required 
                  value={newTag} 
                  onChange={e => setNewTag(e.target.value)} 
                  placeholder="e.g. DREADLOCKS" 
                  style={{ background: '#000', border: '1px solid var(--border-grunge)', padding: '1rem', borderRadius: '8px', color: 'white', fontSize: '1rem' }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', textAlign: 'left' }}>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-gray)', fontWeight: 'bold' }}>SPRAY PAINT COLOR</label>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  {['#BAFF1A', '#FF0055', '#00E6FF', '#FFFFFF'].map((color) => (
                    <button 
                      key={color} 
                      type="button" 
                      onClick={() => setNewTagColor(color)} 
                      style={{ 
                        width: '35px', height: '35px', borderRadius: '50%', background: color, 
                        border: newTagColor === color ? '4px solid white' : 'none', cursor: 'pointer' 
                      }} 
                    />
                  ))}
                </div>
              </div>

              <button type="submit" className="btn-punk" style={{ marginTop: '1rem' }}>
                💨 SPRAY THE WALL
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: '6rem 0', background: '#000', borderTop: '4px solid var(--border-grunge)', textAlign: 'center' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem' }}>
          <h2 style={{ fontFamily: 'var(--font-punk)', fontSize: '2.5rem', color: 'var(--primary-acid)', marginBottom: '1.5rem' }}>WELL RAGGEDY</h2>
          <p style={{ color: 'var(--text-gray)', fontSize: '0.95rem', maxWidth: '500px', margin: '0 auto 2.5rem' }}>
            Built for raw skaters who push limits, crash boundaries, and write their own music. Stay raggedy.
          </p>
          <div style={{ color: 'var(--text-gray)', fontSize: '0.8rem' }}>
            © 2026 Well Raggedy Skate Co. Kingston, Jamaica. All Rights Reserved.
          </div>
        </div>
      </footer>

      {/* Quick View Modal */}
      {quickviewProduct && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.85)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
          <div style={{ background: 'var(--bg-card)', border: '3px solid var(--primary-acid)', borderRadius: '24px', maxWidth: '800px', width: '100%', overflow: 'hidden', position: 'relative' }} className="grunge-border">
            <button 
              onClick={() => setQuickviewProduct(null)} 
              style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'none', border: 'none', color: 'white', fontSize: '2rem', cursor: 'pointer', zIndex: 10 }}
            >
              ❌
            </button>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr' }} className="mobile-grid">
              <div style={{ background: '#161622', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
                <img src={quickviewProduct.image} alt={quickviewProduct.name} style={{ width: '100%', height: 'auto', objectFit: 'contain' }} />
              </div>
              <div style={{ padding: '3rem', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--primary-acid)', fontWeight: 900, textTransform: 'uppercase' }}>{quickviewProduct.category}</span>
                <h2 style={{ fontSize: '2rem', fontWeight: 900, color: 'white' }}>{quickviewProduct.name}</h2>
                <p style={{ color: 'var(--text-gray)', fontSize: '1rem', lineHeight: 1.6 }}>{quickviewProduct.description}</p>
                
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--primary-acid)' }}>{quickviewProduct.priceJMD}</span>
                  <span style={{ fontSize: '1rem', color: 'var(--text-gray)' }}>{quickviewProduct.priceUSD}</span>
                </div>

                <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1rem' }}>
                  <button 
                    onClick={() => { addToCart(quickviewProduct); setQuickviewProduct(null); }} 
                    className="btn-punk" 
                    style={{ flexGrow: 1 }}
                  >
                    🛒 ADD TO SKATE BAG
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Shopping Cart Slide-out Panel */}
      <div className={`cart-panel ${cartOpen ? 'open' : ''}`}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem', borderBottom: '2px solid var(--border-grunge)', paddingBottom: '1.5rem' }}>
          <h3 style={{ fontFamily: 'var(--font-punk)', fontSize: '1.8rem', color: 'var(--primary-acid)' }}>SKATE BAG</h3>
          <button onClick={() => setCartOpen(false)} style={{ background: 'none', border: 'none', color: 'white', fontSize: '1.5rem', cursor: 'pointer' }}>
            ❌
          </button>
        </div>

        {/* Cart items */}
        <div style={{ flexGrow: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingRight: '0.5rem' }}>
          {cart.length === 0 ? (
            <div style={{ margin: 'auto', textAlign: 'center', color: 'var(--text-gray)' }}>
              <span style={{ fontSize: '3rem' }}>🛹</span>
              <p style={{ marginTop: '1rem', fontWeight: 'bold' }}>SKATE BAG IS EMPTY!</p>
              <p style={{ fontSize: '0.85rem' }}>Add some deck gears or punk tees to start thrashing.</p>
            </div>
          ) : (
            cart.map((item, idx) => (
              <div key={idx} style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '1rem', alignItems: 'center' }}>
                <img src={item.product.image} alt={item.product.name} style={{ width: '60px', height: '60px', objectFit: 'cover', background: '#161622', borderRadius: '8px' }} />
                <div style={{ flexGrow: 1, textAlign: 'left' }}>
                  <div style={{ fontSize: '0.95rem', fontWeight: 900, color: 'white' }}>{item.product.name}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--primary-acid)', marginTop: '0.2rem' }}>{item.product.priceJMD}</div>
                  
                  {/* Quantity controls */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '0.5rem' }}>
                    <button onClick={() => updateQty(item.product.id, item.size, -1)} style={{ background: '#000', border: '1px solid var(--border-grunge)', color: 'white', width: '25px', height: '25px', borderRadius: '4px', cursor: 'pointer' }}>-</button>
                    <span style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>{item.qty}</span>
                    <button onClick={() => updateQty(item.product.id, item.size, 1)} style={{ background: '#000', border: '1px solid var(--border-grunge)', color: 'white', width: '25px', height: '25px', borderRadius: '4px', cursor: 'pointer' }}>+</button>
                  </div>
                </div>
                <button onClick={() => removeFromCart(item.product.id, item.size)} style={{ background: 'none', border: 'none', color: 'var(--primary-pink)', fontSize: '1.2rem', cursor: 'pointer' }}>
                  🗑️
                </button>
              </div>
            ))
          )}
        </div>

        {/* Cart Checkout Footer */}
        {cart.length > 0 && (
          <div style={{ borderTop: '2px solid var(--border-grunge)', paddingTop: '2rem', marginTop: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <span style={{ fontWeight: 'bold' }}>TOTAL JMD:</span>
              <span style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--primary-acid)' }}>J${totalJMD.toLocaleString()}.00</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
              <span style={{ fontWeight: 'bold', color: 'var(--text-gray)' }}>TOTAL USD:</span>
              <span style={{ fontSize: '1rem', fontWeight: 'bold', color: 'var(--text-gray)' }}>${totalUSD.toFixed(2)} USD</span>
            </div>
            <button onClick={handleCheckout} className="btn-punk" style={{ width: '100%', padding: '1.2rem' }}>
              📱 CHECKOUT VIA WHATSAPP
            </button>
          </div>
        )}
      </div>
    </>
  );
}

export default App;
