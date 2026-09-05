export interface UserProgressionContribution {
  id: string;
  title: string;
  action: string;
  points: number;
  status?: string;
  createdAt: string;
}

export interface UserProgression {
  userId: string;
  user?: {
    id: string;
    name?: string;
    email?: string;
    avatarUrl?: string | null;
    department?: string;
    level?: string;
  };
  currentRank?: string;
  points?: number;
  totalPoints?: number;
  approvedUploadsCount?: number;
  rankTier?: string;
  progressPercentage?: number;
  nextRank?: string;
  pointsToNextRank?: number;
  recentContributions?: UserProgressionContribution[];
  updatedAt?: string;
}

export interface ProgressionQuery {
  page?: number;
  limit?: number;
  search?: string;
  department?: string;
}

export interface PaginatedProgressionResponse {
  success?: boolean;
  data?: UserProgression[];
  progression?: UserProgression[];
  items?: UserProgression[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  total?: number;
  totalPages?: number;
}
