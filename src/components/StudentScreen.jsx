import React, { useEffect, useState } from "react";
import { ref, onValue, set, onDisconnect } from "firebase/database";
import { db } from "../firebase";
import { Card, Space, NoticeBar, Tag } from "antd-mobile";
import { CheckCircleOutline, CloseCircleOutline } from "antd-mobile-icons";

const statusTagStyle = {
    padding: "8px 16px",
    fontSize: "14px",
    height: "auto",
    lineHeight: 1.4,
    whiteSpace: "normal",
    maxWidth: "100%",
    display: "inline-block"
};

export default function StudentScreen({ roomId }) {
    const [studentId] = useState(
        () => "student_" + Math.random().toString(36).substring(2, 11)
    );
    const [joined, setJoined] = useState(false);
    const [roomState, setRoomState] = useState(null);
    const [selectedOptionId, setSelectedOptionId] = useState(null);

    // Automatically join room using studentId as the student name
    useEffect(() => {
        const myStudentRef = ref(db, `rooms/${roomId}/students/${studentId}`);

        set(myStudentRef, { name: studentId });
        onDisconnect(myStudentRef).remove();
        setJoined(true);
    }, [roomId, studentId]);

    // Listen for live updates from the room
    useEffect(() => {
        if (!joined) return;
        const roomRef = ref(db, `rooms/${roomId}`);
        const unsubscribe = onValue(roomRef, (snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.val();
                setRoomState(data);

                const currentQIdx = data.currentQuestionIndex;
                const myAnswer = data.answers?.[currentQIdx]?.[studentId];
                setSelectedOptionId(myAnswer ? myAnswer.selectedOptionId : null);
            } else {
                setRoomState(null);
            }
        });

        return () => unsubscribe();
    }, [joined, roomId, studentId]);

    const submitAnswer = (optionId) => {
        if (roomState?.isRevealed || !roomState?.currentQuestion) return;
        setSelectedOptionId(optionId);
        const answerRef = ref(
            db,
            `rooms/${roomId}/answers/${roomState.currentQuestionIndex}/${studentId}`
        );
        set(answerRef, { selectedOptionId: optionId, timestamp: Date.now() });
    };

    if (!joined || !roomState || !roomState.currentQuestion) {
        return (
            <div style={{ padding: 40, textAlign: "center" }}>
                Waiting for room...
            </div>
        );
    }

    const {
        currentQuestion,
        currentQuestionIndex = 0,
        totalQuestions = 1,
        isRevealed = false
    } = roomState;

    return (
        <div
            style={{
                padding: 16,
                maxWidth: 500,
                margin: "0 auto",
                paddingBottom: 40,
                boxSizing: "border-box"
            }}
        >
            <NoticeBar
                icon={null}
                content={
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 2,
                            lineHeight: 1.4
                        }}
                    >
                        <span>
                            Connected as <strong>{studentId}</strong>
                        </span>
                        <span>
                            Question {currentQuestionIndex + 1} of {totalQuestions}
                        </span>
                    </div>
                }
                color="info"
                style={{
                    "--height": "auto",
                    padding: "10px 12px"
                }}
            />

            <Card style={{ marginTop: 16 }}>
                <h2 style={{ margin: 0, overflowWrap: "anywhere" }}>
                    {currentQuestion.question}
                </h2>
            </Card>

            <div style={{ marginTop: 16 }}>
                <Space direction="vertical" block style={{ "--gap": "12px" }}>
                    {currentQuestion.options.map((opt) => {
                        const isSelected = selectedOptionId === opt.id;

                        let cardStyle = {
                            padding: "16px",
                            borderRadius: "8px",
                            border: "1px solid #e5e5e5",
                            background: "#fff",
                            cursor: isRevealed ? "default" : "pointer",
                            boxSizing: "border-box"
                        };

                        if (isSelected) {
                            cardStyle.border = "2px solid #1677ff";
                            cardStyle.background = "#e6f4ff";
                        }

                        if (isRevealed) {
                            if (opt.isCorrect) {
                                cardStyle.border = "2px solid #52c41a";
                                cardStyle.background = "#f6ffed";
                            } else if (isSelected && !opt.isCorrect) {
                                cardStyle.border = "2px solid #ff4d4f";
                                cardStyle.background = "#fff2f0";
                            }
                        }

                        return (
                            <div
                                key={opt.id}
                                style={cardStyle}
                                onClick={() => !isRevealed && submitAnswer(opt.id)}
                            >
                                <div
                                    style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        gap: 8
                                    }}
                                >
                                    <span
                                        style={{
                                            fontSize: "16px",
                                            fontWeight: isSelected ? "bold" : "normal",
                                            overflowWrap: "anywhere"
                                        }}
                                    >
                                        {opt.text}
                                    </span>
                                    {isRevealed && (
                                        <span style={{ flexShrink: 0 }}>
                                            {opt.isCorrect && (
                                                <Tag color="success">
                                                    <CheckCircleOutline /> Correct
                                                </Tag>
                                            )}
                                            {isSelected && !opt.isCorrect && (
                                                <Tag color="danger">
                                                    <CloseCircleOutline /> Your Answer
                                                </Tag>
                                            )}
                                        </span>
                                    )}
                                </div>

                                {isRevealed && !opt.isCorrect && opt.explanation && (
                                    <div
                                        style={{
                                            marginTop: 10,
                                            padding: "8px 12px",
                                            background: "#fffbe6",
                                            border: "1px solid #ffe58f",
                                            borderRadius: "6px",
                                            fontSize: "13px",
                                            color: "#d48806",
                                            overflowWrap: "anywhere"
                                        }}
                                    >
                                        <strong>Why wrong:</strong> {opt.explanation}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </Space>
            </div>

            <div style={{ marginTop: 24, textAlign: "center" }}>
                {isRevealed ? (
                    <Tag color="warning" fill="outline" style={statusTagStyle}>
                        Waiting for next question...
                    </Tag>
                ) : selectedOptionId ? (
                    <Tag color="primary" fill="outline" style={statusTagStyle}>
                        Answer submitted! You can change it until answers are revealed.
                    </Tag>
                ) : (
                    <Tag color="default" fill="outline" style={statusTagStyle}>
                        Select an answer above
                    </Tag>
                )}
            </div>
        </div>
    );
}