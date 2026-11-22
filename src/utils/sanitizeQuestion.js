export function buildStudentQuestion(question, isRevealed) {
    if (!question) return null;

    const sanitizedOptions = (question.options || []).map((opt) => {
        if (isRevealed) {
            return {
                id: opt.id,
                text: opt.text,
                isCorrect: Boolean(opt.isCorrect),
                explanation: opt.explanation || ""
            };
        }

        return {
            id: opt.id,
            text: opt.text
        };
    });

    return {
        id: question.id,
        question: question.question,
        courseTitle: question.courseTitle || "",
        topicTitle: question.topicTitle || "",
        options: sanitizedOptions
    };
}