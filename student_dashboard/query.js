import { db } from "./firebase-config.js";
import {
    doc,
    getDoc,
    collection,
    query,
    where,
    getDocs
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

export async function getStudentData(uid) {

    try {

        // ===========================
        // Get student profile
        // ===========================
        const profileDoc = await getDoc(doc(db, "students", uid));

        const profile = profileDoc.exists()
            ? profileDoc.data()
            : null;


        // ===========================
        // Get student courses
        // ===========================
        const courseQuery = query(
            collection(db, "courses"),
            where("studentId", "==", uid)
        );

        const courseDocs = await getDocs(courseQuery);

        const courses = courseDocs.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));


        // ===========================
        // Get student grades
        // ===========================
        const gradeQuery = query(
            collection(db, "grades"),
            where("studentId", "==", uid)
        );

        const gradeDocs = await getDocs(gradeQuery);

        const grades = gradeDocs.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));


        // ===========================
        // Get progress
        // ===========================
        const progressDoc = await getDoc(doc(db, "progress", uid));

        const progress = progressDoc.exists()
            ? progressDoc.data()
            : null;


        // ===========================
        // Get calendar
        // ===========================
        const calendarDoc = await getDoc(doc(db, "calendar", uid));

        const calendar = calendarDoc.exists()
            ? calendarDoc.data()
            : null;


        // Return everything together
        return {
            profile,
            courses,
            grades,
            progress,
            calendar
        };

    } catch (error) {
        console.error(error);
    }
}