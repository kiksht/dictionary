// const root = readNormalize("root: ");
// console.log(root);
// const pos = readNormalize("part of speech: ");
// console.log(pos);
// const definition = readNormalize("definition: ");
// console.log(definition);

// const forms = [];
// while (true) {
//     const kiksht = readNormalize("kiksht form (press enter to skip): ");
//     if (kiksht.length == 0) {
//         break;
//     }
//     console.log(kiksht);
//     const english = readNormalize("english translation: ");
//     console.log(english);
//     forms.push({ kiksht, english });
// }

// const examples = [];
// while (true) {
//     const kiksht = readNormalize("kiksht example (press enter to skip): ");
//     if (kiksht.length == 0) {
//         break;
//     }
//     console.log(kiksht);
//     const english = readNormalize("english translation: ");
//     console.log(english);
//     examples.push({ kiksht, english });
// }

// const notes = readNormalize("notes (press enter to skip): ");
// console.log(notes);

// const seeAlso = readNormalize("see also (press enter to skip): ");
// console.log(seeAlso);

// dictionary[root] = {
//     root: root,
//     partOfSpeech: pos,
//     definition: definition,
//     ...(forms.length > 0 ? { forms: forms } : {}),
//     ...(examples.length > 0 ? { examples: examples } : {}),
//     ...(notes.length > 0 ? { notes: notes } : {}),
//     ...(seeAlso.length > 0 ? { seeAlso: seeAlso } : {})
// };
