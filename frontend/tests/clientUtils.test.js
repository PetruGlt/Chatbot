/**
 * @jest-environment jsdom
 */
const {
  setUserSentMessage,
  hasUserSentMessage,
  scrollToBottom,
  buildMessageElement,
  getAnswer,
  setValidationMap
} = require('./clientUtils');

describe('Flag mesaj utilizator', () => {
  beforeEach(() => {
    const store = {};
    global.sessionStorage = {
      getItem: key => store[key] || null,
      setItem: (key, value) => store[key] = value.toString(),
      removeItem: key => delete store[key],
      clear: () => Object.keys(store).forEach(key => delete store[key])
    };
  });

  test('Implicit, utilizatorul NU a trimis mesaj', () => {
    expect(hasUserSentMessage()).toBe(false);
  });

  test('Seteaza ca utilizatorul a trimis mesaj', () => {
    setUserSentMessage(true);
    expect(hasUserSentMessage()).toBe(true);
  });

  test('Seteaza ca utilizatorul NU a trimis mesaj', () => {
    setUserSentMessage(false);
    expect(hasUserSentMessage()).toBe(false);
  });
});

describe('DOM: scrollToBottom', () => {
  test('face scroll daca exista conversatia', () => {
    document.body.innerHTML = `<div class="conversation" style="height:100px; overflow:auto;"></div>`;
    const conv = document.querySelector('.conversation');
    conv.scrollHeight = 500;
    scrollToBottom();
    expect(conv.scrollTop).toBe(conv.scrollHeight);
  });

  test('nu face eroare daca conversatia nu exista', () => {
    document.body.innerHTML = `<div class="altceva"></div>`;
    expect(() => scrollToBottom()).not.toThrow();
  });
});

describe('buildMessageElement', () => {
  test('creeaza structura completa a mesajului', () => {
    const { message, answerEl } = buildMessageElement('Ce este soldul?', '45');

    expect(message).toBeInstanceOf(HTMLElement);
    expect(message.dataset.conversationId).toBe('45');
    expect(message.querySelector('.question').textContent).toBe('Q: Ce este soldul?');
    expect(answerEl.textContent).toBe('Waiting for response...');
    expect(answerEl.dataset.validation).toBe("0");
  });
});

describe('getAnswer', () => {
  beforeEach(() => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ answer: "Raspuns testat" })
      })
    );
  });

  test('apeleaza fetch si actualizeaza validarea in Map', async () => {
    // 1. Cream elementul de raspuns
    const answerEl = document.createElement('article');
    answerEl.className = "message answer";

    // 2. Cream div-ul mesaj
    const msgDiv = document.createElement('div');
    msgDiv.className = 'message';
    msgDiv.appendChild(answerEl);

    // 3. Construim map-ul exact cu acel div
    const validationObj = { answerElement: answerEl, validation: "initial" };
    const map = new Map();
    map.set(msgDiv, validationObj);

    // 4. Injectam map-ul
    setValidationMap(map);

    // 5. Rulam functia testata
    await getAnswer({
      username: 'user1',
      conversationId: '10',
      question: 'Ce este IBAN?'
    }, answerEl, msgDiv);

    // 6. Verificam ca valorile din map s-au modificat
    expect(validationObj.validation).toBe("0");
    expect(answerEl.textContent).toBe('A: Raspuns testat');
    expect(answerEl.dataset.question).toBe('Ce este IBAN?');
  });
});
