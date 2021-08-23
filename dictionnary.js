import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';

const BEGIN = Symbol('begin');
const END = Symbol('end');

const ReflectUtils = {
	keys: function(obj) {
		return Reflect.ownKeys(obj);
	},
	values: function(obj) {
		return Reflect.ownKeys(obj).map(k => obj[k]);
	},
	entries: function(obj) {
		return Reflect.ownKeys(obj).map(k => [k, obj[k]]);
	}
};

class Dictionnary {
	constructor() {
		this.words = {};
	}

	addSubword(word, subword) {
		if (!this.words[word]) {
			this.words[word] = {};
		}
	
		if (!this.words[word][subword]) {
			this.words[word][subword] = 0;
		}
	
		this.words[word][subword]++;
	}

	parseFile(filename) {
		const set = readFileSync(filename, { encoding: 'utf-8' });

		// The text is often long, so we consider a line anything that end with a dot, comma, or line break.
		let lines = set.split(/\n|\.\s/)
			.map(v => v.trim())
			.filter(v => v !== '');

		// Extract words into a dictionnary
		lines.forEach(l => {
			const words = l.split(' ');

			this.addSubword(BEGIN, words[0]);

			for (let i = 0; i < words.length; i++) {
				const next = words[i + 1] || END;
				this.addSubword(words[i], next);
			}
		});

		// When done, compute probabilities
		for (const subwords of ReflectUtils.values(this.words)) {
			const totalOccurences = ReflectUtils.values(subwords)
										.reduce((cur, acc) => acc + cur, 0);
			let sumCum = 0;

			ReflectUtils.entries(subwords)
				.forEach(([subword, occurences]) =>
					subwords[subword] = (sumCum += occurences / totalOccurences));
		}
	}

	addDirectory(directory) {
		const content = readdirSync(directory, { encoding: 'utf-8' });
		content.forEach(file => {
			this.parseFile(join(directory, file));
		});
	}

	markovIter = function*(startWith = BEGIN) {
		let currentWord = startWith;

		while(currentWord !== END) {
			if(currentWord !== BEGIN) yield currentWord;

			const candidates = this.words[currentWord];
			const choice = Math.random();
			currentWord = ReflectUtils.entries(candidates)
					.find(([_, sumCum]) => sumCum > choice)[0];
		}
	};
};

export {
	Dictionnary,
	BEGIN,
	END,
};