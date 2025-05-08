// Wait for the DOM to be fully loaded before running the script
document.addEventListener("DOMContentLoaded", () => {
    // --- DOM Elements ---
    const qaList = document.getElementById("qaList");
    const logoutBtn = document.getElementById("logout");
    const username = sessionStorage.getItem( "username");

    if (!username) {
        window.location.href = "/login";
        return;
    }

    // --- Mock Data for Testing ---
    // Uncomment for standalone testing without a backend
    // const mockQA = [
    //     { id: 101, question: "How do I update my billing address?", answer: "Visit the billing section in your account." },
    //     { id: 102, question: "Is international shipping available?", answer: "Yes, we ship to over 100 countries." },
    //     { id: 103, question: "Can I cancel my subscription?", answer: "Yes, you can cancel anytime from your profile." }
    // ];
    // mockQA.forEach(qa => {
    //     const card = document.createElement("div");
    //     card.className = "qa-card";
    //     card.innerHTML = `
    //         <h3>Q&A ${qa.id}</h3>
    //         <p><strong>Q:</strong> ${qa.question}</p>
    //         <textarea>${qa.answer}</textarea>
    //         <p class="hint">Press Enter to submit</p>
    //     `;
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


    // --- Fetch Q&A Data ---
    fetch("/qa/pending", { // ! probabil alt nume aici !
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
                    <textarea>${qa.answer}</textarea>
                    <p class="hint">Press Enter to submit</p>
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

                // Add click handler for card (redirect to detail page)
                card.addEventListener("click", (e) => {
                    if (e.target.tagName !== "TEXTAREA") { // Prevent redirect when editing
                        sessionStorage.setItem("qaId", qa.id);
                        window.location.href = "/qaDetail"; // Path to Q&A detail page
                    }
                });

                qaList.appendChild(card);
            });
        })
        .catch(error => {
            console.error("Error loading Q&A:", error);
            qaList.innerHTML = "<p>Failed to load Q&A data.</p>";
        });

    // --- Event Listeners for Buttons ---
    logoutBtn.addEventListener("click", () => {
        sessionStorage.removeItem("username");
        sessionStorage.removeItem("qaId");
        window.location.href = "/login";
    });

    // --- Submit Answer Function ---
    /**
     * Submits an updated answer to the backend and removes the Q&A card
     * @param {number} id - The ID of the Q&A item
     * @param {string} updatedAnswer - The updated answer text
     * @param {HTMLElement} elementToRemove - The DOM element to remove
     */
    function submitAnswer(id, updatedAnswer, elementToRemove) {
        fetch("/qa/updateAnswer", {
            method: "POST",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ id, updatedAnswer, username })
        })
            .then(response => {
                if (!response.ok) throw new Error("Failed to submit answer");
                return response.json();
            })
            .then(() => {
                elementToRemove.remove();
                console.log(`Answer submitted for ID ${id}`);
            })
            .catch(err => {
                console.error("Error submitting answer:", err);
                alert("Error submitting answer: " + err.message);
            });
    }
});