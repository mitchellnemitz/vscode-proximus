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
    public excludePrefix: string[] = [];
    public excludeSuffix: string[] = [];
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
        configuration.regex = new RegExp(newConfiguration.get("regex") as string);
    }

    if (newConfiguration.has("excludePrefix")) {
        configuration.excludePrefix = newConfiguration.get("excludePrefix") as string[];
    }

    if (newConfiguration.has("excludeSuffix")) {
        configuration.excludeSuffix = newConfiguration.get("excludeSuffix") as string[];
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
                return;
            }

            const selection = editor.selection;

            const range = selection.isEmpty ?
                editor.document.getWordRangeAtPosition(selection.start, configuration.regex) :
                new vscode.Range(selection.start, selection.end);

            // Extract the text
            let text = editor.document.getText(range);

            // Remove the first matching prefix
            for (const prefix of configuration.excludePrefix) {
                if (text.startsWith(prefix)) {
                    text = text.slice(prefix.length);
                    break;
                }
            }

            // Remove the first matching suffix
            for (const suffix of configuration.excludeSuffix) {
                if (text.endsWith(suffix)) {
                    text = text.slice(0, -suffix.length);
                    break;
                }
            }

            // Change the case
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

            // Add the prefix and suffix
            text = configuration.prefix + text + configuration.suffix;

            // Show the quick open dialog
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
