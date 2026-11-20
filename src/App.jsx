import React, { useMemo, useState } from "react";
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
import { Button, Card, Checkbox, Radio, Select, Space, Tag, Typography } from "antd";
import TeacherScreen from "./components/TeacherScreen";
import StudentScreen from "./components/StudentScreen";
import {
    COURSES_DATA,
    formatTopicTitle,
    buildMultiCourseSessionQuiz
} from "./data/coursesData";

const { Title, Text } = Typography;

function generateRoomId(length = 6) {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let result = "";
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

function createInitialCourseConfigs() {
    return COURSES_DATA.reduce((acc, course) => {
        acc[course.id] = { topicIndex: 0, mode: "single" };
        return acc;
    }, {});
}

function QuizPickerHome() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const roomFromUrl = searchParams.get("room");

    const [selectedCourseIds, setSelectedCourseIds] = useState([COURSES_DATA[0].id]);
    const [configByCourseId, setConfigByCourseId] = useState(createInitialCourseConfigs);

    if (roomFromUrl) {
        return (
            <Navigate
                to={`/student?room=${encodeURIComponent(roomFromUrl)}`}
                replace
            />
        );
    }

    const updateCourseConfig = (courseId, patch) => {
        setConfigByCourseId((prev) => ({
            ...prev,
            [courseId]: {
                ...(prev[courseId] || { topicIndex: 0, mode: "single" }),
                ...patch
            }
        }));
    };

    const sessionQuiz = useMemo(
        () =>
            buildMultiCourseSessionQuiz(
                COURSES_DATA,
                selectedCourseIds,
                configByCourseId
            ),
        [selectedCourseIds, configByCourseId]
    );

    const handleStartSession = () => {
        const newRoomId = generateRoomId();
        navigate(`/teacher/${newRoomId}`, {
            state: { selectedQuiz: sessionQuiz }
        });
    };

    const selectedCourses = COURSES_DATA.filter((c) =>
        selectedCourseIds.includes(c.id)
    );

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
            <Card style={{ width: "100%", maxWidth: 680 }}>
                <Space direction="vertical" style={{ width: "100%" }} size="large">
                    <div>
                        <Title level={3} style={{ margin: 0 }}>
                            Start a Classroom Quiz
                        </Title>
                        <Text type="secondary">
                            Select one or more courses, then choose a topic and coverage for each.
                        </Text>
                    </div>

                    {/* 1. Course Selection (Single or Multiple) */}
                    <div>
                        <Text strong style={{ display: "block", marginBottom: 8 }}>
                            1. Select Courses
                        </Text>
                        <Checkbox.Group
                            value={selectedCourseIds}
                            onChange={(checkedValues) => setSelectedCourseIds(checkedValues)}
                            style={{ width: "100%" }}
                        >
                            <Space wrap size="middle">
                                {COURSES_DATA.map((course) => (
                                    <Checkbox key={course.id} value={course.id}>
                                        <Space size={6}>
                                            <Text strong>{course.title}</Text>
                                            <Tag color="blue">{course.subject}</Tag>
                                        </Space>
                                    </Checkbox>
                                ))}
                            </Space>
                        </Checkbox.Group>
                    </div>

                    {/* 2. Per-Course Topic & Coverage Configuration */}
                    {selectedCourses.length === 0 ? (
                        <Card style={{ background: "#fffbe6", borderColor: "#ffe58f" }}>
                            <Text type="warning">Select at least one course to configure topics.</Text>
                        </Card>
                    ) : (
                        <Space direction="vertical" style={{ width: "100%" }} size="middle">
                            {selectedCourses.map((course, courseIdx) => {
                                const cfg = configByCourseId[course.id] || {
                                    topicIndex: 0,
                                    mode: "single"
                                };

                                return (
                                    <Card
                                        key={course.id}
                                        size="small"
                                        title={
                                            <Space>
                                                <Text strong>
                                                    {courseIdx + 1}. {course.title}
                                                </Text>
                                                <Tag>{course.subject}</Tag>
                                            </Space>
                                        }
                                    >
                                        <Space
                                            direction="vertical"
                                            style={{ width: "100%" }}
                                            size="middle"
                                        >
                                            <div>
                                                <Text
                                                    type="secondary"
                                                    style={{ display: "block", marginBottom: 6 }}
                                                >
                                                    Target Topic
                                                </Text>
                                                <Select
                                                    size="large"
                                                    value={cfg.topicIndex}
                                                    onChange={(topicIndex) =>
                                                        updateCourseConfig(course.id, {
                                                            topicIndex,
                                                            mode: topicIndex === 0 ? "single" : cfg.mode
                                                        })
                                                    }
                                                    style={{ width: "100%" }}
                                                    options={course.topics.map((topic, idx) => ({
                                                        value: idx,
                                                        label: `${formatTopicTitle(topic, idx)} (${topic.questions.length} Q)`
                                                    }))}
                                                />
                                            </div>

                                            <div>
                                                <Text
                                                    type="secondary"
                                                    style={{ display: "block", marginBottom: 6 }}
                                                >
                                                    Topic Coverage
                                                </Text>
                                                <Radio.Group
                                                    value={cfg.mode}
                                                    onChange={(e) =>
                                                        updateCourseConfig(course.id, { mode: e.target.value })
                                                    }
                                                    optionType="button"
                                                    buttonStyle="solid"
                                                    style={{ width: "100%", display: "flex" }}
                                                >
                                                    <Radio.Button
                                                        value="single"
                                                        style={{ flex: 1, textAlign: "center" }}
                                                    >
                                                        Only this topic
                                                    </Radio.Button>
                                                    <Radio.Button
                                                        value="cumulative"
                                                        disabled={cfg.topicIndex === 0}
                                                        style={{ flex: 1, textAlign: "center" }}
                                                    >
                                                        This topic + all previous ({cfg.topicIndex + 1})
                                                    </Radio.Button>
                                                </Radio.Group>
                                            </div>
                                        </Space>
                                    </Card>
                                );
                            })}
                        </Space>
                    )}

                    <div
                        style={{
                            padding: "10px 14px",
                            background: "#f5f5f5",
                            borderRadius: 8,
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center"
                        }}
                    >
                        <Text type="secondary">
                            Total questions across {selectedCourses.length} course
                            {selectedCourses.length !== 1 ? "s" : ""}:
                        </Text>
                        <Tag color="geekblue">
                            {sessionQuiz.questions.length} question
                            {sessionQuiz.questions.length !== 1 ? "s" : ""}
                        </Tag>
                    </div>

                    <Button
                        type="primary"
                        block
                        size="large"
                        disabled={sessionQuiz.questions.length === 0}
                        onClick={handleStartSession}
                    >
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
    const selectedQuiz = location.state?.selectedQuiz;

    if (!selectedQuiz) {
        return <Navigate to="/" replace />;
    }

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