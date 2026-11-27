import React, { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import {
    Card,
    Button,
    Tag,
    Space,
    Typography,
    Layout,
    Row,
    Col,
    Progress,
    Alert
} from "antd";
import { socket } from "../socket";

const { Header, Content } = Layout;
const { Title, Text } = Typography;

export default function TeacherScreen({ roomId: initialRoomId, selections = [] }) {
    const navigate = useNavigate();
    const [activeRoomId, setActiveRoomId] = useState(initialRoomId || null);
    const [quizMeta, setQuizMeta] = useState(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [isRevealed, setIsRevealed] = useState(false);
    const [studentIds, setStudentIds] = useState([]);
    const [answersByQuestion, setAnswersByQuestion] = useState({});
    const [answeredCount, setAnsweredCount] = useState(0);
    const [optionCounts, setOptionCounts] = useState({});
    const [errorMessage, setErrorMessage] = useState(null);
    const [endingSession, setEndingSession] = useState(false);
    const isClosingRef = useRef(false);

    const applyTeacherFullState = useCallback((state) => {
        if (!state) return;
        setQuizMeta({
            title: state.title,
            subject: state.subject,
            questions: state.questions || []
        });
        setCurrentQuestionIndex(state.currentQuestionIndex ?? 0);
        setIsRevealed(Boolean(state.isRevealed));
        setStudentIds(state.studentIds || []);
        setAnswersByQuestion(state.answers || {});
        setAnsweredCount(state.answeredCount ?? 0);
        setOptionCounts(state.optionCounts || {});
    }, []);

    const syncQuestionToRoom = useCallback(
        (qIndex, revealFlag) => {
            if (!activeRoomId || !quizMeta?.questions?.[qIndex]) return;

            socket.emit("teacher:syncQuestion", {
                roomId: activeRoomId,
                questionIndex: qIndex,
                isRevealed: revealFlag
            });
        },
        [activeRoomId, quizMeta]
    );

    useEffect(() => {
        isClosingRef.current = false;

        const initRoom = () => {
            if (isClosingRef.current) return;
            socket.emit(
                "teacher:initRoom",
                {
                    roomId: initialRoomId || undefined,
                    selections
                },
                (res) => {
                    if (isClosingRef.current) return;
                    if (res && res.ok && res.state) {
                        const createdId = res.roomId || res.state.roomId;
                        setActiveRoomId(createdId);
                        applyTeacherFullState(res.state);
                        setErrorMessage(null);

                        if (!initialRoomId && createdId) {
                            navigate(`/teacher/${createdId}`, {
                                replace: true,
                                state: { selections }
                            });
                        }
                    } else {
                        setErrorMessage(res?.error || "Failed to initialize quiz room.");
                    }
                }
            );
        };

        if (socket.connected) {
            initRoom();
        }

        const handleTeacherState = (data) => {
            if (isClosingRef.current || !data) return;
            if (data.roomId) setActiveRoomId(data.roomId);
            applyTeacherFullState(data);
        };

        const handleQuestionSync = (delta) => {
            if (isClosingRef.current || !delta) return;
            setCurrentQuestionIndex(delta.currentQuestionIndex ?? 0);
            setIsRevealed(Boolean(delta.isRevealed));
            if (typeof delta.answeredCount === "number") {
                setAnsweredCount(delta.answeredCount);
            }
            if (delta.optionCounts) {
                setOptionCounts(delta.optionCounts);
            }
            if (delta.questionAnswers) {
                setAnswersByQuestion((prev) => ({
                    ...prev,
                    [delta.currentQuestionIndex]: delta.questionAnswers
                }));
            }
        };

        const handleAnswerUpdate = ({
            questionIndex,
            studentId,
            answer,
            answeredCount: nextAnsweredCount,
            optionCounts: nextOptionCounts
        }) => {
            if (isClosingRef.current) return;
            setAnswersByQuestion((prev) => ({
                ...prev,
                [questionIndex]: {
                    ...(prev[questionIndex] || {}),
                    [studentId]: answer
                }
            }));
            if (typeof nextAnsweredCount === "number") {
                setAnsweredCount(nextAnsweredCount);
            }
            if (nextOptionCounts) {
                setOptionCounts(nextOptionCounts);
            }
        };

        const handleRosterUpdate = ({ studentIds: updatedIds }) => {
            if (isClosingRef.current) return;
            setStudentIds(updatedIds || []);
        };

        socket.on("connect", initRoom);
        socket.on("teacher:state", handleTeacherState);
        socket.on("teacher:questionSync", handleQuestionSync);
        socket.on("teacher:answerUpdate", handleAnswerUpdate);
        socket.on("teacher:roster", handleRosterUpdate);

        return () => {
            socket.off("connect", initRoom);
            socket.off("teacher:state", handleTeacherState);
            socket.off("teacher:questionSync", handleQuestionSync);
            socket.off("teacher:answerUpdate", handleAnswerUpdate);
            socket.off("teacher:roster", handleRosterUpdate);
        };
    }, [initialRoomId, selections, navigate, applyTeacherFullState]);

    const totalStudents = studentIds.length;
    const currentQuestion = quizMeta?.questions?.[currentQuestionIndex] || null;
    const currentQuestionAnswers = answersByQuestion[currentQuestionIndex] || {};

    const revealAnswers = useCallback(() => {
        if (!currentQuestion) return;
        syncQuestionToRoom(currentQuestionIndex, true);
    }, [currentQuestion, syncQuestionToRoom, currentQuestionIndex]);

    useEffect(() => {
        if (totalStudents > 0 && answeredCount >= totalStudents && !isRevealed) {
            revealAnswers();
        }
    }, [answeredCount, totalStudents, isRevealed, revealAnswers]);

    const handleEndSession = () => {
        if (endingSession || isClosingRef.current) return;
        isClosingRef.current = true;
        setEndingSession(true);

        if (activeRoomId) {
            socket.emit("teacher:endSession", { roomId: activeRoomId }, () => {
                navigate("/");
            });
        } else {
            navigate("/");
        }
    };

    if (errorMessage) {
        return (
            <div style={{ padding: 40, maxWidth: 600, margin: "0 auto" }}>
                <Alert
                    type="error"
                    showIcon
                    message="Unable to Start Room"
                    description={errorMessage}
                    action={
                        <Button onClick={() => navigate("/")}>Back to Quiz Builder</Button>
                    }
                />
            </div>
        );
    }

    if (!quizMeta || !currentQuestion || !activeRoomId) {
        return (
            <div style={{ padding: 40, textAlign: "center" }}>
                Generating room &amp; questions on server...
            </div>
        );
    }

    const nextQuestion = () => {
        if (currentQuestionIndex < quizMeta.questions.length - 1) {
            syncQuestionToRoom(currentQuestionIndex + 1, false);
        }
    };

    const joinUrl = `${window.location.origin}/student?room=${activeRoomId}`;

    return (
        <Layout style={{ minHeight: "100vh", background: "#f0f2f5" }}>
            <style>{`
        .topic-question-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 8px;
        }

        .topic-question-tags {
          display: flex;
          flex-direction: row;
          align-items: center;
          gap: 8px;
        }

        @media (max-width: 576px) {
          .topic-question-bar {
            align-items: flex-start;
          }

          .topic-question-tags {
            flex-direction: column;
            align-items: flex-start;
          }

          .topic-question-tags .adm-tag {
            white-space: normal;
            height: auto;
          }
        }
      `}</style>

            <Header
                style={{
                    background: "#001529",
                    padding: "0 24px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                }}
            >
                <Title level={3} style={{ color: "white", margin: 0 }}>
                    Quiz — Room {activeRoomId}
                </Title>
                <Space>
                    <Tag color="green" style={{ fontSize: 14, padding: "4px 10px" }}>
                        {totalStudents} Student{totalStudents !== 1 ? "s" : ""} Connected
                    </Tag>
                    <Button
                        danger
                        type="primary"
                        loading={endingSession}
                        onClick={handleEndSession}
                    >
                        End Session
                    </Button>
                </Space>
            </Header>

            <Content style={{ padding: 24, maxWidth: 1200, margin: "0 auto", width: "100%" }}>
                <Row gutter={[24, 24]}>
                    <Col xs={24} md={16}>
                        <Card style={{ marginBottom: 16 }}>
                            <Space direction="vertical" style={{ width: "100%" }}>
                                <div className="topic-question-bar">
                                    <div className="topic-question-tags">
                                        {currentQuestion.topicTitle && (
                                            <Tag color="purple">{currentQuestion.topicTitle}</Tag>
                                        )}
                                        <Tag color="blue">
                                            Question {currentQuestionIndex + 1} of {quizMeta.questions.length}
                                        </Tag>
                                    </div>
                                    <Text type="secondary">
                                        Submissions:{" "}
                                        <strong>
                                            {answeredCount} / {totalStudents}
                                        </strong>
                                    </Text>
                                </div>
                                <Progress
                                    percent={
                                        totalStudents > 0
                                            ? Math.round((answeredCount / totalStudents) * 100)
                                            : 0
                                    }
                                    status="active"
                                />

                                <Title level={2} style={{ marginTop: 16 }}>
                                    {currentQuestion.question}
                                </Title>
                            </Space>
                        </Card>

                        {currentQuestion.options.map((opt, index) => {
                            const optionVotes = optionCounts[opt.id] ?? 0;
                            const votePercentage =
                                totalStudents > 0 ? Math.round((optionVotes / totalStudents) * 100) : 0;

                            let cardStyle = { marginBottom: 12, borderRadius: 8 };
                            if (isRevealed) {
                                if (opt.isCorrect) {
                                    cardStyle.border = "2px solid #52c41a";
                                    cardStyle.backgroundColor = "#f6ffed";
                                } else if (optionVotes > 0) {
                                    cardStyle.border = "2px solid #ff4d4f";
                                    cardStyle.backgroundColor = "#fff2f0";
                                }
                            }

                            return (
                                <Card key={opt.id} style={cardStyle} bodyStyle={{ padding: 16 }}>
                                    <Row align="middle" justify="space-between">
                                        <Col span={18}>
                                            <Space>
                                                <strong style={{ fontSize: 18 }}>
                                                    {String.fromCharCode(65 + index)}.
                                                </strong>
                                                <Text style={{ fontSize: 18 }}>{opt.text}</Text>
                                                {isRevealed && opt.isCorrect && (
                                                    <Tag color="success">Correct Answer</Tag>
                                                )}
                                            </Space>
                                        </Col>
                                        <Col span={6} style={{ textAlign: "right" }}>
                                            {isRevealed && (
                                                <Text type="secondary">
                                                    {optionVotes} votes ({votePercentage}%)
                                                </Text>
                                            )}
                                        </Col>
                                    </Row>

                                    {isRevealed && !opt.isCorrect && opt.explanation && (
                                        <Alert
                                            type="warning"
                                            showIcon
                                            message="Why it's incorrect:"
                                            description={opt.explanation}
                                            style={{ marginTop: 12 }}
                                        />
                                    )}
                                </Card>
                            );
                        })}

                        <Card style={{ marginTop: 24 }}>
                            <Row justify="space-between" align="middle">
                                <Col>
                                    <Button
                                        disabled={currentQuestionIndex === quizMeta.questions.length - 1}
                                        onClick={nextQuestion}
                                    >
                                        Next Question
                                    </Button>
                                </Col>
                                <Col>
                                    {!isRevealed ? (
                                        <Button type="primary" danger onClick={revealAnswers}>
                                            Reveal Answers
                                        </Button>
                                    ) : (
                                        <Tag color="gold" style={{ fontSize: 14, padding: "6px 12px" }}>
                                            Answers Revealed
                                        </Tag>
                                    )}
                                </Col>
                            </Row>
                        </Card>
                    </Col>

                    <Col xs={24} md={8}>
                        <Card
                            title="Student QR Join Code"
                            style={{ textAlign: "center", marginBottom: 16 }}
                        >
                            <div
                                style={{
                                    background: "#fff",
                                    padding: 16,
                                    display: "inline-block",
                                    borderRadius: 8
                                }}
                            >
                                <QRCodeSVG value={joinUrl} size={180} />
                            </div>
                            <div style={{ marginTop: 12 }}>
                                <Text type="secondary">Scan with mobile camera or visit:</Text>
                                <br />
                                <Text copyable style={{ fontSize: 12 }}>
                                    {joinUrl}
                                </Text>
                            </div>
                        </Card>

                        <Card title={`Active Students (${totalStudents})`}>
                            {studentIds.length === 0 ? (
                                <Text type="secondary">Waiting for students to join...</Text>
                            ) : (
                                <Space direction="vertical" style={{ width: "100%" }}>
                                    {studentIds.map((sid, idx) => {
                                        const hasAnswered = !!currentQuestionAnswers[sid];
                                        return (
                                            <div
                                                key={sid}
                                                style={{
                                                    display: "flex",
                                                    justifyContent: "space-between",
                                                    alignItems: "center"
                                                }}
                                            >
                                                <Text>Student #{idx + 1}</Text>
                                                {hasAnswered ? (
                                                    <Tag color="green">Answered</Tag>
                                                ) : (
                                                    <Tag color="default">Thinking...</Tag>
                                                )}
                                            </div>
                                        );
                                    })}
                                </Space>
                            )}
                        </Card>
                    </Col>
                </Row>
            </Content>
        </Layout>
    );
}