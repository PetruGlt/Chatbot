/**
 * @jest-environment jsdom
 */
const {
  getExpertId,
  buildQACard,
  submitAnswer,
  reloadContent
} = require('./expertUtils');

describe('getExpertId', () => {
  test('extrage ID numeric corect', () => {
    expect(getExpertId('expert123')).toBe('Expert ID: #123');
  });

  test('returneaza null daca nu exista username', () => {
    expect(getExpertId(null)).toBeNull();
  });

  test('returneaza null daca username nu contine cifre', () => {
    expect(getExpertId('expertABC')).toBeNull();
  });
});

describe('buildQACard', () => {
  test('creeaza elementul HTML corect', () => {
    const mockQA = { id: 5, question: "Ce este un card?", answer: "Este un instrument de plata." };
    const onSubmit = jest.fn();
    const card = buildQACard(mockQA, onSubmit);

    expect(card).toBeInstanceOf(HTMLElement);
    expect(card.querySelector('h3').textContent).toBe('Q&A 5');
    expect(card.querySelector('textarea').value).toBe('Este un instrument de plata.');
  });

  test('apeleaza onSubmit la Enter', () => {
    const mockQA = { id: 10, question: "Test", answer: "Raspuns" };
    const onSubmit = jest.fn();
    const card = buildQACard(mockQA, onSubmit);

    const textarea = card.querySelector('textarea');
    textarea.value = "Nou raspuns";

    const event = new KeyboardEvent('keydown', {
      key: 'Enter',
      shiftKey: false,
      bubbles: true
    });

    textarea.dispatchEvent(event);
    expect(onSubmit).toHaveBeenCalledWith(10, 'Nou raspuns', card);
  });
});

describe('submitAnswer', () => {
  let originalAlert;

  beforeEach(() => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true })
      })
    );
    originalAlert = global.alert;
    global.alert = jest.fn();
  });

  afterEach(() => {
    global.alert = originalAlert;
  });

  test('trimite raspunsul si apeleaza reload', async () => {
    const card = document.createElement('div');
    const textarea = document.createElement('textarea');
    textarea.dataset.original = "initial";
    card.appendChild(textarea);

    const reloadFn = jest.fn();

    const result = await submitAnswer({
      id: 1,
      updatedAnswer: "modificat",
      elementToRemove: card,
      username: "expert1",
      reloadFn
    });

    expect(fetch).toHaveBeenCalled();
    expect(reloadFn).toHaveBeenCalled();
    expect(result).toBe(true);
  });

  test('alerteaza daca raspunsul este gol', async () => {
    const card = document.createElement('div');
    const textarea = document.createElement('textarea');
    card.appendChild(textarea);

    const result = await submitAnswer({
      id: 1,
      updatedAnswer: "",
      elementToRemove: card,
      username: "expert1",
      reloadFn: jest.fn()
    });

    expect(global.alert).toHaveBeenCalledWith("Answer cannot be empty!");
    expect(result).toBeUndefined();
  });
});

describe('reloadContent', () => {
  beforeEach(() => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve([
          { id: 1, question: "Q1", answer: "A1" },
          { id: 2, question: "Q2", answer: "A2" }
        ])
      })
    );
  });

  test('populeaza containerul cu carduri', async () => {
    const container = document.createElement('div');
    await reloadContent({
      username: 'expert1',
      qaListContainer: container,
      onSubmit: jest.fn()
    });

    const cards = container.querySelectorAll('.qa-card');
    expect(cards.length).toBe(2);
    expect(cards[0].querySelector('h3').textContent).toBe('Q&A 1');
  });

  test('afiseaza mesaj de eroare la fetch esuat', async () => {
    global.fetch = jest.fn(() =>
      Promise.reject(new Error("Server down"))
    );
    const container = document.createElement('div');
    await reloadContent({
      username: 'expert1',
      qaListContainer: container,
      onSubmit: jest.fn()
    });

    expect(container.textContent).toContain("Failed to load Q&A data.");
  });
});
