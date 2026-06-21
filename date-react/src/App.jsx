import { useEffect, useRef, useState } from "react";
import confetti from "canvas-confetti";
import "./App.css";

// Main App component
function App() {
  // State variables
  const [screen, setScreen] = useState("question");
  const [selectedDateType, setSelectedDateType] = useState("");
  const [selectedDay, setSelectedDay] = useState("");
  const [selectedStartTime, setSelectedStartTime] = useState("");

  const [noPos, setNoPos] = useState(null);
  const [noDodgeCount, setNoDodgeCount] = useState(0);

  const [mindPos, setMindPos] = useState(null);
  const [mindDodgeCount, setMindDodgeCount] = useState(0);

  const [gameStatus, setGameStatus] = useState("intro");
  const [score, setScore] = useState(0);
  const [showWinPopup, setShowWinPopup] = useState(false);
  const [retryToken, setRetryToken] = useState(0);
  const [gameAttempts, setGameAttempts] = useState(0);
  const [finalAttempts, setFinalAttempts] = useState(0);

  const noButtonRef = useRef(null);
  const noPlaceholderRef = useRef(null);

  const mindButtonRef = useRef(null);
  const mindPlaceholderRef = useRef(null);

  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const gameRef = useRef(null);
  const gameStatusRef = useRef("intro");
  const retryTokenRef = useRef(0);
  const gameAttemptsRef = useRef(0);

  const jumpHeldRef = useRef(false);
  const shakeRef = useRef(0);

  const noTexts = ["No", "Are you sure?", "Please?", "Absolutely not?","now you're just being rude!", "please", "Ugh, fine!"];

  const dateOptions = [
    "Coffee date ☕",
    "Dinner date 🍝",
    "Movie date 🎬",
    "Picnic date 🌷",
    "Ice cream date 🍦",
    "Sunset walk 🌙",
  ];

  const today = new Date();
  const todayString = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  )
    .toISOString()
    .split("T")[0];

  const currentYear = today.getFullYear();
  const currentMonth = String(today.getMonth() + 1).padStart(2, "0");
  const lastDayOfMonth = new Date(currentYear, today.getMonth() + 1, 0);
  const lastDayOfMonthString = `${currentYear}-${currentMonth}-${String(
    lastDayOfMonth.getDate()
  ).padStart(2, "0")}`;

  useEffect(() => {
    retryTokenRef.current = retryToken;
  }, [retryToken]);

  useEffect(() => {
    gameAttemptsRef.current = gameAttempts;
  }, [gameAttempts]);

  useEffect(() => {
    const syncNoButton = () => {
      const placeholder = noPlaceholderRef.current;
      const button = noButtonRef.current;
      if (!placeholder) return;

      const rect = placeholder.getBoundingClientRect();
      const buttonWidth = button?.offsetWidth ?? 90;
      const buttonHeight = button?.offsetHeight ?? 48;
      const padding = 16;

      const maxX = window.innerWidth - buttonWidth - padding;
      const maxY = window.innerHeight - buttonHeight - padding;

      setNoPos({
        x: Math.max(padding, Math.min(rect.left, maxX)),
        y: Math.max(padding, Math.min(rect.top, maxY)),
      });
    };

    const syncMindButton = () => {
      const placeholder = mindPlaceholderRef.current;
      const button = mindButtonRef.current;
      if (!placeholder) return;

      const rect = placeholder.getBoundingClientRect();
      const buttonWidth = button?.offsetWidth ?? 320;
      const buttonHeight = button?.offsetHeight ?? 56;
      const padding = 16;

      const maxX = window.innerWidth - buttonWidth - padding;
      const maxY = window.innerHeight - buttonHeight - padding;

      setMindPos({
        x: Math.max(padding, Math.min(rect.left, maxX)),
        y: Math.max(padding, Math.min(rect.top, maxY)),
      });
    };

    const timer = setTimeout(() => {
      syncNoButton();
      syncMindButton();
    }, 60);

    window.addEventListener("resize", syncNoButton);
    window.addEventListener("resize", syncMindButton);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", syncNoButton);
      window.removeEventListener("resize", syncMindButton);
    };
  }, [screen]);

  const moveWithinViewport = (
    buttonRef,
    currentPos,
    setPos,
    setCount,
    stepX,
    stepY
  ) => {
    const button = buttonRef.current;
    if (!button || !currentPos) return;

    const rect = button.getBoundingClientRect();
    const padding = 16;

    const minX = padding;
    const minY = padding;
    const maxX = window.innerWidth - rect.width - padding;
    const maxY = window.innerHeight - rect.height - padding;

    const dirX = Math.random() > 0.5 ? 1 : -1;
    const dirY = Math.random() > 0.5 ? 1 : -1;

    let nextX = currentPos.x + dirX * (stepX.min + Math.random() * stepX.range);
    let nextY = currentPos.y + dirY * (stepY.min + Math.random() * stepY.range);

    nextX = Math.max(minX, Math.min(nextX, maxX));
    nextY = Math.max(minY, Math.min(nextY, maxY));

    setPos({ x: nextX, y: nextY });
    setCount((n) => n + 1);
  };

  const moveNoButton = () => {
    moveWithinViewport(
      noButtonRef,
      noPos,
      setNoPos,
      setNoDodgeCount,
      { min: 40, range: 30 },
      { min: 20, range: 20 }
    );
  };

  const moveMindButton = () => {
    moveWithinViewport(
      mindButtonRef,
      mindPos,
      setMindPos,
      setMindDodgeCount,
      { min: 45, range: 35 },
      { min: 18, range: 18 }
    );
  };

  const launchConfetti = () => {
    confetti({
      particleCount: 140,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#ff5ca8", "#ff86bf", "#ffc6de", "#fff", "#ff9fc6"],
    });
  };

  const handleYes = () => {
    setScreen("success");
    launchConfetti();
  };

  const handleDateTypeChoice = (option) => {
    setSelectedDateType(option);
    setGameAttempts(0);
    setFinalAttempts(0);
    gameAttemptsRef.current = 0;
    setScreen("runner-game");
  };

  const handleDaySubmit = () => {
    if (!selectedDay) return;
    setScreen("pick-time");
  };

  const formatDateReadable = (dateString) => {
    if (!dateString) return "";
    const [year, month, day] = dateString.split("-").map(Number);
    const localDate = new Date(year, month - 1, day);

    return localDate.toLocaleDateString("en-GB", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const addThreeHours = (timeString) => {
    if (!timeString) return "";
    const [hours, minutes] = timeString.split(":").map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    date.setHours(date.getHours() + 3);

    const hh = String(date.getHours()).padStart(2, "0");
    const mm = String(date.getMinutes()).padStart(2, "0");
    return `${hh}:${mm}`;
  };

  const sendWhatsAppSummary = () => {
    const phone = "32468132682";

    const message = `I'm so excited for our date! Here are the details:

Date type: ${selectedDateType}
Day: ${formatDateReadable(selectedDay)}
Time: ${selectedStartTime} - ${addThreeHours(selectedStartTime)}
Can't wait to see you! <3`;

    window.open(
      `https://wa.me/${phone}?text=${encodeURIComponent(message)}`,
      "_blank"
    );
  };

  const handleTimeSubmit = () => {
    if (!selectedStartTime) return;
    setScreen("final-plan");
    launchConfetti();
  };

  useEffect(() => {
    if (screen !== "runner-game") return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const obstacleColors = ["#ff7aa8", "#ff8fb8", "#ff6fa1", "#ff96c2"];
    const worldWidth = 3400;
    const blockCount = 10;
    const blockStartX = 620;
    const introSpacing = 62;

    const gameplayGapMin = 200;
    const gameplayGapMax = 300;
    const princessGoalOffset = 170;
    const runSpeed = 3.35;

    const setBothGameStatus = (nextStatus) => {
      gameStatusRef.current = nextStatus;
      setGameStatus(nextStatus);
    };

    const makeIntroBlocks = () =>
      Array.from({ length: blockCount }, (_, i) => {
        const height = 34 + Math.random() * 28;
        const width = 26 + Math.random() * 12;
        return {
          x: blockStartX + i * introSpacing,
          y: 220 - height,
          width,
          height,
          color: obstacleColors[Math.floor(Math.random() * obstacleColors.length)],
          radius: 6 + Math.random() * 4,
          counted: false,
        };
      });

    const makeGameplayBlocks = () => {
      const blocks = [];
      let currentX = blockStartX;

      for (let i = 0; i < blockCount; i++) {
        const height = 34 + Math.random() * 28;
        const width = 26 + Math.random() * 12;

        if (i === 0) {
          currentX = blockStartX;
        } else {
          const randomGap =
            gameplayGapMin + Math.random() * (gameplayGapMax - gameplayGapMin);
          currentX += randomGap;
        }

        blocks.push({
          x: currentX,
          y: 220 - height,
          width,
          height,
          color: obstacleColors[Math.floor(Math.random() * obstacleColors.length)],
          radius: 6 + Math.random() * 4,
          counted: false,
        });
      }

      return blocks;
    };

    const introBlocks = makeIntroBlocks();
    const gameplayBlocks = makeGameplayBlocks();
    const lastGameplayBlock = gameplayBlocks[gameplayBlocks.length - 1];
    const gameplayPrincessX =
      lastGameplayBlock.x + lastGameplayBlock.width + princessGoalOffset;

    const game = {
      worldWidth,
      groundY: 220,
      gravity: 0.78,
      jumpStrength: -15,
      elapsed: 0,
      lastTime: 0,
      cameraX: 0,
      introStage: 0,
      introTimer: 0,
      celebrationTimer: 0,
      canContinue: false,
      lastHandledRetryToken: retryTokenRef.current,
      hasWon: false,
      clouds: [
        { x: 90, y: 42, w: 78, h: 28, speed: 0.08, alpha: 0.55 },
        { x: 320, y: 84, w: 96, h: 34, speed: 0.12, alpha: 0.42 },
        { x: 585, y: 48, w: 88, h: 30, speed: 0.16, alpha: 0.48 },
      ],
      particles: [],
      player: {
        x: 90,
        y: 220 - 56,
        width: 42,
        height: 56,
        velocityY: 0,
        isGrounded: true,
      },
      princess: {
        introX: blockStartX + blockCount * introSpacing + 120,
        gameplayX: gameplayPrincessX,
        x: blockStartX + blockCount * introSpacing + 120,
        baseY: 220 - 52,
        y: 220 - 52,
      },
      storyBlocks: introBlocks,
      gameplayBlocks,
      obstacles: [],
      localScore: 0,
    };

    gameRef.current = game;
    jumpHeldRef.current = false;
    shakeRef.current = 0;
    setScore(0);
    setShowWinPopup(false);
    setBothGameStatus("intro");

    const restartGameDirectly = () => {
      const newGameplayBlocks = makeGameplayBlocks();
      const newLastGameplayBlock = newGameplayBlocks[newGameplayBlocks.length - 1];
      const newGameplayPrincessX =
        newLastGameplayBlock.x + newLastGameplayBlock.width + princessGoalOffset;

      game.elapsed = 0;
      game.lastTime = 0;
      game.cameraX = 0;
      game.introStage = 2;
      game.introTimer = 0;
      game.celebrationTimer = 0;
      game.canContinue = false;
      game.hasWon = false;

      game.player = {
        x: 90,
        y: game.groundY - 56,
        width: 42,
        height: 56,
        velocityY: 0,
        isGrounded: true,
      };

      game.gameplayBlocks = newGameplayBlocks;
      game.obstacles = newGameplayBlocks.map((b) => ({ ...b, counted: false }));

      game.princess.gameplayX = newGameplayPrincessX;
      game.princess.x = newGameplayPrincessX;
      game.princess.y = game.princess.baseY;

      game.localScore = 0;
      game.particles = [];

      jumpHeldRef.current = false;
      shakeRef.current = 0;

      setScore(0);
      setShowWinPopup(false);
      setBothGameStatus("running");
    };

    const startRunningPhase = () => {
      const newGameplayBlocks = makeGameplayBlocks();
      const newLastGameplayBlock = newGameplayBlocks[newGameplayBlocks.length - 1];
      const newGameplayPrincessX =
        newLastGameplayBlock.x + newLastGameplayBlock.width + princessGoalOffset;

      game.cameraX = 0;
      game.player.x = 90;
      game.player.y = game.groundY - game.player.height;
      game.player.velocityY = 0;
      game.player.isGrounded = true;
      game.hasWon = false;

      game.gameplayBlocks = newGameplayBlocks;
      game.obstacles = newGameplayBlocks.map((b) => ({ ...b, counted: false }));
      game.princess.gameplayX = newGameplayPrincessX;
      game.princess.x = newGameplayPrincessX;

      game.localScore = 0;
      game.particles = [];
      setScore(0);
      setShowWinPopup(false);
      setGameAttempts((n) => n + 1);
      setBothGameStatus("running");
    };

    const doJump = () => {
      if (!game.player.isGrounded || gameStatusRef.current !== "running") return;

      game.player.velocityY = game.jumpStrength;
      game.player.isGrounded = false;
      shakeRef.current = 2.5;
    };

    const handleAction = () => {
      if (gameStatusRef.current === "intro") {
        if (game.introStage === 2) {
          startRunningPhase();
        }
        return;
      }

      if (gameStatusRef.current === "lost") {
        restartGameDirectly();
        return;
      }

      if (gameStatusRef.current === "running") {
        doJump();
      }
    };

    const handleKeyDown = (e) => {
      if (e.code === "Space" || e.code === "ArrowUp") {
        e.preventDefault();
        jumpHeldRef.current = true;
        handleAction();
      }
    };

    const handleKeyUp = (e) => {
      if (e.code === "Space" || e.code === "ArrowUp") {
        jumpHeldRef.current = false;
      }
    };

    const handlePointerDown = () => {
      jumpHeldRef.current = true;
      handleAction();
    };

    const handlePointerUp = () => {
      jumpHeldRef.current = false;
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    canvas.addEventListener("pointerdown", handlePointerDown);
    canvas.addEventListener("pointerup", handlePointerUp);
    canvas.addEventListener("pointerleave", handlePointerUp);

    const drawRoundRect = (x, y, w, h, r, fillStyle) => {
      ctx.beginPath();
      ctx.fillStyle = fillStyle;
      ctx.roundRect(x, y, w, h, r);
      ctx.fill();
    };

    const createDust = (x, y) => {
      for (let i = 0; i < 7; i++) {
        game.particles.push({
          x,
          y,
          vx: -2 + Math.random() * 4,
          vy: -0.8 - Math.random() * 1.8,
          radius: 3 + Math.random() * 4,
          alpha: 0.45 + Math.random() * 0.25,
          life: 18 + Math.random() * 10,
          color: Math.random() > 0.5 ? "#f7bfd6" : "#f3a8c8",
        });
      }
    };

    const isColliding = (rect1, rect2) => {
      return (
        rect1.x < rect2.x + rect2.width &&
        rect1.x + rect1.width > rect2.x &&
        rect1.y < rect2.y + rect2.height &&
        rect1.y + rect1.height > rect2.y
      );
    };

    const drawCloud = (cloud) => {
      ctx.save();
      ctx.globalAlpha = cloud.alpha;
      ctx.fillStyle = "#ffffff";

      const cx = cloud.x - game.cameraX * cloud.speed;

      ctx.beginPath();
      ctx.arc(cx, cloud.y, cloud.h * 0.45, 0, Math.PI * 2);
      ctx.arc(cx + cloud.w * 0.22, cloud.y - cloud.h * 0.18, cloud.h * 0.38, 0, Math.PI * 2);
      ctx.arc(cx + cloud.w * 0.45, cloud.y, cloud.h * 0.5, 0, Math.PI * 2);
      ctx.arc(cx + cloud.w * 0.68, cloud.y + cloud.h * 0.04, cloud.h * 0.34, 0, Math.PI * 2);
      ctx.closePath();
      ctx.fill();

      ctx.restore();
    };

    const drawWorldBackground = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const sky = ctx.createLinearGradient(0, 0, 0, canvas.height);
      sky.addColorStop(0, "#ffe3f0");
      sky.addColorStop(1, "#fff8fc");
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      game.clouds.forEach(drawCloud);

      ctx.fillStyle = "#ffd3e6";
      ctx.beginPath();
      ctx.arc(620 - game.cameraX * 0.15, 60, 26, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#f8b7d2";
      ctx.fillRect(0, game.groundY, canvas.width, canvas.height - game.groundY);

      ctx.strokeStyle = "#f3a8c8";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, game.groundY);
      ctx.lineTo(canvas.width, game.groundY);
      ctx.stroke();
    };

    const drawMountain = () => {
      const mountainX = game.princess.x - 130 - game.cameraX;
      ctx.fillStyle = "#d87aa3";
      ctx.beginPath();
      ctx.moveTo(mountainX, game.groundY);
      ctx.lineTo(mountainX + 80, 120);
      ctx.lineTo(mountainX + 160, game.groundY);
      ctx.closePath();
      ctx.fill();
    };

    const drawPrincess = () => {
      const bounce =
        gameStatusRef.current === "won"
          ? Math.sin(game.celebrationTimer * 0.18) * 8
          : Math.sin(game.elapsed * 0.08) * 4;

      const py = game.princess.baseY + bounce;
      game.princess.y = py;

      const px = game.princess.x - game.cameraX;

      drawRoundRect(px, py, 28, 52, 10, "#ff7eb6");

      ctx.fillStyle = "#ffcfdf";
      ctx.beginPath();
      ctx.arc(px + 14, py - 12, 13, 0, Math.PI * 2);
      ctx.fill();
    };

    const drawPlayer = () => {
      const px = game.player.x - game.cameraX;
      drawRoundRect(px, game.player.y, game.player.width, game.player.height, 10, "#6f4bff");

      ctx.fillStyle = "#ffd7b8";
      ctx.beginPath();
      ctx.arc(px + game.player.width / 2, game.player.y - 8, 12, 0, Math.PI * 2);
      ctx.fill();
    };

    const drawBlocks = (blocks) => {
      blocks.forEach((obs) => {
        const x = obs.x - game.cameraX;
        drawRoundRect(x, obs.y, obs.width, obs.height, obs.radius, obs.color);

        ctx.fillStyle = "rgba(255,255,255,0.22)";
        ctx.beginPath();
        ctx.roundRect(x + 4, obs.y + 4, Math.max(obs.width - 8, 6), 6, 4);
        ctx.fill();
      });
    };

    const updateAndDrawParticles = () => {
      game.particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.08;
        p.alpha *= 0.95;
        p.radius *= 0.985;
        p.life -= 1;

        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x - game.cameraX, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      game.particles = game.particles.filter(
        (p) => p.life > 0 && p.alpha > 0.03 && p.radius > 0.5
      );
    };

    const drawSpeech = (text, x, y) => {
      ctx.font = "16px sans-serif";
      const padding = 10;
      const width = ctx.measureText(text).width + padding * 2;

      ctx.fillStyle = "rgba(255,255,255,0.92)";
      ctx.beginPath();
      ctx.roundRect(x, y, width, 34, 12);
      ctx.fill();

      ctx.fillStyle = "#a04b72";
      ctx.fillText(text, x + padding, y + 22);
    };

    const drawOverlay = () => {
      if (gameStatusRef.current === "intro") {
        if (game.introStage === 0) {
          drawSpeech("Where is Julie?", 60, 34);
        } else if (game.introStage === 1) {
          drawSpeech("Please come to me to join me on our date!", 250, 30);
        } else if (game.introStage === 2) {
          ctx.fillStyle = "rgba(255,255,255,0.74)";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.fillStyle = "#a04b72";
          ctx.font = "bold 24px sans-serif";
          ctx.fillText("Jump over the 10 blocks and reach Julie!", 135, 110);
          ctx.font = "16px sans-serif";
          ctx.fillText("Tap, click, Space, or Arrow Up to start", 220, 145);
        }
      }

      if (gameStatusRef.current === "lost") {
        ctx.fillStyle = "rgba(255,255,255,0.76)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "#a04b72";
        ctx.font = "bold 24px sans-serif";
        ctx.fillText("He tripped! Try again 💔", 230, 125);
        ctx.font = "16px sans-serif";
        ctx.fillText("Tap, click, or press Space to retry", 225, 155);
      }

      if (gameStatusRef.current === "won") {
        drawSpeech("Woohoo!", 310, 36);
      }
    };

    const updateIntro = (delta) => {
      game.introTimer += delta;
      game.princess.x = game.princess.introX;

      if (game.introStage === 0) {
        game.cameraX = 0;
        if (game.introTimer > 90) {
          game.introStage = 1;
          game.introTimer = 0;
        }
      } else if (game.introStage === 1) {
        const targetX = game.princess.x - 280;
        game.cameraX += (targetX - game.cameraX) * 0.03;
        if (Math.abs(targetX - game.cameraX) < 3 && game.introTimer > 40) {
          game.introStage = 2;
          game.introTimer = 0;
        }
      }
    };

    const updateRunning = (delta) => {
      if (
        gameStatusRef.current === "lost" &&
        retryTokenRef.current !== game.lastHandledRetryToken
      ) {
        game.lastHandledRetryToken = retryTokenRef.current;
        restartGameDirectly();
        return;
      }

      game.player.velocityY += game.gravity * delta;
      game.player.y += game.player.velocityY * delta;

      if (!jumpHeldRef.current && game.player.velocityY < -6) {
        game.player.velocityY *= 0.6;
      }

      if (game.player.y >= game.groundY - game.player.height) {
        const justLanded = !game.player.isGrounded;
        game.player.y = game.groundY - game.player.height;
        game.player.velocityY = 0;
        game.player.isGrounded = true;

        if (justLanded) {
          createDust(game.player.x + game.player.width / 2, game.groundY - 2);
        }
      }

      game.princess.x = game.princess.gameplayX;

      game.cameraX = Math.max(0, Math.min(game.player.x - 180, game.worldWidth - canvas.width));
      game.player.x += runSpeed * delta;

      game.obstacles.forEach((obs) => {
        if (!obs.counted && obs.x + obs.width < game.player.x) {
          obs.counted = true;
          game.localScore += 1;
          setScore(game.localScore);
        }

        if (isColliding(game.player, obs)) {
          shakeRef.current = 10;
          game.localScore = 0;
          setScore(0);
          setShowWinPopup(false);
          setBothGameStatus("lost");
        }
      });

      if (game.localScore >= blockCount && !game.hasWon) {
        game.hasWon = true;
        setFinalAttempts(gameAttemptsRef.current);
        setBothGameStatus("won");
        launchConfetti();
      }
    };

    const updateWon = (delta) => {
      game.celebrationTimer += delta;
      game.princess.x = game.princess.gameplayX;

      const targetX = game.princess.x - 40;
      if (game.player.x < targetX) {
        game.player.x += 2.8 * delta;
        game.cameraX = Math.max(0, Math.min(game.player.x - 220, game.worldWidth - canvas.width));
      } else {
        const jumpWave = Math.sin(game.celebrationTimer * 0.18) * 10;
        game.player.y = game.groundY - game.player.height + jumpWave;
        game.princess.y = game.princess.baseY + jumpWave;

        if (game.celebrationTimer > 110) {
          game.canContinue = true;
          setShowWinPopup(true);
        }
      }
    };

    const loop = (timestamp) => {
      const delta = game.lastTime ? (timestamp - game.lastTime) / 16.67 : 1;
      game.lastTime = timestamp;
      game.elapsed += delta;
      shakeRef.current *= 0.88;

      const shakeX = shakeRef.current ? (Math.random() - 0.5) * shakeRef.current : 0;
      const shakeY = shakeRef.current ? (Math.random() - 0.5) * shakeRef.current : 0;

      if (
        gameStatusRef.current === "lost" &&
        retryTokenRef.current !== game.lastHandledRetryToken
      ) {
        game.lastHandledRetryToken = retryTokenRef.current;
        restartGameDirectly();
      } else if (gameStatusRef.current === "intro") {
        updateIntro(delta);
      } else if (gameStatusRef.current === "running") {
        updateRunning(delta);
      } else if (gameStatusRef.current === "won") {
        updateWon(delta);
      }

      ctx.save();
      ctx.translate(shakeX, shakeY);

      drawWorldBackground();
      drawMountain();

      if (
        gameStatusRef.current === "running" ||
        gameStatusRef.current === "lost" ||
        gameStatusRef.current === "won"
      ) {
        ctx.font = "18px sans-serif";
        ctx.fillStyle = "#a04b72";
        ctx.fillText(`Blocks cleared: ${game.localScore}/10`, 20, 32);
      }

      drawBlocks(
        gameStatusRef.current === "running" ||
          gameStatusRef.current === "lost" ||
          gameStatusRef.current === "won"
          ? game.obstacles
          : game.storyBlocks
      );

      drawPrincess();
      drawPlayer();
      updateAndDrawParticles();
      drawOverlay();

      ctx.restore();

      animationRef.current = window.requestAnimationFrame(loop);
    };

    animationRef.current = window.requestAnimationFrame(loop);

    return () => {
      if (animationRef.current) {
        window.cancelAnimationFrame(animationRef.current);
      }
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      canvas.removeEventListener("pointerdown", handlePointerDown);
      canvas.removeEventListener("pointerup", handlePointerUp);
      canvas.removeEventListener("pointerleave", handlePointerUp);
    };
  }, [screen]);

  return (
    <div className="app">
      <div className="hearts">
        {Array.from({ length: 22 }).map((_, i) => (
          <span
            key={i}
            className="heart"
            style={{
              left: `${Math.random() * 100}%`,
              animationDuration: `${5 + Math.random() * 6}s`,
              animationDelay: `${Math.random() * 4}s`,
              opacity: 0.25 + Math.random() * 0.5,
              transform: `scale(${0.6 + Math.random() * 1.1}) rotate(45deg)`,
            }}
          />
        ))}
      </div>

      <div className="card">
        {screen === "question" && (
          <>
            <p className="subtitle">A tiny question from the heart</p>
            <h1>Will you go on a date with me?</h1>

            <div className="buttons">
              <button className="yes" onClick={handleYes}>
                Yes
              </button>

              <div ref={noPlaceholderRef} className="no-placeholder" />

              {noPos && (
                <button
                  ref={noButtonRef}
                  className={`no floating no-${Math.min(noDodgeCount, 5)}`}
                  onMouseEnter={moveNoButton}
                  onTouchStart={moveNoButton}
                  style={{
                    left: `${noPos.x}px`,
                    top: `${noPos.y}px`,
                  }}
                >
                  {noTexts[Math.min(noDodgeCount, noTexts.length - 1)]}
                </button>
              )}
            </div>
          </>
        )}

        {screen === "success" && (
          <div className="success">
            <div className="confetti">💖 🎉 💖</div>
            <h1>Yay! I’m so happy!</h1>
            <p>It’s a date then. 🌷</p>
            <button className="choose-date-btn" onClick={() => setScreen("date-options")}>
              Choose what kind of date
            </button>
          </div>
        )}

        {screen === "runner-game" && (
          <div className="game-screen">
            <p className="subtitle">Mini game</p>
            <h1>Come and find me!</h1>
            <p className="picker-text">
              Please jump over the 10 blocks to reach Julie.
            </p>

            <div className="game-hud">
              <span>Cleared: {score} / 10</span>
              <span>
                {gameStatus === "intro" && "Story time"}
                {gameStatus === "running" && "Run!"}
                {gameStatus === "lost" && "Try again"}
                {gameStatus === "won" && "Woohoo!"}
              </span>
            </div>

            <canvas
              ref={canvasRef}
              className="runner-canvas"
              width={720}
              height={280}
            />

            {showWinPopup && (
              <div className="win-popup">
                <h2>Woewoep 💖</h2>
                <p>Thank you for putting in the effort.</p>
                <p>Now please choose the date.</p>
                <button
                  className="choose-date-btn"
                  onClick={() => setScreen("pick-day")}
                >
                  Choose the date
                </button>
              </div>
            )}

            <div className="game-actions">
              {gameStatus === "lost" && (
                <button
                  className="choose-date-btn"
                  onClick={() => {
                    setGameAttempts((n) => n + 1);
                    setRetryToken((n) => n + 1);
                  }}
                >
                  Try again
                </button>
              )}
            </div>
          </div>
        )}

        {screen === "date-options" && (
          <div className="date-options">
            <p className="subtitle">Step 1 of 4</p>
            <h1>What kind of date should we go on?</h1>

            <div className="date-grid">
              {dateOptions.map((option) => (
                <button
                  key={option}
                  className="date-option-btn"
                  onClick={() => handleDateTypeChoice(option)}
                >
                  {option}
                </button>
              ))}
            </div>

            <div className="mind-row">
              <div ref={mindPlaceholderRef} className="mind-placeholder" />

              {mindPos && (
                <button
                  ref={mindButtonRef}
                  className="mind-btn floating"
                  onMouseEnter={moveMindButton}
                  onTouchStart={moveMindButton}
                  style={{
                    left: `${mindPos.x}px`,
                    top: `${mindPos.y}px`,
                  }}
                >
                  I changed my mind, not in the mood for a date
                </button>
              )}
            </div>
          </div>
        )}

        {screen === "pick-day" && (
          <div className="date-options">
            <p className="subtitle">Step 2 of 4</p>
            <h1>Choose a day</h1>
            <p className="picker-text">
              Pick a day this month for our <strong>{selectedDateType}</strong>
            </p>

            <div className="picker-box">
              <label htmlFor="day-picker" className="picker-label">
                Choose a day
              </label>
              <input
                id="day-picker"
                type="date"
                className="picker-input"
                value={selectedDay}
                min={todayString}
                max={lastDayOfMonthString}
                onChange={(e) => setSelectedDay(e.target.value)}
              />
            </div>

            <button
              className="choose-date-btn"
              onClick={handleDaySubmit}
              disabled={!selectedDay}
            >
              Continue to time
            </button>
          </div>
        )}

        {screen === "pick-time" && (
          <div className="date-options">
            <p className="subtitle">Step 3 of 4</p>
            <h1>Choose a time slot</h1>
            <p className="picker-text">
              Let’s keep it in the evening and make it at least 3 hours long.
            </p>

            <div className="picker-box">
              <label htmlFor="time-picker" className="picker-label">
                Choose a start time
              </label>
              <input
                id="time-picker"
                type="time"
                className="picker-input"
                value={selectedStartTime}
                min="18:00"
                max="21:00"
                step="900"
                onChange={(e) => setSelectedStartTime(e.target.value)}
              />

              {selectedStartTime && (
                <p className="time-note">
                  This would be from <strong>{selectedStartTime}</strong> until{" "}
                  <strong>{addThreeHours(selectedStartTime)}</strong>
                </p>
              )}
            </div>

            <button
              className="choose-date-btn"
              onClick={handleTimeSubmit}
              disabled={!selectedStartTime}
            >
              Confirm our plan
            </button>
          </div>
        )}

        {screen === "final-plan" && (
          <div className="success">
            <div className="confetti">🥰 ✨ 🌷</div>
            <h1>It’s a date!</h1>
            <p>
              We’re going on a <strong>{selectedDateType}</strong>
            </p>
            <p>{formatDateReadable(selectedDay)}</p>
            <p>
              From <strong>{selectedStartTime}</strong> until{" "}
              <strong>{addThreeHours(selectedStartTime)}</strong>
            </p>
            <button className="choose-date-btn" onClick={sendWhatsAppSummary}>
              Let me know on WhatsApp
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;