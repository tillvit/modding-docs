function parseJSDoc(source) {
	const matches = [...source.matchAll(/(\/\*[^]+?\*\/)\s+(\w+)[^]+?}/g)].map((match) => {
		return { jsdoc: match[1], name: match[2] };
	});
	matches.forEach((obj) => {
		obj.params = [...obj.jsdoc.matchAll(/@param \{(\w+)\} (\w+)/g)].map((m) => {
			return { type: m[1], name: m[2] };
		});
	});
	return matches;
}

// write js
matches
	.map((match) => {
		return `${match.jsdoc}\n${match.name}(${match.params
			.map((param) => param.name + ': ' + param.type)
			.join(', ')}) {
  throw "${match.name}: method not implemented"
  }`;
	})
	.join('\n');

// lualib
obj = {};
lookup = {
	number: 'FArg',
	boolean: 'BIArg',
	string: 'SArg'
};
matches.forEach((match) => {
	obj[match.name] = {
		params: match.params.map((param) => lookup[param.type] ?? param.type)
	};
});
console.log(JSON.stringify(obj));
