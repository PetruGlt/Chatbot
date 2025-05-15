/**
 * @jest-environment jsdom
 */

global.fetch = jest.fn();

describe('mainPageExperts.js', () => {
  let submitAnswer;

  beforeEach(() => {
    jest.resetModules();

    document.body.innerHTML = `
      <div id="qaList">
        <div class="qa-card">
          <h3>Q&A 1</h3>
          <p><strong>Q:</strong> Ce este JavaScript?</p>
          <textarea>Este un limbaj de programare.</textarea>
          <p class="hint">Press Enter to submit</p>
        </div>
      </div>
      <button id="logout"></button>
    `;

    delete window.location;
    window.location = { href: '' };

    Object.defineProperty(window, 'sessionStorage', {
      value: (() => {
        let store = {};
        return {
          getItem: jest.fn((key) => store[key] || null),
          setItem: jest.fn((key, val) => { store[key] = val; }),
          removeItem: jest.fn((key) => { delete store[key]; })
        };
      })(),
      configurable: true
    });

    jest.spyOn(window, 'alert').mockImplementation(() => {});
    global.fetch.mockReset();
  });

  test('afișează warning dacă username lipsește', async () => {
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    window.sessionStorage.getItem.mockReturnValueOnce(null);
    await import('./mainPageExperts.js');
    expect(warnSpy).toHaveBeenCalledWith('Lipsă username - utilizator neautentificat.');
    warnSpy.mockRestore();
  });

  test('afișează datele Q&A în pagină', () => {
    const qaCard = document.querySelector('.qa-card');
    expect(qaCard).not.toBeNull();
    expect(qaCard.textContent).toContain('Ce este JavaScript?');
  });

  test('Enter pe textarea declanșează submitAnswer()', () => {
    const card = document.querySelector('.qa-card');
    const textarea = card.querySelector('textarea');
    textarea.value = "Actualizat";
    const event = new KeyboardEvent("keydown", { key: "Enter" });
    textarea.dispatchEvent(event);
    expect(textarea.value).toBe("Actualizat");
  });

  test('submitAnswer funcționează și elimină cardul', async () => {
    submitAnswer = (await import('./mainPageExperts.js')).submitAnswer;
    const element = document.querySelector('.qa-card');
    const spy = jest.spyOn(element, 'remove');
    fetch.mockResolvedValueOnce({ ok: true, json: async () => ({}) });

    await submitAnswer(1, "Test Răspuns", element, "expert1");
    expect(fetch).toHaveBeenCalledWith("/qa/updateAnswer", expect.any(Object));
    expect(spy).toHaveBeenCalled();
  });

  test('submitAnswer afișează alertă la eroare de rețea', async () => {
    submitAnswer = (await import('./mainPageExperts.js')).submitAnswer;
    const element = document.querySelector('.qa-card');
    jest.spyOn(element, 'remove');
    fetch.mockRejectedValueOnce(new Error("Eroare rețea"));

    await submitAnswer(1, "Test", element, "expert1");
    expect(window.alert).toHaveBeenCalledWith(expect.stringContaining("Eroare la trimiterea răspunsului"));
    expect(element.remove).not.toHaveBeenCalled();
  });

  test('submitAnswer afișează alertă dacă fetch-ul nu e ok', async () => {
    submitAnswer = (await import('./mainPageExperts.js')).submitAnswer;
    const element = document.querySelector('.qa-card');
    jest.spyOn(element, 'remove');
    fetch.mockResolvedValueOnce({ ok: false });

    await submitAnswer(1, "Test", element, "expert1");
    expect(window.alert).toHaveBeenCalledWith(expect.stringContaining("Eroare la trimiterea răspunsului"));
    expect(element.remove).not.toHaveBeenCalled();
  });
});
