export interface Exam {
    id: string;
    rawDate : Date;
    date: string;
    enrolledUsers: UsersExam[];
    posibleUsers: UsersExam[];
}

export interface UsersExam {
    username: string;
}

export interface ExamUser {
    userId: string;
    username: string;
    email: string;
}