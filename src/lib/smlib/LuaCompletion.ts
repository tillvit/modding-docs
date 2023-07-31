import type { CompletionContext } from '@codemirror/autocomplete';
import { syntaxTree } from '@codemirror/language';

const tagOptions = ['constructor', 'deprecated', 'link', 'param', 'returns', 'type'].map((tag) => ({
	label: '@' + tag,
	type: 'keyword'
}));

const keywords = [
	'and',
	'break',
	'elseif',
	'false',
	'nil',
	'not',
	'or',
	'return',
	'true',
	'function',
	'end',
	'if',
	'then',
	'else',
	'do',
	'while',
	'repeat',
	'until',
	'for',
	'in',
	'local'
].map((tag) => ({ label: tag, type: 'keyword' }));

function keywordComplete(context: CompletionContext) {
	const tree = syntaxTree(context.state);
	const nodeBefore = tree.resolveInner(context.pos, -1);
	console.log(tree);
	window.tree = tree;
	if (nodeBefore.name != 'variableName') return null;
	const textBefore = context.state.sliceDoc(nodeBefore.from, context.pos);
	const keywordBefore = /\w*$/.exec(textBefore);
	if (!keywordBefore && !context.explicit) return null;
	return {
		from: keywordBefore ? nodeBefore.from + keywordBefore.index : context.pos,
		options: keywords,
		validFor: /^(\w*)?$/
	};
}

function luaComplete(context: CompletionContext) {
	const tree = syntaxTree(context.state);
	const nodeBefore = syntaxTree(context.state).resolveInner(context.pos, -1);
	if (
		nodeBefore.name != 'BlockComment' ||
		context.state.sliceDoc(nodeBefore.from, nodeBefore.from + 3) != '/**'
	)
		return null;
	const textBefore = context.state.sliceDoc(nodeBefore.from, context.pos);
	const tagBefore = /@\w*$/.exec(textBefore);
	if (!tagBefore && !context.explicit) return null;
	return {
		from: tagBefore ? nodeBefore.from + tagBefore.index : context.pos,
		options: tagOptions,
		validFor: /^(@\w*)?$/
	};
}

export const luaCompletion = {
	override: [keywordComplete, luaComplete]
};
