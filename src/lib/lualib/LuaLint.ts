import { linter, type Diagnostic } from '@codemirror/lint';
import type { EditorView } from 'codemirror';
import luaparse from 'luaparse';

const linterExtension = (view: EditorView) => {
	try {
		luaparse.parse(view.state.doc.toString());
	} catch (e: any) {
		return [
			{
				from: e.index,
				to: e.index + 1,
				severity: 'error',
				message: e.stack.split('\n')[0]
			} as Diagnostic
		];
	}
	return [];
};

export const luaLint = linter(linterExtension);
