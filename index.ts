import * as readline from "readline-sync";
import * as fs from "fs";
import * as os from "os";
import runes = require("runes");

interface Example {
    kiksht: string;
    english: string;
}

interface Form {
    kiksht: string;
    english: string;
}

type PartOfSpeech = "n" | "pron" | "vb" | "adv" | "part" | "interj";

interface Entry {
    root: string;
    partOfSpeech: PartOfSpeech;
    definition: string;
    forms: Form[];
    examples: Example[];
    notes: string;
    seeAlso: string[];
}

interface Dictionary {
    [key: string]: Entry;
}

const m = new Map([
    [/¬/g, "ł"],
    [/Å/g, "á"],
    [/Å/g, "á"],
    [/å/g, "ä"],
    [/ ̈/g, "ú"],
    [/̋/g, "G̲"],
    [/©/g, "g̲"],
    [/ ̨/g, "X̲"],
    [/ˆ/g, "í"],
    [/’/g, "'"],
    [/‘/g, "'"],
    [/“/g, '"'],
    [/”/g, '"']
]);

function normalize(s: string): string {
    let res = s.trim();
    for (const e of m.entries()) {
        res = res.replace(e[0], e[1]);
    }
    return res;
}

function readNormalize(question: string): string {
    return normalize(readline.question(question).trim());
}

// const dictionary = JSON.parse(fs.readFileSync("data/dictionary.json").toString());
const dictionary: any = {};

function parseFirst(s: string): { root: string; partOfSpeech: PartOfSpeech; definition: string } {
    const rs = runes(s);
    const openPos = rs.indexOf("[");
    const closePos = rs.indexOf("]");

    const root = rs.slice(0, openPos);
    const pos = rs.slice(openPos + 1, closePos);
    const definition = rs.slice(closePos + 1);
    return {
        root: normalize(root.join("")),
        partOfSpeech: <any>pos.join(""),
        definition: normalize(definition.join(""))
    };
}

function parseExamplesOrForms(runes: string[]): (Example | Form)[] {
    const examples = [];
    let rest = runes;
    while (true) {
        const openPos = rest.indexOf("“");
        let closePos = rest.indexOf("”");
        if (openPos == -1 || closePos == -1) {
            break;
        }

        let closeBracePos = rest.slice(closePos + 1).indexOf("]");
        if (closeBracePos == -1) {
            closeBracePos = closePos;
        }

        let nextOpenPos = rest.slice(closePos + 1).indexOf("“");
        if (nextOpenPos == -1) {
            nextOpenPos = 0;
        }

        const kiksht = rest.slice(0, openPos);
        let english: string[] = [];
        if (closeBracePos < nextOpenPos) {
            english = rest
                .slice(openPos + 1, closePos)
                .concat(rest.slice(closePos + 1, closePos + closeBracePos + 2));
            rest = rest.slice(closePos + closeBracePos + 2);
        } else {
            english = rest.slice(openPos + 1, closePos);
            rest = rest.slice(closePos + 1);
        }

        examples.push({ kiksht: normalize(kiksht.join("")), english: normalize(english.join("")) });
    }

    return examples;
}

function parseForms(s: string): { forms: Form[] } {
    const es = parseExamplesOrForms(runes(s.replace(/^Forms:/, "")));
    return { forms: es };
}

function parseExamples(s: string): { examples: Example[] } {
    const es = parseExamplesOrForms(runes(s.replace(/^Examples:/, "")));
    return { examples: es };
}

function parseSeeAlso(s: string): { seeAlso: string[] } {
    let rest = normalize(s)
        .replace(/^See also:/, "")
        .trim();
    return { seeAlso: [rest] };
}

function parseNotes(s: string): { notes: string } {
    let rest = normalize(s)
        .replace(/^Notes:/, "")
        .trim();
    return { notes: rest };
}

function parse(s: string): Entry {
    let entry: any;
    s.trim()
        .split(os.EOL)
        .forEach((line, i) => {
            const trimmed = line.trim();
            if (i == 0) {
                const first = parseFirst(trimmed);
                entry = { ...entry, ...first };
            } else if (trimmed.startsWith("Forms:")) {
                const forms = parseForms(line);
                entry = { ...entry, ...forms };
            } else if (trimmed.startsWith("Examples:")) {
                const examples = parseExamples(line);
                if (entry.examples === undefined) {
                    entry.examples = examples.examples;
                } else {
                    entry.examples = entry.examples.concat(examples.examples);
                }
            } else if (trimmed.startsWith("See also:")) {
                const seeAlso = parseSeeAlso(line);
                if (entry.seeAlso === undefined) {
                    entry.seeAlso = seeAlso.seeAlso;
                } else {
                    entry.seeAlso = entry.seeAlso.concat(seeAlso.seeAlso);
                }
            } else if (trimmed.startsWith("Notes:")) {
                const notes = parseNotes(trimmed);
                entry = { ...entry, ...notes };
            } else {
                throw `Unrecognized start: ${line}`;
            }
        });

    return entry;
}

const raw = fs.readFileSync("data/dictionary-raw.txt").toString();

let lines = raw.split(os.EOL).map(line => line.trim());
while (true) {
    const emptyPos = lines.indexOf("");
    if (emptyPos < 0) {
        break;
    }
    const entry = parse(lines.slice(0, emptyPos).join(os.EOL));
    if (entry.root.length > 0) {
        dictionary[entry.root] = entry;
    }
    lines = lines.slice(emptyPos + 1);
}

const ordered: any = {};
Object.keys(dictionary)
    .sort()
    .forEach(k => {
        ordered[k] = dictionary[k];
    });

fs.writeFileSync("data/dictionary.json", JSON.stringify(ordered, undefined, "  "));
