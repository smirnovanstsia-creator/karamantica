const TelegramBot = require("node-telegram-bot-api");

// --- Настройки ---
const token = "8315344869:AAFWb0GC-XLB4ydWx3FfnHzk8-Y0zPoOBaI"; // Твой токен
const adminId = 225867387; // Твой Telegram ID
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

// --- Старт команды ---
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const node = nodes.start;
  bot.sendMessage(chatId, node.text, {
    reply_markup: {
      inline_keyboard: node.options.map((opt) => [
        { text: opt.text, callback_data: opt.next },
      ]),
    },
  });
});

// --- Обработка нажатий кнопок ---
bot.on("callback_query", (query) => {
  const chatId = query.message.chat.id;
  const step = query.data;
  const node = nodes[step];
  if (!node) return;

  // Находим выбранный вариант у предыдущего узла
  const prevNode = Object.values(nodes).find((n) =>
    n.options.some((opt) => opt.next === step)
  );
  let selectedText = step; // на случай, если не найдём
  if (prevNode) {
    const opt = prevNode.options.find((o) => o.next === step);
    if (opt) selectedText = opt.text;
  }

  // Отправляем текст вопроса с кнопками
  if (node.options.length > 0) {
    bot.sendMessage(chatId, node.text, {
      reply_markup: {
        inline_keyboard: node.options.map((opt) => [
          { text: opt.text, callback_data: opt.next },
        ]),
      },
    });
  } else {
    bot.sendMessage(chatId, node.text);
  }

  // Отправляем **выбранный вариант** админу
  bot.sendMessage(adminId, `Ответ от ${chatId}: ${selectedText}`);

  // Удаляем прошлое сообщение с кнопками
  bot.deleteMessage(chatId, query.message.message_id);
});
