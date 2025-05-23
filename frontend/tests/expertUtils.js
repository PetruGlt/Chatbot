// expertUtils.js

// === 1. Extrage ID-ul numeric din username ===
function getExpertId(username) {
  if (!username) return null;
  const numericId = username.replace(/\D/g, '');
  return numericId ? `Expert ID: #${numericId}` : null;
}

// === 2. Genereaza card Q&A ===
function buildQACard(qa, onSubmit) {
  const card = document.createElement("div");
  card.className = "qa-card";
  card.innerHTML = `
    <h3>Q&A ${qa.id}</h3>
    <p><strong>Q:</strong> ${qa.question}</p>
    <textarea>${qa.answer}</textarea>
    <p class="hint">Press Enter to submit (will validate the answer)</p>
    <input type="hidden" class="validation-code" value="${qa.validation || "0"}">
  `;

  const textarea = card.querySelector("textarea");
  textarea.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      const updatedAnswer = textarea.value.trim();
      onSubmit(qa.id, updatedAnswer, card);
    }
  });

  return card;
}

// === 3. Submit answer + eliminare card + reload ===
function submitAnswer({ id, updatedAnswer, elementToRemove, username, reloadFn }) {
  const textarea = elementToRemove.querySelector("textarea");
  const originalAnswer = textarea.dataset.original?.trim() || "";

  if (!updatedAnswer) {
    alert("Answer cannot be empty!");
    return;
  }

  const payloadAnswer = updatedAnswer === originalAnswer ? null : updatedAnswer;

  return fetch("/qa/updateAnswer", {
    method: "POST",
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      id,
      updatedAnswer: payloadAnswer,
      username,
      validation: "1"
    })
  })
    .then(response => {
      if (!response.ok) throw new Error("Failed to submit answer");
      return response.json();
    })
    .then(data => {
      if (data.success) {
        elementToRemove.remove();
        if (typeof reloadFn === "function") reloadFn();
        return true;
      } else {
        throw new Error(data.message || "Validation failed");
      }
    })
    .catch(err => {
      console.error("Error submitting answer:", err);
      alert("Error submitting answer: " + err.message);
      return false;
    });
}

// === 4. Fetch si reconstruire lista Q&A ===
function reloadContent({ username, qaListContainer, onSubmit }) {
  qaListContainer.innerHTML = "";

  return fetch("/questions", {
    method: "POST",
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ username })
  })
    .then(response => {
      if (!response.ok) throw new Error("Failed to fetch Q&A data.");
      return response.json();
    })
    .then(data => {
      data.forEach(qa => {
        const card = buildQACard(qa, onSubmit);
        qaListContainer.appendChild(card);
      });
    })
    .catch(error => {
      console.error("Error loading Q&A:", error);
      qaListContainer.innerHTML = "<p>Failed to load Q&A data.</p>";
    });
}

module.exports = {
  getExpertId,
  buildQACard,
  submitAnswer,
  reloadContent
};
