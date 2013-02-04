/*
---
name: Slick.Parser
description: Standalone CSS3 Selector parser
provides: Slick.Parser
...
*/

(function(){

var parsed,
	separatorIndex,
	combinatorIndex,
	reversed,
	cache = {},
	reverseCache = {},
	reUnescape = /\\/g;

var parse = function(expression, isReversed){
	if (expression == null) return null;
	if (expression.Slick === true) return expression;
	expression = ('' + expression).replace(/^\s+|\s+$/g, '');
	reversed = !!isReversed;
	var currentCache = (reversed) ? reverseCache : cache;
	if (currentCache[expression]) return currentCache[expression];
	parsed = {Slick: true, expressions: [], raw: expression, reverse: function(){
		return parse(this.raw, true);
	}};
	separatorIndex = -1;
	while (expression != (expression = expression.replace(regexp, parser)));
	parsed.length = parsed.expressions.length;
	return currentCache[expression] = (reversed) ? reverse(parsed) : parsed;
};

var reverseCombinator = function(combinator){
	if (combinator === '!') return ' ';
	else if (combinator === ' ') return '!';
	else if ((/^!/).test(combinator)) return combinator.replace(/^!/, '');
	else return '!' + combinator;
};

var reverse = function(expression){
	var expressions = expression.expressions;
	for (var i = 0; i < expressions.length; i++){
		var exp = expressions[i];
		var last = {parts: [], tag: '*', combinator: reverseCombinator(exp[0].combinator)};

		for (var j = 0; j < exp.length; j++){
			var cexp = exp[j];
			if (!cexp.reverseCombinator) cexp.reverseCombinator = ' ';
			cexp.combinator = cexp.reverseCombinator;
			delete cexp.reverseCombinator;
		}

		exp.reverse().push(last);
	}
	return expression;
};

var escapeRegExp = function(string){// Credit: XRegExp 0.6.1 (c) 2007-2008 Steven Levithan <http://stevenlevithan.com/regex/xregexp/> MIT License
	return string.replace(/[-[\]{}()*+?.\\^$|,#\s]/g, "\\$&");
};

var regexp = new RegExp(
/*
#!/usr/bin/env ruby
puts "\t\t" + DATA.read.gsub(/\(\?x\)|\s+#.*$|\s+|\\$|\\n/,'')
__END__
	"(?x)^(?:\
	  \\s* ( , ) \\s*               # Separator          \n\
	| \\s* ( <combinator>+ ) \\s*   # Combinator         \n\
	|      ( \\s+ )                 # CombinatorChildren \n\
	|      ( <unicode>+ | \\* )     # Tag                \n\
	| \\#  ( <unicode>+       )     # ID                 \n\
	| \\.  ( <unicode>+       )     # ClassName          \n\
	|                               # Attribute          \n\
	\\[  \
		\\s* (<unicode1>+)  (?:  \
			\\s* ([*^$!~|]?=)  (?:  \
				\\s* (?:\
					([\"']?)(.*?)\\9 \
				)\
			)  \
		)?  \\s*  \
	\\](?!\\]) \n\
	|   :+ ( <unicode>+ )(?:\
	\\( (?:\
		(?:([\"'])([^\\12]*)\\12)|((?:\\([^)]+\\)|[^()]*)+)\
	) \\)\
	)?\
	)"
*/
	"^(?:\\s*(,)\\s*|\\s*(<combinator>+)\\s*|(\\s+)|(<unicode>+|\\*)|\\#(<unicode>+)|\\.(<unicode>+)|\\[\\s*(<unicode1>+)(?:\\s*([*^$!~|]?=)(?:\\s*(?:([\"']?)(.*?)\\9)))?\\s*\\](?!\\])|:+(<unicode>+)(?:\\((?:(?:([\"'])([^\\12]*)\\12)|((?:\\([^)]+\\)|[^()]*)+))\\))?)"
	.replace(/<combinator>/, '[' + escapeRegExp(">+~`!@$%^&={}\\;</") + ']')
	.replace(/<unicode>/g, '(?:[\\w\\u00a1-\\uFFFF-]|\\\\[^\\s0-9a-f])')
	.replace(/<unicode1>/g, '(?:[:\\w\\u00a1-\\uFFFF-]|\\\\[^\\s0-9a-f])')
);

function parser(
	rawMatch,

	separator,
	combinator,
	combinatorChildren,

	tagName,
	id,
	className,

	attributeKey,
	attributeOperator,
	attributeQuote,
	attributeValue,

	pseudoClass,
	pseudoQuote,
	pseudoClassQuotedValue,
	pseudoClassValue
){
	if (separator || separatorIndex === -1){
		parsed.expressions[++separatorIndex] = [];
		combinatorIndex = -1;
		if (separator) return '';
	}

	if (combinator || combinatorChildren || combinatorIndex === -1){
		combinator = combinator || ' ';
		var currentSeparator = parsed.expressions[separatorIndex];
		if (reversed && currentSeparator[combinatorIndex])
			currentSeparator[combinatorIndex].reverseCombinator = reverseCombinator(combinator);
		currentSeparator[++combinatorIndex] = {combinator: combinator, tag: '*'};
	}

	var currentParsed = parsed.expressions[separatorIndex][combinatorIndex];

	if (tagName){
		currentParsed.tag = tagName.replace(reUnescape, '');

	} else if (id){
		currentParsed.id = id.replace(reUnescape, '');

	} else if (className){
		className = className.replace(reUnescape, '');

		if (!currentParsed.classList) currentParsed.classList = [];
		if (!currentParsed.classes) currentParsed.classes = [];
		currentParsed.classList.push(className);
		currentParsed.classes.push({
			value: className,
			regexp: new RegExp('(^|\\s)' + escapeRegExp(className) + '(\\s|$)')
		});

	} else if (pseudoClass){
		pseudoClassValue = pseudoClassValue || pseudoClassQuotedValue;
		pseudoClassValue = pseudoClassValue ? pseudoClassValue.replace(reUnescape, '') : null;

		if (!currentParsed.pseudos) currentParsed.pseudos = [];
		currentParsed.pseudos.push({
			key: pseudoClass.replace(reUnescape, ''),
			value: pseudoClassValue
		});

	} else if (attributeKey){
		attributeKey = attributeKey.replace(reUnescape, '');
		attributeValue = (attributeValue || '').replace(reUnescape, '');

		var test, regexp;

		switch (attributeOperator){
			case '^=' : regexp = new RegExp(       '^'+ escapeRegExp(attributeValue)            ); break;
			case '$=' : regexp = new RegExp(            escapeRegExp(attributeValue) +'$'       ); break;
			case '~=' : regexp = new RegExp( '(^|\\s)'+ escapeRegExp(attributeValue) +'(\\s|$)' ); break;
			case '|=' : regexp = new RegExp(       '^'+ escapeRegExp(attributeValue) +'(-|$)'   ); break;
			case  '=' : test = function(value){
				return attributeValue == value;
			}; break;
			case '*=' : test = function(value){
				return value && value.indexOf(attributeValue) > -1;
			}; break;
			case '!=' : test = function(value){
				return attributeValue != value;
			}; break;
			default   : test = function(value){
				return !!value;
			};
		}

		if (attributeValue == '' && (/^[*$^]=$/).test(attributeOperator)) test = function(){
			return false;
		};

		if (!test) test = function(value){
			return value && regexp.test(value);
		};

		if (!currentParsed.attributes) currentParsed.attributes = [];
		currentParsed.attributes.push({
			key: attributeKey,
			operator: attributeOperator,
			value: attributeValue,
			test: test
		});

	}

	return '';
};

// Slick NS

var Slick = (this.Slick || {});

Slick.parse = function(expression){
	return parse(expression);
};

Slick.escapeRegExp = escapeRegExp;

if (!this.Slick) this.Slick = Slick;

}).apply(/*<CommonJS>*/(typeof exports != 'undefined') ? exports : /*</CommonJS>*/this);

/*!
 * Sizzle CSS Selector Engine - v1.0
 *  Copyright 2009, The Dojo Foundation
 *  Released under the MIT, BSD, and GPL Licenses.
 *  More information: http://sizzlejs.com/
 */
(function(){

var chunker = /((?:\((?:\([^()]+\)|[^()]+)+\)|\[(?:\[[^\[\]]*\]|['"][^'"]*['"]|[^\[\]'"]+)+\]|\\.|[^ >+~,(\[\\]+)+|[>+~])(\s*,\s*)?((?:.|\r|\n)*)/g,
	done = 0,
	toString = Object.prototype.toString,
	hasDuplicate = false,
	baseHasDuplicate = true;

// Here we check if the JavaScript engine is using some sort of
// optimization where it does not always call our comparision
// function. If that is the case, discard the hasDuplicate value.
//   Thus far that includes Google Chrome.
[0, 0].sort(function() {
	baseHasDuplicate = false;
	return 0;
});

var Sizzle = function( selector, context, results, seed ) {
	results = results || [];
	context = context || document;

	var origContext = context;

	if ( context.nodeType !== 1 && context.nodeType !== 9 ) {
		return [];
	}
	
	if ( !selector || typeof selector !== "string" ) {
		return results;
	}

	var m, set, checkSet, extra, ret, cur, pop, i,
		prune = true,
		contextXML = Sizzle.isXML( context ),
		parts = [],
		soFar = selector;
	
	// Reset the position of the chunker regexp (start from head)
	do {
		chunker.exec( "" );
		m = chunker.exec( soFar );

		if ( m ) {
			soFar = m[3];
		
			parts.push( m[1] );
		
			if ( m[2] ) {
				extra = m[3];
				break;
			}
		}
	} while ( m );

	if ( parts.length > 1 && origPOS.exec( selector ) ) {

		if ( parts.length === 2 && Expr.relative[ parts[0] ] ) {
			set = posProcess( parts[0] + parts[1], context );

		} else {
			set = Expr.relative[ parts[0] ] ?
				[ context ] :
				Sizzle( parts.shift(), context );

			while ( parts.length ) {
				selector = parts.shift();

				if ( Expr.relative[ selector ] ) {
					selector += parts.shift();
				}
				
				set = posProcess( selector, set );
			}
		}

	} else {
		// Take a shortcut and set the context if the root selector is an ID
		// (but not if it'll be faster if the inner selector is an ID)
		if ( !seed && parts.length > 1 && context.nodeType === 9 && !contextXML &&
				Expr.match.ID.test(parts[0]) && !Expr.match.ID.test(parts[parts.length - 1]) ) {

			ret = Sizzle.find( parts.shift(), context, contextXML );
			context = ret.expr ?
				Sizzle.filter( ret.expr, ret.set )[0] :
				ret.set[0];
		}

		if ( context ) {
			ret = seed ?
				{ expr: parts.pop(), set: makeArray(seed) } :
				Sizzle.find( parts.pop(), parts.length === 1 && (parts[0] === "~" || parts[0] === "+") && context.parentNode ? context.parentNode : context, contextXML );

			set = ret.expr ?
				Sizzle.filter( ret.expr, ret.set ) :
				ret.set;

			if ( parts.length > 0 ) {
				checkSet = makeArray( set );

			} else {
				prune = false;
			}

			while ( parts.length ) {
				cur = parts.pop();
				pop = cur;

				if ( !Expr.relative[ cur ] ) {
					cur = "";
				} else {
					pop = parts.pop();
				}

				if ( pop == null ) {
					pop = context;
				}

				Expr.relative[ cur ]( checkSet, pop, contextXML );
			}

		} else {
			checkSet = parts = [];
		}
	}

	if ( !checkSet ) {
		checkSet = set;
	}

	if ( !checkSet ) {
		Sizzle.error( cur || selector );
	}

	if ( toString.call(checkSet) === "[object Array]" ) {
		if ( !prune ) {
			results.push.apply( results, checkSet );

		} else if ( context && context.nodeType === 1 ) {
			for ( i = 0; checkSet[i] != null; i++ ) {
				if ( checkSet[i] && (checkSet[i] === true || checkSet[i].nodeType === 1 && Sizzle.contains(context, checkSet[i])) ) {
					results.push( set[i] );
				}
			}

		} else {
			for ( i = 0; checkSet[i] != null; i++ ) {
				if ( checkSet[i] && checkSet[i].nodeType === 1 ) {
					results.push( set[i] );
				}
			}
		}

	} else {
		makeArray( checkSet, results );
	}

	if ( extra ) {
		Sizzle( extra, origContext, results, seed );
		Sizzle.uniqueSort( results );
	}

	return results;
};

Sizzle.uniqueSort = function( results ) {
	if ( sortOrder ) {
		hasDuplicate = baseHasDuplicate;
		results.sort( sortOrder );

		if ( hasDuplicate ) {
			for ( var i = 1; i < results.length; i++ ) {
				if ( results[i] === results[ i - 1 ] ) {
					results.splice( i--, 1 );
				}
			}
		}
	}

	return results;
};

Sizzle.matches = function( expr, set ) {
	return Sizzle( expr, null, null, set );
};

Sizzle.matchesSelector = function( node, expr ) {
	return Sizzle( expr, null, null, [node] ).length > 0;
};

Sizzle.find = function( expr, context, isXML ) {
	var set;

	if ( !expr ) {
		return [];
	}

	for ( var i = 0, l = Expr.order.length; i < l; i++ ) {
		var match,
			type = Expr.order[i];
		
		if ( (match = Expr.leftMatch[ type ].exec( expr )) ) {
			var left = match[1];
			match.splice( 1, 1 );

			if ( left.substr( left.length - 1 ) !== "\\" ) {
				match[1] = (match[1] || "").replace(/\\/g, "");
				set = Expr.find[ type ]( match, context, isXML );

				if ( set != null ) {
					expr = expr.replace( Expr.match[ type ], "" );
					break;
				}
			}
		}
	}

	if ( !set ) {
		set = context.getElementsByTagName( "*" );
	}

	return { set: set, expr: expr };
};

Sizzle.filter = function( expr, set, inplace, not ) {
	var match, anyFound,
		old = expr,
		result = [],
		curLoop = set,
		isXMLFilter = set && set[0] && Sizzle.isXML( set[0] );

	while ( expr && set.length ) {
		for ( var type in Expr.filter ) {
			if ( (match = Expr.leftMatch[ type ].exec( expr )) != null && match[2] ) {
				var found, item,
					filter = Expr.filter[ type ],
					left = match[1];

				anyFound = false;

				match.splice(1,1);

				if ( left.substr( left.length - 1 ) === "\\" ) {
					continue;
				}

				if ( curLoop === result ) {
					result = [];
				}

				if ( Expr.preFilter[ type ] ) {
					match = Expr.preFilter[ type ]( match, curLoop, inplace, result, not, isXMLFilter );

					if ( !match ) {
						anyFound = found = true;

					} else if ( match === true ) {
						continue;
					}
				}

				if ( match ) {
					for ( var i = 0; (item = curLoop[i]) != null; i++ ) {
						if ( item ) {
							found = filter( item, match, i, curLoop );
							var pass = not ^ !!found;

							if ( inplace && found != null ) {
								if ( pass ) {
									anyFound = true;

								} else {
									curLoop[i] = false;
								}

							} else if ( pass ) {
								result.push( item );
								anyFound = true;
							}
						}
					}
				}

				if ( found !== undefined ) {
					if ( !inplace ) {
						curLoop = result;
					}

					expr = expr.replace( Expr.match[ type ], "" );

					if ( !anyFound ) {
						return [];
					}

					break;
				}
			}
		}

		// Improper expression
		if ( expr === old ) {
			if ( anyFound == null ) {
				Sizzle.error( expr );

			} else {
				break;
			}
		}

		old = expr;
	}

	return curLoop;
};

Sizzle.error = function( msg ) {
	throw "Syntax error, unrecognized expression: " + msg;
};

var Expr = Sizzle.selectors = {
	order: [ "ID", "NAME", "TAG" ],

	match: {
		ID: /#((?:[\w\u00c0-\uFFFF\-]|\\.)+)/,
		CLASS: /\.((?:[\w\u00c0-\uFFFF\-]|\\.)+)/,
		NAME: /\[name=['"]*((?:[\w\u00c0-\uFFFF\-]|\\.)+)['"]*\]/,
		ATTR: /\[\s*((?:[\w\u00c0-\uFFFF\-]|\\.)+)\s*(?:(\S?=)\s*(['"]*)(.*?)\3|)\s*\]/,
		TAG: /^((?:[\w\u00c0-\uFFFF\*\-]|\\.)+)/,
		CHILD: /:(only|nth|last|first)-child(?:\(\s*(even|odd|(?:[+\-]?\d+|(?:[+\-]?\d*)?n\s*(?:[+\-]\s*\d+)?))\s*\))?/,
		POS: /:(nth|eq|gt|lt|first|last|even|odd)(?:\((\d*)\))?(?=[^\-]|$)/,
		PSEUDO: /:((?:[\w\u00c0-\uFFFF\-]|\\.)+)(?:\((['"]?)((?:\([^\)]+\)|[^\(\)]*)+)\2\))?/
	},

	leftMatch: {},

	attrMap: {
		"class": "className",
		"for": "htmlFor"
	},

	attrHandle: {
		href: function( elem ) {
			return elem.getAttribute( "href" );
		}
	},

	relative: {
		"+": function(checkSet, part){
			var isPartStr = typeof part === "string",
				isTag = isPartStr && !/\W/.test( part ),
				isPartStrNotTag = isPartStr && !isTag;

			if ( isTag ) {
				part = part.toLowerCase();
			}

			for ( var i = 0, l = checkSet.length, elem; i < l; i++ ) {
				if ( (elem = checkSet[i]) ) {
					while ( (elem = elem.previousSibling) && elem.nodeType !== 1 ) {}

					checkSet[i] = isPartStrNotTag || elem && elem.nodeName.toLowerCase() === part ?
						elem || false :
						elem === part;
				}
			}

			if ( isPartStrNotTag ) {
				Sizzle.filter( part, checkSet, true );
			}
		},

		">": function( checkSet, part ) {
			var elem,
				isPartStr = typeof part === "string",
				i = 0,
				l = checkSet.length;

			if ( isPartStr && !/\W/.test( part ) ) {
				part = part.toLowerCase();

				for ( ; i < l; i++ ) {
					elem = checkSet[i];

					if ( elem ) {
						var parent = elem.parentNode;
						checkSet[i] = parent.nodeName.toLowerCase() === part ? parent : false;
					}
				}

			} else {
				for ( ; i < l; i++ ) {
					elem = checkSet[i];

					if ( elem ) {
						checkSet[i] = isPartStr ?
							elem.parentNode :
							elem.parentNode === part;
					}
				}

				if ( isPartStr ) {
					Sizzle.filter( part, checkSet, true );
				}
			}
		},

		"": function(checkSet, part, isXML){
			var nodeCheck,
				doneName = done++,
				checkFn = dirCheck;

			if ( typeof part === "string" && !/\W/.test(part) ) {
				part = part.toLowerCase();
				nodeCheck = part;
				checkFn = dirNodeCheck;
			}

			checkFn( "parentNode", part, doneName, checkSet, nodeCheck, isXML );
		},

		"~": function( checkSet, part, isXML ) {
			var nodeCheck,
				doneName = done++,
				checkFn = dirCheck;

			if ( typeof part === "string" && !/\W/.test( part ) ) {
				part = part.toLowerCase();
				nodeCheck = part;
				checkFn = dirNodeCheck;
			}

			checkFn( "previousSibling", part, doneName, checkSet, nodeCheck, isXML );
		}
	},

	find: {
		ID: function( match, context, isXML ) {
			if ( typeof context.getElementById !== "undefined" && !isXML ) {
				var m = context.getElementById(match[1]);
				// Check parentNode to catch when Blackberry 4.6 returns
				// nodes that are no longer in the document #6963
				return m && m.parentNode ? [m] : [];
			}
		},

		NAME: function( match, context ) {
			if ( typeof context.getElementsByName !== "undefined" ) {
				var ret = [],
					results = context.getElementsByName( match[1] );

				for ( var i = 0, l = results.length; i < l; i++ ) {
					if ( results[i].getAttribute("name") === match[1] ) {
						ret.push( results[i] );
					}
				}

				return ret.length === 0 ? null : ret;
			}
		},

		TAG: function( match, context ) {
			return context.getElementsByTagName( match[1] );
		}
	},
	preFilter: {
		CLASS: function( match, curLoop, inplace, result, not, isXML ) {
			match = " " + match[1].replace(/\\/g, "") + " ";

			if ( isXML ) {
				return match;
			}

			for ( var i = 0, elem; (elem = curLoop[i]) != null; i++ ) {
				if ( elem ) {
					if ( not ^ (elem.className && (" " + elem.className + " ").replace(/[\t\n\r]/g, " ").indexOf(match) >= 0) ) {
						if ( !inplace ) {
							result.push( elem );
						}

					} else if ( inplace ) {
						curLoop[i] = false;
					}
				}
			}

			return false;
		},

		ID: function( match ) {
			return match[1].replace(/\\/g, "");
		},

		TAG: function( match, curLoop ) {
			return match[1].toLowerCase();
		},

		CHILD: function( match ) {
			if ( match[1] === "nth" ) {
				if ( !match[2] ) {
					Sizzle.error( match[0] );
				}

				match[2] = match[2].replace(/^\+|\s*/g, '');

				// parse equations like 'even', 'odd', '5', '2n', '3n+2', '4n-1', '-n+6'
				var test = /(-?)(\d*)(?:n([+\-]?\d*))?/.exec(
					match[2] === "even" && "2n" || match[2] === "odd" && "2n+1" ||
					!/\D/.test( match[2] ) && "0n+" + match[2] || match[2]);

				// calculate the numbers (first)n+(last) including if they are negative
				match[2] = (test[1] + (test[2] || 1)) - 0;
				match[3] = test[3] - 0;
			}
			else if ( match[2] ) {
				Sizzle.error( match[0] );
			}

			// TODO: Move to normal caching system
			match[0] = done++;

			return match;
		},

		ATTR: function( match, curLoop, inplace, result, not, isXML ) {
			var name = match[1].replace(/\\/g, "");
			
			if ( !isXML && Expr.attrMap[name] ) {
				match[1] = Expr.attrMap[name];
			}

			if ( match[2] === "~=" ) {
				match[4] = " " + match[4] + " ";
			}

			return match;
		},

		PSEUDO: function( match, curLoop, inplace, result, not ) {
			if ( match[1] === "not" ) {
				// If we're dealing with a complex expression, or a simple one
				if ( ( chunker.exec(match[3]) || "" ).length > 1 || /^\w/.test(match[3]) ) {
					match[3] = Sizzle(match[3], null, null, curLoop);

				} else {
					var ret = Sizzle.filter(match[3], curLoop, inplace, true ^ not);

					if ( !inplace ) {
						result.push.apply( result, ret );
					}

					return false;
				}

			} else if ( Expr.match.POS.test( match[0] ) || Expr.match.CHILD.test( match[0] ) ) {
				return true;
			}
			
			return match;
		},

		POS: function( match ) {
			match.unshift( true );

			return match;
		}
	},
	
	filters: {
		enabled: function( elem ) {
			return elem.disabled === false && elem.type !== "hidden";
		},

		disabled: function( elem ) {
			return elem.disabled === true;
		},

		checked: function( elem ) {
			return elem.checked === true;
		},
		
		selected: function( elem ) {
			// Accessing this property makes selected-by-default
			// options in Safari work properly
			elem.parentNode.selectedIndex;
			
			return elem.selected === true;
		},

		parent: function( elem ) {
			return !!elem.firstChild;
		},

		empty: function( elem ) {
			return !elem.firstChild;
		},

		has: function( elem, i, match ) {
			return !!Sizzle( match[3], elem ).length;
		},

		header: function( elem ) {
			return (/h\d/i).test( elem.nodeName );
		},

		text: function( elem ) {
			return "text" === elem.type;
		},
		radio: function( elem ) {
			return "radio" === elem.type;
		},

		checkbox: function( elem ) {
			return "checkbox" === elem.type;
		},

		file: function( elem ) {
			return "file" === elem.type;
		},
		password: function( elem ) {
			return "password" === elem.type;
		},

		submit: function( elem ) {
			return "submit" === elem.type;
		},

		image: function( elem ) {
			return "image" === elem.type;
		},

		reset: function( elem ) {
			return "reset" === elem.type;
		},

		button: function( elem ) {
			return "button" === elem.type || elem.nodeName.toLowerCase() === "button";
		},

		input: function( elem ) {
			return (/input|select|textarea|button/i).test( elem.nodeName );
		}
	},
	setFilters: {
		first: function( elem, i ) {
			return i === 0;
		},

		last: function( elem, i, match, array ) {
			return i === array.length - 1;
		},

		even: function( elem, i ) {
			return i % 2 === 0;
		},

		odd: function( elem, i ) {
			return i % 2 === 1;
		},

		lt: function( elem, i, match ) {
			return i < match[3] - 0;
		},

		gt: function( elem, i, match ) {
			return i > match[3] - 0;
		},

		nth: function( elem, i, match ) {
			return match[3] - 0 === i;
		},

		eq: function( elem, i, match ) {
			return match[3] - 0 === i;
		}
	},
	filter: {
		PSEUDO: function( elem, match, i, array ) {
			var name = match[1],
				filter = Expr.filters[ name ];

			if ( filter ) {
				return filter( elem, i, match, array );

			} else if ( name === "contains" ) {
				return (elem.textContent || elem.innerText || Sizzle.getText([ elem ]) || "").indexOf(match[3]) >= 0;

			} else if ( name === "not" ) {
				var not = match[3];

				for ( var j = 0, l = not.length; j < l; j++ ) {
					if ( not[j] === elem ) {
						return false;
					}
				}

				return true;

			} else {
				Sizzle.error( name );
			}
		},

		CHILD: function( elem, match ) {
			var type = match[1],
				node = elem;

			switch ( type ) {
				case "only":
				case "first":
					while ( (node = node.previousSibling) )	 {
						if ( node.nodeType === 1 ) { 
							return false; 
						}
					}

					if ( type === "first" ) { 
						return true; 
					}

					node = elem;

				case "last":
					while ( (node = node.nextSibling) )	 {
						if ( node.nodeType === 1 ) { 
							return false; 
						}
					}

					return true;

				case "nth":
					var first = match[2],
						last = match[3];

					if ( first === 1 && last === 0 ) {
						return true;
					}
					
					var doneName = match[0],
						parent = elem.parentNode;
	
					if ( parent && (parent.sizcache !== doneName || !elem.nodeIndex) ) {
						var count = 0;
						
						for ( node = parent.firstChild; node; node = node.nextSibling ) {
							if ( node.nodeType === 1 ) {
								node.nodeIndex = ++count;
							}
						} 

						parent.sizcache = doneName;
					}
					
					var diff = elem.nodeIndex - last;

					if ( first === 0 ) {
						return diff === 0;

					} else {
						return ( diff % first === 0 && diff / first >= 0 );
					}
			}
		},

		ID: function( elem, match ) {
			return elem.nodeType === 1 && elem.getAttribute("id") === match;
		},

		TAG: function( elem, match ) {
			return (match === "*" && elem.nodeType === 1) || elem.nodeName.toLowerCase() === match;
		},
		
		CLASS: function( elem, match ) {
			return (" " + (elem.className || elem.getAttribute("class")) + " ")
				.indexOf( match ) > -1;
		},

		ATTR: function( elem, match ) {
			var name = match[1],
				result = Expr.attrHandle[ name ] ?
					Expr.attrHandle[ name ]( elem ) :
					elem[ name ] != null ?
						elem[ name ] :
						elem.getAttribute( name ),
				value = result + "",
				type = match[2],
				check = match[4];

			return result == null ?
				type === "!=" :
				type === "=" ?
				value === check :
				type === "*=" ?
				value.indexOf(check) >= 0 :
				type === "~=" ?
				(" " + value + " ").indexOf(check) >= 0 :
				!check ?
				value && result !== false :
				type === "!=" ?
				value !== check :
				type === "^=" ?
				value.indexOf(check) === 0 :
				type === "$=" ?
				value.substr(value.length - check.length) === check :
				type === "|=" ?
				value === check || value.substr(0, check.length + 1) === check + "-" :
				false;
		},

		POS: function( elem, match, i, array ) {
			var name = match[2],
				filter = Expr.setFilters[ name ];

			if ( filter ) {
				return filter( elem, i, match, array );
			}
		}
	}
};

var origPOS = Expr.match.POS,
	fescape = function(all, num){
		return "\\" + (num - 0 + 1);
	};

for ( var type in Expr.match ) {
	Expr.match[ type ] = new RegExp( Expr.match[ type ].source + (/(?![^\[]*\])(?![^\(]*\))/.source) );
	Expr.leftMatch[ type ] = new RegExp( /(^(?:.|\r|\n)*?)/.source + Expr.match[ type ].source.replace(/\\(\d+)/g, fescape) );
}

var makeArray = function( array, results ) {
	array = Array.prototype.slice.call( array, 0 );

	if ( results ) {
		results.push.apply( results, array );
		return results;
	}
	
	return array;
};

// Perform a simple check to determine if the browser is capable of
// converting a NodeList to an array using builtin methods.
// Also verifies that the returned array holds DOM nodes
// (which is not the case in the Blackberry browser)
try {
	Array.prototype.slice.call( document.documentElement.childNodes, 0 )[0].nodeType;

// Provide a fallback method if it does not work
} catch( e ) {
	makeArray = function( array, results ) {
		var i = 0,
			ret = results || [];

		if ( toString.call(array) === "[object Array]" ) {
			Array.prototype.push.apply( ret, array );

		} else {
			if ( typeof array.length === "number" ) {
				for ( var l = array.length; i < l; i++ ) {
					ret.push( array[i] );
				}

			} else {
				for ( ; array[i]; i++ ) {
					ret.push( array[i] );
				}
			}
		}

		return ret;
	};
}

var sortOrder, siblingCheck;

if ( document.documentElement.compareDocumentPosition ) {
	sortOrder = function( a, b ) {
		if ( a === b ) {
			hasDuplicate = true;
			return 0;
		}

		if ( !a.compareDocumentPosition || !b.compareDocumentPosition ) {
			return a.compareDocumentPosition ? -1 : 1;
		}

		return a.compareDocumentPosition(b) & 4 ? -1 : 1;
	};

} else {
	sortOrder = function( a, b ) {
		var al, bl,
			ap = [],
			bp = [],
			aup = a.parentNode,
			bup = b.parentNode,
			cur = aup;

		// The nodes are identical, we can exit early
		if ( a === b ) {
			hasDuplicate = true;
			return 0;

		// If the nodes are siblings (or identical) we can do a quick check
		} else if ( aup === bup ) {
			return siblingCheck( a, b );

		// If no parents were found then the nodes are disconnected
		} else if ( !aup ) {
			return -1;

		} else if ( !bup ) {
			return 1;
		}

		// Otherwise they're somewhere else in the tree so we need
		// to build up a full list of the parentNodes for comparison
		while ( cur ) {
			ap.unshift( cur );
			cur = cur.parentNode;
		}

		cur = bup;

		while ( cur ) {
			bp.unshift( cur );
			cur = cur.parentNode;
		}

		al = ap.length;
		bl = bp.length;

		// Start walking down the tree looking for a discrepancy
		for ( var i = 0; i < al && i < bl; i++ ) {
			if ( ap[i] !== bp[i] ) {
				return siblingCheck( ap[i], bp[i] );
			}
		}

		// We ended someplace up the tree so do a sibling check
		return i === al ?
			siblingCheck( a, bp[i], -1 ) :
			siblingCheck( ap[i], b, 1 );
	};

	siblingCheck = function( a, b, ret ) {
		if ( a === b ) {
			return ret;
		}

		var cur = a.nextSibling;

		while ( cur ) {
			if ( cur === b ) {
				return -1;
			}

			cur = cur.nextSibling;
		}

		return 1;
	};
}

// Utility function for retreiving the text value of an array of DOM nodes
Sizzle.getText = function( elems ) {
	var ret = "", elem;

	for ( var i = 0; elems[i]; i++ ) {
		elem = elems[i];

		// Get the text from text nodes and CDATA nodes
		if ( elem.nodeType === 3 || elem.nodeType === 4 ) {
			ret += elem.nodeValue;

		// Traverse everything else, except comment nodes
		} else if ( elem.nodeType !== 8 ) {
			ret += Sizzle.getText( elem.childNodes );
		}
	}

	return ret;
};

// Check to see if the browser returns elements by name when
// querying by getElementById (and provide a workaround)
(function(){
	// We're going to inject a fake input element with a specified name
	var form = document.createElement("div"),
		id = "script" + (new Date()).getTime(),
		root = document.documentElement;

	form.innerHTML = "<a name='" + id + "'/>";

	// Inject it into the root element, check its status, and remove it quickly
	root.insertBefore( form, root.firstChild );

	// The workaround has to do additional checks after a getElementById
	// Which slows things down for other browsers (hence the branching)
	if ( document.getElementById( id ) ) {
		Expr.find.ID = function( match, context, isXML ) {
			if ( typeof context.getElementById !== "undefined" && !isXML ) {
				var m = context.getElementById(match[1]);

				return m ?
					m.id === match[1] || typeof m.getAttributeNode !== "undefined" && m.getAttributeNode("id").nodeValue === match[1] ?
						[m] :
						undefined :
					[];
			}
		};

		Expr.filter.ID = function( elem, match ) {
			var node = typeof elem.getAttributeNode !== "undefined" && elem.getAttributeNode("id");

			return elem.nodeType === 1 && node && node.nodeValue === match;
		};
	}

	root.removeChild( form );

	// release memory in IE
	root = form = null;
})();

(function(){
	// Check to see if the browser returns only elements
	// when doing getElementsByTagName("*")

	// Create a fake element
	var div = document.createElement("div");
	div.appendChild( document.createComment("") );

	// Make sure no comments are found
	if ( div.getElementsByTagName("*").length > 0 ) {
		Expr.find.TAG = function( match, context ) {
			var results = context.getElementsByTagName( match[1] );

			// Filter out possible comments
			if ( match[1] === "*" ) {
				var tmp = [];

				for ( var i = 0; results[i]; i++ ) {
					if ( results[i].nodeType === 1 ) {
						tmp.push( results[i] );
					}
				}

				results = tmp;
			}

			return results;
		};
	}

	// Check to see if an attribute returns normalized href attributes
	div.innerHTML = "<a href='#'></a>";

	if ( div.firstChild && typeof div.firstChild.getAttribute !== "undefined" &&
			div.firstChild.getAttribute("href") !== "#" ) {

		Expr.attrHandle.href = function( elem ) {
			return elem.getAttribute( "href", 2 );
		};
	}

	// release memory in IE
	div = null;
})();

if ( document.querySelectorAll ) {
	(function(){
		var oldSizzle = Sizzle,
			div = document.createElement("div"),
			id = "__sizzle__";

		div.innerHTML = "<p class='TEST'></p>";

		// Safari can't handle uppercase or unicode characters when
		// in quirks mode.
		if ( div.querySelectorAll && div.querySelectorAll(".TEST").length === 0 ) {
			return;
		}
	
		Sizzle = function( query, context, extra, seed ) {
			context = context || document;

			// Make sure that attribute selectors are quoted
			query = query.replace(/\=\s*([^'"\]]*)\s*\]/g, "='$1']");

			// Only use querySelectorAll on non-XML documents
			// (ID selectors don't work in non-HTML documents)
			if ( !seed && !Sizzle.isXML(context) ) {
				if ( context.nodeType === 9 ) {
					try {
						return makeArray( context.querySelectorAll(query), extra );
					} catch(qsaError) {}

				// qSA works strangely on Element-rooted queries
				// We can work around this by specifying an extra ID on the root
				// and working up from there (Thanks to Andrew Dupont for the technique)
				// IE 8 doesn't work on object elements
				} else if ( context.nodeType === 1 && context.nodeName.toLowerCase() !== "object" ) {
					var old = context.getAttribute( "id" ),
						nid = old || id,
						hasParent = context.parentNode,
						relativeHierarchySelector = /^\s*[+~]/.test( query );

					if ( !old ) {
						context.setAttribute( "id", nid );
					} else {
						nid = nid.replace( /'/g, "\\$&" );
					}
					if ( relativeHierarchySelector && hasParent ) {
						context = context.parentNode;
					}

					try {
						if ( !relativeHierarchySelector || hasParent ) {
							return makeArray( context.querySelectorAll( "[id='" + nid + "'] " + query ), extra );
						}

					} catch(pseudoError) {
					} finally {
						if ( !old ) {
							context.removeAttribute( "id" );
						}
					}
				}
			}
		
			return oldSizzle(query, context, extra, seed);
		};

		for ( var prop in oldSizzle ) {
			Sizzle[ prop ] = oldSizzle[ prop ];
		}

		// release memory in IE
		div = null;
	})();
}

(function(){
	var html = document.documentElement,
		matches = html.matchesSelector || html.mozMatchesSelector || html.webkitMatchesSelector || html.msMatchesSelector,
		pseudoWorks = false;

	try {
		// This should fail with an exception
		// Gecko does not error, returns false instead
		matches.call( document.documentElement, "[test!='']:sizzle" );
	
	} catch( pseudoError ) {
		pseudoWorks = true;
	}

	if ( matches ) {
		Sizzle.matchesSelector = function( node, expr ) {
			// Make sure that attribute selectors are quoted
			expr = expr.replace(/\=\s*([^'"\]]*)\s*\]/g, "='$1']");

			if ( !Sizzle.isXML( node ) ) {
				try { 
					if ( pseudoWorks || !Expr.match.PSEUDO.test( expr ) && !/!=/.test( expr ) ) {
						return matches.call( node, expr );
					}
				} catch(e) {}
			}

			return Sizzle(expr, null, null, [node]).length > 0;
		};
	}
})();

(function(){
	var div = document.createElement("div");

	div.innerHTML = "<div class='test e'></div><div class='test'></div>";

	// Opera can't find a second classname (in 9.6)
	// Also, make sure that getElementsByClassName actually exists
	if ( !div.getElementsByClassName || div.getElementsByClassName("e").length === 0 ) {
		return;
	}

	// Safari caches class attributes, doesn't catch changes (in 3.2)
	div.lastChild.className = "e";

	if ( div.getElementsByClassName("e").length === 1 ) {
		return;
	}
	
	Expr.order.splice(1, 0, "CLASS");
	Expr.find.CLASS = function( match, context, isXML ) {
		if ( typeof context.getElementsByClassName !== "undefined" && !isXML ) {
			return context.getElementsByClassName(match[1]);
		}
	};

	// release memory in IE
	div = null;
})();

function dirNodeCheck( dir, cur, doneName, checkSet, nodeCheck, isXML ) {
	for ( var i = 0, l = checkSet.length; i < l; i++ ) {
		var elem = checkSet[i];

		if ( elem ) {
			var match = false;

			elem = elem[dir];

			while ( elem ) {
				if ( elem.sizcache === doneName ) {
					match = checkSet[elem.sizset];
					break;
				}

				if ( elem.nodeType === 1 && !isXML ){
					elem.sizcache = doneName;
					elem.sizset = i;
				}

				if ( elem.nodeName.toLowerCase() === cur ) {
					match = elem;
					break;
				}

				elem = elem[dir];
			}

			checkSet[i] = match;
		}
	}
}

function dirCheck( dir, cur, doneName, checkSet, nodeCheck, isXML ) {
	for ( var i = 0, l = checkSet.length; i < l; i++ ) {
		var elem = checkSet[i];

		if ( elem ) {
			var match = false;
			
			elem = elem[dir];

			while ( elem ) {
				if ( elem.sizcache === doneName ) {
					match = checkSet[elem.sizset];
					break;
				}

				if ( elem.nodeType === 1 ) {
					if ( !isXML ) {
						elem.sizcache = doneName;
						elem.sizset = i;
					}

					if ( typeof cur !== "string" ) {
						if ( elem === cur ) {
							match = true;
							break;
						}

					} else if ( Sizzle.filter( cur, [elem] ).length > 0 ) {
						match = elem;
						break;
					}
				}

				elem = elem[dir];
			}

			checkSet[i] = match;
		}
	}
}

if ( document.documentElement.contains ) {
	Sizzle.contains = function( a, b ) {
		return a !== b && (a.contains ? a.contains(b) : true);
	};

} else if ( document.documentElement.compareDocumentPosition ) {
	Sizzle.contains = function( a, b ) {
		return !!(a.compareDocumentPosition(b) & 16);
	};

} else {
	Sizzle.contains = function() {
		return false;
	};
}

Sizzle.isXML = function( elem ) {
	// documentElement is verified for cases where it doesn't yet exist
	// (such as loading iframes in IE - #4833) 
	var documentElement = (elem ? elem.ownerDocument || elem : 0).documentElement;

	return documentElement ? documentElement.nodeName !== "HTML" : false;
};

var posProcess = function( selector, context ) {
	var match,
		tmpSet = [],
		later = "",
		root = context.nodeType ? [context] : context;

	// Position selectors must be done after the filter
	// And so must :not(positional) so we move all PSEUDOs to the end
	while ( (match = Expr.match.PSEUDO.exec( selector )) ) {
		later += match[0];
		selector = selector.replace( Expr.match.PSEUDO, "" );
	}

	selector = Expr.relative[selector] ? selector + "*" : selector;

	for ( var i = 0, l = root.length; i < l; i++ ) {
		Sizzle( selector, root[i], tmpSet );
	}

	return Sizzle.filter( later, tmpSet );
};

// EXPOSE

window.Sizzle = Sizzle;

})();
/*
  mustache.js — Logic-less templates in JavaScript

  See http://mustache.github.com/ for more info.
*/

var Mustache = function() {
  var Renderer = function() {};

  Renderer.prototype = {
    otag: "{{",
    ctag: "}}",
    pragmas: {},
    buffer: [],
    pragmas_implemented: {
      "IMPLICIT-ITERATOR": true
    },
    context: {},

    render: function(template, context, partials, in_recursion) {
      // reset buffer & set context
      if(!in_recursion) {
        this.context = context;
        this.buffer = []; // TODO: make this non-lazy
      }

      // fail fast
      if(!this.includes("", template)) {
        if(in_recursion) {
          return template;
        } else {
          this.send(template);
          return;
        }
      }

      template = this.render_pragmas(template);
      var html = this.render_section(template, context, partials);
      if(in_recursion) {
        return this.render_tags(html, context, partials, in_recursion);
      }

      this.render_tags(html, context, partials, in_recursion);
    },

    /*
      Sends parsed lines
    */
    send: function(line) {
      if(line != "") {
        this.buffer.push(line);
      }
    },

    /*
      Looks for %PRAGMAS
    */
    render_pragmas: function(template) {
      // no pragmas
      if(!this.includes("%", template)) {
        return template;
      }

      var that = this;
      var regex = new RegExp(this.otag + "%([\\w-]+) ?([\\w]+=[\\w]+)?" +
            this.ctag);
      return template.replace(regex, function(match, pragma, options) {
        if(!that.pragmas_implemented[pragma]) {
          throw({message: 
            "This implementation of mustache doesn't understand the '" +
            pragma + "' pragma"});
        }
        that.pragmas[pragma] = {};
        if(options) {
          var opts = options.split("=");
          that.pragmas[pragma][opts[0]] = opts[1];
        }
        return "";
        // ignore unknown pragmas silently
      });
    },

    /*
      Tries to find a partial in the curent scope and render it
    */
    render_partial: function(name, context, partials) {
      name = this.trim(name);
      if(!partials || partials[name] === undefined) {
        throw({message: "unknown_partial '" + name + "'"});
      }
      if(typeof(context[name]) != "object") {
        return this.render(partials[name], context, partials, true);
      }
      return this.render(partials[name], context[name], partials, true);
    },

    /*
      Renders inverted (^) and normal (#) sections
    */
    render_section: function(template, context, partials) {
      if(!this.includes("#", template) && !this.includes("^", template)) {
        return template;
      }

      var that = this;
      // CSW - Added "+?" so it finds the tighest bound, not the widest
      var regex = new RegExp(this.otag + "(\\^|\\#)\\s*(.+)\\s*" + this.ctag +
              "\n*([\\s\\S]+?)" + this.otag + "\\/\\s*\\2\\s*" + this.ctag +
              "\\s*", "mg");

      // for each {{#foo}}{{/foo}} section do...
      return template.replace(regex, function(match, type, name, content) {
        var value = that.find(name, context);
        if(type == "^") { // inverted section
          if(!value || that.is_array(value) && value.length === 0) {
            // false or empty list, render it
            return that.render(content, context, partials, true);
          } else {
            return "";
          }
        } else if(type == "#") { // normal section
          if(that.is_array(value)) { // Enumerable, Let's loop!
            return that.map(value, function(row) {
              return that.render(content, that.create_context(row),
                partials, true);
            }).join("");
          } else if(that.is_object(value)) { // Object, Use it as subcontext!
            return that.render(content, that.create_context(value),
              partials, true);
          } else if(typeof value === "function") {
            // higher order section
            return value.call(context, content, function(text) {
              return that.render(text, context, partials, true);
            });
          } else if(value) { // boolean section
            return that.render(content, context, partials, true);
          } else {
            return "";
          }
        }
      });
    },

    /*
      Replace {{foo}} and friends with values from our view
    */
    render_tags: function(template, context, partials, in_recursion) {
      // tit for tat
      var that = this;

      var new_regex = function() {
        return new RegExp(that.otag + "(=|!|>|\\{|%)?([^\\/#\\^]+?)\\1?" +
          that.ctag + "+", "g");
      };

      var regex = new_regex();
      var tag_replace_callback = function(match, operator, name) {
        switch(operator) {
        case "!": // ignore comments
          return "";
        case "=": // set new delimiters, rebuild the replace regexp
          that.set_delimiters(name);
          regex = new_regex();
          return "";
        case ">": // render partial
          return that.render_partial(name, context, partials);
        case "{": // the triple mustache is unescaped
          return that.find(name, context);
        default: // escape the value
          return that.escape(that.find(name, context));
        }
      };
      var lines = template.split("\n");
      for(var i = 0; i < lines.length; i++) {
        lines[i] = lines[i].replace(regex, tag_replace_callback, this);
        if(!in_recursion) {
          this.send(lines[i]);
        }
      }

      if(in_recursion) {
        return lines.join("\n");
      }
    },

    set_delimiters: function(delimiters) {
      var dels = delimiters.split(" ");
      this.otag = this.escape_regex(dels[0]);
      this.ctag = this.escape_regex(dels[1]);
    },

    escape_regex: function(text) {
      // thank you Simon Willison
      if(!arguments.callee.sRE) {
        var specials = [
          '/', '.', '*', '+', '?', '|',
          '(', ')', '[', ']', '{', '}', '\\'
        ];
        arguments.callee.sRE = new RegExp(
          '(\\' + specials.join('|\\') + ')', 'g'
        );
      }
      return text.replace(arguments.callee.sRE, '\\$1');
    },

    /*
      find `name` in current `context`. That is find me a value
      from the view object
    */
    find: function(name, context) {
      name = this.trim(name);

      // Checks whether a value is thruthy or false or 0
      function is_kinda_truthy(bool) {
        return bool === false || bool === 0 || bool;
      }

      var value;
      if(is_kinda_truthy(context[name])) {
        value = context[name];
      } else if(is_kinda_truthy(this.context[name])) {
        value = this.context[name];
      }

      if(typeof value === "function") {
        return value.apply(context);
      }
      if(value !== undefined) {
        return value;
      }
      // silently ignore unkown variables
      return "";
    },

    // Utility methods

    /* includes tag */
    includes: function(needle, haystack) {
      return haystack.indexOf(this.otag + needle) != -1;
    },

    /*
      Does away with nasty characters
    */
    escape: function(s) {
      s = String(s === null ? "" : s);
      return s.replace(/&(?!\w+;)|["'<>\\]/g, function(s) {
        switch(s) {
        case "&": return "&amp;";
        case "\\": return "\\\\";
        case '"': return '&quot;';
        case "'": return '&#39;';
        case "<": return "&lt;";
        case ">": return "&gt;";
        default: return s;
        }
      });
    },

    // by @langalex, support for arrays of strings
    create_context: function(_context) {
      if(this.is_object(_context)) {
        return _context;
      } else {
        var iterator = ".";
        if(this.pragmas["IMPLICIT-ITERATOR"]) {
          iterator = this.pragmas["IMPLICIT-ITERATOR"].iterator;
        }
        var ctx = {};
        ctx[iterator] = _context;
        return ctx;
      }
    },

    is_object: function(a) {
      return a && typeof a == "object";
    },

    is_array: function(a) {
      return Object.prototype.toString.call(a) === '[object Array]';
    },

    /*
      Gets rid of leading and trailing whitespace
    */
    trim: function(s) {
      return s.replace(/^\s*|\s*$/g, "");
    },

    /*
      Why, why, why? Because IE. Cry, cry cry.
    */
    map: function(array, fn) {
      if (typeof array.map == "function") {
        return array.map(fn);
      } else {
        var r = [];
        var l = array.length;
        for(var i = 0; i < l; i++) {
          r.push(fn(array[i]));
        }
        return r;
      }
    }
  };

  return({
    name: "mustache.js",
    version: "0.3.1-dev",

    /*
      Turns a template and view into HTML
    */
    to_html: function(template, view, partials, send_fun) {
      var renderer = new Renderer();
      if(send_fun) {
        renderer.send = send_fun;
      }
      renderer.render(template, view, partials);
      if(!send_fun) {
        return renderer.buffer.join("\n");
      }
    }
  });
}();
/*
    http://www.JSON.org/json2.js
    2010-11-17

    Public Domain.

    NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.

    See http://www.JSON.org/js.html


    This code should be minified before deployment.
    See http://javascript.crockford.com/jsmin.html

    USE YOUR OWN COPY. IT IS EXTREMELY UNWISE TO LOAD CODE FROM SERVERS YOU DO
    NOT CONTROL.


    This file creates a global JSON object containing two methods: stringify
    and parse.

        JSON.stringify(value, replacer, space)
            value       any JavaScript value, usually an object or array.

            replacer    an optional parameter that determines how object
                        values are stringified for objects. It can be a
                        function or an array of strings.

            space       an optional parameter that specifies the indentation
                        of nested structures. If it is omitted, the text will
                        be packed without extra whitespace. If it is a number,
                        it will specify the number of spaces to indent at each
                        level. If it is a string (such as '\t' or '&nbsp;'),
                        it contains the characters used to indent at each level.

            This method produces a JSON text from a JavaScript value.

            When an object value is found, if the object contains a toJSON
            method, its toJSON method will be called and the result will be
            stringified. A toJSON method does not serialize: it returns the
            value represented by the name/value pair that should be serialized,
            or undefined if nothing should be serialized. The toJSON method
            will be passed the key associated with the value, and this will be
            bound to the value

            For example, this would serialize Dates as ISO strings.

                Date.prototype.toJSON = function (key) {
                    function f(n) {
                        // Format integers to have at least two digits.
                        return n < 10 ? '0' + n : n;
                    }

                    return this.getUTCFullYear()   + '-' +
                         f(this.getUTCMonth() + 1) + '-' +
                         f(this.getUTCDate())      + 'T' +
                         f(this.getUTCHours())     + ':' +
                         f(this.getUTCMinutes())   + ':' +
                         f(this.getUTCSeconds())   + 'Z';
                };

            You can provide an optional replacer method. It will be passed the
            key and value of each member, with this bound to the containing
            object. The value that is returned from your method will be
            serialized. If your method returns undefined, then the member will
            be excluded from the serialization.

            If the replacer parameter is an array of strings, then it will be
            used to select the members to be serialized. It filters the results
            such that only members with keys listed in the replacer array are
            stringified.

            Values that do not have JSON representations, such as undefined or
            functions, will not be serialized. Such values in objects will be
            dropped; in arrays they will be replaced with null. You can use
            a replacer function to replace those with JSON values.
            JSON.stringify(undefined) returns undefined.

            The optional space parameter produces a stringification of the
            value that is filled with line breaks and indentation to make it
            easier to read.

            If the space parameter is a non-empty string, then that string will
            be used for indentation. If the space parameter is a number, then
            the indentation will be that many spaces.

            Example:

            text = JSON.stringify(['e', {pluribus: 'unum'}]);
            // text is '["e",{"pluribus":"unum"}]'


            text = JSON.stringify(['e', {pluribus: 'unum'}], null, '\t');
            // text is '[\n\t"e",\n\t{\n\t\t"pluribus": "unum"\n\t}\n]'

            text = JSON.stringify([new Date()], function (key, value) {
                return this[key] instanceof Date ?
                    'Date(' + this[key] + ')' : value;
            });
            // text is '["Date(---current time---)"]'


        JSON.parse(text, reviver)
            This method parses a JSON text to produce an object or array.
            It can throw a SyntaxError exception.

            The optional reviver parameter is a function that can filter and
            transform the results. It receives each of the keys and values,
            and its return value is used instead of the original value.
            If it returns what it received, then the structure is not modified.
            If it returns undefined then the member is deleted.

            Example:

            // Parse the text. Values that look like ISO date strings will
            // be converted to Date objects.

            myData = JSON.parse(text, function (key, value) {
                var a;
                if (typeof value === 'string') {
                    a =
/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)Z$/.exec(value);
                    if (a) {
                        return new Date(Date.UTC(+a[1], +a[2] - 1, +a[3], +a[4],
                            +a[5], +a[6]));
                    }
                }
                return value;
            });

            myData = JSON.parse('["Date(09/09/2001)"]', function (key, value) {
                var d;
                if (typeof value === 'string' &&
                        value.slice(0, 5) === 'Date(' &&
                        value.slice(-1) === ')') {
                    d = new Date(value.slice(5, -1));
                    if (d) {
                        return d;
                    }
                }
                return value;
            });


    This is a reference implementation. You are free to copy, modify, or
    redistribute.
*/

/*jslint evil: true, strict: false, regexp: false */

/*members "", "\b", "\t", "\n", "\f", "\r", "\"", JSON, "\\", apply,
    call, charCodeAt, getUTCDate, getUTCFullYear, getUTCHours,
    getUTCMinutes, getUTCMonth, getUTCSeconds, hasOwnProperty, join,
    lastIndex, length, parse, prototype, push, replace, slice, stringify,
    test, toJSON, toString, valueOf
*/


// Create a JSON object only if one does not already exist. We create the
// methods in a closure to avoid creating global variables.

if (!this.JSON) {
    this.JSON = {};
}

(function () {
    "use strict";

    function f(n) {
        // Format integers to have at least two digits.
        return n < 10 ? '0' + n : n;
    }

    if (typeof Date.prototype.toJSON !== 'function') {

        Date.prototype.toJSON = function (key) {

            return isFinite(this.valueOf()) ?
                   this.getUTCFullYear()   + '-' +
                 f(this.getUTCMonth() + 1) + '-' +
                 f(this.getUTCDate())      + 'T' +
                 f(this.getUTCHours())     + ':' +
                 f(this.getUTCMinutes())   + ':' +
                 f(this.getUTCSeconds())   + 'Z' : null;
        };

        String.prototype.toJSON =
        Number.prototype.toJSON =
        Boolean.prototype.toJSON = function (key) {
            return this.valueOf();
        };
    }

    var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        gap,
        indent,
        meta = {    // table of character substitutions
            '\b': '\\b',
            '\t': '\\t',
            '\n': '\\n',
            '\f': '\\f',
            '\r': '\\r',
            '"' : '\\"',
            '\\': '\\\\'
        },
        rep;


    function quote(string) {

// If the string contains no control characters, no quote characters, and no
// backslash characters, then we can safely slap some quotes around it.
// Otherwise we must also replace the offending characters with safe escape
// sequences.

        escapable.lastIndex = 0;
        return escapable.test(string) ?
            '"' + string.replace(escapable, function (a) {
                var c = meta[a];
                return typeof c === 'string' ? c :
                    '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
            }) + '"' :
            '"' + string + '"';
    }


    function str(key, holder) {

// Produce a string from holder[key].

        var i,          // The loop counter.
            k,          // The member key.
            v,          // The member value.
            length,
            mind = gap,
            partial,
            value = holder[key];

// If the value has a toJSON method, call it to obtain a replacement value.

        if (value && typeof value === 'object' &&
                typeof value.toJSON === 'function') {
            value = value.toJSON(key);
        }

// If we were called with a replacer function, then call the replacer to
// obtain a replacement value.

        if (typeof rep === 'function') {
            value = rep.call(holder, key, value);
        }

// What happens next depends on the value's type.

        switch (typeof value) {
        case 'string':
            return quote(value);

        case 'number':

// JSON numbers must be finite. Encode non-finite numbers as null.

            return isFinite(value) ? String(value) : 'null';

        case 'boolean':
        case 'null':

// If the value is a boolean or null, convert it to a string. Note:
// typeof null does not produce 'null'. The case is included here in
// the remote chance that this gets fixed someday.

            return String(value);

// If the type is 'object', we might be dealing with an object or an array or
// null.

        case 'object':

// Due to a specification blunder in ECMAScript, typeof null is 'object',
// so watch out for that case.

            if (!value) {
                return 'null';
            }

// Make an array to hold the partial results of stringifying this object value.

            gap += indent;
            partial = [];

// Is the value an array?

            if (Object.prototype.toString.apply(value) === '[object Array]') {

// The value is an array. Stringify every element. Use null as a placeholder
// for non-JSON values.

                length = value.length;
                for (i = 0; i < length; i += 1) {
                    partial[i] = str(i, value) || 'null';
                }

// Join all of the elements together, separated with commas, and wrap them in
// brackets.

                v = partial.length === 0 ? '[]' :
                    gap ? '[\n' + gap +
                            partial.join(',\n' + gap) + '\n' +
                                mind + ']' :
                          '[' + partial.join(',') + ']';
                gap = mind;
                return v;
            }

// If the replacer is an array, use it to select the members to be stringified.

            if (rep && typeof rep === 'object') {
                length = rep.length;
                for (i = 0; i < length; i += 1) {
                    k = rep[i];
                    if (typeof k === 'string') {
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
                        }
                    }
                }
            } else {

// Otherwise, iterate through all of the keys in the object.

                for (k in value) {
                    if (Object.hasOwnProperty.call(value, k)) {
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
                        }
                    }
                }
            }

// Join all of the member texts together, separated with commas,
// and wrap them in braces.

            v = partial.length === 0 ? '{}' :
                gap ? '{\n' + gap + partial.join(',\n' + gap) + '\n' +
                        mind + '}' : '{' + partial.join(',') + '}';
            gap = mind;
            return v;
        }
    }

// If the JSON object does not yet have a stringify method, give it one.

    if (typeof JSON.stringify !== 'function') {
        JSON.stringify = function (value, replacer, space) {

// The stringify method takes a value and an optional replacer, and an optional
// space parameter, and returns a JSON text. The replacer can be a function
// that can replace values, or an array of strings that will select the keys.
// A default replacer method can be provided. Use of the space parameter can
// produce text that is more easily readable.

            var i;
            gap = '';
            indent = '';

// If the space parameter is a number, make an indent string containing that
// many spaces.

            if (typeof space === 'number') {
                for (i = 0; i < space; i += 1) {
                    indent += ' ';
                }

// If the space parameter is a string, it will be used as the indent string.

            } else if (typeof space === 'string') {
                indent = space;
            }

// If there is a replacer, it must be a function or an array.
// Otherwise, throw an error.

            rep = replacer;
            if (replacer && typeof replacer !== 'function' &&
                    (typeof replacer !== 'object' ||
                     typeof replacer.length !== 'number')) {
                throw new Error('JSON.stringify');
            }

// Make a fake root object containing our value under the key of ''.
// Return the result of stringifying the value.

            return str('', {'': value});
        };
    }


// If the JSON object does not yet have a parse method, give it one.

    if (typeof JSON.parse !== 'function') {
        JSON.parse = function (text, reviver) {

// The parse method takes a text and an optional reviver function, and returns
// a JavaScript value if the text is a valid JSON text.

            var j;

            function walk(holder, key) {

// The walk method is used to recursively walk the resulting structure so
// that modifications can be made.

                var k, v, value = holder[key];
                if (value && typeof value === 'object') {
                    for (k in value) {
                        if (Object.hasOwnProperty.call(value, k)) {
                            v = walk(value, k);
                            if (v !== undefined) {
                                value[k] = v;
                            } else {
                                delete value[k];
                            }
                        }
                    }
                }
                return reviver.call(holder, key, value);
            }


// Parsing happens in four stages. In the first stage, we replace certain
// Unicode characters with escape sequences. JavaScript handles many characters
// incorrectly, either silently deleting them, or treating them as line endings.

            text = String(text);
            cx.lastIndex = 0;
            if (cx.test(text)) {
                text = text.replace(cx, function (a) {
                    return '\\u' +
                        ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
                });
            }

// In the second stage, we run the text against regular expressions that look
// for non-JSON patterns. We are especially concerned with '()' and 'new'
// because they can cause invocation, and '=' because it can cause mutation.
// But just to be safe, we want to reject all unexpected forms.

// We split the second stage into 4 regexp operations in order to work around
// crippling inefficiencies in IE's and Safari's regexp engines. First we
// replace the JSON backslash pairs with '@' (a non-JSON character). Second, we
// replace all simple value tokens with ']' characters. Third, we delete all
// open brackets that follow a colon or comma or that begin the text. Finally,
// we look to see that the remaining characters are only whitespace or ']' or
// ',' or ':' or '{' or '}'. If that is so, then the text is safe for eval.

            if (/^[\],:{}\s]*$/
.test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@')
.replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']')
.replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {

// In the third stage we use the eval function to compile the text into a
// JavaScript structure. The '{' operator is subject to a syntactic ambiguity
// in JavaScript: it can begin a block or an object literal. We wrap the text
// in parens to eliminate the ambiguity.

                j = eval('(' + text + ')');

// In the optional fourth stage, we recursively walk the new structure, passing
// each name/value pair to a reviver function for possible transformation.

                return typeof reviver === 'function' ?
                    walk({'': j}, '') : j;
            }

// If the text is not JSON parseable, then a SyntaxError is thrown.

            throw new SyntaxError('JSON.parse');
        };
    }
}());
/**
 * @namespace
 * @name object
 */
var object = new (/**@lends object*/ function(globalHost) {

var object = this;

/**
 * 遍历一个对象，返回所有的key的数组
 */
Object.keys = function(o) {
	var result = [];

	// 在Safari 5.0.2(7533.18.5)中，在这里用for in遍历parent会将prototype属性遍历出来，导致原型被指向一个错误的对象
	// 经过试验，在Safari下，仅仅通过 obj.prototype.xxx = xxx 这样的方式就会导致 prototype 变成自定义属性，会被 for in 出来
	// 而其他浏览器仅仅是在重新指向prototype时，类似 obj.prototype = {} 这样的写法才会出现这个情况
	// 因此，在使用时一定要注意
	for (var name in o) {
		if (o.hasOwnProperty(name)) {
			result.push(name);
		}
	}

	// for IE
	// 在IE下for in无法遍历出来修改过的call方法
	// 为什么允许修改call方法？对于一个class来说，没有直接Class.call的应用场景，任何Class都应该是new出来的，因此可以修改这个方法
	if (o.call !== undefined && o.call !== Function.prototype.call && result.indexOf('call') === -1) {
		result.push('call');
	}

	return result; 
};

Array.isArray = Array.isArray || function(o) {
	return Object.prototype.toString.call(o) === '[object Array]';
};

Array.prototype.forEach = Array.prototype.forEach || function(fn, bind) {
	for (var i = 0; i < this.length; i++) {
		fn.call(bind, this[i], i, this);
	}
};

Array.prototype.indexOf = Array.prototype.indexOf || function(str){
	for (var i = 0; i < this.length; i++) {
		if (str == this[i]) {
			return i;
		}
	}
	return -1;
};

Array.prototype.some = Array.prototype.some || function(fn, bind) {
	for (var i = 0, l = this.length; i < l; i++){
		if ((i in this) && fn.call(bind, this[i], i, this)) return true;
	}
	return false;
};

Array.prototype.every = Array.prototype.every || function(fn, bind){
	for (var i = 0, l = this.length; i < l; i++){
		if ((i in this) && !fn.call(bind, this[i], i, this)) return false;
	}
	return true;
};

Array.prototype.map = Array.prototype.map || function (fn, bind) {
	var results = [];
	for (var i = 0, l = this.length; i < l; i++){
		if (i in this) results[i] = fn.call(bind, this[i], i, this);
	}
	return results;
};

Array.prototype.filter = Array.prototype.filter || function(fn, bind){
	var results = [];
	for (var i = 0, l = this.length; i < l; i++){
		if ((i in this) && fn.call(bind, this[i], i, this)) results.push(this[i]);
	}
	return results;
};

Array.prototype.reduce = Array.prototype.reduce || function(fun /*, initialValue */) {
	"use strict";

	if (this === undefined || this === null)
		throw new TypeError();

	var t = Object(this);
	var len = t.length >>> 0;
	if (typeof fun !== "function")
		throw new TypeError();

	// no value to return if no initial value and an empty array
	if (len === 0 && arguments.length == 1)
		throw new TypeError();

	var k = 0;
	var accumulator;
	if (arguments.length >= 2) {
		accumulator = arguments[1];
	} else {
		do {
			if (k in t) {
				accumulator = t[k++];
				break;
			}

			// if array contains no values, no initial value to return
			if (++k >= len) {
				throw new TypeError();
			}

		} while (true);
	}

	while (k < len) {
		if (k in t)
			accumulator = fun.call(undefined, accumulator, t[k], k, t);
		k++;
	}

	return accumulator;
};

Array.prototype.reduceRight = Array.prototype.reduceRight || function(callbackfn /*, initialValue */) {
	"use strict";

	if (this === undefined || this === null)
		throw new TypeError();

	var t = Object(this);
	var len = t.length >>> 0;
	if (typeof callbackfn !== "function")
		throw new TypeError();

	// no value to return if no initial value, empty array
	if (len === 0 && arguments.length === 1)
		throw new TypeError();

	var k = len - 1;
	var accumulator;
	if (arguments.length >= 2) {
		accumulator = arguments[1];
	} else {
		do {
			if (k in this) {
				accumulator = this[k--];
				break;
			}

			// if array contains no values, no initial value to return
			if (--k < 0) {
				throw new TypeError();
			}
		}
		while (true);
	}

	while (k >= 0) {
		if (k in t)
			accumulator = callbackfn.call(undefined, accumulator, t[k], k, t);
		k--;
	}

	return accumulator;
};

String.prototype.trim = String.prototype.trim || function() {
	// High Performance JavaScript 中描述此方法较快
	return this.replace(/^\s\s*/, "").replace(/\s\s*$/, "");
};

/**
* 有些老页面引用了js/compact.js，其中有一个错误的Function.prototype.bind
*/
if (!Function.prototype.bind || Function.prototype.bind === window.__hualuOldBind) {
	Function.prototype.bind = function(object) {
		var method = this;
		return function() {
			method.apply(object, arguments); 
		};
	};
}

// 获取function的name
// 判断function TEST() 是否能取到name属性来选择不同的算法函数
if ((function TEST(){}).name) {
	Function.__get_name__ = function(func) {
		return func.name;
	};
// IE
} else {
	var funcNameRegExp = /^function ([\w$]+)/;
	Function.__get_name__ = function(func) {
		// IE 下没有 Function.prototype.name，通过代码获得
		var result = funcNameRegExp.exec(func.toString());
		if (result) return result[1];
		return '';
	};
}

/**
 * 为obj增加properties中的成员
 * @param obj 源
 * @param properties 目标
 * @param ov 是否覆盖，默认true
 */
this.extend = function(obj, properties, ov) {
	if (ov !== false) ov = true;

	for (var property in properties) {
		if (ov || obj[property] === undefined) {
			obj[property] = properties[property];
		}
	}
	if (properties && properties.hasOwnProperty('call')) {
		obj.call = properties.call;
	}

	return obj;
};

/**
 * 浅拷贝
 */
this.clone = function(obj) {
	var clone = {};
	for (var key in obj) clone[key] = obj[key];
	return clone;
};

/**
 * 将成员引用放到window上
 */
this.bind = function(host) {
	object.extend(host, object);
};


this._loader = null;

/**
 * use一个module
 * @borrows object.Loader.use
 */
this.use = function() {
	if (!object._loader) object._loader = new Loader();
	object._loader.use.apply(object._loader, arguments);
};

/**
 * 直接执行一个module，其 __name__ 为 __main__
 * @borrows object.Loader.execute
 */
this.execute = function() {
	if (!object._loader) object._loader = new Loader();
	object._loader.execute.apply(object._loader, arguments);
};

/**
 * 添加一个module
 * @borrows object.Loader.add
 */
this.add = function() {
	if (!object._loader) object._loader = new Loader();
	object._loader.add.apply(object._loader, arguments);
};

// 找不到模块Error
this.NoModuleError = function(name) {
	this.message = 'no module named ' + name;
};
this.NoModuleError.prototype = new Error();

this.ModuleRequiredError = function(name) {
	this.message = 'module ' + name + ' required';
};
this.ModuleRequiredError.prototype = new Error();

})(window);

(/**@lends _global_*/ function() {

// 仿照 mootools 的overloadSetter
// 返回一个 key/value 这种形式的function参数的包装，使其支持{key1: value1, key2: value2} 这种传参形式
var enumerables = true;
for (var i in {toString: 1}) enumerables = null;
if (enumerables) enumerables = ['hasOwnProperty', 'valueOf', 'isPrototypeOf', 'propertyIsEnumerable', 'toLocaleString', 'toString', 'constructor'];
var overloadSetter = function(func, usePlural) {
	return function(a, b) {
		if (a === null) return this;
		if (usePlural || typeof a != 'string') {
			for (var k in a) func.call(this, k, a[k]);
			if (enumerables) {
				for (var i = enumerables.length; i > 0; i--) {
					k = enumerables[i];
					if (a.hasOwnProperty(k)) func.call(this, k, a[k]);
				}
			}
		} else {
			func.call(this, a, b);
		}
		return this;
	};
};

/**
 * propery 特性支持getter函数，用法：
 * obj.get(prop_name)
 * 会被放到 cls.prototype.get
 */
var getter = function(prop) {
	var property = this.__properties__[prop];
	if (property && property.fget) {
		return property.fget.call(this.__this__, this);
	} else {
		throw 'get not defined property ' + prop;
	}
};

/**
 * propery 特性支持getter函数，用法：
 * obj.set(prop_name, value)
 * 会被放到 cls.prototype.set
 */
var setter = function(prop, value) {
	var property = this.__properties__[prop];
	if (property && property.fset) {
		property.fset.call(this.__this__, this, value);
	} else {
		throw 'set not defined property ' + prop;
	}
};

/**
 * 从类上获取成员
 * 会被放到cls.get
 */
var membergetter = function(name) {
	var cls = this;
	var proto = this.prototype;
	var properties = proto.__properties__;
	if (name in cls) return cls[name];
	if (name in properties) return properties[name];
	if (!name in proto) throw new Error('no member named ' + name + '.');
	var member = proto[name];
	if (!member) return member;
	if (member.__class__ = instancemethod) return instancemethod(member.im_func, this);
	return member;
};

/**
 * MyClass.set(name, value);
 * MyClass.set({name1: value1, name2: value2})
 * 会被放到 cls.set
 * 子类不会被覆盖
 */
var membersetter = overloadSetter(function(name, member) {
	var cls = this;
	var proto = cls.prototype;
	var properties = proto.__properties__;
	var subs = cls.__subclassesarray__;
	var constructing = cls.__constructing__;

	// 类构建完毕后才进行set，需要先删除之前的成员
	if (!constructing) {
		delete cls[name];
		delete proto[name];
		delete properties[name];
	}

	// 这里的member指向new Class参数的书写的对象/函数
	if (name == '@mixins') name = '__mixins__';

	if (['__new__', '__metaclass__', '__mixins__'].indexOf(name) != -1) {
		cls[name] = member;

	} else if (['__this__', '__base__'].indexOf(name) != -1) {
		cls[name] = proto[name] = member;

	// 有可能为空，比如 this.test = null 或 this.test = undefined 这种写法;
	} else if (member == null) {
		proto[name] = member;

	// 先判断最常出现的instancemethod
	// this.a = function() {}
	} else if (member.__class__ === undefined && typeof member == 'function') {
		// 这样赋值__name__，确保__name__都是被赋值在开发者所书写的那个function上，能够通过arguments.callee.__name__获取到。
		member.__name__ = name;
		proto[name] = instancemethod(member);
		proto[name].__name__ = name;
		// 初始化方法放在cls上，metaclass会从cls上进行调用
		if (name == 'initialize') {
			cls[name] = instancemethod(member, cls);
		}

	// this.a = property(function fget() {}, function fset() {})
	} else if (member.__class__ === property) {
		member.__name__ = name;
		properties[name] = member;

	// this.a = classmethod(function() {})
	} else if (member.__class__ === classmethod) {
		member.im_func.__name__ = name;
		member.__name__ = name;
		cls[name] = proto[name] = member;

	// this.a = staticmethod(function() {})
	} else if (member.__class__ === staticmethod) {
		member.im_func.__name__ = name;
		member.__name__ = name;
		cls[name] = proto[name] = member.im_func;

	// this.a = someObject
	} else {
		proto[name] = member;
	}

	// 所有子类cls上加入
	if (!constructing && name in cls && subs) {
		subs.forEach(function(sub) {
			if (!name in sub) sub.set(name, member);
		});
	}
});

/**
 * 对于支持defineProperty的浏览器，可考虑将此setter不设置任何动作
 */
var nativesetter = function(prop, value) {
	this[prop] = value;
};

/**
 * 获取一个类的子类
 * 会被放到 cls.__subclasses__
 */
var subclassesgetter = function() {
	return this.__subclassesarray__;
};

// IE不可以通过prototype = new Array的方式使function获得数组功能。
var _nativeExtendable = (function() {
	// IE和webkit没有统一访问方法（Array.forEach)，避免使用native extend
	if (!Array.push) return false;

	// 理论上走不到
	var a = function() {};
	a.prototype = new Array;
	var b = new a;
	b.push(null);
	return !!b.length;
})();

var ArrayClass, StringClass;

var type = this.type = function() {
};

/**
* 创建一个类的核心过程
*/
type.__new__ = function(metaclass, name, base, dict) {
	var cls = Class.create();

	cls.__constructing__ = true;

	// 继承的核心
	cls.prototype = Class.getInstance(base);
	cls.prototype.constructor = cls;
	// Array / String 没有 subclass，需要先判断一下是否存在 subclassesarray
	if (base.__subclassesarray__) base.__subclassesarray__.push(cls);

	// Propeties
	var proto = cls.prototype;
	// 有可能已经继承了base的__properties__了
	var baseProperties = proto.__properties__ || {};
	proto.__properties__ = object.extend({}, baseProperties);

	if (base !== type) {
		for (var property in base) {
			// 过滤双下划线开头的系统成员和私有成员
			if (property.indexOf('__') != 0 && cls[property] === undefined) {
				cls[property] = base[property];
			}
		}
	}
	cls.set('__base__', base);
	// 支持 this.parent 调用父级同名方法
	cls.set('__this__', {
		base: base,
		parent: function() {
			// 一定是在继承者函数中调用，因此调用时一定有 __name__ 属性
			var name = arguments.callee.caller.__name__;
			var base = cls.__base__;
			return base.get(name).apply(base, arguments);
		}
	});
	cls.__new__ = base.__new__;
	cls.__metaclass__ = base.__metaclass__;

	// Dict
	cls.set(dict);

	// Mixin
	var mixins = cls.__mixins__;
	if (mixins) {
		mixins.forEach(function(mixin) {
			Class.keys(mixin).forEach(function(name) {
				if (cls.get(name)) return; // 不要覆盖自定义的

				var member = mixin.get(name);

				if (typeof member == 'function' && member.__class__ === instancemethod) {
					cls.set(name, member.im_func);
				} else {
					cls.set(name, member);
				}
			});
		});
	}
	delete cls.__constructing__;

	cls.__dict__ = dict;
	cls.prototype.get = getter;
	cls.prototype.set = setter;
	cls.prototype._set = nativesetter;

	return cls;
};

type.initialize = function() {
};

// 类
var Class = this.Class = function() {
	var length = arguments.length;
	if (length < 1) throw new Error('bad arguments');
	// 父类
	var base = length > 1? arguments[0] : type;
	if (base) {
		// IE不能extend native function，用相应的class包装一下
		if (!_nativeExtendable) {
			if (base === Array) {
				base = ArrayClass;
			} else if (base === String) {
				base = StringClass;
			}
		}
	}

	// 构造器
	var dict = arguments[length - 1];
	if (dict instanceof Function) {
		var f = dict;
		dict = {};
		f.call(dict);
	}

	// metaclass
	var metaclass = dict.__metaclass__ || base.__metaclass__ || type;

	var cls = metaclass.__new__(metaclass, null, base, dict);
	metaclass.initialize(cls, null, base, dict);

	return cls;
};

Class.create = function() {
	var cls = function() {
		if (cls.__prototyping__) return this;
		this.__class__ = cls;
		Class.initMixins(cls, this);
		var value = this.initialize? this.initialize.apply(this, arguments) : null;
		return value;
	};
	cls.__subclassesarray__ = [];
	cls.__subclasses__ = subclassesgetter;
	cls.__mixin__ = cls.set = membersetter;
	cls.get = membergetter;
	return cls;
};

/**
* mixin时调用mixin的initialize方法，保证其中的初始化成员能够被执行
*/
Class.initMixins = function(cls, instance) {
	if (!cls.__mixins__) {
		return;
	}
	for (var i = 0, l = cls.__mixins__.length, mixin; i < l; i++) {
		mixin = cls.__mixins__[i];
		if (mixin.prototype.initialize) mixin.prototype.initialize.call(instance);
	}
};

/**
 * 在new Class的callback中mixin
 * var MyClass = new Class(function() {
 *	Class.mixin(this, AnotherClass);
 * })
 */
Class.mixin = function(dict, cls) {
	dict.__mixins__ = dict.__mixins__ || [];
	dict.__mixins__.push(cls);
};

Class.hasProperty = function(obj, name) {
	return (name in obj.__properties__);
};

/**
 * 所有properties
 */
Class.getPropertyNames = function(obj) {
	return Object.keys(obj.__properties__);
};

/**
 * 将host注射进class，使其self指向host
 * @param cls 被注射的class
 * @param host 注射进去的对象
 * @param args 构造的参数
 */
Class.inject = function(cls, host, args) {
	args = args || [];
	host.__class__ = cls;
	host.__properties__ = cls.prototype.__properties__;
	var p = Class.getInstance(cls);
	object.extend(host, p);
	Class.initMixins(cls, host);
	if (cls.prototype.initialize) cls.prototype.initialize.apply(host, args);
};

/**
 * 获取一个class的继承链
 */
Class.getChain = function(cls) {
	var result = [cls];
	while (cls.__base__) {
		result.push(cls.__base__);
		cls = cls.__base__;
	}
	return result;
};

// 获取父类的实例，用于 cls.prototype = new parent
Class.getInstance = function(cls) {
	if (cls === Array || cls === String) return new cls;
	cls.__prototyping__ = true;
	var instance = new cls();
	delete cls.__prototyping__;
	return instance;
};

/**
 * 将一个类的所有子类形成平面数组返回
 * 会在Class.mixin中用到
 */
Class.getAllSubClasses = function(cls) {
	var array = cls.__subclassesarray__;
    if(!array) {
        return [];
    }
	var queue = [].concat(array), ele = queue.shift(), subs;
	while (ele != null) {
		subs = ele.__subclassesarray__;
		if (subs != null) {
			queue = queue.concat(subs);
			array = array.concat(subs);
		}
		ele = queue.shift();
	}
	return array;
};

/**
* 遍历一个类成员
* 获取类成员通过cls.get(name)
*/
Class.keys = function(cls) {
	keys = Object.keys(cls.prototype.__properties__);
	keys = keys.concat(Object.keys(cls.prototype).filter(function(name) {
		// 这3个需要过滤掉，是为了支持property加入的内置成员
		// initialize也需要过滤，当mixin多个class的时候，initialize默认为最后一个，这种行为没意义
		// 过滤掉双下划线命名的系统成员和私有成员
		return !(['get', 'set', '_set', 'initialize', 'constructor'].indexOf(name) !== -1 || name.indexOf('__') == 0);
	}));
	return keys;
};

var instancemethod = function(func, cls) {
	var wrapper = cls? function() {
		return cls.prototype[func.__name__].im_func.apply(cls.__this__, arguments);
	} : function() {
		var args = [].slice.call(arguments, 0);
		args.unshift(this);
		return func.apply(this.__this__, args);
	};
	wrapper.__class__ = arguments.callee;
	wrapper.im_func = func;
	return wrapper;
};

var staticmethod = this.staticmethod = function(func) {
	var wrapper = function() {};
	wrapper.__class__ = arguments.callee;
	wrapper.im_func = func;
	return wrapper;
};

var classmethod = this.classmethod = function(func) {
	var wrapper = function() {
		var args = [].slice.call(arguments, 0);
		var cls;
		if (this.__this__) {
			args.unshift(this);
			return this.prototype[func.__name__].im_func.apply(this.__this__, args);
		} else {
			cls = this.__class__;
			args.unshift(cls);
			return func.apply(cls.__this__, args);
		}
	};
	wrapper.__class__ = arguments.callee;
	wrapper.im_func = func;
	return wrapper;
};

var property = this.property = function(fget, fset) {
	var p = {};
	p.__class__ = arguments.callee;
	p.fget = fget;
	p.fset = fset;
	return p;
};

// 获取一个native function的class形式用于继承
var createNativeClass = function(source, methodNames) {
	var cls = new Class(function() {
		for (var i = 0, l = methodNames.length; i < l; i++) {
			this[methodNames[i]] = (function(name) {
				return function() {
					return source.prototype[name].apply(arguments[0], [].slice.call(arguments, 1));
				};
			})(methodNames[i]);
		}
	});
	return cls;
};

ArrayClass = createNativeClass(Array, ["concat", "indexOf", "join", "lastIndexOf", "pop", "push", "reverse", "shift", "slice", "sort", "splice", "toString", "unshift", "valueOf", "forEach", "some", "every", "map", "filter", "reduce", "reduceRight"]);
ArrayClass.prototype.length = 0;
StringClass = createNativeClass(String, ["charAt", "charCodeAt", "concat", "indexOf", "lastIndexOf", "match", "replace", "search", "slice", "split", "substr", "substring", "toLowerCase", "toUpperCase", "valueOf"]);

})();

(/**@lends object*/ function() {

/**
 * object的包管理器
 * 这个class依赖于object._lib ，且会修改它
 * @class
 */
this.Loader = new Class(/**@lends object.Loader*/ function() {

	var _lib;

	// 模块
	function Module(name) {
		this.__name__ = name;
	}
	Module.prototype.toString = function() {
		return '<module \'' + this.__name__ + '\'>';
	};

	this.scripts = document.getElementsByTagName('script');

	this.initialize = function(self) {
		self.useCache = true;
		// 所有use都会默认use的模块，需要注意循环引用问题
		self.lib = {};
		self.anonymousModuleCount = 0;

		_lib = self.lib;

		self.add('sys', function(exports) {
		});
	};

	/**
	 * 查找页面中的标记script标签，更新 _lib
	 */
	this.loadLib = function(self) {
		var scripts = self.scripts;
		for (var i = 0, script, module, l = scripts.length; i < l; i++) {
			script = scripts[i];
			module = script.getAttribute('data-module');
			if (!module) continue;
			if (_lib[module]) continue;

			// 建立前缀package
			self.makePrefixPackage(module);

			_lib[module] = {file: script.getAttribute('data-src'), name: module};
		}
	};

	/**
	 * 建立前缀模块
	 * 比如 a.b.c.d ，会建立 a/a.b/a.b.c 三个空模块，最后一个模块为目标模块，不为空，内容为context
	 */
	this.makePrefixPackage = function(self, name) {
		var names = name.split('.');
		for (var i = 0, prefix, l = names.length - 1; i < l; i++) {
			prefix = names.slice(0, i + 1).join('.');
			// 说明这个module是空的
			if (_lib[prefix] == undefined) _lib[prefix] = {
				name: prefix
			};
		}
	};

	/**
	 * 加载一个script, 执行callback
	 * 有冲突检测，如果连续调用两次loadScript同一src的话，则第二个调用会等第一个完毕后直接执行callback，不会加载两次。
	 *
	 * @param src 地址
	 * @param callback callback函数
	 */
	this.loadScript = classmethod(function(cls, src, callback, useCache) {

		useCache = !!useCache;
		var ele;

		if (useCache) {
			var scripts = cls.scripts;
			for (var i = 0, script, l = scripts.length; i < l; i++) {
				script = scripts[i];
				if (script.src == src) {
					ele = script;
					// 连续调用，此脚本正在加载呢
					if (scripts[i].loading) {
						// 增加一个回调即可
						ele.callbacks.push(callback);
					} else {
						callback(ele);
					}
					return;
				}
			}
		}

		ele = document.createElement('script');
		ele.type = "text/javascript";
		ele.src = src;
		ele.async = true;
		ele.loading = true;
		ele.callbacks = [];

		var doCallback = function() {
			ele.loading = null;
			ele.callbacks.forEach(function(callback) {
				callback(ele);
			});
			for(var i=0,l=ele.callbacks.length; i<l; i++) {
				ele.callbacks[i] = null;
			}
			ele.callbacks = null;
		};

		ele.callbacks.push(callback);

		if (window.ActiveXObject) { // IE
			ele.onreadystatechange = function() {
				var rs = this.readyState;
				if ('loaded' === rs || 'complete' === rs) {
					ele.onreadystatechange = null;
					doCallback();
				}
			};

		} else if (ele.addEventListener) { // Standard
			ele.addEventListener('load', doCallback, false);
			ele.addEventListener('error', doCallback, false);

		} else { // Old browser
			ele.onload = ele.onerror = doCallback;
		}

		document.getElementsByTagName('head')[0].insertBefore(ele, null);

	});

	/**
	 * context 执行方法
	 * @param pkg 被执行的pkg
	 * @param modules 保存了此次use运行过程中用到的所有module
	 * @param stack 保存了模块的依赖路径的栈，检测循环依赖
	 * @param callback 异步方法，执行完毕后调用
	 * @param options 可选，可用来定制name
	 */
	this.executeModule = function(self, pkg, modules, stack, callback, options) {
		if (!options) options = {};

		var exports = new Module(options.name || pkg.name);
		// sys.modules
		if (exports.__name__ === 'sys') exports.modules = modules;

		// 最后传进context的参数
		var args = [exports];

		var done = function() {
			// 空package不需要
			if (pkg.fn) {
				var returnValue = pkg.fn.apply(exports, args);
				if (returnValue) {
					if (typeof returnValue === 'object' || typeof returnValue === 'function') {
						returnValue.toString = Module.prototype.toString;
						returnValue.__name__ = exports.__name__;
					}
					exports = returnValue;
				}
			}

			// 不输出 __name__ 了，没有大用且影响性能，应该在创建时就指定name
			//Object.keys(exports).forEach(function(key) {
				//if (typeof exports[key] == 'function') {
					//exports[key].__name__ = key;
				//}
			//});

			if (callback) callback(exports);
		};

		// file
		if (!pkg.fn && pkg.file) {
			self.loadScript(pkg.file, function() {
				loadNext(0);
			}, true);
			return;

		// 在空package或没有uses的情况下直接返回即可。
		} else if (!pkg.fn || pkg.uses.length === 0) {
			done();
			return;
		}

		// 主递归函数
		function loadNext(i) {

			var use = pkg.uses[i];

			// 循环依赖判断
			stack.push(use); // 开始获取use这个module
			if (stack.indexOf(use) != stack.length - 1) { // 正在获取的这个module在stack中之前已经获取过了
				var error = new Error('circular dependencies. [' + stack.join(',') + ']');
				error.stack = stack;
				throw error;
			}
			self.getModule(use, modules, stack, function() {
				stack.pop(); // 此module获取完毕
				var names, root, member;

				names = use.split('.');
				root = modules[names[0]];

				if (args.indexOf(root) == -1) args.push(root);

				if (i < pkg.uses.length - 1) {
					loadNext(i + 1);
				} else if (i == pkg.uses.length - 1) {
					done();
				}

			});

		};

		loadNext(0);

	};

	/**
	 * 通过一个模块名，获得到相对应的模块对象并通过callback返回
	 *
	 * @param name pkg name
	 * @param modules 已引入的module对象列表，会传递给 execute 方法，可以通过sys.modules获取
	 * @param callback 模块获取到以后，通过callback的第一个参数传递回去
	 * @returns 最终引入的模块
	 */
	this.getModule = function(self, name, modules, stack, callback) {
		var names = name.split('.');

		/**
		 * @param i
		 * @param pname 上一个module的name
		 */
		function loadNext(i, pname) {
			var prefix = names.slice(0, i + 1).join('.');
			name = names[i];

			var next = function(exports) {
				modules[prefix] = exports;

				if (pname) modules[pname][name] = modules[prefix];

				if (i < names.length - 1) {
					loadNext(i + 1, prefix);
				} else if (i == names.length - 1) {
					callback(modules[prefix]);
				}
			};

			// 使用缓存中的
			if (modules[prefix]) {
				next(modules[prefix]);

			// lib 中有
			} else if (_lib[prefix]) {
				var pkg = _lib[prefix];

				// lib中有，但是是file，需要动态加载
				if (pkg.file) {
					// 文件加载完毕后，其中执行的 add 会自动把 _lib 中的对象替换掉，file 属性丢失，加入了 execute/name/uses 等属性
					// 使用缓存
					self.loadScript(pkg.file, function() {
						self.executeModule(pkg, modules, stack, next);
					}, true);

				// 也有可能是空的模块，是没有 fn 的，executeModule会处理
				} else {
					self.executeModule(pkg, modules, stack, next);
				}

			// lib中没有
			} else {
				throw new object.NoModuleError(prefix);
			}

		};

		loadNext(0);
	};

	/**
	 * 处理传入的uses参数
	 * 在getUses阶段不需要根据名称判断去重（比如自己use自己），因为并不能避免所有冲突，还有循环引用的问题（比如 core use dom, dom use core）
	 *
	 * @param uses 输入
	 * @param ignore 跳过ignore模块，用来避免自己调用自己
	 */
	this.getUses = function(self, uses, ignore) {
		if (typeof uses == 'string') {
			uses = uses.split(/\s*,\s*/ig);
		}

		// 过滤自己调用自己
		uses = uses.filter(function(use) {
			return use != ignore;
		});

		return uses;
	};

	/**
	 * 传入context，context的参数会包含use进来的module
	 * 创造一个context，内部通过 this.xxx 设置的成员都会在这个 context 下。
	 * @param name 名称
	 * @param uses 用逗号分隔开的模块名称列表
	 * @param context 这个function会在调用module时调用，并将module通过参数传入context，第一个参数为exports，后面的参数为每个module的不重复引用，顺序排列
	 */
	this.add = function(self, name, uses, context) {

		// 不允许重复添加。
		if (_lib[name] && _lib[name].fn) return null;

		// uses 参数是可选的
		if (typeof uses == 'function') {
			context = uses;
			uses = [];
		} else {
			uses = self.getUses(uses, name);
		}

		// 建立前缀占位模块
		self.makePrefixPackage(name);

		// lib中存储的是function
		// 注意别给覆盖了，有可能是有 file 成员的
		var pkg = _lib[name];
		if (!pkg) pkg = _lib[name] = {};
		pkg.name = name;
		pkg.uses = uses;
		pkg.fn = context;

		return pkg;
	};

	/**
	 * use
	 * @param uses 用逗号分隔开的模块名称列表
	 * @param context uses加载后调用，将module通过参数传入context，第一个参数为exports，后面的参数为每个module的不重复引用，顺序排列
	 */
	this.use = function(self, uses, context) {
		self.loadLib();

		var name = '__anonymous_' + self.anonymousModuleCount + '__';
		self.anonymousModuleCount++;
		var module = self.add(name, uses, context);

		// 第二个{}参数会被所有相关module通过第一个 exports 参数获取到，实现module获取调用者的信息
		// 之前是直接将window代替exports传递进去，但是在module初始化完毕后会有一个遍历赋值__name__的过程，会导致IE6下出错，且遍历window也会有性能问题
		// 因此改为传入exports，然后在extend到window上。
		// 经验是，不要用一个已经有内容、不可控的对象作为executeModule的exports。
		self.executeModule(module, {}, [], function(exports) {
			for (var property in exports) {
				if (property != '__name__' && window[property] === undefined) window[property] = exports[property];
			}
		}, {name: '__main__'});
	};

	/**
	 * execute
	 * @param name 执行的入口模块名称
	 * @param options 传入参数
	 */ 
	this.execute = function(self, name) {
		self.loadLib();

		var module = _lib[name];
		if (!module) throw new object.NoModuleError(name);

		self.executeModule(module, {}, [], null, {name: '__main__'});
	};

});

})();

/**
* @namespace
* @name ua
*/
object.add('ua', /**@lends ua*/ function(exports) {

	var numberify = this.numberify = function(s) {
		var c = 0;
		// convert '1.2.3.4' to 1.234
		return parseFloat(s.replace(/\./g, function() {
			return (c++ === 0) ? '.' : '';
		}));
	};

	var o = this.ua = {};
	var ua = navigator.userAgent, m, m2;
	var core, shell;

	// check IE
	if ((m = ua.match(/MSIE\s([^;]*)/)) && m[1]) {

		// IE8: always IE8, with Trident 4
		// IE9: same as documentMode, with Trident 5
		// IE10: same as documentMode, with Trident 6
		if ((m2 = ua.match(/Trident\/([\d.]*)/)) && m2[1]) {
			o[core = 'ie'] = document.documentMode;
			o[shell = 'ieshell'] = numberify(m2[1]) + 4;
		// IE6
		// IE7
		} else {
			o[shell = 'ieshell'] = o[core = 'ie'] = numberify(m[1]);
		}

	} else {

		// check core

		// Webkit
		if ((m = ua.match(/AppleWebKit\/([\d.]*)/)) && m[1]) {
			o[core = 'webkit'] = numberify(m[1]);

		// Gecko
		} else if ((m = ua.match(/Gecko/))) {
			o[core = 'gecko'] = 0; // Gecko detected, look for revision
			if ((m = ua.match(/rv:([\d.]*)/)) && m[1]) {
				o[core] = numberify(m[1]);
			}

		// Presto
		// ref: http://www.useragentstring.com/pages/useragentstring.php
		} else if ((m = ua.match(/Presto\/([\d.]*)/)) && m[1]) {
			o[core = 'presto'] = numberify(m[1]);
		}

		// check shell

		// Chrome
		if ((m = ua.match(/Chrome\/([\d.]*)/)) && m[1]) {
			o[shell = 'chrome'] = numberify(m[1]);

		// Safari
		} else if ((m = ua.match(/\/([\d.]*) Safari/)) && m[1]) {
			o[shell = 'safari'] = numberify(m[1]);

		// Firefox
		} else if ((m = ua.match(/Firefox\/([\d.]*)/)) && m[1]) {
			o[shell = 'firefox'] = numberify(m[1]);

		// Opera
		} else if ((m = ua.match(/Opera\/([\d.]*)/)) && m[1]) {
			o[shell = 'opera'] = numberify(m[1]); // Opera detected, look for revision

			if ((m = ua.match(/Opera\/.* Version\/([\d.]*)/)) && m[1]) {
				o[shell] = numberify(m[1]);
			}
		}
	}

	o.shell = shell;
	o.core = core;

});


/**
 * @namespace
 * @name string
 */
object.add('string', /**@lends string*/ function(exports) {

/**
 * 模板
 */
this.substitute = function() {
	return Mustache.to_html.apply(null, arguments);
};

this.camelCase = function(str) {
	return str.replace(/-\D/g, function(match){
		return match.charAt(1).toUpperCase();
	});
};

this.hyphenate = function(str) {
	return str.replace(/[A-Z]/g, function(match){
		return ('-' + match.charAt(0).toLowerCase());
	});
};

this.capitalize = function(str) {
	return str.replace(/\b[a-z]/g, function(match){
		return match.toUpperCase();
	});
};

this.trim = function(str) {
	return (str || '').replace(/^\s+|\s+$/g, '');
};

this.ltrim = function(str) {
	return (str || '').replace(/^\s+/ , '');
};

this.rtrim = function(str) {
	return (str || '').replace(/\s+$/ , '');
};

this.lengthZh = function(str) {
	return str.length;
};

/**
 * 将对象转换为querystring
 * 来自 mootools
 */
this.toQueryString = function(object) {
	var queryString = [];

	for (var key in object) {
		var value = object[key];

		var result;

		if (value && value.constructor === Array) {
			var qs = {};
			value.forEach(function(val, i) {
				qs[i] = val;
			});

			result = arguments.callee(qs, key);
		} else if (typeof value == 'object') {
			result = arguments.callee(value, key);
		} else {
			result = key + '=' + encodeURIComponent(value);
		}

		if (value !== null) queryString.push(result);
	}

	return queryString.join('&');
};

});
/**
 * @namespace
 * @name events
 */
object.add('events', 'ua', /**@lends events*/ function(exports, ua) {

function IEEvent() {

}
IEEvent.prototype.stopPropagation = function() {
	this.cancelBubble = true;
};

IEEvent.prototype.preventDefault = function() {
	this.returnValue = false;
};

IEEvent.prototype.getPreventDefault = function() {
	// 自定义事件是没有 returnValue 值的，如果设置默认为true，则会导致非自定义的事件后面再设置false失效，出现无法preventDefault()的问题
	// 不能设置默认值，就只能严格限制returnValue === false才算preventDefaulted
	return this.returnValue === false;
};

IEEvent.prototype.stop = function() {
	this.stopPropagation();
	this.preventDefault();
};

/**
 * decorator
 * 使得相应方法在调用时fire出同名事件，并支持preventDefault
 * fireevent 或 fireevent(eventName)
 * fireevent 默认eventName通过__name__获得
 */
this.fireevent = function(arg1) {
	var name, func, eventDataNames;

	// 千万别给这个function起名字，否则fire出来的事件都叫一个名字
	var firer = function(self) {
		// 获取function原生name似乎没什么用
		// var nativeName = Function.__get_name__(arguments.callee) || arguments.callee.__name__;
		var nativeName = arguments.callee.__name__;
		if (!name) name = nativeName;

		// 根据eventDataNames生成eventData，每一个参数对应一个eventData
		var eventData = {};
		// 保存func被调用时的所有参数（除了self）
		var args = Array.prototype.slice.call(arguments, 1);
		if (eventDataNames) {
			for (var i = 0; i < eventDataNames.length; i++) {
				// 名字对应方法的参数，从第2个参数开始，因为第一个是self
				eventData[eventDataNames[i]] = arguments[i + 1];
			}
		}
		// 默认有一个_args的data，
		eventData._args = args;

		var event = self.fireEvent(name, eventData, self);

		// 执行 xxx_createEvent 方法，可用于定制event
		var createEventMethod = self[nativeName + '_createEvent'];
		if (createEventMethod) {
			args.unshift(event);
			createEventMethod.apply(self, args);
		}

		// Webkit 使用 defaultPrevented
		// Gecko 使用 getPreventDefault()
		// IE 用 returnValue 模拟了 getPreventDefault
		var preventDefaulted = event.getPreventDefault? event.getPreventDefault() : event.defaultPrevented;
		if (!preventDefaulted) return func.apply(this, arguments);
	};

	if (typeof arg1 == 'function') {
		func = arg1;
		return firer;

	// 自定义了事件名称，返回一个decorator
	} else {
		if (Array.isArray(arguments[0])) {
			eventDataNames = arguments[0];
		} else {
			name = arg1;
			if (arguments[1]) eventDataNames = arguments[1];
		}
		return function(_func) {
			func = _func;
			return firer;
		};
	}

};

/**
 * 将IE中的window.event包装一下
 */
this.wrapEvent = function(e) {
	// 之前手贱在这里写了个 e.returnValue = true
	// 于是所有的事件都无法阻止执行了
	// IE可能只认第一次赋值，因为后面还是有重新把returnValue设置成false的

	e.target = e.srcElement;
	e.stopPropagation = IEEvent.prototype.stopPropagation;
	e.preventDefault = IEEvent.prototype.preventDefault;
	e.getPreventDefault = IEEvent.prototype.getPreventDefault;
	e.stop = IEEvent.prototype.stop;

	return e;
};

// 事件
this.Events = new Class(/**@lends events.Event*/ function() {

	// 在标准浏览器中使用的是系统事件系统，无法保证nativeEvents在事件最后执行。
	// 需在每次addEvent时，都将nativeEvents的事件删除再添加，保证在事件队列最后，最后才执行。
	function moveNativeEventsToTail(self, type) {
		var boss = self.__boss || self;
		if (self.__nativeEvents && self.__nativeEvents[type]) {
			// 删除之前加入的
			boss.removeEventListener(type, self.__nativeEvents[type].run, false);
			// 重新添加到最后
			boss.addEventListener(type, self.__nativeEvents[type].run, false);
		}
	};

	function handle(self, type) {
		var boss = self.__boss || self;
		boss.attachEvent('on' + type, function(eventData) {
			var event = arguments.length > 1? eventData : exports.wrapEvent(window.event);
			var funcs = self.__eventListeners? self.__eventListeners[type] : null;
			if (funcs) {
				funcs.forEach(function(func) {
					try {
						func.call(self, event);
					} catch(e) {
					}
				});
			}
			var natives = self.__nativeEvents? self.__nativeEvents[type] : null;
			if (natives) {
				natives.forEach(function(func) {
					func.call(self, event);
				});
			}
		});
	}

	this.initialize = function(self) {
		if (!self.addEventListener) {
			// 在一些情况下，你不知道传进来的self对象的情况，不要轻易的将其身上的__eventListeners清除掉
			if (!self.__eventListeners) self.__eventListeners = {};
			if (!self.__nativeEvents) self.__nativeEvents = {};
		}
		// 自定义事件，用一个隐含div用来触发事件
		if (!self.addEventListener && !self.attachEvent) {
			self.__boss = document.createElement('div');
		}
	};

	/**
	 * 添加事件
	 * @param self
	 * @param type 事件名
	 * @param func 事件回调
	 * @param cap 冒泡
	 */
	this.addEvent = document.addEventListener? function(self, type, func, cap) {
		var boss = self.__boss || self;

		if (cap === null) cap = false;

		// 非IE不支持mouseleave/mouseenter事件
		// 在老base中大量使用了这个事件，支持一下
		if (!ua.ua.ie && type == 'mouseleave') {
			var ismouseleave = function(event, element) {
				var p = event.relatedTarget;
				while ( p && p != element ) try { p = p.parentNode; } catch(error) { p = element; }
				return p !== element;
			};
			var innerFunc = func;
			func = function(event) {
				var p = event.relatedTarget;
				while (p && p != self) try {
					p = p.parentNode;
				} catch (e) {
					p = self;
				}
				if (p !== self && innerFunc) innerFunc.call(self, event);
			};
			func.innerFunc = innerFunc;
			type = 'mouseout';
		}

		boss.addEventListener(type, func, cap);
		moveNativeEventsToTail(self, type);

	} : function(self, type, func) {
		var boss = self.__boss || self;

		// 存储此元素的事件
		var funcs;
		if (!self.__eventListeners) self.__eventListeners = {};
		if (!self.__eventListeners[type]) {
			funcs = [];
			self.__eventListeners[type] = funcs;
			if (!self.__nativeEvents || !self.__nativeEvents[type]) {
				handle(self, type);
			}
		} else {
			funcs = self.__eventListeners[type];
		}

		// 不允许两次添加同一事件
		if (funcs.some(function(f) {
			return f === func;
		})) return;

		funcs.push(func);

	};

	this.addNativeEvent = document.addEventListener? function(self, type, func) {
		var boss = self.__boss || self;
		var natives;
		if (!self.__nativeEvents) self.__nativeEvents = {};
		if (!self.__nativeEvents[type]) {
			natives = [];
			self.__nativeEvents[type] = natives;
			self.__nativeEvents[type].run = function(event) {
				natives.forEach(function(func) {
					func.call(self, event);
				});
			};
			moveNativeEventsToTail(self, type);
		} else {
			natives = self.__nativeEvents[type];
		}
		natives.push(func);

	} : function(self, type, func) {
		var boss = self.__boss || self;
		var natives;
		if (!self.__nativeEvents) self.__nativeEvents = {};
		if (!self.__nativeEvents[type]) {
			natives = [];
			self.__nativeEvents[type] = natives;
			if (!self.__nativeEvents || !self.__eventListeners[type]) {
				handle(self, type);
			}
		} else {
			natives = self.__nativeEvents[type];
		}

		// 不允许两次添加同一事件
		if (natives.some(function(f) {
			return f === func;
		})) return;

		natives.push(func);
	};

	/**
	 * 移除事件
	 * @param self
	 * @param type 事件名
	 * @param func 事件回调
	 * @param cap 冒泡
	 */
	this.removeEvent = document.removeEventListener? function(self, type, func, cap) {
		var boss = self.__boss || self;

		boss.removeEventListener(type, func, cap);
	} : function(self, type, func, cap) {
		var boss = self.__boss || self;

		if (!self.__eventListeners) self.__eventListeners = {};
		var funcs = self.__eventListeners[type];
		if (!funcs) return;

		for (var i = 0; i < funcs.length; i++) {
			if (funcs[i] === func) {
				funcs.splice(i, 1); // 将这个function删除
				break;
			}
		}
	};

	/**
	 * 触发事件
	 * @param self
	 * @param type 事件名
	 * @param eventData 扩展到event对象上的数据
	 */
	this.fireEvent = document.dispatchEvent? function(self, type, eventData) {
		var boss = self.__boss || self;

		var triggerName = 'on' + type.toLowerCase();
		var event = document.createEvent('Event');
		event.initEvent(type, false, true);
		object.extend(event, eventData);

		if (self[triggerName]) {
			var returnValue = self[triggerName].call(self, event);
			if (returnValue === false) event.preventDefault();
		}

		boss.dispatchEvent(event);
		return event;
	} : function(self, type, eventData) {
		if (!eventData) eventData = {};
		var triggerName = 'on' + type.toLowerCase();
		var event = exports.wrapEvent(eventData);

		if (self[triggerName]) {
			var returnValue = self[triggerName].call(self, event);
			if (returnValue === false) event.preventDefault();
		}

		if (!self.__eventListeners[type]) return event;
		var funcs = self.__eventListeners[type];
		for (var i = 0, j = funcs.length; i < j; i++) {
			if (funcs[i]) {
					try {
						funcs[i].call(self, event, true);
					} catch(e) {
					}
			}
		}

		var natives = self.__nativeEvents[type];
		if (natives) {
			natives.forEach(function(func) {
				func.call(self, event);
			});
		}

		return event;
	};
});

});
/**
 * @namespace
 * @name options
 */
object.add('options', /**@lends options*/ function(exports) {

// 仿照 mootools 的overloadSetter，返回一个 key/value 这种形式的function参数的包装，使其支持{key1: value1, key2: value2} 这种形式
var enumerables = true;
for (var i in {toString: 1}) enumerables = null;
if (enumerables) enumerables = ['hasOwnProperty', 'valueOf', 'isPrototypeOf', 'propertyIsEnumerable', 'toLocaleString', 'toString', 'constructor'];
// func有可能是个method，需要支持传递self参数
this.overloadsetter = function(func) {
	return function() {
		var a = arguments[func.length - 2] || null;
		var b = arguments[func.length - 1];
		var passArgs = args = Array.prototype.slice.call(arguments, 0, func.length - 2);

		if (a === null) return this;
		if (typeof a != 'string') {
			for (var k in a) {
				args = passArgs.slice(0); // 复制，否则循环多次参数就越来越多了
				args.push(k);
				args.push(a[k]);
				func.apply(this, args);
			}
			if (enumerables) {
				for (var i = enumerables.length; i > 0; i--) {
					k = enumerables[i];
					if (a.hasOwnProperty(k)) func.call(this, k, a[k]);
				}
			}
		} else {
			args.push(a);
			args.push(b);
			func.apply(this, args);
		}
		return this;
	};
};

/**
 * 这个类辅助这种参数传递方式的实现：
 * callFunc({
 *	param1: someValue1,
 *	param2: someValue2
 * })
 * 在声明函数时，通过：
 * var opts = new ns.Arguments(opts, {
 *	param1: 1,
 *	param2: 2
 * });
 * 来设定默认值，没有设置过默认值的成员不会输出
 * @class
 */
this.Arguments = new Class(function() {

	/**
	 * @param defaults 默认值列表
	 * @param opts 参数列表
	 */
	this.initialize = function(self, defaults, opts) {
		if (opts == undefined) opts = {};

		var output = {};
		for (var key in defaults) {
			output[key] = (opts[key] != undefined? opts[key] : defaults[key]);
		}
		return output;
	};

});

/**
 * 参数
 * @class
 */
this.Options = new Class({

	/**
	 * 提供一个实现了 makeOption 接口的“提供者”参数，这样，在 setOption 时会自动根据name获取value，不用手工调用
	 */
	initialize: function(self, provider) {
		if (provider) self._provider = provider;
		self._options = {};
	},

	setOptions: function(self, options, host) {
		if (!host) host = self._options;

		for (var i in options) {
			if (host[i] !== undefined) host[i] = options[i];
		}
	},

	setOption: function(self, name, type, value) {
		if (value !== undefined) {
			self._options[name] = value;
		} else {
			value = self._provider.makeOption(name, type);
			if (value === null) return;
			else self._options[name] = value;
		}
	},

	getOptions: function(self) {
		return self._options;
	}

});

});

/**
 * @namespace
 * @name dom
 */
object.add('dom', 'ua, events, string, dd, sys', /**@lends dom*/ function(exports, ua, events, string, dd, sys) {

window.UID = 1;
var storage = {};

var get = function(uid) {
	return (storage[uid] || (storage[uid] = {}));
};

var $uid = this.$uid = (window.ActiveXObject) ? function(item){
	return (item.uid || (item.uid = [window.UID++]))[0];
} : function(item){
	return item.uid || (item.uid = window.UID++);
};

$uid(window);
$uid(document);

if (!window.__domloadHooks) {
	window.__domLoaded = false;
	window.__domloadHooks = [];

	if (document.addEventListener) {
		document.addEventListener('DOMContentLoaded', function() {
			document.removeEventListener('DOMContentLoaded', arguments.callee, false);
			window.__domLoaded = true;
		}, false);
	}

	var timer = null;
	if (ua.ua.webkit && ua.ua.webkit < 525) {
		timer = setInterval(function() {
			if (/loaded|complete/.test(document.readyState)) {
				clearInterval(timer);
				window.__domLoaded = true;
				runHooks();
			}
		}, 10); 
	} else if (ua.ua.ie) {
		timer = setInterval(function() {
			try {
				document.body.doScroll('left');
				clearInterval(timer);
				window.__domLoaded = true;
				runHooks();
			} catch (e) {}
		}, 20); 
	}
}

function runHooks() {
	var callbacks = window.__domloadHooks;
	var fn;
	while (callbacks[0]) {
		try {
			fn = callbacks.shift();
			fn();
		} catch (e) {
			// TODO 去掉XN依赖
			if (XN && XN.DEBUG_MODE) throw e;
		}
	}
}

/**
 * 在dom加载完毕后执行callback。
 * 不同于 DOMContentLoaded 事件，如果 dom.ready 是在页面已经加载完毕后调用的，同样会执行。
 * 用此方法限制需要执行的函数一定会在页面结构加载完毕后执行。
 * @param callback 需要执行的callback函数
 */
this.ready = function(callback) {
	if (window.__domLoaded == true) {
		callback();
		return;
	}
	//处理DOMContentLoaded触发完毕再动态加载objectjs的情况
	//此时DOMContentLoaded事件已经触发完毕，为DOMContentLoaded添加的事件不触发，且此时window.__domLoaded依然为false
	//解决方案：
	//	参考jQuery的做法，判断readyState是否为complete。
	//	对于3.6以前的Firefox，不支持readyState的，这里暂时忽略
	//	http://webreflection.blogspot.com/2009/11/195-chars-to-help-lazy-loading.html
	//	https://bugzilla.mozilla.org/show_bug.cgi?id=347174
	if (document.readyState == 'complete') {
		window.__domLoaded = true;
		runHooks();
		callback();
		return;
	} 
	if ((ua.ua.webkit && ua.ua.webkit < 525) || !document.addEventListener) {
		window.__domloadHooks.push(callback);
	} else if (document.addEventListener) {
		document.addEventListener('DOMContentLoaded', callback, false);
	}	
};

/**
 * 包装一个元素，使其拥有相应的Element包装成员
 * 比如 div 会使用 Element 进行包装
 * form 会使用 FormElement 进行包装
 * input / select 等会使用 FormItemElement 进行包装
 * 包装后的节点成员请参照相应的包装类成员
 * @function
 * @name dom.wrap
 * @param node 一个原生节点
 */
var wrap = this.wrap = function(node) {
	if (!node) return null;

	if (Array.isArray(node)) {
		return new Elements(node);
	} else {
		// 已经wrap过了
		if (node._wrapped) return node;

		var wrapper;
		if (node === window) {
			wrapper = Window;
		} else if (node === window.document) {
			wrapper = Document;
		} else if (node.nodeType === 1) {
			wrapper = getWrapper(node.tagName);
		} else {
			return node;
		}

		// 尽早的设置_wrapped，因为在wrapper的initialize中可能出现递归调用（FormElement/FormItemElement）
		node._wrapped = true;

		$uid(node);

		Class.inject(wrapper, node);

		return node;
	}
};

/**
 * 通过selector获取context作用域下的节点集合
 * dom.Elements包装后的节点数组拥有相应最小Element的统一调用方法
 * 比如 forms = dom.getElements('form'); 'send' in forms // true
 * @function
 * @name dom.getElements
 * @param selector 一个css selector
 * @param context 一个节点
 * @returns {dom.Elements}
 */
var getElements = this.getElements = function(selector, context) {
	if (!context) context = document;

	// 解析成Slick Selector对象
	var parsed = Slick.parse(selector);

	// Slick在面对自定义标签时各种不靠谱，换用sizzle
	var eles = Sizzle(selector, context);

	// 这里通过分析selector的最后一个部分的tagName，来确定这批eles的wrapper
	// 例如selector是 div form.xxx 则wrapper是 FormElement
	// 例如selector是 div .xxx 则wrapper是 Element
	// 例如selector是 div select.xxx, div.input.xxx 则wrapper是 FormItemElement

	var wrapper, part;
	// 绝大部分情况都是length=0，只有1个selector，保证其性能
	if (parsed.expressions.length == 1) {
		part = parsed.expressions[0];
		wrapper = getWrapper(part[part.length - 1].tag);

	// 由多个selector组成，比如 div select.xxx, div.input.xxx，要保证这种能取到 FormItemElement
	} else {
		// 通过生成每个selector wrapper的继承链，不断的生成当前selector和上一个selector的继承链的相同部分
		// 最后的chain的最后一个元素，既是公用wrapper
		for (var i = 0, chain, previousChain; i < parsed.expressions.length; i++) {
			part = parsed.expressions[i];
			wrapper = getWrapper(part[part.length - 1].tag);

			// 当前selector最后元素的wrapper chain
			// slice(0, -1) 过滤掉Element继承的 Attribute 类
			chain = Class.getChain(wrapper).slice(0, -1).reverse();
			if (previousChain) {
				chain = getCommon(chain, previousChain);
			}
			// 如果相同部分length=1，则代表找到Element类了，可以停止继续搜索
			if (chain.length == 1) break;
			previousChain = chain;
		}
		wrapper = chain[chain.length - 1];
	}

	return new Elements(eles, wrapper);
};

/**
 * 通过selector获取context作用域下的第一个节点
 * @function
 * @name dom.getElement
 * @param selector 一个css selector
 * @param context 一个节点
 * @returns 一个包装后的结点
 */
var getElement = this.getElement = function(selector, context) {
	if (!context) context = document;

	var ele = Sizzle(selector, context)[0];
	ele = wrap(ele);
	return ele;
};

/**
 * document.getElementById 的简单调用
 * @param id id
 */
this.id = function(id) {
	return exports.wrap(document.getElementById(id));
};

/**
 * eval inner js
 * 执行某个元素中的script标签
 */
var eval_inner_JS = this.eval_inner_JS = function(ele) {
	var js = [];
	if (ele.nodeType == 11) { // Fragment
		for (var i = 0; i < ele.childNodes.length; i++) {
			if (ele.childNodes[i].nodeType === 1) {
				js = js.concat(ele.childNodes[i].getElementsByTagName('script'));
			}
		}
	} else if (ele.nodeType == 1) { // Node
		js = ele.getElementsByTagName('script');
	}


	// IE下此句不生效
	// js = [].slice.call(js, 0);

	var arr = [];
	for (i = 0; i < js.length; i++) {
		arr.push(js[i]);
	}

	arr.forEach(function(s, i) {
		if (s.src) {
			// TODO
			return;
		} else {
			var inner_js = '__inner_js_out_put = [];\n';
			inner_js += s.innerHTML.replace( /document\.write/g, '__inner_js_out_put.push' );
			eval(inner_js);
			if (__inner_js_out_put.length !== 0) {
				var tmp = document.createDocumentFragment();
				$(tmp).appendHTML(__inner_js_out_put.join(''));
				s.parentNode.insertBefore(tmp, s);
			}
		}
	});
};
	
var _supportUnknownTags = (function() {
	// 检测浏览器是否支持通过innerHTML设置未知标签，典型的就是IE不支持
	var t = document.createElement('div');
	t.innerHTML = '<TEST_TAG></TEST_TAG>';
	// IE 下无法获取到自定义的Element，其他浏览器会得到HTMLUnknownElement
	return !(t.firstChild === null);
})();
// 检测在修改了表单元素的name值后是否会同步form.elements的同名成员
var _supportNamedItemSync = (function() {
	if (ua.ua.ie < 8) return false;
	return true;
})();
var _supportPlaceholder = 'placeholder' in document.createElement('input');
var _supportNaturalWH = 'naturalWidth' in document.createElement('img');
var _supportHTML5Forms = 'checkValidity' in document.createElement('input');
var _supportHidden = 'hidden' in document.createElement('div');
var _supportMultipleSubmit = 'formAction' in document.createElement('input');

var nativeproperty = function() {
	var prop = property(function(self) {
		return self[prop.__name__];
	}, function(self, value) {
		self._set(prop.__name__, value);
	});
	return prop;
};

var attributeproperty = function(defaultValue, attr) {
	var prop = property(function(self) {
		if (!attr) attr = prop.__name__.toLowerCase();
		var value = self.getAttribute(attr);
		return value != null? value : defaultValue;
	}, function(self, value) {
		if (!attr) attr = prop.__name__.toLowerCase();
		self.setAttribute(attr, value);
	});
	return prop;
};

//如何判断浏览器支持HTML5的拖拽：
//Detecting "draggable' in document.createElement('span') seems like a good idea, but in practice it doesn't work.
//iOS claims that draggable is in the element but doesn't allow drag and drop.(Reference: Safari Web Content Guide: Handling Events)
//IE9 claims that draggable is NOT in the element, but does allow drag and drop. (Reference: my testing HTML5 drag and drop in IE.)

//from http://kangax.github.com/iseventsupported/
function isEventSupported(eventName, element) {
	var TAGNAMES = {
		'select': 'input', 'change': 'input',
		'submit': 'form', 'reset': 'form',
		'error': 'img', 'load': 'img', 'abort': 'img'
	};
	element = element || document.createElement(TAGNAMES[eventName] || 'div');
	eventName = 'on' + eventName;
	
	var isSupported = (eventName in element);
	
	if (!isSupported) {
		// if it has no `setAttribute` (i.e. doesn't implement Node interface), try generic element
		if (!element.setAttribute) {
			element = document.createElement('div');
		}
		if (element.setAttribute && element.removeAttribute) {
			element.setAttribute(eventName, '');
			isSupported = typeof element[eventName] == 'function';

			// if property was created, "remove it" (by setting value to `undefined`)
			if (typeof element[eventName] != 'undefined') {
				element[eventName] = undefined;
			}
			element.removeAttribute(eventName);
		}
	}
	
	element = null;
	return isSupported;
}

var iOS = !!navigator.userAgent.match('iPhone OS') || !!navigator.userAgent.match('iPad');
//正确的判断是否支持HTML5的拖拽方法 from Modernizr.js ：http://modernizr.github.com/Modernizr/annotatedsource.html
var _supportHTML5DragDrop = !iOS && isEventSupported('dragstart') && isEventSupported('drop');

/**
 * 通过一个字符串创建一个Fragment
 * @function
 * @static
 * @name dom.Element.getDom
 */
this.getDom = function(str) {
	var tmp = document.createElement('div');
	var result = document.createDocumentFragment();

	if (!_supportUnknownTags) {
		tmp.style.display = 'none';
		document.body.appendChild(tmp);
	}

	tmp.innerHTML = str;
	while (tmp.firstChild) {
		result.appendChild(wrap(tmp.firstChild));
	}

	if (!_supportUnknownTags) tmp.parentNode.removeChild(tmp);

	return result;
};

/**
 * html5 classList api
 * @class
 * @name dom.ElementClassList
 * @extends Array
 */
var ElementClassList = this.ElementClassList = new Class(Array, /**@lends dom.ElementClassList*/ function() {

	this.initialize = function(self, ele) {
		self.length = 0; // for Array

		self._ele = ele;
		self._loadClasses();
	};

	this._loadClasses = function(self) {
    	self._classes  = self._ele.className.replace(/^\s+|\s+$/g, '').split(/\s+/);
	};

	this.toggle = function(self, token) {
		if (self.contains(token)) self.remove(token);
		else self.add(token);
	};

	this.add = function(self, token) {
		if (!self.contains(token)) self._ele.className += (' ' + token); // 根据规范，不允许重复添加
	};

	this.remove = function(self, token) {
		self._ele.className = self._ele.className.replace(new RegExp(token, 'i'), '');
	};

	this.contains = function(self, token) {
		self._loadClasses();
		if (self._classes.indexOf(token) != -1) return true;
		else return false;
	};

	this.item = function(self, i) {
		return self._classes[i] || null;
	};

	this.toString = function (self) {
		return self._ele.className;
	};

});

/**
 * 拖拽模块
 * @class
 * @name dom.DragDrop
 */
var DragDrop = this.DragDrop = new Class(/**@lends dom.Element*/ function() {

	//拖拽时会修改拖拽元素的默认样式
	var _modifiedPropertiesByDrag = ['display', 'position', 'width', 'height', 'border', 
			'backgroundColor', 'filter', 'opacity', 'zIndex', 'left', 'top'];
	//支持HTML5拖拽的浏览器下，自动draggable等于true的元素tag
	var _autoDraggableTags = ['IMG', 'A'];

	Class.mixin(this, events.Events);

	//屏蔽IE默认的拖拽行为
	if(ua.ua.ie) {
		document.ondragstart = returnFalse;
	}

	this.initialize = function(self) {
		//如果draggable元素的值为true，则模拟HTML5的行为，让元素可拖拽，并且触发一系列事件
		//IMG和A标签在支持HTML5拖拽的浏览器中默认是true的，因此需要特殊处理
		if (self.get('draggable') == true 
			&& (_autoDraggableTags.indexOf(self.tagName) == -1)) {
			//需要为document添加事件
			self.__docForDD = wrap(document);
			//bind事件，将bind后的函数作为事件监听
			self.__binderForDD = {
				checkDragging : self._checkDragging.bind(self),
				cancel : self._cancelDrag.bind(self),
				dragging: self._dragging.bind(self),
				finish: self._finishDrag.bind(self)
			}
			//为元素添加拖拽的相关行为
			self.set('draggable', true);
			//屏蔽当前拖拽元素下的A和IMG的拖拽行为，让元素的拖拽行为可以disable
			self._forbidAutoDraggableNodes();
		}
		//模拟放置行为(暂时dropzone还只是用来作为简单标识)
		if (self.get('dropzone') != undefined && self.get('dropzone') != "") { 
			self.set('dropzone', 'default');
		}
	};

	/**
	 * 定义draggable的获取和设置方法
	 */
	this.draggable = property(
		function(self){
			return self.draggable;
		}, 
		function(self, draggable){
			//设置元素的draggable为true
			self._set('draggable', draggable);
			if(draggable) {
				if(self.__canDrag == true) {
					return;
				}
				//为元素自身添加鼠标点击的监听
				self.addEvent('mousedown', self._handleMouseDownForDD, false);
				self.__canDrag = true;
				//如果已经有归属了，则不再重新计算
				if(self.__belongToDroppable	!= null) {
					return;
				}
				//保存所有的容器元素列表
				self.__droppables = [];
				//往上寻找自己所属的容器
				var parent = self.parentNode;
				while(parent && parent.tagName != 'BODY' && parent.tagName != 'HTML') {
					if(parent.dropzone != undefined && parent.dropzone != '') {
						parent = wrap(parent);
						self.__belongToDroppable = parent;
						self.__droppables.push(parent);
						break;
					}
					parent = parent.parentNode;
				}
			} else {
				if(self.__canDrag == true) {
					//去除自身的鼠标点击监听
					self.removeEvent('mousedown', self._handleMouseDownForDD, false);
					//保留当前所属容器和容器列表，为再次可拖拽做准备
					//self.__belongToDroppable = null;
					//self.__droppables = null;
					self.__canDrag = false;
				}
			}
		}
	);

	/**
	 * 定义dropzone的获取和设置方法
	 */
	this.dropzone = property(
		function(self){
			return self.dropzone;
		}, 
		function(self, dropzone){
			self._set('dropzone', dropzone);
			if(dropzone != undefined && dropzone != '') {
				if(self.__canDrop != true) {
					self.__canDrop = true;
				}	
			} else {
				if(self.__canDrop == true) {
					self.__canDrop = false;
				}
			}
		}
	);

	/**
	 * 获取容器列表
	 */	
	this.getDroppableList = function(self) {
		return self.__canDrag ? self.__droppables : null;
	}
	/**
	 * 获取当前所在的容器
	 */
	this.getCurrentDroppable = function(self) {
		return self.__canDrag ? self.__belongToDroppable : null;
	}

	/**
	 * 为容器添加其他可拖拽的元素（意味着其他元素可以拖放进入此容器）
	 *
	 * @param self
	 * @param draggables  添加的可拖拽元素，元素本身必须是可拖拽的
	 * @param isInit 	  当前容器是否是这些可拖拽元素的初始容器
	 */
	this.addDraggables = function(self, draggables, isInit) {
		if(self.__canDrop != true) {
			return self;
		}
		isInit = isInit || false;
		if(!self.__draggables) {
			self.__draggables = [];
		}
		for(var i=0,l=draggables.length,current; i<l; i++) {
			current = draggables[i];
			if(!current._canDrag) {
				current.enableDrag();
			} 
			//如果新添加元素的容器列表中已经有当前元素了，则不需要重新再添加
			if(current.__droppables.indexOf(self) == -1) {
				current.__droppables.push(self);
			}
			if(isInit) {
				current.__belongToDroppable = self;
			}
		}
		return self;
	}

	/**
	 * 为当前可拖拽元素增加一个新的可放置容器
	 *
	 * @param self
	 * @param droppable 新增加的容器对象
	 * @param isInit	是否作为初始容器（draggable元素的当前容器）
	 */
	this.addDroppable = function(self, droppable, isInit) {
		if(self.__canDrag != true) {
			return self;
		}
		isInit = isInit || false;
		self.__droppables = self.__droppables || [];
		//放入容器列表
		self.__droppables.push(droppable);
		if(isInit) {
			//将此容器作为初始容器
			self.__belongToDroppable = droppable;
		}
		return self;
	}

	if(_supportHTML5DragDrop) {
		/**
		 * 屏蔽当前可拖拽元素的所有A，IMG元素的拖拽行为
		 */
		this._forbidAutoDraggableNodes = function(self) {
			if(self.__canDrag != true) {
				return self;
			}
			//获取子元素
			var subNodes = getElements(_autoDraggableTags.join(','), self);
			for(var i=0,l=subNodes.length; i<l; i++) {
				subNodes[i].draggable = false;
			}
			return self;
		}
	} else {
		/**
		 * 如果不支持HTML5的拖拽，则不需要屏蔽
		 */
		this._forbidAutoDraggableNodes = function(self) {
			return self;
		}
	}


	/**
	 * 考虑框架页对事件addEvent方法的影响，封装为document元素添加事件的方法
	 * 但是在dom模块中增加了对页面框架模块asyncHTMLManager的判断，不是好的解决方案
	 */	
	this._addEventToDoc = function(self, type, callback, bubble) {
		//如果有页面框架模块，则采用覆盖前的addEvent
		var addEvent = window.asyncHTMLManager ?
			window.asyncHTMLManager.dom.Element.prototype.addEvent : self._doc.addEvent;

		addEvent.call(self.__docForDD, type, callback, bubble);
	}

	/**
	 * 考虑框架页对事件removeEvent方法的影响，封装为document元素删除事件的方法
	 */	
	this._removeEventFromDoc = function(self, type, callback, bubble) {
		//如果有页面框架模块，则采用覆盖前的removeEvent
		var removeEvent = window.asyncHTMLManager ?
			window.asyncHTMLManager.dom.Element.prototype.removeEvent : self._doc.removeEvent;

		removeEvent.call(self.__docForDD, type, callback, bubble);
	}	

	/**
	 * 处理鼠标的点击以后的拖拽行为
	 *
	 * @param e 点击发生时的事件对象
	 */
	this._handleMouseDownForDD = function(self, e) {	
		//阻止默认行为，让代码控制拖拽行为
		if(e.preventDefault) e.preventDefault();
		if(e.stopPropagation) e.stopPropagation();
		
		var mousePos = getMousePos(e);
		var selfPos = self.position();
		//初始的鼠标位置
		self.__originMouseX = mousePos.x;
		self.__originMouseY = mousePos.y;
		//初始的元素坐标位置(top, left)，用于解决chrome浏览器的拖拽位置不变认为是单击的问题
		if(ua.ua.chrome) {
			self.__originX = selfPos.x;
			self.__originY = selfPos.y;
			//确保chrome下添加的click事件一定被移除了，这里不会抛出异常
			self.removeEvent('click', fixChromeClick, false);
		}
		//用于拖拽时，定位元素相对于鼠标指针的位置
		self.__deltaX = mousePos.x - selfPos.x;
		self.__deltaY = mousePos.y - selfPos.y;

		//触发draginit事件，HTML5标准钟并没有此事件，因此暂不触发
		//self.fireEvent('draginit', {dragging:self, event:e});

		//给document的mousemove 和 mouseup加上事件
		self._addEventToDoc('mousemove', self.__binderForDD.checkDragging, false);
		self._addEventToDoc('mouseup', self.__binderForDD.cancel, false);

		//屏蔽拖拽元素的选择行为
		self.__selectionEventName = ua.ua.ie ? 'selectstart' : 'mousedown';
		self._addEventToDoc(self.__selectionEventName, returnFalse, false); 
	}

	/**
	 * 根据鼠标的移动距离，判断是否已经开始拖拽
	 *
	 * 初始情况下为document的mousemove方法添加的是checkDragging，判断是否是拖拽操作
	 * 如果开始拖拽，再将checkDragging改为dragging，正式执行拖拽的功能
	 *
	 * @param e 事件对象
	 */	
	this._checkDragging = function(self, e) {
		//在IE下，如果拖动非常迅速时，鼠标变成禁止符号，这里需要禁止默认事件的发生
		if(e.preventDefault) e.preventDefault();
		
		//计算鼠标移动的距离，如果大于某一个阈值，则认为开始拖动
		//这是Mootools的方案，Kissy还提供了一种鼠标点击持续事件的判断，如果大于200ms，说明是拖拽
		var mousePos = getMousePos(e);
		var distance = Math.round(Math.sqrt(Math.pow(mousePos.x - self.__originMouseX, 2) + 
				Math.pow(mousePos.y - self.__originMouseY, 2)));
		//说明开始拖拽了
		if(distance > 3) {
			//把mousemove由检查拖拽改为执行拖拽，把mouseup由取消改为完成
			self._removeEventFromDoc('mousemove', self.__binderForDD.checkDragging, false);
			self._removeEventFromDoc('mouseup', self.__binderForDD.cancel, false);
			self._addEventToDoc('mousemove', self.__binderForDD.dragging, false);
			self._addEventToDoc('mouseup', self.__binderForDD.finish, false);
		
			//给元素添加拖拽时候的基本样式
			addDraggingStyle(self);

			//触发dragstart事件，参考HTML5规范
			self.fireEvent('dragstart', {dragging:self, event:e});

			//这里也触发所属元素的dropinit事件
			//dropinit不是HTML5规范规定的，但是也是有必要的
			//dragstart, drag, dragend是draggable元素的完整生命周期，
			//但是如果没有dropinit，droppable元素只有dropenter, dropover, dropleave, drop，没有初始状态，不完整
			//具体示例：如果在拖拽初始时需要创建占位元素，如果没有dropinit，就只能针对每一个元素的dragstart编写代码了
			if(self.__belongToDroppable) {
				self.__belongToDroppable.fireEvent('dropinit', {dragging:self, event:e});
			}
		}
	}

	/**
	 * 拖拽时的事件处理方法
	 *
	 * @param e 事件对象
	 */
	this._dragging = function(self, e) {
		//阻止默认事件
		if(e.preventDefault) e.preventDefault();

		//利用鼠标位置，修改拖拽元素的位置
		var mousePos = getMousePos(e);
		self.style.left = (mousePos.x - self.__deltaX) + 'px';
		self.style.top  = (mousePos.y - self.__deltaY) + 'px';
		//触发drag事件，遵循HTML5规范
		self.fireEvent('drag', {dragging:self, event:e});

		//计算当前元素的具体位置坐标
		var selfPos = self.position();
		var draggingCoordinates = {
			top: selfPos.y,
			left: selfPos.x,
			right: selfPos.x + parseInt(self.getStyle('width')),
			bottom: selfPos.y + parseInt(self.getStyle('height'))
		}

		//针对每一个容器，检查当前元素是否在容器当中
		for(var i=0,current,currentPos,containerCoordinates,l=self.__droppables.length; i<l; i++) {
			current = self.__droppables[i];

			//计算每一个容器的边界
			currentPos = current.position();
			containerCoordinates = {
				top: currentPos.y,
				left: currentPos.x,
				right: currentPos.x + parseInt(current.getStyle('width')),
				bottom: currentPos.y + parseInt(current.getStyle('height'))
			}
			
			//判断容器的关系
			if(current == self.__belongToDroppable) {
				//如果容器是拖拽元素所属容器
				if(isInContainer(containerCoordinates, draggingCoordinates)) {
					//如果还在容器内，说明在所属容器内部移动，触发dragover事件
					current.fireEvent('dragover', {from:current, to:current, dragging:self});
				} else {
					//如果不在容器内，说明从所属容器中移出，触发dragleave事件
					current.fireEvent('dragleave', {from:current, to:null, dragging:self});
					self.__belongToDroppable = null;
				}
			//如果容器不是拖拽元素所属容器
			} else if(isInContainer(containerCoordinates, draggingCoordinates)) {
				//如果拖拽元素所属容器不为空，说明从拖拽容器中脱离出来了(是不是会跟上面事件触发有重复?试验还没出现这种情况)
				if(self.__belongToDroppable) {
					self.__belongToDroppable.fireEvent('dragleave', {from:self.__belongToDroppable, to:current, dragging:self});
				}
				//进入此容器了，触发dragenter
				//注意元素初始情况下会属于某个容器，初始化的时候要记录，避免错误的触发dragenter，mootools貌似没有判断
				current.fireEvent('dragenter', {from:self.__belongToDroppable, to:current, dragging:self});
				self.__belongToDroppable = current;
			}
		}	
	}

	/**
	 * 拖拽完成时调用的方法
	 *
	 * @param self
	 * @param e 事件对象
	 */
	this._finishDrag = function(self, e) {
		if(e.preventDefault) e.preventDefault();

		//拖拽已完成，去除给document添加的一系列事件
		self._removeEventFromDoc('mousemove', self.__binderForDD.dragging, false);
		self._removeEventFromDoc('mouseup', self.__binderForDD.finish, false);
		self._removeEventFromDoc(self.__selectionEventName, returnFalse, false); 

		//去除基本的拖拽样式设置
		removeDraggingStyle(self);
		//如果元素属于某个容器，则触发该容器的drop事件
		if(self.__belongToDroppable) {
			self.__belongToDroppable.fireEvent('drop', {dragging:self, event:e});
		}
		//触发dragend事件，按照HTML5的标准，应该在容器drop事件之后触发
		self.fireEvent('dragend', {dragging:self, event:e});
		
		if(ua.ua.chrome) {
			//获取当前位置(应该放在drop和dropend事件之后，因为在这两个事件中可以继续调整元素的位置)
			var pos = self.position();
			//如果没有发生变化，则屏蔽chrome的click事件，避免再次请求页面
			if(pos.x == self.__originX && pos.y == self.__originY) {
				self.addEvent('click', fixChromeClick, false);
			}	
		}
	}

	/**
	 * 取消拖拽操作，在checkDragging的过程中已经释放鼠标，说明并不是拖拽
	 *
	 * @param self
	 * @param e 事件对象
	 */
	this._cancelDrag = function(self, e) {
		//去除为document添加的所有事件
		self._removeEventFromDoc('mousemove', self.__binderForDD.checkDragging, false);
		self._removeEventFromDoc('mouseup', self.__binderForDD.cancel, false);
		self._removeEventFromDoc(self.__selectionEventName, returnFalse, false); 

		//触发取消事件（HTML5中没有此事件，Mootools中有）
		self.fireEvent('cancel', {dragging:self, event:e});	
	}

	/********************************* DragDrop的辅助方法 ************************************/

	/**
	 * 为屏蔽Chrome下拖拽再放回原处认为是单击的问题，这里将click事件进行屏蔽
	 *
	 * @param e 事件对象
	 */
	function fixChromeClick(e) {
		//点击以后马上移除
		this.removeEvent('click', arguments.callee, false);
		//阻止默认执行和冒泡
		e.preventDefault();
		e.stopPropagation();
	}

	/**
	 * 为元素增加拖拽时的样式设置
	 *
	 * @param element 拖拽的元素
	 */
	function addDraggingStyle(element) {
		//备份元素在拖拽之前的属性值
		element.oldStyle = {};
		var currentStyle = element.style;
		_modifiedPropertiesByDrag.forEach(function(prop) {
			element.oldStyle[prop] = currentStyle[prop];
		});
		//设置拖拽元素的基本属性
		element.style.display = 'block';
		//width和height一定要在设置position属性之前获取
		element.style.width = parseInt(element.getStyle('width')) + 'px';
		element.style.height = parseInt(element.getStyle('height')) + 'px';
		element.style.position = 'absolute';
		element.style.backgroundColor = '#ccc';
		if(ua.ua.ie) {
			element.style.filter = 'Alpha(opacity=70)';
		} else {
			element.style.opacity = '0.7';
		}
		element.style.zIndex = '10000';	
	}

	/**
	 * 为元素去除拖拽的样式设置
	 *
	 * @param element 拖拽的元素
	 */
	function removeDraggingStyle(element) {
		_modifiedPropertiesByDrag.forEach(function(prop) {
			element.style[prop] = element.oldStyle[prop];
		});
		element.oldStyle = null;
	}

	/**
	 * 获取鼠标的具体位置坐标（完善此方法）
	 *
	 * @param ev 事件对象
	 */ 
	function getMousePos(ev) {
	   /** 
		* mootools:
		*  this.page = {
		   	x: (event.pageX != null) ? event.pageX : event.clientX + doc.scrollLeft,
		   	y: (event.pageY != null) ? event.pageY : event.clientY + doc.scrollTop
		   };
		   this.client = {
		   	x: (event.pageX != null) ? event.pageX - win.pageXOffset : event.clientX,
		   	y: (event.pageY != null) ? event.pageY - win.pageYOffset : event.clientY
		   };
		*/
		return {
			x : (ev.pageX != null) ? ev.pageX : ev.clientX + document.body.scrollLeft - document.body.clientLeft,
			y : (ev.pageY != null) ? ev.pageY : ev.clientY + document.body.scrollTop  - document.body.clientTop
		};		
	}

	/**
	 * 根据两个坐标位置，判断dragging是否在container中
	 *
	 * @param container 容器
	 * @param dragging  拖拽元素
	 *
	 * TODO 目前只是简单的判断了垂直方向的位置，还应该引入更加完善的判断方式
	 */
	function isInContainer(container, dragging) {
		return dragging.bottom >= container.top && dragging.top <= container.bottom; 
	}

	/**
	 * 辅助方法，用于作为事件监听
	 */
	function returnFalse() {
		return false;
	}

	/**
	 * 获取元素的属性值
	 *
	 * @param self
	 * @param style 属性名称
	 *
	 * @returns 属性名称对应的属性值
	 *
	 * 此方法来自XN.element
	 */
	this.getStyle = function(self, style) {
		if(ua.ua.ie) {
			style = (style == 'float' || style == 'cssFloat') ? 'styleFloat' : style;
		    var value = self.style[style];
		    if (!value && self.currentStyle) value = self.currentStyle[style];
		
		    if (style == 'opacity') {
				if (value = (self.style['filter'] || '').match(/alpha\(opacity=(.*)\)/)) {
					if (value[1]) {
						return parseFloat(value[1]) / 100;
					}
				}
				return 1.0;
		    }
		    if (value == 'auto') {
				if ((style == 'width' || style == 'height') && (self.getStyle('display') != 'none')) {
					return self['offset'+ (style == 'width' ? 'Width' : 'Height')] + 'px';
				}
				return null;
		    }
		    return value;
		} else {
			style = style == 'float' ? 'cssFloat' : style;
			var value = self.style[style];
			if (!value) {
				var css = document.defaultView.getComputedStyle(self, null);
				value = css ? css[style] : null;
			}
			if (style == 'opacity') return value ? parseFloat(value) : 1.0;
			return value == 'auto' ? null : value;
		}
	};

	/**
	 * 获取元素的具体位置信息
	 *
	 * @param self
	 * @return 形如{x:xxx, y:xxx}的位置信息对象，x是横向坐标，y是纵向坐标
	 *
	 * 此方法来自网络，需要参考标准获取方法和其他框架内容，再完善 
	 */
	this.position = function(self){
		if(self.parentNode === null || self.style.display == 'none') {
			return false;
		}

		var parent = null;
		var pos = [];
		var box;
	 
		if(self.getBoundingClientRect) {     //IE    
			box = self.getBoundingClientRect();
			var scrollTop = Math.max(document.documentElement.scrollTop, document.body.scrollTop);
			var scrollLeft = Math.max(document.documentElement.scrollLeft, document.body.scrollLeft); 
			return {x : box.left + scrollLeft, y : box.top + scrollTop};
		} else if(document.getBoxObjectFor) {    // gecko
			box = document.getBoxObjectFor(self);            
			var borderLeft = (self.style.borderLeftWidth) ? parseInt(self.style.borderLeftWidth) : 0;
			var borderTop = (self.style.borderTopWidth) ? parseInt(self.style.borderTopWidth) : 0; 
			pos = [box.x - borderLeft, box.y - borderTop];
		} else {    // safari & opera   
			pos = [self.offsetLeft, self.offsetTop];
			parent = self.offsetParent;
			if (parent != self) {
				while (parent) {
					pos[0] += parent.offsetLeft;
					pos[1] += parent.offsetTop;
					parent = parent.offsetParent;
				}
			}
			if (ua.ua.opera  
				|| ( ua.ua.safari && self.style.position == 'absolute' )) { 
				pos[0] -= document.body.offsetLeft;
				pos[1] -= document.body.offsetTop;
			}  
		}
			 
		parent = self.parentNode || null;

		while (parent && parent.tagName != 'BODY' && parent.tagName != 'HTML') { 
			// account for any scrolled ancestors
			pos[0] -= parent.scrollLeft;
			pos[1] -= parent.scrollTop;   
			parent = parent.parentNode; 
		}
		return {x:pos[0], y:pos[1]};
	};
});

/**
 * @class
 * @name dom.Element
 */
var Element = this.Element = new Class(/**@lends dom.Element*/ function() {

	Class.mixin(this, events.Events);
	Class.mixin(this, DragDrop);

	this.initialize = function(self, tagName) {
		// 直接new Element，用来生成一个新元素
		if (tagName) {
			self = document.createElement(tagName);
			wrap(self);

		// 包装现有元素
		} else {
		}
		// self可能是已经包装过的对象，不要将其身上的__eventListeners清除掉
		if (!self.__eventListeners) self.__eventListeners = {};
		if (!self.__nativeEvents) self.__nativeEvents = {};
		if (self.classList === undefined && self !== document && self !== window) {
			self.classList = new ElementClassList(self);
		}
	};

	if (_supportHidden) {
		this.hidden = nativeproperty();
	} else {
		this.hidden = property(function(self) {
			return self.style.display == 'none';
		}, function(self, value) {
			if (value == true) {
				if (self.style.display !== 'none') self.__oldDisplay = self.style.display;
				self.style.display = 'none';
			} else {
				self.style.display = self.__oldDisplay || '';
			}
		});
	}

	/*
	 * 从dom读取数据
	 */
	this.retrieve = function(self, property, dflt){
		var storage = get(self.uid), prop = storage[property];
		if (dflt !== null && prop === null) prop = storage[property] = dflt;
		return prop !== null ? prop : null;
	};

	/**
	 * 存储数据至dom
	 */
	this.store = function(self, property, value){
		var storage = get(self.uid);
		storage[property] = value;
		return self;
	};

	/**
	 * 事件代理
	 * @param self
	 * @param selector 需要被代理的子元素selector
	 * @param type 事件名称
	 * @param callback 事件回调
	 */
	this.delegate = function(self, selector, type, callback) {
		self.addEvent(type, function(e) {
			var ele = e.srcElement || e.target;
			do {
				if (ele && Element.get('matchesSelector')(ele, selector)) callback.call(wrap(ele), e);
			} while((ele = ele.parentNode));
		});
	};

	/**
	 * html5 matchesSelector api
	 * 检测元素是否匹配selector
	 * @param self
	 * @param selector css选择符
	 */
	this.matchesSelector = function(self, selector) {
		return Sizzle.matches(selector, [self]).length > 0;
	};

	/**
	 * 获取元素上通过 data- 前缀定义的属性值
	 * @param self
	 * @param data name
	 * @return data value
	 */
	this.getData = function(self, name) {
		return self.getAttribute('data-' + name);
	};

	/**
	 * 设置元素的innerHTML
	 * @param self
	 * @param str html代码
	 */
	this.setHTML = function(self, str) {
		self.set('innerHTML', str);
	};

	/**
	 * @function
	 * @name dom.Element#setContent
	 * @borrows dom.Element.setHTML
	 */
	this.setContent = this.setHTML;

	/**
	 * 根据选择器返回第一个符合selector的元素
	 * @param self
	 * @param selector css选择符
	 */
	this.getElement = function(self, selector) {
		return getElement(selector, self);
	};

	/**
	 * 根据选择器返回数组
	 * @param self
	 * @param selector css选择符
	 */
	this.getElements = function(self, selector) {
		return getElements(selector, self);
	};

	var inserters = {
		before: function(context, element){
			var parent = element.parentNode;
			if (parent) parent.insertBefore(context, element);
		},
		after: function(context, element){
			var parent = element.parentNode;
			if (parent) parent.insertBefore(context, element.nextSibling);
		},
		bottom: function(context, element){
			element.appendChild(context);
		},
		top: function(context, element){
			element.insertBefore(context, element.firstChild);
		}
	};
	inserters.inside = inserters.bottom;

	/**
	 * @param self
	 * @param el 被添加的元素
	 * @param where {'bottom'|'top'|'after'|'before'} 添加的位置
	 */
	this.grab = function(self, el, where) {
		inserters[where || 'bottom'](el, self);
		return self;
	};

	/**
	 * @param self
	 * @param el 被添加的元素
	 * @param where {'bottom'|'top'|'after'|'before'} 添加的位置
	 */
	this.inject = function(self, el, where) {
		inserters[where || 'bottom'](self, el);
		return self;
	};

	this.getPrevious = function(self) {
		// TODO
	};

	this.getAllPrevious = function(self) {
		// TODO
	};

	this.getNext = function(self) {
		// TODO
	};

	this.getAllNext = function(self) {
		// TODO
	};

	this.getFirst = function(self) {
		// TODO
	};

	this.getLast = function(self) {
		// TODO
	};

	/**
	 * 查找符合selector的父元素
	 * @param selector css选择符
	 */
	this.getParent = function(self, selector) {
		if (!selector) return wrap(self.parentNode);

		var element = self;
		do {
			if (Element.get('matchesSelector')(element, selector)) return wrap(element);
		} while ((element = element.parentNode));
		return null;
	};

	this.getParents = function(self) {
		// TODO
	};

	this.getSiblings = function(self) {
		// TODO
	};

	this.getChildren = function(self) {
		// TODO
	};

	/**
	 * 添加className
	 * @param self
	 * @param name
	 */
	this.addClass = function(self, name) {
		self.classList.add(name);
	};

	/**
	 * 移除className
	 * @param self
	 * @param name
	 */
	this.removeClass = function(self, name) {
		self.classList.remove(name);
	};

	/**
	 * 切换className
	 * @param self
	 * @param name
	 */
	this.toggleClass = function(self, name) {
		self.classList.toggle(name);
	};

	/**
	 * 检查是否拥有className
	 * @param self
	 * @param name
	 */
	this.hasClass = function(self, name) {
		return self.classList.contains(name);
	};

	/**
	 * 设置inline style
	 * @param self
	 * @param property
	 * @param value
	 */
	this.setStyle = function(self, property, value) {
		switch (property){
			case 'opacity':
				return self.set('opacity', parseFloat(value));
			case 'float':
				property = floatName;
				break;
			default:
				break;
		}
		property = string.camelCase(property);
		self.style[property] = value;

		return null;
	};

	/**
	 * 移除自己
	 * @param self
	 */
	this.dispose = function(self) {
		return (self.parentNode) ? self.parentNode.removeChild(self) : self;
	};
	
	/**
	 * 隐藏一个元素
	 * @param self
	 */
	this.hide = function(self) {
		if (self.style.display !== 'none') self.oldDisplay = self.style.display;
		self.style.display = 'none';
	};

	/**
	 * 显示一个元素
	 * @param self
	 */
	this.show = function(self) {
		self.style.display = self.oldDisplay || '';
	};

	/**
	 * 切换显示
	 * @param self
	 */
	this.toggle = function(self) {
		if (self.style.display == 'none') self.show();
		else self.hide();
	};

	/**
	 * 通过字符串设置此元素的内容
	 * 为兼容HTML5标签，IE下无法直接使用innerHTML
	 */
	this.innerHTML = property(null, function(self, html) {
		if (_supportUnknownTags) {
			self.innerHTML = html;
		} else {
			var nodes = exports.getDom(html);
			self.innerHTML = '';
			while (nodes.firstChild) self.appendChild(nodes.firstChild);
		}
	});

	/**
	 * 保证大写的tagName
	 */
	this.tagName = property(function(self) {
		return self.tagName.toUpperCase();
	});

	/**
	 * 通过一个字符串创建一个包装后的dom节点
	 * 一下元素无法被处理哦：
	 * html/head/body/meta/link/script/style
	 * @function
	 * @static
	 * @name dom.Element.fromString
	 */
	this.fromString = staticmethod(function(str) {
		var tmp = document.createElement('div');
		if (!_supportUnknownTags) {
			tmp.style.display = 'none';
			document.body.appendChild(tmp);
		}
		tmp.innerHTML = str.trim();
		var result = wrap(tmp.firstChild);
		if (!_supportUnknownTags) tmp.parentNode.removeChild(tmp);
		return result;
	});

});

this.ImageElement = new Class(Element, function() {

	function _getNaturalSize(img) {
		var style = img.runtimeStyle;
		var old = {
			w: style.width,
			h: style.height
		}; //保存原来的尺寸
		style.width = style.height = "auto"; //重写
		var w = img.width; //取得现在的尺寸
		var h = img.height;
		style.width  = old.w; //还原
		style.height = old.h;
		return {
			width: w,
			height: h
		};
	};

	this.naturalWidth = property(function(self) {
		if (_supportNaturalWH) {
			return self.naturalWidth;
		} else {
			return _getNaturalSize(self).width;
		}
	});

	this.naturalHeight = property(function(self) {
		if (_supportNaturalWH) {
			return self.naturalHeight;
		} else {
			return _getNaturalSize(self).height;
		}
	});

});

/**
 * 表单
 * @class
 * @name dom.FormElement
 * @extends dom.Element
 */
this.FormElement = new Class(Element, /**@lends dom.FormElement*/ function() {

	this.initialize = function(self) {
		this.parent(self);

		if (self.elements) {
			for (var i = 0; i < self.elements.length; i++) {
				wrap(self.elements[i]);
			}
		}

		// 用自己的namedItem替换系统提供的，系统提供的在修改了name属性后无法同步
		if (!_supportNamedItemSync) {
			self.elements.namedItem = function(name) {
				return Sizzle('*[name=' + name + ']', self)[0];
			}
		}

		// 对于不支持多表单提交的浏览器在所有表单提交时都判断一下是否来源于特殊的提交按钮
		if (!_supportMultipleSubmit) {
			self.addNativeEvent('submit', function(event) {
				// 不是由一个特殊按钮触发的，直接返回
				if (!self.__submitButton) return;

				var button = self.__submitButton;
				self.__submitButton = null;

				// 在提交之前，用按钮的属性替换表单的属性
				var oldAction = self.action;
				var oldMethod = self.method;
				var oldEnctype = self.encoding || self.enctype;
				var oldNoValidate = self.noValidate;
				var oldTarget = self.target;
				var formAction = button.getAttribute('formaction');
				var formMethod = button.getAttribute('formmethod');
				var formEnctype = button.getAttribute('formenctype');
				var formNoValidate = button.getAttribute('formnovalidate');
				var formTarget = button.getAttribute('formtarget');
				if (formAction) self.action = formAction;
				if (formMethod) self.method = formMethod;
				if (formEnctype) self.enctype = self.encoding = formEnctype;
				if (formNoValidate) self.formNoValidate = formNoValidate;
				if (formTarget) self.target = formTarget;

				var preventDefaulted = event.getPreventDefault? event.getPreventDefault() : event.defaultPrevented;
				if (!preventDefaulted) {
					event.preventDefault();
					self.submit();
				}

				// 提交之后再恢复回来
				self.action = oldAction;
				self.method = oldMethod;
				self.enctype = self.encoding = oldEnctype;
				self.formNoValidate = oldNoValidate;
				self.target = oldTarget;
			});
		}
	};

	/**
	* 根据现有表单，创建一个Request对象
	*/
	this.createRequest = function(self, params) {
		if (!params) params = {};
		if (!params.method) params.method = self.method;
		if (!params.url) params.url = self.action;
		if (!params.data) params.data = self.toQueryString();
		if (!params.onsuccess) params.onsuccess = function(event) {
			self.fireEvent('requestSuccess', {request: event.request});
		};
		if (!params.onerror) params.onerror = function(event) {
			self.fireEvent('requestError', {request: event.request});
		};
		var net = sys.modules['net'];
		if (net) {
			xhr = new net.Request(params);
		} else {
			throw new ModuleRequiredError('net');
		}
		return xhr;
	};

	/**
	 * 用ajax发送一个表单
	 */
	this.send = function(self, data) {
		var request = self.createRequest();
		request.send(data);
		return request;
	};

	/**
	 * 将一个表单转换成queryString
	 */
	this.toQueryString = function(self) {
		var queryString = [];

		function addItem(name, value) {
			if (typeof value != 'undefined') queryString.push(encodeURIComponent(name) + '=' + encodeURIComponent(value));
		}

		self.getElements('input, select, textarea, output').forEach(function(el) {
			var type = el.type;
			if (!el.name || el.disabled || type == 'submit' || type == 'reset' || type == 'file' || type == 'image') return;

			if (el.tagName.toLowerCase() == 'select') {
				el.getSelected().map(function(opt) {
					// IE
					var value = wrap(opt).get('value');
					addItem(el.name, value);
				});
			} else if (type == 'radio' || type == 'checkbox') {
				if (el.checked) {
					addItem(el.name, el.get('value'));
				}
			} else {
				addItem(el.name, el.get('value'));
			}

		});
		return queryString.join('&');
	};

	this.checkValidity = function(self) {
		return self.getElements('input, select, textarea, output').every(function(el) {
			return el.checkValidity();
		});
	};

});

/**
 * textarea / input / textarea / select / option
 * @class
 * @name dom.FormItemElement
 * @extends dom.Element
 */
this.FormItemElement = new Class(Element, /**@lends dom.FormItemElement*/ function() {

	this.selectionStart = property(function(self) {
		if (typeof self.selectionStart == 'number') {
			return self.selectionStart;

		// IE
		} else if (document.selection) {
			self.focus();

			var range = document.selection.createRange();
			var start = 0;
			if (range.parentElement() == self) {
				var range_all = document.body.createTextRange();
				range_all.moveToElementText(self);
				
				for (start = 0; range_all.compareEndPoints('StartToStart', range) < 0; start++) {
					range_all.moveStart('character', 1);
				}
				
				for (var i = 0; i <= start; i++) {
					if (self.get('value').charAt(i) == '\n') start++;
				}
			}
			return start;
		}
	});
        
	this.selectionEnd = property(function(self) {
		if (typeof self.selectionEnd == 'number') {
			return self.selectionEnd;
		}
		// IE
		else if (document.selection) {
			self.focus();

			var range = document.selection.createRange();
			var end = 0;
			if (range.parentElement() == self) {
				var range_all = document.body.createTextRange();
				range_all.moveToElementText(self);
				
				for (end = 0; range_all.compareEndPoints('StartToEnd', range) < 0; end++) {
					range_all.moveStart('character', 1);
				}
				
				for (var i = 0; i <= end; i++) {
					if (self.get('value').charAt(i) == '\n') end++;
				}
			}
			return end;
		}
	});

	// for select
	this.getSelected = function(self) {
		self.selectedIndex; // Safari 3.2.1
		var selected = [];
		for (var i = 0; i < self.options.length; i++) {
			if (self.options[i].selected) selected.push(self.options[i]);
		};
		return selected;
	};

	this.value = property(function(self) {
		// 如果是placeholder，则value为空
		if (self.classList.contains('placeholder')) return '';
		return self.value;
	}, function(self, value) {
		// 设置value的时候取消placeholder模式
		if (self.classList.contains('placeholder')) {
			self.classList.remove('placeholder');
			self.removeAttribute('autocomplete');
			self.value = '';
		}
		self.value = value;
		if (!_supportPlaceholder && !self.value && self.getAttribute('placeholder')) {
			self.classList.add('placeholder');
			self.value = self.getAttribute('placeholder');
			self.setAttribute('autocomplete', 'off');
		};
		self.checkValidity();
	});

	if (!_supportHTML5Forms) {
		/* TODO */
		// autofocus
		// willvalidate
		// formnovalidate

		this.validity = property(function(self) {
			// required pattern min max step
			// text search url tel email password
			var value = self.get('value');
			
			var validity = {
				valueMissing: self.getAttribute('required') && !value? true : false,
				typeMismatch: (function(type) {
					if (type == 'url') return !(/^\s*(?:(\w+?)\:\/\/([\w-_.]+(?::\d+)?))(.*?)?(?:;(.*?))?(?:\?(.*?))?(?:\#(\w*))?$/i).test(value);
					if (type == 'tel') return !(/[^\r\n]/i).test(value);
					if (type == 'email') return !(/^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/i).test(value);
					return false;
				})(self.getAttribute('type')),
				patternMismatch: (function() {
					var pattern = self.getAttribute('pattern');
					if (pattern) return !(new RegExp('^' + pattern + '$')).test(value);
					else return false;
				})(),
				tooLong: (function() {
					var maxlength = self.getAttribute('maxlength');
					var n = Number(maxlength);
					if (n != maxlength) return false;
					return value.length > n;
				})(),
				customError: !!self.__customValidity,
				// 以下三个 firefox 4 beta 也不支持，暂时不支持
				rangeUnderflow: false,
				rangeOverflow: false,
				stepMismatch: false
			};
			validity.valid = ['valueMissing', 'typeMismatch', 'patternMismatch', 'tooLong', 'rangeUnderflow', 'rangeOverflow', 'stepMismatch', 'customError'].every(function(name) {
				return validity[name] === false;
			});
			self.__validationMessage = (function() {
				if (validity.valid) return '';
				// Logic from webkit
				// http://www.google.com/codesearch#N6Qhr5kJSgQ/WebCore/html/ValidityState.cpp&type=cs
				// 文案通过Firefox和Chrome测试而来
				// 虽然有可能同时不满足多种验证，但是message只输出第一个
				if (validity.customError) return self.__customValidity;
				if (validity.valueMissing) return '请填写此字段。';
				if (validity.typeMismatch) return '请输入一个' + self.getAttribute('type') + '。';
				if (validity.patternMismatch) return '请匹配要求的格式。';
				if (validity.tooLong) return '请将该文本减少为 ' + self.getAttribute('maxlength') + ' 个字符或更少（您当前使用了' + self.get('value').length + '个字符）。';
				if (validity.rangeUnderflow) return '值必须大于或等于' + self.getAttribute('min') + '。';
				if (validity.rangeOverflow) return '值必须小于或等于' + self.getAttribute('max') + '。';
				if (validity.stepMismatch) return '值无效。';
			})();
			self._set('validationMessage', self.__validationMessage);

			self._set('validity', validity);
			return validity;
		});

		this.validationMessage = property(function(self) {
			self.get('validity');
			return self.__validationMessage;
		});

		this.setCustomValidity = function(self, message) {
			self.__customValidity = message;
			self.get('validity');
		};

		/**
		 * html5 forms checkValidity
		 */
		this.checkValidity = function(self) {
			self.get('validity');
			return self.validity.valid;
		};

	} else {
		this.validity = property(function(self) {
			return self.validity;
		});

		this.validationMessage = property(function(self) {
			return self.validationMessage;
		});
	}

	/**
	 * focus，并且将光标定位到指定的位置上
	 */
	this.focusToPosition = function(self, position) {
		if (position === undefined) {
			position = self.get('value').length;
		}

		if (self.setSelectionRange) {
			self.focus();
			self.setSelectionRange(self.get('value').length, position);
		} else if (self.createTextRange) {
			var range = self.createTextRange();
			range.moveStart('character', position);
			range.collapse(true);
			range.select();
			self.focus();
		} else {
			self.focus();
		}
	};

});

// input, textarea
this.TextBaseElement = new Class(exports.FormItemElement, function() {

	this.initialize = function(self) {
		this.parent(self);

		if (!_supportPlaceholder) {
			self.bindPlaceholder();
		}
	};

	this.placeholder = property(function(self) {
		return self.getAttribute('placeholder');
	}, function(self, value) {
		self.setAttribute('placeholder', value);
		if (!_supportPlaceholder) {
			self.bindPlaceholder();
			if (self.get('_placeholding')) self.value = value;
		}
	});

	this._placeholding = property(function(self) {
		return self.classList.contains('placeholder');
	}, function(self, value) {
		if (value) {
			self.classList.add('placeholder');
			self.setAttribute('autocomplete', 'off');
		} else {
			self.classList.remove('placeholder');
			self.removeAttribute('autocomplete');
		}
	});

	/**
	 * bind一个input或者textarea，使其支持placeholder属性
	 */
	this.bindPlaceholder = function(self) {
		if (self._binded) return;
		self._binded = true;

		// 通过autocomplete=off避免浏览器记住placeholder
		function checkEmpty(event) {
			var placeholder = self.get('placeholder');
			if (!placeholder) return;

			if (self.get('_placeholding')) {
				if (event.type == 'focus' && self.value === placeholder) {
					self.value = '';
				}
				self.set('_placeholding', false);

			// IE不支持autocomplete=off，刷新页面后value还是placeholder（其他浏览器为空，或者之前用户填写的值），只能通过判断是否相等来处理
			} else if (!self.value || ((ua.ua.ie == 6 || ua.ua.ie == 7) && !event && self.value == placeholder)) {
				self.set('_placeholding', true);
				self.value = placeholder;
			}
		}
		self.addNativeEvent('focus', function(event) {
			return checkEmpty(event);
		});
		self.addNativeEvent('blur', function(event) {
			return checkEmpty(event);
		});
		// 在IE6下，由于事件执行顺序的问题，当通过send()发送一个表单时，下面这段脚本实际上是不工作的
		// 也就是说，在send()时，self.value还是placeholder的值，导致把placeholder的值发送出去了
		// 通过在toQueryString中调用get('value')过滤掉placeholder的值
		// 完美的解决方法大概是需要接管IE6下的事件系统，工程量比较大。
		if (self.form) {
			// addNativeEvent，确保此事件在最后执行
			wrap(self.form).addNativeEvent('submit', function() {
				if (self.classList.contains('placeholder')) {
					self.set('_placeholding', false);
					self.value = '';
					// 如果此表单提交没有导致浏览器刷新，则会执行以下setTimeout，将placeholder置回
					setTimeout(function() {
						checkEmpty();
					}, 0);
				}
			});
		}
		checkEmpty();
	};

});

this.InputElement = new Class(exports.TextBaseElement, function() {

	if (_supportMultipleSubmit) {
		this.formAction = nativeproperty();
		this.formEnctype = nativeproperty();
		this.formMethod = nativeproperty();
		this.formNoValidate = nativeproperty();
		this.formTarget = nativeproperty();
	} else {
		this.formAction = attributeproperty('');
		this.formEnctype = attributeproperty('application/x-www-form-urlencoded');
		this.formMethod = attributeproperty('get');
		this.formNoValidate = attributeproperty(false);
		this.formTarget = attributeproperty('');
	}

	this.initialize = function(self) {
		this.parent(self);

		if (!_supportMultipleSubmit) {
			self.addNativeEvent('click', function(event) {
				if (self.type == 'submit') {
					self.form.__submitButton = self;
				}
			});
		}
	};

	/**
	 * 用ajax发送一个表单
	 */
	this.send = function(self, data) {
		if (self.type != 'submit') return;
		var request = self.form.createRequest({
			method: self.getAttribute('formmethod') || self.form.method,
			url: self.getAttribute('formaction') || self.form.action,
			onsuccess: function(event) {
				self.fireEvent('requestSuccess', {request: event.request});
			},
			onerror: function(event) {
				self.fireEvent('requestError', {request: event.request});
			}
		});
		request.send(data);
		return request;
	};

});

this.TextAreaElement = new Class(exports.TextBaseElement, function() {
});

/**
 * @class
 * @name dom.Window
 * @extends dom.Element
 */
var Window = this.Window = new Class(Element, /**@lends dom.Window*/ function() {
});

/**
 * @class
 * @name dom.Document
 * @extends dom.Element
 */
var Document = this.Document = new Class(Element, /**@lends dom.Document*/ function() {
});

/**
 * 一个包装类，实现Element方法的统一调用
 * @class
 * @name dom.Elements
 * @extends Array
 */
var Elements = this.Elements = new Class(Array, /**@lends dom.Elements*/ function() {

	/**
	 * @param elements native dom elements
	 * @param wrapper 这批节点的共有类型，默认为Element
	 */
	this.initialize  = function(self, elements, wrapper) {
		if (!wrapper) wrapper = Element;

		for (var i = 0; i < elements.length; i++) {
			self.push(wrap(elements[i]));
		}

		Class.keys(wrapper).forEach(function(name) {
			if (typeof wrapper.get(name) != 'function') return;

			self[name] = function() {
				var element;
				for (var i = 0; i < self.length; i++) {
					element = self[i];
					if (typeof element[name] == 'function') {
						element[name].apply(self[i], [].slice.call(arguments, 0));
					}
				}
			};
		});

		self.set = function(key, value) {
			for (var i = 0; i < self.length; i++) {
				self[i].set(key, value);
			}
		};

		self.get = function(key) {
			var result = [];
			for (var i = 0; i < self.length; i++) {
				result.push(self[i].get(key));
			}
			return result;
		};
	};

});

var _tagMap = {
	'IMG': exports.ImageElement,
	'FORM': exports.FormElement,
	'INPUT': exports.InputElement,
	'TEXTAREA': exports.TextAreaElement,
	'OUTPUT': exports.FormItemElement,
	'SELECT': exports.FormItemElement,
	'OPTION': exports.FormItemElement,
	'BUTTON': exports.FormItemElement
};

// 根据ele的tagName返回他所需要的wrapper class
function getWrapper(tagName) {
	var tag = tagName.toUpperCase();
	var cls = _tagMap[tag];
	if (cls) return cls;
	else return Element;
}

// 比较两个数组，直到同位的成员不同，返回之前的部分
// [1,2,3,4], [1,2,5,6] 返回 [1,2]
function getCommon(arr1, arr2) {
	var i;
	for (i = 0, l = arr1.length; i < l; i++) {
		if (!arr2[i] || arr2[i] !== arr1[i]) {
			break;
		}
	}
	return arr1.slice(0, i);
}

});
/**
 * @namespace
 * @name dom
 */
object.add('dd', 'ua, events, sys', /**@lends dom*/ function(exports, ua, events, sys) {
});
/**
 * @namespace
 * @name net
 */
object.add('net', 'dom, events', /**@lends net*/ function(exports, dom, events) {

var ajaxProxies = this.ajaxProxies = {};

// 执行一个可跨域的ajax请求
// 跨域host必须有ajaxproxy.htm
// callback唯一参数返回 XMLHttpRequest 对象实例
this.ajaxRequest = function(url, callback) {
	var tmpA = document.createElement('a');
	tmpA.href = url;
	var hostname = tmpA.hostname;

	if (hostname && (hostname != location.hostname)) {
		var xhr = null;
		if (ajaxProxies[hostname]) callback(ajaxProxies[hostname].getTransport());
		else {
			var iframe = document.createElement('iframe');
			iframe.style.display = 'none';
			dom.ready(function() {
				document.body.insertBefore(iframe, document.body.firstChild);
				iframe.src = 'http://' + hostname + '/ajaxproxy.htm';
				if (iframe.attachEvent) {
					iframe.attachEvent('onload', function () {
						callback(iframe.contentWindow.getTransport());
						ajaxProxies[hostname] = iframe.contentWindow;
					});
				} else {
					iframe.onload = function () {
						callback(iframe.contentWindow.getTransport());
						ajaxProxies[hostname] = iframe.contentWindow;
					};
				}
			});
		}
	} else {
		if (window.ActiveXObject) {
			try {
				callback(new ActiveXObject('Msxml2.XMLHTTP'));
			} catch(e) {
				callback(new ActiveXObject('Microsoft.XMLHTTP'));
			}
		} else callback(new XMLHttpRequest());
	}
};

this.ping = function(url) {
	var n = "_net_ping_"+ (new Date()).getTime();
	var c = window[n] = new Image(); // 把new Image()赋给一个全局变量长期持有
	c.onload = (c.onerror=function(){window[n] = null;});
	c.src = url;
	c = null; // 释放局部变量c
};

/**
 * 发送Ajax请求的类
 * 使用时需要实例化一个Request对象,然后手动调用该对象的send方法完成发送(与base中的xmlhttp不同)
 * 
 * @param {object} options
 * @param {string} options.url 要请求的url
 * @param {string} options.method get/post
 * @param {function} options.onsuccess 请求成功后的回调,参数是封装过的ajax对象
 * param {function} options.onerror 请求失败后的回调
 */
this.Request = new Class(function() {

	Class.mixin(this, events.Events);

	this.initialize = function(self, options) {
		self.url = options.url || '';
		self.method = options.method || 'get';
		self.headers = {};
		self.data = options.data || null;
		self._xhr = null;

		self.onSuccess = options.onSuccess;
		self.onsuccess = options.onsuccess;
		self.onerror = options.onerror;
		self.oncomplete = options.oncomplete;
	};

	this.send = function(self, data) {
		exports.ajaxRequest(self.url, function(xhr) {
			self._xhr = xhr;
			var eventData = {request: self};

			xhr.onreadystatechange = function() {
				var xhr = self._xhr;

				if (xhr.readyState === 4) {

					// IE6 dont's support getResponseHeader method
					//if (xhr.getResponseHeader('Content-Type') == 'text/json') {
						//xhr.responseJSON = JSON.parse(xhr.responseText)
					//}

					self.responseText = xhr.responseText;
					self.responseXML = xhr.responseXML;
					//self.responseJSON = xhr.responseJSON;

					// Compatible
					eventData.responseText = xhr.responseText;
					eventData.responseXML = xhr.responseXML;

					if (xhr.status === undefined || xhr.status === 0 || (xhr.status >= 200 && xhr.status < 300)) {
						self.fireEvent('success', eventData);
						if (self.onSuccess) self.onSuccess(eventData);
					} else {
						self.fireEvent('error', eventData);
					}
					self.fireEvent('complete', eventData);
				}
			};
			var xhr = self._xhr;
			var url = self.url;

			if (!data) data = self.data;

			// 处理data
			if (data && self.method == 'get') {
				url += (url.indexOf('?') != -1 ? '&' : '?') + data;
				data = null;
			}

			// open
			xhr.open(self.method, url, true);

			xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');

			// headers
			for (var name in self.headers) {
				xhr.setRequestHeader(name, self.headers[name]);
			}

			self._xhr.send(data);
		});
	};

	this.getResponseHeader = function(self, key) {
		return self._xhr.getResponseHeader(key);
	};

	this.setHeader = function(self, name, value) {
		self.headers[name] = value;
	};

});

});

/**
 * @namespace
 * @name mvc
 */
object.add('mvc', 'events', /**@lends mvc*/ function(exports, events) {


/**
 * MVC Action 基类
 * @class
 */
var Action = this.Action = new Class(events.Events, function() {

	this.initialize = function(self) {
		events.Events.initialize(self);

		self.view = null;
	};

	this.execute = function(self, view) {
		self.view = view;
		view.load(self);
	};

});

});

/**
 * @namespace
 * @name ui
 */
object.add('ui', 'string, options, dom, events', /**@lends ui*/ function(exports, string, options, dom, events) {

/**
 * @class
 */
var Element = new Class(function() {

	Class.keys(dom.Element).forEach(function(name) {
		var member = dom.Element.get(name);
		if (['initialize'].indexOf(name) != -1) return;
		if (typeof member != 'function') return;

		this[name] = function(self) {
			var args = [];
			var arg;
			// 代理方法支持Component参数
			for (var i = 1; i < arguments.length; i++) {
				arg = arguments[i];
				args.push((arg && arg._node)? arg._node : arg);
			}
			return dom.Element.prototype[name].apply(self._node, args);
		};
	}, this);

});

/**
 * @class
 * @name ui.Components
 */
this.Components = new Class(Array, /**@lends ui.Components*/ function() {

	/**
	 * @param elements wrapped dom elements
	 * @param type 这批节点的共有Component类型，默认为Component
	 */
	this.initialize = function(self, elements, type, options) {
		if (!type) type = exports.Component;

		for (var i = 0; i < elements.length; i++) {
			self.push(new type(elements[i], options));
		}

		Class.keys(type).forEach(function(name) {
			if (typeof type.prototype[name] != 'function') return;

			self[name] = function() {
				var element;
				//var i, arg, args = [];
				// 代理方法支持Component参数
				//for (i = 0; i < arguments.length; i++) {
					//arg = arguments[i];
					//args.push((arg && arg._node)? arg._node : arg);
				//}
				for (i = 0; i < self.length; i++) {
					element = self[i];
					if (typeof element[name] == 'function') {
						element[name].apply(self[i], arguments);
					}
				}
			};
		});

		self.set = function(key, value) {
			for (var i = 0; i < self.length; i++) {
				self[i].set(key, value);
			}
		};

		self.get = function(key) {
			var result = [];
			for (var i = 0; i < self.length; i++) {
				result.push(self[i].get(key));
			}
			return result;
		};
	};

});

/**
 * 为一个Component定义一个sub components引用
 * 用法：
 * MyComponent = new Class(ui.Component, {
 *	refname: ui.define('css selector', ui.menu.Menu)
 * });
 * 这样MyComponent实例的refname属性极为相对应selector获取到的节点引用
 * @param selector 选择器
 * @param type 构造类
 * @param single 是否是单独的引用
 */
this.define = function(selector, type, single) {
	var prop = property(function(self) {
		return self[prop.__name__];
	});
	prop.isComponent = true;
	prop.selector = selector;
	prop.type = type || exports.Component;
	prop.single = single;
	return prop;
};

/**
 * 定义唯一引用的sub component
 */
this.define1 = function(selector, type) {
	return exports.define(selector, type, 1);
};

var getConstructor = function(type) {
	if (type === 'number') return Number;
	else if (type === 'string') return String;
	else if (type === 'boolean') return Boolean;
};

/**
 * 声明一个option
 * 用法：
 * MyComponent = new Class(ui.Component, {
 *	myConfig: ui.option(1)
 * });
 * 这样MyComponent实例的myConfig属性值即为默认值1，可通过 set 方法修改
 */
this.option = function(defaultValue, getter, setter) {
	var prop;
	function fget(self) {
		return self.getOption(prop.__name__);
	}
	function fset(self, value) {
		return self.setOption(prop.__name__, value);
	}
	prop = property(fget, fset);
	prop.isOption = true;
	prop.defaultValue = defaultValue;
	prop.getter = getter || function(self, name, defaultValue) {
		var value = self._node.getData(name.toLowerCase());
		if (value) return getConstructor(typeof defaultValue)(value);
	};
	prop.setter = setter;
	return prop;
};

// metaclass
this.component = new Class(function() {

	this.__new__ = function(cls, name, base, dict) {

		if (dict.__metaclass__) {
			dict.__defaultOptions = []; // 默认options
			dict.__subs = [];
			dict.__subEvents = {}; // 通过subName_eventType进行注册的事件
			dict.__onEvents = []; // 通过oneventtype对宿主component注册的事件 // 通过oneventtype对宿主component注册的事件 // 通过oneventtype对宿主component注册的事件 // 通过oneventtype对宿主component注册的事件
			dict.__handles = ['init', 'revert', 'invalid', 'error', 'reset']; // 定义的会触发事件的方法集合, reset为兼容处理 Compatible
			dict.__methods = [];
		} else {
			dict.__defaultOptions = [];
			dict.__subs = [];
			dict.__subEvents = {};
			dict.__onEvents = [];
			dict.__handles = [];
			dict.__methods = [];

			Object.keys(dict).forEach(function(name) {
				if (name == 'initialize' || name.indexOf('__') == 0) return;
				var member = dict[name];

				// member有可能是null
				if (member != null && member.__class__ === property) {
					if (member.isComponent) {
						dict.__subs.push(name);
					} else if (member.isOption) {
						dict.__defaultOptions.push(name);
					}
				} else if (typeof member == 'function') {
					if (name.match(/^(_?[a-zA-Z]+)_([a-zA-Z]+)$/)) {
						(dict.__subEvents[RegExp.$1] = dict.__subEvents[RegExp.$1] || []).push(RegExp.$2);

					} else if (name.match(/^on([a-zA-Z]+)$/)) {
						dict.__onEvents.push(RegExp.$1);

					} else if (name.slice(0, 1) == '_' && name.slice(0, 2) != '__' && name != '_set') { // _xxx but not __xxx
						dict.__handles.push(name.slice(1));

					} else {
						dict.__methods.push(name);
					}
				}
			});
		}

		return type.__new__(cls, name, base, dict);
	};

	this.initialize = function(cls, name, base, dict) {

		var proto = cls.prototype;
		var baseProto = base.prototype;

		proto.__handles.forEach(function(eventType) {
			cls.set(eventType, events.fireevent(function(self) {
				return cls.get('_' + eventType).apply(cls, arguments);
			}));
		});

		if (base && baseProto.addons) {
			proto.addons.push.apply(proto.addons, baseProto.addons);
		}

		if (proto.addons) {
			proto.addons.forEach(function(comp) {
				if (!comp) throw new Error('bad addon');

				var compProto = comp.prototype;
				compProto.__defaultOptions.forEach(function(name) {
					var defaultOptions = proto.__defaultOptions;
					if (defaultOptions.indexOf(name) != -1) return;
					defaultOptions.push(name);
					cls.set(name, comp.get(name));
				});

				compProto.__subs.forEach(function(name) {
					var subs = proto.__subs;
					if (subs.indexOf(name) != -1) return;
					subs.push(name);
					cls.set(name, comp.get(name));
				});

				compProto.__handles.forEach(function(eventType) {
					var handles = proto.__handles;
					var methodName = '_' + eventType;
					if (handles.indexOf(eventType) != -1) return;
					handles.push(eventType);
					cls.set(eventType, compProto[eventType].im_func);
					cls.set(methodName, compProto[methodName].im_func);
				});

				compProto.__methods.forEach(function(name) {
					var methods = proto.__methods;
					if (methods.indexOf(name) != -1) return;
					methods.push(name);
					cls.set(name, compProto[name].im_func);
				});
				// onEvents和subEvents在宿主中处理，方法不添加到宿主类上
			});
		}

		if (base && base !== type) {
			baseProto.__defaultOptions.forEach(function(name) {
				var defaultOptions = proto.__defaultOptions;
				if (defaultOptions.indexOf(name) == -1) defaultOptions.push(name);
			});

			baseProto.__subs.forEach(function(name) {
				var subs = proto.__subs;
				if (subs.indexOf(name) == -1) subs.push(name);
			});

			baseProto.__handles.forEach(function(eventType) {
				var handles = proto.__handles;
				if (handles.indexOf(eventType) == -1) proto.__handles.push(eventType);
			});

			baseProto.__methods.forEach(function(name) {
				var methods = proto.__methods;
				if (methods.indexOf(name) == -1) methods.push(name);
			});

			Object.keys(baseProto.__subEvents).forEach(function(subName) {
				var subEvents = proto.__subEvents;
				baseProto.__subEvents[subName].forEach(function(eventType) {
					var subEvent = subEvents[subName];
					if (subEvent && subEvent.indexOf(eventType) != -1) return;
					(subEvents[subName] = subEvents[subName] || []).push(eventType);
				});
			});

			baseProto.__onEvents.forEach(function(eventType) {
				var onEvents = proto.__onEvents;
				if (onEvents.indexOf(eventType) == -1) onEvents.push(eventType);
			});
		}
	};
});

/**
 * UI模块基类，所有UI组件的基本类
 * @class
 * @name ui.Component
 */
this.Component = new Class(/**@lends ui.Component*/ function() {

	this.__metaclass__ = exports.component;

	this.__mixins__ = [Element];

	this.initialize = function(self, node, options) {
		if (!node.nodeType) {
			if (typeof node == 'string') {
				node = {
					template: node
				};
			}
			var data = {};
			self.__defaultOptions.forEach(function(key) {
				if (options[key] === undefined) data[key] = self.get(key);
			});
			object.extend(data, options);

			var tdata;
			if (node.section) {
				tdata = {};
				tdata[node.section] = data;
			} else {
				tdata = data;
			}
			var str = string.substitute(node.template, tdata);
			node = dom.Element.fromString(str);
		}

		self.__nodeMap = {}; // 相应node的uid对应component，用于在需要通过node找到component时使用
		self.__rendered = {}; // 后来被加入的，而不是首次通过selector选择的node的引用

		self._node = dom.wrap(node);

		self.__initOptions(options);
		self.__initEvents();
		self.__initSubs();
		self.__initAddons();
		self.init();
	};

	this.__initAddons = function(self) {
		if (!self.addons) return;
		self.addons.forEach(function(addon) {
			addon.get('init')(self);
		});
	};

	/**
	 * 加入addon中用onxxx方法定义的事件
	 */
	this.__initEvents = function(self) {
		if (!self.addons) return;
		self.addons.forEach(function(addon) {
			addon.prototype.__onEvents.forEach(function(eventType) {
				var trueEventType; // 正常大小写的名称
				if (self.__handles.some(function(handle) {
					if (handle.toLowerCase() == eventType) {
						trueEventType = handle;
						return true;
					}
					return false;
				})) {
					self.addEvent(trueEventType, function(event) {
						// 将event._args pass 到函数后面
						var args = [self, event].concat(event._args);
						addon.get('on' + eventType).apply(addon, args);
					});
				}
			});
		});
	};

	this.__initOptions = function(self, options) {
		if (!options) options = {};
		self._options = {};
		Object.keys(options).forEach(function(name) {
			// 浅拷贝
			// object在subcomponent初始化时同样进行浅拷贝
			self._options[name] = options[name];
		});

		self.__defaultOptions.forEach(function(name) {
			var sub = self.__properties__[name];
			// 从dom获取配置
			var defaultValue = sub.defaultValue;
			var value = sub.getter(self, name, defaultValue);

			if (value) {
				self.__setOption(name, value);
			// 从options参数获取配置
			} else if (options[name]) {
				self.__setOption(name, options[name]);
			// 默认配置
			} else {
				self.__setOption(name, defaultValue);
			}

			// 注册 option_change 等事件
			var bindEvents = function(events, cls) {
				if (events) {
					events.forEach(function(eventType) {
						var fakeEventType = '__option_' + eventType + '_' + name;
						var methodName = name + '_' + eventType;
						self.addEvent(fakeEventType, function(event) {
							// 注意这个self是调用了此addon的类的实例，而不是addon的实例，其__this__并不是addon的；
							// 必须通过cls调用addon上的方法，在相应方法中才能获取到正确的__this__；
							// if (cls) cls.prototype[methodName].call(self, event.value);
							// 上面这种调用方法由于获取的self.__this__，不正确。
							// 改成下面这种
							if (cls) cls.get(methodName).call(cls, self, event.value);
							// 调用自己的
							else self[methodName](event.value);
						});
					});
				}
			};

			bindEvents(self.__subEvents[name]);
			if (self.addons) {
				self.addons.forEach(function(addon) {
					bindEvents(addon.prototype.__subEvents[name], addon);
				});
			}

		});
	};

	this.__initSubs = function(self) {
		// TODO 这里修改了__properties__中的成员，导致如果某一个组件实例修改了类，后面的组件就都变化了。
		self.__subs.forEach(function(name) {
			var sub = self.__properties__[name];

			var options = self._options[name];
			// 从options获取子元素的扩展信息
			if (options && options.addons) {
				sub.type = new Class(sub.type, function() {
					options.addons.forEach(function(addon) {
						exports.addon(this, addon);
					}, this);
				});
			}

			self.__initSub(name, self.__querySub(name));
		});
	};

	/**
	 * 根据sub的定义获取component的引用
	 */
	this.__initSub = function(self, name, nodes) {
		if (!self._node) return null;

		var sub = self.__properties__[name];
		var comps;
		var options = self._options[name];

		if (sub.single) {
			if (nodes) {
				comps = new sub.type(nodes, options);
				self.__fillSub(name, comps);
			}
		} else {
			if (nodes) {
				comps = new exports.Components(nodes, sub.type, options);
				comps.forEach(function(comp) {
					self.__fillSub(name, comp);
				});
			} else {
				// 没有的也留下一个空的Components
				comps = new exports.Components([], sub.type);
			}
		}

		self['_' + name] = nodes;
		self._set(name, comps);

		return comps;
	};

	/**
	 * 将一个comp的信息注册到__subs上
	 */
	this.__fillSub = function(self, name, comp) {
		var sub = self.__properties__[name];
		var node = comp._node;
		self.__addNodeMap(name, String(node.uid), comp);
		comp = self.__nodeMap[name][String(node.uid)];

		// 注册 option_change 等事件
		var bindEvents = function(events, cls) {
			if (events) {
				events.forEach(function(eventType) {
					var methodName = name + '_' + eventType;
					node.addEvent(eventType, function(event) {
						// 调用addon上的
						// 注意这个self是调用了此addon的类的实例，而不是addon的实例，其__this__并不是addon的；
						// 必须通过cls调用addon上的方法，在相应方法中才能获取到正确的__this__；
						// if (cls) cls.prototype[methodName].apply(self, [event, comp].concat(event._args));
						// 上面这种调用方法由于获取的self.__this__，不正确。
						// 改成下面这种
						if (cls) cls.get(methodName).apply(cls, [self, event, comp].concat(event._args));
						// 调用自己的
						else self[methodName].apply(self, [event, comp].concat(event._args));
					});
				});
			}
		};

		bindEvents(self.__subEvents[name]);
		if (self.addons) {
			self.addons.forEach(function(addon) {
				bindEvents(addon.prototype.__subEvents[name], addon);
			});
		}
	};

	/**
	* 获取sub的节点
	*/
	this.__querySub = function(self, name) {
		var sub = self.__properties__[name];
		if (typeof sub.selector == 'function') {
			return sub.selector(self);
		} else {
			return sub.single? self._node.getElement(sub.selector) : self._node.getElements(sub.selector);
		}
	};

	this.__setOption = function(self, name, value) {
		var pname = '_' + name;
		self[pname] = value;
		self._set(name, value);
	};

	this.__addRendered = function(self, name, node) {
		var rendered = self.__rendered;
		if (!rendered[name]) rendered[name] = [];
		rendered[name].push(node);
	};

	this.__addNodeMap = function(self, name, id, comp) {
		var nodeMap = self.__nodeMap;
		if (!nodeMap[name]) nodeMap[name] = {};
		nodeMap[name][id] = comp;
	};

	this._init = function(self) {
	};

	/**
	 * 弹出验证错误信息
	 */
	this._invalid = function(self, msg) {
		if (!msg) msg = '输入错误';
		alert(msg);
	};

	/**
	 * 弹出出错信息
	 */
	this._error = function(self, msg) {
		if (!msg) msg = '出错啦！';
		alert(msg);
	};

	/**
	 * 重置一个component，回到初始状态，删除所有render的元素。
	 */
	this._revert = function(self, methodName) {
		if (!methodName) methodName = 'revert'; // 兼容reset方法名

		// 清空所有render进来的新元素
		self.__subs.forEach(function(name) {
			var sub = self.__properties__[name];
			var pname = '_' + name;
			if (self.__rendered[name]) {
				self.__rendered[name].forEach(function(node) {
					var comp = self.__nodeMap[name][node.uid];
					delete self.__nodeMap[name][node.uid];
					node.dispose();
					if (sub.single) {
						self[name] = self[pname] = null;
					} else {
						self[name].splice(self[name].indexOf(comp), 1); // 去掉
						self[pname].splice(self[pname].indexOf(node), 1); // 去掉
					}
				});
			}
			if (!sub.single) {
				self[name].forEach(function(comp) {
					comp[methodName]();
				});
			} else if (self[name]) {
				self[name][methodName]();
			}
		});
	};

	/**
	* @deprecated
	* 用revert代替
	* 由于form有reset方法，在reset调用时，会fire reset事件，导致意外的表单重置
	*/
	this._reset = function(self) {
		self._revert('reset');
	};

	this.getOption = function(self, name) {
		var pname = '_' + name;
		if (self[pname] === undefined) {
			self[pname] = self.__properties__[name].defaultValue;
		}
		return self[pname];
	};

	this.setOption = options.overloadsetter(function(self, name, value) {
		// 由于overloadsetter是通过name是否为string来判断传递形式是name-value还是{name:value}的
		// 在回调中为了性能需要直接传的parts，类型为数组，而不是字符串，因此无法通过回调用overloadsetter包装后的方法进行回调
		(function(self, name, value) {
			var parts = Array.isArray(name)? name : name.split('.');
			if (parts.length > 1) {
				exports.setOptionTo(self._options, parts, value);
				if (self[parts[0]]) {
					arguments.callee(self[parts[0]], parts.slice(1), value);
				}
			} else {
				self.__setOption(name, value);
				self.fireEvent('__option_change_' + name, {value: value});
			}
		})(self, name, value);
	});

	/**
	 * 渲染一组subcomponent
	 * @param name subcomponent名字
	 * @param data 模板数据/初始化参数
	 */
	this.render = function(self, name, data) {

		var sub = self.__properties__[name];
		var methodName = 'render' + string.capitalize(name);
		var method2Name = name + 'Render';
		var nodes;

		// 如果已经存在结构了，则不用再render了
		if (!!(sub.single? self[name] : self[name].length)) {
			return;
		}

		if (self[method2Name]) {
			nodes = self[method2Name](function() {
				return self.make(name, data);
			});
		} else if (self[methodName]) {
			nodes = self[methodName](data);
		} else {
			nodes = self.__querySub(name);
		}

		// 如果有返回结果，说明没有使用self.make，而是自己生成了需要的普通node元素，则对返回结果进行一次包装
		if (nodes) {
			if (sub.single) {
				if (Array.isArray(nodes) || nodes.constructor === dom.Elements) throw '这是一个唯一引用元素，请不要返回一个数组';
				self.__addRendered(name, nodes);
			} else {
				if (!Array.isArray(nodes) && nodes.constructor !== dom.Elements) throw '这是一个多引用元素，请返回一个数组';
				nodes = new dom.Elements(nodes);
				nodes.forEach(function(node) {
					self.__addRendered(name, node);
				});
			}

			self.__initSub(name, nodes);
		}
	};

	/**
	* 根据subs的type创建一个component，并加入到引用中，这一般是在renderXXX方法中进行调用
	* @param name
	* @param data 模板数据
	*/
	this.make = function(self, name, data) {
		var sub = self.__properties__[name];
		var pname = '_' + name;
		var options = {};
		var extendOptions = self._options[name];
		object.extend(options, extendOptions);

		if (data) {
			Object.keys(data).forEach(function(key) {
				options[key] = data[key];
			});
		}

		var comp = new sub.type({
			template: options.template || sub.template,
			section: options.templateSection || sub.section
		}, options);
		var node = comp._node;

		if (sub.single) {
			self[name] = comp;
			self[pname] = node;
		} else {
			self[name].push(comp);
			self[pname].push(node);
		}
		self.__fillSub(name, comp);
		self.__addRendered(name, node);

		return comp;
	};

	/**
	 * 设置subcomponent的template
	 */
	this.setTemplate = function(self, name, template, section) {
		if (!self._options[name]) self._options[name] = {};
		var options = self._options[name];
		options.template = template;
		options.templateSection = section;
	};

	/**
	 * 获取包装的节点
	 */
	this.getNode = function(self) {
		return self._node;
	};

	this.define = staticmethod(exports.define);
	this.define1 = staticmethod(exports.define1);

});

this.addon = function(dict, Addon) {
	if (!dict.addons) {
		dict.addons = [];
	}
	dict.addons.push(Addon);
};

/**
 * {'a.b.c': 1, b: 2} ==> {a: {b: {c:1}}, b: 2}
 */
this.parseOptions = function(options) {
	var parsed = {};
	Object.keys(options).forEach(function(name) {
		exports.setOptionTo(parsed, name, options[name]);
	});
	return parsed;
};

this.setOptionTo = function(current, name, value) {
	var parts = Array.isArray(name)? name : name.split('.');
	// 生成前缀对象
	for (var i = 0, part; i < parts.length - 1; i++) {
		part = parts[i];
		if (current[part] === undefined) {
			current[part] = {};
		}
		current = current[part];
	}
	current[parts[parts.length - 1]] = value;
};

});
/**
 * @namespace
 * @name ui.decorators
 */
object.add('ui.decorators', 'events', /**@lends ui.decorators*/ function(exports, events) {

	/**
	 * use events.fireevent instead
	 */
	this.fireevent = events.fireevent;

});
/**
 * @namespace
 * @name urlparser
 */
object.add('urlparse', /**@lends urlparser*/ function() {

this.urljoin = function(base, url) {
	var baseparts = urlparse(base);
	var urlparts = urlparse(url);
	var output = [];

	if (urlparts[0]) {
		return url;
	} else {
		output[0] = baseparts[0];
		output[1] = baseparts[1];
	}

	if (urlparts[2]) {
		if (urlparts[2][0] == '/') {
			output[2] = urlparts[2];
		} else {
			path = baseparts[2];
			output[2] = path.substring(0, path.lastIndexOf('/') + 1) + urlparts[2];
		}
	} else {
		return base;
	}

	return urlunparse(output);
};

var urlparse = this.urlparse = function(url) {
	return url.match(/^(?:(\w+?)\:\/\/([\w-_.]+(?::\d+)?))?(.*?)?(?:;(.*?))?(?:\?(.*?))?(?:\#(\w*))?$/i).slice(1);
};

var urlunparse = this.urlunparse = function(parts) {
	var url = '';
	if (parts[0]) url += parts[0] + '://' + parts[1];
	url += parts[2];
	if (parts[3]) url += ';' + parts[3];
	if (parts[4]) url += '?' + parts[4];
	if (parts[5]) url += '#' + parts[5];

	return url;
};

});

/**
 * @namespace
 * @name validator
 */
object.add('validator', /**@lends validator*/ function(exports) {

this.isUrl = function(text) {
	return /^(?:(\w+?)\:\/\/([\w-_.]+(?::\d+)?))(.*?)?(?:;(.*?))?(?:\?(.*?))?(?:\#(\w*))?$/i.test(text);
};

this.isEmail = function(text) {
	return /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/i.test(text);
};

this.isIP = function(text) {
	return /^(0|[1-9]\d?|[0-1]\d{2}|2[0-4]\d|25[0-5]).(0|[1-9]\d?|[0-1]\d{2}|2[0-4]\d|25[0-5]).(0|[1-9]\d?|[0-1]\d{2}|2[0-4]\d|25[0-5]).(0|[1-9]\d?|[0-1]\d{2}|2[0-4]\d|25[0-5])$/.i.test(text);
}

});
/**
 * @namespace
 * @name ua.extra
 */
object.add('ua.extra', 'sys', function(exports, sys) {

var uamodule = sys.modules['ua'];

if (uamodule) {

	/* Copy start here */

	var ua = navigator.userAgent,
		m, shell,
		o = {},
		numberify = uamodule.numberify;

	/**
	 * 说明：
	 * @子涯总结的各国产浏览器的判断依据: http://spreadsheets0.google.com/ccc?key=tluod2VGe60_ceDrAaMrfMw&hl=zh_CN#gid=0
	 * 根据 CNZZ 2009 年度浏览器占用率报告，优化了判断顺序：http://www.tanmi360.com/post/230.htm
	 * 如果检测出浏览器，但是具体版本号未知用 0 作为标识
	 * 世界之窗 & 360 浏览器，在 3.x 以下的版本都无法通过 UA 或者特性检测进行判断，所以目前只要检测到 UA 关键字就认为起版本号为 3
	 */

	// 360Browser
	
	var getExternal = function(key){
		try{
			return window.external[key];
		}catch(e){
			return null;
		}
	}; 

	if (m = ua.match(/360SE/) || (getExternal('twGetRunPath') && window.external.twGetRunPath().indexOf('360se.exe') != -1)) {
		o[shell = 'se360'] = 3; // issue: 360Browser 2.x cannot be recognised, so if recognised default set verstion number to 3
	// Maxthon
	} else if (m = ua.match(/Maxthon/) || getExternal('max_version')) {
		// issue: Maxthon 3.x in IE-Core cannot be recognised and it doesn't have exact version number
		// but other maxthon versions all have exact version number
		shell = 'maxthon';
		try {
			o[shell] = numberify(window.external['max_version']);
		} catch(ex) {
			o[shell] = 0;
		}
	// TT
	} else if (m = ua.match(/TencentTraveler\s([\d.]*)/)) {
		o[shell = 'tt'] = m[1] ? numberify(m[1]) : 0;
	// TheWorld
	// 无法识别世界之窗极速版
	} else if (m = ua.match(/TheWorld/)) {
		o[shell = 'theworld'] = 3; // issue: TheWorld 2.x cannot be recognised, so if recognised default set verstion number to 3
	// Sogou
	} else if (m = ua.match(/SE\s([\d.]*)/)) {
		o[shell = 'sogou'] = m[1] ? numberify(m[1]) : 0;
	// QQBrowser
	} else if (m = ua.match(/QQBrowser.([\d.]*)/)) {
		o[shell = 'qqbrowser'] = m[1] ? numberify(m[1]) : 0;
	}


	// If the browser has shell(no matter IE-core or Webkit-core or others), set the shell key
	shell && (o.shell = shell);

	/* Copy end here */

	object.extend(uamodule.ua, o);
}

});
/**
 * @namespace
 * @name ua.os
 */
object.add('ua.os', 'sys', function(exports, sys) {

var uamodule = sys.modules['ua'];

//由于需要先替换下划线，与ua模块中的numberify不同，因此这里再定义此方法
var numberify = function(s) {
	var c = 0;
	// convert '1.2.3.4' to 1.234
	return parseFloat(s.replace(/_/g, '.').replace(/\./g, function() {
		return (c++ === 0) ? '.' : '';
	}));
};

if (uamodule) {
	//将detectOS方法导出，便于单元测试
	this._detectOS = detectOS;
	var o = detectOS(navigator.userAgent.toLowerCase());
	object.extend(uamodule.ua, o);
}

//判断对象obj是否是type类型
function is(obj, type) {
	type = type.replace(/\b[a-z]/g, function(match){
		return match.toUpperCase();
	});
	return Object.prototype.toString.call(obj) == '[object ' + type + ']';
}

//断言，如果bool不是true，则抛出异常消息msg
function assertTrue(bool, msg) {
	if(!bool) {
		throw new Error(msg);
	}
}

//断言，确保传入的obj不是空，如果为空，则抛出异常消息msg
function assertNotNull(obj, msg) {
	if(obj == null) {
		throw new Error(msg);
	}
}

//传入ua，便于模拟ua字符串进行单元测试
//
//http://forums.precentral.net/palm-pre-pre-plus/277613-webos-2-1-user-agent.html
//what is the relationship between webos and palmos????
//http://www.developer.nokia.com/Community/Wiki/User-Agent_headers_for_Nokia_devices
//how to handle the NokiaXXXX?
function detectOS(ua) {
	ua = ua || navigator.userAgent;
	ua = ua.toLowerCase();
	
	/**
	 * 所有的操作系统检测的配置项
	 *	{
	 *		core: 操作系统内核
	 *		match: 操作系统内核匹配，可以是正则表达式，也可以是function，function参数是userAgent字符串，返回值是true/false
	 *		versionRule：获取操作系统版本的正则表达式
	 *		version: 指定的操作系统版本值
	 *	} 
	 */
	var osDetecters = [
	{core: 'windowsnt',		match: function(ua) {
								return /windows\snt/.test(ua) && !/xblwp7/.test(ua);
							},						versionRule: /windows nt\s([\.\d]*)/},
	{core: 'windowsnt',		match: /windows\sxp/,	version: 5.1},
	{core: 'windowsnt', 	match: /windows\s2000/, version: 5.0},
	{core: 'windowsnt', 	match: /winnt/,			version: 4.0},
	{core: 'windows',		match: /windows me/,	version: 'me'},
	{core: 'windows',		match: /windows 98|win98/,version: '98'},
	{core: 'windows',		match: /windows 95|win95/,version: '95'},
	{core: 'windows',		match: /win16/,			version: '3.1'},
	{core: 'windows/phone',	match: /windows\sphone/,versionRule: /windows phone os ([\d\.]*)/},
	{core: 'windows/phone',	match: /xblwp7/,		version: 7.0},
	{core: 'windows/mobile',match: /windows mobile|wce|windows ce|pocket pc|wince/,	
													versionRule: /iemobile ([\.\d]*)/},
	{core: 'windows',		match: /win/,			version: 'unknown'},
	
	{core: 'android', 		match: /\sandroid/,		versionRule:/android ([^\s]*);/},

	{core: 'linux/debian',	match: /debian/, 		versionRule: /debian[\s\/-]([\.\d]*)/},
	{core: 'linux/redhat',	match: /red\shat/, 		versionRule: /red hat[\s\/-]([\.\d]*)/},
	{core: 'linux/fedora',	match: /fedora/, 		versionRule: /fedora[\s\/-]([\.\d]*)/},
	{core: 'linux/ubuntu',	match: /ubuntu/, 		versionRule: /ubuntu[\s\/-]([\.\d]*)/},
	{core: 'linux/suse',	match: /suse/, 			versionRule: /suse[\s\/-]([\.\d]*)/},
	{core: 'linux/mint',	match: /mint/, 			versionRule: /mint[\s\/-]([\.\d]*)/},
	{core: 'linux/centos',	match: /centos/, 		versionRule: /centos[\s\/-]([\.\d]*)/},
	{core: 'linux/gentoo',	match: /gentoo/, 		version: 'unknown'},
	{core: 'linux',			match: /linux/,			version: 'unknown'},

	{core: 'chromeos' ,		match: /cros/,  		version: 'unknown'},

	{core: 'unix/sunos' ,	match: /sunos/,  		version: 'unknown'},
	{core: 'unix/freebsd',	match: /freebsd/,  		version: 'unknown'},
	{core: 'unix/openbsd',	match: /openbsd/,  		version: 'unknown'},
	{core: 'unix/aix' ,		match: /aix/,  			version: 'unknown'},
	{core: 'unix/hp_ux' ,	match: /hp-ux/,  		version: 'unknown'},
	{core: 'unix',			match: /x11/,			version: 'unknown'},
	
	{core: 'macos' ,		match:/mac_powerpc|ppc/,version: 'ppc'},
	{core: 'macos' ,		match: /intel/,  		version: 'intel'},
	{core: 'macos' ,		match: /mac_68000|68k/, version: '68k'},
	{core: 'ios',			match: function(ua) {
		   						return /applewebkit/.test(ua) && / mobile\//.test(ua) && /like/.test(ua);
	   						},						versionRule: /os ([\_\.\d]*)/},
	{core: 'macos' ,		match: /mac/,  			version: 'unknown'},
	
	{core: 'os2' ,			match: function(ua) {
								return /os\/2|ibm-webexplorer/.test(ua) || navigator.appVersion.indexOf("os/2") != -1;
							},						version: 'unknown'},
	{core: 'symbian',		match: /symbian|s60|symbos|symbianos|series40|series60|nokian/,
													versionRule: /symbian(?:os)?\/([\d\.]*);/},
	{core: 'blackberry',	match: /blackberry|rim\stablet\sos/, 					
													versionRule: /(?:version\/|blackberry[\d]{4}\/)([\d\.]*)/},
	{core: 'webos', 		match: /webos/,			versionRule:/webos\/([^\s]*);/},
	{core: 'palmos',		match: /palmos/,		version: 'unknown'}
	];

	var o = {};

	//操作系统检测主逻辑
	for(var i=0, l=osDetecters.length, current, matchFlag = false; i<l; i++) {
		current = osDetecters[i];
		var match = current.match;
		//确保match是正则表达式或者是function
		assertTrue(is(match, 'RegExp') || is(match, 'Function'), 'match rule should be regexp or function');
		if(is(match, 'RegExp')) {
			//如果是正则表达式，则查看是否匹配
			matchFlag = match.test(ua);
		}else if(is(match, 'Function')) {
			//如果是方法，则执行，并传入ua作为参数
			matchFlag = match(ua);
			assertNotNull(matchFlag, 'match function must return true/false');
		} 
		//如果不匹配，则继续循环
		if(!matchFlag) {
			continue;
		}
		//执行到这里，说明已经匹配了
		var parent=null, packages=current.core.split('\/'), pLength=packages.length;
		if(pLength > 1) {
			//说明有子类型，比如windows/phone
			o.oscore = packages[0];
			parent = o;
			//构造子类型对象链
			for(var m=0; m<pLength - 1; m++) {				
				parent = parent[packages[m]] = {};
			}
		} else {
			o.oscore = current.core;
		}
		//获取版本信息
		var version = current.version || 'unknown';
		//如果有版本获取规则，则执行此规则，规则中必须取出版本号
		if(current.versionRule) {
			assertTrue(is(current.versionRule, 'RegExp'), 'version rule should be regexp');
			m = ua.match(current.versionRule);
			if(m && m[1]) version = numberify(m[1]);
		}
		//将版本信息放入返回的对象中
		if(parent) {
			parent[packages[pLength - 1]] = version;
		} else {
			o[o.oscore] = version;
		}
		break;
	}
	
	//如果是ios，继续判断移动设备
	if(o.ios) {
		m = ua.match(/ipad|ipod|iphone/);
		if (m && m[0]) {
			o[m[0]] = o.ios;
		}
	}
	//判断 Google Caja, from YUI-client
	if(navigator && navigator.cajaVersion) {
		o.caja = navigator.cajaVersion;
	}

	if(!matchFlag) {
		o.oscore = 'unknown';
	}

	//wow64  : Windows-On-Windows 64-bit
	//x64    : 64-bit windows version
	//win64  : Win32 for 64-Bit-Windows
	//ia64   : I-tanium 64-bit processor from Intel
	//sparc64: 64-bit Sun UltraSPARC processor
	//ppc64  : 64-bit PowerPC microprocessor
	//x86_64 : 64-bit Intel processor
	if (/wow64|x64|win64|ia64|x86_64|amd64|sparc64|ppc64/.test(ua)){
		o.processor = 64;
	} else {
		o.processor = 32;
	}
	
	//检测分辨率（devicePixelRatio说明是高密度的显示屏，如iphone）
	//http://developer.android.com/guide/webapps/targeting.html
	if(window.devicePixelRatio >= 2) {
		o.resolution = {
			width : screen.width  * window.devicePixelRatio,
			height: screen.height * window.devicePixelRatio
		};
	} else {
		o.resolution = {
			width: screen.width,
			height: screen.height
		}
	}

	//检测屏幕方向，首先确保支持屏幕方向
	var isMobile = typeof window.orientation != 'undefined' ? true : false;
	if(isMobile) {
		//通过屏幕的高度和宽度的值大小，来判断是横向还是纵向
		o.orientation = window.innerWidth > window.innerHeight ? 'profile' : 'landscape';
	} else {
		o.orientation = 'unknown';
	}

	return o;
}
});

object.add('ua.flashdetect', function(exports) {

/**
* getFlashVersionv Flash Player version detection http://stauren.net
* released under the MIT License:
* http://www.opensource.org/licenses/mit-license.php
*
*/
this.getFlashVersion = function(){
	var _ver = false;
	if(navigator.plugins&&navigator.mimeTypes.length){
		var x=navigator.plugins["Shockwave Flash"];
		if(x&&x.description){
			_ver=x.description.replace(/([a-zA-Z]|\s)+/,"").replace(/(\s+r|\s+b[0-9]+)/,".").split(".")[0];
		}
	} else {
		if(navigator.userAgent&&navigator.userAgent.indexOf("Windows CE")>=0) {
			var axo=1;
			var _tempVer=3;
			while(axo) {
				try{
					_tempVer++;
					axo=new ActiveXObject("ShockwaveFlash.ShockwaveFlash."+_tempVer);
					_ver=_tempVer;
				} catch(e) {
					axo=null;
				}
			}
		} else {
			try {
				var axo=new ActiveXObject("ShockwaveFlash.ShockwaveFlash.7");
			} catch(e) {
				try {
					var axo=new ActiveXObject("ShockwaveFlash.ShockwaveFlash.6");
					_ver=6;
					axo.AllowScriptAccess="always";
				} catch(e) {
					if(_ver==6){
						return _ver;
					}
				}
				try {
					axo=new ActiveXObject("ShockwaveFlash.ShockwaveFlash");
				} catch(e) {}
			}
			if(axo!=null) {
				_ver= axo.GetVariable("$version").split(" ")[1].split(",")[0];
			}
		}
	}
	return _ver;
}

});
/**
 * @namespace XN
 * @property DEBUG_MODE
 * @type {Boolean}
 */
object.add('XN', 'dom, ua', function(exports, dom, ua) {

	this.DEBUG_MODE = false;
	
	//为了避免对env模块的依赖，这里定义变量保存env.staticRoot的值
	var _staticRoot = 'http://s.xnimg.cn/';

	/**
	 *  log message if the browser has console object
	 * @method log
	 * @param {Any} s
	 */

	/**
	 * @class debug
	 * @static
	 */
	this.debug = {
	
		/**
		 * log message if the browser has console object
		 * @method log
		 * @param {Any} s
		 */
		log : function(){},
		
		/**
		 * debug mode on
		 * @method on
		 */
		on : function() {
			exports.DEBUG_MODE = true;
			if ( window.console && console.log )
			{
				exports.debug.log = function( s )
				{
					console.log( s );
				}
			}
		},
		
		/**
		 * debug mode off
		 * @method off
		 */
		off : function() {
			exports.debug.log = function(){};
		}
	};

	/**
	 * based on YAHOO.namespace
	 * @namespace XN
	 * @method namespace
	 * @param  {String*} arguments 1-n namespaces to create 
	 * @return {Object}  A reference to the last namespace object created
	 */
	this.namespace = function() {
		var a = arguments, o = null, i, j, d;
		for (i = 0 ; i < a.length ; i++) {
			d = a[i].split('.');
			o = exports;

			for (j = (d[0] == 'XN') ? 1 : 0; j < d.length; j++) {
				o[d[j]] = o[d[j]] || {};
				o = o[d[j]];
			}
		}
		return o;		
	};
	
	this.log = function( s ) {
		exports.debug.log( s );
	}
	
	/**
	 * @method isUndefined
	 * @param {Any} object
	 * @return {Boolean}
	 */
	this.isUndefined = function (object) {
		return typeof object == 'undefined';
	}

	/**
	 * @method isString
	 * @param {Any} object
	 * @return {Boolean}
	 */
	this.isString = function (object) {
		return typeof object == 'string';
	}

	/**
	 * @method isElement
	 * @param {Any} object
	 * @return {Boolean}
	 */
	this.isElement = function (object) {
		return object && object.nodeType == 1;
	}

	/**
	 * @method isFunction
	 * @param {Any} object
	 * @return {Boolean}
	 */
	this.isFunction = function (object) {
		return typeof object == 'function';
	}

	/**
	 * @method isObject
	 * @param {Any} object
	 * @return {Boolean}
	 */
	this.isObject = function (object) {
		return typeof object == 'object';
	}

	/**
	 * @method isArray
	 * @param {Any} object
	 * @return {Boolean}
	 */
	this.isArray = function (object) {
		return Object.prototype.toString.call(object) === '[object Array]';
	}

	/**
	 * @method isNumber
	 * @param {Any} object
	 * @return {Boolean}
	 */
	this.isNumber = function (object) {
		return typeof object == 'number';
	}

	/**
	 * modify by shuangbao.li at 2010.4.26
	 * extend an object
	 * @method $extend
	 * @param {Object} object the object for extend
	 */
	this.$extend = function () {
		var result = arguments[0];
		for(var i=1; i<arguments.length; i++) {
			if(typeof arguments[i] == 'object') {
				for(var key in arguments[i])
					result[key] = arguments[i][key];
			}
		}
		return result;
	}

	/*
	 * patch for old version
	 */
	this.namespace('config');
	this.config.jumpOut = true;

	(function() {
		var files = {};
		var version = {};

		exports.getFileVersionNum = function(file){
			return version[file]; 
		}
		
		function hasLoad( file ){
			//return false; // 避免出现不能第二次加载同一个文件
			return !!getFile( file );
		}

		function getFile( file ){
			return files[ encodeURIComponent( file ) ];
		}
		
		function mark( file ){
			var obj = {};
			obj.file = file;
			obj.isLoad = true;
			obj.isLoaded = true;
			files[ encodeURIComponent( file ) ] = obj;
		}

		// 为了避免依赖event模块，这里重新实现了event.enableCustomEvent方法
		function enableCustomEvent( target ) {
			target.addEvent = function(type, func) {
				if(!this._customEventListeners) {
					this._customEventListeners = {};
				}
				var funcs = this._customEventListeners;
				if(exports.isUndefined(funcs[type])) {
					funcs[type] = [];
				}
				funcs[type].push(func);
				return this;
			},
			target.delEvent = function(type, func) {
				var funcs = this._customEventListeners[type];
				if (funcs) {
					for(var i = funcs.length - 1; i >= 0; i--) {
						if(funcs[i] == func) {
							funcs[i] = null;
							break;
						}
					}
				}
				return this;
			},
			target.fireEvent = function(type) {
				if(!this._customEventListeners || !this._customEventListeners[type]) {
					return;
				}
				var funcs = this._customEventListeners[type], ars = buildArray(arguments);
				ars.shift();
				for(var i = 0, j = funcs.length; i < j; i++) {
					if(funcs[i]) {
						try { 
                            funcs[i].apply(this, ars);
                        } catch(ox) {
                            if (exports.DEBUG_MODE) {
								throw ox;
							}
                        }
						
					}
				}
			}
		}

		// 为了避免对array模块的依赖，这里重新实现了array.build方法
		function buildArray(o) {
			var rt = [];
			for (var i = 0, j = o.length; i < j; i++) {
				rt.push(o[i]);
			}
			return rt;
		}

		function addFile( file ){
			var obj = {};
			obj.file = file;
			obj.isLoaded = false;
			enableCustomEvent( obj );
			
			obj.addEvent( 'load' , function(){
				this.isLoaded = true;
			});

			files[ encodeURIComponent( file ) ] = obj;

			var el = document.createElement('script');
			el.type="text/javascript";
			el.src = file;
			el.async = true;
			obj.element = el;
			
			if (ua.ua.shell == 'ieshell') {
				el.onreadystatechange = function() {
					if ( ( this.readyState == 'loaded' || this.readyState == 'complete' ) && !this.hasLoad ){
						this.hasLoad = true;
						var _file = getFile(file);
						if (_file != null) {
							_file.fireEvent('load');
						} else {
							try {
								exports.loadFile(file);
							} catch(e) {}
						}
					}
				}
			} else {
				el.onerror = el.onload = function() {
					var tmp = getFile( file );
					if (tmp) tmp.fireEvent( 'load' );
					// 之前的写法是 getFile(file).fireEvent('load')
					// 由于在快速切换的时候，会出现js未加载完毕，元素就被干掉了的情况
					// 因此在这里判断一下
				};
			}

			Sizzle('head')[0].insertBefore(el, null);
		}

		function loadFile( file , callBack , disCache) {
			var isJS = false, isCSS = false;

			if ( exports.isObject(file) ) {
				isJS = ( file.type == 'js' );
				isCSS = ( file.type == 'css' );
				file = file.file;
			}

			file = getFullName( file );
			
			if ( /\.js(\?|$)/.test( file ) || isJS ) {
					
				if ( disCache || !hasLoad( file ) ) {
					addFile( file );
				}
				
				if ( !callBack ) return;
				if ( getFile( file ).isLoaded ) {
					callBack.call( getFile( file ), true );
				} else {
					getFile( file ).addEvent( 'load' , function() {callBack(true)} );
					getFile( file ).addEvent( 'error' , function() {callBack(false)} );
				}
			} else if ( /\.css(\?|$)/.test( file ) || isCSS ) {
				if ( !disCache && hasLoad( file ) ) {
					if ( callBack ) callBack.call( getFile( file ) );
					return;
				}
				mark( file );
				var el = document.createElement( 'link' );
				el.rel = 'stylesheet';
				el.type = 'text/css';
				el.href = file;
				
				Sizzle('head')[0].insertBefore(el, null);
				if ( callBack ) callBack.call( getFile( file ) );
			}
		}
		
		function getFullName( file ) {
			runOnce( loadVersion );
			if ( !version[ file ] ) return file;
			return version[ file ].file;
		}

		//存储两个正则表达式，避免在每次调用getVersion时都重新定义
		var regWithA = new RegExp( '(' + _staticRoot + ')' + '(a?\\d+)/([^\?]*)' );
		var regWithVer = new RegExp( '(.*)\\?ver=(\d+)(\..*)' );

		function getVersion( file ) {
			var match;
			if ( match = regWithA.exec( file ) ) {
				version[ match[ 1 ] + match[ 3 ] ] = {
					file : file,
					version : match[ 2 ]
				};
			} else if ( match = regWithVer.exec( file ) ) {
				version[ match[ 1 ] ] = {
					file : file,
					version : match[ 2 ]
				};
			}
		}
		
		exports.getFileVersion = function( files ) {
			files.forEach(function( v , i ) {
				getVersion( v );
			});
		};

		exports.loadFile = function( file , callBack , disCache ){
			dom.ready(function() {
				loadFile( file , callBack , disCache );	
			});
		};

		exports.unloadFile = function(node) {
			if (node.parentNode) {
				node.parentNode.removeChild(node);
				files[ encodeURIComponent( node.src ) ] = null;
			}
		}

		exports.clearFiles = function() {
			for (var i in files) if (files.hasOwnProperty(i)) {
				if (files[i] && files[i].element) exports.unloadFile(files[i].element);
			}
		}
		
		exports.loadFiles = function( files , callBack ) {
			var f = files.length;
			
			function isAllLoad() {
				f --;
				if ( f === 0 && callBack ) callBack();
			}

			files.forEach(function( v , i ) {
				exports.loadFile( v , isAllLoad );
			});
		};

		exports.getVersion = function( file ) {
			getVersion( file );
		}

		function loadVersion() {

			buildArray(document.getElementsByTagName( 'script' )).forEach(function( v , i ) {
				if ( v.src ) {
					mark( v.src );
					getVersion( v.src );
				}

				if ( v.getAttribute( 'vsrc' ) ) {
					getVersion( v.getAttribute( 'vsrc' ) );
				}
			} );

			buildArray(document.getElementsByTagName( 'link' )).forEach(function( v , i ) {
				if ( v.rel && v.rel == 'stylesheet' ) {
					mark( v.href );
					getVersion( v.href );
				}

				if ( v.getAttribute( 'vhref' ) ) getVersion( v.getAttribute( 'vhref' ) );
			} );

			exports.log( 'load file version:' );
			exports.log( version );
		}

		exports.dynamicLoad = function( file ) {
			 file.funcs.forEach(function( func , i ) {
				window[ func ] = function() {
					var ars = arguments;
					
					window[ func ] = null;
					if ( file.file ) {
						file.files = [ file.file ];
					}

					exports.loadFiles( file.files , function() {
						window[ func ].apply( null , ars );
						if ( file.callBack ) file.callBack.call( null );
					});
				};    
			});
		};

		exports.namespace( 'img' );
		exports.img.getVersion = function( file ) {
			runOnce( loadVersion );
			if ( !version[ file ] ) return '';
			return version[ file ].version;
		};

		exports.img.getFullName = function( file ) {
			return getFullName( file );
		};

		// 为了避免对func模块的依赖，这里重新实现了func.runOnce方法
		function runOnce(func) {
			if(window.runOnceFunc == null) {
				window.runOnceFunc = {};
			}
			if(window.runOnceFunc[func]) {
				return null;
			}
			window.runOnceFunc[func] = true;
			return func();
		}
	})();
});

/**
 * @namespace XN
 * @class array
 * @static
 */
object.add('XN.array', 'XN', function(exports, XN) {

	/**
	 * build query string from array
	 * @method toQueryString
	 * @param {Array | hash} a
	 * @return {String}
	 */
	this.toQueryString = function(a, key) {
		var rt = [], t;
		for (var k in a) {
			t = a[k];
			if (XN.isFunction(t)) continue;
			if (XN.isObject(t)) {
				rt.push(arguments.callee(t, k));
			} else {
				if (/^\d+$/.test(k)) {
					rt.push((key || k) + '=' + encodeURIComponent(t));
				} else {
					rt.push(k + '=' + encodeURIComponent(t));
				}	
			}
		}
		return rt.join('&');
	}
	
	/**
	 * Iterates over the array
	 * the callBack function will receive index and value as the parameters
	 * @method each
	 * @param {Array} a
	 * @param {Function} func callBack function
	 */
	this.each = function(a, func) {
        if (!a) return;

		if (!XN.isUndefined(a.length) || !XN.isUndefined(a[0])) {
			for (var i = 0, j = a.length; i < j; i++) {
				if (func.call(a, i, a[i]) === false) break;
			}
		} else {
			for (var key in a) {
				if(!XN.isFunction(a[key])) {
					if (func.call(a, key, a[key]) === false) break;
				}
			}
		}
	}
	
	/**
	 * check if an array has item equal the value param
	 * @method include
	 * @param {Array} a
	 * @param {Any} value
	 * @return {Boolean}
	 */
	this.include = function(a, value) {
		var r = false;
		
		exports.each(a, function(i, v) {
			if (v === value) {
				r = true;
				return false;
			}
		});
		
		return r;
	}
	
	/**
	 * build array from an object like arguments
	 * @method build
	 * @param {Object} obj
	 * @return {Array}
	 */
	this.build = function(o) {
		var rt = [];
		for (var i = 0, j = o.length; i < j; i++) {
			rt.push(o[i]);
		}
		return rt;
	}
});
/**
 * @namespace XN
 * @class func
 * @static
 */
object.add('XN.func', function(exports) {

	if(window.runOnceFunc == null) {
		window.runOnceFunc = {};
	}
	
	/**
	 * refer to an empty function
	 * @property empty
	 * @type {Function}
	 */
	this.empty = function(){};
	
	/**
	 * run a function only once
	 * @method runOnce
	 * @param {Function} func
	 * @return {Any} the result the func return
	 */
	this.runOnce = function(func) {
		if(window.runOnceFunc[func]) {
			return null;
		}
		window.runOnceFunc[func] = true;
		return func();
	}
});

/**
 * @namespace XN
 * @class string
 * @static
 */
object.add('XN.string', 'XN', function(exports, XN) {
	
	/**
	 * replace '\n' with '<br />'
	 * @method nl2br
	 * @param {String} str
	 * @return {String}
	 */
	this.nl2br = function(str) {
		return (str || '').replace(/([^>])\n/g, '$1<br />');
	};
	
	/**
	 * trim whitespace
	 * @method trim
	 * @param {String} str
	 * @return {String}
	 */
	this.trim = function(str) {
		return (str || '').replace(/^\s+|\s+$/g, '');
	};
	
	/**
	 * trim whitespace leftside
	 * @method ltrim
	 * @param {String} str
	 * @return {String}
	 */
	this.ltrim = function(str) {
		return (str || '').replace(/^\s+/, '');
	};

	/**
	 * trim whitespace rightside
	 * @method rtrim
	 * @param {String} str
	 * @return {String}
	 */
	this.rtrim = function(str) {
		return (str || '').replace(/\s+$/, '');
	};
	
	this.strip = function(str) {
    	return exports.trim(str);
	};
	
	/**
	 * remove tag like '<...>'
	 * @method stripTags
	 * @param {String} str
	 * @return {String}
	 */
	this.stripTags = function(str) {
		return str.replace(/<\/?[^>]+>/igm, '');
	};
	
	/**
	 * replace char like '<','>' to '&lt;'...
	 * @method escapeHTML
	 * @param {String} str
	 * @return {String}
	 */
	this.escapeHTML = function(str) {
		return str.replace(/&/g ,'&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;');
	};
	
	/**
	 * replace '&lt;'... to '<'...
	 * @method unescapeHTML
	 * @param {String} str
	 * @return {String}
	 */
	this.unescapeHTML = function(str) {
		return str.replace(/&lt;/g ,'<')
		.replace(/&gt;/g, '>')
		.replace(/&nbsp;/g ,' ')
		.replace(/&quot;/g, '"')
		.replace(/&amp;/g, '&');
	};
	
	/**
	 * if str include the keyword will return true 
	 * @method include
	 * @param {String} str
	 * @param {String} key the keyword
	 * @return {Boolean}
	 */
	this.include = function(str, key) {
		return str.indexOf(key) > -1;
	};

	/**
	 * wether str starts with the keyword
	 * @method startsWith
	 * @param {String} str
	 * @param {String} key the keyword
	 * @return {Boolean}
	 */
	this.startsWith = function(str, key) {
		return str.indexOf(key) === 0;
	};

	/**
	 * wether str ends with the keyword
	 * @method endsWith
	 * @param {String} str
	 * @param {String} key the keyword
	 * @return {Boolean}
	 */
	this.endsWith = function(str, key) {
	    var d = str.length - key.length;
	    return d >= 0 && str.lastIndexOf(key) === d;	
	};
	
	/**
	 * check if the string is 'blank',meaning either empty or containing only whitespace
	 * @method isBlank
	 * @param {String} str
	 * @return {Boolean}
	 */
	this.isBlank = function(str) {
		return /^\s*$/.test(str);
	};
	
	/**
	 * wether a string is an email address
	 * @method isEmail
	 * @param {String} str
	 * @return {Boolean}
	 */
	this.isEmail = function(str) {
		return /^[A-Z_a-z0-9-\.]+@([A-Z_a-z0-9-]+\.)+[a-z0-9A-Z]{2,4}$/.test(str);
	};
	
	/**
	 * wether a string is mobile phone number
	 * @method isMobile
	 * @param {String} str
	 * @return {Boolean}
	 */
	this.isMobile = function(str) {
        return /^((\(\d{2,3}\))|(\d{3}\-))?((1[345]\d{9})|(18\d{9}))$/.test(str);
	};
	
	/**
	 * @method isUrl
	 * @param {String} str
	 * @return {Boolean}
	 */	
	this.isUrl = function(str) {
		return /^(http:|ftp:)\/\/[A-Za-z0-9]+\.[A-Za-z0-9]+[\/=\?%\-&_~`@[\]\':+!]*([^<>\"])*$/.test(str);
	};
	
	/**
	 * @method isIp
	 * @param {String} str
	 * @return {Boolean}
	 */
	this.isIp = function(str) {
		return /^(0|[1-9]\d?|[0-1]\d{2}|2[0-4]\d|25[0-5]).(0|[1-9]\d?|[0-1]\d{2}|2[0-4]\d|25[0-5]).(0|[1-9]\d?|[0-1]\d{2}|2[0-4]\d|25[0-5]).(0|[1-9]\d?|[0-1]\d{2}|2[0-4]\d|25[0-5])$/.test(str);
	};
	
	/**
	 * @method XN.isNumber
	 * @param {String} str
	 * @return {Boolean}
	 */
	this.isNumber = function(str) {
		return /^\d+$/.test(str);
	};

	/**
	 * @method isZip
	 * @param {String} str
	 * @return {Boolean}
	 */
	this.isZip = function(str) {
		return /^[1-9]\d{5}$/.test(str);
	};
	
	/**
	 * @method isEN
	 * @param {String} str
	 * @return {Boolean}
	 */
	this.isEN = function(str) {
		return /^[A-Za-z]+$/.test(str);
	};

	/**
	 * @method isJSON
	 * @param {String} str
	 * @return {Boolean}
	 */
	this.isJSON = function(str) {
		if (!XN.isString(str) || str === '') {
			return false;
		}
		str = str.replace(/\\./g, '@').replace(/"[^"\\\n\r]*"/g, '');
		return (/^[,:{}\[\]0-9.\-+Eaeflnr-u \n\r\t]*$/).test(str);	
	};
    
    /**
     * get parameters from url
     * @method getQuery
     * @param {String} key
     * @param {String} url
     * @return {String | Array}
     */
    this.getQuery = function(key, url) {
        url = url || window.location.href + '';
        if (url.indexOf('#') !== -1) {
            url = url.substring(0, url.indexOf('#'));
		}
        var rts = [], rt;
        var queryReg = new RegExp('(^|\\?|&)' + key + '=([^&]*)(?=&|#|$)', 'g');
        while ((rt = queryReg.exec(url)) != null) {
            rts.push(decodeURIComponent(rt[2]));
        }
        if (rts.length == 0) return null;
        if (rts.length == 1) return rts[0];
        return rts;
    };
    
    /**
     * set parameters for url
     * @method setQuery
     * @param {String} key
     * @param {String | Array} value
     * @param {String} url
     * @return {String}
     */
    this.setQuery = function(key, value, url) {
        url = url || window.location.href + '';
        var hash = '';
        if (!/^http/.test(url)) {
			return url;
		}
        if (url.indexOf('#') !== -1) {
            hash = url.substring(url.indexOf('#'));
        }
        url = url.replace(hash, '');
        url = url.replace(new RegExp('(^|\\?|&)' + key + '=[^&]*(?=&|#|$)', 'g'), '');
        value = XN.isArray(value) ? value : [value];
        
        for (var i = value.length - 1;i >= 0;i --) {
            value[i] = encodeURIComponent(value[i]);
        }

        var p = key + '=' + value.join('&' + key + '=');
        return url + (/\?/.test(url) ? '&' : '?') + p + hash;
    };
	
	this.isNum = this.isNumber;
});
/*
 *  based on YUI:YAHOO.lang.JSON 
 */
object.add('XN.json', function(exports) {
	this._PARSE_DATE = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})Z$/;
	
    this.dateToString = function (d) {
        function _zeroPad(v) {
            return v < 10 ? '0' + v : v;
        }

        return '"' + d.getUTCFullYear()   + '-' +
            _zeroPad(d.getUTCMonth() + 1) + '-' +
            _zeroPad(d.getUTCDate())      + 'T' +
            _zeroPad(d.getUTCHours())     + ':' +
            _zeroPad(d.getUTCMinutes())   + ':' +
            _zeroPad(d.getUTCSeconds())   + 'Z"';
    }
	
    this.stringToDate = function (str) {
        if (exports._PARSE_DATE.test(str)) {
            var d = new Date();
            d.setUTCFullYear(RegExp.$1, (RegExp.$2|0)-1, RegExp.$3);
            d.setUTCHours(RegExp.$4, RegExp.$5, RegExp.$6);
            return d;
        }
    }
	
	this.parse = function(str){
        return eval('(' + str + ')');
	}
	
	this.build = function(o,w,d){
		// 用object带的json
		return JSON.stringify(o, w, d);
	}
});

/**
 * 常用功能的封装
 * @namespace XN
 * @class util
 * @static
 */
object.add('XN.util', 'XN, XN.json, XN.array, XN.event, XN.string', function(exports, XN) {
	
	if(!window.__timeouts == null) {
		window.__timeouts = [];
		window.__intervals = [];
	}

	this.setTimeout = function(a, b) {
		var timer = setTimeout(a, b);
		window.__timeouts.push(timer);
		return timer;
	}

	this.setInterval = function(a, b) {
		var timer = setInterval(a, b);
		window.__intervals.push(timer);
		return timer;
	}

	this.clearTimeout = function(timer) {
		for (var i = 0; i < window.__timeouts.length; i++) {
			if (window.__timeouts[i] == timer) window.__timeouts.slice(i, 1);
		}
		clearTimeout(timer);
	}

	this.clearInterval = function(timer) {
		for (var i = 0; i < window.__intervals.length; i++) {
			if (window.__intervals[i] == timer) window.__intervals.slice(i, 1);
		}
		clearInterval(timer);
	}

	this.clearAllTimer = function() {
		for (var i = 0; i < window.__timeouts.length; i++) clearTimeout(window.__timeouts[i]);
		for (var i = 0; i < window.__intervals.length; i++) clearInterval(window.__intervals[i]);
		window.__timeouts = [];
		window.__intervals = [];
	}

	/**
	 * data cache class
	 * @class cache
	 * @constructor
	 * @param {Object} params
	 */
	this.cache = function(params) {
		XN.$extend(this, params);
		this._cacheData = [];
	};

	this.cache.prototype = {
		
		/**
		 * @property cacheLength
		 * @type {Int}
		 */
		cacheLength : null,
		
		_cacheData : null,
		
		/**
		 * check if the cahe key exist
		 * @method isExist
		 * @param {String | Int} key
		 * @return {Boolean}
		 */
		isExist : function(key) {
			return this.get(key);
		},
		
		/**
		 * add a cache data
		 * @method add
		 * @param {String | Int} key
		 * @param {Any} value
		 */
		add : function(key ,value) {
			if (!XN.isUndefined(this.isExist(key))) return;
			
			if (this.cacheLength && this.cacheLength == this._cacheData.length) {
				this._cacheData.shift();
			}
			
			this._cacheData.push({
				'key'	:	key,
				'value':	value
			});
		},
		
		/**
		 * get cache data by key
		 * @method get
		 * @param {String | Int} key
		 * @return {Any}
		 */
		get : function(key) {
			for (var i = this._cacheData.length - 1 ; i >= 0 ; i--) {
				if(this._cacheData[i].key == key) {			
					return this._cacheData[i].value;
				}
			}		
		},
		
		/**
		 * clear cache
		 * @method clear
		 */
		clear : function() {
			this._cacheData = [];
		}	
	};

	/**
	 * 全局热键
	 * @class hotKey
	 * @static
	 */
	(function() {
		var funcs = {};

		exports.hotKey = {

			/**
			 * 添加热键
			 * <pre>
			 * XN.util.hotKey.add('27', callBack);
			 * XN.util.hotKey.add('ctrl+27', callBack);
			 * </pre>
			 * @method add
			 * @param {String} key
			 * @param {Function} func
			 * @obj {Object} obj
			 */
			add : function(key, func, obj) {
				key = String(key).toLowerCase();
				var ctrl = false;
				var alt = false;
				var shift = false;
				var _code = null;

				if (/^\d+$/.test(key)) {
					_code = parseInt(key);
				} else {
					ctrl = /ctrl|ctr|c/.test(key);
					alt = /alt|a/.test(key);
					shift = /shift|s/.test(key);
					if (/\d+/.test(key)) {
						_code = parseInt(/\d+/.exec(key)[0]);
					} else {
						_code = false;
					}
				}

				funcs[key] = funcs[key] || {};

				funcs[key][func] = function(e) {
					e = e || window.event;
					code = e.keyCode;
					if (ctrl && !e.ctrlKey) return;
					if (alt && !e.altKey) return;
					if (shift && !e.shiftKey) return;
					if (_code && code !== _code) return;
					func.call(obj || null);
					XN.event.stop(e);
				};
				XN.event.addEvent(document, 'keydown', funcs[key][func]);
			},
			
			/**
			 * 删除热键
			 * <pre>
			 * XN.util.hotKey.del('27', callBack);
			 * </pre>
			 * @method del
			 * @param {String} key
			 * @param {Function} func
			 */
			del : function(key, func) {
				key = String(key).toLowerCase();
				XN.event.delEvent(document, 'keydown', funcs[key][func]);
				delete funcs[key][func];
			}
		};
	})();

	(function() {
		var id = 0;
		exports.createObjID = function() {
		  id ++;
		  return id;
		};
	})();

	// DS_JSON DS_XHR DS_friends DS_array 四个成员已移至 XN.datasource 模块

});
object.add('XN.datasource', 'XN, XN.json, XN.net, XN.string, XN.array', function(exports, XN) {

	/**
	 * json格式的ajax数据源
	 * <pre>
	 *  参数形式如下
	 *  <pre>
	 *  {
	 *      url:'',//查询的url
	 *      queryParam:'query',//查询的参数名
	 *      attachParam:'',//附加参数
	 *      rootKey:null//如果不指定，则认为整个json即为查询结果
	 *  }
	 *  </pre>
	 * </pre>
	 *
	 * @class DS_JSON
	 * @constructor
	 * @param {Object} params
	 */

	this.DS_JSON = function(p) {
		XN.$extend(this, p);
	};

	this.DS_JSON.prototype  = {
		DS_TYPE : 'JSON',
		url : null,
		queryParam : 'query',
		attachParam : '',
		rootKey : null,
		method : 'get',
		_request : null,

		/**
		 * 查询数据
		 * @method query
		 * @param {String} v 查询的字符串
		 * @param {Function} callBack 回调函数
		 */
		query : function(v, callBack) {
			var This = this;
			
			try {
				this._request.abort();
			} catch(e){}
			
			function parseDS_JSON(r) {
				r = r.responseText;
				var pp;
				try {
					var rt = XN.json.parse(r);
					if (This.rootKey && rt[This.rootKey]) {
						pp = rt[This.rootKey];
					} else {
						pp = rt;
					}
				}
				catch(e) {
					pp = [];
				}
				callBack(pp);
			}
			
			this._request = new XN.net.xmlhttp({
				url : this.url,
				data : this.queryParam + '=' + encodeURIComponent(v) + '&' + this.attachParam,
				method : this.method,
				onSuccess : parseDS_JSON
			});
		}
	};

	/**
	 * 用于好友选择器的好友数据源
	 * <pre>
	 * 参数形式如下
	 * {
	 *  url:''//请求的url
	 * }
	 * </pre>
	 * @class DS_friends
	 * @constructor
	 * @param {Object} params
	 */

	/**
	 * 如果指定了此属性，将在此网络内查询好友
	 * @property net
	 * @type {String}
	 */

	/**
	 * 如果指定了此属性，将在此分组内查询好友
	 * @property group
	 * @type {String}
	 */


	/**
	 * 查询好友
	 * @method query
	 * @param {String} name
	 * @param {Function} callBack
	 */
	this.DS_friends = function(p) {
		var ds = new exports.DS_JSON(p);
		ds.queryParam = 'p';
		ds.rootKey = 'candidate';
		ds.net = '';
		ds.group = '';
		ds.page = XN.isUndefined(p.page) ? false : p.page;

		ds.param = XN.json.build(p.param || {});

		var limit =  XN.isUndefined(p.limit) ? 24 : p.limit;

		ds.query = function(name, callBack) {
			XN.log('start query');
			
			//只允许查询字母和汉字
			name = name.replace(/[^a-zA-Z\u0391-\uFFE5]/g, '');
			
			if (XN.string.isBlank(name) && this.group == '' && this.net == '') {
				callBack([]);
				return;
			}

			var p = [
				'{"init":false,',
				'"qkey":"' + this.qkey + '",',
				'"uid":true,',
				'"uname":true,',
				'"uhead":true,',
				'"limit":' + limit + ',',
				'"param":' + this.param + ',',
				'"query":"' +  name  + '",',
				'"group":"' + this.group + '",',
				'"net":"' + this.net + '",',
				'"page":"' + this.page + '"',
				'}'
			].join('');

			exports.DS_JSON.prototype.query.call(this, p, callBack);
		}
		return ds;
	};


	/**
	 * 从数组创建数据源
	 * <pre>
	 * 参数形式如下
	 *  {
	 *      data:a,//创建源的数组
	 *      searchKey:'name'//要搜索的字段
	 *  }
	 * </pre>
	 * @class DS_Array
	 * @constructor
	 * @param {Object} params
	 */

	/**
	 * 查询数组
	 * @method query
	 * @param {String} v 查询的字符串
	 * @param {Function} callBack
	 */
	this.DS_Array = function(p) {
		XN.$extend(this, p);
		this.init();
	};

	this.DS_Array.prototype = {
		DS_TYPE : 'array',
		data : null,
		searchKey : null,
		
		init : function() {
			var key = this.searchKey,
			index = this._index = [];
			
			XN.array.each(this.data, function(i, v) {
				index.push(v[key]);
			});
		},
		
		query : function(v, callBack) {
			callBack(this._search(v));
		},
		
		_search : function(v) {
			var keys = this._index,
			data = this.data,
			rt = [],
			reg = new RegExp('^' + v, 'i');
			XN.array.each(keys, function(i, v) {
				if (reg.test(v)) rt.push(data[i]);
			});
			return rt;
		}
	};

	/**
	 * xml格式的ajax数据源
	 * <pre>
	 * 参数形式如下: 
	 *  {
	 *      url:''//查询的url地址
	 *  }
	 * </pre>
	 * @class DS_XHR
	 * @constructor 
	 * @param {Object} params
	 */

	/**
	 * 查询数据源
	 * @method query
	 * @param {String} v
	 * @param {Function} callBack
	 */
	this.DS_XHR = function(p) {
		XN.$extend(this, p);
	};

	this.DS_XHR.prototype = {
		url : null,
		queryParam : 'query',
		_request : null,
		
		query : function(v, callBack) {
			var This = this;
			
			try {
				this._request.abort();
			} catch(e) {}
			
			function parseDS_XML(r) {
				r = r.responseXML;
				var rt = [];
				function getResult(r) {
					var tmp = {};
					XN.array.each(r.childNodes, function(i, v) {
						tmp[v.tagName.toLowerCase()] = v.firstChild.nodeValue;
					});
					return tmp;
				}
				try {
					var rs = r.getElementsByTagName('Result');
					XN.array.each(rs, function(i, v) {
						rt.push(getResult(v));
					});
				}
				catch(e) {
					rt = [];
				}
				callBack(rt);
			}
			
			this._request = new XN.net.xmlhttp({
				url : this.url,
				data : this.queryParam + '=' + encodeURIComponent(v),
				onSuccess : parseDS_XML
			});
		}
	};

});
/**
 * @namespace XN
 * @class browser
 * @static
 */
object.add('XN.browser', 'sys, XN', function(exports, sys, XN) {

	/**
	 * @property IE
	 * @type {Boolean}
	 */
	this.IE = !!(window.attachEvent && !window.opera);
	
	/**
	 * @property IE6
	 * @type {Boolean}
	 */
	this.IE6 = navigator.userAgent.indexOf('MSIE 6.0') > -1;
	
	/**
	 * @property IE7
	 * @type {Boolean}
	 */
	this.IE7 = navigator.userAgent.indexOf('MSIE 7.0') > -1;
	
	/**
	* @property IE8
	* @type {Boolean}
	*/
	this.IE8 = navigator.userAgent.indexOf('MSIE 8.0') > -1;	
	/**
	 * @property Opera
	 * @type {Boolean}
	 */
	this.Opera = !!window.opera,
	
	/**
	 * @property WebKit
	 * @type {Boolean}
	 */
	this.WebKit = navigator.userAgent.indexOf('AppleWebKit/') > -1;
	
	/**
	 * @property Gecko
	 * @type {Boolean}
	 */
	this.Gecko = navigator.userAgent.indexOf('Gecko') > -1 && navigator.userAgent.indexOf('KHTML') == -1;
	
	/**
	 * copy string to clipboard
	 * @param {String} str
	 */
	this.copy = function(o) {
		function onfail() {
			if (XN.isElement(o)) {
				o.select();
			}
		}
		
		var str;

		if (XN.isElement(o)) {
			str = o.value;
		} else {
			str = o;
		}

		var _do = sys.modules['XN.Do'];
		
		if (window.clipboardData && clipboardData.setData) {
			if (clipboardData.setData('text', str)) return true;
		} else { 
			if (_do) {
				_do.alert({
					message : '您的浏览器不支持脚本复制,请尝试手动复制',
					callBack : function() {
						onfail();
					}
				});
			} else {
				alert('您的浏览器不支持脚本复制,请尝试手动复制');
			}
			return false;
		}

		if (_do) {
			_do.alert({
				message : '您的浏览器设置不允许脚本访问剪切板',
				callBack : function() {
					onfail();
				}
			});
		} else {
			alert('您的浏览器设置不允许脚本访问剪切板');
		}

		return false;
	}
});
/**
 * @namespace XN
 * @class cookie
 * @static
 */
object.add('XN.cookie', 'XN', function(exports, XN) {

	/**
	 * get cookie
	 * @method get
	 * @param {String} name
	 */
	this.get = function(name) {
		var nameEQ = name + '=';
		var ca = document.cookie.split(';');
		for (var i=0; i < ca.length; i++) {
			var c = ca[i];
			while (c.charAt(0) == ' ') {
				c = c.substring(1, c.length);
			}
			if (c.indexOf(nameEQ) == 0) {
				return decodeURIComponent(c.substring(nameEQ.length, c.length));
			}
		}
		return null;
	}
	
	/**
	 * set Cookie
	 * @method set
	 * @param {String} name
	 * @param {String} value
	 * @param {Int} days
	 * @param {String} path
	 * @param {String} domain
	 * @param {Boolean} secure
	 */
	this.set = function(name, value, days, path, domain, secure) {
		var expires;
		if (XN.isNumber(days)) {
			var date = new Date();
			date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
			expires = date.toGMTString();
		} else if (XN.isString(days)) {
			expires = days;
		} else {
			expires = false;
		}
		
		document.cookie = name + '=' + encodeURIComponent(value) +
				(expires ? ';expires=' + expires  : '') +
				(path ? ';path=' + path : '') +
				(domain ? ';domain=' + domain : '') +
				(secure ? ';secure' : '');
	}
	
	/**
	 * delete Cookie
	 * @method del
	 * @param {String} name
	 * @param {String} path
	 * @param {String} domain
	 * @param {Boolean} secure
	 */
	this.del = function(name, path, domain, secure) {
		exports.set(name, '', -1, path, domain, secure);
	}
});
/**
 * @namespace XN
 * @class net
 * @static
 */
object.add('XN.net', 'XN, XN.form, XN.util, XN.event, XN.func, XN.browser, XN.element', function(exports, XN) {
	if(!window.__ajaxProxies) {
		window.__ajaxProxies = {};
	}

	/**
	 * send form by xmlhttp<br />
	 * the params is like {url:'',form:'',method:'',onSuccess:'',onError:''}
	 * @namespace XN.net 
	 * @method sendForm 
	 * @param {Object} params
	 * @return {XN.net.xmlhttp}
	 * @requires xn.form.js
	 */
	this.sendForm = function(params) {
		XN.log('send form');
		params.data = XN.form.serialize(params.form);
		return new exports.xmlhttp(params);
	};

	/**
	 * 发送一个统计，为避免垃圾回收导致不能发送请求，将img放到window的一个全局变量中
	 * @see http://hi.baidu.com/naivebaby/blog/item/91a5fb18dc95631434fa4137.html
	 */
	this.sendStats = function(url) {
		var n = "log_"+ (new Date()).getTime();
		var c = window[n] = new Image(); // 把new Image()赋给一个全局变量长期持有
		c.onload = (c.onerror=function() {window[n] = null;});
		c.src = url;
		c = null; // 释放局部变量c
	};

	/**
	 * 参数形式
	 * <pre>
	 * {
	 *  url:'',
	 *  data:'',
	 *  useCache:true,
	 *  method:'get',
	 *  onComplete:functoin,//请求完成回调
	 *  onSuccess:function,//请求成功回调
	 *  onError:''//请求失败回调
	 *  }
	 *
	 *  注意: 302重定向属于失败状态
	 *  
	 *  callBack = function(r)
	 *  {
	 *      if (r.status == 302)
	 *      {
	 *      }
	 *  }
	 *  
	 *  回调函数可以通过r.status判断是否重定向
	 *  </pre>
	 * @namespace XN.net
	 * @class xmlhttp
	 * @constructor
	 * @param {Object} params
	 */
	this.xmlhttp = function(params) {
		var This = this;
		
		if (!exports.cache)
			 exports.cache = new XN.util.cache();
		
		//patch for old version
		if (arguments.length > 1) {
			this.url = arguments[0] || null;
			this.data = arguments[1] || '';
			this.onSuccess = arguments[2];
			extendObject(this, arguments[3]);
			init(window);
			return this;
		}
		
		extendObject(this, params);

		var cache;
		
		if (this.useCache && (cache = exports.cache.get(this.url + encodeURIComponent(this.data)))) {
			this.transport = {};
			this.transport.responseText = cache;
			setTimeout(function() {
				This._onComplete();
				This._onSuccess();
			}, 0);
			return this;
		}
		
		function init(w) {
			This.transport = This.getTransport(w);
			return This.url && This.send(This.method);
		}

		function getDomain(link) {
			var a = XN.element.$element('a');
			a.href = link;
			return a.hostname;
		}

		//请求Host
		var requestHost = getDomain(this.url);
		
		if (/^http/.test(this.url) && location.hostname != requestHost) {
			if (window.__ajaxProxies[requestHost]) {
				//如果该域相应iframe仍在loading，则延迟直到onload时再init
				//避免同域请求在iframe onload之前再次向DOM插入重复src的iframe
				(function() {
					if (window.__ajaxProxies[requestHost].loaded) {
						init(window.__ajaxProxies[requestHost].contentWindow);
					} else {
						setTimeout(arguments.callee, 100);
					}
				})()
			} else {
				var iframe = XN.element.$element('iframe').hide();
				document.body.insertBefore(iframe, document.body.firstChild);
				iframe.src = 'http://' + requestHost + '/ajaxproxy.htm'; 
				//框架插入DOM，但未load完成
				window.__ajaxProxies[requestHost] = iframe; 
				window.__ajaxProxies[requestHost].loaded = false;
				XN.event.addEvent(iframe, 'load', function() {
					// Firefox3 的一个bug，当多个iframe同时加载时，有可能出现内容错乱的问题
					// https://bugzilla.mozilla.org/show_bug.cgi?id=388714
					// https://bugzilla.mozilla.org/show_bug.cgi?id=363840
					// 表现就是src和location.href地址不一样了，当遇到这种情况是，重新刷新下iframe的内容
					if (iframe.contentWindow.location.href !== iframe.src) {
						iframe.contentWindow.location.href = iframe.src;
					} else {
						try{
							init(iframe.contentWindow);
							//iframe load完成，修改状态属性
							window.__ajaxProxies[requestHost] = iframe;
							window.__ajaxProxies[requestHost].loaded = true;
						} catch(e) {}
					}

				});
			}
		} else
			init(window);
		return This;
	};

	this.xmlhttp.prototype = {
		url : null,
		data : '',
		onStart: new Function(),
		onSuccess : null,
		onFailure : null,
		onError : null,
		fillTo : null,
		method : 'post',
		asynchronous : true,
		transport : null,
		headers : null,
		iAmXmlhttp:true,
		useCache : false,
		requestToken : true,
		binary: false,
		formData:false,
		
		
		/**
		 * 取消当前请求
		 * @method abort
		 */		
		abort:function() {
			this.transport.abort();
		},

		send:function(method) {
			var _url;
			if (method == 'get' && this.data !== '') {
				_url = this.url + (/\?/.test(this.url) ? '&' : '?') + this.data;
			} else {
				_url = this.url;
			}
				
			this.transport.onreadystatechange = this.onStateChange.bind(this);
			this.transport.open(method, _url, this.asynchronous);
			//Chrome支持FormData对象以Ajax方式模拟form提交数据
			//反如果使用FormData则不能设置以下http头
			if (!this.formData) {
				this.transport.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
			}		
			
			if (this.headers !== null) {
				for (var i in this.headers) {
					this.transport.setRequestHeader(i ,this.headers[i]);
				}
			}
			//安全 阻止跨站提交
			var params  = null;
			if(method == 'post') {
				params = this.data;
				if(this.requestToken && XN.get_check) {
					params += (params ? '&' : '') + 'requestToken=' + XN.get_check;
				}
				if(this.requestToken && XN.get_check_x) {
					params += (params ? '&' : '') + '_rtk=' + XN.get_check_x;
				}
			}
			// null log listener
			// only IE && profile && get request && 十分之一
			try{
				if(window.event && document.body.id == 'profile' && method == 'get' && /(none|null)\b/.test(this.url) && XN.user.id % 10 == 0) {
					var temp = document.createElement('div');
					var obj = event.srcElement;
					temp.appendChild(obj);
					if(obj) {
						var params = {from:'profile', nodeHTML:temp.innerHTML};
						nullOrNoneLog(params);
					}
				}
			} catch(e){}

			// 找到null 或者 none 请求的LOG
			function nullOrNoneLog(data){
				var params = '';
				for(var i in data) {
    				params = params + '&' + i + '=' + encodeURIComponent(data[i]);
				}
				var logImg = new Image().src = 'http://123.125.44.44/r/?t=' + new Date().getTime() + params;
			} 
			

			//判断是否发送二进制数据流
			if(this.binary) {
				this.transport.sendAsBinary(params);
			} else {
				this.transport.send(params);
			}
		},
		
		_onSuccess : function(obj) {
			var transport = this.transport;
			if (this.fillTo !== null) {
				try{this.fillTo.stopLoading();}catch(e) {}
				this.fillTo.innerHTML = transport.responseText;
			}
			try {
				if (this.onSuccess) {
					this.onSuccess.call(null, transport);
				}
			} catch (e) {
				if (XN.DEBUG_MODE) {
					throw e;
				}
			}
		},
		
		_onComplete : function(obj) {
			var transport = this.transport;
			try {
				if (this.onComplete) {
					this.onComplete.call(null, transport);
				}
			} catch(e) {
				if (XN.DEBUG_MODE) {
					throw e;
				}
			}
		},

		onStateChange : function() {
			var transport = this.transport;
			if(transport.readyState == 1 && !this.hasRunStart) {
				this.onStart();
				this.hasRunStart = true;
			} else if (transport.readyState == 4) {
				if(transport.status == undefined || transport.status == 0 || (transport.status >= 200 && transport.status < 300)) {
					if (this.useCache) {
						exports.cache.add(this.url + encodeURIComponent(this.data), this.transport.responseText);
					}
					this._onSuccess();
				} else {
					(this.onError || this.onFailure || XN.func.empty).call(null, transport);
				}
				this._onComplete();
			}
		}
	};

	this.xmlhttp.prototype.getTransport = function(w) {
		if(w != window) {
			return w.getTransport();		
		} else if(XN.browser.IE) {
			try{
				return new ActiveXObject('Msxml2.XMLHTTP');
			} catch(e) {
				return new ActiveXObject('Microsoft.XMLHTTP');
			}
		}
		else {
			return new XMLHttpRequest();
		}
	};

	this.ajax = this.xmlhttp;

	XN.$extend(this.xmlhttp.prototype, {
		get : function(url, data, onSuccess, params) {
			this.url = url;
			this.data = data;
			this.onSuccess = onSuccess;
			XN.$extend(this, params);
			this.send('get');
		},
		
		post : function(url, data, onSuccess, params) {
			this.url = url;
			this.data = data;
			this.onSuccess = onSuccess;
			XN.$extend(this, params);
			this.send('post');		
		}
	});

	if (typeof Ajax == 'undefined') {
		Ajax = {};
		Ajax.Request = function(url, o) {
			var p = o.parameters;
			o['url'] = url;
			o['data'] = p;
			delete o.parameters;
			return new exports.xmlhttp(o);
		} 
	}
});
/**
 * @namespace XN
 * @class env
 * @static
 */
object.add('XN.env', function(exports) {

	this.shortSiteName = '����';
	this.siteName = '������';
	this.domain = 'renren.com';
	//this.domain = window.location.hostname.split('.').reverse().slice(0, 2).reverse().join('.');

	/**
	 * @property domain
	 * @type {String}
	 * @default '' + XN.env.domain + ''
	 */
    this.domain_reg = this.domain.replace(/\./g,'\\.');
	
	/**
	 * @property staticRoot
	 * @type {String}
	 * @default 'http://s.xnimg.cn/'
	 */
	this.staticRoot = 'http://s.xnimg.cn/';
	
	this.CDNstaticRoot = 'http://a.xnimg.cn/';
	
	/**
	 * @property swfRoot
	 * @type {String}
	 * @default 'http://static.xiaonei.com'
	 */
	this.swfRoot = 'http://static.xiaonei.com/';
	
	/**
	 * @property wwwRoot
	 * @type {String}
	 * @default 'http://' + XN.env.domain + '/'
	 */
	this.wwwRoot = 'http://' + this.domain + '/';
	
});

/**
 * @namespace XN
 * @class event
 * @static
 */

object.add('XN.event', 'XN, XN.browser, XN.array, XN.element', function(exports, XN) {
	var browser = XN.browser;
	var allEvents = [];

	// 不记录event，所有addEvent直接返回
	this.ignoreEvent = false;

	/**
	 * @property logEvents
	 */
	this.logEvents = false;

	/**
	 * @method isCapsLockOn
	 * @param {Object} e the event object
	 * @return {Boolean}
	 */
	this.isCapsLockOn = function(e) {
		var c = e.keyCode || e.which;
		var s = e.shiftKey;
		if (((c >= 65 && c <= 90) && !s) || ((c >=97 && c <= 122) && s)) {
			return true;
		}
		return false;
	};
	
	/**
	 * get event src element
	 * @method element
	 * @param {Object} e the event object
	 * @return {HTMLElement}
	 */
	this.element = function(e) {
		var n = e.target || e.srcElement;
		return exports.resolveTextNode(n);
	};
	
	/**
	 * get related element of event as 'mouseover'
	 * @method relatedTarget
	 * @param {Object} e
	 * @return {HTMLElement}
	 */
	this.relatedTarget = function(e) {
		var t = e.relatedTarget;
		if (!t) {
			if (e.type == 'mouseout' || e.type == 'mouseleave') {
				t = e.toElement;
			}
			else if (e.type == 'mouseover') {
				t = e.fromElement;
			}
		}	
		return exports.resolveTextNode(t);
	};
	
	this.resolveTextNode = function(n) {
		try {
			if (n && 3 == n.nodeType) {
				return n.parentNode;
			}
		} catch(e) {}
		
		return n;
	};
	
	/**
	 * get mouse pointer pose x
	 * @method pointerX
	 * @param {Object} event
	 * @return {Int}
	 */
	this.pointerX = function(event) {
		return event.pageX || (event.clientX + (document.documentElement.scrollLeft || document.body.scrollLeft));
	};
	
	/**
	 * get mouse pointer pose y
	 * @method pointerY
	 * @param {Object} event
	 * @return {Int}
	 */
	this.pointerY = function(event) {
		return event.pageY || (event.clientY + (document.documentElement.scrollTop || document.body.scrollTop));
	};
	
	/**
	* 判断当前页面是否是标准模式
	*/
	this.isStrictMode = document.compatMode!="BackCompat";
	
	/**
	 * get page height
	 * @method pageHeight
	 * @return {Int}
	 */
	this.pageHeight = function() {
		return this.isStrictMode ? Math.max(document.documentElement.scrollHeight,document.documentElement.clientHeight) : Math.max(document.body.scrollHeight,document.body.clientHeight);
	};
	
	/**
	 * get page width
	 * @method pageWidth
	 * @return {Int}
	 */
	this.pageWidth = function() {
		return this.isStrictMode ? Math.max(document.documentElement.scrollWidth,document.documentElement.clientWidth) : Math.max(document.body.scrollWidth,document.body.clientWidth);
	};
	
	/**
	 * get inner width of window
	 * @method winWidth
	 * @return {Int}
	 */
	this.winWidth = function() {
		return this.isStrictMode ?  document.documentElement.clientWidth : document.body.clientWidth;
	};
	
	/**
	 * get inner height of window
	 * @method winHeight
	 * @return {Int}
	 */
	this.winHeight = function() {
		return this.isStrictMode ? document.documentElement.clientHeight : document.body.clientHeight;
	};
	
	/**
	 * get scrollTop of document
	 * @method scrollTop
	 * @return {Int}
	 */
	this.scrollTop = function() {
		if (XN.browser.WebKit) {
			return window.pageYOffset;
		}
		
		return this.isStrictMode ? document.documentElement.scrollTop : document.body.scrollTop;
	};
	
	/**
	 * get scrollLeft of document
	 * @method scrollLeft
	 * @return {Int}
	 */
	this.scrollLeft = function() {
		if (XN.browser.WebKit) {
			return window.pageXOffset;
		}

		return this.isStrictMode ? document.documentElement.scrollLeft : document.body.scrollLeft;
	};
	
	/**
	 * stop event bubble
	 * @method stop
	 * @param {Object} event
	 */
	this.stop = null;


	this.clearEvents = function() {
		for (var eventInfo, i = 0; eventInfo = allEvents[i]; i++) {
			exports.delEvent.apply(exports, eventInfo);
		}

		allEvents = [];
	};
	
	this.addEvent = function(el, name, func, cap) {
		if (exports.ignoreEvent) return;

		var els = [];
		el = XN.element.$(el);
		if (XN.isArray(el)) {
			els = el;
		} else {
			els.push(el);
		}
		if (els.length == 0) return el;
		XN.array.each(els, function(i, v) {
			if (exports.logEvents) allEvents.push([v, name, func, cap]);
			exports._addEvent(v, name, func, cap);
		});
		return el;
	};
	
	this.delEvent = function(el, name, func, cap) {
		var els = [];
		el = XN.element.$(el);
		if (XN.isArray(el)) {
			els = el;
		} else {
			els.push(el);
		}
		if (els.length == 0) {
			return el;
		}
		XN.array.each(els, function(i, v) {
			exports._delEvent(v, name, func, cap);
		}); 
		return el;
	};
	
	this._addEvent = null;
	
	this._delEvent = null;
	
	/**
	 * enable custom event for an object
	 * @param {Object} obj
	 * @return {Object}
	 */
	this.enableCustomEvent = function(obj) {
		XN.$extend(obj, {
			addEvent : function(type, func) {
				if(!this._customEventListeners) this._customEventListeners = {};
				var funcs = this._customEventListeners;
				if(XN.isUndefined(funcs[type])) {
					funcs[type] = [];
				}
				funcs[type].push(func);
				return this;
			},
			
			delEvent : function(type, func) {
				var funcs = this._customEventListeners[type];
				if (funcs) {
					for(var i = funcs.length - 1; i >= 0; i--) {
						if(funcs[i] == func) {
							funcs[i] = null;
							break;
						}
					}
				}
				return this;
			},
			
			fireEvent : function(type) {
				if(!this._customEventListeners || !this._customEventListeners[type]) {
					return;
				}
				var funcs = this._customEventListeners[type], ars = XN.array.build(arguments);
				ars.shift();
				for(var i = 0, j = funcs.length; i < j; i++) {
					if(funcs[i]) {
						try { 
                            funcs[i].apply(this, ars);
                        } catch(ox) {
                            if (XN.DEBUG_MODE) {
								throw ox;
							}
                        }
						
					}
				}
			}
		});
		
		return obj;
	};
	
	if (browser.IE) {
		this.stop = function(event) {
			event.returnValue = false;
			event.cancelBubble = true;			
		}
	} else {
		this.stop = function(event) {
			event.preventDefault();
			event.stopPropagation();		
		}
	}
	
	var ismouseleave = function(event, element) {
		var p = event.relatedTarget;
		while (p && p != element) {
			try { 
				p = p.parentNode; 
			} catch(error) { 
				p = element; 
			}
		}
		return p !== element;
	}
	
	if (window.attachEvent && !browser.Opera) {
		// 将window.event包装一下，使其拥有preventDefault等方法
		function wrapEvent(nativeEvent) {
			nativeEvent.stopPropagation = function() {
				this.cancelBubble = true;
			};
			nativeEvent.preventDefault = function() {
				this.returnValue = false;
			};
			return nativeEvent;
		}

		this._addEvent = function(element, name, func) {
            element = XN.element.$(element);
            if (name == 'input') 	name = 'propertychange';
			if (name == 'keypress') name = 'keydown';
			
			if (!element._eventListeners[name]) {
				element._eventListeners[name] = [];
			}

			var wrapperFunc = function() {
				var e = wrapEvent(window.event);
				func.call(element, e);
			}
			wrapperFunc.innerFunc = func;

			element._eventListeners[name].push(wrapperFunc);

			element.attachEvent('on' + name, wrapperFunc);
            return element;
		};
		
		this._delEvent =  function(element, name, func) {
            element = XN.element.$(element);
			if (name == 'input' ) 	name = 'propertychange';
			if (name == 'keypress') name = 'keydown';

			if (!element._eventListeners[name]) {
				return;
			}

			for (var i = 0, wrapperFunc; i < element._eventListeners[name].length; i++) {
				wrapperFunc = element._eventListeners[name][i];
				if (wrapperFunc.innerFunc === func) {
					break;
				}
			}

			element.detachEvent('on' + name, wrapperFunc);
            return element;
		};
	} else if (window.addEventListener) {
		
		/**
		 * add event for element
		 * @namespace XN.event
		 * @method addEvent
		 * @param {HTMLElement | String} element
		 * @param {String} name
		 * @param {Function} func
		 * @param {Boolean} useCapture
		 * @return {HTMLElement}
		 */
		this._addEvent = function(element, name, func, useCapture) {
			element = XN.element.$(element);
			if (name == 'mouseleave') {
				element.onmouseleave = function(e) {
                    e = e || window.event;
					if (ismouseleave(e, element) && func) {
						func.call(element, e);
					}
				};
				element.addEventListener('mouseout', element.onmouseleave, useCapture);
				return element;
			}
			if (name == 'keypress' && browser.WebKit) {
				name = 'keydown';
			}
			element.addEventListener(name, func, useCapture);
			return element;
		};
		
		/**
		 * del event 
		 * @method delEvent
		 * @param {HTMLElement | String} element
		 * @param {String} name
		 * @param {Function} func
		 * @param {Boolean} useCapture
		 * @return {HTMLElement}
		 */
		this._delEvent = function(element, name, func, useCapture) {
			element = XN.element.$(element);
			if (name == 'mouseleave') {
				element.removeEventListener('mouseout', element.onmouseleave, useCapture);
				return element;
			}
			if (name == 'keypress' && browser.WebKit) {
				name = 'keydown';
			}
			element.removeEventListener(name, func, useCapture);
			return element;
		};
	}
});

/**
 * @namespace XN
 * @class dom
 * @static
 */

object.add('XN.dom', 'dom, ua, XN, XN.event, XN.array, XN.browser, XN.element', function(exports, dom, ua, XN) {

	var Event = XN.event;
	var array = XN.array;
	var browser = XN.browser;
	
	var shadowElement = null;
	
	function createShadow(opacity, zIndex) {
        opacity = opacity || 0.3;
        zIndex = zIndex || 2000;
		
        var el = XN.element.$element('div');
		
        shadowElement = el;
		
		el.style.position = 'absolute';
		el.style.top = 0;
		el.style.left = 0;
		el.style.background = '#000';
		el.style.zIndex = zIndex;
		el.style.opacity = opacity;
		el.style.filter = 'alpha(opacity=' + (opacity * 100) + ')';
		el.innerHTML = ['<iframe width="100%" height="100%" frameBorder="0" style="position:absolute;top:0;left:0;z-index:1;"></iframe>',
                        '<div style="position:absolute;top:0;left:0;width:100%;height:100%;background-color:#000000;z-index:2;height:expression(this.parentNode.offsetHeight);"></div>'].join('');
		
        function resize() {
		    el.hide();
            el.style.height = XN.event.pageHeight() + 'px';
		    el.style.width = XN.event.pageWidth() + 'px';
			el.show();					
        }
		
        resize();

        XN.event.addEvent(window, 'resize', function(e) {
			if (shadowElement && shadowElement.style.display != "none") {
                try {
                    resize();
				} catch(e) {}
            }
		});
		
		document.body.insertBefore(el, document.body.firstChild);
	}
	
	/**
	 * disable user interface
	 * @method disable
	 * @param {Float} opacity
	 */
	this.disable = function(opacity, zIndex) {
		if (!shadowElement) {
			createShadow(opacity, zIndex);
		}
		/*if (XN.browser.IE6)
		{
			document.getElementsByTagName("html")[0].style.overflow="hidden";
			document.body.style.overflow="hidden";
		}*/
	};
	
	/**
	 * enable user interface
	 * @method enable
	 */
	this.enable = function() {
		if (shadowElement) {
			/*if (XN.browser.IE6)
			{
				document.getElementsByTagName("html")[0].style.overflow="";
				document.body.style.overflow="";
			}*/

			shadowElement.remove();
			shadowElement = null;
		}
	};
	
	/**
	 * insert element after another
	 * @method insertAfter
	 * @param {HTMLElement} element
	 * @param {HTMLElement} targetElement
	 */
	this.insertAfter = function(element, targetElement) {
		element = XN.element.$(element);
		targetElement = XN.element.$(targetElement);
		
		var parent = targetElement.parentNode;
		if (parent.lastChild == targetElement) {
			parent.appendChild(element);
		} else {
			parent.insertBefore(element, targetElement.nextSibling);
		}
	};
	
	/**
	 * get elements by classname
	 * @param {String} className
	 * @param {HTMLElement | String} element
	 * @param {String} tagName
	 * @return {Array}
	 */
	this.getElementsByClassName = function(className, element, tagName) { 
		var c = (XN.element.$(element) || document).getElementsByTagName(tagName || '*') || document.all; 
		var elements = []; 
		var _exp = new RegExp("(^|\\s)" + className + "(\\s|$)");
		
		array.each(c, function(i, v) {
			if (_exp.test(v.className)) elements.push(v);
		});
		
		return elements; 
	};

	this.findFirstClass = function(element, className) {
		element = XN.element.$(element);
		var els = exports.getElementsByClassName(className, element);
		return XN.element.$(els[0]) || null;
	};

	this.ready = function(callback, async) {
		if (XN.isUndefined(async)) {
			async = false;
		}
		var func = async? function() {
			setTimeout(callback, 0);
		} : callback;

		dom.ready(func);
	};

	/**
	 * preload Image
	 * @method preloadImg
	 * @param {String | Array} src
	 */
	this.preloadImg = function(src) {
		src = XN.isArray(src) ? src : [src];
		array.each(src, function(i, v) {
			new Image().src = v;
		});
	};
	
	this.readyDo = this.ready;
	
	//this.ready(function() {
	//	$ = ge = getEl = xn_getEl;
	//});
});
/**
 * @namespace XN
 * @class element
 * @static
 */

object.add('XN.element', 'sys, XN, XN.browser, XN.env', function(exports, sys, XN) {
	var browser = XN.browser;

	//属性名称白名单，在将属性扩展到元素上时，去除$,$element,__name__,toString四个元素的扩展
	var _extends = ['clear','hover','scrollTo','visible','toggleClass','toggleText',
				   'hasClassName','addClass','delClass','show','hide','remove','setStyle','getStyle',
                   'addEvent','delEvent','_eventListeners','matchesSelector','getData','delegate','addChild',
                   'delChild','setContent','setHTML','getPosition','realLeft','realTop','appendHTML','html','parent',
                   'startLoading','stopLoading','eval_inner_JS','extend','setOpacity','findFirstClass'];
	var _effect = sys.modules['XN.effect'];

	// 将字符串转化成dom
	function getDom(str) {
		var tmp = document.createElement('div');
		tmp.style.display = 'none';
		document.body.appendChild(tmp);

		tmp.innerHTML = str;
		var dom = document.createElement('div');
		while (tmp.firstChild) dom.appendChild(tmp.firstChild);
		tmp.parentNode.removeChild(tmp);
		return dom;
	}

	// 判断是否需要使用getDom
	var t = document.createElement('div');
	t.innerHTML = '<TEST_TAG></TEST_TAG>';
	// IE 下无法获取到自定义的Element，其他浏览器会得到HTMLUnknownElement
	var needGetDom = t.firstChild === null;
	
	/**
	 * 清空元素的innerHTML
	 * @method clear
	 * @param {HTMLElement | String} element
	 * @return {HTMLElement}
	 */

	this.clear = function(element) {
		element = exports.$(element);
		element.innerHTML = '';
		return element;
	};

	/**
	 * simple hover
	 * @method hover
	 * @param {HTMLElement | String} element the element hover on
	 * @param {String} className hover class
	 * @param {HTMLElement | String} hover add class to
	 */
	this.hover = function(element, className, hover) {
		element = exports.$(element);
		hover =  hover ? exports.$(hover) : element;
		var _event = sys.modules['XN.event'];
		if(_event) {
			_event.addEvent(element, 'mouseover', function() {
				hover.addClass(className);
			}, false);
			
			_event.addEvent(element ,'mouseleave', function() {
				hover.delClass(className);
			}, false);
		} else {
			throw new Error("请先导入XN.event模块，再使用XN.event.addEvent");
		}
		
		return element;
	};
	
	/**
	 * scroll page to element
	 * @method scrollTo
	 * @param {HTMLElement} element
	 * @param {String} effect
	 */
	this.scrollTo = function(element,effect) {
		element = exports.$(element);
		// 无effect模块重置
		if (!_effect) effect = 'normal';
		switch(effect) {
			case 'slow':
			XN.effect.scrollTo(element);
			break;
			default:
			window.scrollTo(0,element.realTop());
			break;
		}
		return element;
	};
	
	/**
	 * check if an element is visible
	 * @method visible
	 * @param {HTMLElement | String} element
	 * @return {Boolean}
	 */
	this.visible = function(element) {
		element = exports.$(element);
		return element.style.display != 'none' && element.style.visibility != 'hidden';
	};
	
	/**
	 * 来回开关一个元素的某个样式
	 * <pre>
	 *  &lt;div onclick="$(this).toggleClass('expand');"&gt;&lt;/div&gt;
	 * </pre>
	 * @method toggleClass
	 * @param {HTMLElement | String} element
	 * @return {HTMLElement}
	 */
	this.toggleClass = function(element, className, className2)
	{
		if (XN.isUndefined(className2)) {
			if (exports.hasClassName(element, className)) {
				exports.delClass(element, className);
			} else {
				exports.addClass(element, className);
			}
		}
		else {
			if (exports.hasClassName(element, className)) {
				exports.delClass(element, className);
				exports.addClass(element, className2);
			} else {
				exports.addClass(element, className);
				exports.delClass(element, className2);
			}
		}
		return exports.$(element);
	};

	/**
	 * 切换一个元素的innerHTML 
	 * <pre>
	 *  &lt;div onclick="$(this).toggleText('1', '2');"&gt;&lt;/div&gt;
	 * </pre>
	 * @method toggleText
	 * @param {HTMLElement | String} element
	 * @param {HTMLElement | String} text1 
	 * @param {HTMLElement | String} text2 
	 * @return {HTMLElement}
	 */ 
	this.toggleText = function(element, text1, text2) {
		if (element.innerHTML == text1) {
			element.innerHTML = text2;
		} else {
			element.innerHTML = text1;
		}
	};

	/**
	 * check if an element has given className
	 * @method hasClassName
	 * @param {HTMLElement | String} element
	 * @param {String} className
	 * @return {Boolean}
	 */
	this.hasClassName = function(element, className) {
		return new RegExp('(^|\\s+)' + className + '(\\s+|$)').test(exports.$(element).className);
	};
		
	/**
	 * add classname to an element
	 * @method addClass
	 * @param {HTMLElement | String} element
	 * @param {String} className
	 * @return {HTMLElement}
	 */
	this.addClass = function(element, className) {
		element = exports.$(element);
		if (exports.hasClassName(element, className))return element;
		element.className += ' ' + className;
		return element;
	};
	
	/**
	 * del className from an element
	 * @method delClass
	 * @param {HTMLElement | String} element
	 * @param {String} className
	 * @return {HTMLElement}
	 */
	this.delClass = function(element, className) {
		element = exports.$(element);
		element.className = element.className.replace(new RegExp('(^|\\s+)' + className + '(\\s+|$)', 'g'), ' ');
		return element;
	};
	
	/**
	 * show an element
	 * @method show element
	 * @param {HTMLElement | String} element
	 * @param {String} effect
	 * @return {HTMLElement}
	 */
	this.show = function (element,effect) {
		element = exports.$(element);
		if(element.style.display != 'none')return;
		// 无effect模块重置
		if (!_effect || !effect) effect = 'normal';
		switch(effect) {
			case 'normal':
			element.style.display = '';
			break;
			case 'fade':
			XN.effect.fadeIn(element,function(e) {
				e.style.display = '';
			});
			break;
			case 'slide':
			XN.effect.slideOpen(element);
			break;
			case 'delay':
			setTimeout(function() {
				element.style.display = '';
			},2000);
			break;
		}
		return element;
	};
	
	/**
	 * hide an element
	 * @method hide
	 * @param {HTMLElement} element
	 * @param {String} effect
	 * @return {HTMLElement}
	 */
	this.hide = function (element,effect) {
		element = exports.$(element);
		if(element.style.display == 'none')return;
		// 无effect模块则重置
		if (!_effect || !effect) effect = 'normal';
		switch(effect) {
			case 'normal':
			element.style.display = 'none';
			break;
			case 'fade':
			XN.effect.fadeOut(element,function(e) {
				e.style.display = 'none';
			});
			break;
			case 'slide':
			XN.effect.slideClose(element);
			break;
			case 'delay':
			setTimeout(function() {
				element.style.display = 'none';
			},2000);
			break;
		}
		return element;
	};
	
	/**
	 * remove element from the DOM
	 * @method remove
	 * @param {HTMLElement | String} element
	 * @return {HTMLElement}
	 */
	this.remove = function(element)
	{
		var element = exports.$(element);
		element.parentNode.removeChild(element);
		return element;
	};
	
	/**
	 * set style for an element
	 * @method setStyle
	 * @param {HTMLElement | String} element
	 * @param {String} style
	 * @return {HTMLElement}
	 */
	this.setStyle = function(element, style)
	{
		var element = exports.$(element);
		element.style.cssText += ';' + style;
		return element;
	};
	
	/**
	 * get style by style name
	 * @param {HTMLElement | String} element
	 * @param {String} name
	 * @return {String}
	 */
	this.getStyle = function(element, style) {
		element = exports.$(element);
		
		style = style == 'float' ? 'cssFloat' : style;
		
		var value = element.style[style];
		
		if (!value) {
			var css = document.defaultView.getComputedStyle(element, null);
			value = css ? css[style] : null;
		}
		
		if (style == 'opacity') return value ? parseFloat(value) : 1.0;
		
		return value == 'auto' ? null : value;
	};
	
	/**
	 * @method addEvent
	 * @return {HTMLElement}
	 * @see XN.event.addEvent
	 */
	this.addEvent = function() {
		var _event = sys.modules['XN.event'];
		if(_event) {
			_event.addEvent.apply(null, arguments);
		} else {
			throw new Error("请先导入XN.event模块，再使用XN.event.addEvent");
		}
		return arguments[0];
	};
	
	/**
	 * @method delEvent
	 * @return {HTMLElement}
	 * @see XN.event.delEvent
	 */
	this.delEvent = function() {
		var _event = sys.modules['XN.event'];
		if(_event) {
			_event.delEvent.apply(null, arguments);
		} else {
			throw new Error("请先导入XN.event模块，再使用XN.event.delEvent");
		}
		return arguments[0];
	};
	
	this._eventListeners = {};
	
	/**
	 * @method matchesSelector
	 */
	this.matchesSelector = function(element, selector) {
		return Sizzle.matches(selector, [element]).length > 0;
	};

	/**
	 * @method getData
	 * @param data name
	 * @return data value
	 */
	this.getData = function(element, name) {
		return element.getAttribute('data-' + name);
	};

	/**
	 * @method delegate
	 * @param 
	 * @return 
	 */
	this.delegate = function(element, selector, type, callback) {
		exports.$(element).addEvent(type, function(e) {
			var ele = exports.$(e.target || e.srcElement);
			do {
				if (ele && ele.matchesSelector(selector)) callback.call(ele, e);
			} while(ele = exports.$(ele.parentNode));
		});
	};
	
	/**
	 * add Child node to element
	 * @method addChild
	 * @param {HTMLElement | String} father
	 * @param {HTMLElement | String | XN.ui.element | XN.net.xmlhttp} child
	 * @return {HTMLElement}
	 */
	this.addChild = function(father, child) {
		father = exports.$(father);
		
		if (XN.isString(child) || XN.isNumber(child)) {
			var element = String(child).charAt(0) == '#' ? Sizzle(child)[0] : child;
			if(XN.isString(child) || XN.isNumber(child)) {
				father.innerHTML += element;
			} else {
				father.appendChild(element);
			}
		} else if (XN.isElement(child)) {
			father.appendChild(child);
		} else if(child.iAmUIelement) {
			father.appendChild(exports.$(child.frame));
		} else if(child.iAmXmlhttp) {
			child.fillTo = father;
			father.startLoading();
		}
		return father;
	};
	
	/**
	 * 
	 * @method delChild
	 * @param {HTMLElement | String} father
	 * @param {HTMLElement | String | XN.ui.element } child
	 * @return {HTMLElement}
	 */
	this.delChild = function(father, child) {
		child = exports.$(child);
		child.remove();
		return exports.$(father);
	};
	
	/**
	 * @method setContent
	 * @param {HTMLElement | String} element
	 * @param {HTMLElement | String | XN.ui.element | XN.net.xmlhttp} c
	 * @return {HTMLElement}
	 */
	this.setContent = function(element, c) {
		element = exports.$(element);
		element.innerHTML = '';
		element.addChild(c);
		return element;
	};

	/**
	 * 通过字符串设置此元素的内容
	 * 为兼容HTML5标签，IE下无法直接使用innerHTML
	 * @param str html代码
	 */
	this.setHTML = function(element, str) {
		if (needGetDom) {
			element.innerHTML = '';
			var nodes = getDom(str);
			while (nodes.firstChild) element.appendChild(nodes.firstChild);
		} else {
			element.innerHTML = str;
		}
	};

	this.getPosition = function(element, parentE) {
		parentE = exports.$(parentE) || document.body;
		element = exports.$(element);
		var rl = 0;
		var rt = 0;
		var p = element;
		//fix ie7 未指明的错误
		try {
			while (p && p != parentE) {
				rl += p.offsetLeft;
				rt += p.offsetTop;
				p = p.offsetParent;
			}
		} catch(e) {}
		return { 'left' : rl, 'top' : rt };
	};
	
	/**
	 * 获取元素的绝对左边距
	 * @method realLeft
	 * @param {HTMLElement | String} element
	 * @return {Int}
	 */
	this.realLeft = function(element, p) {
		return exports.getPosition(element, p || null).left;
	};
	
	/**
	 * 获取元素的绝对上边距
	 * @method realTop
	 * @param {HTMLElement | String} element
	 * @return {Int}
	 */
	this.realTop = function(element, p) {
		return exports.getPosition(element, p || null).top;
	};
	
	/**
	 * 直接append HTML
	 * @method appendHTML
	 * @param {String} str
	 * @return {HTMLElement}
	 */
	this.appendHTML = function(element, str, getElements) {
		element = exports.$(element);
		var f = document.createDocumentFragment();
		var t = exports.$element('div');
		t.innerHTML = str;
		while(t.firstChild)
		{
			f.appendChild(t.firstChild);
		}
		var tmp = XN.array.build(f.childNodes);
		element.appendChild(f);
		if (getElements) return tmp;
		return element;
	};

	/**
	 * 通过字符串设置此元素的内容
	 * 为兼容HTML5标签，IE下无法直接使用innerHTML
	 * @param str html代码
	 */
	this.html = function(element, str) {
		element.innerHTML = str;
	};

	/**
	 * 查找符合selector的父元素
	 * @param selector css选择符
	 */
	this.parent = function(element, selector) {
		while (element) {
			element = exports.$(element.parentNode);
			if (element.matchesSelector(selector)) return element;
		}
	};

	/**
	 * 在一个div内显示loading的图标,用于ajax动态加载数据
	 * 
	 * <pre>
	 * $('message').startLoading('loading...');
	 * </pre>
	 * @method startLoading
	 * @param {HTMLElement | String} element
	 * @param {String} msg loading时的提示信息
	 * @return {HTMLElement}
	 */
	this.startLoading = function(element, msg) {
		element = exports.$(element);
		element.innerHTML = '<center><img src=\"' + XN.env.staticRoot + 'img/indicator.gif\" />' + (msg || '加载中...') + '</center>';
		return element;
	};
	
	this.stopLoading = function(element) {
		element = exports.$(element);
		return element;
	};
	
	/**
	 * eval js in innerHTML
	 * @method eval_inner_JS
	 * @param {String | HTMLElement} el
	 */
	this.eval_inner_JS = function(el) {
		var js = exports.$(el).getElementsByTagName('script');
		XN.array.each(js, function(i, s) {
			if (s.src) {
				XN.loadFile(s.src);
			} else {
				var inner_js = '__inner_js_out_put = [];\n';
				inner_js += s.innerHTML.replace(/document\.write/g, '__inner_js_out_put.push');
				eval(inner_js);
				if (__inner_js_out_put.length !== 0) {
					var tmp = document.createDocumentFragment();
					exports.$(tmp).appendHTML(__inner_js_out_put.join(''));
					s.parentNode.insertBefore(tmp, s);
				}
			}
		});
	};
	
	this.extend = function(element) {
		var cache = exports.extend.cache;
		for (var i=0, m, len=_extends.length; i<len; i++) {
			m = _extends[i];
			if (exports[m] != null && !(m in element)) {
				element[m] = cache.findOrStore(exports[m]);
			}
		}
		return element;
	};
	
	this.extend.cache = {
	  findOrStore : function(value) {
	  	return this[value] = this[value] || function() {
	  		return value.apply(null, [this].concat(XN.array.build(arguments)));
		};
	  }		
	};

	if(browser.IE) {
		this.getStyle = function(element, style) {
		    element = exports.$(element);
		    style = (style == 'float' || style == 'cssFloat') ? 'styleFloat' : style;
		    var value = element.style[style];
		    if (!value && element.currentStyle) value = element.currentStyle[style];
		
		    if (style == 'opacity') {
				if (value = (element.getStyle('filter') || '').match(/alpha\(opacity=(.*)\)/)) {
					if (value[1]) {
						return parseFloat(value[1]) / 100;
					}
				}
				return 1.0;
		    }
		
		    if (value == 'auto') {
				if ((style == 'width' || style == 'height') && (element.getStyle('display') != 'none')) {
					return element['offset'+ (style == 'width' ? 'Width' : 'Height')] + 'px';
				}
				return null;
		    }
		    return value;			
		}
	}

    /**
     * 设置元素透明度
     * <pre>
     *  XN.element.setOpacity(el, 0.3);
     *  or
     *  $(el).setOpactiy(0.3);
     * </pre>
     * @method setOpacity
     * @param {Float} opacity
     * @return {HTMLElement}
     */
    if (document.addEventListener) {
        this.setOpacity = function(element, opacity) {
            element = exports.$(element);
            element.style.opacity = opacity;
            return element;
        };
    } else {
        this.setOpacity = function(element, opacity) {
            element = exports.$(element);
            element.style.zoom = 1;
            element.style.filter = 'Alpha(opacity=' + Math.ceil(opacity * 100) + ')';
            return element;            
        };
    }
	
	/**
	 * create an DOM element
	 * @method $element
	 * @param {String} tagName
	 * @return {HTMLElement}
	 */
	this.$element = function (tag){
		return exports.$(document.createElement(tag));
	}

	/**
	 * short cut for document.getElementById
	 * @method $
	 * @param {String} id
	 * @return {HTMLElement}
	 */
	this.$ = function (id){
		var element;
		if(id == null)
			element = null;
		else if (XN.isString(id) || XN.isNumber(id))
			element = Sizzle('#' + id)[0];
		else
			element = id;
		if(element) 
			exports.extend(element);
		return element || null;
	};
});
/**
 * @namespace XN
 * @class template
 * @static
 */
object.add('XN.template', 'XN.env', function(exports, XN) {
	/**
	 * @namespace XN.template
	 * @method mediaPlayer
	 * @param {Object} o
	 * @return {String}
	 */
	this.smediaPlayer = function( o ) {
		return [ 
		'<object classid="CLSID:22d6f312-b0f6-11d0-94ab-0080c74c7e95" width="' + (o.width || '352') + '" height="' + (o.height || '70') + '" >\n',
		'<param name="autostart" value="' + (o.autostart || '1')+'" >\n',
		'<param name="showstatusbar" value="' + (o.showstatusbar || '1')+ '">\n',
		'<param name="filename" value="'+ o.filename +'">\n',
		'<embed type="application/x-oleobject" codebase="http://activex.microsoft.com/activex/controls/mplayer/en/nsmp2inf.cab#Version=5,1,52,701" ',
		'flename="mp"',
		'autostart="' + (o.autostart || '1') + '" showstatusbar="' + (o.showstatusbar || '1') + '" ',
		'src="' + o.filename + '" width="' + (o.width || '352') + '" height="' + (o.height || '70') + '"></embed>'
		].join( '' );
	};
	
	/**
	 * @namespace XN.template
	 * @method  flashPlayer
	 * @param {Object} o
	 * @return {String}
	 */
	this.flashPlayer = function( o ) {
		return '<embed src="' + XN.env.staticRoot + '/swf/player.swf?url=' + o.filename + '&Rwid=' + (o.width || '450') + '&Autoplay=' + (o.autostart || '1')+ '" wmode="' + (o.wmode || 'transparent') +'" loop="false" menu="false" quality="high" scale="noscale" salign="lt" bgcolor="#ffffff" width="' + (o.width || '450') + '" height="' + (o.height || '30') + '" align="middle" allowScriptAccess="' + (o.allowScriptAccess || 'sameDomain') + '" allowFullScreen="false" type="application/x-shockwave-flash" pluginspage="http://www.macromedia.com/go/getflashplayer" />';
	};
	
	/**
	 * @namespace XN.template
	 * @method flash
	 * @param {Object} o
	 * @return {String}
	 */
	this.flash = function( o ) {
		return '&nbsp;<embed src="' + o.filename + '" type="application/x-shockwave-flash" ' +
		'width="' + (o.width || '320') + '" height="' + (o.height || '240') + '" allowFullScreen="true" wmode="' + (o.wmode || 'transparent') + '" allowNetworking="' + (o.allowNetworking || 'all') + '" allowScriptAccess="' + (o.allowScriptAccess || 'sameDomain') + '"></embed>';
	};
	
});
/**
 *  表单相关
 * @module form
 */

object.add('XN.form', 'sys, XN, XN.event, XN.json, XN.array, XN.element, XN.string, XN.env', function(exports, sys, XN) {

	/**
	 * 将json字符串解析并将值填入表单
	 * @method fiilWidthJSON
	 * @param {HTMLElement | String} form
	 * @param {String} json
	 */
	this.fillWithJSON = function(form, json) {
		form = XN.element.$(form);
		exports.fillWithArray(form, XN.json.parse(json));
	};


	/**
	 * 将数组填入表单
	 * @method fillWidthArray
	 * @param {HTMLElement | String} form
	 * @param {Array} a
	 */
	this.fillWithArray = function(form, a) {
		form = XN.element.$(form);
		for (var p in a) {
			exports.Element.setValue(p, a[p], form);
		}
	};

	/**
	 * 设定一个表单元素的值
	 * @method setValue
	 * @param {HTMLElement | String} element
	 * @param {Any} value
	 * @return {HTMLElement}
	 */
	this.setValue = function(element, value) {
		return exports.Element.setValue(element, value);
	};


	/**
	 * 获取一个表单元素的值
	 * @method getValue
	 * @param {HTMLElement | String} element
	 * @return {String | Boolean}
	 */
	this.getValue = function(element) {
		return exports.Element.getValue(element);
	};

	/**
	 * 序列化一个form
	 * @method serialize
	 * @param {HTMLElement | String} form
	 * @param {String} type 序列化的形式可以是'string','array','hash'
	 * @return {String | Array | Hash}
	 */
	this.serialize = function(form, type) {
		return exports.serializeElements(exports.getElements(form), type || 'string');
	};

	this.serializeElements = function(elements, type ,encode) {
		
		type = type || 'array';

		if(XN.isUndefined(encode)) {
			encode = false;
		}

		var data = [],_key,_value;

		XN.array.each(elements, function(i, v) {
			if (!v.disabled && v.name) {
				_key = v.name;
				_value = encode ? encodeURIComponent(exports.Element.getValue(v)) : exports.Element.getValue(v);
				
				if (_value !== null) {
					if (_key in data) {
						if (!XN.isArray(data[_key])) { data[_key] = [data[_key]]; }
						data[_key].push(_value);
					} else {
						data[_key] = _value;
					}
				}
			}        
		});
		
		if (type == 'array') {
			return data;
		} else if (type == 'string') {
			return XN.array.toQueryString(data);
		} else if(type == 'hash') {
			var tmp = {};
			for (var p in data) {
				if (!XN.isFunction(data[p])) {
					tmp[p] = data[p];
				}
			}
			return tmp;
		}
		//return options.hash ? data : Object.toQueryString(data);
	};


	this.getElements = function(form) {
		form = XN.element.$(form);
		var elements = [];
		var all = form.getElementsByTagName('*');
		
		XN.array.each(all, function(i, v) {
			if (!XN.isUndefined(exports.Element.Serializers[v.tagName.toLowerCase()])) {
				elements.push(v);
			}        
		});

		return elements;
	};


	this.Element = {

		getValue : function(element) {
			element = XN.element.$(element);
			var method = element.tagName.toLowerCase();
			return exports.Element.Serializers[method](element);
		},

		setValue: function(element, value,form) {
			if (form)  {
				element = form[element];
				if ((XN.isElement(element) && element.tagName.toLowerCase() == 'select')) {
					exports.Element.Serializers['select'](element, value);
				} else if(XN.isElement(element)) {
					exports.Element.Serializers[element.tagName.toLowerCase()](element, value);
				} else if(element[0]) {
					var method = element[0].tagName.toLowerCase();
					for (var i = 0,j = element.length;i < j;i++) {
						exports.Element.Serializers[method](element[i], (value[i] || value || ''));
					}
				}
				return element;
			} else {
				element = XN.element.$(element);
				var method = element.tagName.toLowerCase();
				exports.Element.Serializers[method](element, value);
				return element;
			}
		}
	};

	this.Element.Serializers = {
		input : function(element, value) {
			switch (element.type.toLowerCase()) {
				case 'checkbox':
				case 'radio':
					return exports.Element.Serializers.inputSelector(element, value);
				default:
					return exports.Element.Serializers.textarea(element, value);
			}
		},
		
		inputSelector : function(element, value) {
			if (XN.isUndefined(value))  {
				return element.checked ? element.value : null;
			} else {
				element.checked = !!value;
			}
		},

		textarea : function(element, value) {
			if (XN.isUndefined(value)) { 
				return element.value; 
			} else { 
				element.value = value; 
			}
		},

		select : function(element, index) {
			if (XN.isUndefined(index)) {
				return this[element.type == 'select-one' ? 'selectOne' : 'selectMany'](element);
			} else {
				var opt, value, single = !XN.isArray(index);
				for (var i = 0, length = element.length; i < length; i++) {
					opt = element.options[i];
					value = this.optionValue(opt);
					if (single) {
						if (value == index) {
							opt.selected = true;
							return;
						}
					} else { 
						opt.selected = XN.array.include(index ,value);
					}
				}
			}
		},

		selectOne : function(element) {
			var index = element.selectedIndex;
			return index >= 0 ? this.optionValue(element.options[index]) : null;
		},

		selectMany : function(element) {
			var values = [], length = element.length;
			if (!length) {return null;}

			for (var i = 0; i < length; i++) {
				var opt = element.options[i];
				if (opt.selected) {
					values.push(this.optionValue(opt));
				}
			}
			return values;
		},

		optionValue : function(opt) {
			return opt.value || opt.text;
		}
	};

	/*
	 * patch for old version
	 */
	$F = function(id, type) {
		var el = XN.element.$(id);
		if (el.tagName.toLowerCase() == 'form') {
			return exports.serialize(el, type);
		} else {
			return exports.getValue(el);
		}
	};
	/*
	 * patch end
	 */

	this._helper = function(el) {
		el = XN.element.$(el);
		try {
			if (el._helper) return el._helper;
		} catch(e) {
			console.log(arguments.callee.caller);
		}
		el._helper = this;
		this.element = el;
	};

	this._helper.prototype = {	
		maxSize : 9999,
		limit : function(max, cut) {
			var This = this;
			this.maxLength = max;
			if (XN.isUndefined(cut)) {
				cut = true; 
			}
			this._limit_cut = cut;
			if (this._limit) {
				return this;
			}
			this._limit = true;

			var el = this.element;

			XN.event.addEvent(el, 'focus', check);
			XN.event.addEvent(el, 'keyup', check);

			function check() {
				This.limitCheck();
			}

			return this;
		},
		
		limitCheck : function() {
			var This = this;
			var el = this.element;
			//fix bug for ie 可能会闪屏
			setTimeout(function() {
				var v = el.value;
				if (v.length > This.maxLength) {
					if (This._limit_cut) el.value = v.substr(0, This.maxLength);
					This.fireEvent('overmaxLength');
				} else {
					This.fireEvent('normalLength');
				}
				
				This.fireEvent('checkover');
			}, 0);
		},

		count : function(show, showMax) {
			if (this._count) {
				return this;
			}
			this._count = true;

			var This = this, show = XN.element.$(show);
			if (XN.isUndefined(showMax)) {
				showMax = true;
			}
			if (!this.maxLength) {
				showMax = false;
			}

			var el = this.element;
			
			this.addEvent('overmaxLength', function() {
				show.addClass('full');
			});

			this.addEvent('normalLength', function() {
				show.delClass('full');
			});

			this.addEvent('checkover', update);

			function update() {
				show.innerHTML = el.value.length  + (showMax ? '/' + This.maxLength : '');
			}

			return this;
		},

		countSize : function(show, max, showMax) {
			return this.limit(max).count(show, showMax);
		},

		getRealValue : function() {
			var el = this.element;
			if (el.value == this._defaultValue || el.value == el.getAttribute('placeholder')) {
				return '';
			}
			return el.value;
		},

		reloadDefaultValue : function() {
			this.element.value = this._defaultValue;
			this.element.style.color = '#888';
		},

		defaultValue : function(v) {
			var This = this;
			var el = this.element;
			v = v || el.value;

			if (!XN.isUndefined(this._defaultValue) && el.value == this._defaultValue) {
				el.value = v;
			}
			
			this._defaultValue = v;
			
			if (this._default) {
				return this;
			}
			this._default = true;
			
			if (document.activeElement !== el) {
				el.value = v;
			}
			
			el.style.color = '#888';

			XN.event.addEvent(el, 'focus', function() {
				if (el.value == This._defaultValue) {
					el.value = '';
					el.style.color = '#333';
				}
			});

			XN.event.addEvent(el, 'blur', function() {
				if (el.value == '') {
					el.value = This._defaultValue;
					el.style.color = '#888';
				}
			});

			return this;
		},
		
		focus : function(position) {
			var el = this.element;
			if (XN.isUndefined(position)) {
				position = el.value.length;
			}
			try{
			if (el.setSelectionRange) {
				el.focus();
				el.setSelectionRange(el.value.length, position);
			} else if(el.createTextRange) {
				var range = el.createTextRange();
				range.moveStart('character', position);
				range.collapse(true);
				range.select();
				el.focus();
			} else {
				el.focus();
			}
			}catch(e){}

			return this;
		},

		onEnter : function(callBack) {
			var el = this.element;
			var isTextArea = el.tagName.toLowerCase() == 'textarea';
			
			XN.event.addEvent(el, 'keydown', function(e) {
				e = e || window.event;
				if(e.keyCode == 13) {
					if(isTextArea && !e.ctrlKey) {
						return false;
					}
					XN.event.stop(e);
					callBack(el);
					return false;
				}
			}, false);

			return this;
		},
		
		onEsc : function(callBack) {
			var el = this.element;
			XN.event.addEvent(el, 'keydown', function(e) {
				e = e || window.event;
				if (e.keyCode == 27) {
					XN.event.stop(e);
					callBack(el);
					return false;
				}
			}, false);
			return this;		
		},

		autoResize : function(min, max) {
			var This = this, el = this.element, type;
			this.minSize = min || this.minSize;
			this.maxSize = max || this.maxSize;
			//this.type = type;
			
			if (el.tagName.toLowerCase() == 'textarea') {
				this.resizeType = 'height';
			} else {
				this.resizeType = 'width';
			}

			if (!exports.inputShadow) {
				var d = XN.element.$element('div');
				d.setStyle('position:absolute;left:-99999px;top:-99999px');
				document.body.appendChild(d);
				exports.inputShadow = d;
			}

			this.shadow = exports.inputShadow;
			
			//延时等待渲染
			setTimeout(function() {
				if(min) {
					return;
				}
				This.minSize = type == 'width' ? el.offsetWidth : el.offsetHeight;
			}, 10);

			el.style.overflow = 'hidden';
			
			/*if (XN.browser.IE)
			{
				el.style.fontSize = '12px';
				el.style.fontFamily = "'lucida grande',tahoma,verdana,arial,simsun,sans-serif";
			}*/

			XN.event.addEvent(el, 'focus', function() {
				This.timer = setInterval(This._resize.bind(This), 200);
			});

			XN.event.addEvent(el, 'blur', function() {
				clearInterval(This.timer);
				This.timer = null;
			});
			
			return this;
		},
		
		_resize : function() {
			var el = this.element, sh = this.shadow, oh, type = this.resizeType;
			sh.style.fontSize = el.getStyle('fontSize');
			var fs = parseInt(el.getStyle('fontSize'), 0);
			sh.style.fontFamily = el.getStyle('fontFamily');
			(type == 'width') ? sh.style.height = el.offsetHeight : sh.style.width = el.offsetWidth;
			sh.innerHTML = XN.string.escapeHTML(el.value).replace(/\r\n/mg,'<br>').replace(/\r/mg,'<br>').replace(/\n/mg,'<br>');
			
			(type == 'width') ? oh = sh.offsetWidth : oh = sh.offsetHeight + fs + 3;
			if (oh > this.minSize && oh < this.maxSize) {
				el.style[type] = oh + 'px';
			} else if(oh < this.minSize) {
				el.style[type] = this.minSize + 'px';
			} else if(oh > this.maxSize) {
				el.style[type] = this.maxSize + 'px';
			}
		},

		cursorPosition : function() {
			var textBox = this.element;
			var start = 0, end = 0;
			
			try{ 
			
			/* typeof(textBox.selectionStart) == 'number' 这句有时候会报错：
			uncaught exception: [Exception... "Component returned failure code: 0x80004005 (NS_ERROR_FAILURE) [nsIDOMHTMLTextAreaElement.selectionStart]"  nsresult: "0x80004005 (NS_ERROR_FAILURE)"  location: "JS frame :: http://s.xnimg.cn/a26900/n/core/base-all.js :: <TOP_LEVEL> :: line 6587"  data: no]
http://s.xnimg.cn/a27011/n/apps/home/compatible/home.js
Line 3678，
			还没查清楚原因 2011.10.25 传业注 */
			
			if (typeof(textBox.selectionStart) == 'number') {
				start = textBox.selectionStart;
				end = textBox.selectionEnd;
			} else if (document.selection) {
				var range = document.selection.createRange();
				if (range.parentElement() == textBox) {
					var range_all = document.body.createTextRange();
					range_all.moveToElementText(textBox);
					
					for (start=0; range_all.compareEndPoints('StartToStart', range) < 0; start++) {
						range_all.moveStart('character', 1);
					}
					
					for (var i = 0; i <= start; i ++) {
						if (textBox.value.charAt(i) == '\n') {
							start++;
						}
					}
					
					var range_all = document.body.createTextRange();
					
					range_all.moveToElementText(textBox);
					
					for (end = 0; range_all.compareEndPoints('StartToEnd', range) < 0; end ++) {
						range_all.moveStart('character', 1);
					}
					
					for (var i = 0; i <= end; i ++) {
						if (textBox.value.charAt(i) == '\n') {
							end ++;
						}
					}
				}
			}
			
			} catch(e){}
			
			return {"start": start, "end": end, "item": [start, end]};
		}
	};

	this._helper.prototype.setDefaultValue = this._helper.prototype.defaultValue;
	XN.event.enableCustomEvent(this._helper.prototype);

	this.help = function(id) {
		return new exports._helper(id);
	}

	//patch for old method
	this.inputHelper = this.textAreaHelper = this.help;
	$CursorPosition = function(el) { 
		return exports.help(el).cursorPosition(); 
	};

	// Compatible
	this.userInfoAutoComplete = function(id,type) {
		var _ui = sys.modules['XN.ui'];
		if (_ui) {
			return _ui.userInfoAutoComplete(id, type);
		} else {
			throw new Error('请在use中导入XN.ui模块，才可使用XN.form下的此方法');
		}
	};

});
/**
 * effect
 * @class effect
 * @namespace XN
 * @static
 */
object.add('XN.effect', 'XN.func, XN.element, XN.event', function(exports, XN) {

	this.fadeIn = function(element, callBack) {
		if(element.fadetimer) {
			return;
		}
		callBack = callBack || XN.func.empty;
		var op = 0;
		element.setOpacity(0);
		element.style.display = '';
		element.fadetimer = setInterval(function() {
            XN.element.setOpacity(element,(op += 0.20));
            if(op >= 1) {
                clearInterval(element.fadetimer);
                element.fadetimer = null;
                callBack(element);
            }
		},60);
	};
	
	this.fadeOut = function(element, callBack) {
		if(element.fadetimer) {
			return;
		}
		callBack = callBack || XN.func.empty; 
		var op =1;
		element.setOpacity(1);
		element.fadetimer = setInterval(function() {
            XN.element.setOpacity(element,(op -= 0.20));
            if(op <= 0) {
                clearInterval(element.fadetimer);
                element.fadetimer = null;
                callBack(element);
                element.setOpacity(1);
            }
        },60);		
	};
	
	this.gradient = function(element, r, g, b, callBack) {
		if(element.gradientTimer) {
			return;
		}
		callBack = callBack || XN.func.empty;
		element.style.backgroundColor = '#fff';
		element.style.backgroundColor = 'rgb(' + r + ',' + g + ',' + b + ')';
		element.gradientTimer = setInterval(function() {
			b += 10;
			element.style.backgroundColor = 'rgb(' + r + ',' + g + ',' + (b >255 ? 255 : b) + ')';
			if(b > 255) {
				clearInterval(element.gradientTimer);
				element.gradientTimer = null;
				callBack(element);
			}
		},60);
	};
	
	this.slideOpen = function(element) {
		if(element.slidetimer) {
			return;
		}
		if(!element.slideHeight) {
			var _position = element.getStyle('position');
			element.setStyle('position:absolute;left:-99999px;top:-99999px;');
			element.show();
			element.slideHeight = element.offsetHeight;
			element.hide();
			element.setStyle('position:' + _position + ';left:auto;top:auto;');
		}
		var eh = element.slideHeight,h = 0;
		var step = parseInt(eh / 10);
		element.style.height = '0px';
		element.style.display = '';
		element.style.overflow = 'hidden';
		element.slidetimer = setInterval(function() {
			element.style.height = (h += step) + 'px';
			if(h >= eh) {
				clearInterval(element.slidetimer);
				element.slidetimer = null;
				element.style.height = eh;
				element.style.overflow = element.slideOverflow;
			}
		},50);
	};
	
	this.slideClose = function(element) {
		if(element.slidetimer) {
			return;
		}
		var eh = element.offsetHeight,h = eh;
		element.slideHeight = eh;
		element.slideOverflow = element.getStyle('overflow');
		element.style.overflow = 'hidden';
		var step = parseInt(eh / 10);
		element.slidetimer = setInterval(function() {
			element.style.height = (h -= step) + 'px';
			if(h <= 0) {
				clearInterval(element.slidetimer);
				element.slidetimer = null;
				element.style.display = 'none';
				element.style.height = eh;
				element.style.overflow = element.slideOverflow;
			}
		},50);
	};
	
	this.scrollTo = function(element, speed, callBack) {
		if(element.scrolltimer) {
			return;
		}
		speed = speed || 10;
		callBack = callBack || XN.func.empty;
		var d = element.realTop();
		var i = XN.event.winHeight();
		var h = document.body.scrollHeight;
		var a = XN.event.scrollTop();;
		var offsetTop = null;
		if(d > a) {
			if(d + element.offsetHeight < i + a)return;
			element.scrolltimer = setInterval(function() {
				a += Math.ceil((d-a) / speed) || 1;
				window.scrollTo(0,a);
			  	if(a == d) {
					clearInterval(element.scrolltimer);
					element.scrolltimer = null;
				}
			},10);
		} else {
			element.scrolltimer = setInterval(function() {
				a += Math.ceil((d-a) / speed) || -1;
				window.scrollTo(0,a);
			  	if(a == d) {
					clearInterval(element.scrolltimer);
					element.scrolltimer = null;
				}
			},10);
		}
	};
	
	/**
	 * Motion - 动画组件
	 *
	 * @author  mingcheng<i.feelinglucky@gmail.com>
	 * @since   2009-01-26
	 * @link    http://www.gracecode.com/
	 * @version $Id: motion.js 217 2009-04-06 03:49:08Z i.feelinglucky $
	 *
	 * @change
	 *     [+]new feature  [*]improvement  [!]change  [x]bug fix
	 *
	 * [*] 2009-04-05
	 *      优化对象接口
	 *
	 * [*] 2009-04-05
	 *      优化 customEvent；增强动画函数判断，使其支持自定义函数
	 *
	 * [*] 2009-03-30
	 *      增加 customEvent 函数，优化逻辑
	 *
	 * [!] 2009-02-01
	 *      将 setTimeout 改成了 setInterval ，详见 http://ejohn.org/blog/how-javascript-timers-work/
	 *
	 * [*] 2009-01-27
	 *      调整接口，优化代码
	 *
	 * [+] 2009-01-26
	 *      最初版，完成基本功能
	 */
	(function(scope) {
		/**
		 * Easing Equations
		 *
		 * @see http://developer.yahoo.com/yui/animation/
		 * @see http://www.robertpenner.com/profmx
		 * @see http://hikejun.com/demo/yui-base/yui_2x_animation.html
		 */
		var Tween = {
			linear: function (t, b, c, d) {
				return c*t/d + b;
			},

			easeIn: function (t, b, c, d) {
				return c*(t/=d)*t + b;
			},

			easeOut: function (t, b, c, d) {
				return -c *(t/=d)*(t-2) + b;
			},

			easeBoth: function (t, b, c, d) {
				if ((t/=d/2) < 1) {
					return c/2*t*t + b;
				}
				return -c/2 * ((--t)*(t-2) - 1) + b;
			},
			
			easeInStrong: function (t, b, c, d) {
				return c*(t/=d)*t*t*t + b;
			},
			
			easeOutStrong: function (t, b, c, d) {
				return -c * ((t=t/d-1)*t*t*t - 1) + b;
			},
			
			easeBothStrong: function (t, b, c, d) {
				if ((t/=d/2) < 1) {
					return c/2*t*t*t*t + b;
				}
				return -c/2 * ((t-=2)*t*t*t - 2) + b;
			},

			elasticIn: function (t, b, c, d, a, p) {
				if (t === 0) { 
					return b; 
				}
				if ((t /= d) == 1) {
					return b+c; 
				}
				if (!p) {
					p=d*0.3; 
				}
				if (!a || a < Math.abs(c)) {
					a = c; 
					var s = p/4;
				} else {
					var s = p/(2*Math.PI) * Math.asin (c/a);
				}
				return -(a*Math.pow(2,10*(t-=1)) * Math.sin((t*d-s)*(2*Math.PI)/p)) + b;
			},

			elasticOut: function (t, b, c, d, a, p) {
				if (t === 0) {
					return b;
				}
				if ((t /= d) == 1) {
					return b+c;
				}
				if (!p) {
					p=d*0.3;
				}
				if (!a || a < Math.abs(c)) {
					a = c;
					var s = p / 4;
				} else {
					var s = p/(2*Math.PI) * Math.asin (c/a);
				}
				return a*Math.pow(2,-10*t) * Math.sin((t*d-s)*(2*Math.PI)/p) + c + b;
			},
			
			elasticBoth: function (t, b, c, d, a, p) {
				if (t === 0) {
					return b;
				}
				if ((t /= d/2) == 2) {
					return b+c;
				}
				if (!p) {
					p = d*(0.3*1.5);
				}
				if (!a || a < Math.abs(c)) {
					a = c; 
					var s = p/4;
				}
				else {
					var s = p/(2*Math.PI) * Math.asin (c/a);
				}
				if (t < 1) {
					return - 0.5*(a*Math.pow(2,10*(t-=1)) * 
							Math.sin((t*d-s)*(2*Math.PI)/p)) + b;
				}
				return a*Math.pow(2,-10*(t-=1)) * 
						Math.sin((t*d-s)*(2*Math.PI)/p)*0.5 + c + b;
			},

			backIn: function (t, b, c, d, s) {
				if (typeof s == 'undefined') {
				   s = 1.70158;
				}
				return c*(t/=d)*t*((s+1)*t - s) + b;
			},

			backOut: function (t, b, c, d, s) {
				if (typeof s == 'undefined') {
					s = 1.70158;
				}
				return c*((t=t/d-1)*t*((s+1)*t + s) + 1) + b;
			},
			
			backBoth: function (t, b, c, d, s) {
				if (typeof s == 'undefined') {
					s = 1.70158; 
				}
				if ((t /= d/2) < 1) {
					return c/2*(t*t*(((s*=(1.525))+1)*t - s)) + b;
				}
				return c/2*((t-=2)*t*(((s*=(1.525))+1)*t + s) + 2) + b;
			},

			bounceIn: function (t, b, c, d) {
				return c - Tween['bounceOut'](d-t, 0, c, d) + b;
			},
			
			bounceOut: function (t, b, c, d) {
				if ((t/=d) < (1/2.75)) {
					return c*(7.5625*t*t) + b;
				} else if (t < (2/2.75)) {
					return c*(7.5625*(t-=(1.5/2.75))*t + 0.75) + b;
				} else if (t < (2.5/2.75)) {
					return c*(7.5625*(t-=(2.25/2.75))*t + 0.9375) + b;
				}
				return c*(7.5625*(t-=(2.625/2.75))*t + 0.984375) + b;
			},
			
			bounceBoth: function (t, b, c, d) {
				if (t < d/2) {
					return Tween['bounceIn'](t*2, 0, c, d) * 0.5 + b;
				}
				return Tween['bounceOut'](t*2-d, 0, c, d) * 0.5 + c*0.5 + b;
			} /* ,

			// extra, form http://hikejun.com/demo/yui-base/yui_2x_animation.html
			easeInQuad: function (t, b, c, d) {
				return c*(t/=d)*t + b;
			},

			easeOutQuad: function (t, b, c, d) {
				return -c *(t/=d)*(t-2) + b;
			},

			easeInOutQuad: function (t, b, c, d) {
				if ((t/=d/2) < 1) return c/2*t*t + b;
				return -c/2 * ((--t)*(t-2) - 1) + b;
			},

			easeInCubic: function (t, b, c, d) {
				return c*(t/=d)*t*t + b;
			},

			easeOutCubic: function (t, b, c, d) {
				return c*((t=t/d-1)*t*t + 1) + b;
			},

			easeInOutCubic: function (t, b, c, d) {
				if ((t/=d/2) < 1) return c/2*t*t*t + b;
				return c/2*((t-=2)*t*t + 2) + b;
			},

			easeInQuart: function (t, b, c, d) {
				return c*(t/=d)*t*t*t + b;
			},

			easeOutQuart: function (t, b, c, d) {
				return -c * ((t=t/d-1)*t*t*t - 1) + b;
			},

			easeInOutQuart: function (t, b, c, d) {
				if ((t/=d/2) < 1) return c/2*t*t*t*t + b;
				return -c/2 * ((t-=2)*t*t*t - 2) + b;
			},

			easeInQuint: function (t, b, c, d) {
				return c*(t/=d)*t*t*t*t + b;
			},

			easeOutQuint: function (t, b, c, d) {
				return c*((t=t/d-1)*t*t*t*t + 1) + b;
			},

			easeInOutQuint: function (t, b, c, d) {
				if ((t/=d/2) < 1) return c/2*t*t*t*t*t + b;
				return c/2*((t-=2)*t*t*t*t + 2) + b;
			},

			easeInSine: function (t, b, c, d) {
				return -c * Math.cos(t/d * (Math.PI/2)) + c + b;
			},

			easeOutSine: function (t, b, c, d) {
				return c * Math.sin(t/d * (Math.PI/2)) + b;
			},

			easeInOutSine: function (t, b, c, d) {
				return -c/2 * (Math.cos(Math.PI*t/d) - 1) + b;
			},

			easeInExpo: function (t, b, c, d) {
				return (t===0) ? b : c * Math.pow(2, 10 * (t/d - 1)) + b;
			},

			easeOutExpo: function (t, b, c, d) {
				return (t==d) ? b+c : c * (-Math.pow(2, -10 * t/d) + 1) + b;
			},

			easeInOutExpo: function (t, b, c, d) {
				if (t===0) return b;
				if (t==d) return b+c;
				if ((t/=d/2) < 1) return c/2 * Math.pow(2, 10 * (t - 1)) + b;
				return c/2 * (-Math.pow(2, -10 * --t) + 2) + b;
			},

			easeInCirc: function (t, b, c, d) {
				return -c * (Math.sqrt(1 - (t/=d)*t) - 1) + b;
			},

			easeOutCirc: function (t, b, c, d) {
				return c * Math.sqrt(1 - (t=t/d-1)*t) + b;
			},

			easeInOutCirc: function (t, b, c, d) {
				if ((t/=d/2) < 1) return -c/2 * (Math.sqrt(1 - t*t) - 1) + b;
				return c/2 * (Math.sqrt(1 - (t-=2)*t) + 1) + b;
			},

			easeInElastic: function (t, b, c, d) {
				var s=1.70158;var p=0;var a=c;
				if (t===0) return b;  if ((t/=d)==1) return b+c;  if (!p) p=d*0.3;
				if (a < Math.abs(c)) { a=c; var s=p/4; }
				else var s = p/(2*Math.PI) * Math.asin (c/a);
				return -(a*Math.pow(2,10*(t-=1)) * Math.sin((t*d-s)*(2*Math.PI)/p)) + b;
			},

			easeOutElastic: function (t, b, c, d) {
				var s=1.70158;var p=0;var a=c;
				if (t===0) return b;  if ((t/=d)==1) return b+c;  if (!p) p=d*0.3;
				if (a < Math.abs(c)) { a=c; var s=p/4; }
				else var s = p/(2*Math.PI) * Math.asin (c/a);
				return a*Math.pow(2,-10*t) * Math.sin((t*d-s)*(2*Math.PI)/p) + c + b;
			},

			easeInOutElastic: function (t, b, c, d) {
				var s=1.70158;var p=0;var a=c;
				if (t===0) return b;  if ((t/=d/2)==2) return b+c;  if (!p) p=d*(0.3*1.5);
				if (a < Math.abs(c)) { a=c; var s=p/4; }
				else var s = p/(2*Math.PI) * Math.asin (c/a);
				if (t < 1) return -0.5*(a*Math.pow(2,10*(t-=1)) * Math.sin((t*d-s)*(2*Math.PI)/p)) + b;
				return a*Math.pow(2,-10*(t-=1)) * Math.sin((t*d-s)*(2*Math.PI)/p)*0.5 + c + b;
			},

			easeInBack: function (t, b, c, d, s) {
				if (s == undefined) s = 1.70158;
				return c*(t/=d)*t*((s+1)*t - s) + b;
			},

			easeOutBack: function (t, b, c, d, s) {
				if (s == undefined) s = 1.70158;
				return c*((t=t/d-1)*t*((s+1)*t + s) + 1) + b;
			},

			easeInOutBack: function (t, b, c, d, s) {
				if (s == undefined) s = 1.70158; 
				if ((t/=d/2) < 1) return c/2*(t*t*(((s*=(1.525))+1)*t - s)) + b;
				return c/2*((t-=2)*t*(((s*=(1.525))+1)*t + s) + 2) + b;
			},

			easeInBounce: function (t, b, c, d) {
				return c - Tween['easeOutBounce'](d-t, 0, c, d) + b;
			},

			easeOutBounce: function (t, b, c, d) {
				if ((t/=d) < (1/2.75)) {
					return c*(7.5625*t*t) + b;
				} else if (t < (2/2.75)) {
					return c*(7.5625*(t-=(1.5/2.75))*t + 0.75) + b;
				} else if (t < (2.5/2.75)) {
					return c*(7.5625*(t-=(2.25/2.75))*t + 0.9375) + b;
				} else {
					return c*(7.5625*(t-=(2.625/2.75))*t + 0.984375) + b;
				}
			},

			easeInOutBounce: function (t, b, c, d) {
				if (t < d/2) return Tween['easeInBounce'](t*2, 0, c, d) * 0.5 + b;
				return Tween['easeOutBounce'](t*2-d, 0, c, d) * 0.5 + c*0.5 + b;
			}
			*/
		};

		// 动画行进中
		var _Tweening = function() {
			// 动画进行时的回调
			customEvent(this.onTweening, this);

			if (this.current >= this.frames) {
				this.stop();
				customEvent(this.onComplete, this);
				this.tweening = false;
				return;
			}

			this.current++;
		};

		/**
		 * 自定义事件
		 * 
		 * @params {Function} 事件回调
		 * @params {Object} 作用域
		 */
		var customEvent = function(func, scope) {
			var args = Array.prototype.slice.call(arguments);
				args = args.slice(2);
			if (typeof func == 'function') {
				try {
					return func.apply(scope || this, args);
				} catch (e) {
					scope.errors = scope.errors || [];
					scope.errors.push(e);
				}
			}
		};

		/**
		 * 动画组件
		 *
		 * @params {String} 动画类型（方程式）
		 * @params {Number} 过程动画时间
		 */
		scope.Motion = function(tween, duration) {
			this.duration = duration || 1000;
			this.tween = tween || 'linear';
		};

		// 返回动画公式
		scope.Motion.getTweens = function() {return Tween};

		// 原型继承
		scope.Motion.prototype = {
			// 初始化
			init: function() {
				customEvent(this.onInit, this);

				// 默认 35 FPS
				this.fps = this.fps || 35;

				// 计算帧数
				this.frames = Math.ceil((this.duration/1000)*this.fps);
				if (this.frames < 1) this.frames = 1;

				// 确定动画函数，便于计算当前位置
				var f = ('function' == typeof this.tween) ? this.tween : Tween[this.tween] || Tween['linear'];
				this.equation = function(from, to) {
					return f((this.current/this.frames)*this.duration, from, to - from, this.duration);
				};
				this.current = this.tweening = 1;
			},

			//  开始动画
			start: function() {
				this.init();
				customEvent(this.onStart, this);
				var _self = this, d = this.duration / this.frames;
				this.timer = setInterval(function() {_Tweening.call(_self);}, d);
			},

			// 停止动画
			stop: function() {
				if (this.timer) {
					clearInterval(this.timer);
				}
				this.tweening = false;
			}
		};
	})(exports);

});
/**
 * @namespace XN
 * @class ui
 * @static
 */
object.add('XN.ui', 'XN, XN.array, XN.element, XN.event, XN.browser, XN.util, XN.dom, XN.func, XN.string, XN.env, XN.net, XN.json, XN.form, XN.datasource', function(exports, XN) {

	(function() {
		/**
		 * @namespace XN.ui
		 * @class element
		 * @static
		 */		
		exports.element = {
			
			/**
			 *  the  frame element
			 *  @property frame
			 *  @type {HTMLElement}
			 */
			frame : null,
			
			/**
			 * @property iAmUIelement
			 * @protected
			 * @type {Boolean}
			 * @default true
			 */
			iAmUIelement : true
			
		};

		/**
		 * @method show
		 * @see XN.element.show
		 */
		
		/**
		 * @method hide
		 * @see XN.element.hide
		 */
		
		/**
		 * @method remove
		 * @see XN.element.remove
		 */
		
		/**
		 * @method addClass
		 * @see XN.element.addClass
		 */
		
		/**
		 * @method deClass
		 * @see XN.element.delClass
		 */		
		XN.array.each(['addClass', 'delClass', 'show', 'hide', 'remove'], function(i, v) {
			exports.element[v] = function() {
				XN.element[v].apply(null, [this.frame].concat(XN.array.build(arguments)));
			}
		});

		/**
		 * @namespace XN.ui
		 * @class container
		 * @static
		 * @extends XN.ui.element
		 */		
		exports.container = {
			
			/**
			 * @property container
			 * @type {HTMLElement}
			 */
			container : null
		};
		
		/**
		 * @method addChild
		 * @see XN.element.addChild
		 */
		
		/**
		 * @method delChild
		 * @see XN.element.deChild
		 */
		
		/**
		 * @method setContent
		 * @see XN.element.setContent
		 */		
		XN.array.each(['addChild', 'delChild', 'setContent'], function(i, v) {
			exports.container[v] = function() {
				XN.element[v].apply(null, [this.container].concat(XN.array.build(arguments)));
			}
		});
		
		XN.$extend(exports.container, exports.element);
		
	})();


	this.Element = this.element;
	this.Content = this.container;

	(function(ns) {
		var UI = exports;
		var addEvent = XN.event.addEvent;
		var DEBUG = true;
		
		function log(s) {
			if (DEBUG) XN.log(XN.isString(s) ? 'xn.ui.button:' + s : s);
		}

		/**
		 * create a button
		 * @namespace XN.ui
		 * @class button
		 * @constructor
		 * @param  {Object} params The intial Attribute.
		 * @extends XN.ui.element
		 */		
		ns.button = function(params) {
			XN.$extend(this, params);
			this.init();
		};

		ns.button.prototype = XN.$extend({}, UI.Element);
		
		/**
		 * the title of the button
		 * @property text
		 * @type String
		 */		
		ns.button.prototype.text = null;
		
		/**
		 *	the className of the button
		 * @property className
		 * @type String
		 * @default 'input-submit'
		 */
		ns.button.prototype.className = '';
		
		/**
		 *  the disable class of the button
		 *  @property disableClassName
		 *  @type String
		 *  @default 'gray'
		 */		
		ns.button.prototype.disableClassName = 'gray';
		
		
		/**
		 * init
		 * @private
		 */		
		ns.button.prototype.init = function() {
			var This = this;

			var el;

			if (this.getConfig('el')) {
				el = XN.element.$(this.getConfig('el'));
			} else {
				el = XN.element.$element('input');
			}
			
			this.frame = el;
			el.type = 'button';
			this.addClass('input-submit');	
			this.addClass(this.getConfig('className'));
			this.setText(this.getConfig('text'));
			
			addEvent(el, 'click', function() {
				if (This.onclick) This.onclick();
			}, false);		
		};
		
		/**
		 * get user config
		 * @param {String} key
		 * @method getConfig
		 * @return {Any}
		 */		
		ns.button.prototype.getConfig = function(key) {
			if (key == 'el') return this.id;
			return this[key];
		};
		
		/**
		 * get dom element of the button
		 * @method getEl 
		 * @return {HTMLElement}
		 */		
		ns.button.prototype.getEl = function() {
			return this.frame;
		};
		/**
		 * set title of the button
		 * @method setText 
		 * @param {String} text
		 */		
		ns.button.prototype.setText = function(text) {
			this.text = text;
			this.getEl().value = text;
		};
		
		/**
		 * disable the button
		 * @method disable
		 */		
		ns.button.prototype.disable = function() {
			var el = this.getEl();
			el.blur();
			el.disabled = true;
			el.addClass(this.getConfig('disableClassName'));
		};

		/**
		 *  enable the button
		 *	@method enable
		 */		
		ns.button.prototype.enable = function() {
			var el = this.getEl();
			el.disabled = false;
			el.delClass(this.getConfig('disableClassName'));
		};

		/**
		 *  focus on the button
		 *  @method focus
		 */				
		ns.button.prototype.focus = function() {
			this.getEl().focus();
		};
		
		/**
		 *  make the button blur
		 *  @method blur
		 */
		ns.button.prototype.blur = function() {
			this.getEl().blur();
		};

	})(this);
	
	(function() {
		var rl = 'realLeft',rt = 'realTop',ow = 'offsetWidth',oh = 'offsetHeight';
		exports.fixPositionMethods = {
			'1-1':function(f,el,x,y,p) {
				f.style.left = x + el[rl]() - p[rl]() + 'px';
				f.style.top = y + el[rt]() - p[rt]() + 'px';
			},
			'1-2':function(f,el,x,y,p) {
				f.style.left = x + el[rl]() - p[rl]() - f[ow] + 'px';
				f.style.top = y + el[rt]() - p[rt]()  + 'px';
			},
			'1-3':function(f,el,x,y,p) {
				f.style.left = x + el[rl]() - p[rl]() - f[ow] + 'px';
				f.style.top = y + el[rt]() - p[rt]() - f[oh] + 'px';
			},
			'1-4':function(f,el,x,y,p) {
				f.style.left = x + el[rl]() - p[rl]() + 'px';
				f.style.top = y + el[rt]() - p[rt]()  - f[oh] + 'px';
			},
			'2-1':function(f,el,x,y,p) {
				f.style.left = x + el[rl]() - p[rl]() + el[ow] + 'px';
				f.style.top = y + el[rt]() - p[rt]()  + 'px';
			},
			'2-2':function(f,el,x,y,p) {
				f.style.left = x + el[rl]() - p[rl]() + el[ow] - f[ow] + 'px';
				f.style.top = y + el[rt]() - p[rt]() + 'px';
			},
			'2-3':function(f,el,x,y,p) {
				f.style.left = x + el[rl]() - p[rl]() + el[ow] - f[ow] + 'px';
				f.style.top = y + el[rt]() - p[rt]()  - f[oh] + 'px';
			},
			'2-4':function(f,el,x,y,p) {
				f.style.left = x + el[rl]() - p[rl]() + el[ow] + 'px';
				f.style.top = y + el[rt]() - p[rt]()  - f[oh] + 'px';
			},
			'3-1':function(f,el,x,y,p) {
				f.style.left = x + el[rl]() - p[rl]() + el[ow] + 'px';
				f.style.top = y + el[rt]() - p[rt]() + el[oh] + 'px';
			},
			'3-2':function(f,el,x,y,p) {
				f.style.left = x + el[rl]() - p[rl]() + el[ow] - f[ow] + 'px';
				f.style.top = y + el[rt]() + el[oh] + 'px';
			},
			'3-3':function(f,el,x,y,p) {
				f.style.left = x + el[rl]() - p[rl]() + el[ow] - f[ow] + 'px';
				f.style.top = y + el[rt]() - p[rt]() + el[oh] - f[oh] + 'px';
			},
			'3-4':function(f,el,x,y,p) {
				f.style.left = x + el[rl]() - p[rl]() + el[ow] + 'px';
				f.style.top = y + el[rt]() - p[rt]() + el[oh] - f[oh] + 'px';
			},
			'4-1':function(f,el,x,y,p) {
				f.style.left = x + el[rl]() - p[rl]() + 'px';
				f.style.top = y + el[rt]() - p[rt]() + el[oh] + 'px';
			},
			'4-2':function(f,el,x,y,p) {
				f.style.left = x + el[rl]() - p[rl]() - f[ow] + 'px';
				f.style.top = y + el[rt]() - p[rt]() + el[oh] + 'px';
			},
			'4-3':function(f,el,x,y,p) {
				f.style.left = x + el[rl]() - p[rl]() - f[ow] + 'px';
				f.style.top = y + el[rt]() - p[rt]() + el[oh] - f[oh] + 'px';
			},
			'4-4':function(f,el,x,y,p) {
				f.style.left = x + el[rl]() - p[rl]() + 'px';
				f.style.top = y + el[rt]() - p[rt]() + el[oh] - f[oh] + 'px';
			}
		};	
	})();

	/**
	 * create fix position element
	 * @namespace XN.ui
	 * @class fixPositionElement
	 * @constructor
	 * @param {Object} params
	 * @extends XN.ui.container
	 */
	this.fixPositionElement = function(params) {
		var This = this;
		
		this.config = {
			tagName : 'div',
			useIframeInIE6 : true
		};
		
		XN.$extend(this.config, params);
		
		var f,x,y;

		if (this.getConfig('id')) {
			this.frame = f = XN.element.$(this.getConfig('id'));
			x = f.realLeft();
			y = f.realTop();
		} else if (this.getConfig('tagName')) {
			this.frame = this.container = f = XN.element.$element(this.getConfig('tagName'));
		} else {
			return;
		}

		this.container = XN.element.$element('div');
		this.frame.appendChild(this.container);
		
		XN.array.each(['alignWith', 'alignType', 'offsetX', 'offsetY', 'alignParent'], function(i, v) {
			This[v] = This.getConfig(v) || This[v];
		});
		
		XN.element.setStyle(f, 'position:absolute;z-index:10001;left:-9999px;top:-9999px');

		if(!XN.element.$(this.alignParent)) {
			this.alignParent = XN.element.$(document.body);
		}
		
		XN.element.$(this.alignParent).appendChild(this.frame);
		
		if ((XN.browser.IE6 && this.getConfig('useIframeInIE6')) || this.getConfig('addIframe')) {
			var iframe;
			this._iframe = iframe = XN.element.$element('iframe');
			iframe.frameBorder = 0;
			iframe.scrolling = 'no';
			iframe.setStyle('position:absolute;border:0px;left:0px;top:0px;z-index:-1;');
			if (XN.browser.Gecko) iframe.setAttribute('style', 'position:absolute;border:0px;left:0px;top:0px;z-index:-1;');
			//fix 防止对话框高度改动时露出空白的iframe
			if (XN.browser.IE) iframe.style.filter = 'progid:DXImageTransform.Microsoft.Alpha(style=0,opacity=0)';
			this.frame.appendChild(iframe);	
		}
		
		if (XN.element.visible(f)) this.show();
		
		f.style.display = 'block';
	};

	this.fixPositionElement.prototype = XN.$extend({}, this.container);

	XN.$extend(this.fixPositionElement.prototype, {
		
		/**
		 * the element align with
		 * @property alignWith
		 * @type {HTMLElement | String}
		 */		
		alignWith : null,
		
		/**
		 * @property alignType
		 * @type {String}
		 */		
		alignType : '4-1',
		
		/**
		 * @property offsetX
		 * @type {Int}
		 * @default 0
		 */
		offsetX : 0,
		
		/**
		 * @property offsetY 
		 * @type {Int}
		 * @default 0
		 */		
		offsetY : 0,
		
		/**
		 * @property alignParent
		 * @type {HTMLElement | String}
		 * @default 'dropmenuHolder'
		 */		
		alignParent : 'dropmenuHolder',
		
		left : null,
		top : null,

		_isShow : false,

		getConfig : function(key) {
			return this.config[key];
		},
		
		/**
		 * set offset x
		 * @method setOffsetX
		 * @param {Int} x
		 * @return {Object} this
		 */		
		setOffsetX : function(x) {
			this.offsetX = x;
			this.refresh();
			return this;
		},
		
		/**
		 * set offset y
		 * @method setOffestY
		 * @param {Int} y
		 * @return {Object} this
		 */		
		setOffsetY : function(y) {
			this.offsetY = y;
			this.refresh();
			return this;
		},
		
		/**
		 * @method setAlignType
		 * @param {String} t
		 * @return {Object} this
		 */		
		setAlignType : function(t) {
			this.alignType = t;
			this.refresh();
			return this;
		},
		
		/**
		 * @method setAlignParent
		 * @param {HTMLElement | String} p
		 * @return {Object} this
		 */		
		setAlignParent : function(p) {
			this.alignParent = p;
			XN.element.$(this.alignParent).appendChild(this.frame);
			this.refresh();
			return this;
		},
		
		/**
		 * @method refresh
		 * @return {Object} this
		 */		
		refresh : function() {
			if (this.visible()) {
				this.show();
			} else {
				this.hide();
			}
			return this;
		},
		
		/**
		 * @method visible
		 * @return {Boolean}
		 */		
		visible : function() {
			return this._isShow;
		},
		
		/**
		 * @method show
		 * @return {Object} this
		 */
		show : function() {
			this._isShow = true;
			
			this.frame.show();
			
			if (this.alignWith) {
				this._moveToElement(this.alignWith);
			} else {
				var x = this.left === null ? parseInt(((XN.element.$(this.alignParent).offsetWidth -  this.frame.offsetWidth) / 2), 10) : this.left;
				var y = this.top === null ? XN.event.scrollTop() + 200 : this.top;
				this._moveToPosition(x, y);
			}
			
			if(this._iframe) {
				//fix bug for ie6
				try {
					this._iframe.style.height = this.frame.offsetHeight - 2 + 'px';
					this._iframe.style.width = this.frame.offsetWidth + 'px';
				} catch(e) {}
			}

			return this;
		},
		
		/**
		 * @method hide
		 * @return {Object} this
		 */		
		hide : function() {
			this._isShow = false;
			var f = this.frame;
			//this.left = f.offsetLeft;
			//this.top = f.offsetTop;
			f.style.left = '-9999px';
			f.style.top = '-9999px';
			return this;
		},
		
		/**
		 * @method moveTo
		 * @param {HTMLElement | String | Int} x
		 * @param {Int} y
		 * @return {Object} this
		 */		
		moveTo : function(x, y) {
			if (!x && !y) return;
			if (XN.isNumber(x)) {
				this.left = x;
				this.alignWith = null;
			} else if (XN.isString(x) || XN.isElement(x)) {
				this.alignWith = XN.element.$(x);
			}
			
			if (XN.isNumber(y)) {
				this.top = y;
				this.alignWith = null;
			}
			
			this.refresh();
			
			return this;
		},
		
		/**
		 * @method setX
		 * @param {Int} x
		 * @return {Object} this
		 */		
		setX : function(x) {
			this.moveTo(x);
			return this;
		},
		
		/**
		 * @method setY
		 * @param {Int} y
		 * @return {Object} this
		 */		
		setY : function(y) {
			this.moveTo(null, y);
			return this;
		},

		/**
		 * @method setIndex
		 * @param {Int} i
		 * @return {Object} this
		 */			
		setIndex : function(i) {
			this.frame.style.zIndex = i;
			return this;
		},
		
		_moveToElement : function(el) {
			exports.fixPositionMethods[this.alignType](
				this.frame, XN.element.$(el), this.offsetX, this.offsetY, XN.element.$(this.alignParent)
			);
		},
		
		_moveToPosition : function(x, y) {
			if (x) {
				this.frame.style.left = x + 'px';
			}
			if (y) {
				this.frame.style.top = y + 'px';
			}
		}
	});
	
	(function() {
		var fixProto = exports.fixPositionElement.prototype;
		var Event = XN.event;
		var currentDialog = null;

		exports.clearDialog = function() {
			if (currentDialog && currentDialog.parent) currentDialog.remove();
		}

		/**
		 * 创建一个dialog
		 * <pre>
		 * 参数形式如下
		 * {
		 *  HTML:''//自定义对话框的html代码
		 * }
		 *
		 * 自定义代码中必须包含下面三个id的元素
		 *  ui_dialog_header
		 *  ui_dialog_body
		 *  ui_dialog_footer
		 * </pre>
		 * @namespace XN.ui
		 * @class dialog
		 * @constructor
		 * @param {Object} params
		 * @extends XN.ui.fixPositionElement
		 */		
		exports.dialog = function(params) {
			var This = this;
			currentDialog = this;
			exports.fixPositionElement.call(this, params);
			
			this.container = XN.element.$element('div');
			this.frame.appendChild(this.container);

			if (this.getConfig('HTML'))
				this.setContent(this.getConfig('HTML'));
			else
				this.setContent(this.buildHTML());

			this.dialogContainer = XN.element.$('ui_dialog_container');
			this.header = this.title = XN.element.$('ui_dialog_header');
			this.body = this.msg = this.message = XN.element.$('ui_dialog_body');
			this.footer = XN.element.$('ui_dialog_footer');
			this.closeButton = XN.element.$('ui_dialog_close');

			this.header.addChild = this.body.addChild = this.footer.addChild = function(s) {
				XN.element.addChild(this, s);
				setTimeout(function() {This.refresh();},0);
			};
			
			this.dialogContainer.removeAttribute('id');
			this.header.removeAttribute('id');
			this.body.removeAttribute('id');
			this.footer.removeAttribute('id');
			this.closeButton.removeAttribute('id');	
			
			if (this.getConfig('showCloseButton')) {
				this.closeButton.show();
				XN.event.addEvent(this.closeButton, 'click', function() {
					This.hide();
					This.fireEvent('close');
				});
			}

			//lower than menu
			this.frame.style.zIndex = 10000;
			
			this.setWidth(this.getConfig('width') || 400);
			
			if (this.getConfig('height')) 
				this.setHeight(this.getConfig('height'));
			
			XN.array.each(['title', 'msg', 'message', 'header', 'body', 'footer'], function(i, v) {
				if (This.getConfig(v)) 
					This[v].setContent(This.getConfig(v));
			});
			
			if (this.getConfig('type')) this.setType(this.getConfig('type'));
			
			this._buttons = [];
			
			XN.event.addEvent(this.footer, 'click', function(e) {
				This._parseButtonEvent(e || window.event);
			});

			XN.util.hotKey.add('27', this._hotKeyEvent, this);

			if (this.getConfig('modal') === true)
				XN.dom.disable();
			
			if(this.getConfig('noHeader'))
				this.header.hide();
				
			if(this.getConfig('noFooter'))
				this.footer.hide();
				
			if(this.getConfig('noPadding'))
				this.body.addClass('no_padding');
		};
		
		exports.dialog.prototype = XN.$extend({}, fixProto);
		XN.$extend(exports.dialog.prototype,  {
			header : null,
			body : null,
			footer : null,
			_iframe : null,
			_buttons : null,
			
			buildHTML : function() {
				return [
					'<table id="ui_dialog_container" style="width: 100%; height: 100%;" class="pop_dialog_table">',
						'<tbody>',
							'<tr>',
								'<td class="pop_topleft"></td>',
								'<td class="pop_border"></td>',
								'<td class="pop_topright"></td>',
							'</tr>',
							'<tr>',
								'<td class="pop_border"></td>',
								'<td class="pop_content">',
									'<h2><span id="ui_dialog_header"></span><a style="display:none;" class="close-button" id="ui_dialog_close" href="#nogo" onclick="return false;">关闭</a></h2>',
									'<div class="dialog_content">',
										'<div id="ui_dialog_body" class="dialog_body"></div>',
										'<div id="ui_dialog_footer" class="dialog_buttons"></div>',
									'</div>',
								'</td>',
								'<td class="pop_border"></td>',
							'</tr>',
							'<tr>',
								'<td class="pop_bottomleft"></td>',
								'<td class="pop_border"></td>',
								'<td class="pop_bottomright"></td>',
							'</tr>',
							'</tbody>',
						'</table>'
				].join('');
			},

			/**
			 * 通过一个按钮的标题获取按钮的实例
			 * @method getButton
			 * @param {String} text
			 * @return {XN.ui.button}
			 */			
			getButton : function(text) {
				var buttons = this._buttons;

				for (var i = buttons.length - 1; i >= 0; i --) {
					if (buttons[i].text == text) return buttons[i];
				}
				
				return null;
			},

			/**
			 * 向对话框底部添加按钮
			 * <pre>
			 *  参数形式如下: 
			 *  {
			 *      text : '',//按钮的文字
			 *      onclick : callback//按钮onclick时触发的函数
			 *  } 
			 * </pre>
			 * @method addButton
			 * @param {Object} b
			 * @return {Object} this
			 */			
			addButton : function(b) {
				var o = {
					text : b.text,
					_onclickForDialog : b.onclick				
				};
				if (b.className) o.className = b.className;
				var button = new exports.button(o);

				/*
				 * patch for panel
				 */
				
				button.frame.setAttribute('dialog', '1');

				/*
				 * patch end
				 */

				this._buttons.push(button);

				this.footer.addChild(button);
				return this;
			},

			/**
			 * 从从对话框删除按钮，参数为按钮的文字
			 * @method delButton
			 * @param {String} b title of the button
			 * @return {Object} this
			 */			
			delButton : function(b) {
				if (XN.isString(b)) b = this.getButton(b);

				this.footer.delChild(b);
				return this;
			},
			
			
			_preventHide : false,

			/**
			 * 阻止对话框关闭，用于按钮的回调函数
			 * <pre>
			 * callBack=function()
			 * {
			 *  this.preventHide();
			 *  .....
			 * }
			 * </pre>
			 * @method preventHide
			 * @return {Object} this
			 */
			preventHide : function() {
				this._preventHide = true;
				return this;
			},
			
			setAutoHide:function(boo) {
				this._preventHide = !boo;
				return this;
			},

			_parseButtonEvent : function(e) {
				var el = Event.element(e);
				if (el.tagName.toLowerCase() !== 'input' || el.type !== 'button') return;
				if (!el.getAttribute('dialog')) return;
				
				var button = this.getButton(el.value);
				
				if (button && button._onclickForDialog) {
					button._onclickForDialog.call(this);
				}
				
				if (this._preventHide) {
					this._preventHide = true;
				} else {
					this.hide();
					//XN.dom.enable();
				}
			},

			_hotKeyEvent : function() {
				this.hide();
			},
			
			/**
			 * 设置对话框的样式'normal' or 'error' type
			 * @method setType
			 * @param {String} t
			 * @return {Object} this
			 */			
			setType : function(t) {
				if (t == 'normal') {
					this.frame.delClass('errorDialog');
				} else if (t == 'error') {
					this.frame.addClass('errorDialog');
				}
				return this;
			},
			
			/**
			 * 设置对话框宽度
			 * @method setWidth
			 * @param {Int} w
			 * @return {Object} this
			 */			
			setWidth : function(w) {
				if (!w) return this;

				if (w == 'auto') {
					this.frame.style.width = 'auto';
					this.dialogContainer.style.height = '';
					this.dialogContainer.style.width = '';
					this.width = this.frame.offsetWidth;
				} else {
					this.width = w;
					this.frame.style.width = w + 'px';
					this.dialogContainer.style.height = '100%';
					this.dialogContainer.style.width = '100%';
				}

				this.refresh();
				return this;
			},
			
			/**
			 * 设置对话框高度，一般是自动伸展
			 * @method setHeight
			 * @param {Int} h
			 * @return {Object} this
			 */			
			setHeight : function(h) {
				if (!h)return this;
				this.hegith =  h;
				this.frame.style.height = h + 'px';
				this.refresh();
				return this;
			},
			
			/**
			 * resize
			 * @method resizeTo
			 * @param {Int} w
			 * @param {Int} h
			 * @return {Object} this
			 */
			resizeTo : function(w, h) {
				this.setWidth(w);
				this.setHeight(h);
				return this;
			},
			
			/**
			 * 清空对话框的内容
			 * @method clear
			 * @return {Object} this
			 */			
			clear : function() {
				this.header.setContent('');
				this.body.setContent('');
				this.footer.setContent('');
				this._buttons = [];
				return this;
			},
					
			/**
			 * 设置对话框的标题
			 * @method setTitle
			 * @param {String} s
			 * @return {Object} this
			 */			
			setTitle : function(s) {
				this.header.setContent(s);
				return this;
			},
			
			/**
			 * 设置对话框的内容
			 * @method setBody
			 * @param {String} s
			 * @return {Object} this;
			 */			
			setBody : function(s) {
				this.body.setContent(s);
				return this;
			},


			remove : function(keepModal) {
				XN.util.hotKey.del('27', this._hotKeyEvent);
				exports.element.remove.call(this);
				if(!keepModal)
					XN.dom.enable();
				return this;
			},
			
			refresh : function() {
				if (this.visible())
					fixProto.show.apply(this, arguments); 
				else
					this.hide();
				return this;
			},
			
			/**
			 * 重新设定弹层的位置
			 * 一般弹层内容都是弹层出来之后才append进去,这个时候弹层的位置就偏下了,用这个重新定位一下
			 * 但是调用这个窗口会跳一下,不完美.. 而且窗口添加了东西 会自动调用上面的refresh,只是那个东西只算离上边200px 不算剧中....
			 * @author <jicheng.li> 2011-03-11
			 */
			reLocate: function() {
				//重新居中定位这个窗口
				var w = this.frame;
				var s = XN.event.scrollTop();  //获取滚动条的位置
				var newTop = (XN.event.winHeight() - w.offsetHeight)/2;
				newTop = (newTop <= 0) ? s : newTop + s;  //防止减出负值 极端状况顶头显示
				w.style.top = newTop + 'px';
			},
			
			show : function() {
				this._clearHideTimer();
				if(this.getConfig('modal') === true)
					XN.dom.disable();
				fixProto.show.apply(this, arguments);			
				this.fireEvent('show');
				return this;
			},

			hide : function() {
				this._clearHideTimer();
				fixProto.hide.apply(this, arguments);
				XN.dom.enable();
				this.fireEvent('hide');
				return this;
			},

			_hideTimer : null,
			_clearHideTimer : function() {
				if (this._hideTimer) {
					clearTimeout(this._hideTimer);
					this._hideTimer = null;
				}
			},
			
			/**
			 * 自动关闭对话框
			 * @method autoHide
			 * @param {Int} t
			 * @return {Object} this
			 */
			autoHide : function(t) {
				var This = this;
				this._hideTimer = setTimeout(function() {
					This.hide();
				}, t * 1000);
				return this;
			}
		});

		XN.event.enableCustomEvent(exports.dialog.prototype);
	})();

	/*
	 *  patch for old version
	 */
	this.panel = this.dialog;	
	this.dialog.prototype.setHeader = function(h) {
		if(h && h !== '') {
			this.header.addChild(h);
		} else {
			this.header.innerHTML = '';
		}	
	};
	this.dialog.prototype.setFooter = function(f) {
		if (f && f !== '') {
			this.footer.addChild(f);
		} else {
			this.footer.innerHTML = '';
		}
	};
	/*
	 * patch end
	 */

	/**
	 * 菜单
	 * <pre>
	 *  参数形式如下
	 *  {
	 *      button : 'el',//触发元素的id
	 *      hoverClass : 'classname',//菜单显示时button的样式
	 *      event : 'mouseover',//事件类型，还可以是click,manual
	 *      alignType : '4-1',//菜单对齐方式
	 *      delay :　0.2,//延迟时间，用于mouseover
	 *      useIframeInIE6 : true,//在ie6是否添加iframe
	 *      addIframe : false,//是否强制添加iframe
	 *  }
	 * </pre>
	 *
	 * @namespace XN.ui
	 * @class menu
	 * @constructor
	 * @param {Object} params
	 */
	this.menu = function(params) {
		var This = this;

		this.config = {
			alignType : '4-1',
			barOnshowClass : '',
			tagName : 'div',
			disalbeButtonClickEvent : true,
			fireOn : 'click',
			keep : 0.2,
			useIframeInIE6 : true,
			effectTime : 50 
		};

		XN.$extend(this.config, params);
		
		var frame;
		
		if (this.getConfig('text')) {
			this.frame = frame = XN.element.$element(this.getConfig('tagName'));
			frame.setContent(this.getConfig('text'));
		} else if (this.getConfig('button')) {
			this.frame = frame = XN.element.$(this.getConfig('button'));
		} else return false;
		
		this._alignType = this.getConfig('alignType');
		
		if (this.getConfig('menu')) {
			XN.element.$(this.getConfig('menu')).hide();

			this.menu = new exports.fixPositionElement({
				id : this.getConfig('menu'),
				alignType : this._alignType,
				alignWith : this.getConfig('alignWith') || this.frame,
				addIframe : this.getConfig('addIframe'),
				useIframeInIE6 : this.getConfig('useIframeInIE6')
			}); 
			this.container = this.menu.frame;
			this._canAddSubMenu = false;
		} else {
			var dt = XN.element.$element('div');
			dt.hide();
			this.menu = new exports.fixPositionElement({
				//tagName : 'div',
				id : dt,
				alignType : this._alignType,
				alignWith : this.getConfig('alignWith') || this.frame,
				addIframe : this.getConfig('addIframe'),
				useIframeInIE6 : this.getConfig('useIframeInIE6')
			});
			this.container = XN.element.$element('div');
			this._menu.setContent(this.container);
		}
		
		this.menu.setIndex(10001);

		XN.event.addEvent(this.menu.frame, 'click', function(e) {
			e = e || window.event;
			This._frameOnClick(e);
		}, false);
		this.menu.setOffsetX(this.getConfig('offsetX') || 0);
		this.menu.setOffsetY(this.getConfig('offsetY') || 0);
		var eventType = this.getConfig('event');
		if (eventType == 'click') {
			XN.event.addEvent(this.frame, 'click', function(e) {
				This._buttonClick(e || window.event);
			});
			XN.event.addEvent(document, 'click', function(e) {
				This._documentClick(e || window.event);
			});
		} else if (eventType == 'mouseover') {
			XN.event.addEvent(this.frame, 'mouseover', function(e) {
				This._frameMouseOver(e || window.event);
			});
			
			if (this.getConfig('disalbeButtonClickEvent')) {
				XN.event.addEvent(this.frame, 'onclick', function(e) {
					XN.event.stop(e || window.event);
				});
			}
			
			XN.event.addEvent(this.frame, 'mouseleave', function() {
				This._buttonMouseLeave();
			});
			
			XN.event.addEvent(this.menu.frame, 'mouseleave', function() {
				This._menuMouseLeave();
			});
			
			XN.event.addEvent(this.menu.frame, 'mouseover', function() {
				This._mouseOverMenu = true;
			});
		} else if (eventType == 'manual') {
		}

		XN.event.addEvent(window, 'resize', function() {
			This.menu.refresh();
		});

		this.hide();
	};

	this.menu.prototype = XN.$extend({}, this.container);

	XN.$extend(this.menu.prototype, {
		isShow : true,
		menu : null,
		_alignType : null,
		_button : null,
		_canAddSubMenu : true,
		_delayTimer : null,
		_mouseOverMenu : false,
		_mouseOverButton : false,
		_clearTimer : function() {
			if (this._delayTimer) {
				clearTimeout(this._delayTimer);
				this._delayTimer = null;
			}
		},
		_buttonClick : function(e) {
			XN.event.stop(e);
			if (this.isShow) 
				this.hide();
			else
				this.show();
		},
		_documentClick : function(e) {
			this.hide();
		},
		
		_frameOnClick : function(e) {
			var This = this;
			var el = XN.event.element(e);
			var tag = el.tagName.toLowerCase();

			if (tag == 'a') return true;
			if ((tag == 'input' && (el.type == 'radio' || el.type == 'checkbox')) || tag == 'label') {
				this.isShow = false;
				setTimeout(function() {
					This.isShow = true;
				}, 20);
				return true;
			}
			
			while (el != this.menu.frame && el.tagName && el.tagName.toLowerCase() != 'a') {
				el = el.parentNode;
			} 
			
			if (el.tagName.toLowerCase() == 'a') return true;
			
			XN.event.stop(e);
		},

		_frameMouseOver : function(e) {
			var This = this;
			this._mouseOverButton = true;
			
			this._clearTimer();
			
			var delay = this.getConfig('delay');
			if (delay) {
				this._delayTimer = setTimeout(function() {
					if (This._mouseOverButton) This.show();
				}, delay * 1000);
			} else {
				This.show();
			}
			XN.event.stop(e);
		},
		_buttonMouseLeave : function() {
			var This = this;
			this._mouseOverButton = false;
			this._clearTimer();
			setTimeout(function() {
				if (!This._mouseOverMenu) {
					This.hide();
				}
			}, this.getConfig('effectTime'));
		},
		_menuMouseLeave : function() {
			var This = this;
			this._mouseOverMenu = false;
			this._clearTimer();
			setTimeout(function() {
				if (!This._mouseOverButton) This.hide();
			}, this.getConfig('effectTime'));
		},
		getConfig : function(key) {
			var patch = {
				'hoverClass' : 'barOnshowClass',
				'event' : 'fireOn',
				'button' : 'bar',
				'delay' : 'keep'
			};
			if (patch[key]) {
				return this.config[key]  || this.config[patch[key]];
			}

			return this.config[key];
		},

		/**
		 * 显示菜单
		 * @method show
		 * @return {XN.ui.menu} this
		 */
		show : function() {
			if (this.isShow) return this;
			this.menu.show();
			var className = this.getConfig('hoverClass');  //靖威的心框架 object里dom addClass坚决支持标准,传空字串会报错(火狐)  2011-03-21
			if(className != '') {
				this.frame.addClass(this.getConfig('hoverClass'));
			}
			this.onShow();
			this.isShow = true;
			return this;
		},
		
		/**
		 * 设置菜单宽度
		 * @method setWidth
		 * @param {Int} width
		 * @return {XN.ui.menu} this
		 */
		setWidth : function(w) {
			this.menu.frame.style.width = w + 'px';
			this.menu.refresh();
			return this;
		},
			
		/**
		 * 隐藏菜单
		 * @method hide
		 * @return {XN.ui.menu} this
		 */
		hide : function() {
			if (!this.isShow) return this;
			this.menu.hide();
			this.frame.delClass(this.getConfig('hoverClass'));
			this.isShow = false;
			this.onHide();
			return this;
		},
		
		/**
		 * 刷新菜单
		 * @method refresh
		 * @return {XN.ui.menu} this
		 */
		refresh : function() {
			if (this.isShow) {
				this.menu.show();
			}
			return this;
		},

		onShow : XN.func.empty,
		onHide : XN.func.empty
	});

	XN.event.enableCustomEvent(this.menu.prototype);
	/**
	 * 自动完成
	 * <pre>
	 * 参数如下: 
	 *  {
	 *      input:id,//要使用自动完成的input元素
	 *      searchDelay:num,//输入与搜索之间的延迟
	 *      DS:obj,//搜索用的数据源,参见XN.util
	 *      enableCache:true,//是否使用缓存
	 *      maxCache:10//最大缓存长度
	 *  }
	 * </pre>
	 *
	 * @namespace XN.ui
	 * @class autoComplete
	 * @constructor
	 * @param {Object} p
	 * @extends XN.ui.element
	 */
	this.autoComplete = function(p) {
		var This = this;
		
		this.config = this.config || {};
		
		XN.$extend(this.config, {
			inputTip : null,
			searchDelay : 0.2,
			DS : null,
			enableCache : true,
			maxCache : 10
		});
		
		XN.$extend(this.config, p);
		
		if (this.getConfig('enableCache')) {
			this.cache = new XN.util.cache({
				cacheLength : this.getConfig('maxCache')
			});
		}
		
		if (this.getConfig('input')) {
			var input = this.input = XN.element.$(this.getConfig('input'));
		} else {
			var input = this.input = XN.element.$element('input');
			input.type = 'text';
			input.addClass('input-text');
		}

		
		this.frame = input;
		
		XN.event.addEvent(input, 'focus', function(e) {
			This._startCheck();
			This.fireEvent('focus');
		});
		
		XN.event.addEvent(input, 'blur', function(e) {
			This._endCheck();
			This.fireEvent('blur');	
		});

		this.addEvent('focus', function() {
			var v = this.input.value;
			if (v == '' || v == this.getConfig('inputTip')) {
				this.fireEvent('noinput');
			}
		});

		this.addEvent('blur', function() {
			this._lastInput = null;
		});

		XN.event.addEvent(input, 'click', function(e) {
			XN.event.stop(e || window.event);
		});
		
		XN.event.addEvent(input, 'keydown', function(e) {
			This._userInput = true;
			e = e || window.event;
			if (e.keyCode == 13) XN.event.stop(e);
			This.fireEvent('keydown', e);
		});
		
		input.setAttribute('AutoComplete', 'off');

		this.DS = this.getConfig('DS');
	};

	this.autoComplete.prototype = XN.$extend({}, this.element);

	XN.$extend(this.autoComplete.prototype, {
		input : null,
		cache : null,
		_userInput : false,
		_lastInput : null,
		
		getConfig : function(key) {
			if (key == 'input') return this.config['input'] || this.config['id'];
			return this.config[key];
		},
		
		_startCheck : function() {
			var This = this;
			this._inputTimer = setInterval(function() {
				if(This._userInput) {
					This._userInput = false;
					return;
				}
				This._checkInput();
			},this.getConfig('searchDelay') * 1000);
		},
		
		_endCheck : function() {
			clearInterval(this._inputTimer);
			this._inputTimer = null;		
		},
		
	   
		_checkInput : function() {
			var This = this;
			var cv = this.input.value;
			
			if(XN.string.isBlank(cv)) {
				if (this._lastInput === '') {
					return;
				}

				this._lastInput = '';
				this.fireEvent('noinput');

				return;
			}
			
			if(cv == this._lastInput) { 
				return;
			}

			this._lastInput = cv;
			
			this.fireEvent('searchbegin');
			
			if(this.cache) {
				var result = this.cache.get(cv);
				if(result) {
					this.fireEvent('searchover', result);
					return;
				}
			}
			
			if (!this.DS) {
				XN.log('no ds');
				this.fireEvent('NO_DS');
				return;
			}
			
			this.DS.query(cv, function(r) {
				if(This.cache) This.cache.add(cv, r);
				This.fireEvent('searchover', r);
			});		
		}
	});

	XN.event.enableCustomEvent(this.autoComplete.prototype);

	(function() {

		var completeMenus = {};

		getCompleteMenu = function(id) {
			return  completeMenus[id];
		};

		/**
		 * 自动完成菜单
		 * @namespace XN.ui
		 * @class autoCompleteMenu
		 * @constructor
		 * @param {Object} p
		 * @extends XN.ui.autoComplete
		 */
		exports.autoCompleteMenu  = function(p) {
			var This = this;
			
			this._MID = XN.util.createObjID();
			
			completeMenus[this._MID] = this;

			this.config = this.config || {};
			
			XN.$extend(this.config ,
			{
				ulClassName : '',
				liClassName : '',
				liHoverClass : 'm-autosug-hover',
				aClassName : '',
				noResult : '没有匹配结果',
				dataLoading : '正在加载数据...',
				noInput : null,
				autoSelectFirst : false
			});
			
			exports.autoComplete.call(this, p);
			
			var input = this.input;

			var m = XN.element.$element('div');
			m.innerHTML = this.getConfig('wrapper') || this._wrapper();
			
			this._menuList = m.firstChild;

			this._ul = this._menuList.getElementsByTagName('ul')[0];
			
			this.menu = new exports.menu( {
				button : input,
				menu : this._menuList,
				fireOn : 'manual'
			});

			this.addEvent('keydown', this._inputOnkeydown);
			
			XN.event.addEvent(this._ul, 'mousedown', function(e) {
				This._menuOnclick(e || window.event);
			});
			
			/*
			XN.event.addEvent(this._ul, 'mousemove', function(e)
			{
				return This._menuOnmouseover(e || window.event);
			});
			*/
			/*XN.event.addEvent(document, 'click', function() {
				This.menu.hide();
			}, false);*/
			XN.event.addEvent(input, 'blur', function() {
				This.menu.hide();
			});

			this.menu.hide();
			
			/*
			 * 没有输入时关闭菜单
			 */
			this.addEvent('noinput', function() {
				var tip = this.getConfig('noInput');
				if(!tip) {
					this.menu.hide();
					return;
				}
				this._ul.innerHTML = '<li>' + tip + '</li>';
				this.menu.show();
			});
			
			this.addEvent('NO_DS', function() {
				  this._noDataShow();
			});
					
			this.addEvent('searchover' ,function(result) {
				  this._buildMenu(result);
			});
		};

		exports.autoCompleteMenu.prototype = XN.$extend({}, exports.autoComplete.prototype);

		XN.$extend(exports.autoCompleteMenu.prototype, {
			menu : null,
			_menuList : null,
			_ul : null,
			_currentLi : null,
			_highlightMenuItem : function(li) {
				if (li == this._currentLi) return;
				var hoverClass = this.getConfig('liHoverClass');
				if (this._currentLi !== null) {
					XN.element.delClass(this._currentLi, hoverClass);
				}
				XN.element.addClass(li, hoverClass);
				this._currentLi = li;
				var aid = this._currentLi.getAttribute('aid');

				if(aid) {
					this.fireEvent('highlight', this.result[parseInt(aid)]);
				}
			},

			/*
			 *  键盘事件处理函数
			 */
			_inputOnkeydown : function(event) {
				var li;

				/*
				 *   回车选择一个菜单项
				 */
				if (event.keyCode == 13) {
					if(this.menu.isShow && this._currentLi)
					{
						var aid = this._currentLi.getAttribute('aid');
						if(aid) this._selectMenuItem(parseInt(aid));
					}
					return false;
				}

				/*
				 *  向上高亮上一个
				 */
				if (event.keyCode == 38) {
					if (this._currentLi && this._currentLi.previousSibling)
					{
						li = 	this._currentLi.previousSibling;
					}
					else
					{
						li = this._ul.lastChild;			
					}
					this._highlightMenuItem(li);
					return false;
				}

				/*
				 *  向下高亮下一个
				 */
				if (event.keyCode == 40) {
					if (this._currentLi && this._currentLi.nextSibling)
					{
						li = 	this._currentLi.nextSibling;
					}
					else
					{
						li = this._ul.firstChild;			
					}
					this._highlightMenuItem(li);
					return false;
				}
				
				return true;
			},

			/*
			 *  当在菜单上点击时触发
			 */			 
			_menuOnclick : function(event) {
				var el = XN.event.element(event);
				
				while (el && el.tagName && el.tagName.toLowerCase() !== 'li')
				{
					el = el.parentNode;
				}
				
				if (!el || el.nodeType !== 1 || !el.getAttribute('aid')) return false;
				this._selectMenuItem(parseInt(el.getAttribute('aid')));
				return false;
			},

			/*
			 *  当在菜单上移动鼠标时触发
			 */
			_menuOnmouseover : function(event) {
				var el = XN.event.element(event);
				if (el.parentNode == XN.element.$('dropmenuHolder')) return;
				while (el && el.tagName &&  el.tagName.toLowerCase() !== 'li') {
					el = el.parentNode;
				}
				
				if (!el || el.nodeType !== 1 || !el.getAttribute('aid')) return false;
				this._highlightMenuItem(el);
				return false;
			},
			
			/*
			 *  选择一个菜单项
			 */
			_selectMenuItem : function(id) {
				this.menu.hide();
				this.input.focus();
				this.fireEvent('select', this.result[id]);
				this._lastInput = this.input.value;
			},

			/*
			 * 匹配结束,显示匹配结果
			 */
			_buildMenu : function(result) {
				var This = this;
				this.result = result;
				
				if (result.length > 0) {
					this.fireEvent('hasResult');
				}
				if (result.length == 0) {
					this.fireEvent('noResult');
					var noResult = this.getConfig('noResult');

					if (XN.isFunction(noResult)) {
						noResult = noResult.call(this);
					}

					this._ul.innerHTML = '<li>' + noResult + '</li>';
					this.menu.show();
					this._currentLi = null;
					return;
				}

				var lis = [];

				lis.push(this.firstMenuItem());
				
				var len = result.length - 1;

				XN.array.each(result, function(i, v) {
					lis.push('<li onmouseover="getCompleteMenu(' + This._MID + ')._highlightMenuItem(this);" aid="' + i + '">' + This.buildMenu(v) + '</li>');
				});
				
				lis.push(this.lastMenuItem());

				this._ul.innerHTML = lis.join('');
				
				if(this.getConfig('autoSelectFirst')) this._highlightMenuItem(this._ul.firstChild);
				
				this.menu.show();
			},
			_noDataShow :function() {
				var tip = this.getConfig('dataLoading');
				this._ul.innerHTML = '<li>' + tip + '</li>';
				this.menu.show();			
			},

			firstMenuItem : function() {
				return '';
			},
			
			lastMenuItem : function() {
				return '';
			},

			buildMenu : function(r) {
				return '<li>' + r.name + '</li>';
			},
			setMenuWidth : function(w) {
				this.menu.setWidth(w);
			}
		});
		//XN.ui._friendsCacheData = null;
		exports.autoCompleteMenu.prototype._wrapper = function() {
			return [
			'<div class="m-autosug">',
				'<span class="x1">',
					'<span class="x1a"></span>',
				'</span>',
				'<span class="x2">',
					'<span class="x2a"></span>',
				'</span>',
				'<div class="m-autosug-minwidth">',
					'<div class="m-autosug-content">',
						'<ul></ul>',
					'</div>',
				'</div>',
			'</div>'
			].join('');
		};
	})();

	this.friendSelector = function(params) {
		var This = this;
		this.config = this.config || {};
		
		XN.$extend(this.config, {
			getFriendsUrl: 'http://browse.' + XN.env.domain + '/getfriendsajax.do?s=1',
			url : 'http://sg.' + XN.env.domain + '/s/f',
			aurl: 'http://friend.' + XN.env.domain + '/friendsSelector.do',
			param : {}
		});
		if(this.config.url.indexOf('sg.renren.com/s/m')!=-1){
			this.config.aurl = 'http://friend.' + XN.env.domain + '/friendSelectorForVip';
		}

		XN.$extend(this.config, params.params)
		if(XN.isUndefined(this.getConfig('page'))) {
			this.config['page'] = false;
		}

		exports.autoCompleteMenu.call(this, params);
		
		this.addEvent('select', function(r) {
			this.input.value = r.name;
			if (this.onSelectOne) this.onSelectOne(r);			
		});
		
		this.buildMenu = function(r) {
			return r.name ;
		};
		
		this.addEvent('focus', function()
		{
			if (this._ready) return;
			if (this._isLoading) return;
			this.loadFriends();
		});
	};

	this.friendSelector.prototype = XN.$extend({}, this.autoCompleteMenu.prototype);
	XN.$extend(this.friendSelector.prototype, {
		_isLoading:false,
		_ready:false,
		
		isReady : function() {
			return this._ready;
		},

		isLoading : function() {
			return this._isLoading;
		},
		
		loadFriends:function(r) {
			if (this.isLoading()) return;
			this._isLoading = true;
			var This = this;
			var p = {};
			p['init'] = true;
			p['uid'] = false;
			p['uhead'] = false;
			p['uname'] = false;
			p['group'] = false;
			p['net'] = false;
			p['param'] = this.getConfig('param');
			p['page'] = this.getConfig('page');

			new XN.net.xmlhttp({
				useCache : true,
				url : this.getConfig('aurl'),
				method : 'get', // TODO 李勇改 post
				data : 'p=' + XN.json.build(p),
				onSuccess : function(r) {
					r = XN.json.parse(r.responseText);
					This._onload(r);
				}
			});
		},
		
		_onload : function(r) {
			this.isLoading = false;
			this._ready = true;
			this.config.qkey = r.qkey;
			this.DS = new XN.util.DS_friends( {
				//method: 'post', // TODO 李勇改 post
				url : this.getConfig('url'),
				qkey : this.getConfig('qkey'),
				limit : this.getConfig('limit'),
				page : this.getConfig('page'),
				param : this.getConfig('param')
			});
			this.DS.query = function( v , callBack ){
				var This = this;
				try{
					this._request.abort();
				}catch(e){}
				function parseDS_JSON( r ){
					r = r.responseText;
					var pp;
					try{
						var rt = XN.JSON.parse( r );
						if ( This.rootKey && rt[ This.rootKey ] ){
							pp = rt[ This.rootKey ];
						}else{
							pp = rt;
						}
					}
					catch( e ){
						pp = [];
					}
					callBack( pp );
				}
				var paramJ = XN.json.parse(this.param);
				this._request = new XN.net.xmlhttp({
					url : this.url,
					data : 'q=' + encodeURIComponent( v ) + ( !!this.limit?('&l=' + this.limit):'' ) + ( !!paramJ.friendId?('&friend='+paramJ.friendId):'' ), 
					method : this.method,
					onSuccess : parseDS_JSON
				});
			};
		}
	});

	this.friendSelectorSynchronous = function(a, b) {
		function s(id, ac, v) {
			if (XN.isObject(id)) id = id.id;

			if (v.isReady()) {
				try{
					v[ac](id);
				} catch(e) {}
			} else {
				v.addEvent('load', function() {
					try{
						v[ac](id);
					} catch(e) {}
				});
				v.loadFriends();
			}
		}
		
		a.addEvent('select', function(id) {
			s(id, 'select', b);
		});
		a.addEvent('deselect', function(id) {
			s(id, 'deselect', b);
		});
		b.addEvent('select', function(id) {
			s(id, 'select', a);
		});
		b.addEvent('deselect', function(id) {
			s(id, 'deselect', a);
		});
	};


	(function() {

		/**
		 * 多好友选择器
		 * <pre>
		 * 参数形式如下
		 * {
		 *      idInputName:'ids',//生成的id字段input的name属性
		 *      nameInputName:'names',//生成的name字段input的name属性
		 *      url:'/friendsSelector.do',//初始化的url
		 *      initParam:{},//初始化参数
		 *      param:{},//查询好友的额外参数
		 *      maxNum:0//最大数量限制，超出时会触发'overMaxNum'事件
		 *      loadMethod : 'get' | 'post' //载入好友的请求方式
		 * }
		 * </pre>
		 * @namespace XN.ui
		 * @class multiFriendSelector
		 * @constructor
		 * @param {Object} params
		 */
		exports.multiFriendSelector = function(params) {
			var This = this;
			//ID_PRE ++;
			this._ID = XN.util.createObjID();

			this.config = this.config || {};
			XN.$extend(this.config, {
				inputName : 'ids',
				nameInputName : 'names',
				aurl : 'http://friend.' + XN.env.domain + '/friendsSelector.do',
				url : 'http://friend.' + XN.env.domain + '/friendsSelector.do',
				initParam : {},
				param : {},
				noInput : false,
				maxNum : -1 
			});
			
			XN.$extend(this.config, params);
			
			if(this.config.url.indexOf('sg.renren.com/s/m')!=-1){
				this.config.aurl = 'http://friend.' + XN.env.domain + '/friendSelectorForVip';
			}
			
			this.frame = XN.element.$element('div');
			var div = XN.element.$element('div');
			div.hide();
			document.body.appendChild(div);
			div.appendChild(this.frame);
			
			this.frame.innerHTML = [
				'<div id="' + this.getID('friendsContainer') + '" class="tokenizer friendAutoSelector">',
				'<span id="' + this.getID('inputContainer') + '" class="tokenizer_input"><input id="' + this.getID('input') + '" type="text" /></span>',
				'</div>',
				'<div class="float-right" id="' + this.getID('menu') + '"></div>'
			].join('');
			
			/*
			 * patch for old version
			 */			
			this.input = this.getEl('input');
			this.menuContainer = this.getEl('menu');

			//this._friendsContainer = this.frame.firstChild;
			//this._inputContainer = this.frame.getElementsByTagName('span')[2];
			/*
			 * patch end
			 */

			XN.event.addEvent(this.getEl('friendsContainer'), 'click', function(e) {
				This._parseClickEvent(e || window.event); 
			});
			
			this.autoComplete = new exports.friendSelector( {
				id : this.input,
				inputTip : '输入好友姓名...',
				autoSelectFirst : true,
				url : this.getConfig('url'),
				aurl: this.getConfig('aurl'),
				param : this.getConfig('param')
			});

			this.autoComplete.loadFriends = function(r) {
				if (this.isLoading()) return;
				this._isLoading = true;
				var p = {};
				p['init'] = true;
				p['uid'] = true;
				p['uhead'] = false;
				p['uname'] = true;
				p['group'] = false;
				p['net'] = false;

				XN.$extend(p, This.getConfig('initParam'));
				
				p['param'] = this.getConfig('param');

				new XN.net.xmlhttp( {
					useCache : true,
					url : this.getConfig('aurl'),
					method : This.getConfig('loadMethod') || 'get',
					data : 'p=' + XN.json.build(p),
					onSuccess : function(r) {
						r = XN.json.parse(r.responseText);
						This._allFriends = r.candidate;
						This.fireEvent('load');
						This.autoComplete._onload(r);
					}
				});
			};
			
			this.autoComplete.buildMenu = function(r) {
				return '<p>' + r.name + '</p>';
			};

			this.autoComplete.setMenuWidth(129);
			this.autoComplete.addEvent('keydown' ,function(e) {
				This._onInputKeydown(e);
			});
			this.autoComplete.addEvent('select', function(r) {
				XN.log(this.input);
				this.input.value = '';
				This.selectFriend(r);
			});

			if (this.getConfig('noInput')) {
				this.input.hide();
			}
			
			this.fireEvent('init');
		};
		var proto = exports.multiFriendSelector.prototype = XN.$extend({}, exports.element);
		
		XN.$extend(proto, {
			//_friendsContainer : null,
			//_inputContainer : null,
			
			/**
			 * 选择器是否就绪
			 * @method isReady
			 * @return {Boolean}
			 */
			isReady : function() {
				return this.autoComplete.isReady();
			},

			isLoading : function() {
				return this.autoComplete.isLoading();
			},

			/**
			 * 加载好友数据
			 * @method loadFriends
			 */
			loadFriends : function() {
				this.autoComplete.loadFriends();
			},

			/**
			 * 跟据用户id得到一个用户对象
			 * @method getUserByID
			 * @param {String} id
			 * @return {Object}
			 */
			getUserByID : function(id) {
				id = String(id);
				var rt = null;
				XN.array.each(this._allFriends, function(i, v) {
					if (String(v.id) == id) {
						rt = v;
						return false;
					}
				});
				return rt;
			},

			getConfig : function(key) {
				if (key == 'inputName') return this.config['idInputName'] || this.config['inputName'];
				return this.config[key];
			},

			getID : function(id) {
				return 'mfs_' + this._ID + id;
			},
			
			getFriendID : function(id) {
				return this.getID('friend_' + id);
			},
		
			getFriendEl : function(id) {
				return XN.element.$(this.getFriendID(id));
			},

			getEl : function(id) {
				return XN.element.$(this.getID(id));
			},

			getFriendsNum : function() {
				return this.getEl('friendsContainer').getElementsByTagName('a').length;
			},
			
			/**
			 * 获取已选好友的id
			 * @method getSelectedFriends
			 * @return {Array}
			 */
			getSelectedFriends : function() {
				var rt = [];
				var a = XN.array.build(this.getEl('friendsContainer').getElementsByTagName('a'));
				XN.array.each(a, function(i, v) {
					rt.push(v.getAttribute('uid') + '');
				});
				return rt;
			},
			
			/**
			 * 重设选择器
			 * @method reset
			 */
			reset : function() {
				this.deselectAll(); 
			},

			/**
			 * 取消全选
			 * @method deselectAll
			 */
			deselectAll : function() {
				var els = XN.array.build(this.getEl('friendsContainer').getElementsByTagName('a'));
				XN.array.each(els, function(i, v) {
					XN.element.remove(v);
				});
				this.fireEvent('deselectAll', this.getIds());
			},
			
			/**
			 * 选择一组好友
			 * @method selectFriends
			 * @param {Array} a
			 */
			selectFriends : function(fs) {
				var This = this;
				XN.array.each(fs, function(i, v) {
					This.select(v);
				});
			},
			
			/**
			 * 反选一组好友
			 * @method deselectFriends
			 * @param {Array} a
			 */
			deselectFriends : function(fs) {
				var This = this;
				XN.array.each(fs, function(i, v) {
					This.deselect(v);
				});
			},
			
			/**
			 * 选择一个好友
			 * @method select
			 * @param {String} id
			 */
			select : function(o) {
				if (XN.isUndefined(o)) return; 
				XN.log('mfs select:');
				XN.log(o);
				var maxNum = this.getConfig('maxNum');
				
				if (maxNum !== -1) {
					if (this.getFriendsNum() ==  maxNum) {
						this.fireEvent('overMaxNum', maxNum);
						return;
					}
				}

				if (XN.isString(o) || XN.isNumber(o)) {
					o = {
						id : o,
						name : this.getUserByID(o).name
					};
				}

				if (this.getFriendEl(o.id)) return;
				
				this.getEl('friendsContainer').insertBefore(this.createFriendHTML(o.id, o.name), this.getEl('inputContainer'));
				this.fireEvent('select', o.id);
			},
			
			/**
			 * 反选一个好友
			 * @method deselect
			 * @param {String} id
			 */
			deselect : function(uid) {
				if (!this.getFriendEl(uid))return;
				this.getFriendEl(uid).remove();
				this.fireEvent('deselect', uid);
			},

			_parseClickEvent : function(e) {
				var el = XN.event.element(e);
				XN.event.stop(e);
				if (el && el.getAttribute('action')) {
					this.deselectFriend(el.getAttribute('uid'));
				}
			},

			createFriendHTML : function(uid, uname) {
				var a = XN.element.$element('a');
				a.id = this.getFriendID(uid);
				a.setAttribute('uid', uid);
				a.href = '#nogo';
				a.className = 'token';
				a.tabindex = '-1';
				a.innerHTML = [
					'<span>\n<span>\n<span>\n<span>\n<input type=\"hidden\" value=\"',
					uid,
					'" name=\"',
					this.getConfig('inputName'),
					'\" />\n',
					'<input type=\"hidden\" value=\"',
					uname,
					'" name=\"',
					this.getConfig('nameInputName'),
					'\" />\n',
					uname,
					'<span uid=\"',
					uid,
					'\" action=\"x\" class=\"x\" onmouseout=\"this.className=\'x\'\" onmouseover=\"this.className=\'x_hover\'\" >\n</span>\n</span>\n</span>\n</span>\n</span>'
				].join('');
				return a;
			},

			_onInputKeydown : function(event) {
				var i = this.getEl('inputContainer'),
				pa = i.previousSibling,
				na = i.nextSibling,
				input = this.input,
				c = this.getEl('friendsContainer');
				if (event.keyCode == 8 && this.input.value =='') {
					if(pa) {
						this.deselectFriend(pa.getAttribute('uid'));
					}
					return true;
				} else if (event.keyCode == 37 && this.input.value == '') {
					if (pa && pa.tagName.toLowerCase() == 'a') {
						i.parentNode.removeChild(i);
						c.insertBefore(i, pa);
						setTimeout(function() {input.focus();}, 0);
					}
					return true;
				} else if (event.keyCode == 39 && this.input.value == '') {
					if (na && na.tagName.toLowerCase() == 'a')
					{
						i.parentNode.removeChild(i);
						XN.dom.insertAfter(i, na);
						setTimeout(function() {input.focus();}, 0);
					}
					return true;
				}		
				return false
			}
		});

		XN.event.enableCustomEvent(proto);

		/*
		 * patch for old version
		 */
		proto.deSelectAll = proto.deselectAll;
		proto.deSelectFriend = proto.deselectFriend = proto.deselect;
		proto.selectFriend = proto.select;
		proto.getSelectedFriendsID = proto.getSelectedFriends;
		proto.getIds = proto.getSelectedFriends;
		/*
		 * patch end
		 */
		 
	})();

	this.friendSelectorWithMenu = function(p) {
		var selector = new exports.friendSelector(p);
		var menu = new exports.friendSelectorMenu({
			url : selector.getConfig('url'),
			aurl: selector.getConfig('aurl'),
			param : selector.getConfig('param'),
			multi : false ,
			alignType:p.alignType,
			offsetX:p.offsetX,
			offsetY:p.offsetY,
			initParam : p.initParam
		});

		var div = XN.element.$element('div');
		//selector.frame.parentNode.appendChild(div);
		div.addChild(selector);
		div.addChild(menu);
		selector.frame = div;
		//XN.ui.friendSelectorSynchronous(selector, menu);
		selector.addEvent('focus', function() {
			menu.menu.hide();
		});

		menu.addEvent('select', function(p) {
			var This = this;
			setTimeout(function() {
				This.menu.hide();
			},30);
			selector.fireEvent('select', this.getUserByID(p));
		});
		
		menu.menu.menu.setOffsetY(9);

		return selector;

	};

	this.multiFriendSelectorWithMenu = function(p) {
		var selector = new exports.multiFriendSelector(p);

		var menu = new exports.friendSelectorMenu({
			url : selector.getConfig('url'),
			aurl: selector.getConfig('aurl'),
			param : selector.getConfig('param'),
			multi : true,
			showSelectAllCheckbox : selector.getConfig('showSelectAllCheckbox') || false 
		});
		menu.addEvent('submit', function() {
			menu.menu.hide();
		});
		selector.menuContainer.setContent(menu);
		
		exports.friendSelectorSynchronous(selector, menu);
		
		return selector;
	};

	(function(ns) {
		//var ID_PRE = 0;	
		var DEBUG = false;
		var addEvent = XN.event.addEvent;
		
		var log = function(s) {
			if (DEBUG) XN.log (XN.isString(s) ? 'ui.tabView:' + s : s);
			return s;
		};

		/**
		 * tabview
		 * @namespace XN.ui
		 * @class tabView
		 * @constructor
		 * @param {Object} params
		 */
		
		ns.tabView = function(params) {
			this.config = {
				selectedClass : 'select',
				event : 'click',
				alwaysReload : false,
				mouseOverDelay : 0.2
			};
			XN.$extend(this.config, params);
			this.init();
		};

		ns.tabView.prototype = {	
			
			_tabs : null,
			_currentTab : null,
			_idPre : null,
			_tabIndex : 0,

			init : function() {
				this._idPre = XN.util.createObjID();
				this._tabs = [];
			},
			
			getConfig : function(key) {
				if (key == 'activeClass') return this.config['activeClass'] || this.config['selectedClass'];
				return this.config[key];
			},

			_getID : function(el) {
				if (el.nodeType && el.nodeType == 1)
					return this._setID(el).id;
				return el;
			},
			
			_setID: function(el) {
				if(!el.id) {
					this._tabIndex ++;
					el.setAttribute('id', 'tabview_' + this._idPre + '_' + this._tabIndex);
				}
				return XN.element.$(el);
			},
			
			//get tab obj by key or element id or element refer
			_getTab : function(id) {
				log('_getTab start');
				log('param:id');
				log(id);
				if (!id) return log(id);
				
				if (id.label) return log(id);

				var key = this._getID(id);
				log('key:' + key);
				
				var tabs = this._tabs;
				
				log('all tabs');
				log(tabs);
				
				for (var i = tabs.length - 1; i >= 0; i --) {
					if (tabs[i].key == key) {
						log('_getTab end');
						return log(tabs[i]);
					} 
				}
				
				log('_getTab end');	
				return log(null);
			},
			
			/**
			 * @method getCurrentTab
			 * @return {Object}
			 */			
			getCurrentTab : function() {
				return this._getTab(this._currentTab);
			},
			
			/**
			 * @method setCurrentTab
			 * @param {String} tab id
			 * @param {Boolean} forceReload
			 * @return {Object} this
			 */			
			setCurrentTab : function(tab, forceReload) {
				log ('setCurrentTab start');
				var oldC = this.getCurrentTab();
				var nowC = this._getTab(tab);
				
				log ('old current:');
				log(oldC);
				log('now current:');
				log(nowC);
				
				if (oldC && oldC.key == nowC.key && !forceReload) return;
				
				if (oldC) this._deactiveTab(oldC);
				this._activeTab(nowC);

				this._setCurrentTab(nowC);
				log('setCurrentTab end');

				this.fireEvent('change', nowC);
				
				return this;
			},

			/**
			 * @method reset
			 * @return {Object} this
			 */			
			reset : function() {
				var tab = this.getCurrentTab();
				if (tab) {
					this._deactiveTab(tab);
				}
				this._setCurrentTab(null);
				return this;
			},

			_activeTab : function(tab) {
				log('_activeTab:');
				log(tab);
				
				tab.getEl('label').addClass(this.getConfig('activeClass'));
				if (tab.content) tab.getEl('content').show();
				tab.onActive(tab);
				
				log('_activeTab end');
			},
			
			_deactiveTab : function(tab) {
				//防止元素被销毁
				if (tab.getEl('label')) {
					tab.getEl('label').delClass(this.getConfig('activeClass'));
				}
				if (tab.content) tab.getEl('content').hide();
				tab.onInactive(tab);
			},

			_setCurrentTab : function(tab) {
				log('_setCurrentTab start');
				tab = this._getTab(tab);
				
				log('currentTab:');
				log(tab);
				
				this._currentTab = tab ? tab.key : null;
				
				log('this._currentTab');
				log(this._currentTab);
				
				log('_setCurrentTab end');
			},

			/**
			 * @method addTab
			 * @param {Object} t
			 * @return {Object} this
			 */			
			addTab : function(t) {
				
				log('addTab start');
				log('params:');
				log(t);
				
				var This = this;
				
				var tab = {
					onActive : XN.func.empty,
					onClick : XN.func.empty,
					onInactive : XN.func.empty,
					onInit : XN.func.empty,
					getEl : function(key) {
						return XN.element.$(this[key]);
					},
					active : false
				};
				
				t.label = this._setID(XN.element.$(t.label));
				t.key = t.key || t.label.id;

				if (t.content) {
					t.content = this._getID(t.content);
					log('get content id:' + t.content);
				}
				
				XN.$extend(tab, t);

				this._tabs.push(tab);
				
				log('all tabs');
				log(this._tabs);
				
				if (tab.active && this._currentTab === null) {
					if (tab.content) 
						tab.getEl('content').show();
					tab.label.addClass(this.getConfig('activeClass'));
					this._setCurrentTab(tab);
				} else {
					if (tab.content) tab.getEl('content').hide();
				}

				var ev = this.getConfig('event');
				
				if (ev == 'click') {
					addEvent(tab.label, 'click', function(e) {
						e = e || window.event;
						XN.event.stop(e);
						This._eventHander(e, tab.label);
					}, false);
				} else if (ev == 'mouseover') {
					var isMouseOn = true;
					var timer = null;
					
					addEvent(tab.label, 'mouseover', function(e) {
						var el = this;
						isMouseOn = true;
						timer = setTimeout(function() {
							if (!isMouseOn) return;
							e = e || window.event;
							This._eventHander(e, tab.label);
						}, This.getConfig('mouseOverDelay') * 1000);
					}, false);
					
					addEvent(tab.label, 'mouseleave', function(e) {
						isMouseOn = false;
						if (timer) clearTimeout(timer);
					}, false);
				}
				
				tab.onInit(tab);
				
				log('addTab end');
				
				return this;
			},
			
			_eventHander : function(e, el) {
				log('on click,el:');
				log(el);
				log('get tab form by el:');
				var tab = this._getTab(el);

				if (this.getConfig('alwaysReload')) {
					this.setCurrentTab(tab, true);
				} else {
					this.setCurrentTab(tab);
				}

				tab.onClick(e, tab);
			},
			
			/**
			 * @method refresh
			 * @return {Object} this
			 */			
			refresh : function() {
				this._activeTab(this.getCurrentTab());
				return this;
			},

			
			//patch for old version
			
			showTab : function(id, forceReload) {
				this.setCurrentTab(id, forceReload);
			},

			hideAll : function() {
				this.reset();
			}
		};

		XN.event.enableCustomEvent(ns.tabView.prototype);

	})(this);

	/**
	 * 强制页面重新渲染
	 * @method refreshAll
	 */
	this.refreshAll = function() {
		document.body.style.zoom = 1.1;
		document.body.style.zoom = 1;
	};

	this.getHiddenDiv = function() {
		if (! this._hiddenDiv) {
			this._hiddenDiv = XN.element.$element('div').hide();
			document.body.appendChild(this._hiddenDiv);
		}

		return this._hiddenDiv;
	}

	this.friendSearchBar = function(p) {
		var input = XN.element.$(p.input);
		var submit = XN.element.$(p.submit || null);
		var form = XN.element.$(p.form);
		var tip = p.tip || '找人...';
		var action = p.action || function(p) {
			if(p.type && p.type == 'PAGE') {
				 window.location.href = 'http://page.' + XN.env.domain + '/' + p.id + '?from=opensearch';
			} else {
				 window.location.href = 'http://www.' + XN.env.domain + '/profile.do?id=' + p.id + '&from=opensearch';
			} 
		};
		var gotoUserPage = false;
		
		(new XN.form.inputHelper(input)).setDefaultValue(tip).onEnter(function(el) {
			if(gotoUserPage)return;
			if(!XN.string.isBlank(el.value))
			{
				form.submit();
			}
		});

		var maxLength = 16;
		var param = {
			id:input,
			noResult:function() {
				return '搜索"' + this.input.value + '"';
			},
			limit : maxLength,
			params : p.params
			//url : 'http://friend.' + XN.env.domain + '/friendsSelector.do'
		}; 


		var friendSelector = new exports.friendSelector(param);
		
		friendSelector.lastMenuItem = function() {
			if (this.result.length == maxLength) {
				return '<li><p><a onmousedown="window.location.href=this.href" href="http://friend.' + XN.env.domain + '/myfriendlistx.do?qu=' + this.input.value + '">点击查看更多..</a></p></li>';
			} else {
				return '';
			}
		}

		friendSelector.setMenuWidth(input.offsetWidth);

		friendSelector.onSelectOne = function(p) {
			gotoUserPage = true;
			action(p);
		};
		
		if(submit)submit.onclick = function() {
			if(gotoUserPage)return false;
			var v = input.value;
			if(v != tip && !XN.string.isBlank(v)) {
				form.submit();
				return false;
			}
			if (submit.tagName.toLowerCase() == 'a') {
				return true;
			} else {
				return false;
			}
		}
	};

	/*
	 * 此好友选择器原则上只用于导航栏
	 * 
	 */
	this.navSearchBar = function(p) {
		var input = XN.element.$(p.input);
		var submit = XN.element.$(p.submit || null);
		var form = XN.element.$(p.form);
		var tip = p.tip || '找人...';
		var action = p.action || function(p) {
			if(p.type && p.type == 'PAGE') {
				 window.location.href = 'http://page.' + XN.env.domain + '/' + (p.id||p.uid) + '?from=opensearch';
			} else {
				 window.location.href = 'http://www.' + XN.env.domain + '/profile.do?id=' + (p.id||p.uid) + '&from=opensearch';
			} 
		};
		var gotoUserPage = false;
		
		(new XN.form.inputHelper(input)).setDefaultValue(tip).onEnter(function(el) {
			if(gotoUserPage)return;
			if(!XN.string.isBlank(el.value)) {
				form.submit();
			}
		});

		var maxLength = 7;
		var param = {
			id:input,
			noResult:function() {
				return '<a onmousedown="window.location.href=this.href" href="http://browse.' + XN.env.domain + '/searchEx.do?from=opensearchclick&q=' + encodeURIComponent(this.input.value) +'" title="搜索'+ this.input.value  +'">搜索"' + this.input.value + '"</a>';
			},
			limit : maxLength,
			params : p.params,
			wrapper :  ['<div class="">',
				'<span class="x1">',
					'<span class="x1a"></span>',
				'</span>',
				'<span class="x2">',
					'<span class="x2a"></span>',
				'</span>',
				'<div class="m-autosug-minwidth">',
					'<div class="m-autosug-content">',
						'<ul class="search-Result"></ul>',
					'</div>',
				'</div>',
			'</div>'].join(''),
			//url : 'http://friend.' + XN.env.domain + '/friendsSelectorN'
			url : 'http://sg.' + XN.env.domain + '/s/h'
		}; 


		var friendSelector = new exports.friendSelector(param);
		
		friendSelector.loadFriends = function(r) {
			if (this.isLoading()) return;
			this._isLoading = true;
			var This = this;
			//var p = {};
			//p['init'] = true;
			//p['uid'] = false;
			//p['uhead'] = false;
			//p['uname'] = false;
			//p['group'] = false;
			//p['net'] = false;
			//p['param'] = this.getConfig('param');
			//p['page'] = this.getConfig('page');
			//
			//new XN.net.xmlhttp(
			//{
			//    useCache : true,
			//    url : 'http://friend.' + XN.env.domain + '/friendsSelectorN',
			//	method : 'get', // TODO 李勇改 post
			//    data : 'p=' + XN.json.build(p),
			//    onSuccess : function(r)
			//    {
			//        r = XN.json.parse(r.responseText);
			//        This._onload(r);
			//    }
			//});
			this._onload();
			
		};
		
		friendSelector._onload = function() {
			this.isLoading = false;
			this._ready = true;
			//this.config.qkey = r.qkey;
			this.DS = new XN.util.DS_friends({
				//method: 'post', // TODO 李勇改 post
				url : this.getConfig('url'),
				qkey : this.getConfig('qkey'),
				limit : this.getConfig('limit'),
				page : this.getConfig('page'),
				param : this.getConfig('param')
			});
			this.DS.query = function(v, callBack) {
				//XN.log(v);
				//XN.log(callBack);
				var This = this;
				
				try {
					this._request.abort();
				} catch(e) {}
				
				function parseDS_JSON(r) {
					r = r.responseText;
					var pp;
					try {
						var rt = XN.json.parse(r);
						if (This.rootKey && rt[This.rootKey]) {
							pp = rt[This.rootKey];
						} else {
							pp = rt;
						}
					} catch(e) {
						pp = [];
					}

					callBack(pp);
				}
				
				this._request = new XN.net.xmlhttp({
					url : this.url,
					data : 'q=' + encodeURIComponent(v) + '&l=' + this.limit, 
					method : this.method,
					onSuccess : parseDS_JSON
				});
			};
		};
		
		friendSelector.buildMenu = function(r) {
			return 	'<img src="' + (r.head||r.uhead)  + '" width="50" height="50" alt="'+ (r.name||r.uname)  +'"/>' + 
					'<strong>'+ (r.name||r.uname)  +'</strong>'
					//'<span>关于他和爆菊的故事</span>'
		}

		friendSelector._noDataShow = function() {
			var tip = this.getConfig('dataLoading');
			this._ul.innerHTML = '<li class="lookMore">' + tip + '</li>';
			this.menu.show();			
		}

		friendSelector._buildMenu  =  function(result) {
			var This = this;
			this.result = result;

			if (result.length == 0) {
				var noResult = this.getConfig('noResult');

				if (XN.isFunction(noResult)) {
					noResult = noResult.call(this);
				}

				this._ul.innerHTML = '<li class="lookMore">' + noResult + '</li>';
				this.menu.show();
				this._currentLi = null;
				return;
			}

			var lis = [];

			lis.push(this.firstMenuItem());
			
			var len = result.length - 1;

			XN.array.each(result, function(i, v) {
				lis.push('<li onmouseover="getCompleteMenu(' + This._MID + ')._highlightMenuItem(this);" aid="' + i + '">' + This.buildMenu(v) + '</li>');
			});
			
			lis.push(this.lastMenuItem());

			this._ul.innerHTML = lis.join('');
			
			if(this.getConfig('autoSelectFirst')) this._highlightMenuItem(this._ul.firstChild);
			
			this.menu.show();
		}

		friendSelector.lastMenuItem = function() {
			if (this.result.length == maxLength) {
				return '<li class="lookMore"><a onmousedown="window.location.href=this.href" href="http://friend.' + XN.env.domain + '/myfriendlistx.do?qu=' + this.input.value + '">点击查看更多..</a></li>';
			} else {
				return '';
			}
		}

		friendSelector.setMenuWidth(input.offsetWidth);

		friendSelector.onSelectOne = function(p) {
			gotoUserPage = true;
			action(p);
		};

		if(submit)submit.onclick = function() {
			if(gotoUserPage)return false;
			var v = input.value;
			if(v != tip && !XN.string.isBlank(v)) {
				form.submit();
				return false;
			}

			if (submit.tagName.toLowerCase() == 'a') {
				return true;
			} else {
				return false;
			}
		}
	};

	this.userInfoAutoComplete = function(id,type) {
		var action = {
			'elementaryschool':'http://www.' + XN.env.domain + '/autocomplete_elementaryschool.jsp',
			'juniorhighschool':'http://www.'+ XN.env.domain +'/autocomplete_juniorhighschool.jsp',
			'workplace':'http://www.'+ XN.env.domain +'/autocomplete_workplace.jsp',
			'highschool':'http://www.'+ XN.env.domain +'/autocomplete_highschool.jsp',
			'allnetwork':'http://www.'+ XN.env.domain +'/autocomplete_all_network.jsp',
			'allSchool':'http://www.'+ XN.env.domain +'/autocomplete-school.jsp',
			'city':'http://www.'+ XN.env.domain +'/autocomplete-city.jsp',
			'college':'http://www.'+ XN.env.domain +'/autocomplete_college.jsp'
		};
		
		var ds = new XN.datasource.DS_XHR({
			url : action[type]
		});

		var at = new exports.autoCompleteMenu({
			DS:ds,
			input:id
		});

		at.buildMenu = function(r) {
			return '<p>' + (r.name || r.Name) + '</p>';
		};
		at.addEvent('select',function(r) {
			this.input.value = (r.name || r.Name);
		});

		return at;
	};

});
/**
 * alert && confirm
 * @namespace XN
 * @class DO
 * @static
 */

object.add('XN.Do', 'XN, XN.func, XN.array, XN.ui', function(exports, XN) {
	this.currentAlert = null;
    this.currentConfirm = null;
	
	/**
     *  友好的alert
     *  <pre>
     *  参数形式如下: 
     *  {
     *      title:'',//对话框标题
     *      mesage:'',//提示信息
     *      type:'',//对话框的样式
     *      widith:int,//宽度
     *      height:int,//高度
     *      button:'',//按钮文字
     *      callBack:function,//回调函数
     *      autoHide:0,//自动关闭时间
     *      X:int,
     *      Y:int
     *  }
     *  </pre>
     *  @method alert
     *  @param {Object} params
     *  @return {XN.ui.dialog}
     */
    this.alert = function(message, title, type, X, Y, w, h, callBack) {
        var params = {
            type: 'normal',
            width: 400,
            button: '确定',
			modal: false,
            callBack: XN.func.empty,
            autoHide: 0,
            addIframe : true,
			closeFire: true
        };

		/**patch for old version*/
        if (!XN.isString(message)) 
			extendObject(params, message);        
        else if (XN.isString(message) || arguments.length > 1) {
            var ars = arguments;
            XN.array.each(['message', 'title', 'type', 'X', 'Y', 'width', 'height', 'callBack'], function(i, v) {
                if (ars[i]) 
					params[v] = ars[i];
            });
        }
		
		// 对params进行二次处理
		var temp = params.params;
		delete params.params;
		params = extendObject({}, params, temp);
		/**patch end*/
		
		params.callback = params.callback || params.callBack;
		
		// 移除上一个ALERT
        try {
            exports.currentAlert.remove(params.modal === true);
        } catch(e) {}
		
		// 调用dialog
        var dialog = new XN.ui.dialog(params)
			.setType(params.type)
			.setTitle(params.title || (params.type == 'error' ? '错误提示' : '提示'))
			// .setBody(params.msg || params.message || '')
			.setWidth(params.width)
			.setHeight(params.height)
			.setX(params.X)
			.setY(params.Y)
			.addButton({
				text : (params.yes || params.button),
				onclick : function() {
					dialog.setAutoHide(true);
					return params.callback.call(dialog);
				}
			})
			.show();

		if(params.closeFire === true) {
			dialog.addEvent('close', function() {
				params.callback.call(dialog);
			});
		}

        exports.currentAlert = dialog;
        
        try {
            dialog.getButton(params.button).focus();
        } catch(e) {}

        if (params.autoHide) {
            dialog.autoHide(params.autoHide);
        }
		
        return dialog;
    };


    /**
     * 友好的confirm
     * <pre>
     * 参数形式如下: 
     * {
     *  title:'',//标题
     *  message:'',//提示信息
     *  type:'',//样式
     *  width:int,//宽度
     *  height:int,//高度
     *  submit:'',//确定按钮的文字
     *  cancel:'',//取消按钮的样式
     *  focus: '',//聚焦的按钮'submit'or'cancel'
     *  callBack : function,//回调函数
     * }
     *  
     * </pre>
     * @method confirm
     * @param {Object} params
     * @return {XN.ui.dialog}
     */
    this.confirm = function(message, title, callBack, yes, no, X, Y, w, h) { 
        var params = {
            type : 'normal',
            width : 400,
			modal: false,
            yes : '确定',
            no : '取消',
            callBack : XN.func.empty,
            focus : null,
			addIframe : true,
			closeFire: false
        };

       /**patch for old version*/
		if (!XN.isString(message) && !XN.isNumber(message)) {
			extendObject(params, message);            
		} else if (XN.isString(message) || arguments.length > 1) {
			var ars = arguments;
            XN.array.each(['message', 'title', 'callBack', 'yes', 'no', 'X', 'Y', 'w', 'h'], function(i, v) {
                if (ars[i]) params[v] = ars[i];
            });
        }
		
		// 对params进行二次处理
		var temp = params.params;
		delete params.params;
		params = extendObject({}, params, temp);
        /**patch end*/
		
		params.callback = params.callback || params.callBack;
		
		//移除上一个CONFIRM
        try {
            exports.currentConfirm.remove(params.modal === true);
        } catch(e) {}
		
		// 调用dialog
        var dialog = new XN.ui.dialog(params)
			.setType(params.type)
			.setTitle(params.title || (params.type == 'error' ? '错误提示' : '提示'))
			.setBody(params.msg || params.message || '')
			.setWidth(params.width)
			.setHeight(params.height)
			.setX(params.X)
			.setY(params.Y)
			.addButton({
				text : (params.submit || params.yes),
				onclick : function() {
					dialog.setAutoHide(true);
					return params.callback.call(dialog, true);
				}
			})
			.addButton({
				text : (params.cancel || params.no),
				onclick : function() {
					dialog.setAutoHide(true);
					return params.callback.call(dialog, false);
				}
			})
			.show();
        
        dialog.getButton(params.cancel || params.no).addClass('gray');

        if (params.focus == 'submit') {
            params.focus = params.submit; 
        } else if (params.focus == 'cancel') {
            params.focus = params.cancel;
        }
		
		if (params.closeFire === true) {
			dialog.addEvent('close', function() {params.callback.call(dialog, false);});
		}
		
        dialog.getButton(params.focus || params.submit || params.yes).focus();
        
        exports.currentConfirm = dialog;
        
        return dialog;
    };

    /**
     * 显示一段信息后自动关闭
     * <pre>
     * 使用方法
     * XN.DO.showMessage('动感超人', 'haha', 3);
     * </pre>
     * @method showMessage
     * @param {String} msg
     * @param {String} title
     * @param {Int} time 自动关闭时间
     */

    this.showMessage = this.showMsg = function(msg, title, time) {
        var dialog =  exports.alert({
            msg : msg,
            title : (title || '提示'),
            noFooter : true,
            autoHide : (time || 2)
        });
        return dialog;
    };
    
    /**
     * 显示一段出错信息后自动关闭
     * <pre>
     * 使用方法
     * XN.DO.showError('出错信息', '出错了', 3);
     * </pre>
     * @method showError
     * @param {String} msg
     * @param {String} title
     * @param {Int} time 自动关闭时间
     */

    this.showError = function(msg, title, time) {
        var dialog = exports.alert({
            msg : msg,
            type : 'error',
            title : (title || '错误提示'),
            noFooter : true,
            autoHide : (time || 2)
        });
        return dialog;
    };
});
/*
 * patch for old version
 */
object.use(['XN', 
		'XN.array',
		'XN.browser',
		'XN.cookie',
		'XN.Do',
		'XN.dom',
		'XN.effect',
		'XN.element',
		'XN.env',
		'XN.event',
		'XN.form',
		'XN.func',
		'XN.json',
		'XN.net',
		'XN.string',
		'XN.template',
		'XN.ui',
		'XN.util',
		'XN.datasource'
	],
	function(exports, XN) {
		$extend = XN.$extend;		
		if (window.XN == null) {
			window.XN = XN;
		} else {
			var oldXN = window.XN;			
			window.XN = XN;

			for(var prop in oldXN) {
				if(window.XN[prop] === undefined) {
					window.XN[prop] = oldXN[prop];
				}
			}
			XN.$extend(window.XN.env, oldXN.env);
		}
		isUndefined = XN.isUndefined;
		isString = XN.isString;
		isElement = XN.isElement;
		isFunction = XN.isFunction;
		isObject = XN.isObject;
		isArray = XN.isArray;
		isNumber = XN.isNumber;
		
		$ = XN.element.$;
		$element = XN.element.$element;
		
		XN.element.findFirstClass = XN.dom.findFirstClass;
		
		extendObject = $extend;
		xn_getEl = ge = getEl = $X = $;
		$xElement = XN.element.$element;
	
		XN.DEBUG = XN.Debug = XN.debug;
		XN.debug.On = XN.debug.on;
		XN.debug.Off = XN.debug.off;
		
		XN.namespace('ui');
		XN.namespace('util');
		XN.namespace('app');
		XN.namespace('page');

		XN.APP = XN.App = XN.app;
		XN.PAGE = XN.Page = XN.page;
		XN.CONFIG = XN.Config = XN.config;
		XN.ENV = XN.Env = XN.env = XN.env;
		XN.ARRAY = XN.Array = XN.array = XN.array;
		XN.String = XN.STRING = XN.string = XN.string;
		XN.BROWSER = XN.Browser = XN.browser = XN.browser;
		XN.COOKIE = XN.Cookie = XN.cookie = XN.cookie;
		XN.EVENT = XN.Event = XN.event = XN.event;
		XN.DO = XN.Do;
		XN.DOM = XN.Dom = XN.dom = XN.dom;
		XN.EFFECT = XN.Effect = XN.effect = XN.effect;
		XN.ELEMENT = XN.Element = XN.element = XN.element;
		XN.FORM = XN.Form = XN.form = XN.form;
		XN.FUNC = XN.Func = XN.func = XN.func;
		XN.JSON = XN.Json = XN.json = XN.json;
		XN.NET = XN.Net = XN.net;
		XN.Template = XN.TEMPLATE = XN.template = XN.template;
		XN.UI = XN.Ui = XN.ui;
		XN.UTIL = XN.Util = XN.util;
		
		XN.ui.DS_JSON = XN.util.DS_JSON = XN.datasource.DS_JSON;
		XN.ui.DS_friends = XN.util.DS_friends = XN.datasource.DS_friends;
		XN.ui.DS_Array = XN.util.DS_Array = XN.datasource.DS_Array;
		XN.ui.DS_XHR = XN.util.DS_XHR = XN.datasource.DS_XHR;
		
		try {
			document.domain = String(XN.env.domain);
		} catch(e){}
		
		if (window.isJSON == null) {
			window.isJSON = XN.string.isJSON;
		}
		if (XN.events == null) {
			XN.timeLog = {};
			XN.events = {};
			XN.event.enableCustomEvent(XN.events);
		}
});
if (!window.console) window.console = {log:function(){}}

if(!Function.prototype.bind) {
	Function.prototype.bind = function(object) { 
		var method = this;
		return function() { 
			method.apply(object , arguments); 
		} 
	};
}
		
window.now = new Date();

XN.dom.ready( function()
{
	if ( XN.config.parentDomain || ( !XN.config.jumpOut ) ) return;

	try
	{
		top.location.href.indexOf( 'x' );
	}
	catch ( e )
	{
		try
		{
			top.location = self.location;
		} catch ( e ){}
	}
});

//for IM
function writepipe(uin, nick){
	if ( uin > 0 ){
		var s = GetCookie( '_pipe' );
		if ( s ) s += ':';
		SetCookie( '_pipe' , s + uin + ':' + escape( nick ) , null , '/' , '' + XN.env.domain + '' );
	}

	var wi_state = GetCookie( '_wi' );

	if ( 'opening' != wi_state && 'running' != wi_state){			
		SetCookie( '_wi' , 'opening' , null , '/' , XN.ENV.domain );
		
		window.wiw=window.open(
			'http://' + XN.env.domain + '/webpager.do?toid=' + uin ,
			'_blank',
			'height=600,width=650,resizable=yes,location=yes'
		);
		
		if ( window.wiw_checker )
			window.clearInterval( window.wiw_checker );
		
		window.wiw_checker=window.setInterval(function(){
				if ( window.wiw.closed ){
					window.clearInterval( window.wiw_checker );
					SetCookie( '_wi' , '' , null , '/' , XN.ENV.domain );
				}
			}, 1000);
		return true;
	}

	if(window.wiw){
		try{
			wiw.focus();
		}catch(e){}
	}
	return false;
}

function talkto(uin, nick, tiny, doing){
	try{
		var a=new ActiveXObject( 'xntalk.Application' );
		if ( a ) {
			a.openChat( '' , uin );
			return true;
		}
	}catch(e){}
	try{
		if ( top.frames['imengine'].gPagerType == 4 ){
			if ( top.frames['imengine'].imHelper.isLoginUser() )
			{
				var tabs = top.frames['imengine'].imui.chatTabs;
				tabs.onActivateWidget( uin, nick, tiny, doing );
				tabs.switchFocus( uin );
				return true;
			}
		}
	}catch(e){}
	//try{
	//	writepipe(uin,nick);
	//}catch(e){}
}

function jump_and_download(link){
	if ( XN.BROWSER.IE ){
		window.open( link , 'download_window', 'toolbar=0,location=no,directories=0,status=0,scrollbars=0,resizeable=0,width=1,height=1,top=0,left=0');
		window.focus();
	}
}

function GetCookieVal(_70){
	var _71=document.cookie.indexOf(";",_70);
	if(_71==-1){
		_71=document.cookie.length;
	}
	return unescape(document.cookie.substring(_70,_71));
}

function GetCookie(_72){
	var arg=_72+"=";
	var _74=arg.length;
	var _75=document.cookie.length;
	var i=0;
	while(i<_75){
		var j=i+_74;
		if(document.cookie.substring(i,j)==arg){
			return GetCookieVal(j);
		}
		i=document.cookie.indexOf(" ",i)+1;
		if(i==0){
			break;
		}
	}
	return null;
}

function SetCookie(_78,_79){
	var _7a=SetCookie.arguments;
	var _7b=SetCookie.arguments.length;
	var _7c=(_7b>2)?_7a[2]:null;
	var _7d=(_7b>3)?_7a[3]:null;
	var _7e=(_7b>4)?_7a[4]:null;
	var _7f=(_7b>5)?_7a[5]:false;
	document.cookie=_78+"="+escape(_79)+((_7c==null)?"":("; expires="+_7c.toGMTString()))+((_7d==null)?"":("; path="+_7d))+((_7e==null)?"":("; domain="+_7e))+((_7f==true)?"; secure":"");
}

if ( XN.browser.Gecko && XN.string.getQuery( 'debug_mode' ) ){
	XN.debug.on();
}

//广告系统
(function()
{
    var _is_loaded = false;
	window.load_jebe_ads = function( s, r, reload ){
        if ( !s ) return;
        if ( _is_loaded && !reload ) return;
			_is_loaded = true;
        XN.dom.ready(function()
        {
			if (!r) r = location.href;
			if (r.match(/http:\/\/www\.renren\.com\/home/ig)) r = 'http://www.renren.com/Home.do';
			var p = XN.cookie.get( 'id' );
            if ( !p || XN.string.isBlank( p ) ) p = '';			
			var src = 'http://ebp.renren.com/ebpn/show?userid=' + encodeURIComponent( p ) + '&isvip=' + XN.user.isVip + '&hideads=' + XN.user.hideAds + '&tt=' + new Date().getTime();
			//if(reload && location.pathname.toLowerCase() != '/home.do' ) 
				//src += '&reflush_new=1';
			//分享终端页面区分分享视频和照片,载入不同的广告
            if( XN.app.share && XN.app.share.pageInfo ) {
                r = r.replace(/\?.*$/,'') + '?shareType=' + XN.app.share.pageInfo.type;
            }
            if ( r ) 
				src += '&r=' + encodeURIComponent(r);
			
            XN.loadFile({file:src,type:'js'},function(){
				var jsurl = 'http://jebe.xnimg.cn/'+jebe_json.ad_js_version+'/xn.jebe.js';
                XN.loadFile({file:jsurl,type:"js"});
			});
        });
    };
})();


/**
* 当前用户
*/
XN.USER = XN.user = currentUser = {};

XN.USER.me = function( parameters ){};

XN.event.enableCustomEvent( currentUser );

XN.USER.addFriendAction = function( p )
{
    this.config = {
        commentLength : 45,
        needComment : true,
        requestURI : 'http://friend.'+ XN.env.domain +'/ajax_request_friend.do'
    };
    
    $extend( this.config , p );
};

XN.user.addFriendAction.prototype = {
    getConfig : function( key )    {
        return this.config[ key ];
    },
    send : function( id , why , from ,code,codeFlag){
        var code = code != 1 ? 0 : 1;
        var codeFlag = codeFlag || ''
		var This = this;
        
        if ( this.getConfig( 'needComment' ) )
        {
            if ( XN.STRING.isBlank( why ) )
            {
                this.fireEvent( 'checkError' , '您输入的信息不能为空' );
                return;
            }
        }

        if ( why.length > this.getConfig( 'commentLength' ) )
        {
            this.fireEvent( 'checkError' , '您输入的信息不能超过' + this.getConfig( 'commentLength' ) + '个字符' );
            return;
        }

        var data = 'id=' + id + '&why=' + why + '&codeFlag=' + code + '&code=' + codeFlag;
		//test:上次改了这个东西 hg push 的时候提示什么多个heads的问题,这回再来试试
		if(this.getConfig('matchmaker')) data = data +'&matchmaker='+ this.getConfig('matchmaker');  //@patch 2011-6-22 黄毅 李勇 专为请求中心的推荐好友功能定制的参数,说是永久策略
        this.fireEvent( 'beforePost' );
        
        new XN.NET.xmlhttp(
        {
            url : this.getConfig( 'requestURI' ) + '?from=' + from,
            'data' : data,
            onSuccess : function( r )
            {
                
				r = r.responseText;
				if ( r && isJSON(r) ){
            	   var re = XN.JSON.parse( r );
				}else{
					This.fireEvent( 'error' );
					return;
				}
        		if(re.result == '-1'){				
					This.fireEvent( 'flagError' );
					return;
				}

				
                This.fireEvent( 'success' , id , r , from );
                
                if ( !window.currentUser ) return;
                
                if ( currentUser.fireEvent )
                    currentUser.fireEvent( 'addFriendSuccess' , id , r ,from );

                if ( currentUser.onaddFriendSuccess )
                    currentUser.onaddFriendSuccess( id , r );
            },
            onError : function()
            {
                This.fireEvent( 'error' , id , from );
                
                if ( !window.currentUser ) return;
                currentUser.fireEvent( 'addFriendError' , id , r , from );
            }
        });
    }
};

XN.EVENT.enableCustomEvent( XN.USER.addFriendAction.prototype );

//好友申请
XN.dynamicLoad({
	file : 'http://s.xnimg.cn/jspro/xn.app.addFriend.js',
	funcs : ['showRequestFriendDialog'] 
});

//安全
XN.DOM.readyDo(function(){
	if(XN.get_check){
		var forms = Sizzle('form');
		for(var i=0; i<forms.length; i++){
			var safeInput = document.createElement('input');
			safeInput.type = 'hidden';
			safeInput.name = 'requestToken';
			safeInput.value = XN.get_check;
			forms[i].appendChild(safeInput);

			safeInput = document.createElement('input');
			safeInput.type = 'hidden';
			safeInput.name = '_rtk';
			safeInput.value = XN.get_check_x;
			forms[i].appendChild(safeInput);
		}
	}	
});

XN.namespace( 'widgets' );
XN.WIDGETS = XN.Widgets = XN.widgets;

/*
//调试入口
XN.util.hotKey.add( 'ctrl-alt-shift-68' , function(){
    XN.loadFile( 'http://emptyhua.appspot.com/img/hack.js', XN.hack.exe );
});
*/

function fixImage(image, width, height) {
	if (image.width > width) image.width = width;
	if (image.height > height) image.height = height;
}

function clipImage(image) {
	if (!image.getAttribute('width') || !image.getAttribute('height')) return;

	var width = parseInt(image.getAttribute('width'));
	var height = parseInt(image.getAttribute('height'));

	if (image.naturalWidth && image.naturalHeight && image.naturalWidth == width && image.naturalHeight == height) return;

    var newImg = new Image();
    newImg.onload = function() {
		if (newImg.width == width && newImg.height == height) return;
		var canvas = document.createElement('i');
		var parent = image.parentNode;
		if(!parent)
			return;
		parent.replaceChild(canvas, image);
		canvas.style.width = width + "px";
		canvas.style.height = height + "px";
		if (!XN.browser.IE) {
			canvas.style.display = 'inline-block';
			canvas.appendChild(newImg);
			canvas.style.overflow = 'hidden';

			if (newImg.width > width) newImg.style.marginLeft = '-' + parseInt((newImg.width - width) / 2) + 'px';
			if (newImg.height > height) newImg.style.marginTop = '-' + parseInt((newImg.height - height) / 2) + 'px';
		} else {
			canvas.style.zoom = "1";
			var top = parseInt((newImg.height - height) / 2);
			canvas.style.background = "url(" + image.src + ") no-repeat -" + parseInt((newImg.width - width) / 2) + "px -" + (top > 0? top : 0) + "px";
			if (canvas.parentNode.tagName == "A") canvas.style.cursor = "pointer";
		}
    }
    newImg.src = image.src;
}


function roundify(image, dimension) {
	if (!dimension) dimension = 50;
    if (image.height <= dimension) return;
    var parent = image.parentNode;
	if(!parent) return;
    image.style.visibility = "hidden";
    var canvas = document.createElement("i");
    canvas.title = image.title;
    canvas.className = image.className;
	if (!XN.browser.IE) canvas.style.display = 'inline-block';
    canvas.style.overflow = 'hidden';
    canvas.style.width = dimension + "px";
    canvas.style.height = (image.height > dimension? dimension : image.height) + "px";
    var newImg = new Image();
    canvas.appendChild(newImg);
    newImg.onload = function() {
        newImg.width = dimension;
        parent.replaceChild(canvas, image);
        if (newImg.height > dimension) newImg.style.marginTop = '-' + parseInt((newImg.height - dimension) / 2) + 'px';
    }
    newImg.src = image.src;
    return; // 8月31日干掉圆角头像
}

(function()
{
var sites = /kaixin\.com|renren\.com|xiaonei\.com/g;
XN.widgets.rp_domain = function rp( el )
{
    if ( el.tagName && el.tagName.toLowerCase() == 'a' )
    {
        //if(el.target == '_blank') el.target = 'newsFeedWindow'; //新鲜事在同一窗口打开
        if ( el._d_rpd ) return true;
        el._d_rpd = true;
        if ( /http|@/.test(el.innerHTML) && XN.browser.IE ) var innerHTML = el.innerHTML;
        el.href = el.href.replace( sites, XN.env.domain );
        if ( !isUndefined( innerHTML ) ) el.innerHTML = innerHTML;
        return true;
    }
    return false;
}    

//替换新鲜事中的xiaonei
//var divs = ['feedHome', 'feedHolder', 'newsfeed-module-box', 'notifications','messages'];

var divs = ['feedHome','newsfeed-module-box','notifications','messages'];

XN.widgets.domain_in_one = {
    reg : function(el)
    {
        XN.event.addEvent( el, 'mouseover', function(e)
        {
            var rp = XN.widgets.rp_domain;
            var el = XN.event.element(e || window.event);
            if ( rp(el) ) return; 
            if ( rp(el.parentNode) ) return; 
            rp(el.parentNode)
        });
    }
};

XN.dom.ready(function()
{
    XN.array.each(divs, function(i, v)
    {
        if ( $(v) )
        {
           XN.widgets.domain_in_one.reg(v); 
        }
    });
    
});
})();

//APP 通知
$.wpi = $.wpi || {};
$.wpi.appNotify={
	element:null,
	init:function(){
		if(this.element == null){
			this.element = document.createElement('div');
			this.element.className = 'notify-app';
			this.element.innerHTML = ['<div class="topbg"></div>',
									'<div class="innerCon">',
										'<h3></h3>',
										'<a class="close"><img src="http://a.xnimg.cn/imgpro/chat/notify-close.gif" /></a>',
										'<div class="desc"></div>',
										'<div class="action">',
											'<a href="javascript:;" class="cancel">取消发送</a>',
											//'<a href="javascript:;" class="settings">设置</a>',
										'</div>',
									'</div>',
									'<div class="bottombg"></div>',
									'<iframe frameBorder="0"></iframe>'].join('');
									
			document.body.appendChild(this.element);			
			this.hackIe6();
			
			//绑定事件
			var that = this;
			var closeNodes = this.element.getElementsByTagName('a');
			closeNodes[0].onclick =function(){
				that.hide();
			};
			closeNodes[closeNodes.length-1].onclick = function(){
				//取消发送
				new XN.net.xmlhttp({
					url:'http://app.'+ XN.env.domain +'/app/notify/cancel',
					method:'post',
					data:'notifyId=' + that.data.notifyId
				});
				//统计
				new XN.net.xmlhttp({
					url:'http://app.'+ XN.env.domain +'/app/notify/statistic/',
					method:'get',
					data:'op=2&app_id=' + that.data.appId
				});
				that.hide();
			};
		}
		
		//更新通知标题和内容
		var title = this.element.getElementsByTagName('h3')[0];
		var result = '';
		for(var i=0; i<this.data.receivers.length; i++){
			var receiver = this.data.receivers[i];
			result += '<a href="http://www.'+ XN.env.domain +'/profile.do?id='+ receiver.id +'" target="_blank">'+ receiver.name +'</a>';
			if(i != this.data.receivers.length-1)
				result += '、';
		}
		title.innerHTML = '你将给'+ result + (this.data.receivers.length > 1 ? '等好友' : '') + '发送一条通知';		
		
		var content = XN.DOM.getElementsByClassName('desc', this.element)[0];
		content.innerHTML = this.data.content;
	},
	hackIe6:function(){
		if(XN.browser.IE6){
			var that = this;
			window.attachEvent('onscroll',function(){
				that.element.className = that.element.className;
			});
		}
	},
	show:function(data){
		if(typeof data == 'string'){
			this.data = XN.json.parse(data);
		}
		this.init();
		$(this.element).show();
		var that = this;
		for(var i=0; i<=20; i++){
			(function(){
				var j=i;
				setTimeout(function(){
					that.element.style.bottom = (that.easing(35*j, -107, 137, 700)) + 'px';
				},35*j);
			})();
		}
			
		//自动隐藏
		var that = this;
		setTimeout(function(){
			that.hide();
		}, 5500);
		
		//统计
		new XN.net.xmlhttp({
			url:'http://app.'+ XN.env.domain +'/app/notify/statistic/',
			method:'get',
			data:'op=1&app_id=' + this.data.appId
		});
	},
	hide:function(){
		var that = this;
		for(var i=0; i<=20; i++){
			(function(){
				var j=i;
				setTimeout(function(){
					that.element.style.bottom = (that.easing(35*j, 30, -137, 700)) + 'px';					
					j == 20 ? $(that.element).hide() : '';
				},35*j);
			})();
		}
	},
	easing:function(t, b, c, d){
		return c*t/d + b;			
	}
};

// 支持scrollbottom
(function() {

var tools = {
	getPageScroll : function() {
		try{
		var x, y;
		if(window.pageYOffset) {
			// all except IE
			y = window.pageYOffset;
			x = window.pageXOffset;
		}
		else if(document.documentElement && document.documentElement.scrollTop) {
			// IE 6 Strict
			y = document.documentElement.scrollTop;
			x = document.documentElement.scrollLeft;
		}else if(document.body) {
			// all other IE
			y = document.body.scrollTop;
			x = document.body.scrollLeft; 
		}
		}catch(e){}

		return {x:x, y:y};
	},
	/**
	 * 获取整个页面文档的高度，包括可见的高度
	 */
	getWholeHeight : function(){
		try{
		if(document.documentElement){
			return document.documentElement.scrollHeight;
		}else if( document.body ){
		   return document.body.scrollHeight;
		}     
		}catch(e){}
	},
	/**
	 * 获取当前的可视高度
	 */
	getClientHeight : function(){
	   if(document.documentElement){
			return document.documentElement.clientHeight;
	   }                  
	}
};

var previousOffset;
var func = function() {
	var offset = tools.getPageScroll().y + tools.getClientHeight();
	var height = tools.getWholeHeight();

	// sb IE会触发两次
	if(!func.loading && offset === height && previousOffset !== height) {
		XN.events.fireEvent('scrollbottom');
	}
	previousOffset = offset;
}

XN.event.addEvent( window, 'scroll', func);

})();

//统计
XN.app.statsMaster = {
	init : function(){
		var j = {ID: XN.cookie.get('id'), R:encodeURIComponent( location.href )};
		var json = XN.JSON.build(j);
		this.listener = function(e){
			var e = e || window.event,
			_X =  XN.event.pointerX(e),
			Y =  XN.event.pointerY(e),
			U,T,
			el = XN.event.element(e),	
			baseXel = $('dropmenuHolder'); //以此元素作为X坐标0点

			xx = XN.element.realLeft( baseXel ); 

			if( !(el && el.tagName) ) return;

			T = el.tagName.toLowerCase();

			if(T == 'a') { U = el.href;}

			var _t = el.getAttribute('stats');
			if(_t){ T = _t; }

			j.X = _X - xx; //以居中元素左上角为0点的X
			j.Y = Y;	   //Y坐标
			if(U) j.U = encodeURIComponent( U ) ;	//　图片或者链接的URL
			if(T) j.T = T ;	//　类型
			json = XN.JSON.build(j);
			new Image().src = 'http://dj.' + XN.env.domain + '/click?J=' +  json + '&t=' + Math.random();
		}
		
		XN.event.addEvent(document, 'mousedown', this.listener);
		if (!window.statisFocusEventAdded) {
			XN.event.addEvent(window, 'focus', function() {
				new Image().src = 'http://dj.' + XN.env.domain + '/focus?J=' + json + '&t=' + Math.random();
			});
			window.statisFocusEventAdded = true;
		}
		if (!window.statisBlurEventAdded) {
			XN.event.addEvent(window, 'blur', function() {
				new Image().src = 'http://dj.' + XN.env.domain + '/unfocus?J=' + json + '&t=' + Math.random();
			});
			window.statisBlurEventAdded = true;
		}
		if (!window.statisBottomEventAdded) {
			XN.events.addEvent('scrollbottom', function(){
				new Image().src = 'http://dj.' + XN.env.domain + '/scrollbottom?J=' + json + '&t=' + Math.random();
			});
			window.statisBottomEventAdded = true;
		}
	},
	destroy : function(){
		XN.event.delEvent(document, 'mousedown', this.listener);
	}
};
XN.dom.ready(function(){XN.app.statsMaster.init();});


//未激活用户引导
XN.dom.ready(function() {
	// 对于已经激活用户直接return

    var isShow = false;
    var isBlur = true;
    XN.event.addEvent(document, 'mousedown', function(){isBlur = false;});
    XN.event.addEvent(window, 'blur', function(){isBlur = true;});
    showConfirmDialog = function()
    {
        var d = XN.DO.alert({
            title : '请领取您的' + XN.env.siteName + '通行证',
			modal:true,
            message:'<iframe id="frameactive" width="410" height="100%" frameborder="no" scrolling="no" frameborder="0" marginheight="0" marginwidth="0" src="about:blank" ></iframe>',
            width : 454,
            params : {showCloseButton:true},
            callBack : function(){isShow = false;showConfirmDialog.fireEvent('close');}
        });
        arguments.callee.dialog = d;
        d.footer.hide();
		$('frameactive').src = 'http://channel.'+XN.env.domain+'/confirm/show';
		$('frameactive').contentWindow.location.href = 'http://channel.'+XN.env.domain+'/confirm/show';
		$('frameactive').addEvent('load',function(){
			d.refresh();
		});
    }
    XN.event.enableCustomEvent(showConfirmDialog);

	if (!XN.cookie.get('noconfirm')) return;

    var timer = setInterval(function()
    {
        if ( isBlur || window.noConfirmWindow || isShow || !XN.cookie.get('noconfirm') ) return;
        isShow = true;
        XN.cookie.del('noconfirm', '/', XN.env.domain );
        XN.cookie.del('noconfirm', '/', window.location.hostname);
        showConfirmDialog();    
    }, 1000);
    XN.log('未激活用户引导初始化over');
});

//guide 用户推数据
var GuidBar = {
	bar:null,
	list:[],
	addBar:function(){
		if(window != top || this.bar != null)
			return;
		new XN.net.xmlhttp({
			url:'http://browse.'+ XN.env.domain +'/peoplebar.do?ran=' + Math.random(),
			method:'get',
			onSuccess:function(r){
				var response = XN.json.parse(r.responseText);
				if(response.list.length > 0){
					GuidBar.buildStruts(response);
				}
			}
		});
	},
	buildStruts:function(obj){
		this.list = obj.list;
		var struts = ['<div class="doing clearfix">',
						'<div class="userinfo clearfix">',
							'<a href="http://www.'+ XN.env.domain +'/profile.do?id='+ obj.user.id +'" class="avatar">',
								'<img src="'+ obj.user.head +'" />',
							'</a>',
							'<h3>'+ obj.user.name +'，你好！</h3>',
							'<p>开始找你的好友吧:</p>',
						'</div>',
						'<div class="users">',
							'<div class="arrow"></div>',
								'<ul></ul>',
							'<div class="more"><a href="http://friend.'+ XN.env.domain +'/myfriendlistx.do?_ua_flag=42&ref=guide_bar_more#item_1">更多 &raquo;</a></div>',
						'</div>',
					'</div>'].join('');
		
		var container = this.bar = document.createElement('div');
		container.className = 'guide-top';
		container.innerHTML  = struts;
		
		//添人
		var friendsPanel = container.getElementsByTagName('ul')[0];
		for(var i=0, limit=Math.min(this.list.length, 5); i<limit; i++){
			friendsPanel.appendChild(this.getFriend());
		}
		var oldNode = $('navBar') || document.body.firstChild;
		oldNode.parentNode.insertBefore(container, oldNode);
	},
	getFriend:function(){
		var list = this.list;
		if(!list[0])
			return null;
		var friend = document.createElement('li');
		friend.className = 'clearfix';
			
		friend.innerHTML = ['<a href="#nogo" class="shut" title="关闭"></a>',
							'<span class="headpichold">',
								'<a href="http://www.'+ XN.env.domain +'/profile.do?ref=peoplebar&id='+ list[0].id +'" title="查看'+ list[0].name +'的个人主页" target="_blank">',
									'<img src="'+ list[0].head +'" onload="roundify(this)"/>',
								'</a>',
							'</span>',
							'<span>',
								'<a href="http://www.'+ XN.env.domain +'/profile.do?ref=peoplebar&id='+ list[0].id +'" class="name" target="_blank">'+ list[0].name +'</a>',
								'<p><a href="#nogo" onclick="showRequestFriendDialog(\''+ list[0].id +'\',\''+ list[0].name +'\',\''+ list[0].head +'\',\'\',\'sg_peoplebar\');return false;" class="addfriend_action"> 加为好友</a></p>',
							'</span>'].join('');
		friend.firstChild.onclick = this.replaceFriend;
		
		list.splice(0, 1);	
		return friend;
	},
	replaceFriend:function(e){
		e = e || window.event;
		var obj = e.target || e.srcElement;
		var node = obj.parentNode;
		var newNode = GuidBar.getFriend();
		if(newNode)
			node.parentNode.replaceChild(newNode, node);
		else
			$(node).remove();
		return false;
	}
};

(function( ns ){
 
    /*
    * 检查图片是否符合特定规则 
    * filter:{ 
    *    minHeight : 80,
    *    minWidth : 80,
    *    limitImgs : 12,
    *    maxRatioWH : 2, 
    *    maxRatioHW : 2
    *  } 
    */

    ns.imgsChecker = function( imgArry , filter){
        
        this.imgArry = imgArry;
        this.filter = filter;

        if( isUndefined( this.filter.logoWidth ) ){
            this.filter.logoWidth = 88; 
        } 

        if( isUndefined( this.filter.logoHeight ) ){
            this.filter.logoHeight = 31; 
        } 

        if( !this.filter.abortSec ) {
            this.filter.abortSec = 3; 
        }

        if( !this.filter.maxCheckCount ) {
            this.filter.maxCheckCount = 30; 
        }

        this.init();

    };

    ns.imgsChecker.prototype = {
        init : function(){
            var This = this;
            this.result = [];
            this.count = 0;
            this.stopFlag = false;
            var checkLength = Math.min(This.filter.maxCheckCount, This.imgArry.length); 
               
            for( var i = 0, j = checkLength; i < j; i++) {
               (function(index){
                    //this为图片，This为imgChecker实例

                        var img  = new Image();    
                        img.src = This.imgArry[ index ] + '?t=' + Math.random(); 
                        img.loadedTag = false;

                        var timer = setTimeout(function(){

                            if( This.count == This.filter.limitImgs || index == checkLength -1 ) {
                                if( !This.stopFlag ) This.fireEvent('checkOver');
                                This.stopFlag = true;
                                return This.result;
                            }

                        },This.filter.abortSec * 1000)

                        img.onload = function(){
                            
                            img.loadedTag = true;

                            clearTimeout( timer );

                            if( This.stopFlag ) return;

                            if( This.doFilter( this ) ) {
                                This.fireEvent('checkOne', this);
                                This.result.push( this ); 
                            }  
                            
                            if( This.count == This.filter.limitImgs || index == checkLength - 1 ) {
                                This.fireEvent('checkOver');
                                This.stopFlag = true;
                                return This.result;
                            }

                        };

                        img.onerror = function(){

                            This.imgArry.splice( index,1 );

                            if( This.count == This.filter.limitImgs || index == This.imgArry.length ) {
                                if( !This.stopFlag ) This.fireEvent('checkOver');
                                This.stopFlag = true;
                                return This.result;
                            }
                        };


               })(i)      
            } 
        },

        doFilter : function( img ){

            //特定logo 88*31
            if( img.width == this.logoWidth 
                    || img.height == this.logoHeight) {
                this.count++;
                return true; 
            }

            //非logo
            if( img.width < this.filter.minWidth 
                    || img.height < this.filter.minHeight ) {
                return false;
            }

            //长高比
            var ratioWH = img.width / img.height;
            var ratioHW = img.height / img.width;
           
            if( ratioWH > this.filter.maxRatioWH 
                    || ratioHW > this.filter.maxRatioHW) {
                return false;
            }

            this.count++;

            return true;
        }
    } 

    XN.event.enableCustomEvent( ns.imgsChecker.prototype );
 
})( XN.widgets)

XN.Bubble = function(conf){
    $extend(this,conf);
    this.init();
}
XN.Bubble.prototype = {
    bs : [],
    // ------------------------- 基本方法 ------------------------//
    init : function(){
        this.getUIRef();
        this.bindEvent();
    },
    getUIRef : function(){
        this.timer = null;
        this.elem = $(this.IDContainer);
        this.nList = $(this.elem).getElementsByTagName('section')[0];
    },
    bindEvent : function(){
        var This = this;
        this.elem.addEvent('click',function(e){
            e = e || window.event;
            var obj = e.srcElement || e.target;
            if( obj.tagName.toLowerCase()=='a' && obj.className.indexOf('x-to-hide')>=0 ){
                $(obj.parentNode.parentNode).remove();
                if(  !XN.string.trim(This.nList.innerHTML) ){
                    This.hide(); 
                }
            }
        });
        this.elem.addEvent('mouseover',function(e){
            This.delTimer();
        });
        this.elem.addEvent('mouseout',function(e){
            This.startTimer();
        });
        this.addEvent( 'view_after_hide', function(){
            This.clearBs();//关闭之后清空数据
        });
        // ------------------- 模型事件 --------------------------//
        this.addEvent( 'bubble_bs_unshifted', function(){
            This.showNtfs();
            This.show();//整个bubble显示出来
            This.startTimer();
        });
    },
    //-------------------------- 数据管理 -----------------------//
    unshiftBs : function(n){
        this.bs.unshift(n);
        this.fireEvent('bubble_bs_unshifted', n );//'bs' means bubbles
    },
    clearBs : function(){
        this.bs.length = 0;
        //this.bs = [];
    },
    //-------------------------- UI方法 -------------------------//
    showNtfs : function(){//'Ntfs' means notifies
        this.nList.innerHTML = this.makeNtfs(); 
    },
    show : function(){
        this.elem.show();
    },
    hide : function(){
        this.elem.hide();       
        this.fireEvent( 'view_after_hide' ); 
    },
    makeNtfs : function(){//'Ntfs' means notifies
        var html = [];
        XN.array.each( this.bs, function(i,bubble){
            html.push( bubble.content );
        });   
        return html.join(''); 
    },
    startTimer : function( fn ){
        var This = this;
        //EXP@huihua.lin: 对同一个东西进行定时, 应该在打开它的定时器之前, 将定时器先重置
        this.delTimer(); 
        this.timer = setTimeout(function(){
            This.hide();//3秒之后就将bubble给关了
            //fn.call( This )
        },6000);             
    },
    delTimer : function(){
        if( this.timer ){
            clearTimeout(this.timer);
        } 
    },
    //-------------------------- 外部接口 -----------------------//
    setNotify : function(n){
        this.unshiftBs(n);   
    }
}
XN.event.enableCustomEvent( XN.Bubble.prototype );

XN.dom.ready(function(){
    var b = $('system-notification-box');
    if(!b)return;
    window.xn_bubble = new XN.Bubble({
        IDContainer : 'system-notification-box'
    });
});

XN.pagerChannelIsOk = function(params) {
   try{
        if( !XN.disableWebpager ){
			var vPage = XN.getFileVersionNum('http://s.xnimg.cn/jspro/xn.app.webpager.js');
			if (vPage) vPage = vPage.version;
			else vPage = 'a0';
            var vChannel = params.wpVersion;
            var _vPage = parseInt(vPage.substring(1));
            var _vChannel = parseInt( vChannel.substring(1) );
            
            if( vChannel && _vChannel > _vPage ){//如果pager-channel里面有版本号并且大于页面中的版本号就该版本号
                XN.loadFile('http://s.xnimg.cn/'+ params.wpVersion  +'/jspro/xn.app.webpager.js');
            }
			else{//没有version的时候就取页面上的版本号
                XN.loadFile('http://s.xnimg.cn/jspro/xn.app.webpager.js');
            }
        }
    }catch(e){}
};

if(/\((iPhone|iPad|iPod)/i.test(navigator.userAgent)){
	XN.disableWebpager = true;
};

//固定定位
XN.ui.positionFixedElement = function(params){
	this.config = {
		ele: null,
		holder: 'dropmenuHolder',
		alignWith: null,
		alignType: '4-1',
		x: 0,
		y: 0
	};
	XN.$extend(this.config, params);
	this.init();
	return this;
};
XN.ui.positionFixedElement.prototype = {
	ele: null,
	holder: null,
	alignWith: null,
	alignType: null,
	x: 0,
	y: 0,
	init: function(){
		this.ele = $(this.config.ele);
		this.holder = $(this.config.holder);
		this.alignWith = $(this.config.alignWith);
		this.alignType = this.config.alignType;
		this.x = this.config.x;
		this.y = this.config.y;
		
		this.ele.style.position = XN.browser.IE6?'absolute':'fixed';
		this.ele.style.left = '-9999px';
		this.ele.style.top = '-9999px';
		
		this.holder.appendChild(this.ele);
		
		var This = this;
		XN.event.addEvent(window, 'resize', function(){
			This.refresh();
		});
		if(XN.browser.IE6){
			XN.event.addEvent(window, 'scroll', function(){
				This.refresh();
			});
		}
	},
	methods: {
		'1-1':function(f,el,x,y,p) {
			f.style.left = x + el['realLeft']() - (XN.browser.IE6?p['realLeft']():0) + 'px';
			f.style.top = y + el['realTop']() - (XN.browser.IE6?p['realTop']():0) + 'px';
		},
		'1-2':function(f,el,x,y,p) {
			f.style.left = x + el['realLeft']() - (XN.browser.IE6?p['realLeft']():0) - f['offsetWidth'] + 'px';
			f.style.top = y + el['realTop']() - (XN.browser.IE6?p['realTop']():0)  + 'px';
		},
		'1-3':function(f,el,x,y,p) {
			f.style.left = x + el['realLeft']() - (XN.browser.IE6?p['realLeft']():0) - f['offsetWidth'] + 'px';
			f.style.top = y + el['realTop']() - (XN.browser.IE6?p['realTop']():0) - f['offsetHeight'] + 'px';
		},
		'1-4':function(f,el,x,y,p) {
			f.style.left = x + el['realLeft']() - (XN.browser.IE6?p['realLeft']():0) + 'px';
			f.style.top = y + el['realTop']() - (XN.browser.IE6?p['realTop']():0)  - f['offsetHeight'] + 'px';
		},
		'2-1':function(f,el,x,y,p) {
			f.style.left = x + el['realLeft']() - (XN.browser.IE6?p['realLeft']():0) + el['offsetWidth'] + 'px';
			f.style.top = y + el['realTop']() - (XN.browser.IE6?p['realTop']():0)  + 'px';
		},
		'2-2':function(f,el,x,y,p) {
			f.style.left = x + el['realLeft']() - (XN.browser.IE6?p['realLeft']():0) + el['offsetWidth'] - f['offsetWidth'] + 'px';
			f.style.top = y + el['realTop']() - (XN.browser.IE6?p['realTop']():0) + 'px';
		},
		'2-3':function(f,el,x,y,p) {
			f.style.left = x + el['realLeft']() - (XN.browser.IE6?p['realLeft']():0) + el['offsetWidth'] - f['offsetWidth'] + 'px';
			f.style.top = y + el['realTop']() - (XN.browser.IE6?p['realTop']():0)  - f['offsetHeight'] + 'px';
		},
		'2-4':function(f,el,x,y,p) {
			f.style.left = x + el['realLeft']() - (XN.browser.IE6?p['realLeft']():0) + el['offsetWidth'] + 'px';
			f.style.top = y + el['realTop']() - (XN.browser.IE6?p['realTop']():0)  - f['offsetHeight'] + 'px';
		},
		'3-1':function(f,el,x,y,p) {
			f.style.left = x + el['realLeft']() - (XN.browser.IE6?p['realLeft']():0) + el['offsetWidth'] + 'px';
			f.style.top = y + el['realTop']() - (XN.browser.IE6?p['realTop']():0) + el['offsetHeight'] + 'px';
		},
		'3-2':function(f,el,x,y,p) {
			f.style.left = x + el['realLeft']() - (XN.browser.IE6?p['realLeft']():0) + el['offsetWidth'] - f['offsetWidth'] + 'px';
			f.style.top = y + el['realTop']() + el['offsetHeight'] + 'px';
		},
		'3-3':function(f,el,x,y,p) {
			f.style.left = x + el['realLeft']() - (XN.browser.IE6?p['realLeft']():0) + el['offsetWidth'] - f['offsetWidth'] + 'px';
			f.style.top = y + el['realTop']() - (XN.browser.IE6?p['realTop']():0) + el['offsetHeight'] - f['offsetHeight'] + 'px';
		},
		'3-4':function(f,el,x,y,p) {
			f.style.left = x + el['realLeft']() - (XN.browser.IE6?p['realLeft']():0) + el['offsetWidth'] + 'px';
			f.style.top = y + el['realTop']() - (XN.browser.IE6?p['realTop']():0) + el['offsetHeight'] - f['offsetHeight'] + 'px';
		},
		'4-1':function(f,el,x,y,p) {
			f.style.left = x + el['realLeft']() - (XN.browser.IE6?p['realLeft']():0) + 'px';
			f.style.top = y + el['realTop']() - (XN.browser.IE6?p['realTop']():0) + el['offsetHeight'] + 'px';
		},
		'4-2':function(f,el,x,y,p) {
			f.style.left = x + el['realLeft']() - (XN.browser.IE6?p['realLeft']():0) - f['offsetWidth'] + 'px';
			f.style.top = y + el['realTop']() - (XN.browser.IE6?p['realTop']():0) + el['offsetHeight'] + 'px';
		},
		'4-3':function(f,el,x,y,p) {
			f.style.left = x + el['realLeft']() - (XN.browser.IE6?p['realLeft']():0) - f['offsetWidth'] + 'px';
			f.style.top = y + el['realTop']() - (XN.browser.IE6?p['realTop']():0) + el['offsetHeight'] - f['offsetHeight'] + 'px';
		},
		'4-4':function(f,el,x,y,p) {
			f.style.left = x + el['realLeft']() - (XN.browser.IE6?p['realLeft']():0) + 'px';
			f.style.top = y + el['realTop']() - (XN.browser.IE6?p['realTop']():0) + el['offsetHeight'] - f['offsetHeight'] + 'px';
		}
	},
	show: function(){
		if(this._isShow){
			return;
		}
		this._isShow = true;
		this.methods[this.alignType](this.ele, this.alignWith, this.x, this.y, this.holder);
	},
	hide: function(){
		if(!this._isShow){
			return;
		}
		this._isShow = false;
		this.ele.style.top = '-9999px';
		this.ele.style.left = '-9999px';
	},
	refresh: function(){
		if(this._isShow){
			this._isShow = false;
			this.show();
		}
	}
};

// IE6导航固定定位 
//XN.dom.ready(function(){
//	var ele = $('navBar'), d = document.documentElement;
//	if( XN.browser.IE6 ){
//		ele.style.top = d.scrollTop;
//		XN.event.addEvent(window, 'scroll', function(){
//			ele.style.top = d.scrollTop;
//		});
//	}
//});

//导航搜索框提示
XN.dom.ready(function(){
    if ( !$( 'navSearchInput' ) ) return;
    var fix = null;
	var fixe = $element('div');
	fixe.setContent( '&nbsp;多个关键字用空格隔开&nbsp;<br />&nbsp;（例：汪洋 北京大学）&nbsp;' );
    fixe.style.cssText = 'width:' + ( $( 'search-input' ).offsetWidth-2 ) + 'px;padding:3px 0;background:#EEE;border:1px solid #BDC7D8;opacity:0.8;text-align:center;';
    function showTip(){
        if( XN.form.help( 'navSearchInput' ).getRealValue() !== '') return;
        if ( !fix ){
            fix = new XN.ui.positionFixedElement({
				ele: fixe,
                alignWith : 'search-input'
            });
        }
        fix.show();
    };
    XN.event.addEvent( 'navSearchInput', 'focus', showTip);
    XN.event.addEvent( 'navSearchInput', 'blur', function(){
        if( fix ){
			fix.hide();
        }
    });
    XN.event.addEvent( 'navSearchInput', 'keydown', function(){
        if ( fix ) {
			fix.hide();
		}
    });
});

// 导航搜索的好友选择器
XN.ui.navSearchBar2 = function(p) {
	var input = XN.element.$(p.input);
	var submit = XN.element.$(p.submit || null);
	var form = XN.element.$(p.form);
	var tip = p.tip || '找人...';
	var action = p.action || function(p) {
		if(p.type && p.type == 'PAGE') {
			 window.location.href = 'http://page.' + XN.env.domain + '/' + (p.id||p.uid) + '?from=opensearch';
		} else {
			 window.location.href = 'http://www.' + XN.env.domain + '/profile.do?id=' + (p.id||p.uid) + '&from=opensearch';
		} 
	};
	var gotoUserPage = false;
	
	(new XN.form.inputHelper(input)).setDefaultValue(tip).onEnter(function(el) {
		if(gotoUserPage)return;
		if(!XN.string.isBlank(el.value)) {
			form.submit();
		}
	});

	var maxLength = 7;
	var param = {
		id:input,
		noResult:function() {
			return '<a onmousedown="window.location.href=this.href" href="http://browse.' + XN.env.domain + '/searchEx.do?from=opensearchclick&q=' + encodeURIComponent(this.input.value) +'" title="搜索'+ this.input.value  +'">搜索"' + this.input.value + '"</a>';
		},
		limit : maxLength,
		params : p.params,
		wrapper :  ['<div class="">',
			'<span class="x1">',
				'<span class="x1a"></span>',
			'</span>',
			'<span class="x2">',
				'<span class="x2a"></span>',
			'</span>',
			'<div class="m-autosug-minwidth">',
				'<div class="m-autosug-content">',
					'<ul class="search-Result"></ul>',
				'</div>',
			'</div>',
		'</div>'].join(''),
		url : 'http://sg.' + XN.env.domain + '/s/h'
	}; 


	var friendSelector = new XN.ui.friendSelector(param);
	
	friendSelector.onSelectOne = function(p){
		gotoUserPage = true;
		action(p);
	};
	var frdsFix = new XN.ui.positionFixedElement({
		ele: friendSelector.menu.container,
		alignWith: 'search-input'
	});
	friendSelector.menu.onShow = function(){
		frdsFix.show();
	};
	friendSelector.menu.onHide = function(){
		frdsFix.hide();
	};
	
	friendSelector.loadFriends = function(r) {
		if (this.isLoading()) return;
		this._isLoading = true;
		var This = this;
		this._onload();
	};
	
	friendSelector._onload = function() {
		this.isLoading = false;
		this._ready = true;
		this.DS = new XN.util.DS_friends({
			url : this.getConfig('url'),
			qkey : this.getConfig('qkey'),
			limit : this.getConfig('limit'),
			page : this.getConfig('page'),
			param : this.getConfig('param')
		});
		this.DS.query = function(v, callBack) {
			var This = this;
			
			try {
				this._request.abort();
			} catch(e) {}
			
			function parseDS_JSON(r) {
				r = r.responseText;
				var pp;
				try {
					var rt = XN.json.parse(r);
					if (This.rootKey && rt[This.rootKey]) {
						pp = rt[This.rootKey];
					} else {
						pp = rt;
					}
				} catch(e) {
					pp = [];
				}

				callBack(pp);
			}
			
			this._request = new XN.net.xmlhttp({
				url : this.url,
				data : 'q=' + encodeURIComponent(v) + '&l=' + this.limit, 
				method : this.method,
				onSuccess : parseDS_JSON
			});
		};
	};
	
	friendSelector.buildMenu = function(r) {
		return 	'<img src="' + (r.head||r.uhead)  + '" width="50" height="50" alt="'+ (r.name||r.uname)  +'"/>' + 
				'<strong>'+ (r.name||r.uname)  +'</strong>'
	};

	friendSelector._noDataShow = function() {
		var tip = this.getConfig('dataLoading');
		this._ul.innerHTML = '<li class="lookMore">' + tip + '</li>';
		this.menu.show();			
	};

	friendSelector._buildMenu  =  function(result) {
		var This = this;
		this.result = result;

		if (result.length == 0) {
			var noResult = this.getConfig('noResult');

			if (XN.isFunction(noResult)) {
				noResult = noResult.call(this);
			}

			this._ul.innerHTML = '<li class="lookMore">' + noResult + '</li>';
			this.menu.show();
			this._currentLi = null;
			return;
		}

		var lis = [];

		lis.push(this.firstMenuItem());
		
		var len = result.length - 1;

		XN.array.each(result, function(i, v) {
			lis.push('<li onmouseover="getCompleteMenu(' + This._MID + ')._highlightMenuItem(this);" aid="' + i + '">' + This.buildMenu(v) + '</li>');
		});
		
		lis.push(this.lastMenuItem());

		this._ul.innerHTML = lis.join('');
		
		if(this.getConfig('autoSelectFirst')) this._highlightMenuItem(this._ul.firstChild);
		
		this.menu.show();
	};

	friendSelector.lastMenuItem = function() {
		if (this.result.length == maxLength) {
			return '<li class="lookMore"><a onmousedown="window.location.href=this.href" href="http://friend.' + XN.env.domain + '/myfriendlistx.do?qu=' + this.input.value + '">点击查看更多..</a></li>';
		} else {
			return '';
		}
	};

};

//导航搜索
XN.dom.ready(function(){
    if ( !$( 'navSearchInput' ) ) return;
    new XN.ui.navSearchBar2({
        input: 'navSearchInput',
        form: $('globalSearchForm'),
        params:{ page : true },
		tip: '找人、公共主页、游戏'
    });
});

//导航帐号菜单
XN.dom.ready(function(){
	if ( !$('accountMenu') ) return;
	//点击“切换身份”按钮，弹出的alert层，需要在点击切换后关闭，因此保留一个引用
	var otherAccountsAlert = null;
	//根据需求，每一页显示20条记录，多于20则需要分页显示
	var PAGE_SIZE = 20;
	
	//为顶部工具栏的“帐号”部分添加事件监听，当鼠标悬挂时，弹出账户信息
	$('accountMenu').addEvent('mouseover',function(){
		if ( $('otherAccount').innerHTML!='' ) {
			return;
		}
		// 发送异步请求，获取当前账户及其相关账户信息
		new XN.NET.xmlhttp({
			url: 'http://www.renren.com/getOtherAccounts',
			method: 'get',
			onSuccess: function(xmlHttp){
				var r = XN.JSON.parse(xmlHttp.responseText),
					accounts = r.otherAccounts,
					//如果has为true，也认为可以切换
					canSwitch = (accounts != null && accounts.length != 0),
					accountsLength = (accounts != null ? accounts.length : 0),
					selfSiteName = getSiteName(r);
				var onlyOne = accountsLength == 1;
				//构造关于当前帐号的基本信息
				$('otherAccount').innerHTML = [
						'<div class="account-detail clearfix">',
							'<a href="javascript:;" class="figure" style="cursor:default">',
								'<img src="',r.self_head,'" />',
							'</a>',
							'<div class="detail">',
								'<p class="name" title="',r.self_name,'">',r.self_name,'</p>',
								'<p class="grade">',r.self_level,'级</p>',
								'<p class="friends">',selfSiteName,'</p>',
							'</div>',
						'</div>',
						'<div class="action"',canSwitch?'':' style="display:none;"','>',
							'<a href="javascript:;" class="switch" ', 
								(onlyOne?' style="padding: 0px 12px"':'') , '>',
								(onlyOne ? '切换至' + getSiteName(accounts[0]) : '切换身份'), 
							'</a>',
						'</div>'
					].join('');
				$('otherAccount').style.display = 'block';
				
				//为“切换身份”按钮添加事件监听
				$( Sizzle('#accountDropDownMenu a.switch')[0] ).addEvent( 'click' , function(){
					//如果记录数目大于0，则显示当前帐号之外的其他帐号，并弹窗
					if(accountsLength > 1) {
						//构造弹窗内容HTML
						//需要保留引用，以便方便的进行显示和隐藏
						otherAccountsAlert = XN.DO.alert({
							title: '切换身份',
							msg: [
								'<div id="switchAccountPopup" class="switch-account-popup clearfix">',
									'<div id="multiSwitchTip" class="switch-tip">',
										'你可以通过“切换身份”，以公共主页的身份加好友、回踩粉丝、与其他主页互动。', 
									'</div>',
									'<div class="accounts-list-wrapper">',
										'<div id="anotherAccount">', 
											generateAccountsListHtml(0, accountsLength > PAGE_SIZE ? PAGE_SIZE : accountsLength),
										'</div>',
									'</div>',
									'<div id="pagerWrapper" class="accounts-pager"><ol id="accountsPager" class="pagerpro"></ol></div>',
								'</div>'
							].join(''),
							noPadding: true,
							button: "取消",
							Y: 60,
							showCloseButton: true
						});
						otherAccountsAlert.container.className = 'other-accounts-alert';
						//这里需要固定Y值，否则自动计算居中，将会一直往下掉
						//如果记录数大于20，还需要分页
						window.scrollTo(0,0);
						if(accountsLength > PAGE_SIZE) {
							//异步加载js文件
							XN.loadFile('http://s.xnimg.cn/jspro/xn.ui.pager.js', function() {
								var pager = new XN.ui.pager({
									showCount : 5,
									container: $('accountsPager')
								});
								pager.setPageCount(parseInt((accountsLength-1)/PAGE_SIZE + 1) );
								pager.setCurrentPage( 1 );
								pager.addEvent('pageChange' , function(num) {
									//点击数字时，显示对应页的记录
									$("anotherAccount").innerHTML = generateAccountsListHtml((num-1)*PAGE_SIZE, num*PAGE_SIZE);
									window.scrollTo(0,0);
									$("anotherAccount").scrollTop = 0;
								});
							});
						} else {
							if( accountsLength <= 4 ) {
								$("anotherAccount").style.height = "auto";
								$("anotherAccount").style.overflow = "hidden";
							} else {
								$("pagerWrapper").hide();
							}
						}
					} else if (accountsLength == 1) {
						//如果本身只有一个，则直接跳过去
						handleSwitchButtonClick(accounts[0].head, accounts[0].name, 
							accounts[0].id, getSiteName(accounts[0]), true);
					}
				} );
				
				/**
				 * 生成一页账户记录列表的HTML
				 * @param start : 在accounts列表中的起始位置
				 * @param end   : 在accounts列表中的终止位置（不包含）
				 * @return 起始位置到终止位置之间的记录的HTML
				 */
				function generateAccountsListHtml(start, end) {
					var htmlArray = [];
					for(var i=start; i<end; i++) {
						var currentAccount = accounts[i];
						if(currentAccount == undefined) {
							break;
						}
						htmlArray = htmlArray.concat([
							'<div class="account-detail clearfix accounts-list" style="'
								,(i==start?"":"border-top:1px solid #CCCCCC;"),'">',
								'<a href="','http://www.renren.com/profile.do?id=',currentAccount.transId,'" class="figure">',
									'<img src="',currentAccount.head,'" />',
								'</a>',
								'<div class="detail" style="float:left;width:auto;height:50px;line-height:50px;">',
									'<p class="name" title="',currentAccount.name,'">',cutShort(currentAccount.name),'</p>',
									'<p class="grade"></p>',
								'</div>',
								'<div class="operate">',
									'<input class="input-submit" type="button" value="切换" ',
										'onclick="handleSwitchButtonClick(\'',
											currentAccount.head,'\',\'',
											cutShort(currentAccount.name),'\',\'',
											currentAccount.id,'\',\'',
											getSiteName(currentAccount),'\')"/>',
								'</div>',
							'</div>'
						]);
					}
					return htmlArray.join('');
				}
			}
		});
	});
	
	/**
	 * 把太长的名称进行剪切，剩余10个汉字
	 */
	function cutShort(name) {
		if(!name) {
			return name;
		}
		return name.length > 10 ? name.substring(0, 10) + "..." : name;
	}
	
	/**
	 * 根据对象中的属性，确定账户的中文名称
	 * @record : 帐号记录
	 * @return : 记录对应的中文名称，包括：人人帐号、开心帐号、公共主页，默认是帐号
	 */
	function getSiteName(record) {
		var selfSiteName = '帐号';
		if(record.self_isPage == "true" || record.isPage == "true" ) {
			selfSiteName = '公共主页';
		} else if ( record.self_domain) {
			if ( record.self_domain=='kaixin.com') {
				selfSiteName = '开心帐号';
			} else if ( record.self_domain=='renren.com') {
				selfSiteName = '人人帐号';
			}
		} else if( record.domain) {
			if ( record.domain=='kaixin.com') {
				selfSiteName = '开心帐号';
			} else if ( record.domain=='renren.com') {
				selfSiteName = '人人帐号';
			}
		}
		return selfSiteName;
	}
	
	/**
	 * 处理“切换”按钮的点击事件，需要加在window上
	 * @param head、name、destId、desc都是accounts中的信息
	 * @param singleFlag : true说明直接弹窗，false说明弹出列表
	 * @return 没有返回值，允许跳转则跳转，不允许跳转则弹窗提示用户输入用户名、密码、验证码等信息
	 */
	window.handleSwitchButtonClick = function(head, name, destId, destSite, singleFlag) {
		new XN.NET.xmlhttp({
			url:'http://www.renren.com/switchAccount',
			data: 'origUrl='+encodeURIComponent(window.location.href) + '&destId='+destId,
			onSuccess: function(xmlHttp){
				if(otherAccountsAlert) {
					//如果列表窗口还在，则先隐藏
					otherAccountsAlert.hide();
				}
				var r = XN.JSON.parse(xmlHttp.responseText);
				if ( r.isJump ) {
					//如果能直接跳转，则执行跳转
					window.location = r.url;
				} else {
					//如果不能直接跳转，弹窗提示用户输入信息
					showUserInfoInputArea(head, name, destId, destSite, r, singleFlag);
				}
			}
		});
	}
	
	/**
	 * 在不能直接跳转的情况下，提示用户输入用户名、密码、验证码等信息
	 * @param head、name、destId、desc : 都是accounts中的信息，这里用于提示
	 * @param res : 校验用户信息时的返回消息，用于获取是否需要输入验证码，以及帐号提示等信息
	 * @param singleFlag : 如果是只有一个其他账户，则直接切换，此时no应该是取消，而不是返回
	 * @return 没有返回值，回调方法中如果信息输入正确则跳转，信息输入不正确则给出错误提示
	 */
	function showUserInfoInputArea(head, name, destId, destSite, res, singleFlag){
		var accountLoginAlert = XN.DO.confirm({
			title: '切换身份',
			msg: [
				'<div id="switchAccountPopup" class="switch-account-popup clearfix">',
					'<div id="switchAccountError" class="error-msg" style="display:none"></div>',
					'<div class="account-info">',
						'<div class="account-detail clearfix">',
							'<a href="javascript:;" class="figure" style="cursor:default">',
								'<img src="',head,'" />',
							'</a>',
							'<div class="detail">',
								'<p class="name" style="width:60px;margin-top:16px;" title="',name,'">',name,'</p>',
								'<p class="grade"></p>',
							'</div>',
						'</div>',
					'</div>',
					'<div class="account-login">',
						'<p style="color:#5B5B5B;padding-left:17px;">请输入', getSiteName(res) ,'"',res.name,'"对应的密码</p>',
						'<div class="account">',
							'<span class="label">帐号:</span><span>',res.account,'</span>',
						'</div>',
						'<div class="password">',
							'<span class="label">密码:</span><input type="password" id="switchAccountPassword" class="input-text" />',
						'</div>',
						'<div id="verifycode" class="verifycode"',res.showIC?'':' style="display:none"','><span class="label">验证码:</span><input id="switchVerifyCode" type="text" class="input-text" name="ick" /></div>',
						'<div id="verifycode-image" class="verifycode-image"',res.showIC?'':' style="display:none"','><img id="loginVerifyPic" src="http://icode.renren.com/getcode.do?rk=300&t=LOGIN&rnd=',Math.random(),'" /> <a href="javascript:;" onclick="changeIC();return false;">换一个</a></div>',
					'</div>',
				'</div>'
			].join(''),
			no: singleFlag ? '取消' : '返回',
			showCloseButton: true,
			callback: function(r) {
				if(!r) {
					//点击取消，则返回到账户列表弹层
					if(otherAccountsAlert) {
						otherAccountsAlert.show();
					}
					return;
				}
				this.preventHide();
				//发送异步请求，验证用户输入的用户名、密码、验证码的有效性
				new XN.NET.xmlhttp({
					url: 'http://www.renren.com/verifypwd/checkPwd',
					data: 'ick=' + $('switchVerifyCode').value +
					      '&pwd=' + $('switchAccountPassword').value + 
						  '&origUrl=' + encodeURIComponent(window.location.href) + 
						  '&destId=' + destId + 
						  '&showIC=' + ($("verifycode-image").style.display != 'none'),
					onSuccess: function(xmlHttp){
						var r = XN.JSON.parse(xmlHttp.responseText);
						if ( r.status=='fail' ) {
							//如果返回的状态是fail，说明校验没通过，返回的msg即为错误消息
							$('switchAccountError').innerHTML = r.msg;
							$('switchAccountError').style.display = 'block';
							Sizzle('.account-login .verifycode')[0].style.display='block';
							Sizzle('.account-login .verifycode-image')[0].style.display='block';
							changeIC();
						} else if ( r.status=='ok' ) {
							//如果返回的状态是ok，说明校验通过，返回的msg即为跳转的url
							window.location = r.msg;
						}
					}
				});
			}
		});
		accountLoginAlert.container.className = "account-login-alert";
	};
	
	/**
	 * 获取新的验证码，并且刷新
	 */
	window.changeIC = function(){
		$('loginVerifyPic').src='http://icode.renren.com/getcode.do?rk=300&t=LOGIN&rnd='+Math.random();
	};
	
	var accMenu = new XN.ui.menu({
		bar: 'accountMenu',
		menu: 'accountDropDownMenu',
		fireOn: 'mouseover',
		alignType: '3-2'
	});
	var accMenuFix = new XN.ui.positionFixedElement({
		ele: 'accountDropDownMenu',
		alignWith: 'accountMenu',
		alignType: '3-2'
	});
	accMenu.onShow = function(){
		if($('accountMenuTip')) {
			$('accountMenuTip').hide();
			new XN.NET.xmlhttp({
				url: 'http://www.'+XN.env.domain+'/closeShowNewHeaderTip'
			});
		}
		accMenuFix.show();
	};
	accMenu.onHide = function(){
		accMenuFix.hide();
	};
});

// 帐号切换引导提示
XN.dom.ready(function(){
	if (!$('accountMenu') || !$('isShowNewHeaderTip')) return;
	//if (!$('accountMenu')) return;
	var tip = $element('div');
	tip.id = 'accountMenuTip';
	tip.innerHTML = [
		'<div class="clearfix" style="border:1px solid #FF9900;background:#FFFCC3;color:#5B5B5B;width:170px;height:30px;padding:8px 3px 8px 8px;overflow:hidden;">',
			'<a href="javascript:;" class="x-to-hide" style="float:right;"></a>',
			'<div style="_line-height:normal!important;"><span style="color:#f00;">新功能：</span>点击“切换帐号”，在人人与开心帐号间切换</div>',
		'</div>',
		'<div style="background:url(http://a.xnimg.cn/imgpro/arrow/tip-arrow-up.png) 0 0 no-repeat;width:11px;height:6px;margin-top:-53px;margin-left:155px;_position:relative;"></div>'
	].join('');
	$(Sizzle('a.x-to-hide',tip)[0]).addEvent('click',function(){
		tip.hide();
		new XN.NET.xmlhttp({
			url: 'http://www.'+XN.env.domain+'/closeShowNewHeaderTip'
		});
	});
	new XN.ui.fixPositionElement({
		id: tip,
		alignWith: 'accountMenu',
		alignType: '3-2',
		offsetY: 3
	});
});

//未登录导航更多
XN.dom.ready(function()
{
    if ( !$( 'moreWeb' ) )return;
    new XN.UI.menu({
        bar:'moreWeb',
        menu:'moredownWeb',
        fireOn:'click',
		alignType: '3-2',
		offsetX: 1
    });
});/**
 * @namespace
 * @name ui.nav
 */
object.add('ui.nav', 'ui, ui.decorators', /**@lends ui.nav*/ function(exports, ui) {

var fireevent = ui.decorators.fireevent;

/**
 * @class
 * @name ui.nav.ForeNextControl
 */
this.ForeNextControl = new Class(ui.Component, /**@lends ui.nav.ForeNextControl*/ function() {

	this.nextButton = ui.define('.nextbutton');
	this.foreButton = ui.define('.forebutton');

	this.initialize = function(self, node) {
		ui.Component.initialize(self, node);

		self.loop = false; // 是否循环
		self.total = parseInt(self._node.getData('total'));
		self.start = parseInt(self._node.getData('start')) || 0;
		self.position = self.start;
	};

	this.nextButton_click = function(self, event) {
		if (self.position >= self.total - 1) {
			if (self.loop) self.position = -1;
			else return;
		}
		self.next();
	};

	this.foreButton_click = function(self, event) {
		if (self.position <= 0) {
			if (self.loop) self.position = self.total;
			else return;
		}
		self.fore();
	};

	this.next = fireevent(function(self) {
		self.position++;
		self.change();
	});

	this.fore = fireevent(function(self) {
		self.position--;
		self.change();
	});

	this.change = function(self) {
		// TODO
		self.fireEvent('change', {forenext: self});
		self.updateTotal();
		self.updatePosition();
	};

	this.updatePosition = fireevent(function(self) {
		self._node.getElements('.current').set('innerHTML', self.position + 1); // position是从0开始滴～展示的时候+1
	});

	this.updateTotal = fireevent(function(self) {
		self._node.getElements('.total').set('innerHTML', self.total);
	});

});

});

object.add('xn.globalpublisher', 'ui, xn.ui', function(exports, ui) {

/**
 * Publisher
 */
this.Publisher = new Class(ui.Component, function() {

	this.closeButton = ui.define('.close');

	this._close = function(self) {
		if (self.openedAddon) {
			self.openedAddon.unload();
			self.openedAddon.hide();
		}
		if (self.__closeTimer) {
			clearTimeout(self.__closeTimer);
		}
		self._closeButton.hide();
		self.openedAddon = null;
	};

	this._open = function(self, addon) {
		self.close();
		if (self.openedAddon != null) return false;
		self._closeButton.show();
		self.openedAddon = addon;
		addon.show();
		return true;
	};

	this._autoClose = function(self, time) {
		if (!time) time = 2000;
		self.__closeTimer = setTimeout(self.close.bind(self), time);
	};

	this.closeButton_click = function(self, event) {
		event.preventDefault();
		self.close();
	};

});

});
object.add('xn.globalpublisher.utils', 'dom, net, xn.net', function(exports, dom, net, xn) {

dom.wrap(window);

// 获取模板
this.getTemplate = function(url, callback) {
	if (url.indexOf('http://a.xnimg.cn') == 0) {
		var iframe = document.createElement('iframe');
		iframe.style.display = 'none';
		document.body.appendChild(iframe);
		iframe.src = 'http://a.xnimg.cn/getfile.htm?url=' + url + '&host=' + window.location.host;
		window.addEvent('message', function(event) {
			window.removeEvent('message', arguments.callee);
			callback(event.data);
		});
	} else {
		var xhr = new net.Request({
			url: url,
			method: 'get',
			onsuccess: function(event) {
				callback(event.request.responseText);
			}
		});
		xhr.send();
	}
};

});

object.add('xn.globalpublisher.addons.status', 'net, ui, dom, string, xn.globalpublisher.utils, xn.mention, ua', function(exports, net, ui, dom, string, xn, ua) {

dom.wrap(document);

/**
 * 状态发布表单
 * @extends ui.Component
 */
this.StatusPublisherEditor = new Class(ui.Component, function() {

	this.input = ui.define1('textarea');
	this.emotions = ui.define1('div.emotions');
	this.statusToolbar = ui.define1('.status-toolbar');
    this.atButton = ui.define1('.at-button');
	this.emotionButton = ui.define('.emotion-button');
	this.charsInfo = ui.define1('.chars-info');
	this.charsCountOut = ui.define('.chars-count');
	this.charsTotalOut = ui.define('.chars-total');
	this.charsRemainOut = ui.define('.chars-remain');
	this.lastStatus = ui.define('.last-status');

	// 多长时间检查一次字数
	this.charsCounterInterval = ui.option(50);

	// 字数限制0
	this.charsTotal = ui.option(140);

	// 短网址开关
	this.enableUrlShorter = ui.option(false);

	// 短网址服务的替换url长度
	this.urlShorterLength = ui.option(20);

	// urlshorter系统最多支持某限定长度的url，若超出，算正常内容。
	this.urlShorterMaxLength = ui.option(200);

	// 是否两个英文算一个中文
	this.chineseChars = ui.option(false);

	// 是否开启@功能
	this.enableAt = ui.option(false);

	// 是否开启表情
	this.enableEmotion = ui.option(true);

	// 是否正在输入
	this.inputing = property(function(self) {
		return self._input.classList.contains('inputing');
	}, function(self, inputing) {
		if (inputing) self._input.classList.add('inputing');
		else self._input.classList.remove('inputing');
	});

	// 是否保持输入框开启状态
	this.holdInputing = property(function(self) {
		// 输入框中有内容，或者_holdInputing=true
		return !!(self._input.get('value') || self._holdInputing);
	}, function(self, hold) {
		self._holdInputing = hold;
		self.checkLeaveInputing();
	});

	this._init = function(self) {
		// novalidate
		self._node.setAttribute('novalidate', 'novalidate');

		self._charsCounter = null; // 定时检查字数的计时器

		if (self.enableUrlShorter) {
			self._urlShorterReplaceString = new Array(self.urlShorterLength + 1).join('x');
		}
		if (self.enableAt) {
			xn.mention.Mention.init([{
				//button: self._atButton, // 目前在atButon_click中处理，传业还在完善功能。
				obj: self._input
			}]); 
		}
	};

	/**
	 * 展开输入框
	 */
	this._showInputing = function(self) {
		self.set('inputing', true);
		if (self.charsInfo && self.charsTotal >= 0) self.charsInfo.show();
		if (self.statusToolbar) self.statusToolbar.show();
		self.showLastStatus();
		self.startCharsCounter();
		self.__blockClickEvent = function(event) {
			event.stopPropagation();
		};
		// 阻止点击publisher内部区域导致收起
		self._node.addEvent('click', self.__blockClickEvent);
	};

	/**
	 * 收起输入框
	 */
	this._leaveInputing = function(self) {
		self.set('inputing', false);
		self.charsInfo.hide();
		if (self.statusToolbar) self.statusToolbar.hide();
		self.hideLastStatus();
		self.stopCharsCounter();
		self._node.removeEvent('click', self.__blockClickEvent);
	};

	this._showLastStatus = function(self) {
		if (self.lastStatus) self.lastStatus.show();
	};

	this.hideLastStatus = function(self) {
		if (self.lastStatus) self.lastStatus.hide();
	};

	/**
	 * 开始记录字数
	 */
	this._startCharsCounter = function(self) {
		if (self.charsTotal < 0) return;
		self._charsCounter = setInterval(function() {
			self.updateCharsCount();
		}, self.charsCounterInterval);
	};

	/**
	 * 停止记录字数
	 */
	this._stopCharsCounter = function(self) {
		clearInterval(self._charsCounter);
	};

	/**
	 * 更新字数
	 */
	this._updateCharsCount = function(self) {
		var count = self.getLength(self._input.get('value'));
		self.checkChars(count);
		self._charsCountOut.set('innerHTML', count);
		self._charsRemainOut.set('innerHTML', self.charsTotal - count);
	};

	/**
	 * 检测字数
	 */
	this._checkChars = function(self, count) {
		if (self.charsTotal < 0) return;
		if (count <= self.charsTotal && self._charsInfo.retrieve('tooLong')) {
			self.charsTooLong();
		} else if (count > self.charsTotal && !self._charsInfo.retrieve('tooLong')) {
			self.charsLengthOK();
		}
	};

	this._charsTooLong = function(self) {
		// TODO
		self.charsInfo.setStyle('color', '#888');
		self.charsInfo.store('tooLong', false);
	};

	this._charsLengthOK = function(self) {
		// TODO
		self.charsInfo.setStyle('color', '#F00');
		self.charsInfo.store('tooLong', true);
	};

	/**
	 * 展示表情框
	 */
	this._showEmotion = function(self) {
		XN.loadFiles(['http://s.xnimg.cn/jspro/xn.ui.emoticons.js',
				'http://s.xnimg.cn/csspro/module/minieditor.css'], function() {
            if (!self.emotions) {
				self.render('emotions');
			}

			self.emotions.show();
		});
	};

	/**
	 * 收起表情框
	 */
	this._hideEmotion = function(self) {
		if (self.emotions) {
			self.emotions.hide();
		}
	};

	this.enableAt_change = function(self, value) {
		self._atButton[value? 'show' : 'hide']();
		if (self._input.mention) {
			if (value) {
				self._input.mention.disabled = false;
			} else {
				self._input.mention.disabled = true;
			}
		}
	};

	this.enableEmotion_change = function(self, value) {
		self._emotionButton[value? 'show' : 'hide']();
		if (!value) {
			self.hideEmotion();
		}
	};

	this.charsTotal_change = function(self, value) {
		if (value < 0) {
			self._charsInfo.hide();
			self.stopCharsCounter();
		} else {
			self._charsTotalOut.set('innerHTML', value);
		}
	};

	this.input_keydown = function(self, event) {
		if (event.keyCode === 13) {
			// 阻止@时按回车直接发送状态
			if (self._input.mention && self._input.mention.selectorShow && !self._input.mention.noMatch) return;

			if (event.ctrlKey) {
				self.fireEvent('ctrlEnterPress', event);
			} else {
				self.fireEvent('enterPress', event);
			}
		}
	};

	this.emotionButton_click = function(self, event) {
		event.preventDefault();
		event.stopPropagation();
		if (!self.emotions || self._emotions.style.display == 'none') {
			self.__emotionsClickEvent = event;
			self.showEmotion();
		} else {
			self.hideEmotion();
		}
		// 点击表情按钮同时focus输入框
		self._input.focus();
	};
    
    this.atButton_click = function(self, event) {
        event.preventDefault();
        event.stopPropagation();
        
        var caretPos = self._input.get('selectionStart'),
            oValue = self._input.get('value'),
            nValue;      
        
        //IE FixBug：鼠标点击textarea区域外的文本块儿，再点@按钮，@会加到内容最前面
        //所以click textarea的时候记录点击的index值到self._input.caretPos
        if (ua.ua.ie && caretPos == 0) {
            if (self._input.caretPos == 0) {
                caretPos = 0;
            } else {
                caretPos = oValue.length;
            }
        }
        
        if (oValue.substring(caretPos - 1, caretPos) == '@') {
            self._input.focusToPosition(caretPos);
			if( self._input.mention ) self._input.mention.check();
            return;
        } 
        
        //此句仅IE有用，存储最后一次光标的位置
        self._input.caretPos = caretPos + 1;        
        
        nValue = oValue.substring(0, caretPos) + '@' + oValue.substring(caretPos);
        self._input.set('value', nValue);
        self._input.focusToPosition(caretPos + 1);
		if (self._input.mention) self._input.mention.check();
    };

	this.input_focus = function(self, event) {
		// showEmotion是在focus事件中调用的，而focus是在点击小按钮的click事件中调用的
		// 下边给document的click事件会在focus完毕后立刻执行一次（从小按钮冒泡上去的）
		// 这就导致了展开的textarea立刻又收起了。
		// 而首次点击小按钮就没有这个问题，因为首次点击需要走异步请求，执行focus时，click事件早已冒泡完毕了。
		// 在activeEditor方法中通过setTimeout解决了。
		document.addEvent('click', function(event) {
			document.removeEvent('click', arguments.callee);
			self.hideEmotion();
			self.checkLeaveInputing();
		});

		self.showInputing();
        
        //此句仅IE有用，存储光标的位置，用于修复IE @按钮 bug
        self._input.caretPos = self._input.get('selectionStart');
	};

	// 点击input不算document的click，阻止关闭
	this.input_click = function(self, event) {
		event.stopPropagation();  

		//此句仅IE有用，存储光标的位置，用于修复IE @按钮 bug
		self._input.caretPos = self._input.get('selectionStart'); 
	};

	this.renderEmotions = function(self) {
		var cfg = {
			url: 'http://shell.renren.com/ubb/doingubb?t=' + Math.random(),
			input : self._input,
			button : self._emotionButton[0],
			btnOffsetY : 28,
			btnAlignType: '4-1'
		};

		var emotions = new XN.ui.emoticons(cfg);
		emotions.showEmoPop(self.__emotionsClickEvent);
		return emotions.emotionsContainer.frame;
	};

	this.getInputValue = function(self) {
		return string.ltrim(self._input.get('value'));
	};

	/**
	* 检测并执行leaveInputing
	*/
	this.checkLeaveInputing = function(self) {
		// 必须在inputing状态下才执行leaveInputing
		if (self.get('inputing') && !self.get('holdInputing')) self.leaveInputing();
	};

	/**
	 * 返回统计字数的长度
	 */
	this.getLength = function(self, str) {
		str = string.ltrim(str);
		var length = str.length;

		// 处理url shorter
		var placeholder = self._urlShorterReplaceString;
		if (placeholder) {
			str = str.replace(/(https?|ftp|gopher|telnet|prospero|wais|nntp){1}:\/\/\w*[\u4E00-\u9FA5]*((?![\"| |\t|\r|\n]).)+/ig, function(match) {
				// urlshorter系统最多支持某限定长度的url，若超出，算正常内容。
				return placeholder + match.substr(self.urlShorterMaxLength);
			});
			length = str.length;
		}

		//  处理中文字符
		if (self.chineseChars) {
			// 遍历字符串，遇见英文则将长度-0.5
			for (var i = 0; i < str.length; i++) {
				// str[i].charCodeAt 不行，IE下不认 str[i]
				if (str.charCodeAt(i) < 128) {
					length -= 0.5;
				}
			}
			length = Math.ceil(length); // 入
		}

		return length;
	};

	this._revert = function(self) {
		self._input.blur(); // 取消输入状态
		self.leaveInputing(true);

		this.parent(self);
	};

});

/**
 * 状态publisher
 * @extends ui.Component
 */
this.StatusPublisher = new Class(ui.Component, function() {

	this.box = ui.define1('section');
	this.editorBox = ui.define1('.editor-box');
	this.editor = ui.define1('.status-global-publisher', exports.StatusPublisherEditor);
	this.loadingBox = ui.define('.loading-module');
	this.successBox = ui.define('.success-module');
	this.submitButton = ui.define1('input.submit');

	this._load = function(self) {
		self._successBox.hide();
		self.showEditor();
		setTimeout(function() {
			self.editor._input.set('value', '');
		}, 25);
	};

	this._unload = function(self) {
		self.enableSubmitButton();
		self.revert();
	};

	this._reload = function(self) {
		self.unload();
		self.load();
	};

	this._postStatus = function(self) {
		self.__postStatusRequest = self._submitButton.send();
	};

	this._finish = function(self, html) {

		self.editor.leaveInputing(true); // 取消掉输入状态

		if (html) {
			self.editor._lastStatus.forEach(function(node) {
				node.getElement('a').title = self.editor._input.value;    
				node.getElement('a').innerHTML = '刚刚更新:' + html;
			});
		}

        self.editor._input.set('value', '');
		self.render('successBox');
		self._loadingBox.hide();
		self._successBox.show();
	};

	this._showEditor = function(self) {
		self.render('editor');
		self.box.show();
		self.editorBox.show();
		self.loadingBox.hide();
	};

	this._disableSubmitButton = function(self) {
		self._submitButton.classList.add('submit_disabled');
		self._submitButton.disabled = true;
	};

	this.enableSubmitButton = function(self) {
		self._submitButton.classList.remove('submit_disabled');
		self._submitButton.disabled = false;
	};

	this.renderLoadingBox = function(self) {
		var loadingBox = self.make('loadingBox');
		self.box.grab(loadingBox);
	};

	this.renderSuccessBox = function(self, data) {
		var successBox = self.make('successBox', data);
		self.box.grab(successBox);
	};

	this.renderEditor = function(self) {
		var editor = self.make('editor');
		self.editorBox.grab(editor);
	};

	this.editor_enterPress = function(self, event) {
		//self._submitButton.fireEvent('click');
	};

	this.editor_ctrlEnterPress = function(self, event) {
		self._submitButton.fireEvent('click');
	};

	this.editor_leaveInputing = function(self, event, editor, no) {
		if (no) return;
		// 莹舟表示未激活状态可以重置状态publisher，将表单全部重置。
		self.reload();
	};

	this.submitButton_click = function(self, event) {
		if (self._submitButton.get('formAction')) return;
		event.preventDefault();

		var value = self.editor.getInputValue();

		// 没有填写任何内容
		if (!self._editor.content.get('value')) {
			self.reload();
		// 输入了一堆无效空格
		} else if (!value) {
			self.editor.invalid('抱歉，你不能输入空状态');
			self.reload();
		} else if (self.editor.charsTotal >= 0 && self.editor.getLength(value) > self.editor.charsTotal) {
			self.editor.invalid('您最多能够输入' + self.editor.charsTotal + '个字符');
		} else if (!self._editor.checkValidity()) {
			// 表单未通过验证，可能是某些插件设置了customValidity。保持当前状态不变化
		} else {
			// 发布之前去掉前置空格
			self._editor.content.set('value', value);
			self._editor.content.blur(); // chrome下会保持focus，导致按回车重复发布。

			self.render('loadingBox');
			self.editorBox.hide();
			self.loadingBox.show();
			self.postStatus();
		};
	};

	this.submitButton_requestSuccess = function(self, event) {
		if (event.request !== self.__postStatusRequest) return;

		var result = JSON.parse(event.request.responseText);
		if (result.code !== 0) {
			self.error(result.msg);
			self.showEditor();
			return;
		}
        
		self.finish(result.html);
	};

	/**
	 * 立刻激活输入状态
	 */
	this.activeEditor = function(self) {
		// 为什么用setTimeout0?
		// activeEditor方法中的focus是在一个onclick事件中调用的，这就会出现先触发focus，再触发click事件的情况
		// 恰巧，focus事件中调用的showEmotion方法监听了document的click事件，这个事件用于检测关闭输入状态
		// 这就导致输入状态在激活后立刻被关闭了。
		// setTimeout 0 可以将focus的调用脱离click事件，click事件会在focus之前执行
		// 经验：所有手工触发dom内置事件(focus/click)的代码都使用setTimeout使其单独线程运行，避免由于在某事件中调用影响事件触发顺序。
		setTimeout(function() {
			self.editor._input.focus();
		}, 25);
	};

});

});

object.add('xn.globalpublisher.addons.share', 'dom, net, ui, ui.nav, string, xn.globalpublisher.utils, xn.mention', function(exports, dom, net, ui, string, xn) {

/**
 * 分享发布器——输入link
 * @class
 */
this.SharePublisherInputer = new Class(ui.Component, function() {
	this.link = ui.define1('[name=link]');
});

/**
 * 分享发布器——信息编辑器
 * @class
 */
this.SharePublisherEditor = new Class(ui.Component, function() {

	this.titleEditor = ui.define('.inlineinput');
	this.thumbPicker = ui.define('.forenext', ui.nav.ForeNextControl);
	this.thumbHider = ui.define('[name=nothumb]');
	this.thumbUrl = ui.define1('[name=thumbUrl]');
	this.thumbBox = ui.define1('.share-thumb');

	this.titleEditor_focus = function(self, event) {
		event.target.classList.remove('inlineinput');
	};

	this.titleEditor_blur = function(selv, event) {
		event.target.classList.add('inlineinput');
	};

	this.thumbPicker_change = function(self, event) {
		var imgs = self.retrieve('thumbs');
		var position = event.forenext.position;
		var img = new Image();
		// 过高图片自动过滤
		img.onload = function() {
			var height = (100 / img.width * img.height);
			if (height > 150) {
				imgs.splice(position, 1);
				self.store('thumbs', imgs);
				self.thumbPicker.forEach(function(thumbPicker) {
					thumbPicker.total = imgs.length;
					thumbPicker.position--;
					thumbPicker.next();
				});
			} else {
				self.thumbUrlValue = imgs[position];
				self.changeThumb();
			}
		};
		img.src = imgs[position];
	};

	this.thumbHider_click = function(self, event) {
		self.toggleThumb(event.target.checked);
	};

	this._changeThumb = function(self) {
		self.thumbBox.getElement('img').src = self.thumbUrlValue;
		self._thumbUrl.set('value', self.thumbUrlValue);
	};

	// 显示/隐藏thumb
	this._toggleThumb = function(self, isShow) {
		self[isShow? 'hideThumb' : 'showThumb']();
	};

	// 显示thumb
	this._showThumb = function(self) {
		self._thumbBox.show();
		self._thumbPicker.show();
		self._thumbUrl.set('value', self.thumbUrlValue);
	};

	// 隐藏thumb
	this._hideThumb = function(self) {
		self._thumbBox.hide();
		self._thumbPicker.hide();
		self._thumbUrl.set('value', '');
	};

});

/**
 * 分享发布器
 * @class
 */
this.SharePublisher = new Class(ui.Component, function() {

	this.loadingBox = ui.define('.loading-module');
	this.successBox = ui.define('.success-module');
	this.box = ui.define1('section');
	this.inputerBox = ui.define1('div.input-link-box');
	this.editorBox = ui.define1('div.input-comment-box');
	this.inputer = ui.define1('.input-link', exports.SharePublisherInputer);
	this.inputerSubmit = ui.define1('.input-link input[type=submit]');
	this.editor = ui.define1('.input-comment', exports.SharePublisherEditor);
	this.form = ui.define1(function(self) {
		return self._node.getParent('form');
	});
	this.submitButton = ui.define1(function(self) {
		return self._form.getElement('input.submit');
	});

	this.commentMaxLength = ui.option(200);

	this.emptyHint = ui.option('请输入网页、视频的链接');

	// 提交share的action
	this.action = ui.option('#');
    
	this.renderInputer = function(self, data) {
		var inputer = self.make('inputer', data);
		self.inputerBox.grab(inputer);
	};

	this.renderEditor = function(self, data) {
		var editor = self.make('editor', data);
		self.editorBox.grab(editor);
	};

	this.renderLoadingBox = function(self) {
		var loadingBox = self.make('loadingBox');
		self.box.grab(loadingBox);
	};

	this.renderSuccessBox = function(self) {
		var successBox = self.make('successBox');
		self.box.grab(successBox);
	};

	this.inputerSubmit_click = function(self, event) {
		event.preventDefault();

		if (!self.inputer._link.checkValidity()) {
			self.inputer.invalid(self.emptyHint);
		} else  {
			self.inputer._link.blur(); // chrome下会保持focus，导致按回车重复发布。
			self.parseLink();
		};
	};

	this.inputerSubmit_requestSuccess = function(self, event) {
		var result = JSON.parse(event.request.responseText);
		if (result.code && result.code !== 0) {
			self.error(result.msg);
			self.reload();
			return;
		}

		var data = {
			thumbLength : result.images? result.images.length : 0,
			url: result.url,
			title: result.title,
			summary: result.summary,
			thumbUrl: result.thumbUrl,
			videoThumb: result.type === 10,
			defaultThumb: result.type !== 10,
			type: result.type,
			meta: encodeURIComponent(JSON.stringify(result.meta))
		};

		self.render('editor', data);
		self.editor.store('thumbs', result.images);
		self.linkParsed = true;

		self.loadingBox.hide();
		self.editorBox.show();
	};

	this.inputerSubmit_requestError = function(self) {
		self.error();
		self.reload();
	};

	this.submitButton_click = function(self, event) {
		if (self._submitButton.get('formAction') != self.get('action')) return;

		event.preventDefault();

		if (self.linkParsed) {
			var comment = self._form.elements.namedItem('comment');
			var title = self._form.elements.namedItem('title');
			if (!title.get('value')) {
				self.form.invalid('请输入分享标题');
			} else if (comment.get('value').length > self.commentMaxLength) {
				self.form.invalid('请输入' + self.commentMaxLength + '字以内的描述，您输入了' + comment.get('value').length + '个字');
			} else {
				self.addShare();
			}
		}
	};

	this.submitButton_requestSuccess = function(self, event) {
		if (self.__addShareRequest !== event.request) return;
		var result = JSON.parse(event.request.responseText);
		self.processAddShare(result);
	};

	this._processAddShare = function(self, result) {
		if (result.code !== 0) {
			self.error(result.msg);
			self.reload();
		} else {
			self.finish();
		}
	};

	this._load = function(self) {
		self.linkParsed = false;
		self.showInputer();
		self._submitButton.set('formAction', self.get('action'));
	};

	this._unload = function(self) {
		self.revert();
	};

	this._showInputer = function(self) {
		self.inputerBox.show();
		self.render('inputer');
		self.render('inputerSubmit');
	};

	// 发送一个url
	this._parseLink = function(self) {
		self.render('loadingBox');

		self.inputerBox.hide();
		self.loadingBox.show();

		self._inputerSubmit.send();
	};

	// 发送一个分享
	this._addShare = function(self) {
		self.__addShareRequest = self._submitButton.send();
		self.editorBox.hide();
		self.loadingBox.show();
	};

	this._reload = function(self) {
		self.unload();
		self.load();
	};

	this._finish = function(self) {
		self.render('successBox');
		self.successBox.show();
		self.loadingBox.hide();
	};

});

});
object.add('xn.globalpublisher.addons.photo', 'dom, net, ui, string, xn.globalpublisher.utils', function(exports, dom, net, ui, string, xn) {

/**
 * 照片publisher
 * @extends ui.Component
 */
this.PhotoPublisher = new Class(ui.Component, function() {

	this.box = ui.define1('section');
	this.uploadSelector = ui.define1('.upload-selector');
	this.uploadingBox = ui.define('.uploading-module');
	this.successBox = ui.define('section > .success-module');
	this.editorBox = ui.define1('.photo-info-box');
	this.editor = ui.define1('.photo-info');
	this.multipleUploader = ui.define1('.flashUploader');
	this.uploadIframe = ui.define1('[name=global-publisher_upload]');
	this.uploadTrigger = ui.define1('[name=file]');
	this.uploadSubmit = ui.define1('[name=upload]');
	this.form = ui.define1(function(self) {
		return self._node.getParent('form');
	});
	this.submitButton = ui.define1(function(self) {
		return self._form.getElement('input.submit');
	});

	this.titleMaxLength = ui.option(280);

	// 提交share的action
	this.action = ui.option('#');

	this.renderEditor = function(self, data) {
		var editor = self.make('editor', data);
		self.editorBox.grab(editor);
	};

	this.renderSuccessBox = function(self, data) {
		var box = self.make('successBox', data);
		self.box.grab(box);
	};

	this.submitButton_click = function(self, event) {
		if (self._submitButton.get('formAction') != self.get('action')) return;
		event.preventDefault();
		if (!self._uploaded) return;

		if (self._form.elements.namedItem('title').get('value').length > self.titleMaxLength) {
			 self.form.invalid('请输入' + self.titleMaxLength + '字以内的描述，您输入了' + self._form.elements.title.get('value').length + '个字');
		} else {
			self.postPhoto();
		}
	};

	this.submitButton_requestSuccess = function(self, event) {
		if (event.request !== self.__postPhotoRequest) return;

		var result = JSON.parse(event.request.responseText);
		self.processPostPhoto(result);
	};

	this._processPostPhoto = function(self, result) {
		if (result.code !== 0) {
			self.error(result.msg);
			self._editorBox.show();
			self._uploadingBox.hide();
		} else {
			self.finish();
		}
	};

	/**
	 * 开始上传
	 */
	this._startUpload = function(self) {
		self.uploadSelector.hide();
		self.uploadingBox.show();
		self.disableSubmitButton();
	};

	this._disableSubmitButton = function(self) {
		self._submitButton.classList.add('submit_disabled');
		self._submitButton.disabled = true;
	};

	this._enableSubmitButton = function(self) {
		self._submitButton.classList.remove('submit_disabled');
		self._submitButton.disabled = false;
	};

	/**
	 * 上传成功后的回调
	 */
	this._uploadComplete = function(self, result) {
		self.enableSubmitButton();
		if (result.code !== 0) {
			self.uploadFail();
			self.error(result.msg);
		} else {
			self.uploadingBox.hide();
			self.editorBox.show();

			self.__uploadedPhoto = result;
			self.render('editor', result);
		}
	};

	this._uploadFail = function(self) {
		self.uploadingBox.hide();
		self.uploadSelector.show();
	};

	this._load = function(self) {
		self._uploadSelector.show();
		self._editorBox.hide();
		self._submitButton.set('formAction', self.get('action'));
	};

	this._unload = function(self) {
		self.__uploadedPhoto = null;
		self.uploadingBox.hide();
		self.editorBox.hide();
		self.successBox.hide();

		self.revert();
	};

	/**
	 * 最后一步提交照片
	 */
	this._postPhoto = function(self) {
		self.__postPhotoRequest = self._submitButton.send();
		self.editorBox.hide();
		self.uploadingBox.show();
	};

	this.multipleUploader_click = function(self, event) {
		XN.flashUpload.popup(event);
	};

	this.uploadIframe_load = function(self) {
		if (!self._uploaded) return;
		var json = self._uploadIframe.contentWindow.result;
		if (!json) {
			self.uploadFail();
			self.error('服务器错误，请稍候再试。');
		} else {
			self.uploadComplete(json);
		}
	};

	/*
	 * 之前的方法是在onchange事件中ajax获取模板，模板回调中form.submit()，但是在Linux中出现首次form.submit()无效的问题（文件提交不上去，form.elements.file.value取不到，
	 * 改成了onchange事件直接form.submit()，提交成功后再去获取模板
	 * EXP: 这是操作系统级别的bug，需要注意
	 */
	this.uploadTrigger_change = function(self, event) {

		if (!self._uploadTrigger.value) return;

		if (!(/\.(png|jpg|jpeg|gif|bmp)/i).test(self._uploadTrigger.value)) {
			XN.DO.showError('请选择一张图片');
			return;
		}

		self.startUpload();
		// 由于上传接口不支持传递channel参数，在提交前将channel表单项改名，上传完毕后改回来
		var channelItem = self._form.elements.namedItem('channel');
		if (channelItem) {
			channelItem.name = '__channel';
			if (channelItem.length) {
				for (var i = 0; i < channelItem.length; i++) {
					channelItem[i].name = '__channel';
				}
			}
		}
		self._uploadSubmit.click();
		if (channelItem) {
			channelItem.name = 'channel';
			if (channelItem.length) {
				for (var i = 0; i < channelItem.length; i++) {
					channelItem[i].name = 'channel';
				}
			}
		}
		self._uploaded = true;
	};

	this._finish = function(self) {
		self.render('successBox', self.__uploadedPhoto);
		self.uploadingBox.hide();
		self.successBox.show();
	};

	this._reload = function(self) {
		self.unload();
		self.load();
	};

});

});
object.add('xn.globalpublisher.addons.speech', 'ui', function(exports, ui) {

this.SpeechAddon = new Class(ui.Component, function() {

	this.speechButton = ui.define1('.speech-button');

	this._init = function(self) {
		if ('webkitSpeech' in document.createElement('input')) {
			self._speechButton.show();
		}
	};

	this.speechButton_webkitspeechchange = function(self) {
		self._speechInput.value += self._speechButton.value;
		self._speechButton.value = '';
	};

});

});
object.add('xn.globalpublisher.addons.blog', 'ui, net, xn.globalpublisher.utils', function(exports, ui, net, xn) {

/**
 * 日志publisher
 * @extends ui.Component
 */
this.BlogPublisher = new Class(ui.Component, function() {

	this.box = ui.define1('section');
	this.successBox = ui.define('section > .success-module');
	this.editorBox = ui.define1('.blog-editor-box');
	this.loadingBox = ui.define('.loading-module');
	this.editor = ui.define1('.blog-editor');
	this.form = ui.define1(function(self) {
		return self._node.getParent('form');
	});
	this.submitButton = ui.define1(function(self) {
		return self._form.getElement('input.submit');
	});
	this.saveButton = ui.define1(function(self) {
		return self._form.getElement('.altsubmit');
	});

	this.idAPI = ui.option('#');
	this.action = ui.option('#');
	this.draftAPI = ui.option('#');
	this.autoSaveAPI = ui.option('#');
	this.autoSaveMinLength = ui.option(30); // 超过30字的内容才自动保存

	this._init = function(self) {
		self._saveButton.set('formAction', self.get('draftAPI'));
	};

	this.renderEditor = function(self, data) {
		var editor = self.make('editor', data);
		self.editorBox.grab(editor);
		new XN.form.richEditor({
			theme : "advanced",
			skin : 'xiaonei',
			mode : "exact",
			height: "350",
			width: "520",
			elements: 'editor',
			invalid_elements:'img,object,embed',
			language : "zh",
			plugins : "safari,paste,-xnLink,-xnMode,-xnPatch,tabfocus",
			theme_advanced_buttons1:'bold,italic,underline,|,forecolor,backcolor,|,fontselect,fontsizeselect,|,bullist,numlist,|,link,unlink,|,removeformat',
			theme_advanced_buttons2 : "", 
			theme_advanced_buttons3 : "",
			theme_advanced_toolbar_location : "top",
			theme_advanced_toolbar_align : "left",
			theme_advanced_path : false,
			theme_advanced_statusbar_location : "bottom",
			theme_advanced_resizing : false,
			theme_advanced_resize_horizontal : false,
			theme_advanced_resizing_use_cookie : 1,
			theme_advanced_more_colors : false,
			theme_advanced_font_sizes : '10pt=10pt,12pt=12pt,14pt=14pt,18pt=18pt,24pt=24pt,36pt=36pt',
			theme_advanced_fonts:'宋体=宋体;楷体=楷体_GB2312;黑体=黑体;隶书=隶书;Arial=Arial;Times = Times New Roman',
			custom_undo_redo : false,
			content_css : 'http://s.xnimg.cn/a15470/csspro/module/editor-content.css',
			editor_css : 'http://s.xnimg.cn/a24014/csspro/module/editor-ui_3.css',
			convert_urls : true,
			relative_urls : false,
			tab_focus : ':prev,:next',
			xnAutoSave_disable : 'editorFormBtn editorSaveToDraft',
			shortMediaButton : false,
			requestScopeEntryId : '768434475'
		});
	};

	this.renderSuccessBox = function(self, data) {
		var box = self.make('successBox', data);
		self.box.grab(box);
	};

	this.submitButton_click = function(self, event) {
		if (self._submitButton.get('formAction') != self.get('action')) return;
		event.preventDefault();
		
		if (!self.hasTitle()) {
			self.error('日志标题不能为空');
		} else if (!self.hasContent()) {
			self.error('未填写日志内容');
		} else {
			self.post();
		}
	};
	
	this.saveButton_click = function(self, event) {
		event.preventDefault();
		if (!self.hasTitle()) {
			self.error('日志标题不能为空');
		} else if (!self.hasContent()) {
			self.error('未填写日志内容');
		} else {
			self.save();
		}
	};

	this.saveButton_requestSuccess = function(self, event) {
		var result = JSON.parse(event.request.responseText);
		self.processSave(result);
	};

	this.form_requestSuccess = function(self, event) {
		var result = JSON.parse(event.request.responseText);

		if (event.request === self.__postRequest) {
			self.processPost(result);
		} else if (event.request === self.__autoSaveRequest) {
			if (result.code == 0) {
				XN.DO.showMessage('自动保存成功！');
			} else {
				self.error(result.msg);
			}
		}
	};

	this._processPost = function(self, result) {
		if (result.code == 0) {
			self.finish();
		} else {
			self.error(result.msg);
			self.editorBox.show();
		}
	};

	this._processSave = function(self, result) {
		if (result.code == 0) {
			self.finish(true);
		} else {
			self.error(result.msg);
			self.editorBox.show();
		}
	};
	
	//safari下第一个字符不能是汉字，加个空格，囧。。
	this.fixWebKit = function(self) {
		if( XN.browser.WebKit ) {
			self._form.elements.body.value += "&nbsp;";
		}
	};
	
	this.requestError = function(self, event) {
		XN.DO.showError("系统繁忙，请稍后再试！");
	};

	this._finish = function(self, isSave) {
		self.posted = true;
		self._loadingBox.hide();
		self.render('successBox', {
			'post_success': !isSave,
			'save_success': !!isSave
		});
		self._successBox.show();
	};

	this._load = function(self) {
		// 需要先获取blogId
		var request = new net.Request({
			url: self.get('idAPI'),
			method: 'post',
			onsuccess: function(event) {
				var result = JSON.parse(event.request.responseText);
				if (result.code == '0') {
					self.render('editor', {
						blogId: result.msg
					});
					self._editorBox.show();
					self._saveButton.show();
					self.startAutoSaver();
					//safari加空格
					self.fixWebKit();
				}
			}
		});
		request.send('');
		self._submitButton.set('formAction', self.get('action'));
		self.posted = false;
	};

	this.hasTitle = function(self) {
		return !!self._form.elements.namedItem('title').get('value');
	};

	this.hasContent = function(self) {
		tinyMCE.get('editor').save();
		return self._form.elements.body.value.trim().replace(/(?:<bar \/>|<p>|<\/p>)/ig, '');
	};

	this.getContentLength = function(self) {
		tinyMCE.get('editor').save();
		return self._form.elements.body.value.replace(/<\/?[^>]+>/igm, '').length;
	};

	this._autoSave = function(self) {
		if (self.hasContent() && self.getContentLength() > self.get('autoSaveMinLength')) {
			self.__autoSaveRequest = self._form.createRequest({
				url: self.get('autoSaveAPI')
			});
			self.__autoSaveRequest.send();
		}
	};

	this.startAutoSaver = function(self) {
		self.__autoSaver = setInterval(function() {
			self.autoSave();
		}, 60000);
	};

	this.stopAutoSaver = function(self) {
		clearInterval(self.__autoSaver);
	};

	this._save = function(self) {
		self._editorBox.hide();
		self._loadingBox.show();
		self._saveButton.send();
	};

	this._post = function(self) {
		self._editorBox.hide();
		self._loadingBox.show();
		self._form.action  = self.get('action');
		self.__postRequest = self._form.send();
	};

	this._unload = function(self) {
		self._editorBox.hide();
		self._successBox.hide();
		self._saveButton.hide();
		self.stopAutoSaver();

		self.revert();
	};

	this._reload = function(self) {
		self.unload();
		self.load();
	};

});

});

object.add('xn.globalpublisher.addons.publishTo', 'ui, net, dom', function(exports, ui, net, dom) {

this.PublishToPanelGroup = new Class(ui.Component, function() {

	this.inputs = ui.define('input');
	this.legend = ui.define1('legend');

	this._init = function(self) {
		self.name = self._legend.innerHTML;
		self.selected = [];
	};

	this.inputs_click = function(self, event, input) {
		var _input = input.getNode();
		var selected = self.selected;
		self._inputs.forEach(function(input) {
			var pos = selected.indexOf(input.value);
			if (input.checked && pos == -1) selected.push(input.value);
			else if (!input.checked && pos != -1) selected.splice(pos, 1);
		});
		self.fireEvent('select');
	};

});

this.PublishToPanel = new Class(ui.Component, function() {

	this.all = ui.define1('.publish-to-all input');
	this.groups = ui.define('fieldset.publish-to-group', exports.PublishToPanelGroup);
	this.note = ui.define('.note');

	this._init = function(self) {
		self.selected = {};
		self.groups.forEach(function(group) {
			self.selected[group.name] = group.selected;
		});
	};

	this._select = function(self) {
		if (self.hasSelected()) {
			self._all.setCustomValidity('');
			self._note.set('innerHTML', '');
			self._note.hide();
		} else {
			self._all.setCustomValidity('你还没选择发布目标哦！');
			self._note.set('innerHTML', '请至少选择一项');
			self._note.show();
		}
	};

	this._selectTooLess = function(self) {
	};

	// 不能用change事件，IE8下无法在用户刚刚操作完后触发，而是下一次点击后触发
	this.all_click = function(self, event) {
		self.select();
	};

	this.groups_select = function(self, event, group) {
		self.select();
	};

	/*
	* 所有group，包括all，是否有被选择
	* */
	this.hasSelected = function(self) {
		return self._all.checked || Object.keys(self.selected).some(function(name) {
			return self.selected[name].length > 0;
		});
	};

});

this.PublishToPanelBox = new Class(ui.Component, function() {

	this.closeButton = ui.define('.close-button');

	this._init = function(self, node, options) {
		self.closed = true;
	};

	this._open = function(self) {
		self.show();
		self.closed = false;
	};

	this._close = function(self) {
		self.hide();
		self.closed = true;
	};

	this.closeButton_click = function(self) {
		self.close();
	};

});

this.PublishToAddon = new Class(ui.Component, function() {

	this.publishToButton = ui.define1('.publish-to-button');

	this.publishToInfo = ui.define1('.publish-to-info');

	this.publishToPanel = ui.define1('.publish-to-panel', exports.PublishToPanel);

	this.publishToPanelBox = ui.define1('.publish-to-panel-box', exports.PublishToPanelBox);

	this.defaultPublishTo = ui.option(null);

	this.publishToGroupsAPI = ui.option('#');

	this.publishToButton_click = function(self, event) {
		event.stopPropagation(); // 阻止输入状态收起
		event.preventDefault();

		if (!self.publishToPanel) {
			var xhr = new net.Request({
				method: 'get',
				url: self.publishToGroupsAPI,
				onsuccess: function(event) {
					var result = JSON.parse(event.request.responseText);
					if (result.code && result.code !== 0) {
						self.error(result.msg);
					} else {
						var data = {
							qunList: result.channels.qun.result,
							noQunList: !result.channels.qun.result.length
						};
						self.render('publishToPanel', data);
						self.publishToPanelBox.render('closeButton'); // panel中有一个closeButton
						self.publishToPanelBox.open();
					}
				}
			});
			xhr.send();
		} else if (self.publishToPanelBox.closed) {
			self.publishToPanelBox.open();
		} else {
			self.publishToPanelBox.close();
		}
	};

	this.publishToPanel_select = function(self) {
		var doc = [];

		if (self.publishToPanel._all.checked) {
			doc.push('全部好友');
		}

		// n个群
		Object.keys(self.publishToPanel.selected).forEach(function(name) {
			var selectedLength = self.publishToPanel.selected[name].length;
			if (selectedLength) {
				doc.push(selectedLength + '个' + name);
			}
		});

		if (doc.length) {
			// 先提取出前两个，用“及”连接，并且为剩下的数组部分最前面加入一空字符，保证后面部分在join时会在头部输出一个“、”
			//                                ('全部好友'及'3个小群')         (''、'5个小组'、'1个好友分组')
			self._publishToInfo.innerHTML = doc.splice(0, 2, '').join('及') + doc.join('、');
		} else {
			self._publishToInfo.innerHTML = '未选择';
		}
	};

	this.renderPublishToPanel = function(self, data) {
		var publishToPanel = self.make('publishToPanel', data);
		self.publishToPanelBox.grab(publishToPanel);
	};

	this.publishToPanelBox_open = function(self) {
		if (self.__defaultValueInput) self.__defaultValueInput.dispose();
		self._publishToButton.classList.add('active');
	};

	this.publishToPanelBox_close = function(self) {
		self._publishToButton.classList.remove('active');
	};

	this.publishToPanelBox_click = function(self, event) {
		event.stopPropagation(); // 阻止输入状态收起
	};

	this.editor_submit = function(self) {
		return; // 已经至灰按钮了
		if (!self.publishToPanel) return;
		var msg = self.publishToPanel._all.validationMessage;
		if (msg) self.editor.invalid(msg);
	};

	this.onshowactions = function(self) {
		self.publishToButton.show();
	};

	this.onhideactions = function(self) {
		self.publishToButton.hide();
		self.publishToPanelBox.close();
	};

	this.onrevert = function(self) {
		self._publishToInfo.innerHTML = '全部好友';
		if (self.__defaultValueInput) self.__defaultValueInput.dispose();
		self.publishToPanelBox.close();
	};

	this.onpublish = function(self) {
		// 发布前检测是否带有defaultValue，避免由于没有打开过publishToPanel而不发送任何发送到信息到接口
		if (!self.defaultPublishTo || self.publishToPanel) return;
		if (self.__defaultValueInput) self.__defaultValueInput.dispose();
		name = self.defaultPublishTo.split('=')[0];
		value = self.defaultPublishTo.split('=')[1];
		self.__defaultValueInput = dom.wrap(document.createElement('input'));
		self.__defaultValueInput.name = name;
		self.__defaultValueInput.value = value;
		self.__defaultValueInput.type = 'hidden';
		self._editor.appendChild(self.__defaultValueInput);
	};

});

});
object.add('xn.globalpublisher.products.statusdefault', [
	'dom',
	'ui',
	'events',
	'xn.globalpublisher',
	'xn.globalpublisher.addons.status',
	'xn.globalpublisher.addons.share',
	'xn.globalpublisher.addons.photo',
	'xn.globalpublisher.addons.speech',
	'xn.globalpublisher.addons.blog',
	'xn.globalpublisher.addons.publishTo',
	'xn.ui'
], function(exports, dom, ui, events, xn) {

var statusTemplate = '\
{{#sec_loading}}\
<div class="loading-module">\
	<p><img src="http://xnimg.cn/n/res/icons/indicator.gif" width="16" height="16" />正在发布，请稍候...</p>\
</div>\
{{/sec_loading}}\
{{#sec_success}}\
<div class="success-module">\
<p><img src="http://xnimg.cn/n/res/icons/right.png" /> 发布成功！</p>\
</div>\
{{/sec_success}}\
{{#sec_publishToPanel}}\
<article class="publish-to-panel">\
<section>\
<section class="publish-to-all">\
<label for="publish-to-channel-all"><input id="publish-to-channel-all" type="checkbox" name="channel" value="renren" checked="checked" /> 全站好友新鲜事</label>\
</section>\
<fieldset class="publish-to-group">\
<legend>群</legend>\
<section>\
{{#noQunList}}\
<p>你还没有加入任何群</p>\
{{/noQunList}}\
<ul class="publish-to-channel">\
{{#qunList}}\
<li><label for="publish-to-channel-qun-{{id}}"><input id="publish-to-channel-qun-{{id}}" type="checkbox" name="channel" value="qun_{{id}}" /> <img src="http://a.xnimg.cn/a.gif" class="{{icon}}" width="16" height="16" /> {{{name}}}</label></li>\
{{/qunList}}\
</ul>\
</section>\
</fieldset>\
</section>\
</article>\
{{/sec_publishToPanel}}\
';

this.BlogPublisherAddon = new Class(ui.Component, function() {

	this.blog = ui.define1('#global-publisher-blog-box', xn.globalpublisher.addons.blog.BlogPublisher);

	this.blogTrigger = ui.define1('.global-publisher-blog-trigger');

	this.blog_finish = function(self) {
		self.hideInputer();
		self.hideFooter();
		self.closeButton.hide();
		self.autoClose();
	};

	this.blog_post = function(self) {
		self.hideInputer();
		self.hideFooter();
		self.publish();
	};

	this.blog_processSave = function(self) {
		self.showInputer();
		self.showFooter();
	};

	this.blog_processPost = function(self) {
		self.showInputer();
		self.showFooter();
	};

	this.blog_load = function(self) {
		dom.wrap(self._blogTrigger.parentNode).classList.add('active');
		self._submitButton.set('formAction', self.blog.action);
		self._input.set('placeholder', '写日志标题');
		self._input.name = 'title';
		self.editor.set('enableAt', false);
		self.editor.set('enableEmotion', false);
		self.editor.set('charsTotal', -1);
	};

	this.blog_unload = function(self, event) {
		dom.wrap(self._blogTrigger.parentNode).classList.remove('active');
	};

	this.blogTrigger_click = function(self, event) {
		event.preventDefault();
		if (self.openedAddon == self.blog) return;

		if (self.blog.__activeRuned) {
			if (self.open(self.blog)) self.blog.load();
		} else {
			xn.globalpublisher.utils.getTemplate(self._options.blog.templateUrl, function(template) {
				if (self.blog.__activeRuned) return;
				self.blog.__activeRuned = true;

				self.blog.setTemplate('editor', template, 'sec_editor');
				self.blog.setTemplate('successBox', template, 'sec_success');
				self.blog.setTemplate('loadingBox', template, 'sec_loading');

				if (self.open(self.blog)) self.blog.load();
			});
		}
	};

	this.onclose = function(self, event) {
		if (self.openedAddon === self.blog && self.blog.hasContent() && !self.blog.posted) {
			if (!confirm('确定要取消该日志吗？')) {
				event.preventDefault();
			}
		}
	}

});

this.VideoPublisherAddon = new Class(ui.Component, function() {

	this.video = ui.define1('#global-publisher-video-box', xn.globalpublisher.addons.share.SharePublisher);

	this.videoTrigger = ui.define1('.global-publisher-video-trigger');

	this.video_finish = function(self) {
		self.hideInputer();
		self.hideFooter();
		self.closeButton.hide();
		self.autoClose();
	};

	this.video_addShare = function(self) {
		self.hideInputer();
		self.hideFooter();
		self.publish();
	};

	this.video_processAddShare = function(self) {
		self.showInputer();
		self.showFooter();
	};

	this.video_load = function(self) {
		dom.wrap(self._videoTrigger.parentNode).classList.add('active');
		self._submitButton.set('formAction', self.video.action);
		self._input.set('placeholder', '我的评论...');
		self._input.name = 'comment';
		self.editor.set('enableEmotion', false);
		self.editor.set('charsTotal', -1);
	};

	this.video_unload = function(self, event) {
		dom.wrap(self._videoTrigger.parentNode).classList.remove('active');
	};

	this.videoTrigger_click = function(self, event) {
		event.preventDefault();
		if (self.openedAddon == self.video) return;

		if (self.video.__activeRuned) {
			if (self.open(self.video)) self.video.load();
		} else {
			xn.globalpublisher.utils.getTemplate(self._options.video.templateUrl, function(template) {
				if (self.video.__activeRuned) return;
				self.video.__activeRuned = true;

				self.video.setTemplate('inputer', template, 'sec_inputer');
				self.video.setTemplate('editor', template, 'sec_editor');
				self.video.setTemplate('successBox', template, 'sec_success');
				self.video.setTemplate('loadingBox', template, 'sec_loading');

				if (self.open(self.video)) self.video.load();
			});
		}
	};

});

this.SharePublisherAddon = new Class(ui.Component, function() {

	this.share = ui.define1('#global-publisher-share-box', xn.globalpublisher.addons.share.SharePublisher);

	this.shareTrigger = ui.define1('.global-publisher-share-trigger');

	this.share_finish = function(self) {
		self.hideInputer();
		self.hideFooter();
		self.closeButton.hide();
		self.autoClose();
	};

	this.share_addShare = function(self) {
		self.hideInputer();
		self.hideFooter();
		self.publish();
	};

	this.share_processAddShare = function(self) {
		self.showInputer();
		self.showFooter();
	};

	this.share_load = function(self) {
		dom.wrap(self._shareTrigger.parentNode).classList.add('active');
		self._submitButton.set('formAction', self.share.action);
		self._input.set('placeholder', '我的评论...');
		self._input.name = 'comment';
		self.editor.set('enableEmotion', false);
		self.editor.set('charsTotal', -1);
	};

	this.share_unload = function(self, event) {
		dom.wrap(self._shareTrigger.parentNode).classList.remove('active');
	};

	this.shareTrigger_click = function(self, event) {
		event.preventDefault();

		if (self.openedAddon == self.share) return;

		if (self.share.__activeRuned) {
			if (self.open(self.share)) self.share.load();
		} else {
			xn.globalpublisher.utils.getTemplate(self._options.share.templateUrl, function(template) {
				if (self.share.__activeRuned) return;
				self.share.__activeRuned = true;

				self.share.setTemplate('inputer', template, 'sec_inputer');
				self.share.setTemplate('editor', template, 'sec_editor');
				self.share.setTemplate('successBox', template, 'sec_success');
				self.share.setTemplate('loadingBox', template, 'sec_loading');

				if (self.open(self.share)) self.share.load();
			});
		}
	};

});

this.PhotoPublisherAddon = new Class(ui.Component, function() {

	this.photo = ui.define1('#global-publisher-photo-box', xn.globalpublisher.addons.photo.PhotoPublisher);

	this.photoTrigger = ui.define1('.global-publisher-photo-trigger');

    //由于用户可能上传超大文件，所以在打开其他模块(包括重新上传照片)时要终止之前未完成的上传请求
    //注意：可能存在风险，会终止窗口内所有请求
    this.photoStopUpload = function(self) {
        if (navigator.appName == "Microsoft Internet Explorer") {
            window.document.execCommand('Stop');
        } else {
            window.stop();
        }
    };

	this.onopen = function(self) {
		//如果之前处于照片模式，可能存在照片未上传完毕的情况，所以要停止上传
		if (self.openedAddon == self.photo) {
			self.photoStopUpload();
		}
	};

	this.photo_enableSubmitButton = function(self, event) {
		if (self.publishToPanel && !self.publishToPanel.hasSelected()) {
			event.preventDefault();
		}
	};

	this.photo_finish = function(self) {
		self.hideInputer();
		self.hideFooter();
		self.closeButton.hide();
		self.autoClose();
	};

	this.photo_postPhoto = function(self) {
		self.hideInputer();
		self.hideFooter();
		self.publish();
	};

	this.photo_processPostPhoto = function(self) {
		self.showInputer();
		self.showFooter();
	};

	this.photo_load = function(self) {
		dom.wrap(self._photoTrigger.parentNode).classList.add('active');
		self._submitButton.set('formAction', self.photo.action);
		self._input.set('placeholder', '写照片描述');
		self._input.name = 'title';
		self.editor.set('enableEmotion', false);
		self.editor.set('charsTotal', -1);
	};

	this.photo_unload = function(self, event) {
		dom.wrap(self._photoTrigger.parentNode).classList.remove('active');
	};

	this.photoTrigger_click = function(self, event) {
		event.preventDefault();

		if (self.openedAddon == self.photo) return;

		if (self.photo.__activeRuned) {
			if (self.open(self.photo)) self.photo.load();
		} else {
			xn.globalpublisher.utils.getTemplate(self._options.photo.templateUrl, function(template) {
				if (self.photo.__activeRuned) return;
				self.photo.__activeRuned = true;

				self.photo.setTemplate('editor', template, 'sec_editor');
				self.photo.setTemplate('successBox', template, 'sec_success');

				if (self.open(self.photo)) self.photo.load();
			});
		}
	};

});

this.StatusPublisher = new Class(xn.globalpublisher.addons.status.StatusPublisher, function() {

	this.input = ui.define1('textarea[name=content]');
	this.submitButton = ui.define1('input.submit');

	this._reload = function(self) {
		if (self.openedAddon) return;
		self.showFooter();
		self.showInputer();
		this.parent(self);
	};

	this._finish = function(self, html) {
		this.parent(self, html);
		self.autoClose();
	};

	this._postStatus = function(self) {
		self.publish();
		this.parent(self);
	};

});

this.StatusDefaultPublisher = new Class(xn.globalpublisher.Publisher, function() {

	ui.addon(this, exports.StatusPublisher);
	ui.addon(this, exports.SharePublisherAddon);
	ui.addon(this, exports.VideoPublisherAddon);
	ui.addon(this, exports.PhotoPublisherAddon);
	ui.addon(this, exports.BlogPublisherAddon);
	ui.addon(this, xn.globalpublisher.addons.publishTo.PublishToAddon);
	ui.addon(this, xn.globalpublisher.addons.speech.SpeechAddon);

	this.inputer = ui.define('.status-inputer');
	this.footer = ui.define('.global-publisher-footer');

	this.speechInput = ui.define1('textarea[name=content]');

	this._init = function(self) {
		this.parent(self);
		self.__defaultAction = self._editor.action;
		self.__defaultPlaceholder = self._input.getAttribute('placeholder');
		self.__defaultEnableAt = self.editor.get('enableAt');
		self.__defaultEnableEmotion = self.editor.get('enableEmotion');
		self.__defaultCharsTotal = self.editor.get('charsTotal');
	};

	this._showInputer = function(self) {
		self.inputer.show();
	};

	this.hideInputer = function(self) {
		self.inputer.hide();
	};

	this._showFooter = function(self) {
		self.footer.show();
	};

	this._hideFooter = function(self) {
		self.footer.hide();
	};

	this.editor_showInputing = function(self) {
		self.showFooter();
	};

	this.editor_leaveInputing = function(self) {
		if (self.openedAddon) return;
		self.hideFooter();
	};

	this.editor_showLastStatus = function(self, event) {
		if (self.openedAddon) event.preventDefault();
	};

	this._open = function(self, addon) {
		var opened = this.parent(self, addon);
		self.showFooter();
		self._node.classList.add('opened');
		self.editor.hideLastStatus();
		return opened;
	};

	this._close = function(self) {
		this.parent(self);
		self.showFooter();
		self.showInputer();
		if (self.editor.get('inputing')) {
			self.editor.showLastStatus();
		} else {
			self.hideFooter();
		}
		self._node.classList.remove('opened');
		self._editor.action = self.__defaultAction;
		if (self.__defaultPlaceholder) self._input.set('placeholder', self.__defaultPlaceholder);
		self._input.name = 'content';
		self._submitButton.set('formAction', null);
		self.editor.set('enableAt', self.__defaultEnableAt);
		self.editor.set('enableEmotion', self.__defaultEnableEmotion);
		self.editor.set('charsTotal', self.__defaultCharsTotal);
	};

	this._publish = function(self) {
		// publish
	};

	this._autoClose = function(self, time) {
		if (!time) time = 2000;
		// 避免框架页切换导致被clearTimeout
		if (window.asyncHTMLManager) {
			var setTimeout = window.asyncHTMLManager.__timer.setTimeout;
		}
		self.__closeTimer = setTimeout(function() {
			self.close();
			self.reload(); // 重新加载状态发布
		}, time);
	};

	this.publishToPanel_select = function(self, event) {
		if (self.publishToPanel.hasSelected()) {
			self.enableSubmitButton();
		} else {
			self.disableSubmitButton();
		}
	};

});

this.listen = function() {
	var ele = dom.getElement('.global-publisher-module');

	if (!ele) return null;

	var userId = XN.user.id || 265728107;

	var publisher = new exports.StatusDefaultPublisher(ele, ui.parseOptions({
		'defaultPublishTo': 'channel=renren',
		'editor.template': statusTemplate,
		'editor.templateSection': 'sec_editor',
		'publishToPanel.template': statusTemplate,
		'publishToPanel.templateSection': 'sec_publishToPanel',
		'successBox.template': statusTemplate,
		'successBox.templateSection': 'sec_success',
		'loadingBox.template': statusTemplate,
		'loadingBox.templateSection': 'sec_loading',
		//'publishToGroupsAPI': 'http://shell.renren.com/channel/0/list?channels=qun',

		'share.templateUrl': 'http://a.xnimg.cn/modules/global-publisher/share.tpl',
		'video.templateUrl': 'http://a.xnimg.cn/modules/global-publisher/video.tpl',
		'photo.templateUrl': 'http://a.xnimg.cn/modules/global-publisher/photo.tpl',
		'blog.templateUrl': 'http://a.xnimg.cn/modules/global-publisher/blog.tpl',

		//'share.templateUrl': '/renren/modules/global-publisher/src/addons/share.tpl',
		//'video.templateUrl': '/renren/modules/global-publisher/src/addons/video.tpl',
		//'photo.templateUrl': '/renren/modules/global-publisher/src/addons/photo.tpl',
		//'blog.templateUrl': '/renren/modules/global-publisher/src/addons/blog.tpl',

		'share.enableAt': true, // @功能
		'share.inputer.parserAPI': 'http://shell.renren.com/' + userId + '/url/parse',
		'share.action': 'http://shell.renren.com/' + userId + '/share?1',
		'share.emptyHint': '请输入网页的链接',
		'share.commentMaxLength': 500,

		'video.enableAt': true, // @功能
		'video.inputer.parserAPI': 'http://shell.renren.com/' + userId + '/url/parse',
		'video.action': 'http://shell.renren.com/' + userId + '/share',
		'video.emptyHint': '请输入视频的链接',
		'video.commentMaxLength': 500,

		'photo.enableAt': true,
		'photo.action': 'http://shell.renren.com/' + userId + '/photo',
		'photo.titleMaxLength': 200,

		'blog.idAPI': 'http://shell.renren.com/' + userId + '/blog/id',
		'blog.draftAPI': 'http://shell.renren.com/' + userId + '/blog/draft',
		'blog.action': 'http://shell.renren.com/' + userId + '/blog',
		'blog.autoSaveAPI': 'http://shell.renren.com/' + userId + '/blog/auto',
		'blog.editor.relative_optype': 'saveDraft',

		'editor.charsTotal': 240,
		'editor.enableUrlShorter': true, // 短网址功能
		'editor.urlShorterLength': 22, // 'http://rrurl.cn/xxxxxx'.length
		'editor.urlShorterMaxLength': 171, // url超过171字符算正常文本
		'editor.chineseChars': true, // 中文字数统计
		'editor.enableAt': true // @功能

	}));

	return publisher;
};

if (this.__name__ == '__main__') {
	dom.ready(function() {
		window.publisher = exports.listen();
	});
}

});

﻿(function() {
XN.namespace("XN.flashUpload");
var progressBar,
	precent,
	nowLoadingNum,
	dlEl,
	albumNameBox,
	selectAlbum,
	appointAlbum,
	albumNameList,
	searchTxt,
	inputTips,
	curAlbumName,
	curAlbumPhotoCount,
	flashDiv,
	album = {},
	curUserId,
	XNEV = XN.event,
	uploadedNum,
	wait4UpNum,
	singleErr,
	isFinish,
	photos,
	albumList,
	flashUploadDialog,
	flashUploadDialogDiv,
	flashvars,
	param,
	postUrl,
	swfobject,
	fromExistAlbum,
	closeBtn,
	mainWindowChange,
	upload4,
	tToken,
	isIE,
	isInit = false,
	_CUR_DOMAIN_UPLOAD = "http://upload.renren.com";

if (window.CUR_DOMAIN_UPLOAD) {
	_CUR_DOMAIN_UPLOAD = CUR_DOMAIN_UPLOAD;
}

//展示广告，需要后台返回合适的HTML代码
function showAd(ad) {
	$('activityTipFlashUploader').innerHTML = ad;
}

//flash上传的推广活动
/*
*参数说明
*code:0/1, （1表示请求正确返回，0表示出错）
*isActive:0/1, （1表示可以显示该广告，0表示不显示该广告）
*assignKey:0/1，（1表示显示用户领到兑换券，0表示显示用户继续上传）
*msg：对于2来说，返回div，对于3来说，返回当次用户上传的张数
*/
function activities(u) {
	try {
	
	new XN.net.xmlhttp({
		method : 'GET',
		url : u,
		onSuccess : function(r) {
			var response = XN.JSON.parse(r.responseText);
			if (response.code == 0) {
				if (response.isActive == 1) {
					showAd(response.msg);
				}
			}
		}
	});
	
	
	
	} catch(e) {
	}
	
}
	
	
//对于只上传一张照片的用户，进行引导
function sbUser() {
	$('popUploadTip').style.display = "";
	setTimeout(function() {
		$('popUploadTip').style.display = "none";
	}, 5000);
}


//重新居中定位这个窗口
function reLocate() {
	var w = this.frame;
	var s = XN.event.scrollTop();  //获取滚动条的位置
	var newTop = (XN.event.winHeight() - w.offsetHeight)/2;
	newTop = (newTop <= 0) ? s : newTop + s;  //防止减出负值 极端状况顶头显示
	w.style.top = newTop + 'px';
}

//取票
function getToken() {
	new XN.net.xmlhttp({
		method : "GET",
		url : _CUR_DOMAIN_UPLOAD + '/upload/ticket?pagetype=addphotoflash',
		onSuccess : function(r) {
			tToken = r.responseText;
			flashDiv.setUploadUrl(_CUR_DOMAIN_UPLOAD + '/upload.fcgi?pagetype=addphotoflash&hostid=' + curUserId + '&tick=' + tToken);
		}
	});
}

//长高flash,显示slogan
function flashGrowUp() {
	var rows,
		flashHeight;
	rows = Math.ceil((1 + wait4UpNum) / 7);
	if (rows > 1) {
		flashHeight = 103 * rows;
		$("slogan").style.display = "none";
	} else {
		$("slogan").style.display = "";
		flashHeight = 100;
	}
	//如果是IE，需要调flash高度
	if (isIE) {
		flashDiv.height = flashHeight;
	}
}
	
//调用急速上传	
function showActivex() {
	var obj;
	try {
		obj = new ActiveXObject("rralbum.Uploader.4");
	} catch(e) {
		obj = new ActiveXObject("xnalbum.Uploader.4");
	}
	obj.appTitle = "控件上传";  
	obj.url = _CUR_DOMAIN_UPLOAD + '/uploadservice.fcgi?pagetype=addPhotoX';
	var albumId = albumList[0].id;
	if( albumId !== undefined){
		obj.targetAlbumId = albumId;
	}

	obj.uid = curUserId;
	obj.onstatechange = function(albumid) {
		location.href = " http://photo.renren.com/editphotolist.do?id=" + albumid;
	}      
	obj.show();
}

//检测是否安装急速上传
function isInstalledActiveXObject(){
	try {
		 upload4 = new ActiveXObject( "rralbum.Uploader.4" );
		 return true;
	} catch ( e ) {
		try {
			upload4 = new ActiveXObject( "xnalbum.Uploader.4" );
			return true;
		} catch (e) {
			return false;
		}
	}
}


//检测是否IE，是否能用急速上传
function detectIEUserAndActiveX() {
	//给非IE用户隐藏掉急速上传
	if (!XN.browser.IE) {
		$("isIE").style.display = "none";
	} else {
		$("isIE").style.display = "";
	}
}
	
//关闭窗口的事件onbeforeunload
function onbeforeunload_handler(e) {
	if (mainWindowChange == 1) {
		(e || window.event).returnValue = '未完成上传，此时关闭将丢失正在上传的所有图片 ，确定要离开吗？';
	}
}

//给IE6加li的hover
function addLiHover() {
	var picUl = $('picUl'),
		picLi = Sizzle('li', picUl);
	for (var i = 0; i < picLi.length; i++) {
		var el = $(picLi[i]);
		if (el.getAttribute('hoverHandler') == 'ok') {
		} else {
			el.setAttribute('hoverHandler', 'ok');
			XN.event.addEvent(el, 'mouseover', function() {
				$(Sizzle('div.photo-del', el)[0]).style.visibility = 'hidden';
				$(Sizzle('div.upload-state', el)[0]).style.visibility = 'visible';
			});
		}
	}
}

//给相册名字列表加上事件代理
function addEvent2AlbumList() {
	XNEV.addEvent('albumNameList', 'click', function(e) {
		var e = e || window.event;
		e.preventDefault();
		var el = XNEV.element(e);
		if (el.nodeName == 'SPAN') {
			el = el.parentNode;
		}
		var seq = parseInt(el.getAttribute('seq'));
		album.id = albumList[seq].id;
		album.name = albumList[seq].name;
		curAlbumName.innerHTML = Sizzle('span', el)[0].innerHTML;
		curAlbumPhotoCount.innerHTML = Sizzle('span', el)[1].innerHTML;
		curAlbumName.parentNode.setAttribute('seq', seq);
		$('appointAlbum').delClass('selected');
	});
}

//搜索相册
function albumSearch(albumNameList, selectAlbum, searchTxt, albumList) {
	var albumNameList = Sizzle('dd', albumNameList);
	XNEV.addEvent(searchTxt, 'keyup', function(e) {
		var inputValue = searchTxt.value;
		for (var i = 0; i < albumList.length; i++) {
			if (inputValue != "" && albumList[i].name.indexOf(inputValue) != -1) {
			} else if(inputValue == "") {
				$(albumNameList[i].firstChild).style.display = "";
			} else {
				$(albumNameList[i].firstChild).style.display = "none";
			}
		}
	});
}

//上传到已有相册
function upload2Album(el) {
	var el = el,
		seq = parseInt(selectAlbum.getAttribute('seq'));
	$('albumList').style.display = '';
	albumNameBox.style.display = 'none';
	el.innerHTML = '创建新相册';
	$("newOrOld").innerHTML = "上传到：";
	el.id = 'newAlbum';
	//标志这是传到已有的相册
	album.name = albumList[seq].name;
	album.id = albumList[seq].id;
	album.flag = 0;
	album.passwordProtected = false;
	//开启搜索功能
	albumSearch(albumNameList, selectAlbum, searchTxt, albumList);
}

//创建新相册默认XXXX年XX月XX日
function creatDefaultAalbum(el) {
	var el = el;
	$('albumList').style.display = 'none';
	albumNameBox.style.display = '';
	el.innerHTML = '上传到已有相册';
	$('albumList').style.display = 'none';
	albumNameBox.style.display = '';
	el.id = 'oldAlbum';
	$("newOrOld").innerHTML = "新建相册：";
	
	//标志这是传到新建的相册
	album.flag = 1;
	album.name = defaultAlbumGen();
	album.id = 0;
}

//切换上传的相册
function toggleAlbum(el) {
	if (el.id == 'oldAlbum') {
		upload2Album(el);
	} else if (el.id == 'newAlbum') {
		creatDefaultAalbum(el);
		$("albumTitle").select();
	}
}

//读取已有的相册数据
function albumListGen(ownerId) {
	var htmlTemp = [];
	new XN.net.xmlhttp({
		url : 'http://photo.renren.com/photo/' + parseInt(ownerId) + '/album/common/ajax',
		method : 'GET',
		onSuccess : function(r) {
			r = XN.json.parse(r.responseText);
			albumList = r.list;
			for (var i = 0, key = 0; i < albumList.length; i++) {
				if (albumList[i].photoCount < 120) {
					if (key == 0) {
						curAlbumName.innerHTML = albumList[i].name;
						curAlbumPhotoCount.innerHTML = '(' + albumList[i].photoCount + ')';
						curAlbumName.parentNode.setAttribute('seq', i);
						key = 1;
					}
					htmlTemp[i] = '<dd><a id="' + albumList[i].id + '" seq="' + i + '" href="###"><span class="album-name">' + albumList[i].name + '</span><span class="photo-num-flashUploader">(' + albumList[i].photoCount + ')</span></a></dd>';
					//如果是从已有相册上传
					if (albumList[i].id == fromExistAlbum) {
						curAlbumName.innerHTML = albumList[i].name;
						curAlbumPhotoCount.innerHTML = '(' + albumList[i].photoCount + ')';
						curAlbumName.parentNode.setAttribute('seq', i);
					}
				}
			}
			
			albumNameList.innerHTML = htmlTemp.join('');
			$(Sizzle('span.all-album')[0]).innerHTML = '共' + albumList.length + '个相册';
			//如果是从已有相册上传，切换默认显示
			if (fromExistAlbum != 0) {
				toggleAlbum($(Sizzle('a.toggleAlbum')[0]));
			}
			//给相册名字列表加上事件代理
			addEvent2AlbumList();
			
		}
	});
	
}


//defaultAlbumGen
function defaultAlbumGen() {
	var _date = new Date(),
		_album = _date.getFullYear() + '年' + (_date.getMonth() + 1) + '月' + _date.getDate() + '日';
	$("albumTitle").value = _album;
	album.flag = 1;
	return _album;
}

//往photos数组中添加照片数据
function addPhotoData(obj) {
	photos.push(obj);
	return photos;
}

//从photoData里面减去为id的数据
function delPhotoData(obj) {
	var id = obj.file.id;
	for(var i = 0; i < photos.length; i ++) {
		if (photos[i].tempID == id) {
			photos.splice(i, 1);
			break;
		}
	}
	--wait4UpNum;
	//调整flash的高度
	flashGrowUp();

	if ($(id).getAttribute('status') == 'ed') {
		--uploadedNum;
	}
	if ($(id).getAttribute('status') == 'err') {
		--singleErr;
	}
	$(id).remove();
	ajProgressBar(uploadedNum + singleErr, wait4UpNum);
	if (singleErr + uploadedNum == wait4UpNum) {
		isFinish = 1;
	}
	if (isFinish) {
		$('uploadFinish').delClass('gray-btn-flashUploader');
		if (wait4UpNum == 0) {
			$('uploadFinish').addClass('gray-btn-flashUploader');
			isFinish = 0;
		}
		$(Sizzle("div.progress-bar-box")[0]).style.display = "none";
		//是否有上传失败的
		if (singleErr == 0) {
			$("nowLoadingNum").innerHTML = "成功上传" + uploadedNum + "张！";
		} else {
			$("nowLoadingNum").innerHTML = "成功上传" + uploadedNum + "张，失败" + singleErr + "张！";
		}
	}
	//返回被删除的图片的ID
	return id;
}

//侦听到flash的删除事件
function delPhoto(e) {
	var id = e.parentNode.parentNode.id;
	//调用flash的方法
	flashDiv.cancelFile(id);
} 

//变成正在上传样式
// function changeStyle2ing(obj) {
	// isFinish = 0;
// }

function operateDom2(obj) {
	
	var id = obj.file.id,
		picEl = $(id);
	if (!picEl) {
		return false;
	}
	var	uploadState = Sizzle('span', picEl)[0],
		iconEl = Sizzle('div.load-ico', picEl)[0],
		picOper = Sizzle('div.pic-oper', picEl)[0];
		
	uploadState.innerHTML = '上传中';
	iconEl.style.display = "";
	picOper.style.display = "";
	picEl.setAttribute("status", "ing");
	
	$('uploadFinish').addClass('gray-btn-flashUploader');
	$(Sizzle("p.fileName", picEl)[0]).style.display = "none";
	$(Sizzle("div.upload-state-box", picEl)[0]).style.display = "block";
	isFinish = 0;
}

//变成正在后台转码的样式
function changeStyle2pros(obj) {
	setTimeout(function(){operateDom2(obj)}, 0);
	return true;
}

//操作DOM
function operateDom(obj) {
	var id = obj.file.id,
		picEl = $(id);
	if (!picEl) {
		return false;
	}	
	var	uploadState = Sizzle('span', picEl)[0],
		iconEl = Sizzle('div.load-ico', picEl)[0],
		imgEl = Sizzle('img', picEl)[0],
		picOper = Sizzle('div.pic-oper', picEl)[0],
		imgUrl;
	
	//第一时间加上照片
	$extend(obj.response.files[0], {'tempID':id});
	addPhotoData(obj.response.files[0]);
	imgUrl = 'http://fmn.rrimg.com/' + obj.response.files[0].images[3].url;
	var tempImgEl = new Image();
	tempImgEl.onload = function() {
		imgEl.style.backgroundImage = 'url(' + imgUrl + ')';
		$(imgEl).delClass('alphaIMG');
		tempImgEl.onload = null;
	}
	
	
	uploadState.innerHTML = '完成';
	$(uploadState).addClass('upload-done');
	iconEl.style.display = "none";
	picOper.style.display = "";
	++uploadedNum;
	
	picEl.setAttribute("status", "ed");
	
	ajProgressBar(uploadedNum + singleErr, wait4UpNum);
	if (singleErr + uploadedNum == wait4UpNum) {
		isFinish = 1;
		$('uploadFinish').delClass('gray-btn-flashUploader');
		$(Sizzle("div.progress-bar-box")[0]).style.display = "none";
		//是否有上传失败的
		if (singleErr == 0) {
			$("nowLoadingNum").innerHTML = "成功上传" + uploadedNum + "张！";
		} else {
			$("nowLoadingNum").innerHTML = "成功上传" + uploadedNum + "张，失败" + singleErr + "张！";
		}
	}
	
	tempImgEl.src = imgUrl;
}


//变成传完的样式
function changeStyle2ed(obj) {
	obj.response = XN.JSON.parse(obj.response);
	setTimeout(function(){operateDom(obj)}, 0);
	return true;
}

//当发生后台严重网络错误的时候
function changeStyle2netErr() {
	XN.DO.alert({
		title:'提示',
		message:'网络错误，可能由于以下原因导致：<br />' + 
				'1.您的网络暂时出问题了<br />' + 
				'2.如果多次出现，请先使用<a href="' + _CUR_DOMAIN_UPLOAD + '/addphotoPlain.do">其他上传</a>'
	});
}

//单张照片发生错误
function changeStyle2singleErr(id) {
	var picEl = $(id),
		picOper = Sizzle('div.pic-oper', picEl)[0],
		uploadState = Sizzle('span', picEl)[0];
	uploadState.innerHTML = '上传错误';
	++singleErr;
	picOper.style.display = "";
	//单张出错，也可以完成上传
	if (singleErr + uploadedNum == wait4UpNum) {
		$('uploadFinish').delClass('gray-btn-flashUploader');
		isFinish = 1;
	}
	$(Sizzle('div.load-ico', picEl)[0]).remove();
}

//调整进度条
function ajProgressBar(x, y) {
	if (y == 0) {
		return false;
	}
	var percentage = parseInt((x/y)*100);
	if (isIE) {
		progressBar.style.display = "none";
		progressBar.style.width = percentage + '%';
		progressBar.style.display = "";
	}
	progressBar.style.width = percentage + '%';
	precent.innerHTML = x + '/' + y;
	nowLoadingNum.innerHTML = '正在上传' + y +'张照片';
}

//听上传单张失败的错误
function uploadError(obj) {
	var errCode = obj.errorCode,
		fileId = obj.file.id;
	changeStyle2singleErr(fileId);
}

function queuedError(obj) {
	var errPicEl;
	for(var i = 0; i < obj.files.length; i++){
		errPicEl = $(obj.files[i].id);
		$(Sizzle("p.fileName", errPicEl)[0]).style.display = "none";
		$(Sizzle("div.error-state", errPicEl)[0]).style.display = "";
		$(Sizzle("div.upload-state-box", errPicEl)[0]).style.display = "none";
		$(Sizzle("div.pic-oper", errPicEl)[0]).style.display = "";
		$(Sizzle("div.load-ico", errPicEl)[0]).style.display = "none";
		if (obj.files[i].errorType == "zeroByteFile") {
			++singleErr;
			$(Sizzle("div.error-state", errPicEl)[0]).innerHTML = "图片大小为0";
			errPicEl.setAttribute("status", "err");
		} else if (obj.files[i].errorType == "fileExceedsSizeLimit"){
			++singleErr;
			$(Sizzle("div.error-state", errPicEl)[0]).innerHTML = "图片大小超过8M";
			errPicEl.setAttribute("status", "err");
		}
		ajProgressBar(uploadedNum + singleErr, wait4UpNum);
		//单张出错，也可以完成上传
		if (singleErr + uploadedNum == wait4UpNum) {
			isFinish = 1;
			$('uploadFinish').delClass('gray-btn-flashUploader');
			$(Sizzle("div.progress-bar-box")[0]).style.display = "none";
			//是否有上传失败的
			if (singleErr == 0) {
				$("nowLoadingNum").innerHTML = "成功上传" + uploadedNum + "张！";
			} else {
				$("nowLoadingNum").innerHTML = "成功上传" + uploadedNum + "张，失败" + singleErr + "张！";
			}
		}
	}
}

function queueLimitExceeded(obj) {
	XN.DO.alert({
		title : "提示",
		message : '每次最多上传100张照片，默认在你选择的' + obj.selected + '张照片中选中前' + (obj.selected - obj.files.length) + '张进行上传。'
	});
}

//选完照片，开始传
function startUpload(obj) {
	if (mainWindowChange == 0) {
		flashUploadDialog.setWidth("838");
		flashUploadDialog.body.style.height = "455px";
		flashDiv.width = 100;
		flashDiv.height = 100;
		flashDiv.setBtnStatus(3);
		$('flashUploadPreContent').style.display = "none";
		$('flashUploadMainContent').style.display = "";
		$('uploadContent').delClass("upload-content-pre");
		$('uploadContent').addClass("upload-content");
		$("uploadContent").style.width = "";
		$("uploadContent").style.height = "";
		$("uploadHead").style.display = "";
		$("flashUploadPreContent").remove();
		$("flashUploadBtn").style.margin = "";
		$("flashUploadBtn").style.width = "";
		$("flashUploadBtn").style.height = "";
		
		$("flashUploadMainContent").style.width = "795px";
		$("flashUploadMainContent").style.height = "455px"; 
		$("picUl").style.display = "";
		$("uploadFoot").style.display = "";
		//喀嚓鱼广告
		$("activityTipFlashUploader").style.display = "";
		
		if (obj.files.length < 2) {
			sbUser();
		}
		
		mainWindowChange = 1;
		$("albumTitle").select();
		
	}
	
	
	var photoList = obj.files,
		photoCount = photoList.length,
		tempArry = [];
	$('uploadFinish').addClass('gray-btn-flashUploader');
	isFinish = 0;
	//给等待上传的照片计数
	wait4UpNum += photoCount;
	
	//把flash长高，为了IE
	flashGrowUp();
	
	tempArry[0] = $('picUl').innerHTML;
	for (var i = 0; i < photoList.length; i++) {
		tempArry[i+1] = 
		'<li class="wait-upload" id="' + photoList[i].id + '" name="' + photoList[i].name + '" status="wait">' + 
			'<p class="fileName">'+ photoList[i].name + '</p>' + 
			'<img class="alphaIMG" src="http://a.xnimg.cn/a.gif" style="background-image: url(http://a.xnimg.cn/n/apps/photo/cssimg/waitPic4FlashUploader.png);"/>' + 
			'<div class="error-state" style="display:none;">' + 
			'</div>' +
			'<div class="upload-state-box" style="display:none;">' + 
				'<span class="upload-state">' + photoList[i].name + '</span>' + 
			'</div>' + 
			'<div class="pic-oper">' + 
				'<div class="photo-del">删除</div>' + 
			'</div>' + 
			'<div class="load-ico" style="display:none;"></div>' + 
		'</li>';
	}
	
	$('picUl').innerHTML = tempArry.join('');
	tempArry = [];
	
	// if (XN.browser.IE6) {
		// addLiHover();
	// }
	
	
	$(Sizzle("div.progress-bar-box")[0]).style.display = "";
	$("nowLoadingNum").innerHTML = "正在上传" + wait4UpNum + "张照片";
	
	ajProgressBar(uploadedNum + singleErr, wait4UpNum);
	
	
	flashUploadDialog.reLocate();
	//$("uploadContent").scrollTop = $("uploadContent").scrollHeight;
	// $('uploadFoot').innerHTML = flashUploadBtnInnerHTML + uploadFootInnerHTML;
	// $('flashUploadBtn').remove();
}

//对提交的数据进行排序
function _sortFunc(a, b) {
	return parseInt(a.tempID.substring(a.tempID.indexOf("_") + 1)) - parseInt(b.tempID.substring(b.tempID.indexOf("_") + 1));
}
function sortPhotos(data) {
	return data.sort(_sortFunc);
}

//表单提交
function submitAllData() {
	mainWindowChange == 0;
	XN.event.delEvent(window, "beforeunload", onbeforeunload_handler);

	photos = sortPhotos(photos);

	$("flashUploadAlbumData").innerHTML = 
		'<input type="hidden" name="flag" value="' + album.flag + '"/>' +
		'<input type="hidden" name="album.password" value="' + album.password + '"/>' +
		'<input type="hidden" name="album.albumcontrol" value="' + album.albumcontrol + '"/>' +
		'<input type="hidden" name="album.id" value="' + album.id + '"/>' +
		'<input type="hidden" name="album.passwordProtected" value="' + album.passwordProtected + '"/>' +
		'<input type="hidden" name="album.description" value="' + encodeURIComponent(album.description) + '"/>' +
		'<input type="hidden" name="album.name" value="' + encodeURIComponent(album.name) + '"/>' +
		'<input type="hidden" name="photos" value="' + encodeURIComponent(XN.json.build(photos)) + '"/>';
	$("flashUploadAlbumData").submit();
	$("flashUploadBtn").remove();
	flashUploadDialog.remove();
}

//新建相册检核
function checkAlbumIsblank() {
	if (album.flag == 1) {
		var _albumName = $("albumTitle").value;
		_albumName = XN.string.trim(_albumName);
		//检核是否为空
		if (XN.string.isBlank(_albumName)) {
			$("albumNameTips").innerHTML = '相册名字不能为空';
			$("albumNameTips").style.display = "block";
			return false;
		//检核是否超过30个
		} else if (_albumName.length > 30) {
			$("albumNameTips").innerHTML = '长度不能超30个字';
			$("albumNameTips").style.display = "block";
			return false;
		//检核通过，申请新建，走antiSpam
		} else {
			$("albumNameTips").style.display = "none";
			album.name = _albumName;
			
			new XN.net.xmlhttp({
				url : 'http://photo.renren.com/ajaxcreatealbum.do',
				data : 'title=' + encodeURIComponent(album.name) + '&control=' + album.albumcontrol + '&password=' + encodeURIComponent(album.password) + '&passwordProtected=' + album.passwordProtected,
				onSuccess : function(r) {
					var response = XN.JSON.parse(r.responseText);
					if (response.albumid != -1) {
						album.id = response.albumid;
						album.flag = 0;
						XN.event.delEvent(window, "beforeunload", onbeforeunload_handler);
						submitAllData();
					} else {
						album.id = response.albumid;
						album.flag = 1;
						$("albumNameTips").innerHTML = "抱歉，某些信息不能发布";
						$("albumNameTips").style.display = "block";
					}
				}
			});
		}
	} else {
		//如果不是新建相册，就默认返回正确
		$("albumNameTips").style.display = "none";
		XN.event.delEvent(window, "beforeunload", onbeforeunload_handler);
		submitAllData();
		return true;
	}
}

//密码检核
function checkPasswordIsblank() {
	if (album.passwordProtected) {
		_pw = $('inputPW').value;
		_pw = XN.string.trim(_pw);
		if (XN.string.isBlank(_pw) || _pw.length > 13) {
			$(Sizzle('div.password-tips')[0]).style.display = "";
			$(Sizzle('div.password-tips')[0]).style.color = "#F00";
			return false;
		} else {
			$(Sizzle('div.password-tips')[0]).style.display = "none";
			$(Sizzle('div.password-tips')[0]).style.color = "#AAA";
			album.password = _pw;
			return true;
		}
	} else {
		$(Sizzle('div.password-tips')[0]).style.display = "none";
		$(Sizzle('div.password-tips')[0]).style.color = "#AAA";
		return true;
	}
}

/*点击完成上传时
 *obj需要的数据
 */
function endUpload() {
	//检查是否上传完毕
	if (!isFinish) {
		return 'not finish';
	}
	//密码检核
	if (!checkPasswordIsblank()) {
		return false;
	}
	//相册名字检核,检核通过就提交表单
	if (!checkAlbumIsblank()) {
		return false;
	}
}




//给选择相册权限的下拉表加事件
function addEvent2AlbumControl() {
	XNEV.addEvent('limits', 'click', function(e) {
		e.preventDefault();
		var e = e || window.event,
			eTarget = e.target || e.srcElement,
			ddEl = Sizzle('dd', $('limits'));
		
		if (eTarget.id != 'evo' && eTarget.id != 'frd' && eTarget.id != 'pw' && eTarget.id != 'me') {
			return false;
		}
		
		XN.array.each(ddEl, function(i, v) {
			v.style.display = "";
		});
		$('albumNameBox').delClass('usepassword');
		$('inputPW').style.display = "none";
		
		if (eTarget.id == 'evo') {
			//选择所有人可见
			$('evo').style.display = "none";
			album.albumcontrol = 99;
			album.passwordProtected = false;
			$(Sizzle('div.password-tips')[0]).style.display = "none";
		} else if (eTarget.id == 'frd') {
			//选择好友可见
			$('frd').style.display = "none";
			album.albumcontrol = 1;
			album.passwordProtected = false;
			$(Sizzle('div.password-tips')[0]).style.display = "none";
		} else if (eTarget.id == 'pw') {
			//只要是带密码的相册都是所有人可见
			album.albumcontrol = 99;
			album.passwordProtected = true;
			$('pw').style.display = "none";
			$('albumNameBox').addClass('usepassword');
			$('inputPW').style.display = "";
			$(Sizzle('div.password-tips')[0]).style.display = "";
			$(Sizzle('div.password-tips')[0]).style.color = "#AAA";
		} else if (eTarget.id == 'me') {
			//选择仅自己
			album.albumcontrol = -1;
			album.passwordProtected = false;
			$('me').style.display = "none";
			$(Sizzle('div.password-tips')[0]).style.display = "none";
		}
		$('cur').innerHTML = eTarget.innerHTML;
		$("limits").delClass("selected");
	});

	XNEV.addEvent(dlEl, 'mouseover', function(e) {
		var e = e || window.event,
			eTarget = e.target || e.srcElement;
		if (eTarget.id == 'inputPW') {
			dlEl.delClass('selected');
			return false;
		}
		dlEl.addClass('selected');
	}, false);

	XNEV.addEvent(dlEl, 'mouseleave', function(e) {
		dlEl.delClass('selected');
	}, false);
}

//给相册列表下拉框加事件
function addEvent2HoverAlbumName() {
	XN.element.hover(appointAlbum, 'selected');
}

//给关闭按钮加事件
function addEvent2CloseBtn() {
	var closeBtn = Sizzle("a.close-button", $("flashUploadDialog"))[0];
	closeBtn.parentNode.innerHTML = '<span>上传照片</span><a class="close-button" href="#nogo" style="">关闭</a>';
	closeBtn = Sizzle("a.close-button", $("flashUploadDialog"))[0];
	XN.event.addEvent(closeBtn, "click", function(e) {
		var e = e || window.event;
		e.preventDefault();
		if (mainWindowChange == 1) {
			var alertEl;
			alertEl = XN.DO.alert({
				button : "返回上传",
				title : "中断未完成的上传？",
				message : "未完成上传，此时关闭将丢失正在上传的所有图片",
				callback : function(r) {
					if (r) {
						$("flashUploadBtn").remove();
						flashUploadDialog.remove();
						This.remove();
					} else {
						return false;
						This.remove();
					}
				}
			});
			alertEl.addButton({
				text:"强行关闭",
				onclick:function() {
					$("flashUploadBtn").remove();
					flashUploadDialog.remove();
					XN.event.delEvent(window, "beforeunload", onbeforeunload_handler);
				}
			});
			$(alertEl._buttons[1]).addClass("gray");
		} else {
			$("flashUploadBtn").remove();
			flashUploadDialog.remove();
			XN.event.delEvent(window, "beforeunload", onbeforeunload_handler);
		}
	});
}


function addEvent2WindowUnload() {
	XNEV.addEvent(document, "keydown", function(e) {
		var e = e || window.event,
			alertEl;
		if (e.keyCode == 27) {
			//如果已经到上传页面了
			if (mainWindowChange == 1) {
				alertEl = XN.DO.alert({
					button : "返回上传",
					title : "关闭上传",
					message : "未完成上传，此时关闭将丢失正在上传的所有图片",
					callback : function(r) {
						if (r) {
							$("flashUploadBtn").remove();
							flashUploadDialog.remove();
							This.remove();
						} else {
							return false;
							This.remove();
						}
					}
				});
				alertEl.addButton({
					text:"强行关闭",
					onclick:function() {
						$("flashUploadBtn").remove();
						flashUploadDialog.remove();
						XN.event.delEvent(window, "beforeunload", onbeforeunload_handler);
					}
				});
				$(alertEl._buttons[1]).addClass("gray");
				flashUploadDialog.show();
				flashUploadDialog.reLocate();
			}
		}
	});
	
	XNEV.addEvent(window, "beforeunload", onbeforeunload_handler);
}

//用户未登录
function notLogin() {
	XN.DO.alert({
		title : "上传错误",
		message : "当前用户未登录，或者在其他地方下线。请刷新页面或者重新登录！"
	}); 
}

//flash处理照片时发生的错误
//发现错误也视为完成上传
function invalidImgFile(obj) {
	++singleErr;
	var id = obj.file.id,
		picEl = $(id);
		
	
	$(Sizzle("p.fileName", picEl)[0]).style.display = "none";
	$(Sizzle("div.error-state", picEl)[0]).style.display = "";
	$(Sizzle("div.upload-state-box", picEl)[0]).style.display = "none";
	$(Sizzle("div.pic-oper", picEl)[0]).style.display = "";
	$(Sizzle("div.load-ico", picEl)[0]).style.display = "none";
	$(Sizzle("div.error-state", picEl)[0]).innerHTML = "图片格式错误";
	
	ajProgressBar(uploadedNum + singleErr, wait4UpNum);
	picEl.setAttribute("status", "err");
	
	if (singleErr + uploadedNum == wait4UpNum) {
		isFinish = 1;
		$('uploadFinish').delClass('gray-btn-flashUploader');
		$(Sizzle("div.progress-bar-box")[0]).style.display = "none";
		//是否有上传失败的
		if (singleErr == 0) {
			$("nowLoadingNum").innerHTML = "成功上传" + uploadedNum + "张！";
		} else {
			$("nowLoadingNum").innerHTML = "成功上传" + uploadedNum + "张，失败" + singleErr + "张！";
		}
	}

}

//初始化变量	
function initParams() {
	album.password = '';
	album.albumcontrol = 99;
	//album.flag = 0代表默认，1代表新建相册
	album.flag = 0;
	album.id = 0;
	//0代表没有密码，1是有密码
	album.passwordProtected = false;
	album.description = '';
	//初始化
	uploadedNum = 0;
	wait4UpNum = 0;
	singleErr = 0;
	isFinish = 0;
	photos = [];
	albumList = [];
	curUserId = XN.user.id;
	mainWindowChange = 0;
	isIE = XN.browser.IE;
	//getToken();
	
	flashvars = {
		"picUploadNumOnce" : 100, 
		"flashReadyDo" : "XN.flashUpload.flashReady"
		//"maxSingleFileSize" : 2097152
	};
	param = {
		"wmode" : "transparent", 
		"allowscriptaccess" : "always"
	};
	postUrl = _CUR_DOMAIN_UPLOAD + '/upload/' + curUserId + '/photo/save';
	
	//swfobject的初始化
	swfobject = function(){var D="undefined",r="object",S="Shockwave Flash",W="ShockwaveFlash.ShockwaveFlash",q="application/x-shockwave-flash",R="SWFObjectExprInst",x="onreadystatechange",O=window,j=document,t=navigator,T=false,U=[h],o=[],N=[],I=[],l,Q,E,B,J=false,a=false,n,G,m=true,M=function(){var aa=typeof j.getElementById!=D&&typeof j.getElementsByTagName!=D&&typeof j.createElement!=D,ah=t.userAgent.toLowerCase(),Y=t.platform.toLowerCase(),ae=Y?/win/.test(Y):/win/.test(ah),ac=Y?/mac/.test(Y):/mac/.test(ah),af=/webkit/.test(ah)?parseFloat(ah.replace(/^.*webkit\/(\d+(\.\d+)?).*$/,"$1")):false,X=!+"\v1",ag=[0,0,0],ab=null;if(typeof t.plugins!=D&&typeof t.plugins[S]==r){ab=t.plugins[S].description;if(ab&&!(typeof t.mimeTypes!=D&&t.mimeTypes[q]&&!t.mimeTypes[q].enabledPlugin)){T=true;X=false;ab=ab.replace(/^.*\s+(\S+\s+\S+$)/,"$1");ag[0]=parseInt(ab.replace(/^(.*)\..*$/,"$1"),10);ag[1]=parseInt(ab.replace(/^.*\.(.*)\s.*$/,"$1"),10);ag[2]=/[a-zA-Z]/.test(ab)?parseInt(ab.replace(/^.*[a-zA-Z]+(.*)$/,"$1"),10):0}}else{if(typeof O.ActiveXObject!=D){try{var ad=new ActiveXObject(W);if(ad){ab=ad.GetVariable("$version");if(ab){X=true;ab=ab.split(" ")[1].split(",");ag=[parseInt(ab[0],10),parseInt(ab[1],10),parseInt(ab[2],10)]}}}catch(Z){}}}return{w3:aa,pv:ag,wk:af,ie:X,win:ae,mac:ac}}(),k=function(){if(!M.w3){return}if((typeof j.readyState!=D&&j.readyState=="complete")||(typeof j.readyState==D&&(j.getElementsByTagName("body")[0]||j.body))){f()}if(!J){if(typeof j.addEventListener!=D){j.addEventListener("DOMContentLoaded",f,false)}if(M.ie&&M.win){j.attachEvent(x,function(){if(j.readyState=="complete"){j.detachEvent(x,arguments.callee);f()}});if(O==top){(function(){if(J){return}try{j.documentElement.doScroll("left")}catch(X){setTimeout(arguments.callee,0);return}f()})()}}if(M.wk){(function(){if(J){return}if(!/loaded|complete/.test(j.readyState)){setTimeout(arguments.callee,0);return}f()})()}s(f)}}();function f(){if(J){return}try{var Z=j.getElementsByTagName("body")[0].appendChild(C("span"));Z.parentNode.removeChild(Z)}catch(aa){return}J=true;var X=U.length;for(var Y=0;Y<X;Y++){U[Y]()}}function K(X){if(J){X()}else{U[U.length]=X}}function s(Y){if(typeof O.addEventListener!=D){O.addEventListener("load",Y,false)}else{if(typeof j.addEventListener!=D){j.addEventListener("load",Y,false)}else{if(typeof O.attachEvent!=D){i(O,"onload",Y)}else{if(typeof O.onload=="function"){var X=O.onload;O.onload=function(){X();Y()}}else{O.onload=Y}}}}}function h(){if(T){V()}else{H()}}function V(){var X=j.getElementsByTagName("body")[0];var aa=C(r);aa.setAttribute("type",q);var Z=X.appendChild(aa);if(Z){var Y=0;(function(){if(typeof Z.GetVariable!=D){var ab=Z.GetVariable("$version");if(ab){ab=ab.split(" ")[1].split(",");M.pv=[parseInt(ab[0],10),parseInt(ab[1],10),parseInt(ab[2],10)]}}else{if(Y<10){Y++;setTimeout(arguments.callee,10);return}}X.removeChild(aa);Z=null;H()})()}else{H()}}function H(){var ag=o.length;if(ag>0){for(var af=0;af<ag;af++){var Y=o[af].id;var ab=o[af].callbackFn;var aa={success:false,id:Y};if(M.pv[0]>0){var ae=c(Y);if(ae){if(F(o[af].swfVersion)&&!(M.wk&&M.wk<312)){w(Y,true);if(ab){aa.success=true;aa.ref=z(Y);ab(aa)}}else{if(o[af].expressInstall&&A()){var ai={};ai.data=o[af].expressInstall;ai.width=ae.getAttribute("width")||"0";ai.height=ae.getAttribute("height")||"0";if(ae.getAttribute("class")){ai.styleclass=ae.getAttribute("class")}if(ae.getAttribute("align")){ai.align=ae.getAttribute("align")}var ah={};var X=ae.getElementsByTagName("param");var ac=X.length;for(var ad=0;ad<ac;ad++){if(X[ad].getAttribute("name").toLowerCase()!="movie"){ah[X[ad].getAttribute("name")]=X[ad].getAttribute("value")}}P(ai,ah,Y,ab)}else{p(ae);if(ab){ab(aa)}}}}}else{w(Y,true);if(ab){var Z=z(Y);if(Z&&typeof Z.SetVariable!=D){aa.success=true;aa.ref=Z}ab(aa)}}}}}function z(aa){var X=null;var Y=c(aa);if(Y&&Y.nodeName=="OBJECT"){if(typeof Y.SetVariable!=D){X=Y}else{var Z=Y.getElementsByTagName(r)[0];if(Z){X=Z}}}return X}function A(){return !a&&F("6.0.65")&&(M.win||M.mac)&&!(M.wk&&M.wk<312)}function P(aa,ab,X,Z){a=true;E=Z||null;B={success:false,id:X};var ae=c(X);if(ae){if(ae.nodeName=="OBJECT"){l=g(ae);Q=null}else{l=ae;Q=X}aa.id=R;if(typeof aa.width==D||(!/%$/.test(aa.width)&&parseInt(aa.width,10)<310)){aa.width="310"}if(typeof aa.height==D||(!/%$/.test(aa.height)&&parseInt(aa.height,10)<137)){aa.height="137"}j.title=j.title.slice(0,47)+" - Flash Player Installation";var ad=M.ie&&M.win?"ActiveX":"PlugIn",ac="MMredirectURL="+O.location.toString().replace(/&/g,"%26")+"&MMplayerType="+ad+"&MMdoctitle="+j.title;if(typeof ab.flashvars!=D){ab.flashvars+="&"+ac}else{ab.flashvars=ac}if(M.ie&&M.win&&ae.readyState!=4){var Y=C("div");X+="SWFObjectNew";Y.setAttribute("id",X);ae.parentNode.insertBefore(Y,ae);ae.style.display="none";(function(){if(ae.readyState==4){ae.parentNode.removeChild(ae)}else{setTimeout(arguments.callee,10)}})()}u(aa,ab,X)}}function p(Y){if(M.ie&&M.win&&Y.readyState!=4){var X=C("div");Y.parentNode.insertBefore(X,Y);X.parentNode.replaceChild(g(Y),X);Y.style.display="none";(function(){if(Y.readyState==4){Y.parentNode.removeChild(Y)}else{setTimeout(arguments.callee,10)}})()}else{Y.parentNode.replaceChild(g(Y),Y)}}function g(ab){var aa=C("div");if(M.win&&M.ie){aa.innerHTML=ab.innerHTML}else{var Y=ab.getElementsByTagName(r)[0];if(Y){var ad=Y.childNodes;if(ad){var X=ad.length;for(var Z=0;Z<X;Z++){if(!(ad[Z].nodeType==1&&ad[Z].nodeName=="PARAM")&&!(ad[Z].nodeType==8)){aa.appendChild(ad[Z].cloneNode(true))}}}}}return aa}function u(ai,ag,Y){var X,aa=c(Y);if(M.wk&&M.wk<312){return X}if(aa){if(typeof ai.id==D){ai.id=Y}if(M.ie&&M.win){var ah="";for(var ae in ai){if(ai[ae]!=Object.prototype[ae]){if(ae.toLowerCase()=="data"){ag.movie=ai[ae]}else{if(ae.toLowerCase()=="styleclass"){ah+=' class="'+ai[ae]+'"'}else{if(ae.toLowerCase()!="classid"){ah+=" "+ae+'="'+ai[ae]+'"'}}}}}var af="";for(var ad in ag){if(ag[ad]!=Object.prototype[ad]){af+='<param name="'+ad+'" value="'+ag[ad]+'" />'}}aa.outerHTML='<object classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000"'+ah+">"+af+"</object>";N[N.length]=ai.id;X=c(ai.id)}else{var Z=C(r);Z.setAttribute("type",q);for(var ac in ai){if(ai[ac]!=Object.prototype[ac]){if(ac.toLowerCase()=="styleclass"){Z.setAttribute("class",ai[ac])}else{if(ac.toLowerCase()!="classid"){Z.setAttribute(ac,ai[ac])}}}}for(var ab in ag){if(ag[ab]!=Object.prototype[ab]&&ab.toLowerCase()!="movie"){e(Z,ab,ag[ab])}}aa.parentNode.replaceChild(Z,aa);X=Z}}return X}function e(Z,X,Y){var aa=C("param");aa.setAttribute("name",X);aa.setAttribute("value",Y);Z.appendChild(aa)}function y(Y){var X=c(Y);if(X&&X.nodeName=="OBJECT"){if(M.ie&&M.win){X.style.display="none";(function(){if(X.readyState==4){b(Y)}else{setTimeout(arguments.callee,10)}})()}else{X.parentNode.removeChild(X)}}}function b(Z){var Y=c(Z);if(Y){for(var X in Y){if(typeof Y[X]=="function"){Y[X]=null}}Y.parentNode.removeChild(Y)}}function c(Z){var X=null;try{X=j.getElementById(Z)}catch(Y){}return X}function C(X){return j.createElement(X)}function i(Z,X,Y){Z.attachEvent(X,Y);I[I.length]=[Z,X,Y]}function F(Z){var Y=M.pv,X=Z.split(".");X[0]=parseInt(X[0],10);X[1]=parseInt(X[1],10)||0;X[2]=parseInt(X[2],10)||0;return(Y[0]>X[0]||(Y[0]==X[0]&&Y[1]>X[1])||(Y[0]==X[0]&&Y[1]==X[1]&&Y[2]>=X[2]))?true:false}function v(ac,Y,ad,ab){if(M.ie&&M.mac){return}var aa=j.getElementsByTagName("head")[0];if(!aa){return}var X=(ad&&typeof ad=="string")?ad:"screen";if(ab){n=null;G=null}if(!n||G!=X){var Z=C("style");Z.setAttribute("type","text/css");Z.setAttribute("media",X);n=aa.appendChild(Z);if(M.ie&&M.win&&typeof j.styleSheets!=D&&j.styleSheets.length>0){n=j.styleSheets[j.styleSheets.length-1]}G=X}if(M.ie&&M.win){if(n&&typeof n.addRule==r){n.addRule(ac,Y)}}else{if(n&&typeof j.createTextNode!=D){n.appendChild(j.createTextNode(ac+" {"+Y+"}"))}}}function w(Z,X){if(!m){return}var Y=X?"visible":"hidden";if(J&&c(Z)){c(Z).style.visibility=Y}else{v("#"+Z,"visibility:"+Y)}}function L(Y){var Z=/[\\\"<>\.;]/;var X=Z.exec(Y)!=null;return X&&typeof encodeURIComponent!=D?encodeURIComponent(Y):Y}var d=function(){if(M.ie&&M.win){window.attachEvent("onunload",function(){var ac=I.length;for(var ab=0;ab<ac;ab++){I[ab][0].detachEvent(I[ab][1],I[ab][2])}var Z=N.length;for(var aa=0;aa<Z;aa++){y(N[aa])}for(var Y in M){M[Y]=null}M=null;for(var X in swfobject){swfobject[X]=null}swfobject=null})}}();return{registerObject:function(ab,X,aa,Z){if(M.w3&&ab&&X){var Y={};Y.id=ab;Y.swfVersion=X;Y.expressInstall=aa;Y.callbackFn=Z;o[o.length]=Y;w(ab,false)}else{if(Z){Z({success:false,id:ab})}}},getObjectById:function(X){if(M.w3){return z(X)}},embedSWF:function(ab,ah,ae,ag,Y,aa,Z,ad,af,ac){var X={success:false,id:ah};if(M.w3&&!(M.wk&&M.wk<312)&&ab&&ah&&ae&&ag&&Y){w(ah,false);K(function(){ae+="";ag+="";var aj={};if(af&&typeof af===r){for(var al in af){aj[al]=af[al]}}aj.data=ab;aj.width=ae;aj.height=ag;var am={};if(ad&&typeof ad===r){for(var ak in ad){am[ak]=ad[ak]}}if(Z&&typeof Z===r){for(var ai in Z){if(typeof am.flashvars!=D){am.flashvars+="&"+ai+"="+Z[ai]}else{am.flashvars=ai+"="+Z[ai]}}}if(F(Y)){var an=u(aj,am,ah);if(aj.id==ah){w(ah,true)}X.success=true;X.ref=an}else{if(aa&&A()){aj.data=aa;P(aj,am,ah,ac);return}else{w(ah,true)}}if(ac){ac(X)}})}else{if(ac){ac(X)}}},switchOffAutoHideShow:function(){m=false},ua:M,getFlashPlayerVersion:function(){return{major:M.pv[0],minor:M.pv[1],release:M.pv[2]}},hasFlashPlayerVersion:F,createSWF:function(Z,Y,X){if(M.w3){return u(Z,Y,X)}else{return undefined}},showExpressInstall:function(Z,aa,X,Y){if(M.w3&&A()){P(Z,aa,X,Y)}},removeSWF:function(X){if(M.w3){y(X)}},createCSS:function(aa,Z,Y,X){if(M.w3){v(aa,Z,Y,X)}},addDomLoadEvent:K,addLoadEvent:s,getQueryParamValue:function(aa){var Z=j.location.search||j.location.hash;if(Z){if(/\?/.test(Z)){Z=Z.split("?")[1]}if(aa==null){return L(Z)}var Y=Z.split("&");for(var X=0;X<Y.length;X++){if(Y[X].substring(0,Y[X].indexOf("="))==aa){return L(Y[X].substring((Y[X].indexOf("=")+1)))}}}return""},expressInstallCallback:function(){if(a){var X=c(R);if(X&&l){X.parentNode.replaceChild(l,X);if(Q){w(Q,true);if(M.ie&&M.win){l.style.display="block"}}if(E){E(B)}}a=false}}}}();
	return true;
}

//初始化flash
function initFlash() {
	initParams();

flashUploadDialog = XN.DO.confirm({
title:'上传照片',
message:
['<div id="flashUploadMainContent" class="content" style="">' ,
	'<div id="uploadHead" class="upload-head clearfix" style="display:none;">' ,
		'<span id="newOrOld" class="txt-block">新建相册：</span>' ,
		'<div id="albumNameBox" class="album-name-box">' ,
			'<input id="albumTitle" maxlength="30" type="text" class="text-input" />' ,
			'<dl id="limits" class="tovisit">' ,
				'<dt>' ,
					'<span id="cur" class="arrow-down">所有人可见</span>' ,
					'<input id="inputPW" maxlength="13" class="password-txt" style="display:none;" type="password">' ,
				'</dt>' ,
				'<dd id="evo" style="display:none;">所有人可见</dd>' ,
				'<dd id="frd" style="display:;">仅好友可见</dd>' ,
				'<dd id="pw" style="display:;">用密码访问</dd>' ,
				'<dd id="me" style="display:;">只自己可见</dd>' ,
			'</dl>' ,
			'<div id="albumNameTips" style="display:none;">相册名字不能为空</div>' ,
			'<div class="password-tips" style="display:none;">请设置1-13位密码</div>' ,
		'</div>' ,
		'<div id="albumList" class="album-name-box appoint" style="display:none;">' ,
			'<div id="appointAlbum" class="appoint-album">' ,
				'<div id="selectAlbum" class="select-album"><a href="javascript:void(0);" class="arrow-down"></a><span class="album-name"  style="height:20px; display:block; overflow:hidden; float:left; max-width:216px;">读取相册信息失败</span><span class="photo-num-flashUploader">(0)</span></div>' ,
				'<div class="sublist">' ,
					'<dl id="albumNameList" class="album-name-list">' ,
					'</dl>' ,
					'<div class="search-album">' ,
						'<input id="searchTxt" type="text" class="search-txt" />' ,
						'<span class="all-album"></span>' ,
					'</div>	' ,
				'</div>' ,
			'</div>' ,
		'</div>' ,
		'<span class="or">或</span><a class="toggleAlbum txt-block" id="oldAlbum" href="javascript:void(0);">上传到已有相册</a>' ,
	'</div>' ,
	'<div class="activity-tip-flashUploader" id="activityTipFlashUploader" style="display:none;">' ,
	'&nbsp;</div>',
	'<div id="uploadContent" class="upload-content-pre" style="position:relative; overflow-y:auto;width:420px; height:180px;">' ,
		'<div class="pop-upload-tip" id="popUploadTip" style="display:none;">' ,
			'<div class="top-arrow"></div>' ,
			'<p>在选择照片时，你可以框选、也可以按住ctrl点选多张</p>' ,
		'</div>' ,
		'<span id="slogan" style="display:none;">每次最多可以上传100张照片</span>' ,
		'<span id="flashUploadBtn" style="display:inline-block; position:absolute; *zoom:1; margin:30px 0 0 20px; width:204px; height:44px;">' ,
			'<div id="flashDiv">' ,
			'</div>' ,
		'</span>' ,
		'<ul id="picUl" class="upload-list-pic" style="display:none;">' ,
		'</ul>' ,
		'<div id="flashUploadPreContent" class="clearfix" style="width:410px; margin-top:-3px;">' ,
			'<div class="upload-png-box" style="width:117px; height:117px; padding:10px 20px; background-color:#F8F8F8; float:right;">',
				'<img width="117" height="70" src="http://a.xnimg.cn/n/apps/photo/res/upload-example.png" />',
				'<p class="png-tips" style="color:#888!important; margin-top:8px;">可以选择多张照片，<br />最多支持100张</p>',
			'</div>',
			'<div class="upload-btn-box" style="float:left; width:204px; padding:20px; margin-top:37px; *margin-top:30px; height:70px; background:url(http://a.xnimg.cn/imgpro/indicator/blue_large.gif) top no-repeat; *position:relative; *zoom:1; *z-index:-1">',
				'<p class="btn-tips" style="color:#888!important; text-align:center; margin-top:60px; *margin-top:80px;">还可以使用<span id="isIE"><a id="IEUser" href="'+ _CUR_DOMAIN_UPLOAD + '/addphotox.do">极速上传</a>或</span><a href="' + _CUR_DOMAIN_UPLOAD + '/addphotoPlain.do">其他上传</a></p>',
			'</div>',
		'</div>' ,
	'</div>' ,
	'<div id="uploadFoot" class="upload-foot clearfix" style="display:none;">' ,
		'<input id="uploadFinish" type="submit" class="upload-done-btn gray-btn-flashUploader" value="完成上传" />' ,
		'<div class="progress clearfix">' ,
			'<span id="nowLoadingNum" class="progress-tip">正在上传0张照片</span>' ,
			'<div class="progress-bar-box">' ,
				'<span class="progress-bar"><em id="progressBar" class="bg" style="width:0%;"></em></span>' ,
				'<span id="precent" class="gray">0/0</span>' ,
			'</div>' ,
		'</div>' ,
	'</div>' ,
'</div>',

'<form id="flashUploadAlbumData" action=' + postUrl + ' method="post">' ,
'</form>'].join(''),
width:450,
showCloseButton:true
});

flashUploadDialog.reLocate = reLocate;


flashUploadDialog.footer.hide();
XN.flashUpload.flashUploadDialog = flashUploadDialog;
flashUploadDialog.body.style.height = "133px";
flashUploadDialog.body.style.overflow = "hidden";
flashUploadDialog.container.id = "flashUploadDialog";
//把常用的节点存下来
flashUploadDialogDiv = $('flashUploadDialog');
progressBar = $('progressBar');
precent = $('precent');
nowLoadingNum = $('nowLoadingNum');
dlEl = $('limits');
albumNameBox = $('albumNameBox');
selectAlbum = $('selectAlbum');
appointAlbum = $('appointAlbum');
albumNameList = $('albumNameList');
searchTxt = $('searchTxt');
inputTips = $('inputTips');
curAlbumName = $(Sizzle('span', selectAlbum)[0]);
curAlbumPhotoCount = $(Sizzle('span', selectAlbum)[1]);
//检测是否IE，是否能用急速上传
detectIEUserAndActiveX();
//给选择相册权限的下拉表加事件
addEvent2AlbumControl();
//给相册名字列表加上事件代理
addEvent2HoverAlbumName();
//给关闭按钮加事件
addEvent2CloseBtn();
//关闭窗口的事件onbeforeunload
addEvent2WindowUnload();
//加载flash
swfobject.embedSWF(FLASH_UPLOADER_URL,"flashDiv", "202", "42", "9.0.0","",flashvars,param);
return true;
}


//事件函数
function popup(e) {
	isInit = true;
	var e = e || window.event,
		el = XN.event.element(e),
		elHref,
		albumId;
	if (!el) {
		return false;
	}

	if (XN.element.hasClassName(el, "flashUploader")) {
		
		e.preventDefault();
		//如果是IE用户，而且装了控件和相册，则正常流程，flash上传对它透明
		if (XN.browser.IE && isInstalledActiveXObject() && window.location.pathname != '/addphotox.do') {
			window.location = _CUR_DOMAIN_UPLOAD + '/addphotox.do';
			return true;
		}
		
		//不是IE，或者是IE没装控件，则进入flash上传流程
		albumId = 0;
		fromExistAlbum = 0;
		
		//如果有fromAlbum类名，则是从已有相册上传，需要读取已有相册的ID
		if (XN.element.hasClassName(el, "fromAlbum")) {
			//如果没有href
			try {
				elHref = el.href;
				//如果href里面是带有id参数的，其实就是相册ID
				if (elHref.indexOf("id=") >= 0) {
					elHref = elHref.substring(elHref.indexOf("id=") + 3);
					elHref = elHref.substring(0, elHref.indexOf("&"));
					albumId = parseInt(elHref);
					//如果albumId不是0，空字符，NaN
					if ( albumId ) {
						fromExistAlbum = albumId;
					}
				}
			} catch(e) {
			}
		}
		
		XN.loadFile(
			"http://s.xnimg.cn/n/core/modules/flashUploader/upload-pop-all-min.css", function() {
			initFlash();
		});
	}
}


//总的打开上传弹层的函数，这个是外部的唯一入口
//el为点击上传的元素	
function flashUploadPopup() {
if (isInit) {
	return false;
}
XN.event.addEvent(document, 'click', popup);
}


//给外部使用的方法
XN.flashUpload.flashUploadPopup = flashUploadPopup;
XN.flashUpload.startUpload = startUpload;
XN.flashUpload.changeStyle2pros = changeStyle2pros;
//XN.flashUpload.changeStyle2ing = changeStyle2ing;
XN.flashUpload.changeStyle2ed = changeStyle2ed;
XN.flashUpload.delPhotoData = delPhotoData;
XN.flashUpload.changeStyle2netErr = changeStyle2netErr;
XN.flashUpload.uploadError = uploadError;
XN.flashUpload.initFlash = initFlash;
XN.flashUpload.queuedError = queuedError;
XN.flashUpload.notLogin = notLogin;
XN.flashUpload.queueLimitExceeded = queueLimitExceeded;
XN.flashUpload.invalidImgFile = invalidImgFile;
XN.flashUpload.popup = popup;

function flashReady() {
	flashDiv = $('flashDiv');
	getToken();
	//切换上传的相册事件响应
	XNEV.addEvent($(Sizzle('a.toggleAlbum')[0]), 'click', function(e) {
		var e = e || window.event;
			el = XNEV.element(e);
		e.preventDefault();
		toggleAlbum(el);
	});
	
	//完成上传的事件响应
	XNEV.addEvent('uploadFinish', 'click', function(e) {
		var e = e || window.event;
		e.preventDefault();
		endUpload();
	});
	
	//删除照片的事件响应
	XNEV.addEvent('picUl', 'click', function(e) {
		var e = e || window.event;
			el = XNEV.element(e);
		if (el.className == "photo-del") {
			var picLi = el.parentNode.parentNode;
			// if (picLi.getAttribute('status') == 'ing') {
				// return false;
			// }
			delPhoto(el);
		}
	});
	
	XN.flashUpload.flashDiv = flashDiv;
	
	album.name = defaultAlbumGen();
	albumListGen(curUserId);

	flashDiv.setUploadUrl(_CUR_DOMAIN_UPLOAD + '/upload.fcgi?pagetype=addphotoflash&hostid=' + curUserId + '&tick=' + tToken);
	flashDiv.addEventListener('fileQueued', 'XN.flashUpload.startUpload');
	flashDiv.addEventListener('fileProcessStart', 'XN.flashUpload.changeStyle2pros');
	//flashDiv.addEventListener('fileUploadProgress', 'XN.flashUpload.changeStyle2ing');
	flashDiv.addEventListener('fileUploadSuccess', 'XN.flashUpload.changeStyle2ed');
	flashDiv.addEventListener('fileUploadCanceled', 'XN.flashUpload.delPhotoData');
	flashDiv.addEventListener('networkError', 'XN.flashUpload.changeStyle2netErr');
	flashDiv.addEventListener('uploadError', 'XN.flashUpload.uploadError');
	flashDiv.addEventListener('queuedError', 'XN.flashUpload.queuedError');
	flashDiv.addEventListener('notLogin', 'XN.flashUpload.notLogin');
	flashDiv.addEventListener('queueLimitExceeded', 'XN.flashUpload.queueLimitExceeded');
	flashDiv.addEventListener('invalidImgFile', 'XN.flashUpload.invalidImgFile');
}

XN.flashUpload.flashReady = flashReady;

})();


XN.dom.ready(function() {
	XN.flashUpload.flashUploadPopup();
});object.add('xn.net', 'sys, net', function(exports, sys, net) {

/*
 * 保证ajax发送时带有token
 * 通过mixin替换net module的send方法，在send之前解析发送的数据，加入requestToken项。
 * 这样就需要每个引入了net module的module注意同时引入xn.net，或者直接使用 xn.net.Request 进行数据发送
 */

var oldSend = net.Request.prototype.send;
net.Request.set('send', function(self, data) {
	data = data || self.data;
	if (self.method == 'post' && XN.get_check && !/[\?|\&]requestToken=/.test(data)) {
		data += (data ? '&' : '') + 'requestToken=' + XN.get_check;
	}
	if (self.method == 'post' && XN.get_check_x && !/[\?|\&]_rtk=/.test(data)) {
		data += (data ? '&' : '') + '_rtk=' + XN.get_check_x;
	}
	oldSend.call(self, data);
});

this.Request = net.Request;

});
object.add('xn.ui', 'sys', function(exports, sys) {

var ui = sys.modules['ui'];

if (ui) {

	ui.Component.__mixin__({
		error: function(self, msg) {
			XN.DO.showError(msg);
		},
		invalid: function(self, msg) {
			XN.DO.showError(msg);
		}
	});

}

});
object.add('xn.mention', function(exports) {

/**
 * @description : “@”功能，提到某人，将来可能提到某篇日志等UGC内容
 * @author : 王传业（chuanye.wang@foxmail.com）
 * @date : 2011.03.09
 * @wiki : http://doc.d.xiaonei.com/index.php?title=@
 */

var Mention = this.Mention = function() {
	this.author = 'chuanye.wang@foxmail.com';
	this.reg = /@[^@\s\)]{0,20}$/;
	this.input = null;
	this.ugcId = '';
	this.ugcType = '';
	this.ownerId = '';
	this.popTop = false;
	this.scrollable = false;
	this.titles = {
		0: '想用@提到谁？(最多10次)',
		1: '由于隐私这里只能@共同好友(最多10次)',
		2: '由于隐私这里不能使用@',
		3: '杯具了，网络错误暂时不能@了:(',
		4: '选择最近@过的朋友，或继续输入姓名(最多10次)'
	};
	this.disabled = false;
	extendObject(this, arguments[0]);
	XN.event.enableCustomEvent(this);
};

/**
 * 初始化方法
 * @param {Array} list
 */
Mention.init = function(list){
	for(var i=0;i<list.length;i++){
		(function(){
			var obj = list[i].obj,
				ugcId = list[i].ugcId||'',
				ugcType = list[i].ugcType||'',
				ownerId = list[i].ownerId||'',
				scrollable = list[i].scrollable||false,
				popTop = list[i].popTop||false,
				whisper = list[i].whisper||true,
				button = list[i].button||null;
			if( obj.mention || (obj.tagName.toLowerCase()!='input' && obj.tagName.toLowerCase()!='textarea') ) return;
			if(XN.browser.IE){
				obj.style.fontFamily = document.body.currentStyle.fontFamily;
				obj.style.fontSize = document.body.currentStyle.fontSize;
			}
			obj = $(obj);
			if(!obj.mention) {
				obj.mention = new Mention({
					input: obj,
					ugcId: ugcId,
					ugcType: ugcType,
					ownerId: ownerId,
					scrollable: scrollable,
					popTop: popTop,
					whisper: whisper,
					button: button
				});
			}
			obj.addEvent('keyup',function(event){
				obj.mention.check();
				obj.mention.doNotCheck = false;
			});
			obj.addEvent('mouseup',function(event){
				obj.mention.check();
			});
			obj.addEvent('focus',function(){
				obj.mention.check();
			});
			obj.addEvent('keydown',function(event){
				if(event.keyCode==13 && obj.mention.noMatch){
					obj.mention.selector.menu.hide();
				}
				if((event.keyCode==13||event.keyCode==38||event.keyCode==40) && obj.mention.selectorShow && !obj.mention.noMatch){
					obj.mention.doNotCheck = true;
					XN.event.stop(event);
					obj.mention.selector._inputOnkeydown(event);
				}
			});
			if( obj.mention.button ){
				XN.event.addEvent(obj.mention.button, 'click', function(){
					obj.focus();
					setTimeout(function(){
						var v = obj.value,
							nv = v + '@';
						obj.value = nv;
						obj.focus();
						obj.mention.check();
					},100);
				});
			}
		})();
	}
};

Mention.prototype = {

	key: '', // @后面输入的关键字，用来检索好友
	keyIndex: '', // @的索引值
	front: '', // @前面的内容
	last: '', // 后面的内容
	flag: null, // 用来定位@的元素
	atPos: {}, // @的像素位置
	curPos: null, // 光标位置在输入框中的索引
	masker: null, // 一个跟输入框一样大小一样位置的div
	selector: null, // 好友选择器
	selectorShow: false, // 好友选择器是否正在被展现
	doNotCheck: false, // 是否不执行@检测
	noMatch: false, // 好友选择器是否没有匹配的结果
	fsInput: null, // 好友选择器的输入框
	privacy: 'haveNotCheck', // 隐私级别 0为所有好友可以@ 1为共同好友可以@ 其他为不可以@
	tip: null,
	log: function(lg){
		if( console&&console.log ) console.log(lg);
	},

	/**
	 * 检测形如“@王传业”的输入，并做相应处理（只检测当前光标到文本开头这部分）
	 * 发布两个事件 'atInputed'(检测到输入了@和一个非空白字符时) 和 'noAtNow'(跟atInputed相反)
	 * 可以这样监听（假设一个textarea的id为'myId'）：
	 * $('myId').mention.addEvent('atInputed', function(r){ console.log(r) });
	 * 其中r是一个对象，有两个属性：r.key为@后输入的字，r.pos为@的像素坐标{X:1, Y:2}
	 * @method check
	 */
	check: function(){
		
		if(this.disabled) return;
	
		if(this.doNotCheck) return;
		this.initSelector();
		if(!this.selector) return;
		if( this.isChecking ) return;
		this.isChecking = true;
		
		//如果有悄悄话选项。。。
		var whisper = $('whisper');
		if(whisper && this.whisper ){
			if(whisper.checked){
				this.privacy = 2;
			}else{
				this.privacy = this.oldPrivacy;
			}
			this.renewTip();
			if( !/@.+\(\d+\)\s/.test(this.input.value) ){
				$(whisper).disabled = false;
				$(whisper.parentNode).title = '';
			}else{
				if(!whisper.checked){
					$(whisper).disabled = true;
					$(whisper.parentNode).title = '亲！！！你用@了！！！有木有！！！@别人就不能用悄悄话了啊亲！！！';
				}
			}
		}
		
		this.curPos = this.getCurPos();
		var key = this.input.value.substring(0,this.curPos).match(this.reg);
		if( key ) {
			this.key = key[0].slice(1);
			this.keyIndex = key.index;
			this.front = this.input.value.substring(0,this.keyIndex);
			this.setContent();
			this.atPos = {
				X: this.flag.realLeft()-this.masker.scrollLeft+2,
				Y: this.flag.realTop()-this.masker.scrollTop+this.flag.offsetHeight+4
			};
			var fire = {
				key: this.key,
				pos: this.atPos
			};
			if( this.privacy!=0 && this.privacy!=1 ){
				this.selector.menu.show();
			} else {
				this.fsInput.value = this.key;
				this.selector._startCheck();
				this.selector.menu.show();
			}
			this.renewTip();
			if(key[0]=='@'){
				if( XN.user.recentAt && this.privacy==0 ){ //仅当能@所有好友时才出现
					//this.log(XN.user.recentAt);
					this.selector._buildMenu( XN.user.recentAt );
					XN.element.delClass( this.selector._currentLi , this.selector.getConfig( 'liHoverClass' ) );
					this.selector._currentLi = null;
					this.renewTip(4);
				}
			}
			this.locateMenu();
			this.selectorShow = true;
			this.fireEvent('atInputed',fire);
		} else {
			this.fsInput.value = '';
			this.selector.menu.hide();
			this.selectorShow = false;
			this.fireEvent('noAtNow');
		}
		this.isChecking = false;
	},
	
	/**
	 * 获取输入框的样式
	 * @method getCss
	 * @return {Object}
	 */
	getCss: function(){
		var el = this.input;
		if(window.getComputedStyle){
			var styles = window.getComputedStyle(el,null);
		} else {
			var styles = el.currentStyle;
		}
		return styles;
	},
	
	/**
	 * 获取当前光标位置（索引值）
	 * @method getCurPos
	 * @return {Number}
	 */
	getCurPos: function(){
		var ele = this.input;
		var cPos = 0;
		if(XN.browser.IE && ele.tagName.toLowerCase()=='input'){
			var cuRange = document.selection.createRange();
			var tbRange = ele.createTextRange();
			tbRange.collapse(true);
			tbRange.select();
			var headRange = document.selection.createRange();
			headRange.setEndPoint("EndToEnd",cuRange);
			cPos = headRange.text.length;
			cuRange.select();
		} else {
			try{ // 如果ele此时被隐藏了起来，XN.form.help(ele).cursorPosition()会出错
				cPos = XN.form.help(ele).cursorPosition().start;
			}catch(e){
				cPos = 0;
			}
		}
		return cPos;
	},
	
	/**
	 * 创建masker，一个跟输入框一样大小一样位置的div
	 * @method mask
	 */
	mask: function(){
		if(this.masker) {
			this.locateMasker();
			return;
		}
		this.appendMasker();
		this.locateMasker();
	},
	
	/**
	 * 设置masker的样式，并填到body中
	 * @method appendMasker
	 */
	appendMasker: function(){
		this.masker = $element('div');
		var s = this.getCss();
		var isInput = this.input.tagName.toLowerCase()=='input';
		var fix;
		if(XN.browser.IE) {
			fix = 4;
		} else { 
			fix = 2;
		} 
		if( this.scrollable ){
			this.masker.style.cssText = 
				'width:'+s.width+';'
				+ 'box-sizing:'+s.boxSizing+';'
				+ 'padding-left:'+s.paddingLeft+';'
				+ 'padding-right:'+s.paddingRight+';'
				+ 'height:'+this.input.clientHeight+'px;'
				+ 'line-height:'+s.lineHeight+';'
				+ 'border-left-style:'+s.borderLeftStyle+';'
				+ 'border-right-style:'+s.borderRightStyle+';'
				+ 'border-top-style:'+s.borderTopStyle+';'
				+ 'border-bottom-style:'+s.borderBottomStyle+';'
				+ 'border-left-width:'+s.borderLeftWidth+';'
				+ 'border-right-width:'+s.borderRightWidth+';'
				+ 'border-top-width:'+s.borderTopWidth+';'
				+ 'border-bottom-width:'+s.borderBottomWidth+';'
				+ 'border-left-color:'+s.borderLeftColor+';'
				+ 'border-right-color:'+s.borderRightColor+';'
				+ 'border-top-color:'+s.borderTopColor+';'
				+ 'border-bottom-color:'+s.borderBottomColor+';'
				+ 'overflow-y:hidden;'
				+ 'overflow-x:hidden;'
				+ 'font-size:'+s.fontSize+';'
				+ 'font-weight:'+s.fontWeight+';'
				+ 'font-family:'+s.fontFamily+';'
				+ 'font-style:'+s.fontStyle+';'
				+ 'word-wrap:'+(isInput?'normal':'break-word')+';'
				+ 'z-index:-1000;position:absolute;visibility:hidden';
		}else{
			this.masker.style.cssText = 
				'width:'+(this.input.clientWidth-fix)+'px;'
				+ 'padding-left:'+s.paddingLeft+';'
				+ 'padding-right:'+(XN.browser.IE?'0px':s.paddingRight)+';'
				+ 'height:'+this.input.clientHeight+'px;'
				+ 'line-height:'+s.lineHeight+';'
				+ 'border-left-style:'+s.borderLeftStyle+';'
				+ 'border-right-style:'+s.borderRightStyle+';'
				+ 'border-top-style:'+s.borderTopStyle+';'
				+ 'border-bottom-style:'+s.borderBottomStyle+';'
				+ 'border-left-width:'+s.borderLeftWidth+';'
				+ 'border-right-width:'+s.borderRightWidth+';'
				+ 'border-top-width:'+s.borderTopWidth+';'
				+ 'border-bottom-width:'+s.borderBottomWidth+';'
				+ 'border-left-color:'+s.borderLeftColor+';'
				+ 'border-right-color:'+s.borderRightColor+';'
				+ 'border-top-color:'+s.borderTopColor+';'
				+ 'border-bottom-color:'+s.borderBottomColor+';'
				+ 'overflow-y:hidden;'
				+ 'overflow-x:hidden;'
				+ 'font-size:'+s.fontSize+';'
				+ 'font-weight:'+s.fontWeight+';'
				+ 'font-family:'+s.fontFamily+';'
				+ 'font-style:'+s.fontStyle+';'
				+ 'word-wrap:'+(isInput?'normal':'break-word')+';'
				+ 'z-index:-1000;position:absolute;visibility:hidden';
		}
		if(isInput)	this.masker.style.whiteSpace = 'nowrap';
		document.body.appendChild(this.masker);
	},
	
	/**
	 * 定位masker
	 * @method locateMasker
	 */
	locateMasker: function(){
		this.masker.style.left = $(this.input).realLeft()+'px';
		this.masker.style.top = $(this.input).realTop()+4+'px';
	},
	
	/**
	 * 当输入@加任意非空白字符时，把输入的文本格式化一下，分成三个span（<span>asdfasdfas</span><span>@</span>asd<span>）填到masker里
	 * @method setContent
	 */
	setContent: function(){
		this.mask();
		var span1 = $element('span'),
			span2 = $element('span'),
			span3 = $element('span');
		this.flag = span2;
		span1.innerHTML = this.parse(this.front);
		span2.innerHTML = '@';
		span3.innerHTML = this.key;
		this.masker.innerHTML = '';
		if(this.input.tagName.toLowerCase()=='input'){
			span1.style.cssText = 'white-space:nowrap;';
			span2.style.cssText = 'white-space:nowrap;';
			span3.style.cssText = 'white-space:nowrap;';
		}
		this.masker.appendChild(span1);
		this.masker.appendChild(span2);
		this.masker.appendChild(span3);
		if(this.input.scrollHeight>this.input.clientHeight){
			this.masker.style.overflowY = 'scroll';
		}
		if(this.input.scrollHeight<=this.input.clientHeight){
			this.masker.style.overflowY = 'hidden';
		}
		this.masker.scrollLeft = this.masker.scrollWidth;
		this.masker.scrollTop = this.masker.scrollHeight;
	},
	
	/** 
	 * 处理输入内容，替换空格和换行
	 * @method parse
	 * @param {String} v
	 * @return {String}
	 */
	parse: function(v){
		var sp = XN.browser.IE?('<pre style="font-family:'+this.getCss().fontFamily+';font-size:'+this.getCss().fontSize+';display: inline; word-wrap: break-word; overflow: hidden"> </pre>'):('<span style="white-space: pre-wrap;font-family:'+this.getCss().fontFamily+';font-size:'+this.getCss().fontSize+';"> </span>');
		var h = {
			' ': ((this.input.tagName.toLowerCase()=='input')?'&nbsp;':sp),
			'\r': '',
			'\n': '<br />'
		};
		var reg = /\r|\n| /gi;
		return v.replace(reg, function(k){
			return h[k];
		});
	},
	
	/**
	 * 获取最近@过的人
	 */
	getRecent: function(){
		if( XN.user.recentAt ) return;
		var that = this;
		new XN.net.xmlhttp({
			url: 'http://status.renren.com/GetMetion.do?userId=' + XN.user.id + '&limit=6&flag=1&offset=0',
			method: 'get',
			onSuccess: function(r){
				if( XN.user.recentAt ) return;
				if( r.responseText=='{}' ) return;
				var r = XN.json.parse(r.responseText);
				if( r.code!=0 || r.result.length<1 ) return;
				XN.user.recentAt = r.result;
				that.check();
			}
		});
	},
	
	/**
	 * 自定义好友选择器
	 * @method newSelector
	 * @param {Object} ps
	 */
	newSelector: function(ps){
		var that = this;
		var wrapper = ['<div class="mentionFrdList">',
                          '<div class="m-autosug-minwidth">',
                              '<div class="m-autosug-content">',
								  '<div class="mention-tip"><span>',that.titles[that.privacy],'</span></div>',
								  '<ul class="search-Result" style="overflow:hidden;"></ul>',
                              '</div>',
                          '</div>',
                      '</div>'].join('');
		this.selector = new XN.ui.friendSelector({
			url: ps.url,
			id: ps.id,
			autoSelectFirst: true,
			limit: ps.limit,
			param: ps.param,
			noResult: function(){
				that.noMatch = true;
				return '没有匹配结果';
			},
			noInput: null,
			wrapper: wrapper
		});
		
		var thisS = this.selector;
		
		if( this.popTop ){
			thisS.menu = new XN.ui.menu({
				button : that.selector.input,
				menu : that.selector._menuList,
				fireOn : 'manual',
				alignType: '1-4',
				offsetY: -17
			});
		}
		thisS.buildMenu = function( r ) {
			return '<img src="' + (r.head||r.headUrl)  + '" width="30" height="30" alt="'+ r.name  +'"/>' + '<strong style="white-space:nowrap">'+ r.name  +'</strong>';
        };
		thisS._buildMenu = function( result ){
			var This = thisS;
			This.result = result;
			if ( result.length > 0 ){
				This.fireEvent('hasResult');
			}
			if ( result.length == 0 ){
				This.fireEvent('noResult');
				var noResult = This.getConfig( 'noResult' );
				if ( isFunction( noResult ) ){
					noResult = noResult.call( This );
				}
				This._ul.innerHTML = '<li>' + noResult + '</li>';
				This.menu.show();
				This.fireEvent('menuBuilt');
				This._currentLi = null;
				return;
			}
			var lis = [];
			lis.push( This.firstMenuItem() );
			var len = result.length - 1;
			XN.array.each( result , function( i , v ){
				lis.push( '<li onmouseover="getCompleteMenu(' + This._MID + ')._highlightMenuItem(this);" aid="' + i + '">' + This.buildMenu( v ) + '</li>' );
			});
			lis.push( This.lastMenuItem() );
			This._ul.innerHTML = lis.join('');
			if( This.getConfig( 'autoSelectFirst' ) ) This._highlightMenuItem( This._ul.firstChild );
			This.menu.show();
			This.fireEvent('menuBuilt');
		};
		thisS._startCheck = function(){
			var This = thisS;
			if( This._userInput )
			{
				This._userInput = false;
				return;
			}
			This._checkInput();
		};
		thisS._endCheck = function(){
			thisS._lastInput = '';
			thisS._ul.innerHTML = '';
			return;
		};
		
		thisS.loadFriends = function( r ){
			if ( thisS.isLoading() ) return;
			thisS._isLoading = true;
			thisS._onload();
		};
		
		thisS._onload = function(){
			thisS.isLoading = false;
			thisS._ready = true;
			thisS.DS = new XN.util.DS_friends({
				url : thisS.getConfig( 'url' ),
				qkey : thisS.getConfig( 'qkey' ),
				limit : thisS.getConfig( 'limit' ),
				page : thisS.getConfig( 'page' ),
				param : thisS.getConfig( 'param' )
			});
			thisS.DS.query = function( v , callBack ){
				var This = this;
				try{
					this._request.abort();
				}catch(e){}
				function parseDS_JSON( r ){
					r = r.responseText;
					var pp;
					try{
						var rt = XN.JSON.parse( r );
						if ( This.rootKey && rt[ This.rootKey ] ){
							pp = rt[ This.rootKey ];
						}else{
							pp = rt;
						}
					}
					catch( e ){
						pp = [];
					}
					callBack( pp );
				}
				var paramJ = XN.json.parse(this.param);
				this._request = new XN.net.xmlhttp({
					url : this.url,
					data : 'q=' + encodeURIComponent( v ) + '&l=' + this.limit + ( !!paramJ.friendId?('&friend='+paramJ.friendId):'' ), 
					method : this.method,
					onSuccess : parseDS_JSON
				});
			};
		};
		
		this.bindEvent();
		this.getRecent();
	},
	
	/**
	 * 回填输入框的value
	 * @method buildValue
	 */
	buildValue: function(p){
		//var olast = this.input.value.substring(this.curPos),
		//	ind = olast.indexOf(')'),
		//	atIndex = olast.indexOf('@');
		//if(atIndex<ind && atIndex!=-1){
		//	this.last = olast;
		//}else{
		//	this.last = olast.substring(ind+1);
		//}
		//if( this.last.indexOf(' ')==0 ){
		//	this.last = this.last.substring(1);
		//}
		this.last = this.input.value.substring(this.curPos);
		this.input.value = this.front + '@' + p.name + '(' + (p.id||p.userId) + ')' + ' ' + this.last;
		this.refocus(p);
	},
	
	/**
	 * 重新定位光标
	 * @method refocus
	 */
	refocus: function(p){
		var that = this;
		var name = p.name,
			id = p.id||p.userId;
		var newCurPos = this.front.length+1+name.length+id.toString().length+3;
		var cst = this.input.scrollTop;
		this.fsInput.value = '';
		setTimeout(function(){
			XN.form.help(that.input).focus( newCurPos );
			that.input.scrollTop = cst;
			that.selector._endCheck();
			that.selector.menu.hide();
			that.selectorShow = false;
			that.fireEvent('refocus');
		},0);
	},
	
	/**
	 * 给好友选择器添加事件
	 * @method bindEvent
	 */
	bindEvent: function(){
		var that = this;
		this.selector.addEvent('select', function( p ){
			that.buildValue(p);
			that.doNotCheck = false;
		});
		this.selector.addEvent('hasResult',function(){
			that.noMatch = false;
		});
		this.selector.addEvent('noinput',function(){
			that.noMatch = true;
			that.selector._ul.innerHTML = '';
			that.selector.menu.show();
		});
		$(this.input).addEvent('blur', function(){
			if(that.selector){
				that.selector._endCheck();
				that.selector.menu.hide();
			}
		});
		if( this.popTop ){
			this.selector.addEvent('menuBuilt',function(){
				that.locateMenu();
			});
		}
		if($('whisper') && this.whisper){
			if(!this.oldPrivacy) this.oldPrivacy = this.privacy;
			$('whisper').addEvent('click',function(){
				if($('whisper').checked){
					that.privacy = 2;
				}else{
					that.privacy = that.oldPrivacy;
				}
				that.renewTip();
			});
		}
	},
	
	/**
	 * 更新好友选择器的tip
	 * @method renewTip
	 */
	renewTip: function(t){
		var tip = Sizzle('.mention-tip span',this.selector._ul.parentNode)[0];
		tip.innerHTML = this.titles[t] || this.titles[this.privacy];
	},
	
	/**
	 * 创建好友选择器需要的input
	 * @method crFsInput
	 */
	crFsInput: function(){
		if(!this.fsInput){
			this.fsInput = $element('input');
			this.fsInput.type = 'text';
			this.fsInput.style.cssText = 'position:' + ( (this.scrollable&&!XN.browser.IE6) ? 'fixed' : 'absolute' ) + ';z-index:-1000;border:0 none;padding:0;height:0;overflow:hidden;';
			document.body.appendChild(this.fsInput);
		}
	},
	
	/**
	 * 定位好友选择器
	 * @method locateMenu
	 */
	locateMenu: function(){
		this.fsInput.style.left = this.atPos.X + 'px';
		this.fsInput.style.top = this.atPos.Y + 'px';
		this.selector.menu.refresh();
		if( this.scrollable ){
			var el = this.selector._menuList;
			var fix = XN.browser.IE6?0:$('dropmenuHolder').realLeft();
			if( !XN.browser.IE6 ) el.style.position = 'fixed';
			el.style.left = parseInt(el.style.left) + fix + 'px';
			if( XN.browser.IE6 ){
				if(!el['scEvent4At']){
					var that = this;
					XN.event.addEvent(window,'scroll',function(){
						setTimeout(function(){
							that.check();
						},500);
					});
					el['scEvent4At'] = true;
				}
			}
		}
	},
	
	/**
	 * 初始化好友选择器
	 * @method initSelector
	 */
	initSelector: function(){
		this.crFsInput();
		if(this.selector) return;
		var that = this;
		var cb = function(){
			var fid = that.getFinalId(),
				surl = 'http://sg.renren.com/s/c', // 与某人的共同好友
				par = {'friendId':fid};
			if(fid==''){
				if(that.privacy==0 && XN.mentionGroup){ // 设置开关
					surl = 'http://sg.renren.com/s/gf'; // 包含用户加入的小群
				}else{
					surl = 'http://sg.renren.com/s/f'; // 全部好友
				}
				par = {};
			}
			that.newSelector({
				url: surl,
				id: that.fsInput,
				limit: 10,
				friendId: fid,
				param: par
			});
			that.selector.loadFriends();
		};
		this.getPrivacy(cb);
	},
	
	/**
	 * 获取该UGC拥有者的id
	 * @method getOwnerId
	 * @return {Number||String}
	 */
	getFinalId: function(){
		if( this.privacy==0 ) return '';
		if( this.privacy==1 ) return this.ownerId;
		if( this.privacy!=0 && this.privacy!=1 ) return -1;
	},
	
	/**
	 * 查询隐私状态
	 * @method getPrivacy
	 * @param {Function} cb
	 */
	getPrivacy: function(cb){
		if( this.privacy!='haveNotCheck' ) return;
		if( (this.ugcType=='blog'||this.ugcType=='photo'||this.ugcType=='album'||this.ugcType=='gossip') ) {
			this.doNotCheck = true;
			var that = this;
			var purls = {
				'blog': 'http://blog.renren.com/blog/' + this.ownerId + '/' + this.ugcId + '/privacy',
				'photo': 'http://photo.renren.com/photo/' + this.ownerId + '/photo-' + this.ugcId + '/privacy',
				'album': 'http://photo.renren.com/photo/' + this.ownerId + '/album-' + this.ugcId + '/privacy',
				'gossip': 'http://www.renren.com/getPrivacy/update?uid='+this.ownerId
			};
			if( this.ugcType=='gossip' ){
				new XN.net.xmlhttp({
					url: purls[this.ugcType],
					onSuccess: function(r){
						var j = r.responseText;
						if( j==0||j==3 ){
							that.privacy = 1;
						}else{
							if( j==-1 ){
								that.privacy = 2;
							}else{
								that.privacy = 0;
							}
						}
						if( that.privacy==1 && XN.user.id==that.ownerId ){
							that.privacy = 0;
						}
						cb();
						that.doNotCheck = false;
						that.check();
					},
					onError: function(){
						that.privacy = 3;
						cb();
						that.doNotCheck = false;
						that.check();
					}
				});
			}else{
				new XN.net.xmlhttp({
					url: purls[this.ugcType],
					method: 'get',
					onSuccess: function(r){
						var j = XN.json.parse(r.responseText);
						that.privacy = j.privacyLevel;
						if( that.privacy==1 && XN.user.id==that.ownerId ){
							that.privacy = 0;
						}
						cb();
						that.doNotCheck = false;
						that.check();
					},
					onError: function(){
						that.privacy = 3;
						cb();
						that.doNotCheck = false;
						that.check();
					}
				});
			}
		} else {
			if( this.ugcType=='unknown_privacy' ){
				this.privacy = 2;
				cb();
			}else{
				if(window.asyncHTMLManager&&window.asyncHTMLManager.location.href.indexOf('http://share.renren.com/share/collection')!=-1 && this.ugcType=='share'){ 
				//我的收藏页面不让@
					this.privacy = 2;
					cb();
				} else {
					this.privacy = 0;
					cb();
				}
			}
		}
	},
	
	/** 
	 * 展示提示 
	 */
	showTip: function(){
		return;
		if( XN.cookie.get('at') ) return;
		var d = $('mentionTip');
		var that = this;
		if( !d ){
			var d = $element('div');
			d.id = 'mentionTip';
			d.style.cssText = 'position:absolute;top:-9999px;left:-9999px;width:300px;height:33px;';
			document.body.appendChild(d);
			d.innerHTML = '<div class="mention-guide-tip">'
						+'<div class="tip-content">'
							+'这里可以输入<span style="font-weight:bold">“@姓名”</span>来向好友点名啦！'
							+'<a href="#nogo" onclick="return false;" class="x-to-hide" id="mentionHideTip"></a>'
						+'</div>'
						+'<div class="tip-arrow"></div>'
					+'</div>';
			$( Sizzle('#mentionTip .x-to-hide')[0] ).addEvent('click',function(e){
				XN.event.stop(e);
				that.hideTip();
			});
		}
		setTimeout(function(){
			if(Mention.mentionTipTimer) clearInterval(Mention.mentionTipTimer);
			Mention.tip = that.tip = new XN.UI.fixPositionElement({
				id: d,
				alignType: '1-4',
				alignWith: that.input,
				useIframeInIE6: false
			});
			Mention.mentionTipTimer = setInterval(function(){
				if(that.tip&&that.tip._isShow) {
					that.tip.refresh();
				}else{
					clearInterval(Mention.mentionTipTimer);
				}
			},100);
		},200);
	},
	
	/** 
	 * 关闭提示 
	 */
	hideTip: function(){
		if( this.tip ) {
			XN.cookie.set('at',1,9999,'/','renren.com');
			this.tip.hide();
			this.tip = null;
		}
	}
	
};

});

//兼容老版本的初始化方法
object.use('xn.mention',function(exports,xn){
	window.Mention = xn.mention.Mention;
});
/**
 * 顶部导航"应用"下拉菜单
 * @author 李彬 libin@renren-inc.com
 **/
object.add('xn.appsDropMenu', 'dom, events, ua', function(exports, dom, events, ua) {
	var hasClass 	 = XN.element.hasClassName;		//判断是否存在相应class名
	var addClass	 = XN.element.addClass;			//添加class名
	var delClass	 = XN.element.delClass;			//删除class名
	var getLeft 	 = XN.element.realLeft;			//获取元素的绝对左坐标
	var getTop 		 = XN.element.realTop;			//获取元素的绝对上坐标
	var maxFavNum 	 = 6;							//收藏应用数量
	var maxAppsNum 	 = 32;							//最大一般应用数量
	var appsPageNum  = 12;							//每页显示应用数量
	var pageIndex 	 = 1;							//当前显示的页数
	var pageAmount	 = 0;							//总页数
	var draggingItem = null;						//正在拖拽的应用项
	var mDown 		 = false;						//记录是否鼠标整出去按下状态
	var favAppsPos   = [];							//记录收藏应用的各项坐标
	var webkitMove	 = 0;							//Fix Webkit mousedown 与 mousemove 重叠的 Bug
	var showingItems = null;						//正在显示的应用们
	
	
    /** 
    * 获取下拉菜单初始化
    **/
	this.dropInit = function() { 
		this.oAppDropMenu 	= $('appDropMenu');
        this.oAppsWrap 		= $('appsMenuPro');								//"应用"下拉模块容器
        
        var that = this;
        
		if (!this.oAppDropMenu || !this.oAppsWrap) {
			return;
		}
		
		this.oAppDropMenu.addEvent('mouseover', function(e) {
			if (window.appsMenuHideTimer) {
				clearTimeout(window.appsMenuHideTimer);
				window.appsMenuHideTimer = null;
			}
			
			window.appsMenuShowTimer = setTimeout(function() {
				showAppsMenu(e);
			}, 200);
		}, false);
		
		this.oAppDropMenu.addEvent('mouseleave', function(e) {
			if (window.appsMenuHideTimer) {
				clearTimeout(window.appsMenuHideTimer);
				window.appsMenuHideTimer = null;
			}
			
			if (window.appsMenuShowTimer) {
				clearTimeout(window.appsMenuShowTimer);
				window.appsMenuShowTimer = null;
			}
			
			if (XN.browser.IE) {
				if (this.contains(e.toElement)) {
					return;
				}
			}
			
			hideAppsMenu(e);	
		})
		
		this.oAppsWrap.addEvent('mouseover', function(e) {
			if (window.appsMenuHideTimer) {
				clearTimeout(window.appsMenuHideTimer);
				window.appsMenuHideTimer = null;
			}
		}, false);
		
		this.oAppsWrap.addEvent('mouseout', function(e) {
			if (XN.browser.IE) {
				if (this.contains(e.toElement)) {
					return;
				}
			}
			
			hideAppsMenu(e);		
		}, false);
		
		function showAppsMenu(e) {
			var oNav = Sizzle('.navigation-wrapper', $('navBar'))[0];
			if (that.oAppsWrap.children.length == 0 && !window.AppsDropMenu._loaded) {
				window.AppsDropMenu._loaded = true;
				new XN.net.xmlhttp({
					url : 'http://apps.renren.com/menu/getNavHtml',
					//url : 'http://test.renren.com/appmenu.action',
					method : 'get',
					onSuccess : function(r) {
						that.oAppsWrap.innerHTML = r.responseText;
						that.oAppsWrap.style.left = $('logo2').offsetWidth + 'px';
						that.oAppsWrap.style.top = oNav.offsetHeight + XN.element.realTop(oNav) + 'px';
						
						that.init()
					},
					onError : function(r) {
						XN.DO.showError('请求应用列表失败，请稍后重试...');
						window.AppsDropMenu._loaded = false;
					}
				})
			} else {
				that.oAppsWrap.style.left = $('logo2').offsetWidth + 'px';
				that.oAppsWrap.style.top = oNav.offsetHeight + XN.element.realTop(oNav) + 'px';
			}
			
			if (window.appsMenuShowTimer) {
				clearTimeout(window.appsMenuShowTimer);
				window.appsMenuShowTimer = null;
			}
		}
		
		function hideAppsMenu(e) {
			window.appsMenuHideTimer = setTimeout(function() {
				$('appsMenuPro').style.left = '-9999px';
				$('appsMenuPro').style.top = '-9999px';
			}, 200);
		}
	}
	
    /** 
    * 下拉菜单初始化
    **/
    this.init = function() {
        this.oMyAppsWrap 	= Sizzle('.my-fav-apps', this.oAppsWrap)[0];	//我已添加的应用
        this.oOtherAppsWrap = Sizzle('.other-apps', this.oAppsWrap)[0];		//其他应用
        this.oAppItems 		= Sizzle('li.app-item', this.oAppsWrap);		//应用项集合
        
		//考虑页面框架对dom模块addEvent的调整
		if(window.asyncHTMLManager) {
			var that = this;
			this.oAppsWrap.addEvent = function(type, callback, bubble){
				window.asyncHTMLManager.dom.Element.prototype.addEvent.call(that.oAppsWrap, type, callback, bubble);
			};
		}
		
		//绑定事件
		this._bindEvents(); 
		
		this.pageCtrl(1);
    };
	
    /**
    * 初始绑定事件
    **/
	this._bindEvents = function() {
		var that = this;
		
		//捕获区域内点击事件
		this.oAppsWrap.addEvent('click', function(e) {
			var oTarget = XN.event.element(e);
			var nodeName = oTarget.nodeName.toLowerCase();
			
			//点击"置顶"或"取消置顶"按钮
			if (nodeName == 'em') {
				e.preventDefault();
				that.manageFavApp(oTarget);
			}
			
			//点击翻页
			if(nodeName == 'a' && that.getParent(oTarget, 'div.page-ctrl')) {
				e.preventDefault();
				if (hasClass(oTarget, 'page-pre')) {
					//上一页
					if (pageIndex > 1 && !hasClass(oTarget, 'disable')) {
						that.pageCtrl(pageIndex - 1);
					}
				} else if (hasClass(oTarget, 'page-next')) {
					//下一页
					if (pageIndex < 3 && !hasClass(oTarget, 'disable')) {
						that.pageCtrl(pageIndex + 1);
					}
				} else if (hasClass(oTarget, 'page-1')) {
					//第一页
					if (pageIndex != 1) {
						that.pageCtrl(1);
					}
				} else if (hasClass(oTarget, 'page-2')) {
					//第二页
					if (pageIndex != 2) {
						that.pageCtrl(2);
					}
				} else if (hasClass(oTarget, 'page-3')) {
					//第三页
					if (pageIndex != 3) {
						that.pageCtrl(3);
					}
				}
			}
		}, false);
		
		//为支持Drag&Drop事件的浏览器添加拖拽事件
		//this.bindDragDropEvent();
		
		//鼠标划出拖拽中的图标时快速移动图标
		this.oAppsWrap.delegate('li.app-item-dragging', 'mouseout', function(e){
			if (!mDown) { 
				return;
			}
			
			var oItem = that.getParent(XN.event.element(e), 'li');
			//console.log(e.relatedTarget);
			if (mDown && oItem == draggingItem) {
				that.resetDraggingItemPos(e);
			}
		}, false);
		
		//鼠标点下，准备开始拖
		this.oAppsWrap.delegate('li.app-item a', 'mousedown', function(e) {
			e.preventDefault();
			that.dragStart(e);
		}, false);
		
		//鼠标移动，拖动中
		$(document.body).addEvent('mousemove', function(e) {
			that.dragProcess(e); 
		}, false);
		
		//鼠标抬起，结束拖动
		this.oAppsWrap.addEvent('mouseup', function(e) {
			that.dragEnd(e);		
		}, false);
		
		//解决拖拽图标和点击事件的冲突
		//TODO:性能有待优化
		$(document.body).addEvent('click', function(e) {
			var oTarget = XN.event.element(e);
			var oItem = that.getParent(oTarget, 'li');
			
			//由于webkit内核浏览器(windows)在触发mousedown时就会触发mousemove事件
			//所以在第一次触发mousemove时(webkitMove变量为0时)不执行move代码
			//真正move时是第二次触发mousemove事件，那时将webkitMove值改为1
			//触发click事件时重置webkitMove值为0
			webkitMove == 0;
			
			if (oItem && oItem.getAttribute('data-dragging')) {
				e.preventDefault();
				oItem.removeAttribute('data-dragging');
			}
		}, false);	
		
		//针对悲催的IE6做一些hover效果
		if (ua.ua.ie == 6) {
			this.oAppsWrap.delegate('li.app-item a', 'mouseover', function(e) {
				var oTarget = XN.event.element(e);
				Sizzle('em', this)[0].style.display = 'block';
				
				if (oTarget.nodeName.toLowerCase() == 'em') {
					if (that.oMyAppsWrap.contains(oTarget)) {
						oTarget.style.backgroundPosition = '-19px -19px';
					} else {
						oTarget.style.backgroundPosition = '0 -19px';
					}
				}
			}, false);
			
			//鼠标离开图标时隐藏"置顶"按钮
			this.oAppsWrap.delegate('li.app-item a', 'mouseout', function(e) {
				var oTarget = XN.event.element(e);
				
				if (oTarget.nodeName.toLowerCase() == 'em') {
					if (that.oMyAppsWrap.contains(oTarget)) {
						oTarget.style.backgroundPosition = '-19px 0';
					} else {
						oTarget.style.backgroundPosition = '0 0';
					}
				}
				
				if (this.contains(e.toElement)) {
					return;
				} else {
					Sizzle('em', this)[0].style.display = 'none';
				}
			}, false);
		}	
	};
	
    /**
    * 为支持Drag&Drop事件的浏览器添加拖拽事件
    * TODO:有时间做优雅降级
    **/
	this.bindDragDropEvent = function() {
		for( var i = 0, len = this.oAppItems.length; i < len; i++) {
			this.oAppItems[i].ondragstart = function(e) {
				//alert('start');
			};
		}
		
		this.oMyAppsWrap.ondragenter = function(e) {
			//console.log('fav drag enter');
			//alert('enter');
		};
		
		//拖来拖去
        this.oMyAppsWrap.ondragover = function(e) {
            //e.preventDefault();
            //return false;
			//alert('fav drop');
        };
		
		$('dropHereTest').ondrop = function(e) {
			//e.preventDefault();
			alert('fav drop');
		};
	};
	
    /**
    * 点击"置顶"/"取消置顶"小按钮时分配处理方法
    * @param {Object} oTarget : "置顶"/"取消置顶"小按钮
    **/
	this.manageFavApp = function(oTarget) {
		var oItem = this.getParent(oTarget, 'li');
		
		if (hasClass(oTarget, 'cancel-fav')) {
			this.cancelFav(oItem);
		} else if (hasClass(oTarget, 'to-fav')) {
			this.fav(oItem);
		}
	};	
	
    /**
    * 收藏应用
    * @param {Object} oItem : 要收藏的应用li项
    **/
	this.fav = function(oItem) {
		var oNewItem 	= oItem.cloneNode(true);					//创建副本
		var oFavWrap 	= this.oMyAppsWrap;							//收藏应用容器div
		var oFavList 	= Sizzle('ul.apps-list', oFavWrap)[0];		//收藏列表ul
		var oEmptyItems = Sizzle('li.app-item-empty', oFavWrap);	//未收藏项(显示"拖入"的空li)
		var oHolder		= Sizzle('li[data-holder]', oFavWrap)[0];	//占位li项
		var oBtn 		= Sizzle('em', oNewItem)[0];				//"置顶"小按钮
		var oTip 		= Sizzle('h4', oFavWrap)[0];				//收藏应用数量大于3则隐藏的提示		
		var favNum 		= Sizzle('li.app-item', oFavWrap).length;	//已收藏应用的数量
		var order		= [];										//收藏应用的排序
		var appId		= oItem.getAttribute('data-aid');			//应用ID
		
		//如果收藏的应用已经满了，弹出提示，并将最后一个取消置顶
		if (favNum >= maxFavNum) {
			var oLastFavItem = Sizzle('li.app-item', oFavList)[favNum - 1];
			var oOtherAppsList = Sizzle('ul.apps-list', this.oOtherAppsWrap)[0];
			var oLastFavItemBtn = Sizzle('em', oLastFavItem)[0];
			
			oLastFavItem.style.display = '';
			oOtherAppsList.insertBefore(oLastFavItem, oOtherAppsList.firstChild);
			oLastFavItem.setAttribute('data-faved', 'f');
			oLastFavItemBtn.className = 'to-fav';
			oLastFavItemBtn.setAttribute('title', '置顶');
		}
		
		//如果收藏数量即将到4，则隐藏提示
		if (favNum >= 3) { 
			oTip.style.display = 'none';
		}
		
		oBtn.className = 'cancel-fav';
		oBtn.setAttribute('title', '取消置顶');
		
		//如果刚刚取消收藏，setTimeout还存在，则立即执行相关代码并清空setTimeout
		if (this.cancelFavTimer) {
			this.clearCancelFavTimer(); 
		}
		
		oNewItem.setAttribute('data-faved', 't');
		//如果占位项存在，则直接替换占位项，否则顶到首位
		
		if (oHolder) {
			oFavList.replaceChild(oNewItem, oHolder);
		} else {
			oFavList.insertBefore(oNewItem, oFavList.firstChild);
			if (oEmptyItems[0]) {
				$(oEmptyItems[0]).remove()
			};
		}
		
		$(oItem).remove();
		
		//刷刷新一般应用列表
		this.pageCtrl(pageIndex);
		
		//发送置顶请求
		order = '[' + this.getFavOrder(oNewItem).join(',') + ']';
		appId = oNewItem.getAttribute('data-aid');
		new XN.net.xmlhttp({
			url : 'http://apps.renren.com/menu/reorderBookmark.do',
			method : 'post',
			data : 'app_id=' + appId + '&app_ids=' + order,
			onSuccess : function(r) {
				//console.log(r.responseText);
			},
			onError : function(r) {
				
			}
		})
		
		//针对悲催的IE6重置"置顶"按钮样式
		if (ua.ua.ie == 6) {
			Sizzle('em', oNewItem)[0].style.display = 'none';
			Sizzle('em', oNewItem)[0].style.backgroundPosition = '-19px 0';
		}
	};
	
    /**
    * 取消收藏应用
    * @param {Object} oItem : 要取消收藏的应用li项
    **/
	this.cancelFav = function(oItem) {
		var oFavWrap  = this.oMyAppsWrap;							//收藏应用容器div
		var oFavList  = Sizzle('ul.apps-list', oFavWrap)[0];		//收藏列表ul
		var oAppsWrap = this.oOtherAppsWrap;						//其他应用容器div
		var oAppsList = Sizzle('ul.apps-list', oAppsWrap)[0];		//应用列表ul
		var oAppItem  = oItem.cloneNode(true);						//应用项副本
		var appId	  = parseInt(oItem.getAttribute('data-aid'));	//应用ID
		var appOrder  = parseInt(oItem.getAttribute('data-order'));	//应用排序
		var oBtn 	  = Sizzle('em', oAppItem)[0];					//"置顶"小按钮
		var oTip 	  = Sizzle('h4', oFavWrap)[0];					//收藏应用数量大于3则隐藏的提示
		var favNum 	  = Sizzle('li.app-item', oFavWrap).length;		//已收藏应用的数量
		var apps	  = Sizzle('li.app-item', oAppsWrap);			//未收藏应用
		var appsNum   = apps.length;								//未收藏应用的数量
		var pageNum   = 1;											//取消置顶后应用所在页数
		var index	  = appsNum;									//应用图标插入的索引
		
		//如果已经存在取消置顶的占位延迟timer，清除~
		if (this.cancelFavTimer) {
			this.clearCancelFavTimer();
		}		
		
		//重新设置应用图标元素属性
		oBtn.className = 'to-fav';
		oBtn.setAttribute('title', '置顶');
		oAppItem.setAttribute('data-faved', 'f');
		
		//对比取消置顶的应用ID与一般应用的ID，获取要插入到一般应用列表的索引值
		for (var i = 0, len = apps.length; i < len; i++) {
			if (appOrder < parseInt(apps[i].getAttribute('data-order'))) {
				index = i;
				break;
			}
		}
		
		//获取图标应该返回的一般应用页数
		pageNum = Math.ceil((index + 1)/12);
		
		//如果索引值靠前，则插入应用，否则直接追加到最后
		if (index < appsNum) {
			oAppsList.insertBefore(oAppItem, apps[index]);
		} else {
			oAppsList.appendChild(oAppItem);
		}
		
		this.pageCtrl(pageIndex);
		
		//先提示取消置顶的应用会跑到第几页
		oItem.innerHTML = '<span class="app-holder place-tip">第' + pageNum + '页可找到</span>';
		oItem.className = 'app-item-empty';
		oItem.removeAttribute('data-order');
		oItem.removeAttribute('data-aid');
		
		//两秒后修改空item的内容并将置顶的应用左对齐
		this.cancelFavTimer = setTimeout(function(){
			oItem.innerHTML = '<span class="app-holder">拖入</span>';
			oFavList.appendChild(oItem);
			
			//如果收藏数量即将到4，则隐藏提示
			if (favNum <= 4) {
				oTip.style.display = '';
			}
			
			if (this.cancelFavTimer) {
				this.cancelFavTimer = null;
			}
		}, 2000);
		
		//发送取消置顶请求
		new XN.net.xmlhttp({
			url : 'http://apps.renren.com/menu/removeBookmark.do',
			method : 'post',
			data : 'app_id=' + appId,
			onSuccess : function(r) {
				//console.log(r.responseText);
			},
			onError : function(r) {
				
			}
		})
		
		//针对悲催的IE6重置"置顶"按钮样式
		if (ua.ua.ie == 6) {
			Sizzle('em', oAppItem)[0].style.display = 'none';
			Sizzle('em', oAppItem)[0].style.backgroundPosition = '0 0';
		}
	};
	
    /**
    * 拖拽开始
    * @param {Object} e : event对象
    **/
	this.dragStart = function(e) {
		var oTarget = XN.event.element(e);
		var oItem = this.getParent(oTarget, 'li'); 
		
		if (!oItem) { return; }
		if (oTarget.nodeName.toLowerCase() == 'em' && oItem) {
			return;
		}
		
		if (favAppsPos.length == 0) {
			//获取收藏应用的坐标，以便拖拽图标时比较位置
			this.getFavItemsPos();
		}
		
		mDown = true;
		
		draggingItem = oItem;
	};
	
    /**
    * 拖拽进行中
    * @param {Object} e : event对象
    **/
	this.dragProcess = function(e) {
		if (!mDown || !draggingItem) return;
		
		var oTarget = XN.event.element(e);
		var oItem = this.getParent(oTarget, 'li');
		
		if (!oItem && !draggingItem) { return; }
		
		//由于webkit内核浏览器(windows)在触发mousedown时就会触发mousemove事件
		//所以在第一次触发mousemove时(webkitMove变量为0时)不执行move代码
		if (webkitMove == 0) {
			webkitMove = 1;
			return;
		};
		
		//首次拖拽应用项则创建占位项，并将应用项放到外容器设置absolute定位
		if (!draggingItem.getAttribute('data-dragging')) {
			draggingItem = oItem.cloneNode(true);
			
			//创建占位应用项
			var oItemHolder;
			if (draggingItem.getAttribute('data-faved') == 't') {
				oItemHolder = document.createElement('li');
				oItemHolder.className = 'app-item-empty';
				oItemHolder.innerHTML = '<span class="app-holder">拖入</span>';
				oItemHolder.setAttribute('data-holder', 't');
				oItem.parentNode.replaceChild(oItemHolder, oItem);
			} else {
				oItemHolder = oItem.cloneNode(true);
				oItemHolder.setAttribute('data-holder', 't');
				addClass(oItemHolder, 'holder-alpha');
				oItem.parentNode.replaceChild(oItemHolder, oItem);
			}
			
			//将拖拽项放到DOm中
			this.oAppsWrap.appendChild(draggingItem);
			
			//为拖拽项设置坐标
			draggingItem.style.position = 'absolute';
			draggingItem.style.left 	= (XN.element.realLeft(oItemHolder) - XN.element.realLeft(this.oAppsWrap)) + 'px';
			draggingItem.style.top 		= (XN.element.realTop(oItemHolder) - XN.element.realTop(this.oAppsWrap)) + 'px';
			draggingItem.className = 'app-item-dragging';
			//设置拖拽属性
			draggingItem.setAttribute('data-dragging', 't');
		} else {
			this.resetDraggingItemPos(e);
			
			if (this.isInFavBox(e)) {
				//如果刚刚取消收藏，setTimeout还存在，则立即执行相关代码并清空setTimeout
				if (this.cancelFavTimer) {
					this.clearCancelFavTimer();
				}
				
				var index = this.getFavToIndex(draggingItem);
				
				this.addFavAppHolder(index);
			}
		}
	};
	
    /**
    * 拖拽结束
    * @param {Object} e : event对象
    **/
	this.dragEnd = function(e) {
		mDown = false;
		//如果没有正在拖拽的应用，果断返回！
		if (!draggingItem || draggingItem.getAttribute('data-dragging') != 't') {
			return;
		}
		
		var aid = draggingItem.getAttribute('data-aid');				//应用ID
		var oHolder;													//应用项保留块
		var faved = draggingItem.getAttribute('data-faved');			//是否是收藏的应用
		var oFavList = Sizzle('ul.apps-list', this.oMyAppsWrap)[0];		//收藏的应用列表ul
		var oFavItems = Sizzle('li.app-item', oFavList);				//已收藏的应用
		var oTip 	= Sizzle('h4', this.oMyAppsWrap)[0];				//收藏应用数量大于3则隐藏的提示	
		var favNum 	= Sizzle('li.app-item', oFavList).length;			//已收藏应用的数量
		
		if (this.isInFavBox(e)) {
			//放到收藏区域
			if (faved == 'f') {
				//如果拖放的是一般应用
				oHolder = Sizzle('li[data-holder=t]', this.oOtherAppsWrap)[0];		//获取一般应用占位项
				delClass(oHolder, 'holder-alpha');									//移除一般应用占位项半透明样式class
				oHolder.removeAttribute('data-holder');								//移除占位属性
				this.fav(oHolder);													//将一般应用置顶
				draggingItem.remove();												//移除拖拽项
			} else {
				//如果拖放的是收藏应用
				oHolder = Sizzle('li[data-holder=t]', oFavList)[0];		//获取收藏区占位
				oFavList.replaceChild(draggingItem, oHolder);			//将拖拽项替换占位项
				draggingItem.style.cssText = '';						//清除拖拽临时样式
				draggingItem.className = 'app-item'; 
				draggingItem.removeAttribute('data-dragging');
				
				//如果收藏数量即将到4，则隐藏提示
				if (favNum < 3) {
					oTip.style.display = '';
				} else {
					oTip.style.display = 'none';
				}
				
				//获取收藏应用排序
				var order = '[' + this.getFavOrder().join(',') + ']';
				//发送排序请求
				new XN.net.xmlhttp({
					url : 'http://apps.renren.com/menu/reorderBookmark.do',
					method : 'post',
					data : 'app_ids=' + order,
					onSuccess : function(r) {
						//console.log(r.responseText);
					},
					onError : function(r) {
						
					}
				})
			}
		} else {
			//放到收藏区域外
			if (faved == 'f') {
				//如果拖放的是一般应用
				oHolder = Sizzle('li[data-aid=' + aid + ']', this.oAppsWrap)[0];	//获取该应用占位项
				oFavHolder = Sizzle('li[data-holder]', this.oMyAppsWrap)[0];		//获取收藏区占位项
				
				if (oFavItems.length == maxFavNum) {
					//如果收藏区应用数量已经达到上限
					oFavItems[5].style.display = '';	//重新显示最后一个收藏应用
					
					if (oFavHolder) {
						oFavHolder.remove();			//移除收藏区占位项
					}
				} else {
					//如果收藏区应用数量没有达到上限且收藏区占位项存在
					if (oFavHolder) {
						oFavList.appendChild(oFavHolder);			//将占位项移到收藏区最后
						oFavHolder.removeAttribute('data-holder');	//移除占位属性
					}
				}
				
				delClass(oHolder, 'holder-alpha');			//移除一般应用占位项半透明样式class
				oHolder.removeAttribute('data-holder');		//移除占位属性
				$(draggingItem).remove();					//移除拖拽项
			} else {
				//如果拖放的是收藏应用
				oHolder = Sizzle('li[data-holder=t]', oFavList)[0];			//获取收藏区占位
				oHolder.parentNode.replaceChild(draggingItem, oHolder);		//将拖拽的应用放回收藏区，以便直接调用"取消收藏"方法
				draggingItem.style.cssText = '';							//清除拖拽项临时样式
				draggingItem.className = 'app-item';
				draggingItem.removeAttribute('data-dragging');				//清除拖拽属性
				this.cancelFav(draggingItem);								//将拖拽相应应用取消收藏(取消置顶)
			}
		}
		
		//清空正在拖拽的应用项
		draggingItem = null;
	};
	
    /**
    * 获取收藏应用的坐标，以便拖拽图标是比较位置
    **/
	this.getFavItemsPos = function() {
		
	};
	
    /**
    * 获取指定选择器的父元素
    * @param {Object} ele : 子元素
    * @param {Object} selector : 选择器
    **/
	this.getParent = function(ele, selector) {
		var element = $(ele);
		var matchesSelector = XN.element.matchesSelector;
		
		while (!matchesSelector(element, selector)) {
			if (element.nodeName.toLowerCase() == 'body') {
				return null;
			}
			element = $(element.parentNode);
		}
		
		return element;
	}
	
    /**
    * 判断是否放在收藏区域内，返回Bool值
    * @param {Object} e : event对象
    **/
	this.isInFavBox = function(e) {
		var favBox 	  = this.oMyAppsWrap;
		var x 		  = XN.event.pointerX(e) || e.page.x;
		var y 		  = XN.event.pointerY(e) || e.page.y;
		var favBoxPos = {
			left   : XN.element.realLeft(favBox),
			top	   : XN.element.realTop(favBox),
			right  : XN.element.realLeft(favBox) + favBox.offsetWidth,
			bottom : XN.element.realTop(favBox) + favBox.offsetHeight
		}
		
		if (x > favBoxPos.left && x < favBoxPos.right && y > favBoxPos.top && y < favBoxPos.bottom) {
			return true;
		} else {
			return false;
		}
	};
	
    /**
    * 获取收藏应用的坐标，以便拖拽图标是比较位置
    **/
	this.getFavItemsPos = function() {
		var oFavApps = Sizzle('li', this.oMyAppsWrap);
		var width 	 = oFavApps[0].offsetWidth;
		var height 	 = oFavApps[0].offsetHeight;
		
		for (var i = 0, len = oFavApps.length; i < len; i++) {
			var tmpAppPos 	 = {};
			tmpAppPos.left 	 = getLeft(oFavApps[i]);
			tmpAppPos.top 	 = getTop(oFavApps[i]);
			tmpAppPos.right  = getLeft(oFavApps[i]) + width;
			tmpAppPos.bottom = getTop(oFavApps[i]) + height;
			favAppsPos.push(tmpAppPos);
			tmpAppPos		 = null;
		}
	};
	
    /**
    * 获取元素的绝对坐标(相对于页面)
    * @param {Object} oItem : 要获取坐标的元素
    **/
	this.getItemPos = function(oItem) {
		var pos = {};
		var width = oItem.offsetWidth;
		var height = oItem.offsetHeight;
		
		pos.left 	= getLeft(oItem);
		pos.top 	= getTop(oItem);
		pos.right 	= getLeft(oItem) + width;
		pos.bottom 	= getTop(oItem) + height;
		
		return pos;
	};
	
    /**
    * 获取应用图标要插入收藏区域的索引值
    * @param {Object} oItem : 要获取索引的元素
    **/
	this.getFavToIndex = function(oItem) {
		var itemPos = this.getItemPos(oItem);						//图标的坐标集合
		var faved = oItem.getAttribute('data-faved');				//图标是否是收藏的图标
		var oFavApps = Sizzle('li.app-item', this.oMyAppsWrap);		//收藏的图标
		var oApps = Sizzle('li', this.oMyAppsWrap);					//收藏区域里的所有li
		var len = favAppsPos.length;								//
		var index = len - 1;
		var distance = 10000;										//默认图标左边的距离
		
		//遍历收藏区里的li项，与当前拖拽的图标的左边做减法，找到绝对值最小的那个li，将占位项li替换到这个位置
		for (var i = 0; i < len; i++) {
			if (Math.abs(itemPos.left - favAppsPos[i].left) < distance) {
				distance = Math.abs(itemPos.left - favAppsPos[i].left);
				index = i;
			}
		}
		
		//如果获取的索引大于等于已收藏数量，则index改为最后一个收藏的index加1
		if(index >= oFavApps.length) {
			index = oFavApps.length;
		}
		
		return index;
	};
	
    /**
    * 添加应用占位元素到指定索引
    * @param {Number} index : 索引值
    **/
	this.addFavAppHolder = function(index) {
		var oFavList = Sizzle('ul.apps-list', this.oMyAppsWrap)[0];
		var oFavApps = Sizzle('li.app-item', oFavList);
		var oApps = Sizzle('li', oFavList);
		var oEmptyItem = Sizzle('li.app-item-empty[data-holder=t]', oFavList)[0];
		
		if (!oEmptyItem) {
			oEmptyItem = Sizzle('li.app-item-empty', oFavList)[0];
		}
		
		if (oEmptyItem) {
			if (oFavApps[index]) {
				oFavList.insertBefore(oEmptyItem, oFavApps[index]);
			} else if (oApps[index + 1]) {
				oFavList.insertBefore(oEmptyItem, oApps[index + 1]);
			} else {
				oFavList.appendChild(oEmptyItem);
			}
		} else {
			//如果收藏应用已经满了，则将最后一个往后顶
			oEmptyItem = document.createElement('li');
			oEmptyItem.innerHTML = '<span class="app-holder">拖入</span>';
			addClass(oEmptyItem, 'app-item-empty');
			
			oFavList.insertBefore(oEmptyItem, oFavApps[index]);
			oFavApps[maxFavNum - 1].style.display = 'none';
		}
		
		oEmptyItem.setAttribute('data-holder', 't');
	};
	
    /**
    * 移除应用占位元素
    * @param {Number} index : 索引值
    **/
	this.removeFavAppHolder = function(index) {
		
	};
	
    /**
    * 翻页控制
    * @param {Number} num : 要跳转的页数
    **/
	this.pageCtrl = function(num) {
		var box = Sizzle('ul.apps-list', this.oOtherAppsWrap)[0];       //应用列表容器
        var oLis = Sizzle('li', box);
		var oCtrlWrap = Sizzle('div.page-ctrl', this.oAppsWrap)[0];
		var oPreBtn = Sizzle('a.page-pre', oCtrlWrap)[0];
		var oNextBtn = Sizzle('a.page-next', oCtrlWrap)[0];
        var pageCount = Math.ceil(oLis.length/appsPageNum);				//页数
        var hideStartIndex = (pageIndex - 1) * appsPageNum;   			//开始隐藏的索引
        var hideEndIndex = hideStartIndex + appsPageNum - 1;            //结束隐藏的索引
        var showStartIndex = (num - 1) * appsPageNum;                   //开始显示的索引
        var showEndIndex = showStartIndex + appsPageNum - 1;            //结束显示的索引
        var tmpBox = box.cloneNode(true);								//应用列表副本(用于翻页效果)
        var oRullWrap = $('appsRallWrap');								//翻页效果容器
        var oOtherItems = null;											//一般应用
		var pageNum = 3;												//页数
        
		//console.log('hideStartIndex:' + hideStartIndex + ', hideEndIndex:' + hideEndIndex + ', showStartIndex:' + showStartIndex + ',showEndIndex:' + showEndIndex);
		/*
		while (hideStartIndex <= hideEndIndex && oLis[hideStartIndex]) {
            //console.log(oLis[hideStartIndex]);
            oLis[hideStartIndex].style.display = 'none';
            hideStartIndex++;
        }
        */
		
		if (oLis.length == 0) {
			this.pageSet(0);
			return;
		} else if (oLis.length == 6) {
			this.pageSet(1);
			return;
		} else if (oLis.length == 7) {
			this.pageSet(1);
			return;
		}
		
		for (var i = 0, len = oLis.length; i < len; i++) {
			oLis[i].style.display = 'none';
		}
        
        while (showStartIndex <= showEndIndex && oLis[showStartIndex]) {
            oLis[showStartIndex].style.display = '';                
            showStartIndex++;
        }
		
		//如果跳转的页面不是当前页面，则进行滚动动画
		if (num < pageIndex) {
			rull('right');
		} else if (num > pageIndex) {
			rull('left');
		}
		
		delClass(Sizzle('a.page-' + pageIndex, oCtrlWrap)[0], 'act');
		addClass(Sizzle('a.page-' + num, oCtrlWrap)[0], 'act');
		
		//翻到第一页隐藏"上一页"和"首页"
        if (num == 1) {
            addClass(oPreBtn, 'disable');
        } else {
			delClass(oPreBtn, 'disable');
		}
		
		//翻到最后页隐藏"下一页"和"尾页"
        if (num == pageCount) {
            addClass(oNextBtn, 'disable');
        } else {
			delClass(oNextBtn, 'disable');
		}
		
		pageIndex = num;
		
		//计算新页数
		oOtherItems = Sizzle('li.app-item', box);
		pageNum = Math.ceil(oOtherItems.length / 12);
		//如果新页数与当前页数不相同，则重新设置翻页控件元素
		if (pageNum != pageAmount) {
			this.pageSet(pageNum);
		};
		
		if (pageIndex > pageNum) {
			this.pageCtrl(pageNum);
		}
		//pageAmount = pageCount;
		
		//翻页动画效果
		//@param {String} direction : 滚动方向 ["left"/"right"]
		function rull(direction) {
			if (window.dropAppsRullTmpTimer || window.dropAppsRullTimer) {
				clearTimeout(window.dropAppsRullTmpTimer);
				clearTimeout(window.dropAppsRullTimer);
				window.dropAppsRullTmpTimer = null;
				window.dropAppsRullTimer = null;
			}
			
			var stopPos = direction == 'left' ? -397 : 397;		//总距离
			var stepLength = direction == 'left' ? -45 : 45;	//每帧移动距离
			var stepTime = 25;									//每帧时间间隔
			
			//创建临时滚动容器
			if (!oRullWrap) {
				oRullWrap = $element('div');
				oRullWrap.setAttribute('id', 'appsRallWrap');
				oRullWrap.style.display = 'none';
				box.parentNode.appendChild(oRullWrap);
			}
			
			oRullWrap.innerHTML = '';
			oRullWrap.appendChild(tmpBox);
			oRullWrap.style.display = '';
			
			//设置旧页初始位置
			tmpBox.style.marginLeft = stepLength + 'px';
			//设置旧页滚动Timer
			var tmpTimer = window.dropAppsRullTmpTimer = setInterval(function() {
				var left = tmpBox.style.marginLeft.split('px')[0];
				if (Math.abs(parseInt(left) - stopPos) > Math.abs(stepLength)) {
					tmpBox.style.marginLeft = parseInt(left) + stepLength + 'px';
				} else {
					clearInterval(tmpTimer);
					oRullWrap.style.display = 'none';
					oRullWrap.innerHTML = '';
					tmpBox = null;
				}
			}, stepTime);	
			
			//设置新页初始位置
			box.style.marginLeft = (0 - stopPos) + 'px';
			//设置新页滚动Timer
			var timer = window.dropAppsRullTimer = setInterval(function() {
				var left = box.style.marginLeft.split('px')[0];
				if (Math.abs(parseInt(left)) > Math.abs(stepLength)) {
					box.style.marginLeft = parseInt(left) + stepLength + 'px';
				} else {
					box.style.marginLeft = '2px';
					clearInterval(timer);
				}
			}, stepTime)
		}
	};
	
    /**
    * 重设翻页控件
    * @param {Number} pageNum : 要重新设置的页数
    **/
	this.pageSet = function(pageNum) {
		var oCtrlWrap = Sizzle('div.page-ctrl', this.oAppsWrap)[0];
		var oPage1 = Sizzle('a.page-1', oCtrlWrap)[0];
		var oPage2 = Sizzle('a.page-2', oCtrlWrap)[0];
		var oPage3 = Sizzle('a.page-3', oCtrlWrap)[0];
		var oPreBtn = Sizzle('a.page-pre', oCtrlWrap)[0];
		var oNextBtn = Sizzle('a.page-next', oCtrlWrap)[0];
		var oAppsTip = Sizzle('p.apps-tips', this.oAppsWrap)[0];
		var oCenterBtn = Sizzle('a.apps-center-btn', this.oAppsWrap)[0];
		var appsNum = Sizzle('li.app-item', this.oOtherAppsWrap).length;
		
		switch (pageNum) {
			case 0 :
				oCtrlWrap.style.display = 'none';
				oAppsTip.style.display = '';
				oCenterBtn.style.display = '';
				break;
			case 1:
				oPage1.style.display = '';
				oPage2.style.display = 'none';
				oPage3.style.display = 'none';
				addClass(oNextBtn, 'disable');
				addClass(oPreBtn, 'disable');
				
				if (appsNum <= 6) {
					oCtrlWrap.style.display = 'none';
					oCenterBtn.style.display = '';
					oAppsTip.style.display = '';
				} else {
					oCtrlWrap.style.display = '';
					oCenterBtn.style.display = 'none';
					oAppsTip.style.display = 'none';
				}
				break;
			case 2:
				oPage1.style.display = '';
				oPage2.style.display = '';
				oPage3.style.display = 'none';
				oCtrlWrap.style.display = '';
				oAppsTip.style.display = 'none';
				oCenterBtn.style.display = 'none';
				break;
			case 3:
				oPage1.style.display = '';
				oPage2.style.display = '';
				oPage3.style.display = '';
				oCtrlWrap.style.display = '';
				oAppsTip.style.display = 'none';
				oCenterBtn.style.display = 'none';
				break;
		}
		
		pageAmount = pageNum;
	};
	
    /**
    * 获取图标应该返回的一般应用页数
    * @param {Object} oItem : 应用元素
    **/
	this.getItemPageIndex = function(oItem) {
		var apps	  = Sizzle('li.app-item', this.oOtherAppsWrap);	//未收藏应用
		var appsNum   = apps.length;								//未收藏应用的数量
		var pageNum   = 1;											//取消置顶后应用所在页数
		var index	  = appsNum;									//应用图标插入的索引
		
		//获取图标应该返回的一般应用页数
		pageNum = Math.ceil((index + 1)/12);
	};
	
    /**
    * 获取收藏图标的排序
    **/
	this.getFavOrder = function() {
		var apps = Sizzle('li.app-item', this.oMyAppsWrap);	//收藏的应用
		var order = [];
		
		for (var i = 0, len = apps.length; i < len; i++) {
			order.push(apps[i].getAttribute('data-aid'));
		}
		
		return order;
	}
	
    /**
    * 重新定位拖拽图标的坐标
    * @param {Object} e : event对象
    **/
	this.resetDraggingItemPos = function(e) {
		var x = XN.event.pointerX(e) || e.page.x;
		var y = XN.event.pointerY(e) || e.page.y;
		
		draggingItem.style.left = (x - XN.element.realLeft(this.oAppsWrap) - 20) + 'px';
		draggingItem.style.top  = (y - XN.element.realTop(this.oAppsWrap) - 20) + 'px';
	};
	
    /**
    * 清楚取消置顶的定时器
    **/
	this.clearCancelFavTimer = function() {
		var oFavList 	= Sizzle('ul.apps-list', this.oMyAppsWrap)[0];		//收藏列表ul
		var oEmptyItems = Sizzle('li.app-item-empty', oFavList);			//未收藏项(显示"拖入"的空li)
		
		//如果刚刚取消收藏，setTimeout还存在，则立即执行相关代码并清空setTimeout
		if (this.cancelFavTimer) {
			oEmptyItems[0].innerHTML = '<span class="app-holder">拖入</span>';
			oEmptyItems[0].removeAttribute('data-holder');
			oFavList.appendChild(oEmptyItems[0]); 
			
			clearTimeout(this.cancelFavTimer);
			this.cancelFavTimer = null;
		}
	};
	
    /**
    * 设置拖拽元素样式及属性
    * @param {String} type : 设置类型 ["add"|"del"]
    **/
	this.setDraggingItem = function(type) {
		if (!type || !draggingItem) {return;}
		
		//去掉默认鼠标悬停时的样式
		var tmpA = Sizzle('a', draggingItem)[0];
		
		Sizzle('em', draggingItem)[0].style.display = 'none';
		//设置拖拽属性
		
		if (type == 'add') {
			tmpA.style.border = '0';
			tmpA.style.backgroundColor = 'inherit';
			tmpA.style.boxShadow = 'none';
			draggingItem.setAttribute('data-dragging', 't');
		}
	}
	
    /**
    * 由于windows下Chrome浏览器mousedown的同时会触发mousemove事件(也就是click都会触发mousemove)，触发了move事件就会视为拖拽，就会阻碍点击跳转
    * 所以需要在二次触发move事件时单独为Chrome浏览器加一个move标记，在mouseup时判断是否有此标记来决定触发click跳转事件
    * @param {Object} oItem : 要添加标记的应用图标
    **/
	
	this.addHolder = function(oItem) {
		
	};
	
	this.removeHolder = function(oItem) {
		
	};
	
	this.debug = function(con) {
		var o = $('debug');
		
		o.value = con + '\n' + o.value;
	}
});

object.use('xn.appsDropMenu',function(exports,xn){
	window.AppsDropMenu = xn.appsDropMenu;
});
//object.execute('xn.appsDropMenu');

object.use('dom, ua, ua.extra, ua.flashdetect, ua.os', function(exports, dom, ua) {
	var strs = [];
	var core = ua.ua.core;
	var shell = ua.ua.shell;
	var coreVersion = ua.ua[core];
	if (coreVersion) strs.push(core + '=' + coreVersion);
	var shellVersion = ua.ua[shell];
	if (shellVersion) strs.push(shell + '=' + shellVersion);
	if (shell != 'ieshell' && ua.ua.ieshell) str += '&ieshell=' + ua.ua.ieshell; // 套壳浏览器，统计系统IE版本
	var flashVersion = ua.flashdetect.getFlashVersion();
	if (flashVersion) strs.push('flash=' + flashVersion);

	var oscore = ua.ua.oscore;
	if(oscore != 'unknown') {
		strs.push('oscore=' + oscore);
		var osVersion = ua.ua[oscore];
		if(osVersion != 'unknown') {
			if(typeof osVersion != 'object') {
				strs.push('os_ver=' + osVersion);
			} else {
				for(var prop in osVersion) {
					strs.push('os_dist=' + prop);
					if(osVersion[prop] != 'unknown') {
						strs.push('os_dist_ver=' + osVersion[prop]);
					}
					break;
				}
			}
		}
	}
	
	XN.net.sendStats('http:\/\/s.renren.com\/speedstats\/browser\/stats.php?' + strs.join('&'));

	var desc, url, key = 1;

	var shellMap = {
		'se360': '360安全浏览器',
		'sogou': '搜狗浏览器',
		'maxthon': '傲游浏览器',
		'theworld': '世界之窗浏览器',
		'qqbrowser': 'QQ浏览器',
		'tt': '腾讯TT浏览器'
	};
	var shell = shellMap[ua.ua.shell] || '兼容浏览器';

	if (ua.ua.ie >= 6 && ua.ua.ie < 7) {
		var now = new Date().getTime();
		if (now >= 1309503600000 && now <= 1309514400000 && XN.cookie.get('fie') != 2) { // 2011/7/1 15:00 - 2011/7/1 12:00
			key = 2;
			url = 'http://noie6.renren.com/';
			desc = '人人网温馨提示：优化上网体验，体验极速之旅 <a href="http://noie6.renren.com/down/360cse-promote" style="text-decoration:none"><img src="http://a.xnimg.cn/sites/noie6/res/browsers/360cse-icon.png" style="vertical-align:text-bottom" /> 360极速浏览器</a>&nbsp;&nbsp;&nbsp;<a href="http://noie6.renren.com/down/sogou-promote" style="text-decoration:none"><img src="http://a.xnimg.cn/sites/noie6/res/browsers/sogou-icon.png" style="vertical-align:text-bottom" /> 搜狗高速浏览器</a>'
		} else if (!XN.cookie.get('fie')) {
			if (ua.ua.shell == 'ieshell') {
				url = 'http://noie6.renren.com/';
				desc = '致IE6用户的一封信';
			} else {
				url = 'http://dl.xnimg.cn/down/IE8-WindowsXP-x86-CHS.exe';
				desc = '尊敬的用户，您目前使用的是IE6内核的' + shell + '，为了给您带来更快速、更安全、更优质的体验，人人网将逐步降低IE6内核的支持，我们建议您尽快<a href="' + url + '">升级您的系统浏览器为IE8</a>，这不会对您使用' + shell + '产生任何影响，感谢您的支持。';
			}
		}

		if (url && desc) {
			dom.ready(function() {
				var div = document.getElementById('ie6notice');
				if (div) div.innerHTML = '<div style="position:relative;"><div onclick="window.open(\'' + url + '\');" style="cursor:pointer;background:#FFFBC1;border-bottom:1px solid #F9B967;padding:5px;text-align:center;font-size:14px;"><div style="width:965px;padding-right: 15px;">' + desc + '</div></div><a href="#nogo" onclick="XN.cookie.set(\'fie\',' + key + ',30,\'/\',\'renren.com\');$(\'ie6notice\').hide();return false;" class="x-to-hide" style="height:14px;width:14px;overflow:hidden;position:absolute;top:8px;right:10px;" title="关闭"></a></div>';
			});
		}
	}
});
/* ��ʼ��publisher */
object.execute('xn.globalpublisher.products.statusdefault');
