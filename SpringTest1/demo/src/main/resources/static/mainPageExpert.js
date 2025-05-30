// Wait for the DOM to be fully loaded before running the script
document.addEventListener("DOMContentLoaded", () => {
    // --- DOM Elements ---
    const qaList = document.getElementById("qaList");
    const logoutBtn = document.getElementById("logout");
    const username = sessionStorage.getItem("username");
    const haluRapBtn = document.getElementById("halurap");

    if (!username) {
        window.location.href = "/login";
        return;
    }

    const userIdDisplay = document.getElementById("userIdDisplay");

    if (userIdDisplay && username) {
        const numericId = username.replace(/\D/g, '');
        userIdDisplay.textContent = `Expert ID: #${numericId}`;
    }


    //--- Mock Data for Testing ---
    //Uncomment for standalone testing without a backend
    // const mockQA = [
    //     { id: 101, question: "How do I update my billing address?", answer: "Visit the billing section in your account." },
    //     { id: 102, question: "Is international shipping available?", answer: "Yes, we ship to over 100 countries." },
    //     { id: 103, question: "Can I cancel my subscription?", answer: "Yes, you can cancel anytime from your profile." }
    // ];
    // mockQA.forEach(qa => {
    // const card = document.createElement("div");
    // card.className = "qa-card";
    // card.innerHTML = `
    //     <h3>Q&A ${qa.id}</h3>
    //     <p><strong>Q:</strong> ${qa.question}</p>
    //     <textarea>${qa.answer}</textarea>
    //     <p class="hint">Press Enter to submit (will validate the answer)</p>
    //     <input type="hidden" class="validation-code" value="0">
    // `;
    //
    //     const textarea = card.querySelector("textarea");
    //     textarea.addEventListener("keydown", (e) => {
    //         if (e.key === "Enter" && !e.shiftKey) {
    //             e.preventDefault();
    //             const updatedAnswer = textarea.value.trim();
    //             submitAnswer(qa.id, updatedAnswer, card);
    //         }
    //     });
    //
    //     card.addEventListener("click", (e) => {
    //         if (e.target.tagName !== "TEXTAREA") { // Avoid redirect when editing textarea
    //             sessionStorage.setItem("qaId", qa.id);
    //             window.location.href = "/qaDetail"; // Path to Q&A detail page
    //         }
    //     });
    //
    //     qaList.appendChild(card);
    // });

  
    //--- Fetch Q&A Data ---
    fetch("/questions", { // ! probabil alt nume aici !
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
            // Expected data format: [{ id: number, question: string, answer: string }, ...]   //primary key de la intrebare-raspuns sau id-ul conversatiei (idk?)
            data.forEach(qa => {
                const card = document.createElement("div");
                card.className = "qa-card";
                card.innerHTML = `
                    <h3>Q&A ${qa.id}</h3>
                    <p><strong>Q:</strong> ${qa.question}</p>
                    <textarea data-original="${qa.answer}">${qa.answer}</textarea>
                    <p class="hint">Press Enter to submit (will validate the answer)</p>
                    <input type="hidden" class="validation-code" value="${qa.validation || "0"}">
                `;

                // Add submit functionality to textarea
                const textarea = card.querySelector("textarea");
                textarea.addEventListener("keydown", (e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        const updatedAnswer = textarea.value.trim();
                        submitAnswer(qa.id, updatedAnswer, card);
                    }
                });

                qaList.appendChild(card);
            });
        })
        .catch(error => {
            console.error("Error loading Q&A:", error);
            qaList.innerHTML = "<p>Failed to load Q&A data.</p>";
        });

    // --- Reload Content Function ---
    function reloadContent() {
        qaList.innerHTML = ""; // Clear existing content
        fetch("/questions", {
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
                    const card = document.createElement("div");
                    card.className = "qa-card";
                    card.innerHTML = `
                        <h3>Q&A ${qa.id}</h3>
                        <p><strong>Q:</strong> ${qa.question}</p>
                        <textarea data-original="${qa.answer}"> ${qa.answer}</textarea>
                        <p class="hint">Press Enter to submit (will validate the answer)</p>
                        <input type="hidden" class="validation-code" value="${qa.validation || "0"}">
                    `;

                    const textarea = card.querySelector("textarea");
                    textarea.addEventListener("keydown", (e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            const updatedAnswer = textarea.value.trim();
                            submitAnswer(qa.id, updatedAnswer, card);
                        }
                    });

                    qaList.appendChild(card);
                });
            })
            .catch(error => {
                console.error("Error loading Q&A:", error);
                qaList.innerHTML = "<p>Failed to load Q&A data.</p>";
            });
    }

    setInterval(reloadContent, 5000);

    // --- Event Listeners for Buttons ---
    logoutBtn.addEventListener("click", () => {
        sessionStorage.removeItem("username");
        sessionStorage.removeItem("qaId");
        window.location.href = "/login";
    });

    haluRapBtn.addEventListener("click", () => {
        window.location.href = "/showHallucination";
    });

    // --- Submit Answer Function ---
    /**
     * Submits an updated answer to the backend and removes the Q&A card
     * @param {number} id - The ID of the Q&A item
     * @param {string} updatedAnswer - The updated answer text
     * @param {HTMLElement} elementToRemove - The DOM element to remove
     */
    function submitAnswer(id, updatedAnswer, elementToRemove) {

        const textarea = elementToRemove.querySelector("textarea");
        const originalAnswer = textarea.dataset.original?.trim() || "";

        console.log("aici e origina: " + originalAnswer);
        if (!updatedAnswer) {
            alert("Answer cannot be empty!");
            return;
        }

        const payloadAnswer = updatedAnswer === originalAnswer ? null : updatedAnswer;

        fetch("/qa/updateAnswer", {
            method: "POST",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                id: id,
                updatedAnswer: payloadAnswer,
                username: username,
                validation: "1"
            })
        })
            .then(response => {
                if (!response.ok) {
                    console.error("Response not OK:", response.status, response.statusText);
                    throw new Error("Failed to submit answer");
                }
                return response.json();
            })
            .then(data => {
                if (data.success) {
                    elementToRemove.remove();
                    console.log(`Answer submitted for ID ${id}`);
                    reloadContent();
                } else {
                    throw new Error(data.message || "Validation failed");
                }
            })
            .catch(err => {
                console.error("Error submitting answer:", err);
                alert("Error submitting answer: " + err.message);
            });
    }
});

