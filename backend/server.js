const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
const { buildStudentQuestion } = require("./sanitizeQuestion");
const { generateQuizFromSelections } = require("./coursesData");

const PORT = process.env.PORT || 4000;
const CORS_ORIGIN = process.env.CORS_ORIGIN || "*";
const ROOM_IDLE_TTL_MS = Number(process.env.ROOM_IDLE_TTL_MS) || 2 * 60 * 60 * 1000; // 2 hours
const ROOM_CLEANUP_INTERVAL_MS = Number(process.env.ROOM_CLEANUP_INTERVAL_MS) || 5 * 60 * 1000; // 5 minutes

const app = express();
app.use(cors({ origin: CORS_ORIGIN }));
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: CORS_ORIGIN,
        methods: ["GET", "POST"]
    }
});

/**
 * In-memory store of active quiz rooms:
 * roomId -> {
 *   roomId,
 *   teacherSocketId,
 *   title,
 *   subject,
 *   questions,
 *   totalQuestions,
 *   currentQuestionIndex,
 *   isRevealed,
 *   currentStudentQuestion,
 *   lastActiveAt,
 *   students: { [studentId]: { socketId } },
 *   answers: { [questionIndex]: { [studentId]: { selectedOptionId, timestamp } } }
 * }
 */
const rooms = new Map();

function generateUniqueRoomId(length = 6) {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let roomId = "";
    do {
        roomId = "";
        for (let i = 0; i < length; i++) {
            roomId += chars.charAt(Math.floor(Math.random() * chars.length));
        }
    } while (rooms.has(roomId));
    return roomId;
}

function generateUniqueStudentId(room) {
    let id = "";
    do {
        id = "stu_" + Math.random().toString(36).substring(2, 10);
    } while (room.students && room.students[id]);
    return id;
}

function getStudentIds(room) {
    return Object.keys(room.students || {});
}

function computeQuestionStats(room, qIdx) {
    const question = room.questions?.[qIdx];
    const optionCounts = {};
    for (const opt of question?.options || []) {
        optionCounts[opt.id] = 0;
    }

    const questionAnswers = room.answers?.[qIdx] || {};
    let answeredCount = 0;

    for (const record of Object.values(questionAnswers)) {
        if (!record || !record.selectedOptionId) continue;
        answeredCount += 1;
        if (Object.prototype.hasOwnProperty.call(optionCounts, record.selectedOptionId)) {
            optionCounts[record.selectedOptionId] += 1;
        }
    }

    return { answeredCount, optionCounts };
}

function getStudentInitialState(room, studentId) {
    if (!room) return null;
    const qIdx = room.currentQuestionIndex;
    const myAnswer = room.answers?.[qIdx]?.[studentId] || null;

    return {
        roomId: room.roomId,
        studentId,
        title: room.title,
        subject: room.subject,
        totalQuestions: room.totalQuestions,
        currentQuestionIndex: qIdx,
        isRevealed: room.isRevealed,
        currentQuestion: room.currentStudentQuestion,
        studentCount: getStudentIds(room).length,
        mySelectedOptionId: myAnswer ? myAnswer.selectedOptionId : null
    };
}

function getTeacherInitialState(room) {
    if (!room) return null;
    const qIdx = room.currentQuestionIndex;
    const stats = computeQuestionStats(room, qIdx);

    return {
        roomId: room.roomId,
        title: room.title,
        subject: room.subject,
        questions: room.questions,
        totalQuestions: room.totalQuestions,
        currentQuestionIndex: qIdx,
        isRevealed: room.isRevealed,
        studentIds: getStudentIds(room),
        answers: room.answers || {},
        answeredCount: stats.answeredCount,
        optionCounts: stats.optionCounts
    };
}

function emitQuestionSync(room) {
    const qIdx = room.currentQuestionIndex;
    const fullQuestion = room.questions[qIdx];
    const stats = computeQuestionStats(room, qIdx);

    io.to(room.roomId).emit("room:questionSync", {
        currentQuestionIndex: qIdx,
        isRevealed: room.isRevealed,
        currentQuestion: room.currentStudentQuestion
    });

    if (room.teacherSocketId) {
        io.to(room.teacherSocketId).emit("teacher:questionSync", {
            currentQuestionIndex: qIdx,
            isRevealed: room.isRevealed,
            question: fullQuestion,
            questionAnswers: room.answers[qIdx] || {},
            answeredCount: stats.answeredCount,
            optionCounts: stats.optionCounts
        });
    }
}

function emitPresenceUpdate(room) {
    const studentIds = getStudentIds(room);
    const studentCount = studentIds.length;

    io.to(room.roomId).emit("room:presence", { studentCount });

    if (room.teacherSocketId) {
        io.to(room.teacherSocketId).emit("teacher:roster", {
            studentIds,
            studentCount
        });
    }
}

function removeRoom(roomId) {
    const room = rooms.get(roomId);
    if (!room) return;
    rooms.delete(roomId);
    io.to(roomId).emit("room:closed", { roomId });
}

// Periodically expire abandoned/idle rooms to reclaim memory
const cleanupTimer = setInterval(() => {
    const now = Date.now();
    for (const [roomId, room] of rooms.entries()) {
        if (now - (room.lastActiveAt || 0) >= ROOM_IDLE_TTL_MS) {
            removeRoom(roomId);
        }
    }
}, ROOM_CLEANUP_INTERVAL_MS);

if (typeof cleanupTimer.unref === "function") {
    cleanupTimer.unref();
}

app.get("/health", (req, res) => {
    res.json({ status: "ok", activeRooms: rooms.size });
});

app.get("/api/rooms/:roomId", (req, res) => {
    const room = rooms.get(req.params.roomId);
    if (!room) {
        return res.status(404).json({ error: "Room not found" });
    }
    return res.json({
        roomId: room.roomId,
        title: room.title,
        subject: room.subject,
        totalQuestions: room.totalQuestions,
        currentQuestionIndex: room.currentQuestionIndex,
        isRevealed: room.isRevealed,
        studentCount: getStudentIds(room).length
    });
});

io.on("connection", (socket) => {
    // Teacher creates a new room or reconnects to an existing one
    socket.on("teacher:initRoom", ({ roomId, selections }, callback) => {
        let targetRoomId = roomId;
        let room = targetRoomId ? rooms.get(targetRoomId) : null;

        if (!room) {
            if (!Array.isArray(selections) || selections.length === 0) {
                if (typeof callback === "function") {
                    callback({ ok: false, error: "Course selections are required to create a room" });
                }
                return;
            }

            const generatedQuiz = generateQuizFromSelections(selections);
            if (!generatedQuiz.questions || generatedQuiz.questions.length === 0) {
                if (typeof callback === "function") {
                    callback({ ok: false, error: "No questions generated for the selected courses" });
                }
                return;
            }

            targetRoomId = targetRoomId || generateUniqueRoomId();
            const firstQuestion = generatedQuiz.questions[0];

            room = {
                roomId: targetRoomId,
                teacherSocketId: socket.id,
                title: generatedQuiz.title,
                subject: generatedQuiz.subject,
                questions: generatedQuiz.questions,
                totalQuestions: generatedQuiz.questions.length,
                currentQuestionIndex: 0,
                isRevealed: false,
                currentStudentQuestion: buildStudentQuestion(firstQuestion, false),
                lastActiveAt: Date.now(),
                students: {},
                answers: {}
            };
            rooms.set(targetRoomId, room);
        } else {
            room.teacherSocketId = socket.id;
            room.lastActiveAt = Date.now();
        }

        socket.join(targetRoomId);
        const teacherState = getTeacherInitialState(room);
        socket.emit("teacher:state", teacherState);

        if (typeof callback === "function") {
            callback({
                ok: true,
                roomId: targetRoomId,
                state: teacherState
            });
        }
    });

    // Teacher syncs a question index and reveal state
    socket.on("teacher:syncQuestion", ({ roomId, questionIndex, isRevealed }, callback) => {
        const room = rooms.get(roomId);
        if (!room) {
            if (typeof callback === "function") callback({ ok: false, error: "Room not found" });
            return;
        }

        if (room.teacherSocketId && room.teacherSocketId !== socket.id) {
            if (typeof callback === "function") callback({ ok: false, error: "Unauthorized teacher action" });
            return;
        }

        const qIdx = Math.max(0, Math.min(Number(questionIndex) || 0, room.questions.length - 1));
        const revealFlag = Boolean(isRevealed);

        if (room.currentQuestionIndex === qIdx && room.isRevealed === revealFlag) {
            if (typeof callback === "function") callback({ ok: true, unchanged: true });
            return;
        }

        const question = room.questions[qIdx];
        room.currentQuestionIndex = qIdx;
        room.isRevealed = revealFlag;
        room.currentStudentQuestion = buildStudentQuestion(question, revealFlag);
        room.lastActiveAt = Date.now();

        emitQuestionSync(room);

        if (typeof callback === "function") {
            callback({ ok: true });
        }
    });

    // Teacher ends session and removes room
    socket.on("teacher:endSession", ({ roomId }, callback) => {
        const room = rooms.get(roomId);
        if (room && room.teacherSocketId && room.teacherSocketId !== socket.id) {
            if (typeof callback === "function") {
                callback({ ok: false, error: "Unauthorized teacher action" });
            }
            return;
        }

        removeRoom(roomId);
        if (typeof callback === "function") {
            callback({ ok: true });
        }
    });

    // Student joins room; server assigns studentId if not already active
    socket.on("student:join", ({ roomId, studentId } = {}, callback) => {
        if (!roomId) {
            if (typeof callback === "function") {
                callback({ ok: false, error: "Missing roomId" });
            }
            return;
        }

        const room = rooms.get(roomId);
        if (!room) {
            if (typeof callback === "function") {
                callback({ ok: false, error: "Room does not exist" });
            }
            socket.emit("room:closed", { roomId });
            return;
        }

        const wasAlreadyPresent = Boolean(studentId && room.students[studentId]);
        const assignedStudentId = wasAlreadyPresent
            ? studentId
            : generateUniqueStudentId(room);

        socket.join(roomId);
        room.students[assignedStudentId] = { socketId: socket.id };
        room.lastActiveAt = Date.now();

        if (!wasAlreadyPresent) {
            emitPresenceUpdate(room);
        }

        const studentState = getStudentInitialState(room, assignedStudentId);
        socket.emit("room:state", studentState);

        if (typeof callback === "function") {
            callback({
                ok: true,
                studentId: assignedStudentId,
                state: studentState
            });
        }
    });

    // Student submits or updates answer for current question
    socket.on("student:submitAnswer", ({ roomId, studentId, optionId }, callback) => {
        const room = rooms.get(roomId);
        if (!room) {
            if (typeof callback === "function") {
                callback({ ok: false, error: "Room not found" });
            }
            return;
        }

        if (!studentId || !room.students[studentId]) {
            if (typeof callback === "function") {
                callback({ ok: false, error: "Student not registered in room" });
            }
            return;
        }

        if (room.isRevealed || !room.currentStudentQuestion) {
            if (typeof callback === "function") {
                callback({ ok: false, error: "Answers are already revealed" });
            }
            return;
        }

        const activeQuestion = room.questions[room.currentQuestionIndex];
        const validOption = activeQuestion?.options?.some((opt) => opt.id === optionId);
        if (!validOption) {
            if (typeof callback === "function") {
                callback({ ok: false, error: "Invalid optionId for current question" });
            }
            return;
        }

        socket.join(roomId);
        room.students[studentId].socketId = socket.id;

        const qIdx = room.currentQuestionIndex;
        if (!room.answers[qIdx]) {
            room.answers[qIdx] = {};
        }

        const existing = room.answers[qIdx][studentId];
        const answerChanged = !existing || existing.selectedOptionId !== optionId;

        const record = {
            selectedOptionId: optionId,
            timestamp: Date.now()
        };
        room.answers[qIdx][studentId] = record;
        room.lastActiveAt = Date.now();

        if (answerChanged && room.teacherSocketId) {
            const stats = computeQuestionStats(room, qIdx);
            io.to(room.teacherSocketId).emit("teacher:answerUpdate", {
                questionIndex: qIdx,
                studentId,
                answer: record,
                answeredCount: stats.answeredCount,
                optionCounts: stats.optionCounts
            });
        }

        if (typeof callback === "function") {
            callback({ ok: true, selectedOptionId: optionId });
        }
    });

    // Handle socket disconnects
    socket.on("disconnect", () => {
        for (const [roomId, room] of rooms.entries()) {
            if (room.teacherSocketId === socket.id) {
                removeRoom(roomId);
                continue;
            }

            let studentChanged = false;
            for (const [sid, sInfo] of Object.entries(room.students)) {
                if (sInfo.socketId === socket.id) {
                    delete room.students[sid];
                    studentChanged = true;
                }
            }

            if (studentChanged) {
                room.lastActiveAt = Date.now();
                emitPresenceUpdate(room);
            }
        }
    });
});

server.listen(PORT, () => {
    console.log(`Classroom Quiz Socket.io server running on http://localhost:${PORT}`);
});