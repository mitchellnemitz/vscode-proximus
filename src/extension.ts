import * as vscode from "vscode";
import { camelCase, pascalCase, snakeCase, paramCase, pathCase, dotCase, noCase } from "change-case";

enum Case {
    Camel = "camelCase",
    Pascal = "PascalCase",
    Snake = "snake_case",
    Kebab = "kebab-case",
    Path = "path/case",
    Dot = "dot.case",
    No = "no case",
}

const configuration = new class {
    public regex = "[\\w\\-]+";
    public trimLeft: string[] = [];
    public trimRight: string[] = [];
    public transform = "none";
    public prefix = "";
    public suffix = "";
}

/**
 * Configuration change handler
 */
function configure() {
    let newConfiguration = vscode.workspace.getConfiguration("proximus");

    if (!newConfiguration) {
        return;
    }

    if (newConfiguration.has("regex")) {
        configuration.regex = newConfiguration.get("regex") as string;
    }

    if (newConfiguration.has("trimLeft")) {
        configuration.trimLeft = (newConfiguration.get("trimLeft") as string[]).sort((a, b) => b.length - a.length);
    }

    if (newConfiguration.has("trimRight")) {
        configuration.trimRight = (newConfiguration.get("trimRight") as string[]).sort((a, b) => b.length - a.length);
    }

    if (newConfiguration.has("transform")) {
        configuration.transform = newConfiguration.get("transform") as string;
    }

    if (newConfiguration.has("prefix")) {
        configuration.prefix = newConfiguration.get("prefix") as string;
    }

    if (newConfiguration.has("suffix")) {
        configuration.suffix = newConfiguration.get("suffix") as string;
    }
}

/**
 * On extension activation
 */
export function activate(context: vscode.ExtensionContext) {
    vscode.commands.executeCommand("setContext", "proximus:enabled", true);

    configure();

    vscode.workspace.onDidChangeConfiguration(configure);

    /**
     * Register command
     */
    context.subscriptions.push(
        vscode.commands.registerCommand("proximus.quickOpenFile", () => {
            const editor = vscode.window.activeTextEditor;

            if (!editor) {
                return vscode.commands.executeCommand("workbench.action.quickOpen");
            }

            const selection = editor.selection;
            const range = selection.isEmpty ?
                editor.document.getWordRangeAtPosition(selection.start, new RegExp(configuration.regex)) :
                new vscode.Range(selection.start, selection.end);

            if (!range) {
                return vscode.commands.executeCommand("workbench.action.quickOpen");
            }

            let text = editor.document.getText(range);

            for (const prefix of configuration.trimLeft) {
                if (text.startsWith(prefix)) {
                    text = text.slice(prefix.length);
                    break;
                }
            }

            for (const suffix of configuration.trimRight) {
                if (text.endsWith(suffix)) {
                    text = text.slice(0, -suffix.length);
                    break;
                }
            }

            if (!text.length) {
                return vscode.commands.executeCommand("workbench.action.quickOpen");
            }

            switch (configuration.transform) {
                case Case.Camel:
                    text = camelCase(text);
                    break;

                case Case.Pascal:
                    text = pascalCase(text);
                    break;

                case Case.Snake:
                    text = snakeCase(text);
                    break;

                case Case.Kebab:
                    text = paramCase(text);
                    break;

                case Case.Path:
                    text = pathCase(text);
                    break;

                case Case.Dot:
                    text = dotCase(text);
                    break;

                case Case.No:
                    text = noCase(text);
                    break;
            }

            text = configuration.prefix + text + configuration.suffix;

            vscode.commands.executeCommand("workbench.action.quickOpen", text);
        }),
    );
}

/**
 * On extension deactivation
 */
export function deactivate() {
    // noop
}
