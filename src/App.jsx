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
import {
  Button,
  Card,
  Divider,
  Radio,
  Select,
  Space,
  Tag,
  Typography
} from "antd";
import TeacherScreen from "./components/TeacherScreen";
import StudentScreen from "./components/StudentScreen";
import {
  COURSES_DATA,
  formatTopicTitle,
  buildSessionQuiz
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

function buildCombinedQuizFromSelections(selections) {
  const questions = [];
  const titleParts = [];

  selections.forEach((sel, idx) => {
    const course =
      COURSES_DATA.find((c) => c.id === sel.courseId) || COURSES_DATA[0];
    const singleQuiz = buildSessionQuiz(course, sel.topicIndex, sel.mode);
    titleParts.push(singleQuiz.title);
    singleQuiz.questions.forEach((q, qIdx) => {
      questions.push({
        ...q,
        id: `${course.id}_${idx}_${q.id || qIdx}`
      });
    });
  });

  const subjects = Array.from(
    new Set(
      selections.map((sel) => {
        const course = COURSES_DATA.find((c) => c.id === sel.courseId);
        return course?.subject || "General";
      })
    )
  );

  return {
    id: `session__${Date.now()}`,
    title:
      titleParts.length > 0 ? titleParts.join(" + ") : "Classroom Quiz Session",
    subject: subjects.join(" & "),
    questions
  };
}

function QuizPickerHome() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const roomFromUrl = searchParams.get("room");

  // Only items added via "Add Course" become part of the session quiz
  const [addedSelections, setAddedSelections] = useState([]);

  // Current course/topic configuration form
  const [currentCourseId, setCurrentCourseId] = useState(COURSES_DATA[0].id);
  const [currentTopicIndex, setCurrentTopicIndex] = useState(0);
  const [currentMode, setCurrentMode] = useState("single"); // "single" | "cumulative"

  if (roomFromUrl) {
    return (
      <Navigate
        to={`/student?room=${encodeURIComponent(roomFromUrl)}`}
        replace
      />
    );
  }

  const currentCourse =
    COURSES_DATA.find((c) => c.id === currentCourseId) || COURSES_DATA[0];

  const currentPreviewQuiz = useMemo(
    () => buildSessionQuiz(currentCourse, currentTopicIndex, currentMode),
    [currentCourse, currentTopicIndex, currentMode]
  );

  const combinedQuiz = useMemo(
    () => buildCombinedQuizFromSelections(addedSelections),
    [addedSelections]
  );

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
    if (currentPreviewQuiz.questions.length === 0) return;

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

  const handleStartBigScreen = () => {
    if (addedSelections.length === 0 || combinedQuiz.questions.length === 0) {
      return;
    }
    const newRoomId = generateRoomId();
    navigate(`/teacher/${newRoomId}`, {
      state: { selectedQuiz: combinedQuiz }
    });
  };

  const canStartBigScreen =
    addedSelections.length > 0 && combinedQuiz.questions.length > 0;

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
              options={COURSES_DATA.map((course) => ({
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
              options={currentCourse.topics.map((topic, idx) => ({
                value: idx,
                label: `${formatTopicTitle(topic, idx)} (${topic.questions.length} Q)`
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
                disabled={currentTopicIndex === 0}
                style={{ flex: 1, textAlign: "center" }}
              >
                This topic + all previous ({currentTopicIndex + 1})
              </Radio.Button>
            </Radio.Group>
          </div>

          {/* Add Course Action */}
          <Button
            size="large"
            block
            disabled={currentPreviewQuiz.questions.length === 0}
            onClick={handleAddCourse}
          >
            Add Course ({currentPreviewQuiz.questions.length} Q)
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
                {combinedQuiz.questions.length} total question
                {combinedQuiz.questions.length !== 1 ? "s" : ""}
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
                    COURSES_DATA.find((c) => c.id === sel.courseId) ||
                    COURSES_DATA[0];
                  const subQuiz = buildSessionQuiz(
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
                          <Text strong>{subQuiz.title}</Text>
                          <div>
                            <Tag color="blue" style={{ marginTop: 4 }}>
                              {subQuiz.questions.length} question
                              {subQuiz.questions.length !== 1 ? "s" : ""}
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

          {/* Start Big Screen (disabled until at least one course is added) */}
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