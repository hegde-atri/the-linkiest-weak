export function parseText(text: string) {
    // Create a temporary element to decode HTML entities
    const txt = document.createElement("textarea");
    txt.innerHTML = text;

    // Get decoded text and clean up quotes and apostrophes
    let decoded = txt.value;

    // Replace HTML encoded quotes with regular quotes
    decoded = decoded
        .replace(/&quot;/g, '"')
        .replace(/&#039;/g, "'")
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">");

    return decoded;
}
// lib/trivia.ts
async function fetchCategoryQuestions(category: number, amount: number = 3) {
    const response = await fetch(
        `https://opentdb.com/api.php?amount=${amount}&category=${category}&difficulty=easy&type=multiple`,
    );
    const data = await response.json();
    console.log(data);
    return data.results;
}

export async function getQuestions() {
    try {
        // Fetch questions from multiple easy categories
        const categories = [
            { id: 27, name: "Animals" }, // Animals
            { id: 22, name: "Geography" }, // Geography
            { id: 9, name: "General" }, // General Knowledge
            { id: 12, name: "Music" }, // Music
        ];

        const allQuestions = await Promise.all(
            categories.map((cat) => fetchCategoryQuestions(cat.id, 3)),
        );
        console.log(allQuestions);

        // Flatten and format questions
        return (
            allQuestions
                .flat()
                .map((q: any) => ({
                    question: parseText(q.question),
                    answer: parseText(q.correct_answer),
                    category: q.category,
                }))
                // Shuffle the questions
                .sort(() => Math.random() - 0.5)
        );
    } catch (error) {
        // Return fallback questions if API fails
        return [
            {
                question: "What animal barks?",
                answer: "Dog",
                category: "Animals",
            },
            {
                question: "What is the capital of France?",
                answer: "Paris",
                category: "Geography",
            },
            // ... add more fallback questions
        ];
    }
}

// export async function getQuestions() {
//     try {
//         const response = await fetch(
//             "https://opentdb.com/api.php?amount=5&type=multiple",
//         );
//         const data = await response.json();

//         return data.results.map((q: any) => ({
//             question: parseText(q.question),
//             answer: parseText(q.correct_answer),
//         }));
//     } catch (error) {
//         console.error("Failed to fetch questions:", error);
//         return [];
//     }
// }
