const TelegramBot = require("node-telegram-bot-api");

// --- Настройки ---
const token = "8315344869:AAFWb0GC-XLB4ydWx3FfnHzk8-Y0zPoOBaI"; // твой токен
const adminId = 225867387; // твой Telegram ID
const bot = new TelegramBot(token, { polling: true });

// --- Дерево вопросов ---
const nodes = {
  start: {
    text: "Что на ужин?",
    options: [
      { text: "Паста в сливочном соусе", next: "dinner_creamy" },
      { text: "Паста в томатном соусе", next: "dinner_tomato" },
    ],
  },
  dinner_creamy: {
    text: "Как готовить будем?",
    options: [
      { text: "Вместе с Саей", next: "music_choice" },
      { text: "Пусть Сая сама готовит!", next: "music_choice" },
    ],
  },
  dinner_tomato: {
    text: "Как готовить будем?",
    options: [
      { text: "Вместе с Саей", next: "music_choice" },
      { text: "Пусть Сая сама готовит!", next: "music_choice" },
    ],
  },
  music_choice: {
    text: "Какую музыку поставить?",
    options: [
      { text: "Какую я поставлю, такую и будем слушать", next: "watch_choice" },
      { text: "Пусть Сая выберет сама", next: "watch_choice" },
      { text: "Романтическую в сторону Барри Уайта", next: "watch_choice" },
      {
        text: "Энергичную в сторону Блэк Айд Пис и Дулы Пип",
        next: "watch_choice",
      },
      { text: "Ланку", next: "watch_choice" },
    ],
  },
  watch_choice: {
    text: "Что посмотрим?",
    options: [
      { text: "Фильм", next: "who_chooses" },
      { text: "Шоу", next: "who_chooses" },
    ],
  },
  who_chooses: {
    text: "Кто выбирает фильм/шоу?",
    options: [
      { text: "Я!", next: "ass_bite" },
      { text: "Сая", next: "ass_bite" },
    ],
  },
  ass_bite: {
    text: "За жепу кусь?",
    options: [
      { text: "Я тебя саму кусь", next: "end" },
      { text: "Да...", next: "end" },
    ],
  },
  end: {
    text: "Люблююю ❤️",
    options: [],
  },
};

// --- Генерация клавиатуры ---
function makeKeyboard(nodeKey) {
  const node = nodes[nodeKey];
  return {
    inline_keyboard: node.options.map((opt, idx) => [
      { text: opt.text, callback_data: `${nodeKey}::${idx}` },
    ]),
  };
}

// --- Старт ---
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, nodes.start.text, {
    reply_markup: makeKeyboard("start"),
  });
});

// --- Обработка кнопок ---
bot.on("callback_query", (query) => {
  const chatId = query.message.chat.id;
  const data = query.data.split("::");
  const nodeKey = data[0];
  const idx = parseInt(data[1], 10);

  const node = nodes[nodeKey];
  const choice = node.options[idx];
  if (!choice) return;

  const selectedText = choice.text;
  const nextStep = choice.next;

  // Удаляем старое сообщение
  bot.deleteMessage(chatId, query.message.message_id).catch(() => {});

  // Отправляем админу выбор
  bot.sendMessage(
    adminId,
    `Ответ от ${chatId}: ${node.text} → ${selectedText}`
  );

  // Отправляем следующий вопрос
  if (nodes[nextStep]) {
    bot.sendMessage(chatId, nodes[nextStep].text, {
      reply_markup: nodes[nextStep].options.length
        ? makeKeyboard(nextStep)
        : undefined,
    });
  }
});
