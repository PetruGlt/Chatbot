document.addEventListener("DOMContentLoaded", () => {
    const haluList = document.getElementById("haluList");

    const backBtn = document.getElementById("back");
    backBtn.addEventListener("click", () => {
        window.location.href = "mainPageExpert.html";
    });

    // nu am reusit sa fac testarea, asta am reusit pana acum.
    //
    //     PrismaClientInitializationError: error: Environment variable not found: DATABASE_URL.
    // -->  schema.prisma:7
    // |
    // 6 |   provider = "mysql"
    // 7 |   url      = env("DATABASE_URL")
    //     |

        fetch("/expert/hallucinations")
        .then(res => res.json())
        .then(data => {
            data.forEach(entry => {
                const card = document.createElement("div");
                card.className = "qa-card";
                card.innerHTML = `
                <h3>Q&A ${entry.id}</h3>
                <p><strong>User:</strong> ${entry.user}</p>
                <p><strong>Question:</strong> ${entry.question}</p>
                <p><strong>Original Answer:</strong> ${entry.answer}</p>
                <p><strong>Modified by Expert:</strong> ${entry.updated_response}</p>
            `;
                haluList.appendChild(card);
            });
        })
        .catch(err => {
            console.error("Error loading hallucination data:", err);
            haluList.innerHTML = "<p>Failed to load hallucination report.</p>";
        });
});
