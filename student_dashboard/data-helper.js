import { db } from "./firebase-config.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

// Local Mock Data for Fallback/Demo Mode
export const localMockProfile = {
  name: "Ishika Gangwar",
  email: "ishika@example.com",
  department: "B.Tech CSE",
  overallProgress: 72,
  coursesEnrolledCount: 5,
  modulesCompletedCount: 28,
  averageGrade: "B+",
  cgpa: 8.3,
  semesterGpa: 8.7,
  creditsEarned: 22,
  attendance: 92,
  dayStreak: 12,
  hoursStudied: 64
};

export const localMockCourses = [
  { title: "React JS Fundamentals", instructor: "Abhay Kirti vikram", progress: 80, level: "Beginner", duration: "12 Hours", status: "In Progress", icon: "fa-brands fa-react", color: "blue" },
  { title: "Data Structures & Algorithms", instructor: "Paras", progress: 65, level: "Intermediate", duration: "30 Hours", status: "In Progress", icon: "fa-solid fa-code", color: "orange" },
  { title: "UI/UX Design Basics", instructor: "Prerit Saxena", progress: 90, level: "Advanced", duration: "24 Hours", status: "In Progress", icon: "fa-solid fa-shield-halved", color: "green" },
  { title: "Database Management Systems", instructor: "Varsha Choudhry", progress: 60, level: "Intermediate", duration: "18 Hours", status: "In Progress", icon: "fa-solid fa-database", color: "purple" },
  { title: "Communication Skills", instructor: "Diljit Kaur", progress: 40, level: "Beginner", duration: "8 Hours", status: "In Progress", icon: "fa-solid fa-comments", color: "yellow" }
];

export const localMockGrades = [
  { subject: "React JS", credits: 4, marks: 92, grade: "A+", status: "Passed" },
  { subject: "JavaScript", credits: 4, marks: 96, grade: "A+", status: "Passed" },
  { subject: "DSA", credits: 4, marks: 84, grade: "B+", status: "Passed" },
  { subject: "DBMS", credits: 5, marks: 90, grade: "A", status: "Passed" },
  { subject: "Communication", credits: 3, marks: 95, grade: "A+", status: "Passed" }
];

export const localMockProgress = {
  weeklyLearning: [2, 4, 3, 6, 5, 7, 4],
  gradeOverview: [72, 76, 74, 82, 88, 91],
  performanceTrend: [75, 80, 78, 84, 89, 92],
  recentAssessments: [
    { title: "Mid-Term Examination", score: "92%", date: "Completed Yesterday" },
    { title: "JavaScript Assignment", score: "96%", date: "3 Days Ago" },
    { title: "Database Quiz", score: "90%", date: "Last Week" }
  ]
};

export const localMockCalendar = {
  events: [
    { title: "Java Assignment", date: "25 July", time: "11:59 PM", icon: "fa-solid fa-book", type: "assignment" },
    { title: "DSA Coding Contest", date: "27 July", time: "09:00 AM", icon: "fa-solid fa-code", type: "contest" },
    { title: "Mid Semester Exam", date: "30 July", time: "10:00 AM", icon: "fa-solid fa-file-lines", type: "exam" },
    { title: "Communication Presentation", date: "02 August", time: "01:00 PM", icon: "fa-solid fa-microphone", type: "presentation" }
  ],
  dailySchedules: {
    5: [
      { title: "React JS Class", time: "09:00 AM - 10:30 AM", color: "purple" },
      { title: "DSA Lab", time: "11:00 AM - 01:00 PM", color: "blue" }
    ],
    12: [
      { title: "Java Assignment", time: "10:00 AM", color: "orange" }
    ],
    18: [
      { title: "DBMS Quiz", time: "02:30 PM", color: "orange" },
      { title: "Assignment Deadline", time: "11:59 PM", color: "red" }
    ],
    25: [
      { title: "Communication Workshop", time: "09:30 AM", color: "purple" }
    ]
  }
};

// Helper to extract a friendly name from email
export function extractNameFromEmail(email) {
  const username = email.split("@")[0];
  const cleanUsername = username.replace(/[0-9._-]+/g, " ").trim();
  return cleanUsername.split(" ").map(word => {
    if (!word) return "";
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  }).join(" ") || "New Student";
}

// Seeding Default Student Data into Firestore root collections (with blank/zero/null values for a new user)
export async function seedDefaultStudentData(uid, email) {
  const name = extractNameFromEmail(email);
  
  const depts = ["B.Tech CSE", "B.Tech IT", "B.Tech ECE", "B.Tech ME", "B.Tech Civil"];
  const department = depts[Math.floor(Math.random() * depts.length)];
  
  const overallProgress = 0;
  const coursesEnrolledCount = 0;
  const modulesCompletedCount = 0;
  
  const cgpa = 0.0;
  const semesterGpa = 0.0;
  const averageGrade = "N/A";
  
  const creditsEarned = 0;
  const attendance = 0;
  const dayStreak = 0;
  const hoursStudied = 0;

  const profile = {
    name,
    email,
    department,
    overallProgress,
    coursesEnrolledCount,
    modulesCompletedCount,
    averageGrade,
    cgpa,
    semesterGpa,
    creditsEarned,
    attendance,
    dayStreak,
    hoursStudied,
    photoUrl: ""
  };

  const courses = [];
  const grades = [];

  const progress = {
    weeklyLearning: [0, 0, 0, 0, 0, 0, 0],
    gradeOverview: [0, 0, 0, 0, 0, 0],
    performanceTrend: [0, 0, 0, 0, 0, 0],
    recentAssessments: []
  };

  const calendar = {
    events: [],
    dailySchedules: {}
  };

  // Set Profile in root collection
  await setDoc(doc(db, "students", uid), profile);

  // Set Courses in root collection (none since array is empty)
  for (let i = 0; i < courses.length; i++) {
    await setDoc(doc(db, "courses", `${uid}_course_${i}`), { ...courses[i], studentId: uid });
  }

  // Set Grades in root collection (none since array is empty)
  for (let i = 0; i < grades.length; i++) {
    await setDoc(doc(db, "grades", `${uid}_grade_${i}`), { ...grades[i], studentId: uid });
  }

  // Set Progress Metrics in root collection
  await setDoc(doc(db, "progress", uid), { ...progress, studentId: uid });

  // Set Calendar Schedule in root collection
  await setDoc(doc(db, "calendar", uid), { ...calendar, studentId: uid });
}
