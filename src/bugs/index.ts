export class BugTracker {
    private bugs: BugReport[] = [];

    logBug(bug: BugReport): void {
        this.bugs.push(bug);
    }

    getBugs(): BugReport[] {
        return this.bugs;
    }

    resolveBug(bugId: string): void {
        this.bugs = this.bugs.filter(bug => bug.id !== bugId);
    }
}

export interface BugReport {
    id: string;
    description: string;
    status: 'open' | 'resolved';
    createdAt: Date;
}