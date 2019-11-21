import * as vscode from "vscode";
import { camelCase, pascalCase, snakeCase, headerCase } from "change-case";

enum Case {
    Pascal = 'PascalCase',
    Camel = 'camelCase',
    Snake = 'snake_case',
    Kebab = 'kebab-case',
}

const configuration = new class {
	public regex = new RegExp("[\\w\\-]+");
	public transform = "camelCase";
}

/**
 * On extension activation
 */
export function activate(context: vscode.ExtensionContext) {
    vscode.commands.executeCommand("setContext", "vscode-proximus:enabled", true);

    /**
     * Configuration change handler
     */
    vscode.workspace.onDidChangeConfiguration(() => {
        let newConfiguration = vscode.workspace.getConfiguration("vscode-proximus");

        if (!newConfiguration) {
            return;
        }

        if (newConfiguration.has("regex")) {
            configuration.regex = new RegExp(newConfiguration.get("regex") as string);
        }

        if (newConfiguration.has("transform")) {
            configuration.transform = newConfiguration.get("transform") as string;
        }
    });

    vscode

    /**
     * Register command
     */
    context.subscriptions.push(
        vscode.commands.registerCommand("vscode-proximus.quickOpenFile", () => {
            const editor = vscode.window.activeTextEditor;

            if (!editor) {
                return;
            }

            const selection = editor.selection;

            const range = selection.isEmpty ?
                editor.document.getWordRangeAtPosition(selection.start, configuration.regex) :
                new vscode.Range(selection.start, selection.end);

            let text = editor.document.getText(range);

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
                    text = headerCase(text);
                    break;
            }

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
