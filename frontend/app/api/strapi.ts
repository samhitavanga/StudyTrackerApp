const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://localhost:1337';

interface StudentRecord {
  id?: number;
  date: string;
  gpa: number;
  attendance: boolean;
  notes: string;
  subjects: SubjectGrade[];
}

interface SubjectGrade {
  id?: number;
  subject: string;
  grade: number;
}

export const strapiApi = {
  async login(identifier: string, password: string) {
    const response = await fetch(`${STRAPI_URL}/api/auth/local`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        identifier,
        password,
      }),
    });

    if (!response.ok) {
      throw new Error('Login failed');
    }

    return response.json();
  },

  async createStudentRecord(record: StudentRecord, token: string) {
    // First create the main record
    const recordResponse = await fetch(`${STRAPI_URL}/api/student-records`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        data: {
          date: record.date,
          gpa: record.gpa,
          attendance: record.attendance,
          notes: record.notes,
        },
      }),
    });

    if (!recordResponse.ok) {
      throw new Error('Failed to create student record');
    }

    const recordData = await recordResponse.json();
    const recordId = recordData.data.id;

    // Then create subject grades linked to the record
    const subjectPromises = record.subjects.map((subject) =>
      fetch(`${STRAPI_URL}/api/subject-grades`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          data: {
            subject: subject.subject,
            grade: subject.grade,
            record: recordId,
          },
        }),
      })
    );

    await Promise.all(subjectPromises);

    return recordData;
  },

  async getStudentRecords(token: string) {
    const response = await fetch(
      `${STRAPI_URL}/api/student-records?populate=*&sort=date:desc`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch student records');
    }

    return response.json();
  },

  async getStudentStats(token: string) {
    const records = await this.getStudentRecords(token);
    
    // Calculate statistics from records
    const stats = {
      currentGpa: 0,
      attendanceRate: 0,
      subjectAverages: {} as Record<string, number>,
    };

    if (records.data && records.data.length > 0) {
      // Calculate current GPA (most recent)
      stats.currentGpa = records.data[0].attributes.gpa;

      // Calculate attendance rate
      const attendanceCount = records.data.filter(
        (record: any) => record.attributes.attendance
      ).length;
      stats.attendanceRate = (attendanceCount / records.data.length) * 100;

      // Calculate subject averages
      const subjects = new Map<string, number[]>();
      records.data.forEach((record: any) => {
        record.attributes.subject_grades.data.forEach((grade: any) => {
          const subject = grade.attributes.subject;
          if (!subjects.has(subject)) {
            subjects.set(subject, []);
          }
          subjects.get(subject)?.push(grade.attributes.grade);
        });
      });

      subjects.forEach((grades, subject) => {
        const average =
          grades.reduce((sum, grade) => sum + grade, 0) / grades.length;
        stats.subjectAverages[subject] = average;
      });
    }

    return stats;
  },
};
