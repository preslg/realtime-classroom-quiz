import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Alert,
    Button,
    Card,
    Divider,
    Radio,
    Select,
    Space,
    Spin,
    Tag,
    Typography
} from "antd";

const { Title, Text } = Typography;

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";

function getTopicQuestionCount(course, topicIndex, mode) {
    if (!course || !Array.isArray(course.topics) || course.topics.length === 0) {
        return 0;
    }
    const safeIdx = Math.max(
        0,
        Math.min(Number(topicIndex) || 0, course.topics.length - 1)
    );
    if (mode === "cumulative") {
        return course.topics
            .slice(0, safeIdx + 1)
            .reduce((sum, topic) => sum + (topic.questionCount || 0), 0);
    }
    return course.topics[safeIdx]?.questionCount || 0;
}

function formatSelectionLabel(course, selection) {
    if (!course) return "Selected Topic";
    const topics = course.topics || [];
    const safeIdx = Math.max(
        0,
        Math.min(Number(selection.topicIndex) || 0, topics.length - 1)
    );
    const topic = topics[safeIdx];
    const topicLabel = topic ? topic.title : `Topic ${safeIdx + 1}`;
    const scopeLabel =
        selection.mode === "cumulative" && safeIdx > 0
            ? `${topicLabel} + Previous (${safeIdx + 1})`
            : topicLabel;
    return `${course.title} — ${scopeLabel}`;
}

export default function CourseSelector({ onStartQuiz }) {
    const navigate = useNavigate();

    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [addedSelections, setAddedSelections] = useState([]);
    const [currentCourseId, setCurrentCourseId] = useState("");
    const [currentTopicIndex, setCurrentTopicIndex] = useState(0);
    const [currentMode, setCurrentMode] = useState("single");

    useEffect(() => {
        let active = true;

        async function loadCatalog() {
            setLoading(true);
            setError(null);
            try {
                const res = await fetch(`${API_BASE}/api/courses`);
                if (!res.ok) {
                    throw new Error(`Failed to load courses (${res.status})`);
                }
                const data = await res.json();
                const list = Array.isArray(data.courses) ? data.courses : [];
                if (active) {
                    setCourses(list);
                    if (list.length > 0) {
                        setCurrentCourseId((prev) => prev || list[0].id);
                    }
                }
            } catch (err) {
                if (active) {
                    setError(err.message || "Could not load courses from server.");
                }
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        }

        loadCatalog();
        return () => {
            active = false;
        };
    }, []);

    const currentCourse =
        courses.find((course) => course.id === currentCourseId) || courses[0] || null;

    const currentPreviewCount = useMemo(
        () => getTopicQuestionCount(currentCourse, currentTopicIndex, currentMode),
        [currentCourse, currentTopicIndex, currentMode]
    );

    const totalEstimatedQuestions = useMemo(() => {
        return addedSelections.reduce((sum, sel) => {
            const course = courses.find((c) => c.id === sel.courseId);
            return sum + getTopicQuestionCount(course, sel.topicIndex, sel.mode);
        }, 0);
    }, [addedSelections, courses]);

    const handleCourseChange = (courseId) => {
        setCurrentCourseId(courseId);
        setCurrentTopicIndex(0);
        setCurrentMode("single");
    };

    const handleTopicChange = (topicIndex) => {
        setCurrentTopicIndex(topicIndex);
        if (topicIndex === 0) {
            setCurrentMode("single");
        }
    };

    const handleAddCourse = () => {
        if (!currentCourse || currentPreviewCount === 0) return;

        setAddedSelections((prev) => [
            ...prev,
            {
                courseId: currentCourse.id,
                topicIndex: currentTopicIndex,
                mode: currentMode
            }
        ]);
    };

    const handleRemoveSelection = (indexToRemove) => {
        setAddedSelections((prev) => prev.filter((_, idx) => idx !== indexToRemove));
    };

    const canStartBigScreen =
        addedSelections.length > 0 && totalEstimatedQuestions > 0;

    const handleStartBigScreen = () => {
        if (!canStartBigScreen) return;

        if (typeof onStartQuiz === "function") {
            onStartQuiz(addedSelections);
        } else {
            navigate("/teacher/new", {
                state: { selections: addedSelections }
            });
        }
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
            <Card style={{ width: "100%", maxWidth: 640 }}>
                {loading ? (
                    <div style={{ padding: 36, textAlign: "center" }}>
                        <Spin size="large" />
                        <div style={{ marginTop: 12 }}>
                            <Text type="secondary">Loading courses from server...</Text>
                        </div>
                    </div>
                ) : error ? (
                    <Alert
                        type="error"
                        showIcon
                        message="Unable to Load Courses"
                        description={error}
                    />
                ) : !currentCourse ? (
                    <Alert
                        type="warning"
                        showIcon
                        message="No Courses Available"
                        description="No courses were returned by the server."
                    />
                ) : (
                    <Space direction="vertical" style={{ width: "100%" }} size="large">
                        <div>
                            <Title level={3} style={{ margin: 0 }}>
                                Build Classroom Quiz
                            </Title>
                            <Text type="secondary">
                                Configure a course and topic, click Add Course, then click Start Big Screen.
                            </Text>
                        </div>

                        {/* Step 1: Course */}
                        <div>
                            <Text strong style={{ display: "block", marginBottom: 8 }}>
                                1. Select Course
                            </Text>
                            <Select
                                size="large"
                                value={currentCourse.id}
                                onChange={handleCourseChange}
                                style={{ width: "100%" }}
                                options={courses.map((course) => ({
                                    value: course.id,
                                    label: `${course.title} (${course.subject})`
                                }))}
                            />
                        </div>

                        {/* Step 2: Topic */}
                        <div>
                            <Text strong style={{ display: "block", marginBottom: 8 }}>
                                2. Select Topic
                            </Text>
                            <Select
                                size="large"
                                value={currentTopicIndex}
                                onChange={handleTopicChange}
                                style={{ width: "100%" }}
                                options={(currentCourse.topics || []).map((topic, idx) => ({
                                    value: idx,
                                    label: `${topic.title} (${topic.questionCount} Q)`
                                }))}
                            />
                        </div>

                        {/* Step 3: Single vs. Cumulative */}
                        <div>
                            <Text strong style={{ display: "block", marginBottom: 8 }}>
                                3. Topic Scope
                            </Text>
                            <Radio.Group
                                value={currentMode}
                                onChange={(e) => setCurrentMode(e.target.value)}
                                style={{ width: "100%" }}
                            >
                                <Space direction="vertical" style={{ width: "100%" }} size={8}>
                                    <Radio value="single">Only this topic</Radio>
                                    <Radio value="cumulative" disabled={currentTopicIndex === 0}>
                                        This topic + all previous ({currentTopicIndex + 1})
                                    </Radio>
                                </Space>
                            </Radio.Group>
                        </div>

                        {/* Add Course Action */}
                        <Button
                            size="large"
                            block
                            disabled={currentPreviewCount === 0}
                            onClick={handleAddCourse}
                        >
                            Add Course ({currentPreviewCount} Q)
                        </Button>

                        {/* Added Courses List */}
                        <div>
                            <Divider style={{ margin: "4px 0 16px" }} />
                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    marginBottom: 8
                                }}
                            >
                                <Text strong>Added Courses ({addedSelections.length})</Text>
                                <Tag color={canStartBigScreen ? "geekblue" : "default"}>
                                    {totalEstimatedQuestions} total question
                                    {totalEstimatedQuestions !== 1 ? "s" : ""}
                                </Tag>
                            </div>

                            {addedSelections.length === 0 ? (
                                <Card size="small" style={{ background: "#fafafa" }}>
                                    <Text type="secondary">
                                        No courses added yet. Click &ldquo;Add Course&rdquo; above to enable Start Big Screen.
                                    </Text>
                                </Card>
                            ) : (
                                <Space direction="vertical" style={{ width: "100%" }} size="small">
                                    {addedSelections.map((sel, idx) => {
                                        const course =
                                            courses.find((c) => c.id === sel.courseId) ||
                                            currentCourse;
                                        const qCount = getTopicQuestionCount(
                                            course,
                                            sel.topicIndex,
                                            sel.mode
                                        );
                                        return (
                                            <Card
                                                key={`${sel.courseId}-${sel.topicIndex}-${sel.mode}-${idx}`}
                                                size="small"
                                                style={{ background: "#fafafa" }}
                                            >
                                                <div
                                                    style={{
                                                        display: "flex",
                                                        justifyContent: "space-between",
                                                        alignItems: "center",
                                                        gap: 8
                                                    }}
                                                >
                                                    <div>
                                                        <Text strong>
                                                            {formatSelectionLabel(course, sel)}
                                                        </Text>
                                                        <div>
                                                            <Tag color="blue" style={{ marginTop: 4 }}>
                                                                {qCount} question
                                                                {qCount !== 1 ? "s" : ""}
                                                            </Tag>
                                                        </div>
                                                    </div>
                                                    <Button
                                                        size="small"
                                                        danger
                                                        type="text"
                                                        onClick={() => handleRemoveSelection(idx)}
                                                    >
                                                        Remove
                                                    </Button>
                                                </div>
                                            </Card>
                                        );
                                    })}
                                </Space>
                            )}
                        </div>

                        {/* Start Big Screen */}
                        <Button
                            type="primary"
                            block
                            size="large"
                            disabled={!canStartBigScreen}
                            onClick={handleStartBigScreen}
                        >
                            Start Big Screen
                        </Button>
                    </Space>
                )}
            </Card>
        </div>
    );
}