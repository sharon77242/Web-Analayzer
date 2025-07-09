export interface WebsiteData {
    url: string;
    title: string;
    description: string;
    keywords: string[];
    statusCode: number;
}

export interface TestResult {
    scenarioName: string;
    passed: boolean;
    details?: string;
}

export interface BugReport {
    id: number;
    description: string;
    status: 'open' | 'resolved';
    createdAt: Date;
    updatedAt: Date;
}