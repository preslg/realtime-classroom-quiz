export const QUIZ_COLLECTION = [
    {
        id: "physics-earth-science",
        title: "Physics & Earth Science Check",
        subject: "Science",
        questions: [
            {
                id: "q1",
                question: "Which layer of Earth's atmosphere is closest to the planet's surface?",
                options: [
                    { id: "opt1", text: "Stratosphere", isCorrect: false, explanation: "The stratosphere sits directly above the troposphere (from ~12 to 50 km up)." },
                    { id: "opt2", text: "Troposphere", isCorrect: true, explanation: "" },
                    { id: "opt3", text: "Mesosphere", isCorrect: false, explanation: "The mesosphere is much higher up, located above the stratosphere." },
                    { id: "opt4", text: "Thermosphere", isCorrect: false, explanation: "The thermosphere is one of the outer atmospheric layers, extending hundreds of kilometers out." }
                ]
            },
            {
                id: "q2",
                question: "What primary force keeps planets in orbit around the Sun?",
                options: [
                    { id: "opt1", text: "Electromagnetic Force", isCorrect: false, explanation: "Electromagnetism governs charged particles, not celestial orbital mechanics." },
                    { id: "opt2", text: "Centrifugal Force", isCorrect: false, explanation: "Centrifugal force is an apparent inertia effect in a rotating reference frame, not the fundamental attraction." },
                    { id: "opt3", text: "Gravitational Force", isCorrect: true, explanation: "" },
                    { id: "opt4", text: "Nuclear Force", isCorrect: false, explanation: "Strong/Weak nuclear forces act inside atomic nuclei across subatomic distances." }
                ]
            },
            {
                id: "q3",
                question: "Which form of heat transfer occurs through direct contact between particles?",
                options: [
                    { id: "opt1", text: "Convection", isCorrect: false, explanation: "Convection transfers heat through the bulk movement of fluids (liquids or gases)." },
                    { id: "opt2", text: "Conduction", isCorrect: true, explanation: "" },
                    { id: "opt3", text: "Radiation", isCorrect: false, explanation: "Radiation transfers heat via electromagnetic waves and does not require a medium." }
                ]
            }
        ]
    },
    {
        id: "world-geography",
        title: "World Geography & Landmarks",
        subject: "Geography",
        questions: [
            {
                id: "g1",
                question: "Which river is traditionally cited as the longest in the world?",
                options: [
                    { id: "opt1", text: "Amazon River", isCorrect: false, explanation: "The Amazon carries the largest volume of water, though most standard references rank the Nile slightly longer." },
                    { id: "opt2", text: "Nile River", isCorrect: true, explanation: "" },
                    { id: "opt3", text: "Danube River", isCorrect: false, explanation: "The Danube is the second-longest river in Europe, flowing through Central and Southeastern Europe." },
                    { id: "opt4", text: "Yangtze River", isCorrect: false, explanation: "The Yangtze is the longest river in Asia, not the world." }
                ]
            },
            {
                id: "g2",
                question: "Which continent contains the most countries?",
                options: [
                    { id: "opt1", text: "Asia", isCorrect: false, explanation: "Asia is the largest continent by area and population, but has fewer sovereign countries than Africa." },
                    { id: "opt2", text: "Europe", isCorrect: false, explanation: "Europe has around 44–50 countries depending on transcontinental borders, fewer than Africa." },
                    { id: "opt3", text: "Africa", isCorrect: true, explanation: "" },
                    { id: "opt4", text: "South America", isCorrect: false, explanation: "South America consists of 12 sovereign countries." }
                ]
            }
        ]
    },
    {
        id: "computer-basics",
        title: "Computer Science & Web Fundamentals",
        subject: "Technology",
        questions: [
            {
                id: "c1",
                question: "What does HTTP stand for on the web?",
                options: [
                    { id: "opt1", text: "HyperText Transfer Protocol", isCorrect: true, explanation: "" },
                    { id: "opt2", text: "High Transmission Text Process", isCorrect: false, explanation: "HTTP is a transfer protocol for hypermedia documents, not a generic text process." },
                    { id: "opt3", text: "Hyperlink Terminal Transport Program", isCorrect: false, explanation: "HTTP is a protocol rather than a terminal program." }
                ]
            },
            {
                id: "c2",
                question: "Which data structure follows Last-In, First-Out (LIFO) order?",
                options: [
                    { id: "opt1", text: "Queue", isCorrect: false, explanation: "A queue follows First-In, First-Out (FIFO) order, like people waiting in line." },
                    { id: "opt2", text: "Stack", isCorrect: true, explanation: "" },
                    { id: "opt3", text: "Hash Map", isCorrect: false, explanation: "A hash map stores key-value pairs for fast lookup rather than LIFO ordering." }
                ]
            }
        ]
    },
    {
        id: "biology-cells",
        title: "Cell Biology & Living Systems",
        subject: "Biology",
        questions: [
            {
                id: "b1",
                question: "Which organelle is primarily responsible for generating ATP in eukaryotic cells?",
                options: [
                    { id: "opt1", text: "Ribosome", isCorrect: false, explanation: "Ribosomes synthesize proteins rather than generating the cell's main ATP supply." },
                    { id: "opt2", text: "Mitochondrion", isCorrect: true, explanation: "" },
                    { id: "opt3", text: "Golgi apparatus", isCorrect: false, explanation: "The Golgi apparatus modifies, sorts, and packages proteins and lipids." }
                ]
            },
            {
                id: "b2",
                question: "Which molecule carries genetic instructions in living organisms?",
                options: [
                    { id: "opt1", text: "DNA", isCorrect: true, explanation: "" },
                    { id: "opt2", text: "Glucose", isCorrect: false, explanation: "Glucose is a simple sugar used primarily for cellular energy." },
                    { id: "opt3", text: "Hemoglobin", isCorrect: false, explanation: "Hemoglobin is a protein in red blood cells that transports oxygen." }
                ]
            }
        ]
    }
];

export const DEFAULT_QUIZ = QUIZ_COLLECTION[0];