describe('historyPage.js', () => {
    beforeEach(() => {
      const sessionStorageMock = (() => {
        let store = { username: 'testuser' };
        return {
          getItem: jest.fn((key) => store[key] || null),
          setItem: jest.fn((key, value) => { store[key] = value.toString(); }),
          removeItem: jest.fn((key) => { delete store[key]; }),
          clear: jest.fn(() => { store = {}; }),
        };
      })();
      
      Object.defineProperty(window, 'sessionStorage', { value: sessionStorageMock });
      
      document.body.innerHTML = `
        <div id="historyList"></div>
        <button id="newConversation"></button>
        <button id="history"></button>
        <button id="logout"></button>
      `;
      
      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve([
            { conversationId: 1, firstQuestion: 'Q1', firstAnswer: 'A1' },
            { conversationId: 2, firstQuestion: 'Q2', firstAnswer: 'A2' }
          ]),
        })
      );
      
      delete window.location;
      window.location = { href: '' };
      jest.resetModules();
      require('historyPage.js');
    });
    
    test('redirects to login if no username in session', () => {
      sessionStorage.getItem.mockImplementation((key) => null);
      jest.resetModules();
      require('historyPage.js');
      expect(window.location.href).toBe('client.html');
    });
    
    test('fetches chat history on load', () => {
      expect(fetch).toHaveBeenCalledWith('chatHistory', expect.any(Object));
    });
    
    test('renders conversation cards from API response', async () => {
      await new Promise(process.nextTick);
      const historyList = document.getElementById('historyList');
      expect(historyList.children.length).toBe(2);
      expect(historyList.innerHTML).toContain('Conversation 1');
      expect(historyList.innerHTML).toContain('Q1');
      expect(historyList.innerHTML).toContain('A1');
    });
    
    test('conversation card click sets conversationId and redirects', async () => {
      await new Promise(process.nextTick);
      const card = document.querySelector('.conversation-card');
      card.click();
      expect(sessionStorage.setItem).toHaveBeenCalledWith('conversationId', '1');
      expect(window.location.href).toBe('MainPage.html');
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
    
    test('logoutBtn clears session and redirects', () => {
      const logoutBtn = document.getElementById('logout');
      logoutBtn.click();
      expect(sessionStorage.removeItem).toHaveBeenCalledWith('username');
      expect(sessionStorage.removeItem).toHaveBeenCalledWith('conversationId');
      expect(window.location.href).toBe('client.html');
    });
    
    test('shows error message when fetch fails', async () => {
      fetch.mockImplementationOnce(() => Promise.reject(new Error('Network error')));
      jest.resetModules();
      require('historyPage.js');
      await new Promise(process.nextTick);
      const historyList = document.getElementById('historyList');
      expect(historyList.innerHTML).toContain('Failed to load chat history');
    });
});