export const COURSES_DATA = [
  {
    id: "bio-101",
    title: "Biology 101",
    subject: "Biology",
    topics: [
      {
        id: "cells",
        title: "Cell Structure & Organelles",
        questions: [
          {
            id: "q1",
            question: "Which organelle produces most of the cell's ATP?",
            options: [
              { id: "a", text: "Mitochondrion", isCorrect: true },
              {
                id: "b",
                text: "Golgi apparatus",
                isCorrect: false,
                explanation: "It packages, modifies, and ships proteins and lipids."
              },
              {
                id: "c",
                text: "Ribosome",
                isCorrect: false,
                explanation: "It synthesizes proteins from mRNA."
              }
            ]
          },
          {
            id: "q2",
            question: "Which structure controls what enters and leaves a eukaryotic cell?",
            options: [
              { id: "a", text: "Plasma membrane", isCorrect: true },
              {
                id: "b",
                text: "Rough endoplasmic reticulum",
                isCorrect: false,
                explanation: "It folds and transports secretory and membrane proteins."
              },
              {
                id: "c",
                text: "Lysosome",
                isCorrect: false,
                explanation: "It breaks down waste and cellular debris."
              }
            ]
          },
          {
            id: "q3",
            question: "Which feature is found in plant cells but typically absent in animal cells?",
            options: [
              { id: "a", text: "Cell wall", isCorrect: true },
              {
                id: "b",
                text: "Mitochondria",
                isCorrect: false,
                explanation: "Both plant and animal cells use mitochondria for cellular respiration."
              },
              {
                id: "c",
                text: "Nucleus",
                isCorrect: false,
                explanation: "Both plant and animal cells are eukaryotic and contain a nucleus."
              }
            ]
          }
        ]
      },
      {
        id: "photosynthesis",
        title: "Photosynthesis",
        questions: [
          {
            id: "q1",
            question: "Where do the light-dependent reactions take place?",
            options: [
              { id: "a", text: "Thylakoid membrane", isCorrect: true },
              {
                id: "b",
                text: "Stroma",
                isCorrect: false,
                explanation: "The Calvin cycle occurs in the stroma."
              },
              {
                id: "c",
                text: "Outer chloroplast membrane",
                isCorrect: false,
                explanation: "Chlorophyll complexes are embedded in the thylakoid membrane."
              }
            ]
          },
          {
            id: "q2",
            question: "Which gas is released as a byproduct when water is split during light reactions?",
            options: [
              { id: "a", text: "Oxygen (O2)", isCorrect: true },
              {
                id: "b",
                text: "Carbon dioxide (CO2)",
                isCorrect: false,
                explanation: "CO2 is taken in and fixed during the Calvin cycle rather than released by splitting water."
              },
              {
                id: "c",
                text: "Nitrogen (N2)",
                isCorrect: false,
                explanation: "Splitting water (photolysis) produces electrons, protons, and oxygen."
              }
            ]
          },
          {
            id: "q3",
            question: "Which enzyme fixes carbon dioxide into an organic molecule during the Calvin cycle?",
            options: [
              { id: "a", text: "RuBisCO", isCorrect: true },
              {
                id: "b",
                text: "DNA polymerase",
                isCorrect: false,
                explanation: "DNA polymerase synthesizes new DNA strands during replication."
              },
              {
                id: "c",
                text: "Amylase",
                isCorrect: false,
                explanation: "Amylase breaks down starches into simpler sugars."
              }
            ]
          }
        ]
      },
      {
        id: "genetics",
        title: "Mendelian Genetics",
        questions: [
          {
            id: "q1",
            question:
              "What is the expected phenotypic ratio of a monohybrid Aa x Aa cross with complete dominance?",
            options: [
              { id: "a", text: "3:1", isCorrect: true },
              {
                id: "b",
                text: "1:1",
                isCorrect: false,
                explanation: "1:1 is expected from a test cross (Aa x aa)."
              },
              {
                id: "c",
                text: "1:2:1",
                isCorrect: false,
                explanation: "1:2:1 is the genotypic ratio (AA : Aa : aa), not the dominant/recessive phenotypic ratio."
              }
            ]
          },
          {
            id: "q2",
            question: "Which term describes an organism with two identical alleles for a gene?",
            options: [
              { id: "a", text: "Homozygous", isCorrect: true },
              {
                id: "b",
                text: "Heterozygous",
                isCorrect: false,
                explanation: "Heterozygous means having two different alleles (such as Aa)."
              },
              {
                id: "c",
                text: "Phenotype",
                isCorrect: false,
                explanation: "Phenotype refers to observable traits rather than allele combination."
              }
            ]
          },
          {
            id: "q3",
            question: "What does Mendel's Law of Segregation state?",
            options: [
              {
                id: "a",
                text: "Allele pairs separate during gamete formation so each gamete carries one allele",
                isCorrect: true
              },
              {
                id: "b",
                text: "Linked genes on the same chromosome always assort independently",
                isCorrect: false,
                explanation: "Genes close together on the same chromosome tend to be inherited together."
              },
              {
                id: "c",
                text: "Recessive alleles always mask dominant alleles",
                isCorrect: false,
                explanation: "Dominant alleles mask recessive alleles in heterozygotes."
              }
            ]
          }
        ]
      }
    ]
  },
  {
    id: "cs-101",
    title: "Intro to Computer Science",
    subject: "Computer Science",
    topics: [
      {
        id: "binary",
        title: "Number Systems & Binary",
        questions: [
          {
            id: "q1",
            question: "What is the decimal value of binary 1010?",
            options: [
              { id: "a", text: "10", isCorrect: true },
              { id: "b", text: "8", isCorrect: false, explanation: "Binary 1000 equals 8." },
              { id: "c", text: "12", isCorrect: false, explanation: "Binary 1100 equals 12." }
            ]
          },
          {
            id: "q2",
            question: "What is the hexadecimal representation of binary 1111 0010?",
            options: [
              { id: "a", text: "0xF2", isCorrect: true },
              {
                id: "b",
                text: "0xE2",
                isCorrect: false,
                explanation: "1111 in binary is 15 in decimal, which is F in hexadecimal (14 is E)."
              },
              {
                id: "c",
                text: "0xF4",
                isCorrect: false,
                explanation: "0010 in binary equals 2 in decimal, not 4."
              }
            ]
          },
          {
            id: "q3",
            question: "How many distinct values can a single byte (8 bits) represent?",
            options: [
              { id: "a", text: "256", isCorrect: true },
              {
                id: "b",
                text: "128",
                isCorrect: false,
                explanation: "7 bits represent 128 values; 8 bits represent 2^8 = 256 values."
              },
              {
                id: "c",
                text: "64",
                isCorrect: false,
                explanation: "6 bits represent 64 values."
              }
            ]
          }
        ]
      },
      {
        id: "complexity",
        title: "Big-O Notation",
        questions: [
          {
            id: "q1",
            question: "What is the worst-case time complexity of binary search on a sorted array of size n?",
            options: [
              { id: "a", text: "O(log n)", isCorrect: true },
              {
                id: "b",
                text: "O(n)",
                isCorrect: false,
                explanation: "Linear search takes O(n); binary search halves the search space each step."
              },
              {
                id: "c",
                text: "O(n log n)",
                isCorrect: false,
                explanation: "A single binary search runs in logarithmic time, O(log n)."
              }
            ]
          },
          {
            id: "q2",
            question: "Which time complexity describes a nested loop over the same array of length n?",
            options: [
              { id: "a", text: "O(n^2)", isCorrect: true },
              {
                id: "b",
                text: "O(1)",
                isCorrect: false,
                explanation: "O(1) means constant time independent of input size n."
              },
              {
                id: "c",
                text: "O(log n)",
                isCorrect: false,
                explanation: "Iterating over all n elements inside another loop of n elements scales quadratically."
              }
            ]
          },
          {
            id: "q3",
            question: "What does Big-O notation primarily describe?",
            options: [
              {
                id: "a",
                text: "How an algorithm's runtime or memory grows as input size increases",
                isCorrect: true
              },
              {
                id: "b",
                text: "The exact number of milliseconds an algorithm takes on a specific CPU",
                isCorrect: false,
                explanation: "Big-O captures asymptotic growth rate rather than hardware wall-clock time."
              },
              {
                id: "c",
                text: "Whether code follows clean formatting conventions",
                isCorrect: false,
                explanation: "Big-O measures algorithmic efficiency and scaling."
              }
            ]
          }
        ]
      },
      {
        id: "data-structures",
        title: "Core Data Structures",
        questions: [
          {
            id: "q1",
            question: "Which ordering principle does a stack follow?",
            options: [
              { id: "a", text: "LIFO (Last-In, First-Out)", isCorrect: true },
              {
                id: "b",
                text: "FIFO (First-In, First-Out)",
                isCorrect: false,
                explanation: "FIFO describes a queue rather than a stack."
              },
              {
                id: "c",
                text: "Sorted key order",
                isCorrect: false,
                explanation: "Stacks push and pop from the top regardless of key values."
              }
            ]
          },
          {
            id: "q2",
            question: "What is the average-case lookup time for a well-distributed hash table?",
            options: [
              { id: "a", text: "O(1)", isCorrect: true },
              {
                id: "b",
                text: "O(n)",
                isCorrect: false,
                explanation: "Hash tables compute a bucket index directly from the key in constant average time."
              },
              {
                id: "c",
                text: "O(n!)",
                isCorrect: false,
                explanation: "Factorial time grows far faster than hash table lookups."
              }
            ]
          }
        ]
      }
    ]
  }
];

export function formatTopicTitle(topic, index) {
  return `${topic.title}, topic ${index + 1}`;
}

export function buildSessionQuiz(course, topicIndex, mode = "single") {
  const safeIndex = Math.max(0, Math.min(topicIndex, course.topics.length - 1));
  const includedTopics = course.topics
    .map((topic, idx) => ({
      ...topic,
      topicNumber: idx + 1,
      displayTitle: formatTopicTitle(topic, idx)
    }))
    .slice(mode === "cumulative" ? 0 : safeIndex, safeIndex + 1);

  const mergedQuestions = includedTopics.flatMap((topic) =>
    topic.questions.map((q, idx) => ({
      ...q,
      courseTitle: course.title,
      topicTitle: topic.displayTitle,
      id: `${course.id}_${topic.id}_${q.id || idx}`
    }))
  );

  const chosenTopic = course.topics[safeIndex];
  const chosenDisplayTitle = formatTopicTitle(chosenTopic, safeIndex);

  return {
    id: `${course.id}__${chosenTopic.id}__${mode}`,
    title:
      mode === "cumulative"
        ? `${course.title}: Through ${chosenDisplayTitle}`
        : `${course.title}: ${chosenDisplayTitle}`,
    subject: course.subject,
    questions: mergedQuestions
  };
}

export function buildMultiCourseSessionQuiz(courses, selectedCourseIds, configByCourseId) {
  const activeCourses = courses.filter((c) => selectedCourseIds.includes(c.id));

  if (activeCourses.length === 1) {
    const course = activeCourses[0];
    const cfg = configByCourseId[course.id] || { topicIndex: 0, mode: "single" };
    return buildSessionQuiz(course, cfg.topicIndex, cfg.mode);
  }

  const questions = [];
  const titleParts = [];

  for (const course of activeCourses) {
    const cfg = configByCourseId[course.id] || { topicIndex: 0, mode: "single" };
    const singleCourseQuiz = buildSessionQuiz(course, cfg.topicIndex, cfg.mode);

    titleParts.push(singleCourseQuiz.title);
    questions.push(...singleCourseQuiz.questions);
  }

  return {
    id: `multi__${activeCourses.map((c) => c.id).join("+")}__${Date.now()}`,
    title: titleParts.length > 0 ? titleParts.join(" | ") : "Combined Quiz Session",
    subject: Array.from(new Set(activeCourses.map((c) => c.subject))).join(" & "),
    questions
  };
}

export const DEFAULT_QUIZ = buildSessionQuiz(COURSES_DATA[0], 0, "single");