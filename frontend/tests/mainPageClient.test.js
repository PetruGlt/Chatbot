describe('mainPageClient.js', () => {
    beforeEach(() => {
      const sessionStorageMock = (() => {
        let store = {};
        return {
          getItem: jest.fn((key) => store[key] || null),
          setItem: jest.fn((key, value) => { store[key] = value.toString(); }),
          removeItem: jest.fn((key) => { delete store[key]; }),
          clear: jest.fn(() => { store = {}; }),
        };
      })();
      
      Object.defineProperty(window, 'sessionStorage', { value: sessionStorageMock });
      
      document.body.innerHTML = `
        <input id="questionInput" />
        <div id="chatBox"></div>
        <button id="sendBtn"></button>
        <button id="logout"></button>
        <button id="newConversation"></button>
        <button id="history"></button>
        <div id="welcome"></div>
      `;
      
      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ answer: 'Mock answer' }),
        })
      );
      
      delete window.location;
      window.location = { href: '' };
      jest.resetModules();
      require('mainPageClient.js');
    });
    
    test('initializes with default conversationId if none exists', () => {
      expect(sessionStorage.getItem).toHaveBeenCalledWith('conversationId');
      expect(sessionStorage.setItem).toHaveBeenCalledWith('conversationId', '1');
    });
    
    test('sendBtn click sends question and updates chat', () => {
      const questionInput = document.getElementById('questionInput');
      const sendBtn = document.getElementById('sendBtn');
      
      questionInput.value = 'Test question';
      sendBtn.click();
      
      expect(document.getElementById('chatBox').children.length).toBe(1);
      expect(fetch).toHaveBeenCalledWith('ask', expect.any(Object));
    });
    
    test('logoutBtn click clears session and redirects', () => {
      const logoutBtn = document.getElementById('logout');
      logoutBtn.click();
      
      expect(sessionStorage.removeItem).toHaveBeenCalledWith('username');
      expect(sessionStorage.removeItem).toHaveBeenCalledWith('conversationId');
      expect(window.location.href).toBe('client.html'); 
    });
    
    test('newConversationBtn increments conversationId and redirects', () => {
      const newConversationBtn = document.getElementById('newConversation');
      newConversationBtn.click();
      
      expect(sessionStorage.setItem).toHaveBeenCalledWith('conversationId', '2');
      expect(window.location.href).toBe('MainPage.html');
    });
    
    test('historyBtn redirects to showHistory', () => {
      const historyBtn = document.getElementById('history');
      historyBtn.click();
      
      expect(window.location.href).toBe('historyPage.html');
    });
    
    test('sendQuestion creates message elements', () => {
      const { sendQuestion } = require('mainPageClient.js');
      sendQuestion('Test question');
      const chatBox = document.getElementById('chatBox');
      expect(chatBox.children.length).toBe(1);
      expect(chatBox.querySelector('.question').textContent).toBe('Q: Test question');
      expect(chatBox.querySelector('.answer').textContent).toBe('Waiting for response...');
    });
    
    test('getAnswer makes API call and updates answer element', async () => {
      const { getAnswer } = require('mainPageClient.js');
      const answerEl = document.createElement('div');
      await getAnswer('Test question', answerEl);
      expect(fetch).toHaveBeenCalledWith('ask', expect.any(Object));
      expect(answerEl.textContent).toBe('A: Mock answer');
    });
});