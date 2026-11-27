import React from "react";
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
import CourseSelector from "./components/CourseSelector";
import TeacherScreen from "./components/TeacherScreen";
import StudentScreen from "./components/StudentScreen";

function QuizPickerHome() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const roomFromUrl = searchParams.get("room");

    if (roomFromUrl) {
        return (
            <Navigate
                to={`/student?room=${encodeURIComponent(roomFromUrl)}`}
                replace
            />
        );
    }

    const handleStartQuiz = (selections) => {
        if (!Array.isArray(selections) || selections.length === 0) return;
        navigate("/teacher/new", {
            state: { selections }
        });
    };

    return <CourseSelector onStartQuiz={handleStartQuiz} />;
}

function TeacherRouteWrapper() {
    const { roomId } = useParams();
    const location = useLocation();
    const selections = location.state?.selections;
    const resolvedRoomId = roomId === "new" ? null : roomId;

    if (!resolvedRoomId && (!Array.isArray(selections) || selections.length === 0)) {
        return <Navigate to="/" replace />;
    }

    return <TeacherScreen roomId={resolvedRoomId} selections={selections} />;
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