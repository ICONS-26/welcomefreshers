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
  deptImg.src = 'data:image/jpeg;base64,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';

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

  /* ============ PHOTO SLIDESHOW ============ */
  var slidePhotos = [
    {src: 'img/achievements/indumiss.jpeg', tag: 'Achievements'},
    {src: 'img/achievements/iv25.jpg', tag: 'Achievements'},
    {src: 'img/achievements/logomaking.jpg', tag: 'Achievements'},
    {src: 'img/achievements/placement.jpeg', tag: 'Achievements'},
    {src: 'img/achievements/quizwinners.jpeg', tag: 'Achievements'},
    {src: 'img/achievements/spiwebinar.jpg', tag: 'Achievements'},
    {src: 'img/druva/beyondthepulseimage.jpg', tag: 'Druva'},
    {src: 'img/druva/beyondthepulseposter.jpg', tag: 'Druva'},
    {src: 'img/druva/brainbattle.jpg', tag: 'Druva'},
    {src: 'img/druva/druvatalk.jpg', tag: 'Druva'},
    {src: 'img/druva/druvateam25.jpg', tag: 'Druva'},
    {src: 'img/druva/iconscupposter.jpg', tag: 'Druva'},
    {src: 'img/druva/iconscupwinners.jpeg', tag: 'Druva'},
    {src: 'img/druva/microcontroller_workshop.jpg', tag: 'Druva'},
    {src: 'img/druva/rudraimage.jpg', tag: 'Druva'},
    {src: 'img/druva/rudraposter.jpg', tag: 'Druva'}
  ];

  var slideshowTrack = document.getElementById('slideshowTrack');
  var slideDotsWrap = document.getElementById('slideDots');
  var slidePrevBtn = document.getElementById('slidePrev');
  var slideNextBtn = document.getElementById('slideNext');
  var slideIndex = 0, slideTimer;

  slidePhotos.forEach(function(p, i){
    var slide = document.createElement('div');
    slide.className = 'slide';

    var tag = document.createElement('span');
    tag.className = 'slide-tag';
    tag.textContent = p.tag;

    var img = document.createElement('img');
    img.src = p.src;
    img.alt = p.tag + ' photo';
    img.loading = 'lazy';

    slide.appendChild(tag);
    slide.appendChild(img);
    slideshowTrack.appendChild(slide);

    var dot = document.createElement('button');
    dot.className = 'slide-dot' + (i === 0 ? ' active' : '');
    dot.setAttribute('aria-label', 'Show photo ' + (i + 1));
    dot.addEventListener('click', function(){ showSlide(i); resetSlideTimer(); });
    slideDotsWrap.appendChild(dot);
  });

  var slideEls = slideshowTrack.querySelectorAll('.slide');
  var slideDots = slideDotsWrap.querySelectorAll('.slide-dot');

  function showSlide(i){
    slideIndex = (i + slideEls.length) % slideEls.length;
    slideEls.forEach(function(s, idx){
      var rel = (idx - slideIndex + slideEls.length) % slideEls.length;
      s.classList.toggle('current', rel === 0);
      s.classList.toggle('next', rel === 1);
    });
    slideDots.forEach(function(d, idx){ d.classList.toggle('active', idx === slideIndex); });
  }
  showSlide(0);
  function resetSlideTimer(){
    clearInterval(slideTimer);
    slideTimer = setInterval(function(){ showSlide(slideIndex + 1); }, 7000);
  }
  slidePrevBtn.addEventListener('click', function(){ showSlide(slideIndex - 1); resetSlideTimer(); playTone(350, 'sine', 0.08); });
  slideNextBtn.addEventListener('click', function(){ showSlide(slideIndex + 1); resetSlideTimer(); playTone(350, 'sine', 0.08); });
  resetSlideTimer();

})();
