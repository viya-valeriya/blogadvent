import React, { useEffect, useMemo, useState } from 'react';
import {
  Lock, Sparkles, X, Gift,
  Coffee, CloudSun, Heart, Feather, Compass, Cat, Shield,
  Smile, ShoppingBag, BatteryCharging, Wind, Clock,
  BookOpen, Rocket, Crown, Users, Puzzle, PartyPopper,
  Music, Sun, Star
} from 'lucide-react';

// =====================================================
// BLOGADVENT v1 — версия БЕЗ Firebase (localStorage)
// =====================================================
const STORAGE_PREFIX = 'viya-blogadvent';
const STORAGE_KEY = `${STORAGE_PREFIX}:openedDays`;

// --- ТЕМА (Luxury Dark) ---
const THEME = {
  gold: '#D4AF37',
  paleGold: '#E5D0A1',
  darkGold: '#8A7E57',
  charcoal: '#1A1A1A',
  obsidian: '#0a0a0a',
};

// --- ПОЖЕЛАНИЯ ---
const WISHES_POOL = [
  "Не торопи себя сегодня. Жизнь не убегает.",
  "Некоторые дни не про результат. Они про то, чтобы прожить. Насладись каждым моментом.",
  "Ты имеешь право быть в процессе, даже если он выглядит неидеально.",
  "Сегодня можно ничего в себе не \"чинить\" и не \"прорабатывать\".",
  "Понимание не всегда приходит первым. Иногда сначала нужно пройти путь.",
  "Пусть сегодня будет меньше мыслей о «как правильно».",
  "Ты имеешь право не знать, куда идёшь, и всё равно идти.",
  "Иногда рост начинается с того, что перестаёшь себя ломать.",
  "Можно быть мягкой и при этом устойчивой.",
  "Сегодня можно не справляться идеально.",
  "Некоторые решения приходят только в паузе.",
  "Быть непонятной — не всегда ошибка. Иногда это дар.",
  "Иногда пауза — это форма движения.",
  "Сегодня можно выбрать себя без объяснений.",
  "Не все вопросы требуют немедленного ответа.",
  "Сегодня можно не расти.",
  "Быть сильной не всегда означает продолжать.",
  "Забота о себе иногда начинается с признания предела.",
  "Пусть сегодня будет больше ощущений, чем доказательств.",
  "Ценность не всегда измеряется действиями.",
  "Некоторые пути начинаются с отказа терпеть.",
  "Пусть сегодняшний день будет про «как я», а не «что от меня ждут».",
  "Выдерживать — не единственный способ быть взрослой.",
  "Спокойствие тоже может быть достижением.",
  "Сегодня можно не уговаривать себя.",
  "Сомнения не отменяют движения.",
  "Не все выборы делаются раз и навсегда.",
  "Отказ может быть формой уважения.",
  "Пусть сегодня будет меньше сравнений.",
  "Чувствование не обязано быть логичным.",
  "Ясность часто приходит после отдыха.",
  "Пусть внутри станет тише.",
  "Иногда восстановление выглядит как тишина.",
  "Сегодня можно не переделывать себя.",
  "Потенциал — это не обязательство.",
  "Некоторые дни про согласие, а не про усилие.",
  "Пусть сегодняшний день будет мягче к тебе.",
  "Можно быть разной и не объяснять никому почему.",
  "Фраза «я так больше не хочу» иногда открывает новую точку. Что ты больше не хочешь?",
  "Сегодня можно быть живой, а не правильной.",
  "Отдых не всегда награда. Отдых - это необходимость.",
  "Сегодня можно ослабить контроль.",
  "Благодарность не обязана быть обязательной.",
  "Сила иногда в выборе себя.",
  "Решения можно менять.",
  "Иногда достаточно не предавать себя.",
  "Усталость иногда указывает направление.",
  "Результат не всегда главный ориентир.",
  "Пусть будет меньше внутренней гонки.",
  "Обстоятельства не всегда нужно побеждать.",
  "Иногда забота — это убрать лишнее.",
  "Сегодня можно не стыдить себя.",
  "Не всё, что привычно, стоит сохранять.",
  "Пусть сегодняшний день будет без самообвинений.",
  "Выход из привычного дискомфорта — тоже прекрасный путь.",
  "Границы не требуют оправданий.",
  "Сегодня можно не знать, что дальше.",
  "Целостность не равна совершенству.",
  "«Лучшая версия» — не обязательна. Достаточно быть настоящей.",
  "Прошлая версия тебя — не эталон.",
  "Пауза — не выпадение из жизни.",
  "Давление не ускоряет рост.",
  "Честность с собой — уже работа.",
  "Ценность не начинается с будущего. Ценность начинается сейчас",
  "Бережность — тоже стратегия.",
  "Не все ответы приходят сразу. Это ок",
  "Сегодня можно идти медленнее.",
  "Некоторые точки — не финиш, а передышка."
];

// --- ИЛЛЮСТРАЦИИ ---
const getThematicIllustration = (text) => {
  const props = {
    size: 40,
    strokeWidth: 1,
    className: "text-[#D4AF37] drop-shadow-[0_0_8px_rgba(212,175,55,0.4)]"
  };
  const lowerText = (text || '').toLowerCase();

  if (lowerText.includes("кофе") || lowerText.includes("чай") || lowerText.includes("уют")) return <Coffee {...props} />;
  if (lowerText.includes("солнце") || lowerText.includes("свет") || lowerText.includes("огоньки")) return <Sun {...props} />;
  if (lowerText.includes("сердце") || lowerText.includes("любовь") || lowerText.includes("обними")) return <Heart {...props} />;
  if (lowerText.includes("снег") || lowerText.includes("тишин") || lowerText.includes("декабрь")) return <CloudSun {...props} />;
  if (lowerText.includes("творчеств") || lowerText.includes("вдохнов") || lowerText.includes("мечтать")) return <Feather {...props} />;
  if (lowerText.includes("пазл") || lowerText.includes("решение")) return <Puzzle {...props} />;
  if (lowerText.includes("защит") || lowerText.includes("опоры")) return <Shield {...props} />;
  if (lowerText.includes("покупк") || lowerText.includes("магазин")) return <ShoppingBag {...props} />;
  if (lowerText.includes("энерги") || lowerText.includes("сил")) return <BatteryCharging {...props} />;
  if (lowerText.includes("улыб") || lowerText.includes("радость") || lowerText.includes("счастлив")) return <Smile {...props} />;
  if (lowerText.includes("ветер") || lowerText.includes("воздух") || lowerText.includes("дыши")) return <Wind {...props} />;
  if (lowerText.includes("время") || lowerText.includes("минут") || lowerText.includes("часы")) return <Clock {...props} />;
  if (lowerText.includes("книг") || lowerText.includes("чита") || lowerText.includes("истори")) return <BookOpen {...props} />;
  if (lowerText.includes("шаг") || lowerText.includes("вперед") || lowerText.includes("старт")) return <Rocket {...props} />;
  if (lowerText.includes("путь") || lowerText.includes("направлени") || lowerText.includes("компас")) return <Compass {...props} />;
  if (lowerText.includes("чудо") || lowerText.includes("маги") || lowerText.includes("волшебство")) return <Sparkles {...props} />;
  if (lowerText.includes("достижение") || lowerText.includes("побед") || lowerText.includes("гордишься")) return <Crown {...props} />;
  if (lowerText.includes("праздник") || lowerText.includes("вечерин") || lowerText.includes("ёлку")) return <PartyPopper {...props} />;
  if (lowerText.includes("друг") || lowerText.includes("коллег") || lowerText.includes("люд")) return <Users {...props} />;
  if (lowerText.includes("музык")) return <Music {...props} />;

  return <Gift {...props} />;
};

// --- helpers ---
function loadOpenedDays() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function saveOpenedDays(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // ignore
  }
}

export default function LuxuryAdventCalendar() {
  const [openedDays, setOpenedDays] = useState({});
  const [modalData, setModalData] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);
  const [currentDate, setCurrentDate] = useState(1);

  // Определяем доступный день по реальной дате
  useEffect(() => {
    const now = new Date();
    const month = now.getMonth(); // 0..11
    const day = now.getDate();

    if (month < 11) setCurrentDate(0);     // до декабря
    else if (month === 11) setCurrentDate(day); // декабрь
    else setCurrentDate(31);               // январь и дальше
  }, []);

  // Загружаем прогресс из localStorage
  useEffect(() => {
    setOpenedDays(loadOpenedDays());
  }, []);

  // Авто-скрытие тоста
  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => setToastMessage(null), 3000);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  const daysGrid = useMemo(() => Array.from({ length: 31 }, (_, i) => i + 1), []);

  const handleDayClick = (dayNumber) => {
    // Будущее — показываем тост
    if (dayNumber > currentDate) {
      setToastMessage("Этот день ещё покрыт тайной");
      return;
    }

    // Уже открыто — показать то же
    if (openedDays[dayNumber]) {
      setModalData({ day: dayNumber, text: openedDays[dayNumber], isNew: false });
      return;
    }

    // Выбор случайного пожелания без повторов
    const receivedWishes = Object.values(openedDays);
    const availableWishes = WISHES_POOL.filter(w => !receivedWishes.includes(w));
    const pool = availableWishes.length > 0 ? availableWishes : WISHES_POOL;
    const randomWish = pool[Math.floor(Math.random() * pool.length)];

    const updated = { ...openedDays, [dayNumber]: randomWish };
    setOpenedDays(updated);
    saveOpenedDays(updated);

    setModalData({ day: dayNumber, text: randomWish, isNew: true });
  };

  const closeModal = () => setModalData(null);

  return (
    <div className="min-h-screen w-full flex flex-col items-center relative overflow-x-hidden bg-[#050505] text-[#E5D0A1] selection:bg-[#D4AF37] selection:text-black">

      {/* BACKGROUND */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#1a1a1a] via-[#0a0a0a] to-black opacity-80"></div>
      </div>

      {/* HEADER */}
      <header className="w-full max-w-lg p-8 flex flex-col items-center text-center mt-8 relative z-10">
        <div className="mb-6 opacity-80">
          <div className="border border-[#D4AF37]/20 px-4 py-1.5 rounded-full backdrop-blur-sm bg-black/30">
            <span className="text-[10px] uppercase tracking-[0.3em] font-serif text-[#D4AF37]">
              Почувствуй декабрь тёплым
            </span>
          </div>
        </div>

        <h1 className="text-4xl md:text-1xl font-serif font-thin mb-3 text-transparent bg-clip-text bg-gradient-to-b from-[#E5D0A1] to-[#8A7E57] tracking-wide">
          Адвент календарь, который ты заслужила
        </h1>
        <p className="text-sm font-light text-[#8A7E57] tracking-widest uppercase mt-2">
          31 день маленьких радостей
        </p>
      </header>

      {/* GRID */}
      <main className="w-full max-w-lg p-6 pb-24 relative z-10">
        <div className="grid grid-cols-4 gap-3 md:gap-4">
          {daysGrid.map((day) => {
            const isFuture = day > currentDate;
            const isOpened = !!openedDays[day];

            return (
              <button
                key={day}
                onClick={() => handleDayClick(day)}
                className={`
                  aspect-square relative group transition-all duration-500 ease-out
                  flex flex-col items-center justify-center
                  border backdrop-blur-sm
                  ${isFuture
                    ? 'border-[#333] bg-white/[0.02] cursor-not-allowed opacity-50 grayscale'
                    : 'cursor-pointer hover:bg-white/[0.05] hover:border-[#D4AF37]/40 hover:shadow-[0_0_15px_rgba(212,175,55,0.15)] active:scale-95'
                  }
                  ${isOpened
                    ? 'border-[#D4AF37]/50 bg-black/40'
                    : isFuture ? '' : 'border-white/10'
                  }
                `}
              >
                {!isFuture && (
                  <div className="absolute inset-1 border border-white/5 pointer-events-none"></div>
                )}

                <span
                  className={`
                    font-serif text-xl md:text-2xl transition-all duration-300
                    ${isFuture ? 'text-[#333]' : 'text-[#E5D0A1]'}
                    ${isOpened ? 'drop-shadow-[0_0_5px_rgba(212,175,55,0.5)]' : ''}
                  `}
                >
                  {day}
                </span>

                <div className="absolute bottom-2 md:bottom-3 transition-opacity duration-300">
                  {isFuture && (
                    <Lock size={10} className="text-[#333]" />
                  )}
                  {isOpened && (
                    <Star size={10} className="text-[#D4AF37] fill-[#D4AF37] animate-[pulse_3s_infinite]" />
                  )}
                </div>

                {isOpened && (
                  <>
                    <div className="absolute top-0 left-0 w-1.5 h-1.5 border-t border-l border-[#D4AF37]"></div>
                    <div className="absolute bottom-0 right-0 w-1.5 h-1.5 border-b border-r border-[#D4AF37]"></div>
                  </>
                )}
              </button>
            );
          })}
        </div>

        {/* Пульт для теста (только локально) */}
        <div className="mt-8 flex items-center justify-between gap-3 text-xs text-[#8A7E57]">
          <span className="font-serif italic">Debug</span>
          <div className="flex items-center gap-2">
            <button
              className="px-3 py-1 border border-[#D4AF37]/20 hover:border-[#D4AF37]/40"
              onClick={() => setCurrentDate((v) => Math.max(0, v - 1))}
              type="button"
            >
              - день
            </button>
            <span className="px-3 py-1 border border-white/10 bg-black/30">
              доступно: {currentDate}
            </span>
            <button
              className="px-3 py-1 border border-[#D4AF37]/20 hover:border-[#D4AF37]/40"
              onClick={() => setCurrentDate((v) => Math.min(31, v + 1))}
              type="button"
            >
              + день
            </button>
            <button
              className="px-3 py-1 border border-white/10 hover:border-white/20"
              onClick={() => { setOpenedDays({}); saveOpenedDays({}); }}
              type="button"
            >
              сбросить прогресс
            </button>
          </div>
        </div>
      </main>

      {/* TOAST */}
      {toastMessage && (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[60] animate-in fade-in zoom-in duration-500">
          <div className="bg-[#111] border border-[#D4AF37]/30 text-[#E5D0A1] px-8 py-4 shadow-[0_0_30px_rgba(0,0,0,0.8)] flex items-center gap-3">
            <div className="h-px w-8 bg-[#D4AF37]/50"></div>
            <span className="font-serif italic text-sm tracking-wide">{toastMessage}</span>
            <div className="h-px w-8 bg-[#D4AF37]/50"></div>
          </div>
        </div>
      )}

      {/* MODAL */}
      {modalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-md transition-opacity duration-700"
            onClick={closeModal}
          ></div>

          <div
            className="
              relative w-full max-w-sm p-[1px] bg-gradient-to-b from-[#D4AF37]/40 via-[#8A7E57]/10 to-transparent
              shadow-[0_20px_50px_rgba(0,0,0,0.9)]
              animate-in fade-in slide-in-from-bottom-8 duration-700
            "
          >
            <div className="bg-[#0f0f0f] p-8 md:p-12 flex flex-col items-center text-center relative overflow-hidden">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-[#D4AF37] opacity-5 blur-[80px] rounded-full"></div>

              <button
                onClick={closeModal}
                className="absolute top-4 right-4 text-[#8A7E57] hover:text-[#E5D0A1] transition-colors"
                type="button"
              >
                <X size={20} strokeWidth={1} />
              </button>

              <h3 className="text-[#8A7E57] font-serif text-lg italic mb-6">
                {modalData.day} декабря
              </h3>

              <div className="mb-8 transform transition-transform duration-1000 hover:scale-110">
                {getThematicIllustration(modalData.text)}
              </div>

              <div className="relative">
                <span className="absolute -top-4 -left-2 text-4xl font-serif text-[#D4AF37] opacity-20">“</span>

                <p className="text-lg md:text-xl font-light leading-relaxed text-[#f0f0f0] font-serif">
                  {modalData.text}
                </p>

                <span className="absolute -bottom-6 -right-2 text-4xl font-serif text-[#D4AF37] opacity-20">”</span>
              </div>

              <div className="w-16 h-px bg-gradient-to-r from-transparent via-[#D4AF37]/50 to-transparent mt-10 mb-8"></div>

              <button
                onClick={closeModal}
                className="
                  px-8 py-2 border border-[#D4AF37]/30 text-[#D4AF37] text-xs uppercase tracking-[0.2em]
                  hover:bg-[#D4AF37] hover:text-black transition-all duration-500
                "
                type="button"
              >
                Принять
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
