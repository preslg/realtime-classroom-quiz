import React, { useState } from "react";
import {
    BrowserRouter,
    Routes,
    Route,
    Navigate,
    useNavigate,
    useSearchParams,
    useParams,
    useLocation
} from "react-router-dom";
import { Button, Card, Radio, Space, Tag, Typography } from "antd";
import TeacherScreen from "./components/TeacherScreen";
import StudentScreen from "./components/StudentScreen";
import { QUIZ_COLLECTION, DEFAULT_QUIZ } from "./data/defaultQuiz";

const { Title, Text } = Typography;

function generateRoomId(length = 6) {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let result = "";
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

function QuizPickerHome() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const roomFromUrl = searchParams.get("room");
    const [selectedQuizId, setSelectedQuizId] = useState(QUIZ_COLLECTION[0].id);

    // Redirect legacy/root ?room=XXXXXX links to /student?room=XXXXXX
    if (roomFromUrl) {
        return (
            <Navigate
                to={`/student?room=${encodeURIComponent(roomFromUrl)}`}
                replace
            />
        );
    }

    const selectedQuiz =
        QUIZ_COLLECTION.find((q) => q.id === selectedQuizId) || QUIZ_COLLECTION[0];

    const handleStartSession = () => {
        const newRoomId = generateRoomId();
        navigate(`/teacher/${newRoomId}?quizId=${selectedQuiz.id}`, {
            state: { selectedQuiz }
        });
    };

    return (
        <div
            style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                minHeight: "100vh",
                padding: 24,
                background: "#f0f2f5"
            }}
        >
            <Card style={{ width: "100%", maxWidth: 560 }}>
                <Space direction="vertical" style={{ width: "100%" }} size="large">
                    <div>
                        <Title level={3} style={{ margin: 0 }}>
                            Select a Quiz to Start
                        </Title>
                        <Text type="secondary">
                            Choose a quiz for the classroom session and open the big screen.
                        </Text>
                    </div>

                    <Radio.Group
                        value={selectedQuizId}
                        onChange={(e) => setSelectedQuizId(e.target.value)}
                        style={{ width: "100%" }}
                    >
                        <Space direction="vertical" style={{ width: "100%" }} size="middle">
                            {QUIZ_COLLECTION.map((quiz) => {
                                const isSelected = quiz.id === selectedQuizId;
                                return (
                                    <Card
                                        key={quiz.id}
                                        hoverable
                                        onClick={() => setSelectedQuizId(quiz.id)}
                                        bodyStyle={{ padding: 14 }}
                                        style={{
                                            border: isSelected ? "2px solid #1677ff" : "1px solid #d9d9d9",
                                            background: isSelected ? "#f0f7ff" : "#fff"
                                        }}
                                    >
                                        <div
                                            style={{
                                                display: "flex",
                                                justifyContent: "space-between",
                                                alignItems: "center"
                                            }}
                                        >
                                            <Space>
                                                <Radio value={quiz.id} />
                                                <div>
                                                    <div style={{ fontWeight: 600, fontSize: 15 }}>{quiz.title}</div>
                                                    <Text type="secondary" style={{ fontSize: 12 }}>
                                                        {quiz.questions.length} question
                                                        {quiz.questions.length !== 1 ? "s" : ""}
                                                    </Text>
                                                </div>
                                            </Space>
                                            <Tag color="blue">{quiz.subject}</Tag>
                                        </div>
                                    </Card>
                                );
                            })}
                        </Space>
                    </Radio.Group>

                    <Button type="primary" block size="large" onClick={handleStartSession}>
                        Open Big Screen
                    </Button>
                </Space>
            </Card>
        </div>
    );
}

function TeacherRouteWrapper() {
    const { roomId } = useParams();
    const location = useLocation();
    const [searchParams] = useSearchParams();

    const quizFromQuery = QUIZ_COLLECTION.find(
        (q) => q.id === searchParams.get("quizId")
    );
    const selectedQuiz =
        location.state?.selectedQuiz || quizFromQuery || DEFAULT_QUIZ;

    return <TeacherScreen roomId={roomId} selectedQuiz={selectedQuiz} />;
}

function StudentRouteWrapper() {
    const [searchParams] = useSearchParams();
    const roomId = searchParams.get("room");
    if (!roomId) {
        return (
            <div style={{ padding: 40, textAlign: "center" }}>
                Missing room code. Please scan the QR code shown by your teacher.
            </div>
        );
    }
    return <StudentScreen roomId={roomId} />;
}

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<QuizPickerHome />} />
                <Route path="/student" element={<StudentRouteWrapper />} />
                <Route path="/teacher/:roomId" element={<TeacherRouteWrapper />} />
            </Routes>
        </BrowserRouter>
    );
}