import React, { useRef, useEffect, useState } from 'react';
import { db } from './firebase';
import { collection, addDoc, onSnapshot, query, orderBy, limit } from 'firebase/firestore';

const SkateGame = () => {
  const canvasRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [topScores, setTopScores] = useState([]);
  const [playerName, setPlayerName] = useState('');
  const [scoreSubmitted, setScoreSubmitted] = useState(false);

  const startSound = useRef(null);
  const gameMusic = useRef(null);

  useEffect(() => {
    startSound.current = new Audio('/sounds/sound for game start/AUD-20260727-WA0001.opus');
    gameMusic.current = new Audio('/sounds/Music/Well Raggedy - Dats My Ting .mp3');
    gameMusic.current.loop = true;
    
    // Listen to top 5 scores from Firebase
    try {
      const q = query(collection(db, 'skate_scores'), orderBy('score', 'desc'), limit(5));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        setTopScores(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      });
      return () => unsubscribe();
    } catch(e) {
      console.warn("Firebase not configured for scores.", e);
    }
  }, []);

  const startGame = () => {
    setIsPlaying(true);
    setGameOver(false);
    setScoreSubmitted(false);
    setScore(0);
    setPlayerName('');
    if (startSound.current) {
      startSound.current.play().catch(e => console.error("Audio play failed:", e));
    }
    if (gameMusic.current) {
      gameMusic.current.currentTime = 0;
      gameMusic.current.play().catch(e => console.error("Music play failed:", e));
    }
  };

  const submitScore = async (e) => {
    e.preventDefault();
    if (!playerName.trim() || scoreSubmitted) return;
    
    setScoreSubmitted(true);
    
    try {
      await addDoc(collection(db, 'skate_scores'), {
        name: playerName.trim(),
        score: score,
        timestamp: new Date()
      });
      startGame();
    } catch(e) {
      console.error("Error submitting score:", e);
      setScoreSubmitted(false);
    }
  };

  useEffect(() => {
    if (!isPlaying) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    // Game variables
    let skater = { x: 50, y: 150, width: 20, height: 30, dy: 0, jumpForce: -10, gravity: 0.6, grounded: false };
    let obstacles = [];
    let frame = 0;
    let currentScore = 0;

    const spawnObstacle = () => {
      obstacles.push({ x: canvas.width, y: 160, width: 20, height: 20, speed: 5 });
    };

    const update = () => {
      // Skater physics
      skater.dy += skater.gravity;
      skater.y += skater.dy;

      // Ground collision
      if (skater.y + skater.height >= 180) {
        skater.y = 180 - skater.height;
        skater.dy = 0;
        skater.grounded = true;
      } else {
        skater.grounded = false;
      }

      // Obstacles
      if (frame % 75 === 0) {
        spawnObstacle();
      }

      for (let i = obstacles.length - 1; i >= 0; i--) {
        obstacles[i].x -= obstacles[i].speed;
        
        // Collision
        if (
          skater.x < obstacles[i].x + obstacles[i].width &&
          skater.x + skater.width > obstacles[i].x &&
          skater.y < obstacles[i].y + obstacles[i].height &&
          skater.y + skater.height > obstacles[i].y
        ) {
          setGameOver(true);
          setIsPlaying(false);
          if (gameMusic.current) {
            gameMusic.current.pause();
          }
          return;
        }

        // Score
        if (obstacles[i].x + obstacles[i].width < skater.x && !obstacles[i].scored) {
          currentScore++;
          setScore(currentScore);
          obstacles[i].scored = true;
        }

        if (obstacles[i].x + obstacles[i].width < 0) {
          obstacles.splice(i, 1);
        }
      }

      frame++;
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Ground
      ctx.fillStyle = '#222';
      ctx.fillRect(0, 180, canvas.width, canvas.height - 180);

      // Skater (Pixelated square for now)
      ctx.fillStyle = '#BAFF1A';
      ctx.fillRect(skater.x, skater.y, skater.width, skater.height);
      
      // Skateboard
      ctx.fillStyle = '#FFF';
      ctx.fillRect(skater.x - 2, skater.y + skater.height - 4, skater.width + 4, 4);

      // Obstacles
      ctx.fillStyle = '#FF0055';
      obstacles.forEach(obs => {
        ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
      });
    };

    const loop = () => {
      update();
      if (isPlaying) {
        draw();
        animationFrameId = window.requestAnimationFrame(loop);
      }
    };

    loop();

    const handleInput = (e) => {
      e.preventDefault();
      if (skater.grounded) {
        skater.dy = skater.jumpForce;
      }
    };

    canvas.addEventListener('mousedown', handleInput);
    canvas.addEventListener('touchstart', handleInput, { passive: false });

    return () => {
      window.cancelAnimationFrame(animationFrameId);
      canvas.removeEventListener('mousedown', handleInput);
      canvas.removeEventListener('touchstart', handleInput);
      if (gameMusic.current) {
        gameMusic.current.pause();
      }
    };
  }, [isPlaying]);

  return (
    <div style={{ position: 'relative', width: '320px', background: '#000', border: '4px solid var(--border-grunge)', margin: '2rem auto', imageRendering: 'pixelated', display: 'flex', flexDirection: 'column' }}>
      
      {/* Game Canvas Area */}
      <div style={{ height: '240px', position: 'relative', flexShrink: 0 }}>
        <canvas ref={canvasRef} width={320} height={240} style={{ width: '100%', height: '100%', display: isPlaying ? 'block' : 'none', cursor: 'pointer' }} />
        
        {!isPlaying && (
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.85)', color: 'white', fontFamily: '"Courier New", Courier, monospace', textAlign: 'center', padding: '1rem' }}>
            
            {!gameOver ? (
              <>
                <h2 style={{ color: 'var(--primary-acid)', fontSize: '1.5rem', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Well Raggedy<br/>Skate Park</h2>
                <p style={{ fontSize: '0.8rem', color: 'var(--primary-pink)', marginBottom: '1rem' }}>designed by @thekingfromkingston</p>
                <button onClick={startGame} className="btn-punk" style={{ fontSize: '1rem', padding: '0.5rem 1rem' }}>
                  TAP TO START
                </button>
              </>
            ) : (
              <>
                <h2 style={{ color: 'red', fontSize: '1.5rem', marginBottom: '0.5rem' }}>GAME OVER</h2>
                <p style={{ fontSize: '1.2rem', marginBottom: '1rem', fontWeight: 'bold' }}>Score: {score}</p>
                
                {score > 0 && !scoreSubmitted ? (
                  <form onSubmit={submitScore} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'center' }}>
                    <input 
                      type="text" 
                      placeholder="ENTER TAG (10 chars)" 
                      maxLength="10"
                      value={playerName} 
                      onChange={(e) => setPlayerName(e.target.value)}
                      style={{ background: '#222', border: '2px solid var(--primary-acid)', color: 'white', padding: '0.5rem', textAlign: 'center', fontFamily: '"Courier New"', outline: 'none' }}
                      required
                    />
                    <button type="submit" className="btn-punk" style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}>SUBMIT SCORE</button>
                  </form>
                ) : (
                  <button onClick={startGame} className="btn-punk" style={{ fontSize: '1rem', padding: '0.5rem 1rem', marginTop: '0.5rem' }}>
                    PLAY AGAIN
                  </button>
                )}
              </>
            )}
          </div>
        )}
        
        {isPlaying && (
          <div style={{ position: 'absolute', top: '10px', left: '10px', color: 'white', fontFamily: '"Courier New", Courier, monospace', fontSize: '1.2rem', fontWeight: 'bold' }}>
            Score: {score}
          </div>
        )}
      </div>

      {/* Top 5 Scoreboard Area */}
      <div style={{ flexGrow: 1, background: '#111', borderTop: '2px solid var(--border-grunge)', padding: '1rem' }}>
        <h3 style={{ color: 'var(--primary-pink)', fontSize: '1.2rem', fontFamily: '"Courier New"', textAlign: 'center', marginBottom: '0.8rem', textTransform: 'uppercase' }}>🏆 TOP 5 HIGHSCORES</h3>
        {topScores.length === 0 ? (
          <p style={{ color: 'var(--text-gray)', fontSize: '0.9rem', textAlign: 'center', fontFamily: '"Courier New"' }}>No scores recorded yet.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {topScores.map((s, idx) => (
              <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', fontFamily: '"Courier New"', fontSize: '1rem', background: idx === 0 ? 'rgba(186,255,26,0.1)' : 'transparent', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                <span style={{ color: idx === 0 ? 'var(--primary-acid)' : 'white' }}>{idx + 1}. {s.name}</span>
                <span style={{ color: idx === 0 ? 'var(--primary-acid)' : 'white', fontWeight: 'bold' }}>{s.score}</span>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default SkateGame;
