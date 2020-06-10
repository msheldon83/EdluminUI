import "eslint";

//#region Node.js API

declare module "eslint" {
  export class ESLint {
    constructor(options?: ESLint.Options);

    lintFiles(patterns: string | string[]): Promise<ESLint.LintResult[]>;

    lintText(
      code: string,
      options?: { filePath?: string; warnIgnored?: boolean }
    ): Promise<ESLint.LintResult[]>;

    calculateConfigForFile(filePath: string): Promise<ESLint.ConfigData>;

    isPathIgnored(filePath: string): Promise<boolean>;

    loadFormatter(nameOrPath: string | undefined): Promise<ESLint.Formatter>;

    static version: string;

    outputFixes(results: ESLint.LintResult[]): Promise<void>;

    getErrorResults(results: ESLint.LintResult[]): ESLint.LintResult[];
  }

  export namespace ESLint {
    interface LintResult {
      filePath: string;
      messages: LintMessage[];
      fixableErrorCount: number;
      fixableWarningCount: number;
      errorCount: number;
      warningCount: number;
      output: string | undefined;
      source: string | undefined;
      usedDeprecatedRules: { ruleId: string; replacedBy: string[] }[];
    }

    interface LintMessage {
      ruleId: string | null;
      severity: 1 | 2;
      message: string;
      line: number;
      column: number;
      endLine: number | undefined;
      endColumn: number | undefined;
      fix: EditInfo | undefined;
      suggestions: { desc: string; fix: EditInfo }[] | undefined;
    }

    interface EditInfo {
      range: [number, number];
      text: string;
    }

    type Formatter = {
      format: (results: LintResult[]) => string;
    };

    type ConfigData = { [name: string]: any };

    type Plugin = any;

    interface Options {
      // Enumeration
      cwd?: string;
      errorOnUnmatchedPattern?: boolean;
      extensions?: string[];
      globInputPaths?: boolean;
      ignore?: boolean;
      ignorePath?: string;

      // Linting
      allowInlineConfig?: boolean;
      baseConfig?: ConfigData | null;
      overrideConfig?: ConfigData | null;
      overrideConfigFile?: string | null;
      plugins?: Record<string, Plugin> | null;
      reportUnusedDisableDirectives?: "error" | "warn" | "off" | null;
      resolvePluginsRelativeTo?: string | null;
      rulePaths?: string[];
      useEslintrc?: boolean;

      // Autofix
      fix?: boolean | ((message: LintMessage) => boolean);
      fixTypes?: ("problem" | "suggestion" | "layout")[] | null;

      // Cache-related
      cache?: boolean;
      cacheLocation?: string;
    }
  }
}
//#endregion
