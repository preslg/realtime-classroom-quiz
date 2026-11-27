import React, { useCallback, useEffect, useState } from "react";
import { Card, Space, NoticeBar, Tag } from "antd-mobile";
import { CheckCircleOutline, CloseCircleOutline } from "antd-mobile-icons";
import { socket } from "../socket";

const statusTagStyle = {
    padding: "8px 16px",
    fontSize: "14px",
    height: "auto",
    lineHeight: 1.4,
    whiteSpace: "normal",
    maxWidth: "100%",
    display: "inline-block"
};

function LivePulseIcon() {
    return (
        <span
            aria-hidden="true"
            style={{
                position: "relative",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: 14,
                height: 14,
                flexShrink: 0
            }}
        >
            <span className="live-pulse-ring" />
            <span
                style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    backgroundColor: "#1677ff",
                    position: "relative",
                    zIndex: 1
                }}
            />
        </span>
    );
}

export default function StudentScreen({ roomId }) {
    const storageKey = `quiz_student_id_${roomId}`;
    const [studentId, setStudentId] = useState(() =>
        sessionStorage.getItem(storageKey)
    );
    const [joined, setJoined] = useState(false);
    const [roomMeta, setRoomMeta] = useState(null);
    const [questionState, setQuestionState] = useState({
        currentQuestionIndex: 0,
        isRevealed: false,
        currentQuestion: null
    });
    const [selectedOptionId, setSelectedOptionId] = useState(null);

    const applyStudentState = useCallback(
        (data) => {
            if (!data) return;
            if (data.studentId) {
                setStudentId(data.studentId);
                sessionStorage.setItem(storageKey, data.studentId);
            }
            setJoined(true);
            setRoomMeta({
                roomId: data.roomId,
                title: data.title,
                totalQuestions: data.totalQuestions ?? 1,
                studentCount: data.studentCount ?? 1
            });
            setQuestionState({
                currentQuestionIndex: data.currentQuestionIndex ?? 0,
                isRevealed: Boolean(data.isRevealed),
                currentQuestion: data.currentQuestion || null
            });
            setSelectedOptionId(data.mySelectedOptionId ?? null);
        },
        [storageKey]
    );

    // Join room and let server assign or restore studentId
    useEffect(() => {
        const joinRoom = () => {
            const savedId = sessionStorage.getItem(storageKey) || undefined;
            socket.emit(
                "student:join",
                { roomId, studentId: savedId },
                (res) => {
                    if (res && res.ok && res.state) {
                        applyStudentState(res.state);
                    } else {
                        sessionStorage.removeItem(storageKey);
                        setStudentId(null);
                        setJoined(false);
                        setRoomMeta(null);
                        setQuestionState({
                            currentQuestionIndex: 0,
                            isRevealed: false,
                            currentQuestion: null
                        });
                        setSelectedOptionId(null);
                    }
                }
            );
        };

        if (socket.connected) {
            joinRoom();
        }

        socket.on("connect", joinRoom);
        return () => {
            socket.off("connect", joinRoom);
        };
    }, [roomId, storageKey, applyStudentState]);

    // Listen for targeted deltas
    useEffect(() => {
        const handleQuestionSync = (delta) => {
            if (!delta) return;
            setQuestionState((prev) => {
                const indexChanged = delta.currentQuestionIndex !== prev.currentQuestionIndex;
                if (indexChanged) {
                    setSelectedOptionId(null);
                }
                return {
                    currentQuestionIndex: delta.currentQuestionIndex ?? prev.currentQuestionIndex,
                    isRevealed: Boolean(delta.isRevealed),
                    currentQuestion: delta.currentQuestion ?? prev.currentQuestion
                };
            });
        };

        const handlePresence = ({ studentCount }) => {
            setRoomMeta((prev) =>
                prev ? { ...prev, studentCount: studentCount ?? prev.studentCount } : prev
            );
        };

        const handleRoomClosed = () => {
            sessionStorage.removeItem(storageKey);
            setStudentId(null);
            setJoined(false);
            setRoomMeta(null);
            setQuestionState({
                currentQuestionIndex: 0,
                isRevealed: false,
                currentQuestion: null
            });
            setSelectedOptionId(null);
        };

        socket.on("room:state", applyStudentState);
        socket.on("room:questionSync", handleQuestionSync);
        socket.on("room:presence", handlePresence);
        socket.on("room:closed", handleRoomClosed);

        return () => {
            socket.off("room:state", applyStudentState);
            socket.off("room:questionSync", handleQuestionSync);
            socket.off("room:presence", handlePresence);
            socket.off("room:closed", handleRoomClosed);
        };
    }, [applyStudentState, storageKey]);

    const submitAnswer = (optionId) => {
        if (!studentId || questionState.isRevealed || !questionState.currentQuestion) {
            return;
        }

        const previousSelection = selectedOptionId;
        setSelectedOptionId(optionId);

        socket.emit(
            "student:submitAnswer",
            {
                roomId,
                studentId,
                optionId
            },
            (res) => {
                if (!res || !res.ok) {
                    setSelectedOptionId(previousSelection);
                }
            }
        );
    };

    if (!joined || !roomMeta || !questionState.currentQuestion) {
        return (
            <div style={{ padding: 40, textAlign: "center" }}>
                Waiting for room...
            </div>
        );
    }

    const { currentQuestion, currentQuestionIndex, isRevealed } = questionState;
    const { totalQuestions } = roomMeta;

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
            <style>{`
        @keyframes liveRadarPulse {
          0% {
            transform: scale(0.75);
            opacity: 0.85;
          }
          70% {
            transform: scale(2.1);
            opacity: 0;
          }
          100% {
            transform: scale(2.1);
            opacity: 0;
          }
        }

        .live-pulse-ring {
          position: absolute;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background-color: #1677ff;
          animation: liveRadarPulse 1.8s cubic-bezier(0.24, 0, 0.38, 1) infinite;
        }
      `}</style>

            <NoticeBar
                icon={<LivePulseIcon />}
                content={
                    <div style={{ lineHeight: 1.4 }}>
                        Question {currentQuestionIndex + 1} of {totalQuestions}
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