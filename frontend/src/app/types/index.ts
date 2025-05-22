export interface DailyGrade {
  id: number;
  attributes: {
    date: string;
    period1: number;
    period2: number;
    period3: number;
    period4: number;
    period5: number;
    period6: number;
    period7: number;
    notes?: string;
    createdAt: string;
    updatedAt: string;
    publishedAt: string;
  };
}

export interface ApiResponse<T> {
  data: T;
  meta: {
    pagination?: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

export interface ApiListResponse<T> {
  data: T[];
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}
