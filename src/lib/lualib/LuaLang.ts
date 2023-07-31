import {
	LRLanguage,
	LanguageSupport,
	continuedIndent,
	delimitedIndent,
	foldInside,
	foldNodeProp,
	indentNodeProp
} from '@codemirror/language';
import { styleTags, tags as t } from '@lezer/highlight';
import { parser } from './parser.js';

const parserWithMetadata = parser.configure({
	props: [
		styleTags({
			LineComment: t.lineComment,
			BlockComment: t.blockComment,
			LabelName: t.labelName,
			VariableDefinition: t.definition(t.variableName),
			Number: t.number,
			String: t.string,
			Escape: t.escape,
			ArithOp: t.arithmeticOperator,
			LogicOp: t.logicOperator,
			BitOp: t.bitwiseOperator,
			CompareOp: t.compareOperator,
			self: t.self,
			MultilineString: t.special(t.string),
			VariableName: t.variableName,
			PropertyName: t.propertyName,
			'CallExpression/MemberExpression/PropertyName': t.function(t.propertyName),
			'for while do if else elseif then return break repeat until goto end': t.controlKeyword,
			in: t.operatorKeyword,
			'local function': t.definitionKeyword,
			BooleanLiteral: t.bool,
			'and not or': t.logicOperator,
			nil: t.null,
			'CallExpression/VariableName': t.function(t.variableName),
			'FunctionDeclaration/VariableDefinition': t.function(t.definition(t.variableName)),
			'ClassDeclaration/VariableDefinition': t.definition(t.className),
			'( )': t.paren,
			'[ ]': t.squareBracket,
			'{ }': t.brace,
			Equals: t.definitionOperator
		}),
		indentNodeProp.add({
			IfStatement: continuedIndent({ except: /^\s*(then\b|else\b|elseif\b|end\b)/ }),
			'FunctionDeclaration FunctionExpression ForStatement WhileStatement DoStatement':
				delimitedIndent({
					closing: 'end',
					align: false
				}),
			RepeatStatement: continuedIndent({ except: /^\s*(until\b|end\b)/ }),
			TableExpression: delimitedIndent({ closing: '}' })
		}),
		foldNodeProp.add({
			Application: foldInside
		})
	]
});

export const luaLang = LRLanguage.define({
	parser: parserWithMetadata,
	languageData: {
		closeBrackets: { brackets: ['(', '[', '{', "'", '"'] },
		commentTokens: { line: '--', block: { open: '--[[', close: '--]]' } },
		indentOnInput: /^\s*(then|else|elseif|end|until|\}|\{)$/
	}
});

export const lua = new LanguageSupport(luaLang);
