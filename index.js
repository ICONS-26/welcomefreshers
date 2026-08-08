(function(){
  "use strict";

  /* ============ THEME SWITCHER ============ */
  var themeToggleBtn = document.getElementById('themeToggleBtn');
  var currentTheme = localStorage.getItem('icons_theme') || 'dark';
  document.documentElement.setAttribute('data-theme', currentTheme);
  themeToggleBtn.textContent = currentTheme === 'dark' ? '🌓' : '☀️';

  themeToggleBtn.addEventListener('click', function(){
    currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', currentTheme);
    localStorage.setItem('icons_theme', currentTheme);
    themeToggleBtn.textContent = currentTheme === 'dark' ? '🌓' : '☀️';
    toast('Switched to ' + currentTheme.toUpperCase() + ' Mode');
  });

  /* ============ SOUND SYNTHESIZER (WEB AUDIO API) ============ */
  var audioCtx = null;
  var soundEnabled = true;

  function initAudio(){
    if(!audioCtx){
      var AudioContext = window.AudioContext || window.webkitAudioContext;
      if(AudioContext) audioCtx = new AudioContext();
    }
  }

  function playTone(freq, type, duration){
    if(!soundEnabled) return;
    initAudio();
    if(!audioCtx) return;
    try {
      var osc = audioCtx.createOscillator();
      var gain = audioCtx.createGain();
      osc.type = type || 'sine';
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch(e){}
  }

  function playChime(){
    if(!soundEnabled) return;
    playTone(523.25, 'triangle', 0.15);
    setTimeout(function(){ playTone(659.25, 'triangle', 0.15); }, 100);
    setTimeout(function(){ playTone(783.99, 'triangle', 0.25); }, 200);
  }

  var soundBtn = document.getElementById('soundToggleBtn');
  soundBtn.addEventListener('click', function(){
    soundEnabled = !soundEnabled;
    soundBtn.textContent = soundEnabled ? '🔊' : '🔇';
    toast(soundEnabled ? 'Sound FX Enabled' : 'Sound FX Muted');
  });

  /* ============ LOADER ============ */
  var fill = document.getElementById('loaderFill');
  var pct = document.getElementById('loaderPct');
  var loader = document.getElementById('loader');
  var progress = 0;
  var loaderInterval = setInterval(function(){
    progress += Math.random() * 20 + 8;
    if(progress >= 100){
      progress = 100;
      clearInterval(loaderInterval);
      setTimeout(function(){
        loader.classList.add('hidden');
        document.body.style.overflow = '';
      }, 350);
    }
    fill.style.width = progress + '%';
    pct.textContent = Math.floor(progress) + '% — WARMING UP THE WELCOME';
  }, 160);
  document.body.style.overflow = 'hidden';

  /* ============ HERO PARTICLE CANVAS ============ */
  var heroCanvas = document.getElementById('heroCanvas');
  var hCtx = heroCanvas.getContext('2d');
  var pArray = [];
  var mouse = { x: null, y: null, radius: 130 };

  function resizeCanvas(){
    heroCanvas.width = window.innerWidth;
    heroCanvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  window.addEventListener('mousemove', function(e){
    mouse.x = e.x; mouse.y = e.y;
  });

  function Particle(x, y){
    this.x = x; this.y = y;
    this.size = Math.random() * 3 + 1;
    this.baseX = this.x; this.baseY = this.y;
    this.density = (Math.random() * 20) + 5;
    this.color = Math.random() > 0.5 ? 'rgba(255, 200, 87, 0.45)' : 'rgba(255, 107, 91, 0.45)';
  }
  Particle.prototype.draw = function(){
    hCtx.fillStyle = this.color;
    hCtx.beginPath();
    hCtx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    hCtx.closePath();
    hCtx.fill();
  };
  Particle.prototype.update = function(){
    var dx = mouse.x - this.x;
    var dy = mouse.y - this.y;
    var dist = Math.sqrt(dx * dx + dy * dy);
    if(dist < mouse.radius){
      var force = (mouse.radius - dist) / mouse.radius;
      var dirX = (dx / dist) * force * this.density;
      var dirY = (dy / dist) * force * this.density;
      this.x -= dirX; this.y -= dirY;
    } else {
      if(this.x !== this.baseX) { this.x -= (this.x - this.baseX) * 0.05; }
      if(this.y !== this.baseY) { this.y -= (this.y - this.baseY) * 0.05; }
    }
  };

  function initParticles(){
    pArray = [];
    var count = Math.min(90, Math.floor(window.innerWidth / 14));
    for(var i = 0; i < count; i++){
      pArray.push(new Particle(Math.random() * heroCanvas.width, Math.random() * heroCanvas.height));
    }
  }
  initParticles();

  function animateParticles(){
    hCtx.clearRect(0, 0, heroCanvas.width, heroCanvas.height);
    for(var i = 0; i < pArray.length; i++){
      pArray[i].draw();
      pArray[i].update();
    }
    requestAnimationFrame(animateParticles);
  }
  animateParticles();

  /* ============ CONFETTI CANVAS PHYSICS ============ */
  var confettiCanvas = document.getElementById('confettiCanvas');
  var cCtx = confettiCanvas.getContext('2d');
  var confettiParticles = [];
  function resizeConfetti(){ confettiCanvas.width = window.innerWidth; confettiCanvas.height = window.innerHeight; }
  window.addEventListener('resize', resizeConfetti);
  resizeConfetti();

  function fireConfetti(){
    playChime();
    var colors = ['#FF6B5B', '#FFC857', '#FFF3E4', '#FF9478', '#3E2555'];
    for(var i = 0; i < 100; i++){
      confettiParticles.push({
        x: window.innerWidth / 2,
        y: window.innerHeight / 2,
        vx: (Math.random() - 0.5) * 18,
        vy: (Math.random() - 0.7) * 20,
        size: Math.random() * 8 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rSpeed: (Math.random() - 0.5) * 12,
        opacity: 1
      });
    }
  }

  function renderConfetti(){
    cCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    for(var i = confettiParticles.length - 1; i >= 0; i--){
      var p = confettiParticles[i];
      p.x += p.vx; p.y += p.vy; p.vy += 0.35;
      p.rotation += p.rSpeed; p.opacity -= 0.012;
      cCtx.save();
      cCtx.translate(p.x, p.y);
      cCtx.rotate((p.rotation * Math.PI) / 180);
      cCtx.globalAlpha = Math.max(0, p.opacity);
      cCtx.fillStyle = p.color;
      cCtx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
      cCtx.restore();
      if(p.opacity <= 0 || p.y > confettiCanvas.height) confettiParticles.splice(i, 1);
    }
    requestAnimationFrame(renderConfetti);
  }
  renderConfetti();

  /* ============ SCROLL REVEAL ============ */
  var revealEls = document.querySelectorAll('.reveal');
  var io = new IntersectionObserver(function(entries){
    entries.forEach(function(entry){
      if(entry.isIntersecting){ entry.target.classList.add('in-view'); io.unobserve(entry.target); }
    });
  }, { threshold: 0.15 });
  revealEls.forEach(function(el){ io.observe(el); });

  /* ============ TOAST ============ */
  var toastEl = document.getElementById('toast');
  var toastTimer;
  function toast(msg){
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function(){ toastEl.classList.remove('show'); }, 2400);
  }

  /* ============ XP & LOCAL STORAGE ============ */
  var xpValEl = document.getElementById('xpVal');
  var rankValEl = document.getElementById('rankVal');
  var currentXP = parseInt(localStorage.getItem('icons_xp') || '0', 10);

  function getRank(xp){
    if(xp >= 150) return 'ICONS Legend 👑';
    if(xp >= 80) return 'Logic Master ⚡';
    if(xp >= 30) return 'Circuit Apprentice 🔌';
    return 'Freshman Icon 🌟';
  }

  function updateXPUI(){
    xpValEl.textContent = currentXP;
    rankValEl.textContent = getRank(currentXP);
    localStorage.setItem('icons_xp', currentXP);
  }
  updateXPUI();

  function awardXP(pts){
    currentXP += pts;
    updateXPUI();
    toast('+' + pts + ' XP Earned! Total: ' + currentXP + ' XP');
    fireConfetti();
  }

  /* ============ SURPRISE CARD ============ */
  var surpriseCard = document.getElementById('surpriseCard');
  surpriseCard.addEventListener('click', function(){
    surpriseCard.classList.toggle('flipped');
    playTone(440, 'sine', 0.2);
    if(surpriseCard.classList.contains('flipped')) fireConfetti();
  });
  surpriseCard.addEventListener('keydown', function(e){
    if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); surpriseCard.click(); }
  });

  /* ============ INSTA STORY BADGE BUILDER ============ */
  var badgeCanvas = document.getElementById('badgeCanvas');
  var bCtx = badgeCanvas.getContext('2d');
  var badgeName = document.getElementById('badgeName');
  var badgeBatch = document.getElementById('badgeBatch');
  var badgeTheme = document.getElementById('badgeTheme');
  var downloadBadgeBtn = document.getElementById('downloadBadgeBtn');

  var deptImg = new Image();
  var deptImgLoaded = false;
  deptImg.onload = function(){ deptImgLoaded = true; renderBadge(); };
  deptImg.src = 'data:image/jpeg;base64,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T5rGZrs5NrQkr3Qte1OEgulvGvuBdQhrpss8InEsWWLv/wBdYFb9Isu5sc+Zl8Yw8LTf5NrTCVJKJCM+qkcSZ+aDSL7WpeWwkxKFwpC8jwij8K+006SOVxJwYjLLsXbmY/oGjlL7JKM+vP8AcV1dalcU2KeBhBzigiTHaruWILwOOEd4wwgJxh/JqaZWxUyK9p8wwww24x9GMi8J+hqwRG/UimZ7Yog8gwcGCr647z7oS483JcJCZEuk8qjW0MRzXoa06ha1GNLcd71BkAuXALAKzGY8XJPDB3RghhB24q4A8s+qjwygG5FwB+kIJ9NAb3vtJpdrtauWnWPXN2OLLT3hSCfgd4z2nLQXmXXxVRSKC519eiXe+UcpTyfvXFtBNNNrxPwMkDTDjioXki/oMAB+XEfBwRhAzb1vvTVb/qURv+M4SzXAFUhjS1hWy+rD/p3nkZpbl1bfwvKYBHENEs2Gh3eTIdo40oQQK+Hr3r7Pu1NIZEAJ92+nWIhPUJmhSQXaIBogUoEcq+X/AA7kMw1Pmhe8k89HhJR2Rk11/wAblLYY9w0lVGDoIOuM9D24rMaXaMOyoRTh0xoXAQgDWK6Y9A4sE2oU7vsUPULhSz03VCT6BxnQbBrOsRgp9t+882W4716V1htYtcI37z+Fy36x640w66EPe/8A++fe/wDzvvfPL73/AIo5567zzzz3zzzzzzzzzz33zzzzzzzzzzz7zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD/xAAC/9oADAMBAAIAAwAAABD333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333PPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPP/AP8A/wD/AP8A/wD/AP8A/wD/AP8A/wD/AP8A/wD/AP8A/wD/AP8A/wD/AP8A/wD/AP8A/wD/AP8A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';

  function drawImageCover(ctx, img, cx, cy, r){
    var size = r * 2;
    var imgRatio = img.width / img.height;
    var drawWidth, drawHeight;
    if(imgRatio > 1){
      drawHeight = size;
      drawWidth = size * imgRatio;
    } else {
      drawWidth = size;
      drawHeight = size / imgRatio;
    }
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(img, cx - drawWidth / 2, cy - drawHeight / 2, drawWidth, drawHeight);
    ctx.restore();
  }

  function renderBadge(){
    var w = badgeCanvas.width, h = badgeCanvas.height;
    var name = badgeName.value.trim() || 'NSSCE Junior';
    var batch = badgeBatch.value;
    var theme = badgeTheme.value;

    var grad = bCtx.createLinearGradient(0, 0, w, h);
    if(theme === 'coral'){
      grad.addColorStop(0, '#2D1B3D'); grad.addColorStop(0.5, '#3E2555'); grad.addColorStop(1, '#FF6B5B');
    } else if(theme === 'emerald'){
      grad.addColorStop(0, '#0F261D'); grad.addColorStop(0.5, '#1B3D2F'); grad.addColorStop(1, '#00E676');
    } else if(theme === 'solar'){
      grad.addColorStop(0, '#FFF3E4'); grad.addColorStop(0.5, '#FFE39B'); grad.addColorStop(1, '#FF9478');
    } else { // gold
      grad.addColorStop(0, '#1A0F26'); grad.addColorStop(0.5, '#2D1B3D'); grad.addColorStop(1, '#FFC857');
    }

    bCtx.fillStyle = grad;
    bCtx.fillRect(0, 0, w, h);

    bCtx.strokeStyle = theme === 'solar' ? '#1A0F26' : 'rgba(255, 200, 87, 0.4)';
    bCtx.lineWidth = 12;
    bCtx.strokeRect(20, 20, w - 40, h - 40);

    bCtx.textAlign = 'center';
    bCtx.fillStyle = theme === 'solar' ? '#E64A38' : '#FFC857';
    bCtx.font = 'bold 36px "Space Grotesk", sans-serif';
    bCtx.fillText('ICONS', w / 2, 100);

    bCtx.fillStyle = theme === 'solar' ? '#1A0F26' : '#FFF3E4';
    bCtx.font = '18px "JetBrains Mono", monospace';
    bCtx.fillText('NSSCE PALAKKAD · ICE DEPT', w / 2, 135);

    if(deptImgLoaded){
      drawImageCover(bCtx, deptImg, w / 2, 340, 140);
    } else {
      bCtx.fillStyle = 'rgba(244, 236, 251, 0.1)';
      bCtx.beginPath();
      bCtx.arc(w / 2, 340, 140, 0, Math.PI * 2);
      bCtx.fill();
      bCtx.font = '90px sans-serif';
      bCtx.fillText('⚡', w / 2, 370);
    }
    bCtx.beginPath();
    bCtx.arc(w / 2, 340, 140, 0, Math.PI * 2);
    bCtx.strokeStyle = '#FF6B5B';
    bCtx.lineWidth = 4;
    bCtx.stroke();

    bCtx.fillStyle = theme === 'solar' ? '#1A0F26' : '#FFF3E4';
    bCtx.font = 'bold 44px "Fredoka", sans-serif';
    bCtx.fillText(name, w / 2, 570);

    bCtx.fillStyle = theme === 'solar' ? '#E64A38' : '#FFC857';
    bCtx.font = '24px "JetBrains Mono", monospace';
    bCtx.fillText(batch, w / 2, 620);

    bCtx.fillStyle = theme === 'solar' ? '#5C4B70' : 'rgba(244, 236, 251, 0.75)';
    bCtx.font = '20px "Nunito", sans-serif';
    bCtx.fillText('OFFICIALLY WELCOMED TO THE FAMILY', w / 2, 720);

    bCtx.fillStyle = '#FF9478';
    bCtx.font = 'bold 18px "Space Grotesk", sans-serif';
    bCtx.fillText('@icons.nssce', w / 2, 770);
  }

  badgeName.addEventListener('input', renderBadge);
  badgeBatch.addEventListener('change', renderBadge);
  badgeTheme.addEventListener('change', renderBadge);
  renderBadge();

  downloadBadgeBtn.addEventListener('click', function(){
    var link = document.createElement('a');
    link.download = 'ICONS_Freshers_Badge.png';
    link.href = badgeCanvas.toDataURL('image/png');
    link.click();
    toast('Badge downloaded! Share on Insta 📲');
    awardXP(10);
  });

  /* ============ GAME SELECTOR ============ */
  var pills = document.querySelectorAll('.game-pill');
  var panels = {
    ttt: document.getElementById('panel-ttt'),
    memory: document.getElementById('panel-memory'),
    simon: document.getElementById('panel-simon'),
    quiz: document.getElementById('panel-quiz')
  };
  pills.forEach(function(pill){
    pill.addEventListener('click', function(){
      pills.forEach(function(p){ p.classList.remove('active'); });
      pill.classList.add('active');
      Object.keys(panels).forEach(function(k){ panels[k].classList.remove('active'); });
      panels[pill.dataset.game].classList.add('active');
      playTone(350, 'sine', 0.1);
    });
  });

  /* ============ GAME 1: TIC TAC TOE ============ */
  var boardEl = document.getElementById('board');
  var statusEl = document.getElementById('gameStatus');
  var scoreYouEl = document.getElementById('scoreYou');
  var scoreDrawEl = document.getElementById('scoreDraw');
  var scoreAIEl = document.getElementById('scoreAI');
  var resetBtn = document.getElementById('resetGame');
  var cells, cellEls, gameOver, tttScores = {you:0, draw:0, ai:0};
  var WIN_LINES = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];

  function buildBoard(){
    boardEl.innerHTML = '';
    cells = Array(9).fill(null);
    gameOver = false;
    cellEls = [];
    for(var i=0;i<9;i++){
      var c = document.createElement('div');
      c.className = 'cell';
      c.dataset.i = i;
      c.setAttribute('role','button');
      c.setAttribute('tabindex','0');
      c.addEventListener('click', onCellClick);
      c.addEventListener('keydown', function(e){ if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); onCellClick.call(this, e); } });
      boardEl.appendChild(c);
      cellEls.push(c);
    }
    statusEl.textContent = 'Your turn — tap a cell';
    statusEl.classList.remove('win-msg');
  }
  function onCellClick(){
    var i = parseInt(this.dataset.i, 10);
    if(gameOver || cells[i]) return;
    place(i, 'X');
    playTone(400, 'sine', 0.1);
    var win = checkWin('X');
    if(win){ endGame('You win! 🎉 +15 XP', 'you', win); return; }
    if(cells.every(function(v){return v;})){ endGame("It's a draw — +5 XP", 'draw'); return; }
    statusEl.textContent = 'Icons AI is thinking...';
    setTimeout(aiMove, 400);
  }
  function place(i, mark){
    cells[i] = mark;
    var el = cellEls[i];
    el.textContent = mark;
    el.classList.add('taken', mark.toLowerCase());
  }
  function aiMove(){
    if(gameOver) return;
    var i = pickAiMove();
    if(i === -1) return;
    place(i, 'O');
    playTone(300, 'sine', 0.1);
    var win = checkWin('O');
    if(win){ endGame('Icons AI wins this round — try again!', 'ai', win); return; }
    if(cells.every(function(v){return v;})){ endGame("It's a draw — +5 XP", 'draw'); return; }
    statusEl.textContent = 'Your turn — tap a cell';
  }
  function pickAiMove(){
    var empty = cells.map(function(v,i){return v?null:i;}).filter(function(v){return v!==null;});
    if(empty.length === 0) return -1;
    for(var i=0;i<empty.length;i++){ cells[empty[i]]='O'; if(checkWin('O')){ cells[empty[i]]=null; return empty[i]; } cells[empty[i]]=null; }
    for(var j=0;j<empty.length;j++){ cells[empty[j]]='X'; if(checkWin('X')){ cells[empty[j]]=null; return empty[j]; } cells[empty[j]]=null; }
    if(!cells[4] && Math.random() > 0.3) return 4;
    var corners = [0,2,6,8].filter(function(c){return !cells[c];});
    if(corners.length && Math.random() > 0.4) return corners[Math.floor(Math.random()*corners.length)];
    return empty[Math.floor(Math.random()*empty.length)];
  }
  function checkWin(mark){
    for(var i=0;i<WIN_LINES.length;i++){
      var line = WIN_LINES[i];
      if(line.every(function(idx){return cells[idx] === mark;})) return line;
    }
    return null;
  }
  function endGame(msg, who, line){
    gameOver = true;
    statusEl.textContent = msg;
    statusEl.classList.add('win-msg');
    if(line) line.forEach(function(i){ cellEls[i].classList.add('win'); });
    if(who === 'you'){ tttScores.you++; scoreYouEl.textContent = tttScores.you; awardXP(15); }
    if(who === 'ai'){ tttScores.ai++; scoreAIEl.textContent = tttScores.ai; }
    if(who === 'draw'){ tttScores.draw++; scoreDrawEl.textContent = tttScores.draw; awardXP(5); }
  }
  resetBtn.addEventListener('click', buildBoard);
  buildBoard();

  /* ============ GAME 2: MEMORY MATCH ============ */
  var memoryGrid = document.getElementById('memoryGrid');
  var memMovesEl = document.getElementById('memMoves');
  var memPairsEl = document.getElementById('memPairs');
  var memStatusEl = document.getElementById('memStatus');
  var resetMemoryBtn = document.getElementById('resetMemory');
  var MEM_SYMBOLS = ['⚙️','🔧','💡','🔌','📡','🧪','🖥️','🔋'];
  var memState = { flipped:[], matched:0, moves:0, locked:false };

  function buildMemory(){
    memState = { flipped:[], matched:0, moves:0, locked:false };
    memMovesEl.textContent = '0';
    memPairsEl.textContent = '0/8';
    memStatusEl.textContent = 'Find the matching pairs';
    var deck = MEM_SYMBOLS.concat(MEM_SYMBOLS);
    for(var i = deck.length - 1; i > 0; i--){
      var j = Math.floor(Math.random() * (i+1));
      var tmp = deck[i]; deck[i] = deck[j]; deck[j] = tmp;
    }
    memoryGrid.innerHTML = '';
    deck.forEach(function(symbol, idx){
      var card = document.createElement('div');
      card.className = 'mem-card';
      card.dataset.symbol = symbol;
      card.dataset.idx = idx;
      card.innerHTML = '<div class="mem-inner"><div class="mem-face mem-front">?</div><div class="mem-face mem-back">' + symbol + '</div></div>';
      card.addEventListener('click', function(){ onMemClick(card); });
      memoryGrid.appendChild(card);
    });
  }

  function onMemClick(card){
    if(memState.locked) return;
    if(card.classList.contains('flipped') || card.classList.contains('matched')) return;
    if(memState.flipped.length === 2) return;

    playTone(500, 'sine', 0.08);
    card.classList.add('flipped');
    memState.flipped.push(card);

    if(memState.flipped.length === 2){
      memState.moves++;
      memMovesEl.textContent = memState.moves;
      var a = memState.flipped[0], b = memState.flipped[1];
      if(a.dataset.symbol === b.dataset.symbol){
        a.classList.add('matched'); b.classList.add('matched');
        memState.flipped = [];
        memState.matched++;
        memPairsEl.textContent = memState.matched + '/8';
        playTone(680, 'triangle', 0.15);
        if(memState.matched === 8){
          var pts = Math.max(15, 50 - (memState.moves - 8) * 2);
          memStatusEl.textContent = 'All matched in ' + memState.moves + ' moves! +' + pts + ' XP';
          awardXP(pts);
        }
      }else{
        memState.locked = true;
        setTimeout(function(){
          a.classList.remove('flipped'); b.classList.remove('flipped');
          memState.flipped = [];
          memState.locked = false;
        }, 700);
      }
    }
  }
  resetMemoryBtn.addEventListener('click', buildMemory);
  buildMemory();

  /* ============ GAME 3: SIMON CIRCUIT ============ */
  var simonPads = document.querySelectorAll('.simon-pad');
  var startSimonBtn = document.getElementById('startSimon');
  var simonScoreEl = document.getElementById('simonScore');
  var simonBestEl = document.getElementById('simonBest');
  var simonStatusEl = document.getElementById('simonStatus');
  var simonSeq = [], userSeq = [], simonLevel = 0, simonBest = 0;
  var simonTones = [261.63, 329.63, 392.00, 523.25];

  startSimonBtn.addEventListener('click', startSimonGame);

  function startSimonGame(){
    simonSeq = []; userSeq = []; simonLevel = 0;
    simonScoreEl.textContent = '0';
    nextSimonRound();
  }

  function nextSimonRound(){
    userSeq = [];
    simonLevel++;
    simonScoreEl.textContent = simonLevel;
    if(simonLevel > simonBest){ simonBest = simonLevel; simonBestEl.textContent = simonBest; }
    simonStatusEl.textContent = 'Watch sequence...';
    simonSeq.push(Math.floor(Math.random() * 4));
    playSimonSequence();
  }

  function playSimonSequence(){
    var i = 0;
    var interval = setInterval(function(){
      flashPad(simonSeq[i]);
      i++;
      if(i >= simonSeq.length){
        clearInterval(interval);
        setTimeout(function(){ simonStatusEl.textContent = 'Your turn — repeat pattern!'; }, 400);
      }
    }, 600);
  }

  function flashPad(index){
    var pad = simonPads[index];
    pad.classList.add('active');
    playTone(simonTones[index], 'sine', 0.25);
    setTimeout(function(){ pad.classList.remove('active'); }, 300);
  }

  simonPads.forEach(function(pad){
    pad.addEventListener('click', function(){
      var idx = parseInt(pad.dataset.pad, 10);
      flashPad(idx);
      userSeq.push(idx);
      var currentStep = userSeq.length - 1;

      if(userSeq[currentStep] !== simonSeq[currentStep]){
        simonStatusEl.textContent = 'Circuit short! Game Over at Level ' + simonLevel;
        playTone(150, 'sawtooth', 0.4);
        return;
      }

      if(userSeq.length === simonSeq.length){
        if(simonLevel >= 5 && simonLevel % 5 === 0){ awardXP(25); }
        simonStatusEl.textContent = 'Good job! Next sequence coming up...';
        setTimeout(nextSimonRound, 800);
      }
    });
  });

  /* ============ GAME 4: QUICK QUIZ ============ */
  var QUIZ_BANK = [
    {q:'What does "ICE" stand for in your department?', options:['Instrumentation & Control Engineering','Internal Combustion Engineering','Integrated Circuit Electronics','Information & Computing Engineering'], correct:0},
    {q:'Which unit measures electrical resistance?', options:['Farad','Ohm','Henry','Tesla'], correct:1},
    {q:'A PID controller stands for Proportional, Integral, and...?', options:['Inductive','Derivative','Digital','Distributed'], correct:1},
    {q:'Which sensor is commonly used to measure temperature?', options:['LDR','Thermocouple','Photodiode','Accelerometer'], correct:1},
    {q:'In control systems, what does "feedback" refer to?', options:['Random noise in the system','Output routed back to adjust input','A backup power supply','Final system output only'], correct:1},
    {q:'Which of these is NOT a programming language?', options:['Python','Ruby','SQLite','JavaScript'], correct:2},
    {q:'What does "SCADA" commonly stand for?', options:['Supervisory Control and Data Acquisition','System Control and Digital Automation','Sensor Calibration and Data Analysis','Signal Conversion and Data Access'], correct:0}
  ];
  var quizQEl = document.getElementById('quizQ');
  var quizOptionsEl = document.getElementById('quizOptions');
  var quizProgressEl = document.getElementById('quizProgress');
  var quizScoreEl = document.getElementById('quizScore');
  var resetQuizBtn = document.getElementById('resetQuiz');
  var quizState = { order:[], index:0, score:0 };

  function buildQuiz(){
    var pool = QUIZ_BANK.slice();
    for(var i = pool.length - 1; i > 0; i--){
      var j = Math.floor(Math.random() * (i+1));
      var tmp = pool[i]; pool[i] = pool[j]; pool[j] = tmp;
    }
    quizState = { order: pool.slice(0, 5), index: 0, score: 0 };
    quizScoreEl.textContent = '0';
    renderQuizQuestion();
  }

  function renderQuizQuestion(){
    var item = quizState.order[quizState.index];
    quizProgressEl.textContent = 'Question ' + (quizState.index + 1) + ' of ' + quizState.order.length;
    quizQEl.textContent = item.q;
    quizOptionsEl.innerHTML = '';
    item.options.forEach(function(opt, i){
      var btn = document.createElement('button');
      btn.className = 'quiz-opt';
      btn.textContent = opt;
      btn.addEventListener('click', function(){ onQuizAnswer(i, item.correct, btn); });
      quizOptionsEl.appendChild(btn);
    });
  }

  function onQuizAnswer(chosen, correct, btnEl){
    var allBtns = quizOptionsEl.querySelectorAll('.quiz-opt');
    allBtns.forEach(function(b){ b.disabled = true; });
    if(chosen === correct){
      btnEl.classList.add('correct');
      quizState.score++;
      quizScoreEl.textContent = quizState.score;
      playTone(600, 'triangle', 0.15);
    }else{
      btnEl.classList.add('wrong');
      allBtns[correct].classList.add('correct');
      playTone(250, 'sawtooth', 0.2);
    }
    setTimeout(function(){
      quizState.index++;
      if(quizState.index < quizState.order.length){
        renderQuizQuestion();
      }else{
        var pts = quizState.score * 10;
        quizQEl.textContent = 'Quiz complete! You scored ' + quizState.score + '/' + quizState.order.length + ' right. +' + pts + ' XP';
        quizOptionsEl.innerHTML = '';
        quizProgressEl.textContent = 'Finished';
        if(pts > 0) awardXP(pts);
      }
    }, 900);
  }
  resetQuizBtn.addEventListener('click', buildQuiz);
  buildQuiz();

  /* ============ FAQ ACCORDION ============ */
  var faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(function(item){
    var q = item.querySelector('.faq-q');
    q.addEventListener('click', function(){
      item.classList.toggle('open');
      playTone(450, 'sine', 0.08);
    });
  });

  /* ============ TESTIMONIAL CAROUSEL ============ */
  var testimonials = document.querySelectorAll('.testimonial');
  var dotsWrap = document.getElementById('tDots');
  var tIndex = 0, tTimer;
  testimonials.forEach(function(_, i){
    var dot = document.createElement('button');
    dot.className = 't-dot' + (i===0 ? ' active' : '');
    dot.setAttribute('aria-label', 'Show testimonial ' + (i+1));
    dot.addEventListener('click', function(){ showTestimonial(i); resetTimer(); });
    dotsWrap.appendChild(dot);
  });
  var dots = dotsWrap.querySelectorAll('.t-dot');
  function showTestimonial(i){
    testimonials.forEach(function(t, idx){ t.classList.toggle('active', idx===i); });
    dots.forEach(function(d, idx){ d.classList.toggle('active', idx===i); });
    tIndex = i;
  }
  function resetTimer(){
    clearInterval(tTimer);
    tTimer = setInterval(function(){ showTestimonial((tIndex+1) % testimonials.length); }, 5000);
  }
  resetTimer();

  /* ============ LIGHTBOX MODAL & MEDIA ============ */
  var lightboxDialog = document.getElementById('lightboxDialog');
  var lightboxEmoji = document.getElementById('lightboxEmoji');
  var lightboxTitle = document.getElementById('lightboxTitle');
  var lightboxDesc = document.getElementById('lightboxDesc');
  var closeLightboxBtn = document.getElementById('closeLightboxBtn');

  function openLightbox(emoji, title, desc){
    lightboxEmoji.textContent = emoji;
    lightboxTitle.textContent = title;
    lightboxDesc.textContent = desc;
    lightboxDialog.showModal();
    playTone(550, 'triangle', 0.15);
  }

  closeLightboxBtn.addEventListener('click', function(){ lightboxDialog.close(); });
  lightboxDialog.addEventListener('click', function(e){
    if(e.target === lightboxDialog) lightboxDialog.close();
  });

  /* ============ GALLERY POPULATION ============ */
  var photos = [
    {label:'Campus Vibes', emoji:'📸', desc:'Sunny afternoons outside the ICE department block.'},
    {label:'Squad Goals', emoji:'👥', desc:'Senior-junior study circles and project brainstorms.'},
    {label:'Best Memories', emoji:'💫', desc:'Group photos after winning the college inter-department trophy.'},
    {label:'Fest Energy', emoji:'🎊', desc:'Techno-cultural fest exhibits designed by ICONS members.'},
    {label:'Lab Hours', emoji:'⚙️', desc:'Assembling sensors and tuning PID controllers.'},
    {label:'Team Spirit', emoji:'🔥', desc:'Cheering together during annual sports day.'}
  ];
  var galleryGrid = document.getElementById('galleryGrid');
  photos.forEach(function(p){
    var item = document.createElement('div');
    item.className = 'gallery-item';
    item.innerHTML = p.emoji + '<span>' + p.label + '</span>';
    item.addEventListener('click', function(){ openLightbox(p.emoji, p.label, p.desc); });
    galleryGrid.appendChild(item);
  });

})();
