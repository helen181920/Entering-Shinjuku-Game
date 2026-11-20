
let sceneSounds = {};
let audioStarted = false;
let warningSound;
let warningPlayed = false;
let warningTextUntil = 0;

function preload() {
  sceneSounds[1] = loadSound("higashishinjuku.mp3");
  sceneSounds[2] = loadSound("map1_off_oedo.mp3");
  sceneSounds[3] = loadSound("passingbymarunochi.mp3");
  sceneSounds[4] = loadSound("underJR.mp3");
  sceneSounds[5] = loadSound("platform13.mp3");
  // sceneSounds[6] = loadSound("nearplatform.mp3");
  // sceneSounds[7] = loadSound("farplatform.mp3");
  warningSound = loadSound("trainisarriviing.mp3");
  }


function checkWarningSound() {
  let gameSeconds = floor(elapsed * 660 / GAME_MS);
  if (gameSeconds >= 480 && !warningPlayed) {
    if (warningSound && audioStarted) {
    warningSound.setVolume(0.8);
      warningSound.play();
    }
    warningPlayed = true;
    }
  }


function drawWarningText() {
  if (warningPlayed && scene >= 2 && scene <= 5) {
    push();
    //400 ms
    if (floor(millis() / 400) % 2 === 0) {
    noStroke();
    fill(0, 0, 0, 220);
    rect(55, 270, 490, 60, 8);
    fill(255, 50, 50);
     textAlign(CENTER, CENTER);
    textStyle(BOLD);
    textSize(26);
      text("YOUR TRAIN IS ARRIVING", 300, 300);
    }
    pop();
    }
  }


function playSceneSound() {
  if (!audioStarted) return;
  for (let s in sceneSounds) {
    sceneSounds[s].stop();
  }
  if (scene === 6 || scene === 7) {
    if (warningSound) {
      warningSound.stop();
      }
  }
  if (sceneSounds[scene]) {
    sceneSounds[scene].setVolume(0.5);

    if (scene >= 1 && scene <= 5) {
      sceneSounds[scene].loop();
    } else {
      sceneSounds[scene].play();
      }
    }
}

const TILE = 30;
const COLS = 20;
const ROWS = 11;
const GAME_MS = 60000; // 1 real minute
const TRANSLATE_MS = 1500;
const MOVE_MS = 100;
let scene = 1;
let introTranslated = false;
let translated = false;
let translationsLeft = 2;
let translationEnd = 0;
let startTime = 0;
let elapsed = 0;
let lastMove = 0;
let player = { x: 9, y: 9 };
let notice = "";
let noticeUntil = 0;

const stages = [
  // SCENE 2
  {
    jp: "都営大江戸線",
    en: "Oedo Line",
    taskJP: "エスカレーターを探してください",
    taskEN: "Find the escalator",
    correct: 0,
    signs: [
      ["エスカレーター", "Escalator"],
      ["出口", "Exit"],
      ["バスのりば", "Bus stop"],
      ["ファミリーマート", "Family Mart"]
    ]
  },

  // SCENE 3
  {
    jp: "乗り換え通路",
    en: "Transfer Passage",
    taskJP: "連絡通路を探してください",
    taskEN: "Find the connecting passage",
    correct: 2,
    signs: [
      ["東口", "East exit"],
      ["丸の内線", "Marunochi Line"],
      ["連絡通路", "Connecting passage"],
      ["西口", "West Exit"]
    ]
  },

  // SCENE 4
  {
    jp: "JR線方面",
    en: "Toward JR Lines",
    taskJP: "JR線への案内を探してください",
    taskEN: "Follow signs to JR Lines",
    correct: 1,
    signs: [
      ["東口", "East exit"],
      ["JR線", "JR Lines"],
      ["バスのりば", "Bus stop"],
      ["京王線", "Keio Line"]
    ]
  },

  // SCENE 5
  {
    jp: "JR線ホーム",
    en: "JR Platforms",
    taskJP: "信濃町方面・十三番線を探してください",
    taskEN: "Find Platform 13 toward Shinanomachi",
    correct: 2,
    signs: [
      [
        "11・12番線\n中央線快速",
        "11–12\nChuo Rapid"
      ],
      [
        "14番線\n山手線",
        "14\nYamanote Line"
      ],
      [
        "13番線\n中央・総武線",
        "13\nChuo-Sobu Local"
      ],
      [
        "15・16番線\n埼京線",
        "15–16\nSaikyo Line"
        ]
        ]
    }

  
];

function setup() {
  createCanvas(600, 640);
  textFont("sans-serif");
}

const layouts = [
  // SCENE 2 - OEDO LINE
  [
    "11111111111111111111",
    "11A1111B1111C1111D11",
    "11011110111101111011",
    "11011110111101111011",
    "11011110111101111011",
    "11011110111101111011",
    "11000000011000000011",
    "11110111111111101111",
    "11110111111111101111",
    "111100000P0000001111",
    "11111111111111111111"
  ],

  // SCENE 3 TRANSFER PASSAGE
  [
    "11111111111111111111",
    "110A111B0111C1111D11",
    "11011111011100111011",
    "11011110011110111011",
    "11011110110000111011",
    "11011110110111111011",
    "11000000110000000011",
    "11110111111111101111",
    "11110111111111101111",
    "111100000P0000001111",
    "11111111111111111111"
  ],

  // SCENE 4  JR LINES
  [
    "11111111111111111111",
    "11A1111B1111C1111D11",
    "11011110111101111011",
    "11011110111101111011",
    "11011110111101111011",
    "11011110111101111011",
    "11000000111100000011",
    "11110111111111101111",
    "11110111111111101111",
    "111100000P0000001111",
    "11111111111111111111"
  ],

  // SCENE 5 - JR PLATFORMS
  [
    "11111111111111111111",
    "11A1111B1111C1111D11",
    "11011110111101111011",
    "11011110111101111011",
    "11011110111101111011",
    "11011110111101111011",
    "11000000000000000011",
    "11110111111111101111",
    "11110111111111101111",
    "111100000P0000001111",
    "11111111111111111111"
  ]
];



function draw() {
  background("#172033");
  if (scene === 1) {
  drawIntro();
    return;
      }
  if (scene === 6 || scene === 7) {
    drawEnding();
    return;
  }

  // UPDATE TIMER
  elapsed = millis() - startTime;

// 時間を確認する
  if (elapsed >= GAME_MS) {
    elapsed = GAME_MS;
    scene = 7;
    playSceneSound();
    drawEnding();
    return;
  }


 checkWarningSound();
  if (translated && millis() >= translationEnd) {
    translated = false;
  }

if (notice && millis() > noticeUntil) {
    notice = "";
  }

movePlayer();
  if (scene === 6) {
   drawEnding();
  return;
  }

drawMaze();
drawPlayer();
drawSigns();
drawPanel();

// DRAW RED WARNING ON TOP OF EVERYTHING
drawWarningText();
}

// SCENE 1---------------------------------------------
function drawIntro() {
background("#F3F4F0");
noStroke();
fill("#34B334");
rect(0, 0, width, 120);
fill("white");
textAlign(LEFT, CENTER);
textStyle(BOLD);
textSize(33);
text(
  introTranslated
    ? "Shinjuku Station"
    : "新宿駅",
    25, 60
  );
textSize(18);
text("SHINJUKU STATION", 25, 96);
textAlign(RIGHT, CENTER);
textSize(14);
text("08:38", 570, 25);
fill("#CE045B");
circle(100, 192, 66);
fill("white");
circle(100, 192, 47);
fill("#172033");
textAlign(CENTER, CENTER);
textSize(26);
text("E", 100, 192);
stroke("#365745");
strokeWeight(4);
line(210, 192, 390, 192);
line(375, 181, 390, 192);
line(375, 203, 390, 192);
noStroke();
fill("#FFD700");
rect(460, 160, 68, 64, 8);
fill("white");
rect(466, 166, 56, 52, 5);
fill("#172033");
textSize(24);
text("JB", 494, 192);

//TRANSLATIONS (AI TAUGHT) ------------------------------------
textSize(12);
textStyle(NORMAL);
  text(
  introTranslated
   ? "Toei Oedo Line"
      : "都営大江戸線",
    100, 245
 );

text(
  introTranslated
    ? "Chuo-Sobu Line"
    : "中央・総武線",
    494, 245
);

fill("#172033");
textAlign(LEFT, TOP);
textStyle(BOLD);
textSize(22);
text(
  introTranslated
  ? "Catch the 8:49 train!"
   : "8:49の電車に間に合え！",
    30, 292
);
textStyle(NORMAL);
textSize(14);
textLeading(24);
 const instructions = introTranslated
    ? "You have 1 real minute to transfer from the Oedo Line\n" +
      "to the Chuo-Sobu Local Line toward Shinanomachi.\n" +
      "Follow station signs. Wrong routes lead to dead ends.\n" +
      "You have only TWO 1.5-second translations."
    : "大江戸線から中央・総武線（各駅停車）に乗り換え、\n" +
      "信濃町方面の8:49の電車を目指してください。\n" +
      "案内標識を読み、正しい通路を探しましょう。\n" +
      "翻訳は2回、各1.5秒間だけ使用できます。";

text(instructions, 30, 340);
fill("white");
stroke("#CDD5CD");
rect(25, 464, 550, 72, 8);
noStroke();
fill("#172033");
textStyle(BOLD);
textSize(22);
textAlign(LEFT, CENTER);
text("08:49", 45, 501);
textAlign(RIGHT, CENTER);
textSize(16);
text(
  introTranslated
  ? "Shinanomachi Station"
    : "信濃町駅",
    550, 501
  );

// TRANSLATE AT START BUTTON--------------------------
fill("#172033");
rect(170, 558, 260, 52, 8);
fill("white");
textAlign(CENTER, CENTER);
textSize(16);
text(
 introTranslated
    ? "Press SPACE to start"
   : "TRANSLATE",
    300, 584);
  }

// DRAW MAZE: AI ASSISTED  
function drawMaze() {
  const cells = layouts[scene - 2];
  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      const tile = cells[y][x];
      stroke("#BFC7C7");
      strokeWeight(1);
      if (tile === "1") {
        fill("#243347");
      } else {
        fill("#F1F2ED");
    }

      rect(
        x * TILE,
        y * TILE,
        TILE,
        TILE
      );

      if (/[A-D]/.test(tile)) {
        noStroke();
        fill("#42618B");
        rect(
          x * TILE + 4,
          y * TILE + 4,
          TILE - 8,
          TILE - 8,
          4
        );
        fill("white");
        textAlign(CENTER, CENTER);
        textStyle(BOLD);
        textSize(13);
        text(
          "?",
          x * TILE + 15,
          y * TILE + 15
        );
      }
    }
  }
}

// PLAYER
function drawPlayer() {
  noStroke();
  fill("#FFD84D");
  circle(
    player.x * TILE + 15,
    player.y * TILE + 15,
    24
);
fill("#172033");
  circle(
  player.x * TILE + 11,
    player.y * TILE + 12,
    3
);
circle(
  player.x * TILE + 19,
  player.y * TILE + 12,
    3
    );
}

// DRAW SIGNS-------------------------------------------
function drawSigns() {
  const stage = stages[scene - 2];
  const exits = [2, 7, 12, 17];
  exits.forEach((x, i) => {
    const distance =
      abs(player.x - x) +
      abs(player.y - 6);
    if (distance > 5) {
      return;
  }
const sign = stage.signs[i][translated ? 1 : 0];
const px = x * TILE + TILE / 2;
const py = 128;
fill("#244A77");
stroke("#E5E7E8");
strokeWeight(1);
  rect(
    px - 66,
    py - 29,
    132, 54, 5
   );

noStroke();
  fill("white");
  textAlign(CENTER, CENTER);
  textStyle(BOLD);
    textSize(sign.length > 15 ? 10 : 11);

    text(
      "↑ " + sign,
      px - 62,
      py - 25,
      124, 46
    );
    });
  }

// BOTTOM INFORMATION PANEL----------------------------
function drawPanel() {
  const stage = stages[scene - 2];
  noStroke();
  fill("#172033");
  rect(0, 340, width, 300);
  fill("#34B334");
  rect(0, 340, width, 65);
  fill("white");
  textAlign(LEFT, CENTER);
  textStyle(BOLD);
  textSize(19);
  text(
    translated ? stage.en : stage.jp,
    18, 373
  );

// COUNTDOWN-------------------------------------------
fill("#172033");
rect(425, 350, 156, 44, 5);
fill("white");
textAlign(CENTER, CENTER);
textSize(22);
text(stationClock(), 503, 372);
textAlign(LEFT, TOP);
textStyle(NORMAL);
fill("#BBD3F3");
textSize(12);
  text(
    translated
      ? "CURRENT OBJECTIVE"
      : "現在の目標",
    20, 423
 );
  fill("white");
  textStyle(BOLD);
  textSize(17);
  text(
    translated
      ? stage.taskEN
      : stage.taskJP,
    20, 446, 560, 46
  );

// WRONG WAY---------------------------------
  fill("#FFD84D");
  textSize(13);
  textStyle(NORMAL);
  text(
    notice,
    20, 502, 555, 38
  );
  if (
    translationsLeft > 0 &&
    !translated
  ) {
    fill("#FFD84D");
  } else {
    fill("#8590A0");
    }

  rect(387, 551, 193, 47, 7);
  fill("#172033");
  textAlign(CENTER, CENTER);
  textStyle(BOLD);
  textSize(14);

if (translated) {
   const remaining = max(0,
      ceil((translationEnd - millis()) / 1000)
    );

    text(
      "ENGLISH: " + remaining + "s",
      483, 575
    );
  } else {
    text(
      translationsLeft
        ? "TRANSLATE"
        : "NO TRANSLATIONS",
      483, 575
    );
  }

  fill("white");
  textAlign(LEFT, CENTER);
  textStyle(NORMAL);
  textSize(13);

  text(
    "Translations left: " + translationsLeft,
    20, 574
  );

  fill("#BBD3F3");
  textSize(12);

  text(
    "Departure 08:49  •  Arrow keys: move  •  R: restart",
    20, 621
  );
}

// ACCELERATED STATION CLOCK
function stationClock() {
  const gameSeconds = min(
    660,
    floor(elapsed * 660 / GAME_MS)
  );

  const total =
    8 * 3600 +
    38 * 60 +
    gameSeconds;

  const stationHour = floor(total / 3600);
  const stationMinute = floor(total / 60) % 60;
  const stationSecond = total % 60;

  return (
    nf(stationHour, 2) + ":" +
    nf(stationMinute, 2) + ":" +
    nf(stationSecond, 2)
  );
}

// PLAYER MOVEMENT
function movePlayer() {
  if (millis() - lastMove < MOVE_MS) {
    return;
  }

  let nx = player.x;
  let ny = player.y;

  if (keyIsDown(LEFT_ARROW)) {
    nx--;
  } else if (keyIsDown(RIGHT_ARROW)) {
    nx++;
  } else if (keyIsDown(UP_ARROW)) {
    ny--;
  } else if (keyIsDown(DOWN_ARROW)) {
    ny++;
  } else {
    return;
  }

  const cells = layouts[scene - 2];

  if (
    ny < 0 ||
    ny >= ROWS ||
    nx < 0 ||
    nx >= COLS
  ) {
    return;
  }

  // CHECK WALLS
  if (cells[ny][nx] === "1") {
    return;
  }

  player.x = nx;
  player.y = ny;
  lastMove = millis();
  const tile = cells[ny][nx];
  if (/[A-D]/.test(tile)) {
    const branch = tile.charCodeAt(0) - 65;
    if (branch === stages[scene - 2].correct) {

    
  if (scene === 5) {
    scene = 6;
    playSceneSound();
      }

  else {
    scene++;
     playSceneSound();
      player = { x: 9, y: 9 };
      notice = "";
      lastMove = millis();
      }

    } else {
      notice = translated
        ? "Dead end! Turn around."
        : "行き止まり！戻ってください。";
      noticeUntil = millis() + 2500;
      }
    }
  
}

// MOUSE INTERACTION---------------------------------
function mousePressed() {
  // START AUDIO ON FIRST CLICK
  if (!audioStarted) {
    userStartAudio();
    audioStarted = true;
    playSceneSound();
  }
  if (
    scene === 1 &&
    !introTranslated &&
    mouseX >= 170 &&
    mouseX <= 430 &&
    mouseY >= 558 &&
    mouseY <= 610
    ) {
    introTranslated = true;
  }
    
  else if (
    scene >= 2 &&
    scene <= 5 &&
    mouseX >= 387 &&
    mouseX <= 580 &&
    mouseY >= 551 &&
    mouseY <= 598 &&
    translationsLeft > 0 &&
    !translated
  ) {
    translationsLeft--;
    translated = true;
    translationEnd = millis() + TRANSLATE_MS;
    notice = "";
  }
}

// KEYBOARD INTERACTION-----------------------------
function keyPressed() {
  if (
    scene === 1 &&
    introTranslated &&
    key === " "
  ) {
    if (!audioStarted) {
      userStartAudio();
      audioStarted = true;
    }
    scene = 2;
    warningPlayed = false;
    playSceneSound();
    startTime = millis();
    elapsed = 0;
    player = { x: 9, y: 9 };

    translationsLeft = 2;
    translated = false;
    notice = "";
    lastMove = millis();


  }

// RESTART------------------------------------------
 if (key === "r" || key === "R") {
    restart();
  }

  if (
    [
      LEFT_ARROW,
      RIGHT_ARROW,
      UP_ARROW,
      DOWN_ARROW,
      32
    ].includes(keyCode)
  ) {
    return false;
  }
}

//RESTART GAME---------------------------------------------
function restart() {
  scene = 1;
  playSceneSound();
    warningPlayed = false;
warningSound.stop();
  warningPlayed = false;
  introTranslated = false;
    translated = false;
  translationsLeft = 2;
  translationEnd = 0;
  elapsed = 0;
  startTime = 0;
warningTextUntil = 0;
  player = { x: 9, y: 9 };
  notice = "";
  lastMove = millis();
}

function drawEnding() {
  background("#172033");
  textAlign(CENTER, CENTER);
  noStroke();
  textStyle(BOLD);
  if (scene === 6) {
    fill("#FFD84D");
  } else {
    fill("#FF7777");
  }

  textSize(32);
  text(
    scene === 6
      ? "13番線に到着！"
      : "電車が出発しました",
    300, 220
  );

  fill("whitrre");
  textSize(21);
    text(
    scene === 6
      ? "You reached the correct platform!"
      : "You missed the 8:49 train!",
    300, 280
  );
  textStyle(NORMAL);
  textSize(17);
  text(
    scene === 6
      ? "Arrival: " + stationClock()
      : "Try using your translations at the junctions.",
    300, 340
  );

  text(
    "Press R to restart",
    300, 470
  );
}
