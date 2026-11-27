const COURSES = [
    {
        id: "biology",
        title: "Biology",
        subject: "Life Sciences",
        topics: [
            {
                id: "cell-biology",
                title: "Cell Structure & Organelles",
                questions: [
                    {
                        id: "bio-cell-1",
                        question: "Which organelle is primarily responsible for generating ATP via cellular respiration?",
                        options: [
                            {
                                id: "a",
                                text: "Mitochondrion",
                                isCorrect: true,
                                explanation: "Mitochondria carry out oxidative phosphorylation and the citric acid cycle to produce most of the cell's ATP."
                            },
                            {
                                id: "b",
                                text: "Golgi apparatus",
                                isCorrect: false,
                                explanation: "The Golgi apparatus modifies, sorts, and packages proteins and lipids rather than acting as the main ATP hub."
                            },
                            {
                                id: "c",
                                text: "Lysosome",
                                isCorrect: false,
                                explanation: "Lysosomes contain hydrolytic enzymes for breaking down waste and cellular debris."
                            }
                        ]
                    },
                    {
                        id: "bio-cell-2",
                        question: "Which structure controls what enters and leaves a eukaryotic cell?",
                        options: [
                            {
                                id: "a",
                                text: "Plasma membrane",
                                isCorrect: true
                            },
                            {
                                id: "b",
                                text: "Ribosome",
                                isCorrect: false,
                                explanation: "Ribosomes synthesize proteins; selective transport across the cell boundary is handled by the plasma membrane."
                            },
                            {
                                id: "c",
                                text: "Nucleolus",
                                isCorrect: false,
                                explanation: "The nucleolus is inside the nucleus and assembles ribosomal RNA subunits."
                            }
                        ]
                    }
                ]
            },
            {
                id: "genetics-dna",
                title: "Genetics & DNA Replication",
                questions: [
                    {
                        id: "bio-gen-1",
                        question: "Which enzyme synthesizes new DNA strands by adding nucleotides to a 3' hydroxyl end?",
                        options: [
                            {
                                id: "a",
                                text: "DNA helicase",
                                isCorrect: false,
                                explanation: "Helicase unwinds and separates the two DNA strands ahead of the replication fork."
                            },
                            {
                                id: "b",
                                text: "DNA polymerase",
                                isCorrect: true,
                                explanation: "DNA polymerase builds complementary strands in the 5' to 3' direction by attaching nucleotides to a free 3'-OH group."
                            },
                            {
                                id: "c",
                                text: "DNA ligase",
                                isCorrect: false,
                                explanation: "DNA ligase joins nicks/Okazaki fragments together after synthesis."
                            }
                        ]
                    },
                    {
                        id: "bio-gen-2",
                        question: "In DNA base pairing, adenine pairs with which base?",
                        options: [
                            {
                                id: "a",
                                text: "Guanine",
                                isCorrect: false,
                                explanation: "Cytosine pairs with guanine via three hydrogen bonds in DNA."
                            },
                            {
                                id: "b",
                                text: "Thymine",
                                isCorrect: true
                            },
                            {
                                id: "c",
                                text: "Uracil",
                                isCorrect: false,
                                explanation: "Uracil replaces thymine in RNA rather than standard double-stranded DNA."
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        id: "js-fundamentals",
        title: "JavaScript Fundamentals",
        subject: "Programming",
        topics: [
            {
                id: "scope-closures",
                title: "Scope & Closures",
                questions: [
                    {
                        id: "js-sc-1",
                        question: "Which declaration is block-scoped?",
                        options: [
                            {
                                id: "a",
                                text: "var",
                                isCorrect: false,
                                explanation: "var is function-scoped (or global), not limited to { } blocks."
                            },
                            {
                                id: "b",
                                text: "const",
                                isCorrect: true,
                                explanation: "const is scoped to the nearest enclosing { } block and prevents rebinding."
                            },
                            {
                                id: "c",
                                text: "function",
                                isCorrect: false,
                                explanation: "Function declarations are hoisted and block-scoped only in strict mode, unlike const."
                            }
                        ]
                    },
                    {
                        id: "js-sc-2",
                        question: "What does typeof [] return in JavaScript?",
                        options: [
                            {
                                id: "a",
                                text: "\"array\"",
                                isCorrect: false,
                                explanation: "JavaScript does not have a separate 'array' primitive type; use Array.isArray() instead."
                            },
                            {
                                id: "b",
                                text: "\"object\"",
                                isCorrect: true
                            },
                            {
                                id: "c",
                                text: "\"list\"",
                                isCorrect: false,
                                explanation: "\"list\" is not a valid return value of typeof in JavaScript."
                            }
                        ]
                    },
                    {
                        id: "js-sc-3",
                        question: "What is a closure in JavaScript?",
                        options: [
                            {
                                id: "a",
                                text: "A function bundled with references to its lexical environment",
                                isCorrect: true,
                                explanation: "A closure lets an inner function access variables from its outer scope even after the outer function returns."
                            },
                            {
                                id: "b",
                                text: "A block statement that immediately stops execution",
                                isCorrect: false,
                                explanation: "Closures are about lexical variable retention across scopes, not halting execution."
                            },
                            {
                                id: "c",
                                text: "A method that converts an object into JSON",
                                isCorrect: false,
                                explanation: "JSON serialization uses JSON.stringify(), not closures."
                            }
                        ]
                    }
                ]
            },
            {
                id: "async-event-loop",
                title: "Async & Event Loop",
                questions: [
                    {
                        id: "js-el-1",
                        question: "Which queue runs first after the current call stack finishes?",
                        options: [
                            {
                                id: "a",
                                text: "Microtask queue (e.g., Promise callbacks)",
                                isCorrect: true,
                                explanation: "The event loop drains the microtask queue completely before picking the next macrotask."
                            },
                            {
                                id: "b",
                                text: "Macrotask queue (e.g., setTimeout)",
                                isCorrect: false,
                                explanation: "Macrotasks like setTimeout wait until microtasks queued during the turn have finished."
                            },
                            {
                                id: "c",
                                text: "DOM paint queue",
                                isCorrect: false,
                                explanation: "Microtasks execute before browser rendering/paint steps in each turn."
                            }
                        ]
                    },
                    {
                        id: "js-el-2",
                        question: "What does an async function always return?",
                        options: [
                            {
                                id: "a",
                                text: "A Promise",
                                isCorrect: true
                            },
                            {
                                id: "b",
                                text: "A callback function",
                                isCorrect: false,
                                explanation: "async functions wrap return values in a resolved Promise (or return a rejected Promise on throw)."
                            },
                            {
                                id: "c",
                                text: "undefined unless await is used",
                                isCorrect: false,
                                explanation: "Even without await, an async function returns a Promise resolving to its return value."
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        id: "choveshki-mozak",
        title: "Човешкия Мозък",
        subject: "Биология",
        topics: [
            {
                id: "grubnachen-mozuk",
                title: "Гръбначен Мозък",
                questions: [
                    {
                        id: "human-brain-spinal-1",
                        question: "Къде сивото мозъчно вещество е разположено по-навътре (медиално), а бялото вещество е отвън?",
                        options: [
                            {
                                id: "a",
                                text: "В гръбначния мозък",
                                isCorrect: true,
                                explanation: "В гръбначния мозък сивото вещество е разположено във вътрешността, а бялото вещество го обгръща."
                            },
                            {
                                id: "b",
                                text: "В големите мозъчни полукълба",
                                isCorrect: false,
                                explanation: "В големите мозъчни полукълба е обратно – сивото вещество образува мозъчната кора, а бялото вещество се намира във вътрешността."
                            }
                        ]
                    },
                    {
                        id: "human-brain-spinal-2",
                        question: "Сивото вещество в гръбначния мозък симетрично ли е спрямо лявата и дясната страна?",
                        image: "grubnachen_mozuk.jpg",
                        options: [
                            {
                                id: "a",
                                text: "Вярно",
                                isCorrect: true
                            },
                            {
                                id: "b",
                                text: "Невярно",
                                isCorrect: false
                            }
                        ]
                    },
                    {
                        id: "human-brain-spinal-3",
                        question: "Коя част на сивото вещество достига до ръба на гръбначния мозък?",
                        image: "grubnachen_mozuk.jpg",
                        options: [
                            {
                                id: "a",
                                text: "Дорзална (задна)",
                                isCorrect: true
                            },
                            {
                                id: "b",
                                text: "Вентрална (предна)",
                                isCorrect: false
                            }
                        ]
                    },
                    {
                        id: "human-brain-spinal-4",
                        question: "Дорзалните (задните) рога в гръбначния мозък са местата, където навлизат кои неврони?",
                        options: [
                            {
                                id: "a",
                                text: "Сетивните неврони",
                                isCorrect: true,
                                explanation: "Сетивните неврони навлизат в гръбначния мозък отзад, през дорзалните (задните) коренчета."
                            },
                            {
                                id: "b",
                                text: "Двигателните неврони",
                                isCorrect: false,
                                explanation: "Двигателните неврони се намират в предните (вентралните) рога и изпращат сигнали към периферията, за да управляват определени мускулни групи."
                            }
                        ]
                    }
                ]
            }
        ]
    }
];

function getCoursesCatalog() {
    return COURSES.map((course) => ({
        id: course.id,
        title: course.title,
        subject: course.subject,
        topics: (course.topics || []).map((topic) => ({
            id: topic.id,
            title: topic.title,
            questionCount: (topic.questions || []).length
        }))
    }));
}

function normalizeSelectionTokens(selections = []) {
    const tokens = new Set();

    for (const sel of selections) {
        if (!sel) continue;
        if (typeof sel === "string") {
            tokens.add(sel.trim());
        } else if (typeof sel === "object") {
            if (sel.topicId) tokens.add(String(sel.topicId).trim());
            if (sel.courseId && sel.topicId) {
                tokens.add(`${String(sel.courseId).trim()}:${String(sel.topicId).trim()}`);
            }
            if (!sel.topicId && sel.courseId) {
                tokens.add(String(sel.courseId).trim());
            }
        }
    }

    return tokens;
}

function generateQuizFromSelections(selections = []) {
    const tokens = normalizeSelectionTokens(selections);
    const matchedQuestions = [];
    const matchedCourseTitles = new Set();
    const matchedSubjects = new Set();
    const seenQuestionIds = new Set();

    for (const course of COURSES) {
        const courseMatched = tokens.has(course.id);

        for (const topic of course.topics || []) {
            const compositeKey = `${course.id}:${topic.id}`;
            const topicMatched =
                courseMatched || tokens.has(topic.id) || tokens.has(compositeKey);

            if (!topicMatched) continue;

            matchedCourseTitles.add(course.title);
            if (course.subject) matchedSubjects.add(course.subject);

            for (const q of topic.questions || []) {
                if (seenQuestionIds.has(q.id)) continue;
                seenQuestionIds.add(q.id);

                matchedQuestions.push({
                    ...q,
                    courseId: course.id,
                    courseTitle: course.title,
                    topicId: topic.id,
                    topicTitle: topic.title,
                    options: (q.options || []).map((opt) => ({ ...opt }))
                });
            }
        }
    }

    const courseList = Array.from(matchedCourseTitles);
    const title =
        courseList.length === 1
            ? `${courseList[0]} Quiz`
            : courseList.length > 1
                ? `${courseList.join(" & ")} Quiz`
                : "Classroom Quiz";

    const subjectList = Array.from(matchedSubjects);
    const subject =
        subjectList.length === 1
            ? subjectList[0]
            : subjectList.length > 1
                ? subjectList.join(", ")
                : "General";

    return {
        title,
        subject,
        questions: matchedQuestions
    };
}

module.exports = {
    COURSES,
    getCoursesCatalog,
    generateQuizFromSelections
};