export class TestScenario {
    private scenarios: { [key: string]: () => Promise<void> } = {};

    defineScenario(name: string, scenario: () => Promise<void>): void {
        this.scenarios[name] = scenario;
    }

    async executeScenario(name: string): Promise<void> {
        if (this.scenarios[name]) {
            await this.scenarios[name]();
        } else {
            throw new Error(`Scenario "${name}" not defined.`);
        }
    }
}