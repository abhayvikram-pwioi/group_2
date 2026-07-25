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

// Seeding Default Student Data into Firestore root collections
export async function seedDefaultStudentData(uid, email) {
  const name = extractNameFromEmail(email);
  
  const depts = ["B.Tech CSE", "B.Tech IT", "B.Tech ECE", "B.Tech ME", "B.Tech Civil"];
  const department = depts[Math.floor(Math.random() * depts.length)];
  
  const overallProgress = Math.floor(Math.random() * 36) + 50; // 50 to 85%
  const coursesEnrolledCount = 5;
  const modulesCompletedCount = Math.floor(Math.random() * 21) + 15; // 15 to 35
  
  const cgpa = parseFloat((Math.random() * 2.0 + 7.5).toFixed(1)); // 7.5 to 9.5
  const semesterGpa = parseFloat((Math.random() * 2.0 + 7.8).toFixed(1)); // 7.8 to 9.8
  const averageGrade = cgpa >= 9.0 ? "A+" : cgpa >= 8.0 ? "A" : cgpa >= 7.0 ? "B+" : "B";
  
  const creditsEarned = Math.floor(Math.random() * 5) + 20; // 20 to 24
  const attendance = Math.floor(Math.random() * 18) + 80; // 80 to 97
  const dayStreak = Math.floor(Math.random() * 23) + 3; // 3 to 25
  const hoursStudied = Math.floor(Math.random() * 51) + 30; // 30 to 80

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

  const courseProgresses = [
    Math.floor(Math.random() * 21) + 75, // 75 to 95%
    Math.floor(Math.random() * 26) + 50, // 50 to 75%
    Math.floor(Math.random() * 21) + 80, // 80 to 100%
    Math.floor(Math.random() * 31) + 50, // 50 to 80%
    Math.floor(Math.random() * 41) + 30  // 30 to 70%
  ];

  const courses = [
    { title: "React JS Fundamentals", instructor: "Mark Lewis", progress: courseProgresses[0], level: "Beginner", duration: "12 Hours", status: "In Progress", icon: "fa-brands fa-react", color: "blue" },
    { title: "Data Structures & Algorithms", instructor: "Sarah Johnson", progress: courseProgresses[1], level: "Intermediate", duration: "30 Hours", status: "In Progress", icon: "fa-solid fa-code", color: "orange" },
    { title: "UI/UX Design Basics", instructor: "David Smith", progress: courseProgresses[2], level: "Advanced", duration: "24 Hours", status: "In Progress", icon: "fa-solid fa-shield-halved", color: "green" },
    { title: "Database Management Systems", instructor: "Michael Brown", progress: courseProgresses[3], level: "Intermediate", duration: "18 Hours", status: "In Progress", icon: "fa-solid fa-database", color: "purple" },
    { title: "Communication Skills", instructor: "Emily Davis", progress: courseProgresses[4], level: "Beginner", duration: "8 Hours", status: "In Progress", icon: "fa-solid fa-comments", color: "yellow" }
  ];

  const getGradeFromMarks = (marks) => {
    if (marks >= 95) return "A+";
    if (marks >= 90) return "A";
    if (marks >= 80) return "B+";
    if (marks >= 70) return "B";
    return "C";
  };

  const courseMarks = [
    Math.floor(Math.random() * 15) + 84, // 84 to 98
    Math.floor(Math.random() * 15) + 84,
    Math.floor(Math.random() * 15) + 80,
    Math.floor(Math.random() * 15) + 80,
    Math.floor(Math.random() * 15) + 80
  ];

  const grades = [
    { subject: "React JS", credits: 4, marks: courseMarks[0], grade: getGradeFromMarks(courseMarks[0]), status: "Passed" },
    { subject: "JavaScript", credits: 4, marks: courseMarks[1], grade: getGradeFromMarks(courseMarks[1]), status: "Passed" },
    { subject: "DSA", credits: 4, marks: courseMarks[2], grade: getGradeFromMarks(courseMarks[2]), status: "Passed" },
    { subject: "DBMS", credits: 5, marks: courseMarks[3], grade: getGradeFromMarks(courseMarks[3]), status: "Passed" },
    { subject: "Communication", credits: 3, marks: courseMarks[4], grade: getGradeFromMarks(courseMarks[4]), status: "Passed" }
  ];

  const weeklyLearning = Array.from({ length: 7 }, () => Math.floor(Math.random() * 7) + 1);
  const gradeOverview = Array.from({ length: 6 }, () => Math.floor(Math.random() * 25) + 70);
  const performanceTrend = Array.from({ length: 6 }, () => Math.floor(Math.random() * 25) + 70);

  const progress = {
    weeklyLearning,
    gradeOverview,
    performanceTrend,
    recentAssessments: [
      { title: "Mid-Term Examination", score: `${courseMarks[0]}%`, date: "Completed Yesterday" },
      { title: "JavaScript Assignment", score: `${courseMarks[1]}%`, date: "3 Days Ago" },
      { title: "Database Quiz", score: `${courseMarks[3]}%`, date: "Last Week" }
    ]
  };

  const calendar = {
    events: [
      { title: "Java Assignment", date: "25 July", time: "11:59 PM", icon: "fa-solid fa-book" },
      { title: "DSA Coding Contest", date: "27 July", time: "09:00 AM", icon: "fa-solid fa-code" },
      { title: "Mid Semester Exam", date: "30 July", time: "10:00 AM", icon: "fa-solid fa-file-lines" },
      { title: "Communication Presentation", date: "02 August", time: "01:00 PM", icon: "fa-solid fa-microphone" }
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

  // Set Profile in root collection
  await setDoc(doc(db, "students", uid), profile);

  // Set Courses in root collection
  for (let i = 0; i < courses.length; i++) {
    await setDoc(doc(db, "courses", `${uid}_course_${i}`), { ...courses[i], studentId: uid });
  }

  // Set Grades in root collection
  for (let i = 0; i < grades.length; i++) {
    await setDoc(doc(db, "grades", `${uid}_grade_${i}`), { ...grades[i], studentId: uid });
  }

  // Set Progress Metrics in root collection
  await setDoc(doc(db, "progress", uid), { ...progress, studentId: uid });

  // Set Calendar Schedule in root collection
  await setDoc(doc(db, "calendar", uid), { ...calendar, studentId: uid });
}
