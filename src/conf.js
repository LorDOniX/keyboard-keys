export const OCTAVES = 7;
export const TONES = ["C", "D", "E", "F", "G", "A", "B"];
export const HALF_TONES = [["C#", "Db"], ["D#", "Eb"], ["F#", "Gb"], ["G#", "Ab"], ["A#", "Bb"]];
export const ALL_TONES_SHARP = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
export const ALL_TONES_FLAT = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];
export const CHORDS_KEYS = ["MAJOR", "MINOR", "MAJOR 7th", "MINOR 7th", "DOMINANT 7th"];
export const CHORDS_NOTES = ["A", "B", "C", "D", "E", "F", "G", "AbG#", "BbA#", "DbC#", "EbD#", "GbF#"];
export const CHORDS_RULES = {};

// pravidla pro chords
// A MAJOR = [A, C#, E], A MINOR = [A, C, E], MAJOR 7TH = [A, C#, E, G#], MINOR 7TH = [A, C, E, G], DOMINANT 7TH = [A, C# E, G]
// a ind 9, 0, druhy ton 4, treti 7
// a ind 9, 0, druhy ton 3, treti 7
// major
CHORDS_RULES[CHORDS_KEYS[0]] = [0, 4, 7];
// minor
CHORDS_RULES[CHORDS_KEYS[1]] = [0, 3, 7];
// major 7th
CHORDS_RULES[CHORDS_KEYS[2]] = CHORDS_RULES[CHORDS_KEYS[0]].slice();
CHORDS_RULES[CHORDS_KEYS[2]].push(11);
// minor 7th
CHORDS_RULES[CHORDS_KEYS[3]] = CHORDS_RULES[CHORDS_KEYS[1]].slice();
CHORDS_RULES[CHORDS_KEYS[3]].push(10);
// dominant 7th
CHORDS_RULES[CHORDS_KEYS[4]] = CHORDS_RULES[CHORDS_KEYS[0]].slice();
CHORDS_RULES[CHORDS_KEYS[4]].push(10);
