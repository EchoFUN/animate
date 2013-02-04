
/* import from d:\workhome\workspace\jxn\src\compatible\head.js */ 

if (typeof object == 'undefined') {

/* import from D:\workhome\workspace\objectjs.org\object\lib\slick\Slick.Parser.js */ 

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


/* import from D:\workhome\workspace\objectjs.org\object\lib\jeresig-sizzle-68ff471\sizzle.js */ 

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

/* import from D:\workhome\workspace\objectjs.org\object\lib\janl-mustache.js-d2feae3\mustache.js */ 

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

/* import from D:\workhome\workspace\objectjs.org\object\lib\json2.js */ 

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

/* import from D:\workhome\workspace\objectjs.org\object\src\object\ecma5.js */ 

/**
 * @see https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Object/keys
 */
Object.keys = function(o) {
	var result = [];
	if (o === undefined || o === null) {
		return result;
	}

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

/**
 * @method
 * @see https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/isArray
 */
Array.isArray = Array.isArray || function(o) {
	return Object.prototype.toString.call(o) === '[object Array]';
};

/**
 * @method
 * @see https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/forEach
 */
Array.prototype.forEach = Array.prototype.forEach || function(fn, bind) {
	for (var i = 0; i < this.length; i++) {
		fn.call(bind, this[i], i, this);
	}
};

/**
 * @method
 * @see https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/indexOf
 */
Array.prototype.indexOf = Array.prototype.indexOf || function(str) {
	for (var i = 0; i < this.length; i++) {
		if (str === this[i]) {
			return i;
		}
	}
	return -1;
};

/**
 * @method
 * @see https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/some
 */
Array.prototype.some = Array.prototype.some || function(fn, bind) {
	for (var i = 0, l = this.length; i < l; i++) {
		if ((i in this) && fn.call(bind, this[i], i, this)) return true;
	}
	return false;
};

/**
 * @method
 * @see https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/every
 */
Array.prototype.every = Array.prototype.every || function(fn, bind) {
	for (var i = 0, l = this.length; i < l; i++) {
		if ((i in this) && !fn.call(bind, this[i], i, this)) return false;
	}
	return true;
};

/**
 * @method
 * @see https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/map
 */
Array.prototype.map = Array.prototype.map || function (fn, bind) {
	var results = [];
	for (var i = 0, l = this.length; i < l; i++) {
		if (i in this) results[i] = fn.call(bind, this[i], i, this);
	}
	return results;
};

/**
 * @method
 * @see https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/filter
 */
Array.prototype.filter = Array.prototype.filter || function(fn, bind) {
	var results = [];
	for (var i = 0, l = this.length; i < l; i++) {
		if ((i in this) && fn.call(bind, this[i], i, this)) results.push(this[i]);
	}
	return results;
};

/**
 * @method
 * @see https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/reduce
 */
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

/**
 * @method
 * @see https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/reduceRight
 */
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

/**
 * @method
 * @see https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/String/trim
 */
String.prototype.trim = String.prototype.trim || function() {
	// High Performance JavaScript 中描述此方法较快
	return this.replace(/^\s\s*/, "").replace(/\s\s*$/, "");
};

// 有些老页面引用了js/compact.js，其中有一个错误的Function.prototype.bind
if (!Function.prototype.bind || Function.prototype.bind === window.__hualuOldBind) {
	/**
 	 * @method
	 * @see https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Function/bind
	 */
	Function.prototype.bind = function(object) {
		var method = this;
		var args = Array.prototype.slice.call(arguments, 1);
		return function() {
			return method.apply(object, args.concat(Array.prototype.slice.call(arguments)));
		};
	};
}

/* import from D:\workhome\workspace\objectjs.org\object\src\object\core.js */ 

/**
 * @namespace
 * @name object
 */
/**@class Array*/
/**@class String*/
/**@class Function*/
var object = (function(globalHost) {

var object = function() {
};

// 获取function的name
// 判断function TEST() 是否能取到name属性来选择不同的算法函数
if ((function TEST(){}).name) {
	Function.__get_name__ = function(func) {
		return func.name;
	};
}
// IE
else {
	// IE下方法toString返回的值有可能是(开头
	var funcNameRegExp = /(?:^|\()function ([\w$]+)/;
	//Function.__get_name__((function a() {})) -> (function a(){}) -> a
	Function.__get_name__ = function(func) {
		// IE 下没有 Function.prototype.name，通过代码获得
		var result = funcNameRegExp.exec(func.toString());
		if (result) return result[1];
		return '';
	};
}

var defaultFilter = function(prop, dest, src) {
	return !(prop in dest);
};

/**
 * 为obj增加properties中的成员
 * @name object.extend
 * @param {Object} obj 被扩展的对象
 * @param {Object} properties 扩展属性的来源对象
 * @param {Boolean|Function} ov 是否覆盖obj对象中的原有成员，如果是true（默认），则覆盖，false则不覆盖原有成员
 * 		如果传入的是function，则按照function的返回值来判断是否覆盖
 * 		function的参数依次是：属性值、目标对象、源对象
 */
object.extend = function(obj, properties, ov) {
	var filter = null;
	if (typeof ov == 'function') {
		filter = ov;
	} else if (ov === true || typeof ov === 'undefined') {
	} else {
		filter = defaultFilter;
	}
	for (var property in properties) {
		if (filter && !filter(property, obj, properties)) {
			continue;
		}
		try {
            obj[property] = properties[property];
        } catch (e) {}
	}
	
	if (properties && properties.hasOwnProperty('call') && (!filter || filter(obj, properties, 'call'))) {
		obj.call = properties.call;
	}

	return obj;
};

/**
 * 浅拷贝
 * @name object.clone
 */
object.clone = function(obj) {
	var clone = {};
	for (var key in obj) clone[key] = obj[key];
	return clone;
};

/**
 * 将成员引用放到window上
 * @name object.bind
 */
object.bind = function(host) {
	object.extend(host, object);
};

object._loader = null;

return object;

})(window);

/* import from D:\workhome\workspace\objectjs.org\object\src\object\oop.js */ 

/**
 * OOP
 */
;(function(object) {

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
 * @param name 需要获取的成员
 * @param bind 如果目标成员是个函数，则使用bind进行绑定后返回，非函数忽略此参数
 */
var getter = function(name, bind) {
	var value = Object.__getattribute__(this, name);
	if (bind !== false && Class.isMethod(value)) {
		bind = bind || this;
		return value.bind(bind);
	}
	return value;
};

/**
 * propery 特性支持getter函数，用法：
 * obj.set(prop_name, value)
 * 会被放到 cls.prototype.set
 */
var setter = overloadSetter(function(prop, value) {
	if ('__setattr__' in this) {
		this.__setattr__(prop, value);
	} else {
		Object.__setattr__(this, prop, value);
	}
});

/**
 * 从类上获取成员
 * 会被放到cls.get
 * @param name 需要获取的成员
 * @param bind 如果目标成员是个函数，则使用bind进行绑定后返回，非函数忽略此参数，false则不绑定
 */
var membergetter = function(name, bind) {
	var member = Type.__getattribute__(this, name);
	if (bind !== false && Class.isMethod(member)) {
		bind = bind || this;
		return member.bind(bind);
	}
	return member;
};

/**
 * 判断是否存在成员
 * 会被放到cls.has
 */
var memberchecker = function(name) {
	if (name == '@mixins') name = '__mixins__';
	var proto = this.prototype;
	var properties = proto.__properties__;
	return (name in this || name in proto || (properties && name in properties));
};

/**
 * MyClass.set(name, value);
 * MyClass.set({name1: value1, name2: value2})
 * 会被放到 cls.set
 * 子类不会被覆盖
 */
var membersetter = overloadSetter(function(name, member) {
	// 从metaclass中获得__setattr__
	if ('__metaclass__' in this) {
		Type.__getattribute__(this.__metaclass__, '__setattr__').call(this.__metaclass__, this, name, member);
	}
	// 未设置metaclass则默认为Type
	else {
		Type.__setattr__(this, name, member);
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

/**
 * 调用cls继承链中名字为name的成员
 */
var parent = function(cls, name, args) {
	if (!name) {
		throw new Error('can not get function name when this.parent called');
	}

	// 拥有此方法的代码书写的类
	var ownCls = cls;

	// parent应该调用“代码书写的方法所在的类的父同名方法”
	// 而不是方法调用者实例的类的父同名方法
	// 比如C继承于B继承于A，当C的实例调用从B继承来的某方法时，其中调用了this.parent，应该直接调用到A上的同名方法，而不是B的。
	// 因此，这里通过hasOwnProperty，从当前类开始，向上找到同名方法的原始定义类
	while (ownCls && !ownCls.prototype.hasOwnProperty(name)) {
		ownCls = ownCls.__base__;
	}

	var base = ownCls.__base__;
	var mixins = ownCls.__mixins__;
	var member, owner;

	// 先从base中找同名func
	if (base && base.get && base.has(name)) {
		owner = base;
		member = Type.__getattribute__(base, name);
	}
	// 再从mixins中找同名func
	else if (mixins && mixins.length && mixins.some(function(mixin) {
		owner = mixin;
		return mixin.has(name);
	})) {
		member = Type.__getattribute__(owner, name);
	}

	if (!member || typeof member != 'function') {
		throw new Error('no such method in parent : \'' + name + '\'');
	} else {
		return member.apply(owner, args);
	}
};

function renameCheck(func, prop, value) {
	if (prop === '__name__' && func[prop] && func[prop] !== value) {
		if (typeof console != 'undefined' && console.warn) {
			console.warn('请不要将同一个方法赋值给多个类成员：' + func[prop] + ' --> ' + value);
		}
	}
}

/**
 * 返回一个绑定了self的instancemethod
 * 若self为false，则返回一个未绑定的方法
 * 若self为undefined，则动态采用this为self
 * 若self为true，则动态采用this为cls
 */
var instancemethod = function(func, self) {
	// 区分两种方法，用typeof为function判定并不严谨，function也可能是一个实例
	var _instancemethod;
	var im_self;

	// 意味着不绑定，传参时需要手工传im_self进去
	if (self === false) {
		_instancemethod = function(self) {
			// TODO 检测self是否是正确的类型
			return this.prototype[func.__name__].im_func.apply(this.__this__, arguments);
		}
	}
	// 绑定self，若为undefined，则在运行时使用this
	else {
		_instancemethod = function() {
			var args = [].slice.call(arguments, 0);
			// 绑定class
			if (self === true) {
				// 在class上调用
				if (typeof this == 'function') {
					im_self = this;
				}
				// 在instance上调用
				else {
					im_self = this.__class__;
				}
			} else {
				im_self = this;
			}
			args.unshift(im_self);
			return func.apply(this.__this__, args);
		};
	}
	_instancemethod.im_self = self;
	_instancemethod.__class__ = arguments.callee;
	_instancemethod.im_func = func;
	_instancemethod.__setattr__ = function(prop, value) {
		renameCheck(func, prop, value);
		this[prop] = value;
	}; // 检测的是im_func的name
	return _instancemethod;
};

var staticmethod = this.staticmethod = function(func) {
	return {
		__class__: arguments.callee,
		im_func: func,
		__setattr__: function(prop, value) {
			renameCheck(this, prop, value);
			this[prop] = value;
		}
	};
};

var classmethod = this.classmethod = function(func, isinstance) {
	var obj = {
		__class__ : arguments.callee,
		im_func : func,
		__setattr__: function(prop, value) {
			renameCheck(this, prop, value);
			this[prop] = value;
		}
	};
	return obj;
};

var property = this.property = function(fget, fset) {
	var p = {};
	p.__class__ = arguments.callee;
	p.__setattr__ = function(prop, value) {
		renameCheck(this, prop, value);
		this[prop] = value;
	}
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

/**
 * 从一个object上获取成员
 */
Object.__getattribute__ = function(obj, name) {
	var property = obj.__properties__['prop_' + name] || obj.__properties__[name];
	// property
	if (property) {
		if (property.fget) {
			return property.fget.call(obj.__this__, obj);
		}
		else {
			throw new Error('get not allowed property ' + name);
		}
	}
	// 已存在此成员
	else if (name in obj) {
		return obj[name];
	}
	// 调用getattr
	else if (obj.__getattr__) {
		return obj.__getattr__.call(obj, name);
	}
	// 无此成员，返回
	else {
		return undefined;
	}
};

/**
 * 设置一个对象的成员
 * object.__setattr__ 为兼容处理
 */
Object.__setattr__ = object.__setattr__ = function(obj, prop, value) {
	var property = null;
	if (obj.__properties__) {
		property = obj.__properties__['prop_' + prop] || obj.__properties__[prop];
	}
	// 此prop不是property，直接赋值即可。
	if (!property) {
		obj[prop] = value;
	}
	// 有fset
	else if (property.fset) {
		property.fset.call(obj.__this__, obj, value);
	}
	// 未设置fset，不允许set
	else {
		throw 'set not allowed property ' + prop;
	}
};

// 获取父类的实例，用于 cls.prototype = new parent
Object.__new__ = function(cls) {
	if (cls === Array || cls === String) return new cls;
	cls.__prototyping__ = true;
	var instance = new cls();
	delete cls.__prototyping__;
	return instance;
};

/**
 * 小写type为兼容处理
 * @class
 */
var Type = this.Type = this.type = function() {
};

Type.__class__ = Type;

/**
 * 创建一个类的核心过程
 */
Type.__new__ = function(metaclass, name, base, dict) {
	var cls = function() {
		// 通过Object.__new__获取一个空实例
		if (cls.__prototyping__) return this;

		// new OneMetaClass
		// __constructs__是Type才有的，继承于object的类没有
		if (cls.__constructs__) {
			return cls.__constructs__(arguments);
		}
		// new OneClass
		else {
			this.__class__ = cls;
			Class.initMixins(cls, this);
			var value = this.initialize? this.initialize.apply(this, arguments) : null;
			return value;
		}
	};

	/*
	 * 初始化成员
	 * 注意这里从base获取成员的时候，base有可能是object系的，也有可能是Type系的
	 */
	cls.__subclassesarray__ = [];
	cls.__subclasses__ = subclassesgetter;
	// 存储此类上的classmethod和staticmethod的名字，方便继承时赋值
	cls.__classbasedmethods__ = [];
	// cls.__module__，从loader的runtime中获取
	if (object.runtime) {
		cls.__module__ = object.runtime.stack[object.runtime.stack.length - 1].id;
	} else {
		cls.__module__ = '';
	}
	// cls.__mixin__ 为兼容
	cls.set = cls.__mixin__ = membersetter;
	cls.get = membergetter;
	cls.has = memberchecker;
	// 只有__metaclass__和__class__是指向metaclass的，其他成员都是从base继承而来。
	cls.__metaclass__ = metaclass;
	cls.__class__ = metaclass;
	// 从base继承而来
	cls.__new__ = base.__new__;
	cls.__dict__ = dict;

	// 继承于Type的类才有__constructs__
	cls.__constructs__ = base.__constructs__ || null;

	// 将base上的classmethod、staticmethod成员放到cls上
	// Object和Type上没有任何classmethod、staticmethod，无需处理
	if (base !== Object && base !== Type) {
		;(base.__classbasedmethods__ || []).forEach(function(name) {
			cls[name] = base[name];
			cls.__classbasedmethods__.push(name);
		});
	}

	cls.__constructing__ = true;

	/*
	 * 实现继承
	 */
	cls.prototype = Object.__new__(base);
	cls.prototype.constructor = cls;
	// Array / String 没有 subclass，需要先判断一下是否存在 subclassesarray
	if (base.__subclassesarray__) base.__subclassesarray__.push(cls);

	/*
	 * 实现property
	 */
	var proto = cls.prototype;
	// 有可能已经继承了base的__properties__了
	var baseProperties = proto.__properties__ || {};
	proto.__properties__ = object.extend({}, baseProperties);

	/*
	 * 同时设置cls和其prototype上的成员
	 */
	//if (base === Type) {
		//Type.__setattr__(cls, 'initialize', Type.__getattribute__(base, 'initialize'));
	//}
	Type.__setattr__(cls, '__setattr__', Type.__getattribute__(base, '__setattr__'));
	Type.__setattr__(cls, '__base__', base);
	// 支持 this.parent 调用父级同名方法
	Type.__setattr__(cls, '__this__', {
		base: base,
		parent: function() {
			// 一定是在继承者函数中调用，因此调用时一定有 __name__ 属性
			return parent(cls, arguments.callee.caller.__name__, arguments);
		}
	});

	// 正常来讲，cls是有metaclass的实例，即 OneClass = new MetaClass，class上面应该有metaclass的成员
	// 但由于js的语言特性，是无法真正的“new”出一个function的（继承于Function没用），其没有原型链
	// 因此只能考虑通过遍历将metaclass中的成员赋值到cls上，影响性能，且此类需求只在metaclass的制作过程中有，并没太大必要，比如：
	// var M = new Class(Type, {
	//   a: function() {},
	//   __new__(cls) {}, // 这个cls是M，可以通过get获取到a
	//   initialize(cls) {} // 这个cls就是生成的cls了，此是无法通过get获取到a，而python是可以的
	// });
	// 另外一个考虑，通过修改membergetter使一个class会去其metaclass中寻找成员。
	// 下面的代码是用遍历的方法使其支持的代码
	//Class.keys(metaclass).forEach(function(name) {
		//cls[name] = function() {
			//var args = Array.prototype.slice.call(arguments, 0);
			//args.unshift(cls);
			//return metaclass.prototype[name].im_func.apply(cls, args);
		//};
	//});

	/*
	 * Dict
	 */
	for (var k in dict) {
		Type.__setattr__(cls, k, dict[k]);
	}

	/*
	 * Mixin
	 */
	var mixins = cls.__mixins__;
	if (mixins) {
		mixins.forEach(function(mixin) {
			Class.keys(mixin).forEach(function(name) {
				if (cls.has(name)) return; // 不要覆盖自定义的
				var member = Type.__getattribute__(mixin, name);
				Type.__setattr__(cls, name, member);
			});
		});
	}

	/*
	 * 默认成员，若之前有定义也强制覆盖掉
	 */
	cls.prototype.get = getter;
	cls.prototype.set = setter;
	cls.prototype._set = nativesetter;

	delete cls.__constructing__;

	return cls;
};

var oopProps = ['__mixins__', '__new__', '__this__', '__base__'],
	metas = ['__new__', '__metaclass__', '__mixins__'],
	parents = ['__this__', '__base__'];
/**
 * 设置属性到类
 */
Type.__setattr__ = function(cls, name, member) {
	if (name == '@mixins') name = '__mixins__';

	
	if (oopProps.indexOf(name) != -1) {
		if (!member || (typeof member != 'object' && typeof member != 'function')) {
			return;
		}
	}
	var proto = cls.prototype,
		properties = proto.__properties__,
		subs = cls.__subclassesarray__,
		constructing = cls.__constructing__;

	// 类构建完毕后才进行set，需要先删除之前的成员
	delete cls[name];
	delete proto[name];
	delete properties[name];

	// 这里的member指向new Class参数的书写的对象/函数
	if (metas.indexOf(name) != -1) {
		if (member && (typeof member == 'object' || typeof member == 'function')) {
			cls[name] = member;
		}
	}
	// 
	else if (parents.indexOf(name) != -1) {
		cls[name] = proto[name] = member;
	}
	// 有可能为空，比如 this.test = null 或 this.test = undefined 这种写法;
	else if (member == null) {
		proto[name] = member;
	}
	// 先判断最常出现的instancemethod
	// this.a = function() {}
	else if (member.__class__ === undefined && typeof member == 'function') {
		proto[name] = instancemethod(member);
		proto[name].__setattr__('__name__', name);
		// 这样赋值__name__，确保__name__都是被赋值在开发者所书写的那个function上，能够通过arguments.callee.__name__获取到。
		member.__name__ = name;
		// 初始化方法放在cls上，metaclass会从cls上进行调用
		if (name == 'initialize') {
			cls[name] = instancemethod(member, false);
		}
	}
	// this.a = property(function fget() {}, function fset() {})
	else if (member.__class__ === property) {
		member.__setattr__('__name__', name);
		properties[name] = member;
		// 当prototype覆盖instancemethod/classmethod/staticmethod时，需要去除prototype上的属性
		proto[name] = undefined;
	}
	// 在继承的时候，有可能直接把instancemethod传进来，比如__setattr__
	else if (member.__class__ === instancemethod) {
		// 重新绑定
		proto[name] = instancemethod(member.im_func);
		// 绑定了cls的instancemethod，意味着是一个classmethod
		if (member.im_self == true) {
			cls[name] = member;
		}
	}
	// this.a = classmethod(function() {})
	else if (member.__class__ === classmethod) {
		member.__setattr__('__name__', name);
		member.im_func.__name__ = name;
		// classmethod，都绑定其class
		cls[name] = proto[name] = instancemethod(member.im_func, true);
		cls.__classbasedmethods__.push(name);
	}
	// this.a = staticmethod(function() {})
	else if (member.__class__ === staticmethod) {
		member.__setattr__('__name__', name);
		member.im_func.__name__ = name;
		cls[name] = proto[name] = member.im_func;
		cls.__classbasedmethods__.push(name);
	}
	// this.a = new Class({})
	else if (Class.instanceOf(member, Type)) {
		cls[name] = proto[name] = member;
	}
	// this.a = someObject
	else {
		proto[name] = member;
	}

	// 所有子类cls上加入
	// 在constructing时肯定没有子类，做个标记直接返回
	if (!constructing && name in cls && subs) {
		subs.forEach(function(sub) {
			// !(name in sub) 与 !name in sub 得到的结果不一样
			if (!(name in sub)) {
				Type.__setattr__(sub, name, member);
			}
		});
	}
};

/**
 * 删除类成员
 */
Type.__delattr__ = function(cls, name) {
	delete cls[name];
	delete cls.prototype[name];
	delete cls.prototype.__properties__[name];
};

/**
 * 从类上获取成员
 */
Type.__getattribute__ = function(cls, name) {
	if (name == '@mixins') {
		name = '__mixins__';
	}
	var proto = cls.prototype;
	var properties = proto.__properties__;
	var metaclass = cls.__metaclass__;
	var member;

	// 直接在自己身上找
	if (name in cls) {
		member = cls[name];
	}

	// 找property
	else if (properties && properties[name] !== undefined) {
		member = properties[name];
	}

	// 找到instancemethod
	else if (proto[name] && proto[name].__class__ == instancemethod) {
		// 对于instancemethod，需要返回重新bind的方法
		// 为保证每次都能取到相同的成员，保存在cls[name]上，下次直接就在cls上找到了
		cls[name] = member = instancemethod(proto[name].im_func, false);
	}

	// 去其metaclass中找
	// Type也要找，可以找到initialize
	else if (metaclass && (member = Type.__getattribute__(metaclass, name)) !== undefined) {
		// 将metaclass上的成员重新包装后放到cls上，需要把cls当成一个instance
		if (member.__class__ === instancemethod) {
			// 这里把cls当成一个instance了（metaclass的instance）
			// 重新绑定
			member = instancemethod(member.im_func, true);
		}
		cls[name] = member;
	}

	// 找到普通成员
	else {
		member = proto[name];
	}

	return member;
};

/**
 * new Class 或 new OneMetaClass 的入口调用函数
 * 此方法只放在Type上，可用于判断一个类是Object系的还是Type系的
 * Object要用的时候用Type.__constructs__.call(Object, arguments)调用即可
 */
Type.__constructs__ = function(args) {
	var length = args.length;
	if (length < 1) throw new Error('bad arguments');

	// name
	var name = null;

	// base
	var base = length > 1? args[0] : Object;
	if (typeof base != 'function' && typeof base != 'object') {
		throw new Error('base is not function or object');
	}
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

	// dict
	var dict = args[length - 1], factory;
	if (typeof dict != 'function' && typeof dict != 'object') {
		throw new Error('constructor is not function or object');
	}
	if (dict instanceof Function) {
		factory = dict;
		dict = {};
		factory.call(dict);
	}

	var metaclass;
	// new Class()，用class生成一个Object
	if (this === Object) {
		metaclass = dict.__metaclass__ || base.__metaclass__ || Type;
	}
	// new OneMetaClass，用this生成一个class
	else {
		metaclass = this;
	}

	// 创建&初始化
	var cls = metaclass.__new__(metaclass, name, base, dict);

	if (!cls || typeof cls != 'function') {
		throw new Error('__new__ method should return cls');
	}
	Type.__getattribute__(metaclass, 'initialize').call(metaclass, cls, name, base, dict);
	return cls;
};

Type.initialize = function() {
};

Object.__class__ = Type;

/**
 * 类的定义
 * @namespace Class
 */
var Class = this.Class = function() {
	// 通过Object调用__constructs__，获取metaclass的途径不同
	return Type.__constructs__.call(Object, arguments);
};

/**
 * mixin时调用mixin的initialize方法，保证其中的初始化成员能够被执行
 */
Class.initMixins = function(cls, instance) {
	if (!cls) {
		return;
	}
	// 初始化父类的mixin
	if (cls.__base__) {
		Class.initMixins(cls.__base__, instance);
	}
	var mixins = cls.__mixins__;
	if (mixins) {
		// 这里必须是instance.__this__，因为initialize.call调用中已经设置了this指向的是instance
		instance.__this__.mixining = true;
		for (var i = 0, l = mixins.length, mixin; i < l; i++) {
			mixin = mixins[i];
			if (mixin.prototype && typeof mixin.prototype.initialize == 'function') {
				mixin.prototype.initialize.call(instance);
			}
		}
		delete instance.__this__.mixining;
	}
	
};

/**
 * 在new Class的callback中mixin
 * var MyClass = new Class(function() {
 *	Class.mixin(this, AnotherClass);
 * })
 */
Class.mixin = function(dict, cls) {
	if (!dict || typeof dict != 'object') {
		return;
	}
	if (cls === Array) {
		cls = ArrayClass;
	} else if (cls === String) {
		cls = StringClass;
	}
	dict.__mixins__ = dict.__mixins__ || [];
	dict.__mixins__.push(cls);
};

/**
 * 是否存在property
 */
Class.hasProperty = function(obj, name) {
	return (obj && obj.__properties__) ? (name in obj.__properties__) : false;
};

/**
 * 是否存在类成员
 */
Class.hasMember = function(cls, name) {
	if (!cls) return false;
	if (name in cls.prototype) return true;
	return false;
};

/**
 * 是否是方法
 */
Class.isMethod = function(member) {
	if (typeof member == 'function') {
		if (!member.__class__
				|| member.__class__ == instancemethod
				|| member.__class__ == staticmethod
				|| member.__class__ == classmethod
		   ) {
			return true;
		}
	}
	return false;
};

/**
 * 所有properties
 */
Class.getPropertyNames = function(obj) {
	return (obj && obj.__properties__) ? Object.keys(obj.__properties__) : [];
};

/**
 * 将host注射进class，使其self指向host
 * @param cls 被注射的class
 * @param host 注射进去的对象
 * @param args 构造的参数
 * @param filter 过滤器，实现选择性注射
 */
Class.inject = function(cls, host, args, filter) {
	if (typeof cls != 'function') {
		throw new Error('bad arguments.');
	};
	var argsLen = arguments.length, p, proto, init;
	if (argsLen === 2) {
		args = [];
		filter = true;
	} else if (argsLen === 3) {
		if (Array.isArray(args)) {
			filter = true;
		} else {
			filter = args;
			args = [];
		}
	}

	host.__class__ = cls;
	proto = cls.prototype, init = proto.initialize;
	host.__properties__ = proto.__properties__;
	p = Object.__new__(cls);
	object.extend(host, p, filter);
	Class.initMixins(cls, host);
	if (typeof init == 'function') {
		init.apply(host, args);
	}
};

/**
 * 判断成员是否是一个type类型的
 */
Class.instanceOf = function(obj, func) {
	if (typeof func != 'function') {
		throw new Error('bad arguments.');
	}

	var cls;

	// 查询一个func的constructor，js中的function是没有原型继承的，只能通过递归查询。
	// 一般来说就是Type
	if (typeof obj == 'function') {
		// 遍历实例的创建者继承链，找是否与func相同
		cls = obj.__class__;
		if (cls) {
			do {
				if (cls === func) return true;
			} while (cls = cls.__base__);
		}
	}
	// 查询普通对象的constructor，可直接使用instanceof
	else {
		return obj instanceof func;
	}
	return false;
};

/**
 * 获取一个class的继承链
 */
Class.getChain = function(cls) {
	if (!cls) {
		return [];
	}
	var result = [cls];
	while (cls.__base__) {
		result.push(cls.__base__);
		cls = cls.__base__;
	}
	return result;
};

/**
 * 将一个类的所有子类形成平面数组返回
 * 会在Class.mixin中用到
 */
Class.getAllSubClasses = function(cls) {
	if (!cls || !cls.__subclassesarray__) {
		return [];
	}
	var array = cls.__subclassesarray__;
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
	if (!cls || !cls.prototype) {
		return [];
	}
	var keys = [];
	// 找到全部的，不仅仅是 hasOwnProperty 的，因此不能用Object.keys代替
	for (var prop in cls.prototype) {
    	keys.push(prop);
    }
	
	keys = keys.filter(function(name) {
		// 这3个需要过滤掉，是为了支持property加入的内置成员
		// initialize也需要过滤，当mixin多个class的时候，initialize默认为最后一个，这种行为没意义
		if ((name.indexOf('__') == 0 && name.slice(-2) == '__')) {
			return false;
		}

		if (['get', 'set', '_set', 'initialize', 'constructor'].indexOf(name) != -1) {
			return false;
		}
		
		return true;
	});
	return keys;
};

ArrayClass = createNativeClass(Array, ["concat", "indexOf", "join", "lastIndexOf", "pop", "push", "reverse", "shift", "slice", "sort", "splice", "toString", "unshift", "valueOf", "forEach", "some", "every", "map", "filter", "reduce", "reduceRight"]);
ArrayClass.prototype.length = 0;
StringClass = createNativeClass(String, ["charAt", "charCodeAt", "concat", "indexOf", "lastIndexOf", "match", "replace", "search", "slice", "split", "substr", "substring", "toLowerCase", "toUpperCase", "valueOf", "trim"]);
StringClass.prototype.length = 0;
})(object);


/* import from D:\workhome\workspace\objectjs.org\object\src\object\loader.js */ 

/*
 * 变量说明：
 * 	pkg - 未实例化的模块
 * 	module - 实例化的模块
 * 	dep - 通过toDep方法处理过的依赖信息
 * 	dependency - 字符串形式保存依赖信息
 * 	parent - 在execute阶段当前模块的调用者
 * 	owner - 在load阶段当前依赖的拥有者
 * 	name - 点号形式的模块名字
 * 	id - 路径形式的模块名字
 */

;(function(object) {

// 可以用于scheme的字符
var scheme_chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+-.';

/**
 * 在字符串url中查找target字符后，利用result对象，返回截断后的前、后字符串
 * @param {Object} result 重复利用的用于返回结果的对象（避免太多内存垃圾产生）
 * @param {String} url 需要截取的url
 * @param {String} target 截断的字符组成的字符串
 * @param {Boolean} remainFirst 是否要保留匹配的字符
 *
 * @return {Object} 形如 {got:'', remained:''}的结果对象
 */
function splitUntil(result, url, target, remainFirst) {
	var min = url.length;
	for(var i=0, len = url.length; i < len; i++) {
		if (target.indexOf(url.charAt(i)) != -1) {
			if (i < min) {
				min = i;
				break;
			}
		}
	}
	result.got = url.substring(0, min);
	result.remained = (remainFirst? url.substring(min) : url.substring(min + 1));
	return result;
}

/**
 * 解析一个url为 scheme / netloc / path / params / query / fragment 六个部分
 * @see http://docs.python.org/library/urlparse.html
 * @example 
 * http://www.renren.com:8080/home/home2;32131?id=31321321&a=1#//music/?from=homeleft#fdalfdjal
 * --> 
 * [http, www.renren.com:8080, /home/home2, 32131, id=31321321&a=1, //music/?from=homeleft#fdalfdjal]
 */
function urlparse(url, default_scheme) {
	if (typeof url != 'string') {
		return ['', '', '', '', '', ''];
	}
	var scheme = '', netloc='', path = '', params = '', query = '', fragment = '', i = 0;
	i = url.indexOf(':');
	if (i > 0) {
		if (url.substring(0, i) == 'http') {
			scheme = url.substring(0, i).toLowerCase();
			url = url.substring(i+1);
		} else {
			for (i = 0, len = url.length; i < len; i++) {
				if (scheme_chars.indexOf(url.charAt(i)) == -1) {
					break;
				}
			}
			scheme = url.substring(0, i);
			url = url.substring(i + 1);
		}
	}
	if (!scheme && default_scheme) {
		scheme = default_scheme;
	}
	var splited = {};
	if (url.substring(0, 2) == '//') {
		splitUntil(splited, url.substring(2), '/?#', true);
		netloc = splited.got;
		url = splited.remained;
	}

	if (url.indexOf('#') != -1) {
		splitUntil(splited, url, '#');
		url = splited.got;
		fragment = splited.remained;
	}
	if (url.indexOf('?') != -1) {
		splitUntil(splited, url, '?');
		url = splited.got;
		query = splited.remained;
	}
	if (url.indexOf(';') != -1) {
		splitUntil(splited, url, ';');
		path = splited.got;
		params = splited.remained;
	}
	
	if (!path) {
		path = url;
	}
	return [scheme, netloc, path, params, query, fragment];
};

/**
* 将兼容urlparse结果的url部分合并成url
*/
function urlunparse(parts) {
	if (!parts) {
		return '';
	}
	var url = '';
	if (parts[0]) url += parts[0] + '://' + parts[1];
	if (parts[1] && parts[2] && parts[2].indexOf('/') != 0) url += '/';
	url += parts[2];
	if (parts[3]) url += ';' + parts[3];
	if (parts[4]) url += '?' + parts[4];
	if (parts[5]) url += '#' + parts[5];

	return url;
};

/**
* 合并两段url
*/
function urljoin(base, url) {
	// 逻辑完全照抄python的urlparse.py

	if (!base) {
		return url;
	}

	if (!url) {
		return base;
	}

	url = String(url);
	base = String(base);

	var bparts = urlparse(base);
	var parts = urlparse(url, bparts[0]);

	// scheme
	if (parts[0] != bparts[0]) {
		return url;
	}

	// netloc
	if (parts[1]) {
		return urlunparse(parts);
	}

	parts[1] = bparts[1];

	// path
	if (parts[2].charAt(0) == '/') {
		return urlunparse(parts);
	}

	// params
	if (!parts[2] && !parts[3]) {
		parts[2] = bparts[2];
		parts[3] = bparts[3];
		if (!parts[4]) {
			parts[4] = bparts[4];
		}
		return urlunparse(parts);
	}

    var segments = bparts[2].split('/').slice(0, -1).concat(parts[2].split('/'));
	var i;

	// 确保能够生成最后的斜线
	if (segments[segments.length - 1] == '.') {
		segments[segments.length - 1] = '';
	}

	// 去掉所有'.'当前目录
	for (i = 0, l = segments.length; i < l; i++) {
		if (segments[i] == '.') {
			segments.splice(i, 1);
			i--;
		}
	}

	// 合并所有'..'
	while (true) {
		i = 1;
		n = segments.length - 1;
		while (i < n) {
			if (segments[i] == '..' && ['', '..'].indexOf(segments[i - 1]) == -1) {
				segments.splice(i - 1, 2);
				break;
			}
			i++;
		}
		if (i >= n) {
			break;
		}
	}

	if (segments.length == 2 && segments[0] == '' && segments[1] == '..') {
		segments[segments.length - 1] = '';
	}
	else if (segments.length >= 2 && segments[segments.length - 1] == '..') {
		segments.pop();
		segments.pop();
		segments.push('');
	}

	parts[2] = segments.join('/');

	return urlunparse(parts);
}

/**
 * 计算当前引用objectjs的页面文件的目录路径
 */
function calculatePageDir() {
	var loc = window['location'];
	var pageUrl = loc.protocol + '//' + loc.host + (loc.pathname.charAt(0) !== '/' ? '/' : '') + loc.pathname; 
	// IE 下文件系统是以\为分隔符，统一改为/
	if (pageUrl.indexOf('\\') != -1) {
		pageUrl = pageUrl.replace(/\\/g, '/');
	}
	var pageDir = './';
	if (pageUrl.indexOf('/') != -1) {
		// 去除文件，留下目录path
		pageDir = pageUrl.substring(0, pageUrl.lastIndexOf('/') + 1);
	}
	return pageDir;
}

/**
 * 清理路径url，去除相对寻址符号
 */
function cleanPath(path) {
	// 去除多余的/
	path = path.replace(/([^:\/])\/+/g, '$1\/');
	// 如果没有相对寻址，直接返回path
	if (path.indexOf('.') === -1) {
		return path;
	}

	var parts = path.split('/');
	// 把所有的普通var变量都写在一行，便于压缩
	var result = [];

	for (var i = 0, part, len = parts.length; i < len; i++) {
		part = parts[i];
		if (part === '..') {
			if (result.length === 0) {
				throw new Error('invalid path: ' + path);
			}
			result.pop();
		} else if (part !== '.') {
			result.push(part);
		}
	}

	// 去除尾部的#号
	return result.join('/').replace(/#$/, '');
}

/**
 * 模块
 * @class
 */
function Module(name) {
	this.__name__ = name;
}
Module.prototype.toString = function() {
	return '<module \'' + this.__name__ + '\'>';
};

/**
 * 找不到模块Error
 * @class
 */
function NoModuleError(id) {
	this.message = 'no module named ' + id;
};
NoModuleError.prototype = new Error();

/**
 * 未对模块进行依赖
 * @class
 */
function ModuleRequiredError(name, parent) {
	this.message = parent.id + ': module ' + name + ' required';
};
ModuleRequiredError.prototype = new Error();

/**
 * 循环依赖Error
 * @class
 * @param stack 出现循环依赖时的堆栈
 * @param pkg 触发了循环依赖的模块
 */
function CyclicDependencyError(stack, pkg) {
	this.runStack = stack;
	var msg = '';
	stack.forEach(function(m, i) {
		msg += m.module.id + '-->';
	});
	msg += pkg.id;
	this.message = msg + ' cyclic dependency.';
}
CyclicDependencyError.prototype = new Error();

/**
 * 普通Package
 * @class
 */
function CommonJSPackage(id, dependencies, factory) {
	Package.apply(this, arguments);
}

CommonJSPackage.prototype = new Package();

CommonJSPackage.prototype.constructor = CommonJSPackage;

CommonJSPackage.prototype.make = function(name, context, deps, runtime) {
	var exports = new Module(name);
	// 只是暂时存放，为了factory执行时可以通过sys.modules找到自己，有了返回值后，后面需要重新addModule
	runtime.modules[name] = exports;
	runtime.packages[name] = this;
	var require = this.createRequire(name, context, deps, runtime);
	var returnExports = this.factory.call(exports, require, exports, this);
	if (returnExports) {
		returnExports.__name__ = exports.__name__;
		exports = returnExports;
	}
	runtime.addModule(name, exports);
	return exports;
};

/**
 * 执行factory，返回模块实例
 * @override
 */
CommonJSPackage.prototype.execute = function(name, context, runtime) {

	// 循环引用
	// 出现循环引用但并不立刻报错，而是当作此模块没有获取到，继续获取下一个
	if (runtime.getStackItem(name)) {
		return null;
	}

	var deps = runtime.loadings[this.id].deps;

	runtime.pushStack(name, this);

	var exports = this.make(name, context, deps, runtime);

	if (name == '__main__' && typeof exports.main == 'function') {
		exports.main();
	}
	runtime.popStack();
	return exports;
};

CommonJSPackage.prototype.toDep = function(i, runtime) {
	var name = this.dependencies[i];
	// object.define中，“.”作为分隔符的被认为是ObjectDependency，其他都是CommenJSDependency
	if (name.indexOf('/') == -1 && name.indexOf('.') != -1) {
		return new ObjectDependency(name, this, runtime);
	} else {
		return new CommonJSDependency(name, this, runtime);
	}
};

/**
 * 生成require
 */
CommonJSPackage.prototype.createRequire = function(name, context, deps, runtime) {
	var loader = runtime.loader;
	var parent = this;
	var parentName = name;
	var parentContext = context;

	function require(name) {
		var index = parent.dependencies.indexOf(name);
		if (index == -1) {
			throw new ModuleRequiredError(name, parent);
		}
		var dep = deps[index];

		var exports = dep.execute(parentName, parentContext);

		if (!exports) {
			// 有依赖却没有获取到，说明是由于循环依赖
			if (parent.dependencies.indexOf(name) != -1) {
				throw new CyclicDependencyError(runtime.stack, loader.lib[dep.id]);
			} else {
				// 出错
				console.warn('Unknown Error.');
			}
		}

		return exports;
	}

	require.async = function(dependencies, callback) {
		// async可表示为一个新的入口，也需要刷新lib
		runtime.loader.buildFileLib();
		// 创建一个同目录package，保证相对依赖的正确
		var id = parent.id + '~' + new Date().getTime() + Math.floor(Math.random() * 100);
		runtime.loader.defineModule(CommonJSPackage, id, dependencies, function(require, exports, module) {
			var args = [];
			module.dependencies.forEach(function(dependency) {
				args.push(require(dependency));
			});
			callback.apply(null, args);
		});
		runtime.loadModule(id, function() {
			var newPkg = runtime.loader.lib[id];
			// 由于newPkg的id与之前的相同，load方法会覆盖掉runtime.loadings上保存的成员
			newPkg.execute(newPkg.id, context, runtime);
		});
	};

	return require;
};

/**
 * 文艺 Package
 */
function ObjectPackage(id, dependencies, factory) {
	Package.apply(this, arguments);
};

ObjectPackage.prototype = new Package();

ObjectPackage.prototype.constructor = ObjectPackage;

ObjectPackage.prototype.make = function(name, context, deps, runtime) {
	var returnExports;
	var args = [];
	var exports;

	// 将所有依赖都执行了，放到参数数组中
	deps.forEach(function(dep) {
		var depExports = dep.execute(name, context);
		if (args.indexOf(depExports) == -1) {
			args.push(depExports);
		}
	}, this); 

	// 自己
	exports = runtime.modules[name];
	if (!exports) {
		exports = new Module(name);
		// 只是暂时存放，为了factory执行时可以通过sys.modules找到自己，有了返回值后，后面需要重新addModule
		runtime.modules[name] = exports;
		runtime.packages[name] = this;
	}

	// 最后再放入exports，否则当错误的自己依赖自己时，会导致少传一个参数
	args.unshift(exports);

	if (this.factory) {
		returnExports = this.factory.apply(exports, args);
	}

	// 当有returnExports时，之前建立的空模块（即exports变量）则没有用武之地了，给出警告。
	if (returnExports) {
		// 检测是否有子模块引用了本模块
		if (exports.__empty_refs__) {
			exports.__empty_refs__.forEach(function(ref) {
				if (typeof console != 'undefined') {
					console.warn(ref + '无法正确获得' + name + '模块的引用。因为该模块是通过return返回模块实例的。');
				}
			});
		}

		returnExports.__name__ = exports.__name__;
		exports = returnExports;
	} else {
		delete exports.__empty_refs__;
	}

	runtime.addModule(name, exports);
	return exports;
};

/**
 * 执行factory，返回模块实例
 * @override
 */
ObjectPackage.prototype.execute = function(name, context, runtime) {
	var exports;
	var parent;
	var deps;

	// 循环引用
 	// 出现循环依赖时建立一个空的exports返回，待所有流程走完后会将此模块填充完整。
	if (runtime.getStackItem(name)) {
		if (!(name in runtime.modules)) {
			runtime.addModule(name, new Module(name));
			runtime.packages[name] = this;
		}
		exports = runtime.modules[name];
		parent = runtime.stack[runtime.stack.length - 1];
		// 在空的exports上建立一个数组，用来存储依赖了此模块的所有模块
		if (!exports.__empty_refs__) {
			exports.__empty_refs__ = [];
		}
		exports.__empty_refs__.push(parent.module.id);

	} else {

		deps = runtime.loadings[this.id].deps;

		runtime.pushStack(name, this);

		exports = this.make(name, context, deps, runtime);

		if (name == '__main__' && typeof exports.main == 'function') {
			exports.main();
		}

		runtime.popStack();
	}

	return exports;
};

ObjectPackage.prototype.toDep = function(index, runtime) {
	var name = this.dependencies[index];
	// object.add中，“/”作为分隔符的被认为是CommonJSDependency，其他都是ObjectDependency
	if (name.indexOf('/') != -1) {
		return new CommonJSDependency(name, this, runtime);
	} else {
		return new ObjectDependency(name, this, runtime);
	}
};

/**
 * XX Package
 */
function Package(id, dependencies, factory) {
	if (!id) return;

	this.id = id;
	this.factory = factory;
	this.dependencies = this.parseDependencies(dependencies);
}

/**
 * 尝试获取此模块的所有依赖模块，全部获取完毕后执行callback
 */
Package.prototype.load = function(runtime, callback) {
	var deps = [];
	var pkg = this;

	var loaded = -1;
	function next() {
		loaded++;
		if (loaded == pkg.dependencies.length) {
			if (callback) {
				callback();
			}
		}
	}

	this.dependencies.forEach(function(dependency, i) {
		var dep = this.toDep(i, runtime);
		deps.push(dep);
		dep.load(next);
	}, this);

	runtime.loadings[this.id].deps = deps;
	// 此时deps已经有了，确保当前pkg是网络加载完毕了，执行之前未执行的callbacks
	runtime.loadings[this.id].callbacks.forEach(function(callback) {
		callback();
	});
	runtime.loadings[this.id].callbacks = [];

	next();
};

/**
 * 获取此package产生的模块的实例
 */
Package.prototype.execute = function(name, context, runtime) {

	if (runtime.getStackItem(name)) {
		throw new CyclicDependencyError(runtime.stack);
	}

	var exports = new Module(name);
	// sys.modules
	if (this.id === 'sys') {
		exports.modules = runtime.modules;
		exports.stack = runtime.stack;
		exports.getModule = function(name) {
			return runtime.packages[name];
		};
	}

	runtime.addModule(name, exports);
	runtime.packages[name] = this;
	return exports;
};

/**
 * 处理传入的dependencies参数
 * 在parseDependencies阶段不需要根据名称判断去重（比如自己use自己），因为并不能避免所有冲突，还有循环引用的问题（比如 core use dom, dom use core）
 * @param {String} dependencies 输入
 */
Package.prototype.parseDependencies = function(dependencies) {
	if (Array.isArray(dependencies)) return dependencies;

	if (!dependencies) {
		return [];
	}

	dependencies = dependencies.trim().replace(/^,*|,*$/g, '').split(/\s*,\s*/ig);

	return dependencies;
};

function Dependency(name, owner, runtime) {
	if (!name) return;
	this.owner = owner;
	this.runtime = runtime;
	this.name = name;
}

/**
 * @param name
 * @param module
 */
function CommonJSDependency(name, owner, runtime) {
	Dependency.apply(this, arguments);

	var loader = runtime.loader;
    var info, id, context;
	var paths = loader.paths;
	var type = this.getType(name);

	// absolute id
	if (type == 'absolute') {
		id = name;
	}
	// relative id
	else if (type == 'relative') {
		info = loader.find(urljoin(urljoin(owner.id, '.'), name), paths);
		id = info.id;
		context = info.context;
	}
	// root id
	else if (type == 'root') {
		id = urljoin(Loader._pageDir, name);
	}
	// top-level id
	else {
		info = loader.find(name, paths);
		id = info.id;
		context = info.context;
	}

	this.id = id;
	this.context = context || '';
	this.type = type;
};

CommonJSDependency.prototype = new Dependency();

/**
 * 获取依赖的路径形式
 * absolute: http://xxx/abc.js
 * relative: ./abc.js
 * root: /abc.js
 * top-level: abc.js
 */
CommonJSDependency.prototype.getType = function(name) {
	if (~name.indexOf('://') || name.indexOf('//') === 0) {
		return 'absolute';
	}
	if (name.indexOf('./') === 0 || name.indexOf('../') === 0) {
		return 'relative';
	}
	if (name.charAt(0) === '/' && name.charAt(1) !== '/') {
		return 'root';
	}
	return 'top-level';
};

CommonJSDependency.prototype.constructor = CommonJSDependency;

CommonJSDependency.prototype.load = function(callback) {
	this.runtime.loadModule(this.id, callback);
};

CommonJSDependency.prototype.execute = function(parentName, parentContext) {
	var runtime = this.runtime;
	var loader = runtime.loader;
	var runtimeName;

	if (this.type == 'top-level') {
		runtimeName = this.name;

	} else if (this.type == 'relative') {
		runtimeName = this.id.slice(parentContext.length);

	} else {
		runtimeName = this.id;
	}

	// CommonJSDependency生成的name不能有.js后缀，以保持和ObjectDependency的name兼容
	// 同时，统一标准才能保证使用不同方法依赖时缓存有效
	// 比如依赖 ui.js 和 ui，若不删除扩展名会被当成两个模块导致缓存失效
	if (runtimeName.slice(-3) == '.js') {
		runtimeName = runtimeName.slice(0, -3);
	}

	var exports = runtime.modules[runtimeName];
	var pkg, deps;
	if (!exports) {
		pkg = loader.lib[this.id];
		exports = pkg.execute(runtimeName, this.context, runtime);
	}
	return exports;
};

/**
 * @param name
 * @param owner
 * @param runtime
 */
function ObjectDependency(name, owner, runtime) {
	Dependency.apply(this, arguments);

	var loader = runtime.loader;
	// 需要搜索的所有路径，runtime.moduleId是内置默认的
	var paths = runtime.path.concat([runtime.moduleId]);
	// 此依赖是否是在父模块当前目录中找到的，用于声称其name
	var isRelative = false;

	// 分别在以下空间中找：
	// 当前模块(sys.path中通过'.'定义)；
	// 全局模块(sys.path中通过'/'定义)；
	// 运行时路径上的模块(默认的)。
	var info = loader.find(name.replace(/\./g, '/'), paths, owner.id);
	var id = info.id;
	// context为id的前缀部分
	var context = info.context;
	if (context == '') {
		isRelative = true;
		context = urljoin(urljoin(owner.id, '.'), context);
	}

	// 当一个名为 a/b/c/d/e/f/g 的模块被 a/b/c/d/e/ 在 a/b/c 运行空间下通过 f.g 依赖时：
	// runtime.context: a/b/c
	// dep->name: f.g
	// dep->id: a/b/c/d/e/f/g

	// 当一个名为 a/b/c/d/e/f/g 的模块被 a/b/c/d/e/ 在 xxx/xxx 运行空间下通过 f.g 依赖时：
	// runtime.context: xxx/xxx
	// dep->name: f.g
	// dep->id: a/b/c/d/e/f/g

	// 模块name
	this.nameParts = this.name.split('.');
	// 完整模块id
	this.id = id;
	// id的前缀
	this.context = context;
	// 是否是相对依赖模块
	this.isRelative = isRelative;
};

ObjectDependency.prototype = new Dependency();

ObjectDependency.prototype.constructor = ObjectDependency;

ObjectDependency.prototype.load = function(callback) {
	var runtime = this.runtime;
	var loader = runtime.loader;
	var parts = this.nameParts;

	var loaded = -1;
	function next() {
		loaded++;
		if (loaded == parts.length) {
			if (callback) callback();
		}
	}

	/**
	 * 依次获取当前模块的每个部分
	 * 如a.b.c，依次获取a、a.b、a.b.c
	 */
	parts.forEach(function(part, i) {
		var id, info;

		if (i == parts.length - 1) {
			id = this.id;
		} else {
			// 先用最短的名字查找，确保能找到所有的可能
			info = loader.find(urljoin(this.context, parts.slice(0, i + 1).join('/')));
			id = info.id;
			// 没找到，用最后才能查找到的文件名生成临时模块，确保后续手工定义的模块能够在临时模块前被找到。
			if (!info.found) {
				id = id + '/index.js';
				loader.definePrefix(id);
			}
		}
		runtime.loadModule(id, next);
	}, this);

	next();
};

ObjectDependency.prototype.execute = function(parentName, parentContext) {
	var dep = this;
	var runtime = this.runtime;
	var loader = runtime.loader;
	var context = this.context || '';
	var parts = this.nameParts;
	// prefix 为name的前缀，通过父name获得
	var prefix, point;
	if (this.isRelative) {
		point = parentName.lastIndexOf('.');
		if (point == -1) {
			prefix = '';
		} else {
			prefix = parentName.slice(0, point);
		}
	} else {
		prefix = '';
	}
	var pName = prefix;
	var name;

	var rootName = (prefix? prefix + '.' : '') + parts[0];
	var id, pkg, exports;

	/**
	 * 依次获取当前模块的每个部分
	 * 如a.b.c，依次获取a、a.b、a.b.c
	 */
	for (var i = 0, l = parts.length, part; i < l; i++) {
		part = parts[i];

		name = (pName? pName + '.' : '') + part;

		if (!(name in runtime.modules)) {
			if (i == parts.length - 1) {
				id = dep.id;
			} else {
				id = loader.find(urljoin(context, parts.slice(0, i + 1).join('/'))).id;
			}
			pkg = loader.lib[id];
			exports = pkg.execute(name, context, runtime);
			runtime.setMemberTo(pName, part, exports);
		}
		pName = name;
	}

	return runtime.modules[rootName];

};

/**
 * Loader运行时，每一个use、execute产生一个
 */
function LoaderRuntime(moduleId) {

	/**
	 * 此次use运行过程中用到的所有module
	 */
	this.modules = {};

	/**
	 * 此次use运行过程中用到的所有package
	 */
	this.packages = {};

	/**
	 * load阶段所有模块的集合
	 */
	this.loadings = {};

	/**
	 * 模块的依赖路径的栈，检测循环依赖
	 */
	this.stack = [];

	/**
	 * 当使用相对依赖时，子模块被处理完毕时，其父模块可能还未处理完毕
	 * 导致无法立刻将此子模块的引用赋予其父模块
	 * 此变量用于存储父模块与其子模块的映射关系，在父模块初始化完毕后再将自模块赋予自己。
	 */
	this.members = {};
	
	/**
	 * 运行入口模块的路径
	 */
	this.moduleId = moduleId;

	/**
	 * sys.path，在创建实例时应该同loader.paths合并
	 */
	this.path = [''];
}

/**
 * 加入一个module
 */
LoaderRuntime.prototype.addModule = function(name, exports) {
	exports = exports || new Module(name);
	this.modules[name] = exports;

	// 已获取到了此host的引用，将其子模块都注册上去。
	var members = this.members[name];
	if (members) {
		members.forEach(function(member) {
			this.modules[name][member.id] = member.value;
		}, this);
	}

	return exports;
};

LoaderRuntime.prototype.loadModule = function(id, callback) {
	var runtime = this;
	var loader = this.loader;

	// 说明之前已经触发过load了
	if (id in this.loadings) {
		// 已经加载完成，有deps了，直接返回
		if (this.loadings[id].deps) {
			callback();
		}
		// 还在加载中，将callback存储起来
		else {
			this.loadings[id].callbacks.push(callback);
		}
		return;
	}

	this.loadings[id] = {
		deps: null,
		callbacks: []
	};

	var pkg = loader.lib[id];

	if (!pkg) {
		throw new NoModuleError(id);
	}

	function fileDone() {
		var id = pkg.id;
		var file = pkg.file;
		// 重新读取pkg，之前的pkg只是个占位
		pkg = loader.lib[id];

		// 加载进来的脚本没有替换掉相应的模块，文件有问题。
		if (!pkg || !pkg.factory) {
			throw new Error(file + ' do not add ' + id);
		}
		pkg.load(runtime, callback);
	}

	// file
	if (pkg.file) {
		Loader.loadScript(pkg.file, fileDone, true);

	// Already define
	} else {
		pkg.load(this, callback);
	}
};

LoaderRuntime.prototype.getStackItem = function(id) {
	var result;
	this.stack.some(function(m) {
		if (m.id == id) {
			result = m;
			return true;
		}
	});
	return result;
};

LoaderRuntime.prototype.pushStack = function(id, pkg) {
	this.stack.push({
		id: id,
		module: pkg
	});
};

LoaderRuntime.prototype.popStack = function() {
	this.stack.pop();
};

/**
 * 为名为host的module设置member成员为value
 */
LoaderRuntime.prototype.setMemberTo = function(host, member, value) {

	// 向host添加member成员
	if (host) {
		// 已存在host
		if (this.modules[host]) {
			this.modules[host][member] = value;
		}
		// host不存在，记录在members对象中
		else {
			if (!this.members[host]) this.members[host] = [];
			this.members[host].push({
				id: member,
				value: value
			});
		}
	}
};

/**
 * object的包管理器
 */
function Loader(base) {
	this.useCache = true;
	this.anonymousModuleCount = 0;
	this.base = base || '/'; // base必须只读
	this.lib = {};
	this.paths = [this.base]; // CommonJSDependency从这里获取paths

	this.scripts = document.getElementsByTagName('script');

	this.lib['sys'] = new Package('sys');
}

// 用于保存url与script节点的键值对
Loader._urlNodeMap = {};

// global pageDir
Loader._pageDir = null;

/**
 * 通过一个src，获取对应文件的绝对路径
 * 例如：http://hg.xnimg.cn/a.js -> http://hg.xnimg.cn/a.js
 *       file:///dir/a.js -> file:///dir/a.js
 *       in http://host/b/c/d/e/f.html, load ../g.js -> http://host/a/b/d/g.js
 *       in file:///dir/b/c/d/e/f.html, load ../g.js -> file:///dir/a/b/d/g.js
 *
 * @param src 地址
 */
Loader.getAbsolutePath = function(src) {

	// 如果本身是绝对路径，则返回src的清理版本
	if (src.indexOf('://') != -1 || src.indexOf('//') === 0) {
		return cleanPath(src);
	}

	if (!Loader._pageDir) {
		Loader._pageDir = calculatePageDir();
	}
	return cleanPath(Loader._pageDir + src);
};

/**
 * 将name中的“.”换成id形式的“/”
 * @param name
 * @param withExt 确保扩展名为.js
 */
Loader.prototype.name2id = function(name, withExt) {
	if (typeof name != 'string') return '';

	var id, ext, extdot;

	if (name.indexOf('/') == -1) {
		id = name.replace(/\./g, '/');
	} else {
		id = name;
	}

	// name有可能是个目录
	if (withExt && name.lastIndexOf('/') != name.length - 1) {
		extdot = id.lastIndexOf('.');
		if (extdot != -1) {
			ext = id.slice(extdot);
		} else {
			ext = '';
		}

		if (!ext) {
			id += '.js';
		}
	}

	return id;
};

/**
 * 从paths中寻找符合此id的模块
 * @param id
 * @param paths
 * @param base
 */
Loader.prototype.find = function(id, paths, base) {
	var loader = this;
	var ext = id.slice(id.lastIndexOf('.'));

	if (!paths) {
		paths = this.paths;
	}

	var foundId = null;
	var foundContext = null;

	// 尝试查找不同的扩展名
	function find(id) {
		var pkg;

		if (pkg = loader.lib[id] || loader.lib[id + '.js'] || loader.lib[id + '/index.js']) {
			return pkg.id;
		}
	}

	// 尝试在path中查找
	function findIn(path) {
		var tempId = find(urljoin(urljoin(base, path), id));
		if (tempId) {
			foundId = tempId;
			foundContext = path;
			return true;
		}
	};

	paths.some(findIn);

	return {
		found: !!foundId,
		id: foundId || id,
		context: foundContext
	};
};

/**
 * 查找页面中的标记script标签，更新lib
 */
Loader.prototype.buildFileLib = function() {

	var scripts = this.scripts;

	for (var i = 0, script, names, src, l = scripts.length; i < l; i++) {
		script = scripts[i];
		src = script.getAttribute('data-src');
		names = script.getAttribute('data-module');
		if (!names || !src) continue;
		names.trim().split(/\s+/ig).forEach(function(name) {
			this.defineFile(urljoin(this.base, this.name2id(name, true)), src);
		}, this);
	}
};

/**
 * 加载一个script, 执行callback
 * 有冲突检测，如果连续调用两次loadScript同一src的话，则第二个调用会等第一个完毕后直接执行callback，不会加载两次。
 *
 * @param src 地址
 * @param callback callback函数
 */
Loader.loadScript = function(src, callback, useCache) {
	if (!src || typeof src != 'string') {
		throw new Error('bad arguments.');
	}
	src = src.trim();
	var absPath = Loader.getAbsolutePath(src);
	if (useCache) {
		var urlNodeMap = Loader._urlNodeMap, scriptNode = urlNodeMap[absPath];
		if (scriptNode) {
			if (scriptNode.loading) {
				// 增加一个回调即可
				scriptNode.callbacks.push(callback);
			} else {
				callback(scriptNode);
			}
			return;
		}
	}

	var ele = document.createElement('script');
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
		for (var i = 0, l = ele.callbacks.length; i < l; i++) {
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

	if (useCache) { 
		// 利用绝对路径来存键值对，key为绝对路径，value为script节点
		urlNodeMap[absPath] = ele;
	}
};

/**
 * 根据src属性，删除一个script标签，并且清除对应的键值对缓存记录
 * @param src 路径
 */
Loader.prototype.removeScript = function(src) {
	if (!src || typeof src != 'string') {
		throw new Error('bad arguments.');
	}
	src = src.trim();
	// 转换为绝对路径
	var absPath = Loader.getAbsolutePath(src);
	// 获取节点
	var urlNodeMap = Loader._urlNodeMap, scriptNode = urlNodeMap[absPath];
	// 如果节点存在，则删除script，并从缓存中清空
	if (scriptNode) {
		delete urlNodeMap[absPath];
		if (scriptNode.parentNode) {
			scriptNode.parentNode.removeChild(scriptNode);
		}
		scriptNode = null;
	}
};

/**
 * 建立一个runtime
 */
Loader.prototype.createRuntime = function(id) {
	var runtime = new LoaderRuntime(id);
	runtime.loader = this;
	runtime.path = runtime.path.concat(this.paths);
	return runtime;
};

/**
 * 定义一个prefix module
 */
Loader.prototype.definePrefix = function(id) {
	if (!id || typeof id != 'string') return;

	// 只要存在就返回
	if (id in this.lib) return;

	this.lib[id] = new Package(id);
};

/**
 * 定义一个file module，供异步加载
 */
Loader.prototype.defineFile = function(id, src) {
	if (!id || typeof id != 'string') return;

	// 存在factory或file则返回
	if (id in this.lib && (this.lib[id].factory || this.lib[id].file)) return;

	var pkg = new Package(id);
	pkg.file = src;
	this.lib[id] = pkg;
};

/**
 * 定义一个普通module
 */
Loader.prototype.defineModule = function(constructor, id, dependencies, factory) {
	if (arguments.length < 4) return;

	// 不允许重复添加
	if (id in this.lib && this.lib[id].factory) return;

	var pkg = new constructor(id, dependencies, factory);
	this.lib[id] = pkg;
};

/**
 * @param name
 */
Loader.prototype.getModule = function(name) {
	var id = this.find(this.name2id(name)).id;
	if (id in this.lib) return this.lib[id];
	return null;
};

/**
 * 提供一个方法，用于在jsp中预定义异步加载的类，而不是每一个都需要script标签
 */
Loader.prototype.predefine = function(moduleName, src, base) {
	if (!moduleName || !src) {
		return;
	}
	base = base || '';
	moduleName.trim().split(/\s+/ig).forEach(function(name) {
		name = base + name;
		this.defineFile(urljoin(this.base, this.name2id(name, true)), src);
	}, this);
}

/**
 * @param name
 * @param dependencies
 * @param factory
 */
Loader.prototype.define = function(name, dependencies, factory) {
	if (typeof name != 'string') return;

	if (typeof dependencies == 'function') {
		factory = dependencies;
		dependencies = [];
	}

	var id = urljoin(this.base, this.name2id(name, true));
	this.defineModule(CommonJSPackage, id, dependencies, factory);
};

/**
 * @param name
 * @param dependencies
 * @param factory
 */
Loader.prototype.add = function(name, dependencies, factory) {
	if (typeof name != 'string') return;

	if (typeof dependencies == 'function') {
		factory = dependencies;
		dependencies = [];
	}

	var id = urljoin(this.base, this.name2id(name, true));
	this.defineModule(ObjectPackage, id, dependencies, factory);
};

/**
 * 移除模块的定义
 * @param name 需要移除模块的name
 * @param all 是否移除其所有子模块
 */
Loader.prototype.remove = function(name, all) {
	var id = urljoin(this.base, this.name2id(name, true));

	delete this.lib[id];

	// 只有目录才可能递归删除
	if (all) {
		// 确保all时是个目录
		name = name.charAt(name.length - 1) == '/'? name : name + '/';
		id = urljoin(this.base, this.name2id(name));
		Object.keys(this.lib).forEach(function(key) {
			if (key.indexOf(id) == 0) {
				delete this.lib[key];
			}
		}, this);
	}
};

/**
 * 清空模块
 */
Loader.prototype.clear = function() {
	for (var prop in this.lib) {
		if (prop != 'sys') {
			this.remove(prop);
		}
	}
};

/**
 * execute
 * @param name 执行的入口模块名称
 */ 
Loader.prototype.execute = function(name) {
	if (!name || typeof name != 'string') {
		return;
	}
	this.buildFileLib();

	var info = this.find(this.name2id(name));
	var id = info.id;
	var context = info.context;

	var runtime = this.createRuntime(id, context);
	object.runtime = runtime;
	runtime.loadModule(id, function() {
		var pkg = runtime.loader.lib[id];
		pkg.execute('__main__', context, runtime);
	});
	object.runtime = null;
};

/**
 * use
 * @param dependencies 用逗号分隔开的模块名称列表
 * @param factory dependencies加载后调用，将module通过参数传入factory，第一个参数为exports，后面的参数为每个module的不重复引用，顺序排列
 */
Loader.prototype.use = function(dependencies, factory) {
	if (!factory || typeof factory != 'function') {
		return;
	}
	this.buildFileLib();

	var id = '__anonymous_' + this.anonymousModuleCount + '__';
	this.anonymousModuleCount++;

	this.defineModule(CommonJSPackage, id, dependencies, function(require, exports, module) {
		var args = [];
		module.dependencies.forEach(function(dependency) {
			dep = require(dependency);
			if (args.indexOf(dep) == -1) {
				args.push(dep);
			}
		});

		if (factory.length == args.length + 1) {
			if (typeof console != 'undefined') {
				console.warn('object.use即将不再支持第一个exports参数，请尽快删除。');
			}
			args.unshift(exports);
		}
		factory.apply(null, args);
	});

	var runtime = this.createRuntime(id);

	object.runtime = runtime;
	runtime.loadModule(id, function() {
		var pkg = runtime.loader.lib[id];
		pkg.execute('__main__', '', runtime);
	});
	object.runtime = null;
};

object.Loader = Loader;
object.NoModuleError = NoModuleError;
object.ModuleRequiredError = ModuleRequiredError;

})(object);

/* import from D:\workhome\workspace\objectjs.org\object\src\object\object-loader.js */ 

/**
 * 创建object的loader
 */
;(function(object) {

var loader = new object.Loader('http://pub.objectjs.org/object/');

object._loader = loader;

object.add = loader.add.bind(loader);
object.predefine = loader.predefine.bind(loader);
object.define = loader.define.bind(loader);
object.remove = loader.remove.bind(loader);
object.use = loader.use.bind(loader);
object.execute = loader.execute.bind(loader);
object.addPath = function(path) {
	loader.paths.push(path);
};

/**
 * 增加window模块，如果其他模块中需要使用或修改window的相关内容，必须显式的依赖window模块
 */
object.define('./window.js', 'sys', function(require) {
	var sys = require('sys');
	var dom = sys.modules['dom'];
	if (dom) dom.wrap(window);
	return window;
});

object.define('./loader.js', function(require, exports) {
	exports.Loader = object.Loader;
});

})(object);

/* import from D:\workhome\workspace\objectjs.org\object\src\ua\index.js */ 

object.add('ua/index.js', function(exports) {

	/**
	 * 将字符串转化为数字的方法
	 *
	 * @param s 带转化的字符串
	 */
	var numberify = this.numberify = function(s) {
		if(!s || typeof s != 'string') {
		
		}
		var c = 0;
		// convert '1.2.3.4' to 1.234
		return parseFloat(s.replace(/\./g, function() {
			return (c++ === 0) ? '.' : '';
		}));
	};

	//将方法挂接在ua模块上，便于单元测试
	this.__detectUA = detectUA;

	this.ua = {};
	var o = detectUA(navigator.userAgent);
	object.extend(this.ua, o);

	/**
	 * 检测浏览器内核和版本的主方法
	 */
	function detectUA(ua) {
		if(!ua && typeof ua != 'string') {
			ua = navigator.userAgent;
		}
		var m, m2;
		var o = {}, core, shell;

		// check IE
		if (!~ua.indexOf('Opera') && (m = ua.match(/MSIE\s([^;]*)/)) && m[1]) {

			// IE8: always IE8, with Trident 4
			// IE9: same as documentMode, with Trident 5
			// IE10: same as documentMode, with Trident 6
			if ((m2 = ua.match(/Trident\/([\d\.]*)/)) && m2[1]) {
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
			if ((m = ua.match(/AppleWebKit\/([\d\.]*)/)) && m[1]) {
				o[core = 'webkit'] = numberify(m[1]);

			// Gecko
			// 避免Opera userAgent：Mozilla/5.0 (Windows NT 5.1; U; en; rv:1.8.1) Gecko/20061208 Firefox/5.0 Opera 11.11
			} else if (!~ua.indexOf('Opera') && (m = ua.match(/Gecko/))) {
				o[core = 'gecko'] = 0; // Gecko detected, look for revision
				if ((m = ua.match(/rv:([\d\.]*)/)) && m[1]) {
					o[core] = numberify(m[1]);
				}

			// Presto
			// ref: http://www.useragentstring.com/pages/useragentstring.php
			} else if ((m = ua.match(/Presto\/([\d\.]*)/)) && m[1]) {
				o[core = 'presto'] = numberify(m[1]);
			}

			// check shell

			// Chrome
			if ((m = ua.match(/Chrome\/([\d\.]*)/)) && m[1]) {
				o[shell = 'chrome'] = numberify(m[1]);

			// Safari
			} else if ((m = ua.match(/\/([\d\.]*)( Mobile\/?[\w]*)? Safari/)) && m[1]) {
				o[shell = 'safari'] = numberify(m[1]);
			} else if (/\/[\d\.]* \(KHTML, like Gecko\) Safari/.test(ua)) {
				o[shell = 'safari'] = undefined;

			// Firefox
			// 避免Opera userAgent：Mozilla/5.0 (Windows NT 5.1; U; en; rv:1.8.1) Gecko/20061208 Firefox/5.0 Opera 11.11
			} else if (!~ua.indexOf('Opera') && (m = ua.match(/Firefox\/([\d\.]*)/)) && m[1]) {
				o[shell = 'firefox'] = numberify(m[1]);

			// Opera
			} else if ((m = ua.match(/Opera\/([\d\.]*)/)) && m[1]) {
				o[shell = 'opera'] = numberify(m[1]); // Opera detected, look for revision

				if ((m = ua.match(/Opera\/.* Version\/([\d\.]*)/)) && m[1]) {
					o[shell] = numberify(m[1]);
				}
			} else if ((m = ua.match(/Opera ([\d\.]*)/)) && m[1]) {
				core = 'presto';
				o[shell = 'opera'] = numberify(m[1]);
			}
		}

		o.shell = shell;
		o.core = core;
		return o;
	}
});


/* import from D:\workhome\workspace\objectjs.org\object\src\ua\extra.js */ 

object.add('ua/extra.js', 'sys', function(exports, sys) {

	var uamodule = sys.modules['ua'];

	if (uamodule) {
		//将detectUAExtra挂接在模块上，用于在外部进行单元测试
		this.__detectUAExtra = detectUAExtra;
		var o = detectUAExtra();
		object.extend(uamodule.ua, o);
	}

	/**
	 * 检测UAExtra的主方法
	 *
	 * @param {String} ua userAgent字符串
	 */
	function detectUAExtra(ua) {
		if(!ua && typeof ua != 'string') {
			ua = navigator.userAgent;
		}
		/* Copy start here */

		var m, shell, o = {}, numberify = uamodule.numberify;
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
		} else if (m = ua.match(/Maxthon|MAXTHON/) || getExternal('max_version')) {
			// issue: Maxthon 3.x in IE-Core cannot be recognised and it doesn't have exact version number
			// but other maxthon versions all have exact version number
			shell = 'maxthon';
			try {
				o[shell] = numberify(window.external['max_version']);
			} catch(ex) {
				o[shell] = 0;
			}
		// TT
		} else if (m = ua.match(/TencentTraveler\s([\d\.]*)/)) {
			o[shell = 'tt'] = m[1] ? numberify(m[1]) : 0;
		// TheWorld
		// 无法识别世界之窗极速版
		} else if (m = ua.match(/TheWorld/)) {
			o[shell = 'theworld'] = 3; // issue: TheWorld 2.x cannot be recognised, so if recognised default set verstion number to 3
		// Sogou
		} else if (m = ua.match(/SE\s([\d\.]*)/)) {
			o[shell = 'sogou'] = m[1] ? numberify(m[1]) : 0;
		// QQBrowser
		} else if (m = ua.match(/QQBrowser.([\d\.]*)/)) {
			o[shell = 'qqbrowser'] = m[1] ? numberify(m[1]) : 0;
		}

		// If the browser has shell(no matter IE-core or Webkit-core or others), set the shell key
		shell && (o.shell = shell);
		
		/* Copy end here */
		return o;
	}
});

/* import from D:\workhome\workspace\objectjs.org\object\src\ua\os.js */ 

object.add('ua/os.js', 'sys', function(exports, sys) {

var uamodule = sys.modules['ua'];

/**
 * 由于需要先替换下划线，与ua模块中的numberify不同，因此这里再定义此方法
 */
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
	object.extend(exports, o);
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

/**
 * 传入ua，便于模拟ua字符串进行单元测试
 * @see http://forums.precentral.net/palm-pre-pre-plus/277613-webos-2-1-user-agent.html
 * @see http://www.developer.nokia.com/Community/Wiki/User-Agent_headers_for_Nokia_devices
 */
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
	var supportOrientation = typeof window.orientation != 'undefined' ? true : false;
	if(supportOrientation) {
		if(window.innerWidth != undefined) {
			//通过屏幕的高度和宽度的值大小，来判断是横向还是纵向
			//如果是宽度大于高度，则是landscape，否则是profile
			o.orientation = window.innerWidth > window.innerHeight ? 'landscape' : 'profile';
		} else {
			o.orientation = window.screen.width > window.screen.height ? 'landscape' : 'profile';
		}
	} else {
		o.orientation = 'unknown';
	}

	return o;
}
});


/* import from D:\workhome\workspace\objectjs.org\object\src\ua\flashdetect.js */ 

object.add('ua/flashdetect.js', function(exports) {

/**
* getFlashVersionv Flash Player version detection http://stauren.net
* released under the MIT License:
* http://www.opensource.org/licenses/mit-license.php
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

/* import from D:\workhome\workspace\objectjs.org\object\src\string.js */ 

object.add('./string.js', function(exports) {

/**
 * 模板
 */
this.substitute = function() {
	return Mustache.to_html.apply(null, arguments);
};

/**
* 转换为驼峰式
*/
this.camelCase = function(str) {
	return str.replace(/-\D/g, function(match){
		return match.charAt(1).toUpperCase();
	});
};

/**
* 转换为减号(-)分隔式
*/
this.hyphenate = function(str) {
	return str.replace(/[A-Z]/g, function(match){
		return ('-' + match.charAt(0).toLowerCase());
	});
};

/**
* 转换为首字母大写
*/
this.capitalize = function(str) {
	return str.replace(/\b[a-z]/g, function(match){
		return match.toUpperCase();
	});
};

/**
* 清空字符串左右两端的空白
*/
this.trim = function(str) {
	return (str || '').replace(/^\s+|\s+$/g, '');
};

/**
* 清空字符串左端的空白
*/
this.ltrim = function(str) {
	return (str || '').replace(/^\s+/ , '');
};

/**
* 清空字符串右端的空白
*/
this.rtrim = function(str) {
	return (str || '').replace(/\s+$/ , '');
};

/**
* 字符长度（包含中文）
*/
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

/* import from D:\workhome\workspace\objectjs.org\object\src\for-jxn\events.js */ 

object.define('./events.js', 'ua', function(require, exports) {

var ua = require('ua');

/**
 * 在Safari3.0(Webkit 523)下，preventDefault()无法获取事件是否被preventDefault的信息
 * 这里通过一个事件的preventDefault来判断类似情况
 * _needWrapPreventDefault用于在wrapPreventDefault中进行判断
 */
var _needWrapPreventDefault = (function() {
	if (document.createEvent) {
		var event = document.createEvent('Event');
		event.initEvent(type, false, true);

		if (event.preventDefault) {
			event.preventDefault();
			// preventDefault以后返回不了正确的结果
			return !(event.getPreventDefault? event.getPreventDefault() : event.defaultPrevented);
		} 
		// 没有preventDefault方法，则必然要wrap
		else {
			return true;
		}
	}
	return false;
})();

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
 * addEvent和removeEvent的第三个参数有特殊意义：
 * 第0位：捕获阶段与冒泡阶段的标志，1为捕获阶段，0为冒泡阶段
 * 第1位：事件是否锁定的标志，1为锁定不允许清除，0为可以清除
 */
/** 是否不允许移除事件的标志位 */
this.HOLD = 2;
/** 事件处理函数是否是捕获阶段的标志位 */
this.CAPTURE = 1;

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

/**
 * safari 3.0在preventDefault执行以后，defaultPrevented为undefined，此处包装一下
 */
this.wrapPreventDefault = function(e) {
	if (_needWrapPreventDefault) {
		var oldPreventDefault = e.preventDefault;
		e.preventDefault = function() {
			this.defaultPrevented = true;
			oldPreventDefault.apply(this, arguments);
		}
	}
}

// native events from Mootools
var NATIVE_EVENTS = {
	click: 2, dblclick: 2, mouseup: 2, mousedown: 2, contextmenu: 2, //mouse buttons
	mousewheel: 2, DOMMouseScroll: 2, //mouse wheel
	mouseover: 2, mouseout: 2, mousemove: 2, selectstart: 2, selectend: 2, //mouse movement
	keydown: 2, keypress: 2, keyup: 2, //keyboard
	orientationchange: 2, // mobile
	touchstart: 2, touchmove: 2, touchend: 2, touchcancel: 2, // touch
	gesturestart: 2, gesturechange: 2, gestureend: 2, // gesture
	focus: 2, blur: 2, change: 2, reset: 2, select: 2, submit: 2, paste: 2, oninput: 2, //form elements
	load: 2, unload: 1, beforeunload: 2, resize: 1, move: 1, DOMContentLoaded: 1, readystatechange: 1, //window
	error: 1, abort: 1, scroll: 1 //misc
};

/**
 * 判断某一个nativeEvent是不是适合Node
 * 在IE下，如果Node不支持nativeEvent类型的事件监听，则nativeFireEvent.call(node, eventName, event)会报错
 * 目前每一种Node支持的类型都已经在dom模块中进行了指定，详情请参见src/dom/index.js中元素的nativeEventNames属性
 */
function isNativeEventForNode(node, type) {
	// 如果有nativeEventNames属性，说明是包装过的元素
	if (node.nativeEventNames) {
		// 判断此节点是否支持此事件类型的触发
		return node.nativeEventNames.indexOf(type) != -1;
	}
	// 如果没有包装过，则继续按照默认的进行（可能会有错误发生）
	return type in NATIVE_EVENTS;
}

/**
 * 事件系统
 */
this.Events = new Class(function() {
	
	/**
	 * 在标准浏览器中使用的是系统事件系统，无法保证nativeEvents在事件最后执行。
     * 需在每次addEvent时，都将nativeEvents的事件删除再添加，保证在事件队列最后，最后才执行。
	 *
	 * @param type 事件类型
	 */
	function moveNativeEventsToTail(self, type) {
		var boss = self.__boss || self;
		if (self.__nativeEvents && self.__nativeEvents[type]) {
			// 删除之前加入的
			boss.removeEventListener(type, self.__nativeEvents[type].run, false);
			// 重新添加到最后
			boss.addEventListener(type, self.__nativeEvents[type].run, false);
		}
	};

	/**
	 * IE下处理事件执行顺序
	 */
	function handle(self, type) {
		var boss = self.__boss || self;
		boss.attachEvent('on' + type, function(event) {
			event = exports.wrapEvent(event || window.event);
			var funcs = self.__eventListeners? self.__eventListeners[type] : null;
			if (funcs) {
				funcs = funcs.slice(0);
				funcs.forEach(function(func) {
					try {
						func.call(self, event);
					} catch(e) {
						handleEventErrorForIE(e);
					}
				});
				funcs = null;
			}
			var natives = self.__nativeEvents? self.__nativeEvents[type] : null;
			if (natives) {
				natives = natives.slice(0);
				natives.forEach(function(func) {
					func.call(self, event);
				});
				natives = null;
			}
		});
	}

	/**
	 * 不同浏览器对onhandler的执行顺序不一样
	 * 	  IE：最先执行onhandler，其次再执行其他监听函数
	 * 	  Firefox：如果添加多个onhandler，则第一次添加的位置为执行的位置
	 * 	  Chrome ：如果添加多个onhandler，最后一次添加的位置为执行的位置
	 * 
	 * Chrome的做法是符合标准的，因此在模拟事件执行时按照Chrome的顺序来进行
	 *
	 * 保证onxxx监听函数的正常执行，并维持onxxx类型的事件监听函数的执行顺序
	 *
	 * @param type 事件类型
	 */
	function addOnHandlerAsEventListener(self, type) {
		// 只有DOM节点的标准事件，才会由浏览器来执行标准方法
		if (type in NATIVE_EVENTS && self.nodeType == 1) return;
		var typeLower = typeof type == 'string' ? type.toLowerCase() : type;

		var boss = self.__boss || self;
		var onhandler = self['on' + typeLower], onhandlerBak = boss['__on' + typeLower];
		// 如果onHandler为空，并且已经添加过，则需要remove
		if (!onhandler && onhandlerBak) {
			boss.removeEventListener(type, onhandlerBak, false);
			boss['__on' + typeLower] = null;
		}
		// 如果onHandler不为空，则需要判断是否已经添加过
		else if (onhandler && onhandler != onhandlerBak) {
			// 如果已经添加过，则先去除原先添加的方法，再将新的方法加入，并更新备份信息
			boss.removeEventListener(type, onhandlerBak, false);
			// 将新的事件监听方法加入列表
			boss.addEventListener(type, onhandler, false);
			// 将新的事件监听方法备份
			boss['__on' + typeLower] = onhandler;
		}
	}
	
	/**
	 * IE下保证onxxx事件处理函数正常执行
	 * @param type 事件类型
	 */
	function attachOnHandlerAsEventListener(self, type) {
		// 只有DOM节点的标准事件，并且此标准事件能够在节点上触发，才会由浏览器来执行标准方法
		if (self.nodeType == 1 && isNativeEventForNode(self, type) && isNodeInDOMTree(self)) return;

		var typeLower = typeof type == 'string' ? type.toLowerCase() : type;

		if (!self.__eventListeners) {
			self.__eventListeners = {};
		}
		if (!self.__eventListeners[type]) {
			self.__eventListeners[type] = [];
		}
		var funcs = self.__eventListeners[type];
		var l = funcs.length;
		var onhandler = self['on' + typeLower], onhandlerBak = self['__on' + typeLower];
		// 如果onHandler为空，并且已经添加过，则需要remove
		if (!onhandler && onhandlerBak) {
			for (var i = 0; i < l; i++) {
				if (funcs[i] == onhandlerBak) {
					funcs.splice(i, 1);
					break;
				}
			}
			self['__on' + typeLower] = null;
		}
		// 如果onHandler不为空，则需要判断是否已经添加过
		else if (onhandler && onhandler != onhandlerBak) {
			// 如果已经添加过，则先去除原先添加的方法，再将新的方法加入，并更新备份信息
			for (var i = 0; i < l; i++) {
				if (funcs[i] == onhandlerBak) {
					funcs.splice(i, 1);
					break;
				}
			}
			// 将新的事件监听方法加入列表
			funcs.push(onhandler);
			// 将新的事件监听方法备份
			self['__on' + typeLower] = onhandler;
		}
	}

	/**
	 * 判断节点是否是DOM树中的节点
	 *
	 * 在IE下，如果不是DOM树中的节点，标准事件的onxxx监听不会触发
	 * 因此在fireEvent时需要判断当前节点是否在DOM树中
	 */
	function isNodeInDOMTree(node) {
		if (!node) {
			return false;
		}
		var parent = node.parentNode;
		var top = document.documentElement;
		while (parent) {
			if (parent == top) {
				return true;
			}
			parent = parent.parentNode;
		}
		return false;
	}

	/**
	 * 在preventDefault方法不靠谱的情况下，如果事件由浏览器自动触发，则需要在第一个事件处理函数中将preventDefault覆盖
	 *
	 * 此方法在事件列表最前面（在onxxx之前）添加一个专门处理preventDefault的事件监听函数
	 */
	function insertWrapPreventDefaultHandler(boss, type, cap) {
		if (!boss['__preEventAdded_' + type]) {
			// 标识该事件类型的preventDefault已经包装过了
			boss['__preEventAdded_' + type] = true;
			// 如果有onxxx类型的处理函数，则也暂时去除，待包装函数添加完以后，再添加回去
			if (boss['on' + type]) {
				boss['__on' + type] = boss['on' + type];
				boss['on' + type] = null;
			}
			// 添加事件监听
			boss.addEventListener(type, function(event) {
				exports.wrapPreventDefault(event);
			}, cap);
			// 把onxxx监听函数添加回去
			if (boss['__on' + type]) {
				boss['on' + type] = boss['__on' + type];
				boss['__on' + type] = null;
				try {
					delete boss['__on' + type];
				} catch (e) {}
			}
		}
	}

	// 判断是否有console.error
	var hasConsoleError = typeof console != 'undefined' && console.error;

	// 用于存储错误详细信息，每次使用前清空，避免产生过多的内存垃圾
	var detail = [];

	/**
	 * 处理IE下事件处理函数中的错误，在有console.error的情况下将错误信息打印至控制台
	 * @param {Error} e 错误对象
	 */
	function handleEventErrorForIE(e) {
		if (hasConsoleError) {
			detail.length = 0;
			for(var prop in e) {
				detail.push(prop + ":" + e[prop]);
				detail.push(", ");
			}
			if (detail.length > 0) {
				detail.pop();
			}
			console.error(e, detail.join(""));
		}
	}

	/**
	 * 初始化方法，主要是初始化__eventListener和__nativeEvents以及__boss等属性
	 */
	this.initialize = function(self) {
		if (!self.addEventListener) {
			// 在一些情况下，你不知道传进来的self对象的情况，不要轻易的将其身上的__eventListeners清除掉
			if (!self.__eventListeners) {
				/** 用于存储事件处理函数的对象 */
				self.__eventListeners = {};
			}
			if (!self.__nativeEvents) self.__nativeEvents = {};
		}
		// 自定义事件，用一个隐含div用来触发事件
		if (!self.addEventListener && !self.attachEvent) {
			self.__boss = document.createElement('div');
		}
	};

	/**
	* 添加事件
	* @method
	* @param type 事件名
	* @param func 事件回调
	* @param cap 冒泡
	*/
	this.addEvent = document.addEventListener? function(self, type, func, cap) {
		var boss = self.__boss || self;

		if (cap === null) cap = false;
		// 取二进制的第0位
		cap = !!(cap & exports.CAPTURE);

        if (!ua.ua.ie && (type == 'mouseenter' || type == 'mouseleave')) {
			var innerFunc = func;
			func = function(event) {
                // 如果正在事件代理，则由dom/delegate方法判断是否应该执行代理方法
                if (innerFunc.delegating) {
                    innerFunc.call(self, event);
                    return;
                }
				var p = event.relatedTarget;
				while (p && p != self) {
                    try {
                        p = p.parentNode;
                    } catch (e) {
                        p = self;
                    }
                }
				if (p !== self && innerFunc) {
                    innerFunc.call(self, event);
                }
			};
			func.innerFunc = innerFunc;
			type = (type == 'mouseenter' ? 'mouseover' : 'mouseout');

			// 备份func，以便能够通过innerFunc来删除func
			if (!self.__eventListeners) {
				self.__eventListeners = {};
			}
			if (!self.__eventListeners[type]) {
				self.__eventListeners[type] = [];
			}
			self.__eventListeners[type].push(func);
        }
        
		// 如果需要包装preventDefault方法，则在事件处理函数最前面添加一个简单的事件监听
		// 该事件监听只负责包装event，使其preventDefault正确执行
		if (_needWrapPreventDefault) {
			insertWrapPreventDefaultHandler(boss, type, cap);
		}

		//处理onxxx类型的事件处理函数
		addOnHandlerAsEventListener(self, type);

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

		attachOnHandlerAsEventListener(self, type);
		funcs.push(func);

	};

	/**
	* 添加系统事件，保证事件这些事件会在注册事件调用最后被执行
	* @method
	* @param type 事件名
	* @param func 事件回调
	*/
	this.addNativeEvent = document.addEventListener? function(self, type, func) {
		var boss = self.__boss || self;
		if (_needWrapPreventDefault) {
			insertWrapPreventDefaultHandler(boss, type, false);
		}
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
	* @method
	* @param type 事件名
	* @param func 事件回调
	* @param cap 冒泡
	*/
	this.removeEvent = document.removeEventListener? function(self, type, func, cap) {
		var boss = self.__boss || self;
		// 取二进制的第0位
		cap = !!(cap & exports.CAPTURE);

		if (!ua.ua.ie && type == 'mouseleave') {
			type = 'mouseout';
			if (self.__eventListeners && self.__eventListeners[type]) {
				var funcs = self.__eventListeners[type];
				for (var i = 0, current, l = funcs.length; i < l; i++) {
					current = funcs[i];
					if (current.innerFunc === func) {
						boss.removeEventListener(type, current, cap);
						funcs.splice(i, 1);
						break;
					}
				}
			}
		} else {
			boss.removeEventListener(type, func, cap);
		}
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
	* obj.fireEvent('name', {
	* data: 'value'
	* });
	* @method
	* @param type 事件名
	* @param eventData 扩展到event对象上的数据
	*/
	this.fireEvent = document.dispatchEvent? function(self, type, eventData) {
		if (!ua.ua.ie) {
            if (type == 'mouseleave') {
                type = 'mouseout';
            } else if (type == 'mouseenter') {
                type = 'mouseover';
            }
        }
		//fireEvent之前仍然需要检查onxxx类型的事件处理函数
		addOnHandlerAsEventListener(self, type);
		var boss = self.__boss || self;

		var event = document.createEvent('Event');
		event.initEvent(type, false, true);
		object.extend(event, eventData);

		exports.wrapPreventDefault(event);

		// 火狐下通过dispatchEvent触发事件，在事件监听函数中抛出的异常都不会在控制台给出
		// see https://bugzilla.mozilla.org/show_bug.cgi?id=503244
		// see http://code.google.com/p/fbug/issues/detail?id=3016
		boss.dispatchEvent(event);
		return event;
	} : function(self, type, eventData) {
		if (!eventData) eventData = {};

		// 如果是DOM节点的标准事件，并且该事件能够在节点上由浏览器触发，则由浏览器处理onxxx类型的事件处理函数即可
		// see http://js8.in/731.html
		if (self.nodeType == 1 && isNativeEventForNode(self, type)) {
			var event = exports.wrapEvent(document.createEventObject());
			object.extend(event, eventData);

			// 判断节点是否是加入DOM树的节点
			if (isNodeInDOMTree(self)) {
				// 如果节点在放入DOM树之前调用过addEvent，则标准事件的处理函数onxxx将会被备份
				// 如果在备份之后，将节点插入DOM树，此时标准事件会自动调用onxxx，而onxxx已经备份过一次了
				// 所以在fireEvent之前，需要先检查一下列表中是否已经添加过onxxx的备份，如果添加过，需要删除
				var onhandlerBak = self['__on' + type];
				var funcs = self.__eventListeners[type];
				if (onhandlerBak && funcs) {
					for (var i = 0, l = funcs.length; i < l; i++) {
						if (funcs[i] == onhandlerBak) {
							funcs.splice(i, 1);
							break;
						}
					}
					self['__on' + type] = null;
				}

				if (self._oldFireEventInIE) {
					self._oldFireEventInIE('on' + type, event);
					return event;
				} else {
					if (typeof console != 'undefined') {
						console.warn('请使用dom.wrap方法包装对象以添加事件处理函数');
					}
				}
			}
		}

		attachOnHandlerAsEventListener(self, type);
		var event = exports.wrapEvent(eventData);

		var funcs = self.__eventListeners[type];
		if (funcs) {
			funcs = funcs.slice(0);
			for (var i = 0, j = funcs.length; i < j; i++) {
				if (funcs[i]) {
					try {
						funcs[i].call(self, event, true);
					} catch(e) {
						handleEventErrorForIE(e);
					}
				}
			}
			funcs = null;
		}

		var natives = self.__nativeEvents[type];
		if (natives) {
			natives = natives.slice(0);
			natives.forEach(function(func) {
				func.call(self, event);
			});
			natives = null;
		}

		return event;
	};
});

});

/* import from D:\workhome\workspace\objectjs.org\object\src\dom\index.js */ 

object.define('dom/index.js', 'ua, events, string, net', function(require, exports, module) {

var ua = require('ua'),
    events = require('events'),
    string = require('string'),
    net = require('net');

window.UID = 1;
var storage = {};

var get = function(uid) {
	return (storage[uid] || (storage[uid] = {}));
};

var $uid = this.$uid = (window.ActiveXObject) ? function(item){
	if (item === undefined || item === null) return null;
	return (item.uid || (item.uid = [window.UID++]))[0];
} : function(item){
	if (item === undefined || item === null) return null;
	return item.uid || (item.uid = window.UID++);
};

$uid(window);
$uid(document);

function doScrollLeft() {
	if (window.__domLoaded) {
		runHooks();
		return;
	}
	if (!document.documentElement || !document.documentElement.doScroll) {
		return;
	}

	try {
		document.documentElement.doScroll("left");
	} catch(e) {
		setTimeout(doScrollLeft, 1);
		return;
	}

	doDomReady();
}

function doCheckReadyState() {
	var timer = null;
	timer = setInterval(function() {
		if (/loaded|complete/.test(document.readyState)) {
			clearInterval(timer);
			doDomReady();
		}
	}, 1); 
}

function doDomReady() {
	if (!window.__domLoaded) {
		window.__domLoaded = true;
	}
	runHooks();
}

if (!window.__domLoaded && !window.__domreadyAdded) {
	window.__domreadyAdded = true;
	window.__domLoaded = false;
	window.__domloadHooks = [];

	if (document.addEventListener) {
		document.addEventListener('DOMContentLoaded', function() {
			document.removeEventListener('DOMContentLoaded', arguments.callee, false);
			window.__domLoaded = true;
		}, false);
	} else if (window.attachEvent) {
		// 确保在onload之前调用
		document.attachEvent("onreadystatechange", function() {
			if (document.readyState === "complete") {
				document.detachEvent("onreadystatechange", arguments.callee);
				doDomReady();
			}
		});
		window.attachEvent("onload", doDomReady);
		tryDomReady();
	}
}

function tryDomReady() {
	if (ua.ua.webkit && ua.ua.webkit < 525) {
		doCheckReadyState();
	} else if (ua.ua.ie) {
		doScrollLeft();
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
	if (typeof callback != 'function') {
		return;
	}
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

// 在IE下如果重新设置了父元素的innerHTML导致内部节点发生变化
// 则再次获取内部节点时，所有的原始类型数据（例如String/Boolean/Number）都会保留，所有的引用类型数据（例如Function/Object）都会丢失
// 如果将是否包装过的标识设置为true，在IE下将会出现元素包装过但是没有包装类的引用类型成员的情况
// 因此将包装的标识用空对象代替
// 具体示例请参见单元测试：test/unit/modules/dom/dom-usage.js: dom.wrap error in IE when parent.innerHTML changed
var WRAPPED = {};

/**
 * 包装一个元素，使其拥有相应的Element包装成员
 * 比如 div 会使用 Element 进行包装
 * form 会使用 FormElement 进行包装
 * input / select 等会使用 FormItemElement 进行包装
 * 包装后的节点成员请参照相应的包装类成员
 * @param node 一个原生节点
 */
var wrap = this.wrap = function(node) {
	if (!node) return null;

	if (Array.isArray(node)) {
		return new exports.Elements(node);
	} else {
		// 已经wrap过了
		if (node._wrapped) return node;
		if (ua.ua.ie && node.fireEvent) {
			node._oldFireEventInIE = node.fireEvent;
		}

		var wrapper;
		if (node === window) {
			wrapper = exports.Window;
		} else if (node === window.document) {
			wrapper = exports.Document;
		} else if (node.nodeType === 1) {
			wrapper = getWrapper(node.tagName);
		} else {
			return node;
		}

		// 尽早的设置_wrapped，因为在wrapper的initialize中可能出现递归调用（FormElement/FormItemElement）
		// 为了解决IE的bug，必须设置成引用类型的数据，而不能是原始类型的数据
		node._wrapped = WRAPPED;

		$uid(node);

		// 为了解决子类property覆盖父类instancemethod/classmethod等的问题，需要将property同名的prototype上的属性改为undefined
		// Class.inject对node赋值时，会将undefined的值也进行赋值，而innerHTML、value等值，不能设置为undefined
		Class.inject(wrapper, node, function(prop, dest, src) {
			// dest原有的属性中，function全部覆盖，属性不覆盖已有的
			if (typeof src[prop] != 'function') {
				return (!(prop in dest));
			} else {
				return true;
			}
		});

		return node;
	}
};

/**
 * 通过selector获取context作用域下的节点集合
 * dom.Elements包装后的节点数组拥有相应最小Element的统一调用方法
 * 比如 forms = dom.getElements('form'); 'send' in forms // true
 * @param selector 一个css selector
 * @param context 一个节点
 * @returns {dom.Elements}
 */
this.getElements = function(selector, context) {
	if (!selector || typeof selector != 'string') {
		return null;
	}
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

	return new exports.Elements(eles, wrapper);
};

/**
 * 通过selector获取context作用域下的第一个节点
 * @param selector 一个css selector
 * @param context 一个节点
 * @returns 一个包装后的结点
 */
this.getElement = function(selector, context) {
	if (!selector || typeof selector != 'string') {
		return null;
	}
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
 * @param ele script元素
 */
var eval_inner_JS = this.eval_inner_JS = function(ele) {
	if (!ele) {
		return;
	}
	if (typeof ele == 'string') {
		var node = document.createElement('div');
		// <div>&nbsp;</div> is for IE
		node.innerHTML = '<div>&nbsp;</div> ' + ele;
		ele = node;
	}
	var js = [];
	if (ele.nodeType == 11) { // Fragment
		for (var i = 0, l=ele.childNodes.length, current; i < l; i++) {
			current = ele.childNodes[i];
			if (current.tagName && current.tagName.toUpperCase() == 'SCRIPT') {
				js.push(current);
			} else if (current.nodeType === 1) {
				var subScripts = current.getElementsByTagName('script');
				for(var j = 0, subLength = subScripts.length; j < subLength; j++) {
					js.push(subScripts[j]);
				}
			}
		}
	} else if (ele.nodeType == 1) { // Node
		if (ele.tagName && ele.tagName.toUpperCase() == 'SCRIPT') {
			js.push(ele);
		} else {
			js = ele.getElementsByTagName('script');
		}
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
				var div = document.createElement('div');
				div.innerHTML = __inner_js_out_put.join('');
				while(div.firstChild) {
					tmp.appendChild(div.firstChild);
				}
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
// 检测一下是否支持利用selectionStart获取所选区域的光标位置
var _supportSelectionStart = 'selectionStart' in document.createElement('input');

var nativeproperty = function() {
	var prop = property(function(self) {
        var attr = prop.__name__;
        attr = attr.replace(/^prop_/, '');
		return self[attr];
	}, function(self, value) {
        var attr = prop.__name__;
        attr = attr.replace(/^prop_/, '');
		self._set(attr, value);
	});
	return prop;
};

var attributeproperty = function(defaultValue, attr) {
	var prop = property(function(self) {
		if (!attr) attr = prop.__name__.toLowerCase();
        attr = attr.replace(/^prop_/, '');
		var value = self.getAttribute(attr);
		return value != null && value !== 'undefined' ? value : defaultValue;
	}, function(self, value) {
		if (!attr) attr = prop.__name__.toLowerCase();
        attr = attr.replace(/^prop_/, '');
		// Webkit 534.12中，value为null时，属性会被设置成字符串 null
		if (!value) value = '';
		self.setAttribute(attr, value);
	});
	return prop;
};

/**
 * 通过一个字符串创建一个Fragment
 * @param str html字符串
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
 */
this.ElementClassList = new Class(Array, function() {

	this.initialize = function(self, ele) {
		self.length = 0; // for Array

		self._ele = ele;
		self._loadClasses();
	};

	this._loadClasses = function(self) {
    	self._classes  = self._ele.className.replace(/^\s+|\s+$/g, '').split(/\s+/);
	};

	/**
	 * 切换className
	 * @param token class
	 */
	this.toggle = function(self, token) {
		if (!token) {
			throw new Error('token不能为空');
			return;
		}
		if (typeof token != 'string') return;
		if (self.contains(token)) self.remove(token);
		else self.add(token);
	};

	/**
	 * 增加一个class
	 * @param token class
	 */
	this.add = function(self, token) {
		if (!token) {
			throw new Error('token不能为空');
			return;
		}
		if (typeof token != 'string') return;
		if (!self.contains(token)) {
			self._ele.className = (self._ele.className + ' ' + token).trim(); // 根据规范，不允许重复添加
			self._loadClasses();
		}
	};

	/**
	 * 删除class
	 * @param token class
	 */
	this.remove = function(self, token) {
		if (!token) {
			throw new Error('token不能为空');
			return;
		}
		if (typeof token != 'string') return;
		//为了避免出现classAdded中remove class的情况，增加处理
		if (!self.contains(token)) return;
		self._ele.className = self._ele.className.replace(new RegExp(token.trim(), 'i'), '').trim();
		self._loadClasses();
	};

	/**
	 * 检测是否包含该class
	 * @param token class
	 */
	this.contains = function(self, token) {
		if (!token) {
			throw new Error('token不能为空');
			return false;
		}
		if (typeof token != 'string') return false;
		if (self._classes.indexOf(token) != -1) return true;
		else return false;
	};

	/**
	 * 返回此下标的class
	 * @param {int} i 下标
	 */
	this.item = function(self, i) {
		return self._classes[i] || null;
	};

	this.toString = function (self) {
		return self._ele.className;
	};

});

/**
 * 每一个待封装DOM元素都包含的事件
 */
var basicNativeEventNames = ['click', 'dblclick', 'mouseup', 'mousedown', 'contextmenu',
		'mouseover', 'mouseout', 'mousemove', 'selectstart', 'selectend', 'keydown', 'keypress', 'keyup']
/**
 * 普通元素的包装
 */
this.Element = new Class(function() {

	Class.mixin(this, events.Events);

	this.nativeEventNames = basicNativeEventNames;

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
			self.classList = new exports.ElementClassList(self);
		}
		self.delegates = {};
	};

	/**
	 * 控制显示隐藏
	 */
	this.prop_hidden = _supportHidden? nativeproperty() : property(function(self) {
		return self.style.display == 'none';
	}, function(self, value) {
		if (value == true) {
			if (self.style.display !== 'none') self.__oldDisplay = self.style.display;
			self.style.display = 'none';
		} else {
			self.style.display = self.__oldDisplay || '';
		}
	});

	/**
	 * 从dom读取数据
	 * @param property 数据key
	 * @param defaultValue 若没有，则返回此默认值
	 */
	this.retrieve = function(self, property, defaultValue){
		var storage = get(self.uid);
		if (!(property in storage) && defaultValue !== undefined) storage[property] = defaultValue;
		return storage[property];
	};

	/**
	 * 存储数据至dom
	 * @param property 数据key
	 * @param value 数据值
	 */
	this.store = function(self, property, value){
		var storage = get(self.uid);
		storage[property] = value;
		return self;
	};

	/**
	 * 事件代理
	 * @param selector 需要被代理的子元素selector
	 * @param type 事件名称
	 * @param callback 事件回调
	 * @param option 事件的冒泡/捕获阶段，是否lock的组合标识
	 */
	this.delegate = function(self, selector, type, fn, option) {

		function wrapper(e) {
			var ele = e.srcElement || e.target;
			do {
				if (ele && exports.Element.get('matchesSelector')(ele, selector)) fn.call(wrap(ele), e);
			} while((ele = ele.parentNode));
		}

		var key = selector + '_' + type;
		if (!self.delegates) {
			self.delegates = {};
		}
		if (!(key in self.delegates)) {
			self.delegates[key] = [];
		}
		self.delegates[key].push({
			wrapper: wrapper,
			fn: fn
		});

        wrapper.delegating = true;
		self.addEvent(type, wrapper, option);
	};

	/**
	 * 事件代理
	 * @param selector 需要被代理的子元素selector
	 * @param type 事件名称
	 * @param callback 事件回调
	 * @param option 事件的冒泡/捕获阶段，是否lock的组合标识
	 */
	this.undelegate = function(self, selector, type, fn, option) {

		var key = selector + '_' + type;
		if (!self.delegates) {
			self.delegates = {};
		}
		// 没有这个代理
		if (!(key in self.delegates)) return;

		self.delegates[key].forEach(function(item) {
			if (item.fn === fn) {
				self.removeEvent(type, item.wrapper, option);
				return;
			}
		});
	};

	/**
	 * html5 matchesSelector api
	 * 检测元素是否匹配selector
	 * @param selector css选择符
	 */
	this.matchesSelector = function(self, selector) {
		if (self != document && !self.parentNode) {
			return false;
		}
		return Sizzle.matches(selector, [self]).length > 0;
	};

	/**
	 * 获取元素上通过 data- 前缀定义的属性值
	 * @param data name
	 * @return data value
	 */
	this.getData = function(self, name) {
		return self.getAttribute('data-' + name);
	};

    this.setData = function(self, name, value) {
        return self.setAttribute('data-' + name, value);
    };

	/**
	 * 设置元素的innerHTML
	 * @param str html代码
	 */
	this.setHTML = function(self, str) {
		self.set('innerHTML', str);
	};

	/**
	 * @borrows dom.Element.setHTML
	 */
	this.setContent = function(self, str) {
		self.setHTML(str);
	};

	/**
	 * 根据选择器返回第一个符合selector的元素
	 * @param selector css选择符
	 */
	this.getElement = function(self, selector) {
		return exports.getElement(selector, self);
	};

	/**
	 * 根据选择器返回数组
	 * @param selector css选择符
	 */
	this.getElements = function(self, selector) {
		return exports.getElements(selector, self);
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
	 * @param el 被添加的元素
	 * @param where {'bottom'|'top'|'after'|'before'} 添加的位置
	 */
	this.grab = function(self, el, where) {
		inserters[where || 'bottom'](el, self);
		return self;
	};

	/**
	 * @param el 被添加的元素
	 * @param where {'bottom'|'top'|'after'|'before'} 添加的位置
	 */
	this.inject = function(self, el, where) {
		inserters[where || 'bottom'](self, el);
		return self;
	};

	/**
	 * 获取第一个符合selector的前兄弟节点
	 *
	 * @param selector css选择符
	 */
	this.getPrevious = function(self, selector) {
		var matchesSelector = selector ? exports.Element.get('matchesSelector') : null;
		var element = self;
		while(element = element.previousSibling) {
			// 注释节点
			if (element.nodeType != 1) {
				continue;
			}
			if (!matchesSelector || matchesSelector(element, selector)) {
				return wrap(element);
			}
		}
		return null;
	};

	/**
	 * 获取符合selector的所有前兄弟节点
	 *
	 * @param selector css选择符
	 */
	this.getAllPrevious = function(self, selector) {
		var matchesSelector = selector ? exports.Element.get('matchesSelector') : null;
		var result = [];
		var element = self;
		while(element = element.previousSibling) {
			// 注释节点
			if (element.nodeType != 1) {
				continue;
			}
			if (!matchesSelector || matchesSelector(element, selector)) {
				result.push(wrap(element));
			}
		}
		return result;
	};

	/**
	 * 获取第一个符合selector的后兄弟节点
	 *
	 * @param selector css选择符
	 */
	this.getNext = function(self, selector) {
		var matchesSelector = selector ? exports.Element.get('matchesSelector') : null;
		var element = self;
		while(element = element.nextSibling) {
			// 注释节点
			if (element.nodeType != 1) {
				continue;
			}
			if (!matchesSelector || matchesSelector(element, selector)) {
				return wrap(element);
			}
		}
		return null;
	};

	/**
	 * 获取所有符合selector的后兄弟节点列表
	 *
	 * @param selector css选择符
	 */
	this.getAllNext = function(self, selector) {
		var matchesSelector = selector ? exports.Element.get('matchesSelector') : null;
		var result = [];
		var element = self;
		while(element = element.nextSibling) {
			// 注释节点
			if (element.nodeType != 1) {
				continue;
			}
			if (!matchesSelector || matchesSelector(element, selector)) {
				result.push(wrap(element));
			}
		}
		return result;
	};

	/**
	 * 获取第一个符合selector的子节点
	 *
	 * @param selector css选择符
	 */
	this.getFirst = function(self, selector) {
		var matchesSelector = selector ? exports.Element.get('matchesSelector') : null;
		var childrens = self.childNodes, l = childrens.length;
		for (var i = 0, element; i < l; i++) {
			element = childrens[i];
			if (element.nodeType != 1) {
				continue;
			}
			if (!matchesSelector || matchesSelector(element, selector)) {
				return wrap(element);
			}
		}
		return null;
	};

	/**
	 * 获取最后一个符合selector的子节点
	 *
	 * @param selector css选择符
	 */
	this.getLast = function(self, selector) {
		var matchesSelector = selector ? exports.Element.get('matchesSelector') : null;
		var childrens = self.childNodes, l = childrens.length;
		for (var i = l - 1, element; i >= 0 ; i--) {
			element = childrens[i];
			if (element.nodeType != 1) {
				continue;
			}
			if (!matchesSelector || matchesSelector(element, selector)) {
				return wrap(element);
			}
		}
		return null;
	};

	/**
	 * 查找符合selector的父元素
	 *
	 * @param selector css选择符
	 */
	this.getParent = function(self, selector) {
		if (!selector) return wrap(self.parentNode);

		var matchesSelector = exports.Element.get('matchesSelector');
		var element = self;
		do {
			if (matchesSelector(element, selector)) return wrap(element);
		} while ((element = element.parentNode));
		return null;
	};
	
	/**
	 * 查找符合selector的所有父元素
	 *
	 * @param selector css选择符
	 */
	this.getParents = function(self, selector) {
		var matchesSelector = selector ? exports.Element.get('matchesSelector') : null;
		var result = [];
		var element = self;
		while(element = element.parentNode) {
			// 注释节点
			if (element.nodeType != 1) continue;
			if (!matchesSelector || matchesSelector(element, selector)) {
				result.push(wrap(element));
			}
		}
		return result;
	};

	/**
	 * 获取所有符合selector的兄弟节点列表
	 *
	 * @param selector css选择符
	 */
	this.getSiblings = function(self, selector) {
		return self.getAllPrevious(selector).concat(self.getAllNext(selector));
	};

	/**
	 * 获取所有符合selector的孩子节点列表
	 *
	 * @param selector css选择符
	 */
	this.getChildren = function(self, selector) {
		var matchesSelector = selector ? exports.Element.get('matchesSelector') : null;
		var childrens = self.childNodes, l = childrens.length, result = [];
		for (var i = 0, element; i < l ; i++) {
			element = childrens[i];
			if (element.nodeType != 1) {
				continue;
			}
			if (!matchesSelector || matchesSelector(element, selector)) {
				result.push(wrap(element));
			}
		}
		return result;
	};

	/**
	 * 添加className
	 * @param name
	 */
	this.addClass = function(self, name) {
		if (!name) {
			return;
		}
		self.classList.add(name);
	};

	/**
	 * 移除className
	 * @param name
	 */
	this.removeClass = function(self, name) {
		if (!name) {
			return;
		}
		self.classList.remove(name);
	};

	/**
	 * 切换className
	 * @param name
	 */
	this.toggleClass = function(self, name) {
		if (!name) {
			return;
		}
		self.classList.toggle(name);
	};

	/**
	 * 检查是否拥有className
	 * @param name
	 */
	this.hasClass = function(self, name) {
		if (!name) {
			return false;
		}
		return self.classList.contains(name);
	};

	// opacity属性的辅助内容，参考Mootools
	var html = document.documentElement;
	var floatName = (html.style.cssFloat == null) ? 'styleFloat' : 'cssFloat',
		hasOpacity = (!ua.ua.ie && html.style.opacity != null),
		hasFilter = (html.style.filter != null),
		reAlpha = /alpha\(opacity=([\d.]+)\)/i;

	/**
	 * 透明度属性设置
	 */
	this.prop_opacity = property(function(self) {
		if (hasOpacity) {
			return self.style.opacity;
		} else if (hasFilter) {
			var filter = self.style.filter || self.currentStyle.filter;
			if (filter) opacity = filter.match(reAlpha);
			return (opacity == null || filter == null) ? 1 : (opacity[1] / 100);
		} else {
			return self.retrieve('opacity');
		}
	}, function(self, opacity) {
		if (hasOpacity) {
			self.style.opacity = opacity;
		} else if (hasFilter) {
			if (!self.currentStyle || !self.currentStyle.hasLayout) self.style.zoom = 1;
			opacity = parseInt(opacity * 100);
			if (opacity > 100) {
				opacity = 100;
			} else if (opacity < 0) {
				opacity = 0;
			}
			
			var opacityStr = opacity == 100 ? '' : 'alpha(opacity=' + opacity + ')';
			var filter = self.style.filter || self.currentStyle.filter || '';
			self.style.filter = reAlpha.test(filter) ? filter.replace(reAlpha, opacityStr) : filter + opacityStr;
		} else {
			self.store('opacity', opacity);
			self.style.visibility = opacity > 0 ? 'visible' : 'hidden';
		}
	});

	/**
	 * 设置inline style
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
     * 获取元素的属性值
     *
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
                return value;
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
            return value;
        }
    };

	/**
	 * 移除自己
	 */
	this.dispose = function(self) {
		return (self.parentNode) ? self.parentNode.removeChild(self) : self;
	};
	
    // 默认display为block的元素
    var blockElements = 'address blockquote div dl fieldset form h1 h2 h3 h4 h5 h6 hr noframes noscript ol p pre table ul center dir isindex menu'.split(' ');

	/**
	 * 隐藏一个元素
	 */
	this.hide = function(self) {
        self.setData('old-display', self.getStyle('display'));
		self.style.display = 'none';
	};

	/**
	 * 显示一个元素
	 */
	this.show = function(self) {
        // 已经显示
        if (self.getStyle('display') != 'none') {
            return;
        }

        // 备份的值不是none
        var display = self.getData('old-display');
        if (display && display != 'none') {
            self.style.display = display;
            return;
        }

        // 没有在css级别进行设置
        self.style.display = '';
        if (self.getStyle('display') != 'none') {
            return;
        }

        // 只能用默认display样式了
        if (blockElements.indexOf(self.get('tagName').toLowerCase()) != -1) {
            self.style.display = 'block';
        } else {
            self.style.display = 'inline';
        }
	};

	/**
	 * 切换显示
	 */
	this.toggle = function(self) {
		if (self.getStyle('display') == 'none') self.show();
		else self.hide();
	};

	/**
	 * 通过字符串设置此元素的内容
	 * 为兼容HTML5标签，IE下无法直接使用innerHTML
	 */
	this.prop_innerHTML = property(null, function(self, html) {
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
	this.prop_tagName = property(function(self) {
		return self.tagName.toUpperCase();
	});

	/**
	 * 通过一个字符串创建一个包装后的dom节点
	 * 以下元素无法被处理哦：
	 * html/head/body/meta/link/script/style
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

    /**
     * 获取元素的具体位置信息
     * 此方法来自网络，需要参考标准获取方法和其他框架内容，再完善 
     * @return 形如{x:xxx, y:xxx}的位置信息对象，x是横向坐标，y是纵向坐标
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
 * img元素的包装
 */
this.ImageElement = new Class(exports.Element, function() {

	this.nativeEventNames = basicNativeEventNames.concat(['error', 'abort']);

	// 获取naturalWidth和naturalHeight的方法
	// http://jacklmoore.com/notes/naturalwidth-and-naturalheight-in-ie/
	function _getNaturalSize(img) {
		// 参考jQuery
		var anotherImg = new Image();
		anotherImg.src = img.src;
		return {
			width : anotherImg.width,
			height : anotherImg.height
		};

		/**
		 * 在IE下得不到原来的尺寸
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
		*/
	};

	this.prop_naturalWidth = property(function(self) {
		if (_supportNaturalWH) {
			return self.naturalWidth;
		} else {
			return _getNaturalSize(self).width;
		}
	});

	this.prop_naturalHeight = property(function(self) {
		if (_supportNaturalWH) {
			return self.naturalHeight;
		} else {
			return _getNaturalSize(self).height;
		}
	});

});

/**
 * form元素的包装
 */
this.FormElement = new Class(exports.Element, function() {

	this.nativeEventNames = basicNativeEventNames.concat(['reset', 'submit']);

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

				// 傲游3的webkit内核(534.12)在执行submit时是异步的，导致submit真正执行前，下面这段代码已经执行，action和target都被恢复回去了。
                // 搜狗2.2的webkit内核是534.3，也会有这个问题，因此把版本号判断改为534.3
				// 做一个兼容，maxthon3中用setTimeout进行恢复。
				if (ua.ua.webkit <= 534.3) {
					setTimeout(function() {
						// 提交之后再恢复回来
						self.action = oldAction;
						self.method = oldMethod;
						self.enctype = self.encoding = oldEnctype;
						self.formNoValidate = oldNoValidate;
						self.target = oldTarget;
					}, 0);
				} else {
					// 提交之后再恢复回来
					self.action = oldAction;
					self.method = oldMethod;
					self.enctype = self.encoding = oldEnctype;
					self.formNoValidate = oldNoValidate;
					self.target = oldTarget;
				}

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
		if (net) {
			xhr = new net.Request(params);
		} else {
			throw new object.ModuleRequiredError('net', module);
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
 * textarea / input / textarea / select / option 元素的包装
 */
this.FormItemElement = new Class(exports.Element, function() {

	this.nativeEventNames = basicNativeEventNames.concat(['focus', 'blur', 'change', 'select', 'paste']);

	this.required = _supportHTML5Forms ? nativeproperty() : attributeproperty(false);
	this.pattern  = _supportHTML5Forms ? nativeproperty() : attributeproperty('');
	this.maxlength = nativeproperty();
	this.type = _supportHTML5Forms ? nativeproperty() : attributeproperty('text');
	this.min = _supportHTML5Forms ? nativeproperty() : attributeproperty('');
	this.max = _supportHTML5Forms ? nativeproperty() : attributeproperty('');

	/**
	 * selectionStart
	 * IE下获取selectionStart时，必须先在业务代码中focus该元素，否则返回-1
	 *
	 * @return 获取过程中发生任何问题，返回-1，否则返回正常的selectionStart
	 */
	this.selectionStart = property(function(self) {
		try {
			// 避免在火狐下，获取不可见元素的selectionStart出错
			if (typeof self.selectionStart == 'number') {
				return self.selectionStart;
			}
		} catch (e) {
			return -1;
		}

		// IE
		if (document.selection) {
			// 参考JQuery插件：fieldSelection
			var range = document.selection.createRange();
			// IE下要求元素在获取selectionStart时必须先focus，如果focus的元素不是自己，则返回-1
			if (range == null || range.parentElement() != self) {
				if (self.__selectionPos) {
					return self.__selectionPos.start;
				} else {
					return -1;
				}
			}
			return calculateSelectionPos(self).start;
		} else {
			return -1;
		}
	});
        
	/**
	 * selectionEnd
	 * IE下获取selectionEnd时，必须先在业务代码中focus该元素，否则返回-1
	 *
	 * @return 获取过程中发生任何问题，返回-1，否则返回正常的selectionEnd
	 */
	this.selectionEnd = property(function(self) {
		try {
			// 避免在火狐下，获取不可见元素的selectionEnd出错
			if (typeof self.selectionEnd == 'number') {
				return self.selectionEnd;
			}
		} catch (e) {
			return -1;
		}

		// IE
		if (document.selection) {
			// 参考JQuery插件：fieldSelection
			var range = document.selection.createRange();
			// IE下要求元素在获取selectionEnd时必须先focus，如果focus的元素不是自己，则返回0
			if (range == null || range.parentElement() != self) {
				if (self.__selectionPos) {
					return self.__selectionPos.end;
				} else {
					return -1;
				}
			}
			return calculateSelectionPos(self).end;
		} else {
			return -1;
		}
	});

	/**
	 * select元素所有已选择元素
	 */
	this.getSelected = function(self) {
		self.selectedIndex; // Safari 3.2.1
		var selected = [];
		for (var i = 0; i < self.options.length; i++) {
			if (self.options[i].selected) selected.push(self.options[i]);
		};
		return selected;
	};

	/**
	 * value，在不支持placeholder的浏览器忽略placeholder的值
	 */
	this.prop_value = property(function(self) {
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

	/**
	 * HTML5 validity
	 */
	this.validity = _supportHTML5Forms? property(function(self) {
		return self.validity;
	}) : property(function(self) {
		// required pattern min max step
		// text search url tel email password
		var value = self.get('value');
		
		var validity = {
			// 在firefox3.6.25中，self.getAttribute('required')只能获取到self.setAttribute('required', true)的值
			// self.required = true设置的值无法获取
			valueMissing: (function () {
				// valueMissing: self.getAttribute('required') && (!value ? true : false) 在IE6下有误
				// 例如：undefined && (1== 1)  在IE6下返回undefined
				var required = self.getAttribute('required');
				if (required) {
					return !value ? true : false;
				} else {
					return false;
				}
			})(),
			typeMismatch: (function(type) {
				if (type == 'url') return !(/^\s*(?:(\w+?)\:\/\/([\w-_.]+(?::\d+)?))(.*?)?(?:;(.*?))?(?:\?(.*?))?(?:\#(\w*))?$/i).test(value);
				if (type == 'tel') return !(/[^\r\n]/i).test(value);
				if (type == 'email') return !(/^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/i).test(value);
				return false;
			})(self.getAttribute('type')),
			patternMismatch: (function() {
				var pattern = self.get('pattern');
				if (pattern) {
					return !(new RegExp('^' + pattern + '$')).test(value);
				} else {
					return false;
				}
			})(),
			tooLong: (function() {
				var maxlength = self.get('maxlength');
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
			if (validity.tooLong) return '请将该文本减少为 ' + self.get('maxlength') + ' 个字符或更少（您当前使用了' + self.get('value').length + '个字符）。';
			if (validity.rangeUnderflow) return '值必须大于或等于' + self.getAttribute('min') + '。';
			if (validity.rangeOverflow) return '值必须小于或等于' + self.getAttribute('max') + '。';
			if (validity.stepMismatch) return '值无效。';
		})();
		self._set('validationMessage', self.__validationMessage);

		self._set('validity', validity);
		return validity;
	});

	/**
	 * HTML5 validationMessage
	 */
	this.validationMessage = _supportHTML5Forms? property(function(self) {
		return self.validationMessage;
	}) : property(function(self) {
		self.get('validity');
		return self.__validationMessage;
	});

	if (!_supportHTML5Forms) {
		/* TODO */
		// autofocus
		// willvalidate
		// formnovalidate

		/**
		 * HTML5 setCustomValidity
		 */
		this.setCustomValidity = function(self, message) {
			self.__customValidity = message;
			self.get('validity');
		};

		/**
		 * HTML5 checkValidity
		 */
		this.checkValidity = function(self) {
			self.get('validity');
			return self.validity.valid;
		};
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

/**
 * input / textarea 元素的包装类的基类
 */
this.TextBaseElement = new Class(exports.FormItemElement, function() {

	this.initialize = function(self) {
		this.parent(self);

		if (!_supportPlaceholder) {
			self.bindPlaceholder();
		}
		if (!_supportSelectionStart) {
			// 在每一次即将失去焦点之前，保存一下当前的selectionStart和selectionEnd的值
			self.addEvent('beforedeactivate', function() {
				/** 在失去焦点时保存selectionStart和selectionEnd的值，只在IE下用 */
				self.__selectionPos = calculateSelectionPos(self);
			});
		}
	};

	/**
	 * 占位符
	 */
	this.prop_placeholder = property(function(self) {
		return self.getAttribute('placeholder');
	}, function(self, value) {
		self.setAttribute('placeholder', value);
		if (!_supportPlaceholder) {
			self.bindPlaceholder();
			if (self.get('placeholding')) self.value = value;
		}
	});

	/**
	 * 是否处于占位符状态
	 */
	this.prop_placeholding = property(function(self) {
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

			if (self.get('placeholding')) {
				if (event.type == 'focus' && self.value === placeholder) {
					self.value = '';
				}
				self.set('placeholding', false);

			// IE不支持autocomplete=off，刷新页面后value还是placeholder（其他浏览器为空，或者之前用户填写的值），只能通过判断是否相等来处理
			} else if (!self.value || ((ua.ua.ie == 6 || ua.ua.ie == 7) && !event && self.value == placeholder)) {
				self.set('placeholding', true);
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
					self.set('placeholding', false);
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

/**
 * input元素的包装类
 * @class
 */
this.InputElement = new Class(exports.TextBaseElement, function() {

	/**
	 * HTML5 formAction
	 */
	this.prop_formAction = _supportMultipleSubmit? nativeproperty() : attributeproperty('');

	/**
	 * HTML5 formEnctype
	 */
	this.prop_formEnctype = _supportMultipleSubmit? nativeproperty() : attributeproperty('application/x-www-form-urlencoded');

	/**
	 * HTML5 formMethod
	 */
	this.prop_formMethod = _supportMultipleSubmit? nativeproperty() : attributeproperty('get');

	/**
	 * HTML5 formNoValidate
	 */
	this.prop_formNoValidate = _supportMultipleSubmit? nativeproperty() : attributeproperty(false);

	/**
	 * HTML5 formTarget
	 */
	this.prop_formTarget = _supportMultipleSubmit? nativeproperty() : attributeproperty('');

	this.initialize = function(self) {
		this.parent(self);

        /** 只要dom.wrap元素了就会导致封装一个click事件，因此需要先判断此元素是否包含formaction */
		if (!_supportMultipleSubmit && self.type == 'submit') {
			self.addNativeEvent('click', function(event) {
                var action = self.getAttribute('formaction');
                if (action && action != 'undefined') {
				    self.form.__submitButton = self;
                }
			});
		}
	};

	/**
	 * 用ajax发送一个表单
	 * @param data 发送的数据
	 */
	this.send = function(self, data) {
		if (self.type != 'submit') return;
		var action = self.getAttribute('formaction'),
			method = self.getAttribute('formmethod');
			
		var request = self.form.createRequest({
			method: method || self.form.method,
			url: action || self.form.action,
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

/**
 * textarea元素的包装类
 */
this.TextAreaElement = new Class(exports.TextBaseElement, function() {
});

/**
 * window元素的包装类
 */
this.Window = new Class(exports.Element, function() {
	this.nativeEventNames = basicNativeEventNames.concat(
		['load', 'unload', 'beforeunload', 'resize', 'move', 'DomContentLoaded', 'readystatechange', 'scroll', 'mousewheel', 'DOMMouseScroll']);
});

/**
 * document元素的包装类
 */
this.Document = new Class(exports.Element, function() {
	this.nativeEventNames = basicNativeEventNames.concat(
		['load', 'unload', 'beforeunload', 'resize', 'move', 'DomContentLoaded', 'readystatechange', 'scroll', 'mousewheel', 'DOMMouseScroll']);
});

/**
 * 一个包装类，实现Element方法的统一调用
 */
this.Elements = new Class(Array, function() {

	/**
	 * @param elements native dom elements
	 * @param wrapper 这批节点的共有类型，默认为Element
	 */
	this.initialize  = function(self, elements, wrapper) {
		if (!wrapper) wrapper = exports.Element;

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
	else return exports.Element;
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

/**
 * IE下，在焦点即将离开此元素时，计算一下selectionStart和selectionEnd备用
 *
 * @param {HTMLElement} field 焦点即将离开的元素，input/textarea
 * @return {Object} 位置信息对象，包含{start:起始位置, end:终止位置}
 */
function calculateSelectionPos(field) {
	// 参考JQuery插件：fieldSelection
	var range = document.selection.createRange();
	if (range == null || range.parentElement() != field) {
		return {start:-1, end:-1};
	}
	var elementRange = field.createTextRange();
	var duplicated = elementRange.duplicate();
	elementRange.moveToBookmark(range.getBookmark());
	//将选中区域的起始点作为整个元素区域的终点
	duplicated.setEndPoint('EndToStart', elementRange);
	return {
		start: duplicated.text.length, 
		end  : duplicated.text.length + range.text.length
	};
}
});



/* import from D:\workhome\workspace\objectjs.org\object\src\for-jxn\net.js */ 

object.add('./net.js', 'dom, events', function(exports, dom, events) {

/**
 * 在同时使用了XN.net和objectjs net模块向同一个域发送异步请求时，同一个域的iframe被创建多次
 * 原因1：两个net模块没有使用相同的iframe缓存对象，导致至少创建两个
 * 原因2：每次使用net模块都会产生一个新的缓存对象，导致iframe多次重复创建
 * 所以：采用与XN相同的全局对象保存，并将缓存对象放置在全局对象上
 */
var ajaxProxies = window.__ajaxProxies;
if (!ajaxProxies) {
    ajaxProxies = window.__ajaxProxies = {};
}

/**
 * 执行一个可跨域的ajax请求
 * 跨域host必须有ajaxproxy.htm
 * callback唯一参数返回 XMLHttpRequest 对象实例
 */
this.ajaxRequest = function(url, callback) {
	if (!url || typeof url != 'string' || url.trim().length == 0) {
		return;
	}
	if (!callback || typeof callback != 'function') {
		callback = function(){};
	}
	var tmpA = document.createElement('a');
	tmpA.href = url;
	var hostname = tmpA.hostname;
	var protocol = tmpA.protocol;

	if (hostname && (hostname != location.hostname)) {
		var xhr = null;
		if (ajaxProxies[hostname]) {
            // 参考XN，如果iframe没有加载完毕，则等待其加载完毕
            (function() {
                if (!ajaxProxies[hostname].loaded) {
                    setTimeout(arguments.callee, 100);
                } else {
                    callback(ajaxProxies[hostname].contentWindow.getTransport());
                }
            })();
        } else {
			var iframe = document.createElement('iframe'), transport;
			iframe.style.display = 'none';
			dom.ready(function() {
                ajaxProxies[hostname] = iframe;
                iframe.loaded = false;
				document.body.insertBefore(iframe, document.body.firstChild);
				iframe.src = protocol + '//' + hostname + '/ajaxproxy.htm';
                // 采用objectjs的事件系统
                dom.wrap(iframe).addEvent('load', function() {
                    // 据说Firefox3在多个iframe同时加载时有个bug（参考XN.net）
                    if (iframe.contentWindow.location.href !== iframe.src) {
						iframe.contentWindow.location.href = iframe.src;
					} else {
                        iframe.loaded = true;
                        try {
                            transport = iframe.contentWindow.getTransport();
                        } catch (e) {
                            throw new Error('message : ' + e.message + ' from url : ' + url);
                        }
                        callback(transport);
                    }
                });
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

/**
 * 发送一个请求到url
 * @param url url
 */
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
 * @param {function} options.onerror 请求失败后的回调
 * @param {int} options.timeout 请求的超时毫秒数
 */
this.Request = new Class(function() {

	this.__mixins__ = [events.Events];

	this.initialize = function(self, options) {
		options = options || {};
		self.url = options.url || '';
		self.method = options.method || 'get';
		self.timeout = options.timeout && options.timeout > 0 ? options.timeout : 0;
		self.headers = options.headers || {};
		self.data = options.data || null;
		self._xhr = null;

		self.onSuccess = options.onSuccess;
		self.onsuccess = options.onsuccess;
		self.onerror = options.onerror;
		self.oncomplete = options.oncomplete;
	};

	/**
 	 * 将data作为数据进行发送
	 * @param {string} data 发送的数据
	 */
	this.send = function(self, data) {
		exports.ajaxRequest(self.url, function(xhr) {
			// onreadystatechange和timer共同使用的标志
			// 异常出现的情形：
			// 	在设置timeout极短（1ms）时，timer首先执行，timeout事件触发，在abort执行之前，xhr已经成功返回结果，触发success
			//  这样一个请求既触发timeout又触发success，不正确
			// 增加callbackCalled就是为了避免上述情形的出现
			var callbackCalled = false;
			self._xhr = xhr;
			var eventData = {request: self};

			xhr.onreadystatechange = function() {
				var xhr = self._xhr;

				if (xhr.readyState === 4) {


					// 如果timer已经抢先执行，则直接返回
					if (callbackCalled) {
						return;
					} 
					// 如果timer还没有执行，则清除timer
					else if (self._timer) {
						clearTimeout(self._timer);
						self._timer = null;
					}

					// IE6 don't support getResponseHeader method
					// if (xhr.getResponseHeader('Content-Type') == 'text/json') {
						//xhr.responseJSON = JSON.parse(xhr.responseText)
					// }

					self.responseText = xhr.responseText;
					self.responseXML = xhr.responseXML;
					// self.responseJSON = xhr.responseJSON;

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

			if (self.timeout) {
				self._timer = setTimeout(function() {
					callbackCalled = true;
					self.abort();
					self.fireEvent('timeout', eventData);
					self.fireEvent('complete', eventData);
				}, self.timeout);
			}

			self._xhr.send(data);
		});
	};

	/**
	 * 中断请求
	 */
	this.abort = function(self) {
		if (self._xhr) {
			self._xhr.abort();
		}
		if (self._timer) {
			clearTimeout(self._timer);
			self._timer = null;
		}
	};

	/**
	 * getResponseHeader
	 */
	this.getResponseHeader = function(self, key) {
		return self._xhr.getResponseHeader(key);
	};

	/**
	 * setHeader
	 */
	this.setHeader = function(self, name, value) {
		self.headers[name] = value;
	};

});

});

/* import from D:\workhome\workspace\objectjs.org\object\src\urlparse.js */ 

object.add('./urlparse.js', function(exports) {

// 可以用于scheme的字符
var scheme_chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+-.';

/**
 * 在字符串url中查找target字符后，利用result对象，返回截断后的前、后字符串
 * @param {Object} result 重复利用的用于返回结果的对象（避免太多内存垃圾产生）
 * @param {String} url 需要截取的url
 * @param {String} target 截断的字符组成的字符串
 * @param {Boolean} remainFirst 是否要保留匹配的字符
 *
 * @return {Object} 形如 {got:'', remained:''}的结果对象
 */
function splitUntil(result, url, target, remainFirst) {
	var min = url.length;
	for(var i=0, len = url.length; i < len; i++) {
		if (target.indexOf(url.charAt(i)) != -1) {
			if (i < min) {
				min = i;
				break;
			}
		}
	}
	result.got = url.substring(0, min);
	result.remained = (remainFirst? url.substring(min) : url.substring(min + 1));
	return result;
}

/**
 * 解析一个url为 scheme / netloc / path / params / query / fragment 六个部分
 * @see http://docs.python.org/library/urlparse.html
 * @example 
 * http://www.renren.com:8080/home/home2;32131?id=31321321&a=1#//music/?from=homeleft#fdalfdjal
 * --> 
 * [http, www.renren.com:8080, /home/home2, 32131, id=31321321&a=1, //music/?from=homeleft#fdalfdjal]
 */
function urlparse(url, default_scheme) {
	if (typeof url != 'string') {
		return ['', '', '', '', '', ''];
	}
	var scheme = '', netloc='', path = '', params = '', query = '', fragment = '', i = 0;
	i = url.indexOf(':');
	if (i > 0) {
		if (url.substring(0, i) == 'http') {
			scheme = url.substring(0, i).toLowerCase();
			url = url.substring(i+1);
		} else {
			for(var i=0, len = url.length; i < len; i++) {
				if (scheme_chars.indexOf(url.charAt(i)) == -1) {
					break;
				}
			}
			scheme = url.substring(0, i);
			url = url.substring(i + 1);
		}
	}
	if (!scheme && default_scheme) {
		scheme = default_scheme;
	}
	var splited = {};
	if (url.substring(0, 2) == '//') {
		splitUntil(splited, url.substring(2), '/?#', true);
		netloc = splited.got;
		url = splited.remained;
	}

	if (url.indexOf('#') != -1) {
		splitUntil(splited, url, '#');
		url = splited.got;
		fragment = splited.remained;
	}
	if (url.indexOf('?') != -1) {
		splitUntil(splited, url, '?');
		url = splited.got;
		query = splited.remained;
	}
	if (url.indexOf(';') != -1) {
		splitUntil(splited, url, ';');
		path = splited.got;
		params = splited.remained;
	}
	
	if (!path) {
		path = url;
	}
	return [scheme, netloc, path, params, query, fragment];
};

/**
 * 将兼容urlparse结果的url部分合并成url
 */
function urlunparse(parts) {
	if (!parts) {
		return '';
	}
	var url = '';
	if (parts[0]) url += parts[0] + '://' + parts[1];
	if (parts[1] && parts[2] && parts[2].indexOf('/') != 0) url += '/';
	url += parts[2];
	if (parts[3]) url += ';' + parts[3];
	if (parts[4]) url += '?' + parts[4];
	if (parts[5]) url += '#' + parts[5];

	return url;
};

/**
 * 合并两段url
 */
function urljoin(base, url) {
	// 逻辑完全照抄python的urlparse.py

	if (!base) {
		return url;
	}

	if (!url) {
		return base;
	}

	url = String(url);
	base = String(base);

	var bparts = urlparse(base);
	var parts = urlparse(url, bparts[0]);

	// scheme
	if (parts[0] != bparts[0]) {
		return url;
	}

	// netloc
	if (parts[1]) {
		return urlunparse(parts);
	}

	parts[1] = bparts[1];

	// path
	if (parts[2].charAt(0) == '/') {
		return urlunparse(parts);
	}

	// params
	if (!parts[2] && !parts[3]) {
		parts[2] = bparts[2];
		parts[3] = bparts[3];
		if (!parts[4]) {
			parts[4] = bparts[4];
		}
		return urlunparse(parts);
	}

    var segments = bparts[2].split('/').slice(0, -1).concat(parts[2].split('/'))

	// 确保能够生成最后的斜线
	if (segments[segments.length - 1] == '.') {
		segments[segments.length - 1] = '';
	}

	// 去掉所有'.'当前目录
	for (var i = 0, l = segments.length; i < l; i++) {
		if (segments[i] == '.') {
			segments.splice(i, 1);
			i--;
		}
	}

	// 合并所有'..'
	var i;
	while (true) {
		i = 1;
		n = segments.length - 1;
		while (i < n) {
			if (segments[i] == '..' && ['', '..'].indexOf(segments[i - 1]) == -1) {
				segments.splice(i - 1, 2);
				break;
			}
			i++;
		}
		if (i >= n) {
			break;
		}
	}

	if (segments.length == 2 && segments[0] == '' && segments[1] == '..') {
		segments[segments.length - 1] = '';
	}
	else if (segments.length >= 2 && segments[segments.length - 1] == '..') {
		segments.pop();
		segments.pop();
		segments.push('');
	}

	parts[2] = segments.join('/');

	return urlunparse(parts);
}

exports.urlparse = urlparse;
exports.urlunparse = urlunparse;
exports.urljoin = urljoin;

});


/* import from D:\workhome\workspace\objectjs.org\object\src\validator.js */ 

object.add('./validator.js', function(exports) {

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

/* import from d:\workhome\workspace\jxn\src\compatible\tail.js */ 

}

/* import from d:\workhome\workspace\jxn\src\extra-inits\object.predefine.js */ 

if (!object.predefine) {
    object.predefine = function(name, url) {
        var names = name.split(' ');
        jxn.forEach(names, function(name) {
            jxn('<script>').data('src', url).data('module', name).appendTo('head');
        });
    };
}

/* import from d:\workhome\workspace\jxn\src\extra-inits\xn.net.js */ 

object.define('xn.net', 'sys, net', function(require, exports) {

var sys = require('sys');
var net = require('net');

/*
 * 保证ajax发送时带有token
 * 通过mixin替换net module的send方法，在send之前解析发送的数据，加入requestToken项。
 * 这样就需要每个引入了net module的module注意同时引入xn.net，或者直接使用 xn.net.Request 进行数据发送
 */

var oldSend = net.Request.prototype.send;
net.Request.set('send', function(self, data) {
	data = data || self.data || '';
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

/* import from d:\workhome\workspace\jxn\src\core-head.js */ 

/* ----------------- start of jxn-core-head.js ---------------- */
object.define('jxn', 'dom, string, net, xn.net, ua', function(require, exports) {

    // add rtk for ajax requests
    require('xn.net');

    var toString = Object.prototype.toString,
        slice = Array.prototype.slice,
        dom = require('dom'),
        net = require('net'),
        ua = require('ua'),
        string = require('string'),
        htmlStrReg = /^<[\w\W]+>/,
        htmlTagReg = /^<([\w]+)>$/,
        emptyFunc = function() {},
        consoleClean = false,
        JxnNodesWrapper = function() {},
        cons = typeof console != 'undefined' ? console : {
            log : emptyFunc,
            error : emptyFunc,
            warn : emptyFunc
        },

    jxn = function(selector, parent) {
        var node, nodes = null, result, realNodes, i, l, msg;
        if (jxn.isJxnNode(selector)) {
            return selector;
        }
        if (jxn.isString(selector)) {
            selector = jxn.trim(selector);
            if (jxn.isHTMLTag(selector)) {
                node = document.createElement(RegExp.$1);
                nodes = [node];
            } else if (jxn.isHTMLString(selector)) {
                nodes = dom.getDom(selector).childNodes;
                realNodes = [];
                for (i = 0, l = nodes.length; i < l; i++) {
                    if (jxn.isDomNode(nodes[i])) {
                        realNodes[realNodes.length] = nodes[i];
                    }
                }
                nodes = realNodes;
            } else {
                if (selector.toLowerCase() == 'body') {
                    nodes = Sizzle(selector);
                } else {
                    parent = parent || document.body;
                    if (jxn.isJxnNode(parent)) {
                        parent = parent[0];
                    }
                    nodes = Sizzle(selector, parent);
                }
            }
        } else if (jxn.isFunction(selector)) {
            dom.ready(selector);
            return;
        } else if (jxn.isAcceptableElement(selector)) {
            nodes = [selector];
        } else if (jxn.isArray(selector)) {
            nodes = selector;
            for (i = 0, l = nodes.length; i < l; i++) {
                if (!jxn.isAcceptableElement(nodes[i])) {
                    msg = 'array elements should be all dom nodes';
                    if (nodes[i].nodeType == 3) {
                        msg += ', text node(nodeType = 3) is not acceptable';
                    }
                    jxn.error(msg);
                    return;
                }
            }
        }
        result = new JxnNodesWrapper();
        var len = nodes ? nodes.length : 0
        result.length = len;
        for (i = 0; i < len; i++) {
            result[i] = nodes[i];
        }
        return result;
    };

    jxn.extend = function(dest, src) {
        var prop;
        for (prop in src) {
            if (src.hasOwnProperty(prop)) {
                dest[prop] = src[prop];
            }
        }
    };

    jxn.extend(jxn, {
        errors: [],
        warns: [],
        logs: [],
        consoleClean: function(flag) {
            consoleClean = flag;
        },
        resetLogs: function() {
            jxn.errors.length = 0;
            jxn.warns.length = 0;
            jxn.logs.length = 0;
        },
        error: function() {
            var msg = slice.call(arguments);
            jxn.errors.push(msg.join(','));
            !consoleClean && cons.error(msg);
        },
        log: function() {
            var msg = slice.call(arguments);
            jxn.logs.push(msg.join(','));
            !consoleClean && cons.log(msg);
        },

        warn: function() {
            var msg = slice.call(arguments);
            jxn.warns.push(msg.join(','));
            !consoleClean && cons.warn(msg);
        },

        slice: slice,
        isInDomTree: function(element) {
            return !!dom.wrap(element).getParent('body');
        },

        isDomNode: function(obj) {
            return obj && obj.nodeType == 1;
        },

        isAcceptableElement: function(obj) {
            return obj && (obj.nodeType == 1 || obj.nodeType == 9 || obj == window);
        },

        isFunction: function(obj) {
            return toString.call(obj) == '[object Function]';
        },

        isUndefined: function(obj) {
            return typeof obj === 'undefined';
        },

        isObject: function(obj) {
            return obj && toString.call(obj) == '[object Object]';
        },
        isArray: function(obj) {
            return toString.call(obj) == '[object Array]';
        },
        isString: function(obj) {
            return typeof obj == 'string';
        },

        isRegExp: function(obj) {
            return toString.call(obj) == '[object RegExp]';
        },

        isBoolean: function(obj) {
            return obj && toString.call(obj) == '[object Boolean]';
        },

        isNumber: function(obj) {
            return typeof obj == 'number';
        },
        trim: function(str) {
            if (!str) {
                return str;
            }
            return str.replace(/^\s+|\s+$/g, '');
        },
        isHTMLString: function(obj) {
            return jxn.isString(obj) && htmlStrReg.test(obj);
        },
        isHTMLTag: function(obj) {
            return jxn.isString(obj) && htmlTagReg.test(obj);
        },
        isDocument: function(obj) {
            return obj && obj.nodeType === 9;
        },

        isWindow: function(node) {
            return node && typeof node === "object" && "setInterval" in node && jxn.isDocument(node.document);
        },
        getNumber: function(str) {
            return parseFloat(str, 10);
        },
        getWindow: function(node) {
            return jxn.isWindow(node) ? node :
                node.nodeType === 9 ? node.defaultView || node.parentWindow : false;
        },
        isJxnNode: function(node) {
            return node && node.constructor == JxnNodesWrapper;
        },
        forEach: function(obj, fun) {
            var i, l, prop;
            if (jxn.isArray(obj)) {
                for (i = 0, l = obj.length; i < l; i++) {
                    fun.call(obj, obj[i], i);
                }
            } else if (jxn.isObject(obj)) {
                for (prop in obj) {
                    if (!obj.hasOwnProperty(prop)) {
                        continue;
                    }
                    fun.call(obj, prop, obj[prop]);
                }
            }
        },
        registerPlugin: function(name, plugin, addToJxn) {
            var i, current, l;
            JxnNodesWrapper._plugins = JxnNodesWrapper._plugins || {};
            if (JxnNodesWrapper._plugins[name]) {
                jxn.error('plugin ' + name + ' already exists!');
                return;
            }
            JxnNodesWrapper._plugins[name] = plugin;
            jxn._extendAsPlugin(JxnNodesWrapper.prototype, plugin, name);
            if (jxn.isArray(addToJxn)) {
                for (i = 0, l = addToJxn.length; i < l; i++) {
                    current = addToJxn[i];
                    if (!jxn.isString(current)) {
                        jxn.error(current + ' is not string');
                        continue;
                    }
                    if (jxn[current]) {
                        jxn.error(current + ' exists in jxn');
                        continue;
                    }
                    jxn[current] = plugin[current];
                }
            }
        },
        _extendAsPlugin: function(dest, src, name) {
            for(var prop in src) {
                if (!src.hasOwnProperty(prop)) {
                    continue;
                }
                pluginProp = src[prop];
                if (jxn.isFunction(pluginProp)) {
                    jxn._appendFnToDest(dest, prop, pluginProp, name);
                } else {
                    dest[prop] = src[prop];
                }
            }
        },
        _appendFnToDest: function(dest, prop, pluginProp, name) {
            if (prop in dest) {
                jxn.warn(prop, name, dest[prop].__by, '重复设置');
            }
            dest[prop] = function() {
                var i, l, params, value, nodes = this, node, values = [], returnsValue = false;
                for(i = 0, l = nodes.length; i < l; i++) {
                    node = nodes[i];
                    params = slice.call(arguments);
                    params.unshift(node);
                    value = pluginProp.apply(this, params);
                    values[values.length] = value;
                    if (value !== undefined) {
                        returnsValue = true;
                    }
                }
                if (returnsValue) {
                    return values[0];
                }
                return this;
            };
            dest[prop].__name = prop;
            dest[prop].__by = name;
        }
    });

    if (!ua.ua.ie) {
        JxnNodesWrapper.prototype = new Array();
        JxnNodesWrapper.prototype.constructor = JxnNodesWrapper;
    } else {
        jxn.forEach(["concat", "indexOf", "join", "lastIndexOf", "pop", "push", "reverse", "shift", "slice", 
            "sort", "splice", "unshift", "valueOf", "forEach", "some", "every", "map", "filter"], function(value) {
            JxnNodesWrapper.prototype[value] = Array.prototype[value];
        });
    }

    jxn.extend(JxnNodesWrapper.prototype, {
        each: function(func) {
            var i, l = this.length;
            for (i = 0; i < l; i++) {
                func.call(this[i], this[i]);
            }
            return this;
        },
        toArray: function() {
            return slice.call(this);
        },
        node: function(index) {
            return jxn(this[index]);
        },
        index: function(node) {
            if (jxn.isJxnNode(node)) {
                node = node[0];
            }
            var i, l = this.length;
            for (i = 0; i < l; i++) {
                if (node == this[i]) {
                    return i;
                }
            }
            return -1;
        },
        eq: function(index) {
            if (index == -1) {
                return this.node(this.length - 1);
            }
            return this.node(index);
        },
        first: function() {
            return this.eq(0);
        },
        last: function() {
            return this.eq(-1);
        }
    });
    /** -------------------- end of jxn-core-head.js --------------- */


/* import from d:\workhome\workspace\jxn\src\event.js */ 

/*--------------------------- Events ---------------------------*/
(function(jxn, undefined) {
    var eventsMap = {},
        returnFalse = function(event) {
            if (event.preventDefault) {
                event.preventDefault();
            } else {
                event.returnValue = false;
            }
            return false;
        },
        globalEvents = ['error', 'unload', 'scroll'],
        domNodeEvents = [
            'blur', 'change', 'click', 'dblclick', 'focus', 'select',
            'keydown', 'keyup', 'keypress',
            'mousedown', 'mouseenter', 'mouseleave', 'mousemove', 'mouseout', 'mouseover', 'mouseup'
        ];

    var Events = {
        load: function(element, eventHandler, bubble) {
            if (jxn.isWindow(element)) {
                dom.wrap(element).addEvent('load', eventHandler, bubble);
            } else {
                jxn.loadFile.apply(element, arguments);
            }
        },
        delegate: function(element, subNodeSelector, eventType, eventHandler, bubble) {
            jxn.forEach(eventType.split(' '), function(type) {
                dom.wrap(element).delegate(subNodeSelector, type, eventHandler, bubble);
            });
        },
        undelegate: function(element, subNodeSelector, eventType, eventHandler, bubble) {
            jxn.forEach(eventType.split(' '), function(type) {
                dom.wrap(element).undelegate(subNodeSelector, type, eventHandler, bubble);
            });
        },
        trigger: function(element, eventType, data) {
            dom.wrap(element).fireEvent(eventType, data);
        },
        bind: function(element, eventType, eventHandler, bubble) {
            if (jxn.isObject(eventType)) {
                for (var prop in eventType) {
                    dom.wrap(element).addEvent(prop, eventType[prop], bubble);
                }
                return;
            }
            var types = eventType.split(' ');
            for (var i = 0, l = types.length; i < l; i++) {
                dom.wrap(element).addEvent(types[i], eventHandler, bubble);
            }
        },
        unbind: function(element, eventType, eventHandler, bubble) {
            if (jxn.isObject(eventType)) {
                for (var prop in eventType) {
                    dom.wrap(element).removeEvent(prop, eventType[prop], bubble);
                }
                return;
            }
            var types = eventType.split(' ');
            for (var i = 0, l = types.length; i < l; i++) {
                dom.wrap(element).removeEvent(types[i], eventHandler, bubble);
            }
        },
        on: function(element, eventType, eventHandler, bubble) {
            var specialHandled = false;
            jxn.forEach(jxn._specialEvents, function(special) {
                if (special.likes(eventType)) {
                    specialHandled = true;
                    special.on(element, eventType, eventHandler, bubble);
                }
            });
            if (specialHandled) {
                return;
            }
            dom.wrap(element).addEvent(eventType, eventHandler, bubble);
        },
        off: function(element, eventType, eventHandler, bubble) {
            var specialHandled = false;
            jxn.forEach(jxn._specialEvents, function(special) {
                if (special.likes(eventType)) {
                    specialHandled = true;
                    special.off(element, eventType, eventHandler, bubble);
                }
            });
            if (specialHandled) {
                return;
            }
            dom.wrap(element).removeEvent(eventType, eventsMap[eventHandler] || eventHandler, bubble);
            if (eventsMap[eventHandler]) {
                eventsMap[eventHandler] = null;
                delete eventsMap[eventHandler];
            }
        },
        one: function(element, eventType, eventHandler, bubble) {
            function realHandler() {
                eventHandler.apply(this, arguments);
                dom.wrap(element).removeEvent(eventType, realHandler, bubble);
                eventsMap[eventHandler] = null;
                delete eventsMap[eventHandler];
            }
            eventsMap[eventHandler] = realHandler;
            dom.wrap(element).addEvent(eventType, realHandler, bubble);
        },
        hover: function(element, inHandler, outHandler) {
            if (!inHandler) {
                return;
            }
            dom.wrap(element).addEvent('mouseenter', inHandler);
            dom.wrap(element).addEvent('mouseleave', outHandler || inHandler);
        },
        ready: function(element, eventHandler) {
            if (element != document) {
                jxn.error('ready should be called for jxn(document)');
                return;
            }
            dom.ready(eventHandler);
        },
        submit: function(element, eventHandler) {
            if (!element || !element.tagName) {
                jxn.error('element should have tagName');
                return;
            }
            var tagName = element.tagName.toLowerCase();
            if (tagName != 'form' && tagName != 'input') {
                jxn.error('submit event, element should be form or input');
                return;
            }
            if (tagName == 'input' && element.type != 'submit') {
                jxn.error('submit event, type of input should be submit');
            }
            if (eventHandler === false) {
                eventHandler = returnFalse;
            }
            dom.wrap(element).addEvent('submit', eventHandler);
        },
        toggle: function(element) {
            var handlers = jxn.slice.call(arguments);
            if (handlers.length == 1) {
                if (jxn.css(element, 'display') == 'none') {
                    jxn.show(element);
                } else {
                    jxn.hide(element);
                }
                return;
            }
            handlers.shift();
            handlers.currentIndex = 0;
            var handlerLength = handlers.length;
            if (handlerLength <= 1) {
                jxn.error('two event handlers for toggle at least');
                return;
            }
            dom.wrap(element).addEvent('click', function() {
                var index = handlers.currentIndex;
                handlers[index].apply(this, arguments);
                index = index + 1;
                if (index == handlerLength) {
                    index = 0;
                }
                handlers.currentIndex = index;
            });
        }
    };

    function addEventToNode(eventType, shouldBeGlobal) {
        Events[eventType] = function(element, eventHandler, bubble) {
            if (shouldBeGlobal && !jxn.isWindow(element)) {
                jxn.error(eventType + ' caller should be window');
                return;
            }
            if (eventHandler) {
                dom.wrap(element).addEvent(eventType, eventHandler, bubble);
            } else {
                dom.wrap(element)[eventType]();
            }
        };
    }

    for (var i = 0, eventType, l = globalEvents.length; i < l; i++) {
        eventType = globalEvents[i];
        addEventToNode(eventType, true);
    }

    for (var i = 0, eventType, l = domNodeEvents.length; i < l; i++) {
        eventType = domNodeEvents[i];
        addEventToNode(eventType);
    }
    jxn.registerPlugin('Events', Events, ['on']);
})(jxn);

/* import from d:\workhome\workspace\jxn\src\dom.js */ 

/*--------------------------- Dom ---------------------------*/
(function(jxn, undefined) {

    function storeAsPrevNode(node, prev) {
        if (node) {
            node._prevJxnNode = prev;
        }
        return node;
    }

    function getPrevNode(current) {
        var prev = current._prevJxnNode;
        if (prev) {
            current._prevJxnNode = null;
        }
        return prev;
    }

    var Dom = {
        show: function(element) {
            dom.wrap(element).show();
        },
        hide: function(element) {
            dom.wrap(element).hide();
        },
        after: function(element, content) {
            // 根据参数设定在每一个匹配的元素之后插入内容。
            element = dom.wrap(element);
            var node = content;
            if (jxn.isString(content)) {
                node = jxn(content)[0];
            } else if (jxn.isFunction(content)) {
                content = content.call(element, null);
                if (!content) {
                    return;
                }
                jxn(element).after(content);
                return;
            } else if (jxn.isJxnNode(content)) {
                content.each(function(node) {
                    jxn.after(element, node);
                });
            }
            if (jxn.isDomNode(node)) {
                dom.wrap(element).grab(node, 'after');
            }
        },
        insertBefore: function(element, target) {
            if (jxn.isString(target)) {
                target = jxn(target)[0];
            }
            element.parentNode.insertBefore(element, target);
        },
        append: function(element, html) {
            if (!jxn.isAcceptableElement(element)) {
                return;
            }
            if (jxn.isJxnNode(html)) {
                html.each(function(node) {
                    element.appendChild(node);
                });
            } else {
                if (jxn.isString(html)) {
                    html = dom.getDom(html);
                }
                element.appendChild(html);
            }
        },
        appendTo: function(element, target) {
            if (target == 'body') {
                target = document.body;
            } else if (target == 'head') {
                target = document.head || document.getElementsByTagName("head")[0] || document.documentElement;
            }
            if (!jxn.isAcceptableElement(element)) {
                return;
            }
            if (jxn.isString(target)) {
                target = Sizzle(target);
            } else if (!jxn.isArray(target) && !jxn.isJxnNode(target)) {
                target = [target];
            }

            var isDomNode = jxn.isInDomTree(element);
            for (var i = 0, current, l = target.length; i < l; i++) {
                current = target[i];
                current.appendChild(element);
                if (!isDomNode) {
                    element = element.cloneNode(true);
                }
            }
        },
        before: function(element, content) {
            element = dom.wrap(element);
            var node = content;
            if (jxn.isString(content)) {
                node = jxn(content)[0];
            } else if (jxn.isFunction(content)) {
                content = content.call(element, null);
                if (!content) {
                    return;
                }
                jxn.before(element, content);
                return;
            } else if (jxn.isJxnNode(content)) {
                content.each(function(node) {
                    jxn.before(element, node);
                });
            }
            if (jxn.isDomNode(node)) {
                dom.wrap(element).grab(node, 'before');
            }
        },
        clone: function(element) {
            // 深度复制匹配的元素。事件都要复制。。。
            return element.cloneNode(true);
        },
        detach: function() {
            // 从DOM中去掉所有匹配的元素。当需要移走一个元素，不久又将该元素插入DOM时，这种方法很有用。
        },
        empty: function(element) {
            if (element.nodeType === 1) {
                var subNodes = element.getElementsByTagName('*');
                for (var i = 0, current, l = subNodes.length; i < l; i++) {
                    current = subNodes[i];
                    try {
                        if (current.clearAttributes) {
                            current.clearAttributes();
                        } else {
                            for (var p in node) delete node[p];
                        }
                    } catch (e) {}
                }
            }
            // 从DOM中移除所有节点的子节点。
            while (element.firstChild) {
                element.removeChild(element.firstChild);
            }
        },
        prepend: function(element, html) {
            if (!jxn.isAcceptableElement(element)) {
                return;
            }
            if (jxn.isJxnNode(html)) {
                html.each(function(node) {
                    element.insertBefore(node, element.firstChild);
                });
            } else {
                if (jxn.isString(html)) {
                    html = dom.getDom(html);
                }
                element.insertBefore(html, element.firstChild);
            }
        },

        prependTo: function(element, target) {
            if (!jxn.isAcceptableElement(element)) {
                return;
            }
            if (jxn.isString(target)) {
                target = Sizzle(target);
            } else if (!jxn.isArray(target) && !jxn.isJxnNode(target)) {
                target = [target];
            }

            var isDomNode = jxn.isInDomTree(element);
            for (var i = 0, parent, l = target.length; i < l; i++) {
                parent = target[i];
                if (parent.firstChild) {
                    parent.insertBefore(element, parent.firstChild);
                } else {
                    parent.appendChild(element);
                }
                if (!isDomNode) {
                    element = element.cloneNode(true);
                }
            }
        },
        remove: function(element) {
            // 将匹配元素从DOM中删除。
            dom.wrap(element).dispose();
        },
        replaceAll: function(element, target) {
            if (!jxn.isAcceptableElement(element)) {
                return;
            }
            // 用匹配元素替换所有目标元素。
            if (jxn.isString(target)) {
                target = Sizzle(target);
            } else if (!jxn.isArray(target) && !jxn.isJxnNode(target)) {
                target = [target];
            }

            var isDomNode = jxn.isInDomTree(element);
            for (var i = 0, l = target.length; i < l; i++) {
                target[i].parentNode.replaceChild(element, target[i]);
                if (!isDomNode) {
                    element = element.cloneNode(true);
                }
            }
        },
        replaceWith: function(element, html) {
            // 用提供的内容替换所有匹配的元素。
            if (jxn.isString(html)) {
                html = dom.getDom(html);
            }
            element.parentNode.replaceChild(html, element);
        },
        text: function(element, text) {
            if (text && jxn.isString(text)) {
                dom.wrap(element).setContent(text);
            } else {
                return Sizzle.getText([element]);
            }
        },
        val: function(element, text) {
            // 获取匹配的元素集合中第一个元素的当前值。
            if (!jxn.isUndefined(text)) {
                element.value = text;
            } else {
                return element.value;
            }
        },
        wrap: function(element, html) {
            // 在每个匹配的元素外层包上一个html元素。
            if (jxn.isFunction(html)) {
                html = html.call(element, null);
            }

            var parent = element.parentNode,
                newNode = dom.getDom(jxn.trim(html)),
                child = newNode.firstChild;
            parent.insertBefore(newNode, element);
            child.appendChild(element);
        },

        unwrap: function(element) {
            // 将匹配元素的父级元素删除，保留自身（和兄弟元素，如果存在）在原来的位置。
            var parent = element.parentNode;
            if (parent == document.body) {
                return;
            }

            var realParent = parent.parentNode;
            var children = dom.wrap(parent).getChildren();
            for (var i = 0, l = children.length; i < l; i++) {
                realParent.insertBefore(children[i], parent);
            }
            realParent.removeChild(parent);
        },
        wrapAll: function() {
            // 在所有匹配元素外面包一层HTML结构。
            alert('not implemented');
        },
        wrapInner: function() {
            // 在匹配元素里的内容外包一层结构。
            alert('not implemented');
        },
        html: function(element, html) {
            if (jxn.isString(html)) {
                try {
                    dom.wrap(element).setContent(html);
                } catch (e) {
                    jxn.error(element.tagName + ' has no html setter method');
                }
            } else {
                return element.innerHTML;
            }
        },

        prev: function(element, selector) {
            selector = selector || '*';
            return storeAsPrevNode(jxn(dom.wrap(element).getPrevious(selector)), this);
        },
        prevAll: function(element, selector) {
            selector = selector || '*';
            return storeAsPrevNode(jxn(dom.wrap(element).getAllPrevious(selector)), this);
        },
        next: function(element, selector) {
            selector = selector || '*';
            return storeAsPrevNode(jxn(dom.wrap(element).getNext(selector)), this);
        },
        nextAll: function(element, selector) {
            selector = selector || '*';
            return storeAsPrevNode(jxn(dom.wrap(element).getAllNext(selector)), this);
        },
        parent: function(element, selector) {
            return storeAsPrevNode(jxn(dom.wrap(element).getParent(selector)), this);
        },
        parents: function(element, selector) {
            return storeAsPrevNode(jxn(dom.wrap(element).getParents(selector)), this);
        },
        siblings: function(element, selector) {
            selector = selector || '*';
            return storeAsPrevNode(jxn(dom.wrap(element).getSiblings(selector)), this);
        },
        firstChild: function(element, selector) {
            selector = selector || '*';
            return storeAsPrevNode(jxn(dom.wrap(element).getFirst(selector)), this);
        },
        lastChild: function(element, selector) {
            selector = selector || '*';
            return storeAsPrevNode(jxn(dom.wrap(element).getLast(selector)), this);
        },
        children: function(element, selector) {
            selector = selector || '*';
            return storeAsPrevNode(jxn(dom.wrap(element).getChildren(selector)), this);
        },
        find: function(element, selector) {
            return storeAsPrevNode(jxn(selector, element), this);
        },
        end: function(element) {
            return getPrevNode(this);
        }
    };

    jxn.registerPlugin('Dom', Dom, ['html', 'empty', 'before', 'after', 'show', 'hide']);
})(jxn);

/* import from d:\workhome\workspace\jxn\src\css.js */ 

/*--------------------------- Css ---------------------------*/
(function(jxn, undefined) {
    var numReg = /^-?\d+(?:px)?$/i;
    var hacks = {
        width: function(value) {
            if (numReg.test(value)) {
                value = parseFloat(value);
                if (value >= 0) {
                    value = value + 'px';
                }
            }
            return value;
        }
    };
    hacks.width = hacks.height = hacks.top = hacks.left;

    var Css = {
        addClass: function(element, cls) {
            dom.wrap(element).addClass(cls);
        },
        removeClass: function(element, name) {
            if (name === undefined) {
                var names = jxn.trim(dom.wrap(element).className);
                if (names == '') {
                    return;
                }
                names = names.split(' ');
                jxn.forEach(names, function(name) {
                    name = jxn.trim(name);
                    if (name != '') {
                        dom.wrap(element).removeClass(name);
                    }
                });
            } else {
                dom.wrap(element).removeClass(name);
            }
        },
        toggleClass: function(element, className) {
            dom.wrap(element).toggleClass(className);
        },
        hasClass: function(element, name) {
            return dom.wrap(element).hasClass(name);
        },
        css: function(element, name, value) {
            if (!jxn.isAcceptableElement(element)) {
                jxn('css() should be called by dom node');
                return;
            }
            element = dom.wrap(element);
            if (jxn.isObject(name)) {
                jxn.forEach(name, function(prop, value) {
                    prop = string.camelCase(prop);
                    value = hacks[prop] ? hacks[prop](value) : value;
                    element.setStyle(prop, value);
                });
            } else if (value !== undefined) {
                name = string.camelCase(name);
                value = hacks[name] ? hacks[name](value) : value;
                element.setStyle(string.camelCase(name), value);
            } else if (name) {
                if (name.indexOf(':') != -1) {
                    element.style.cssText += ';' + name;
                } else {
                    return element.getStyle(string.camelCase(name));
                }
            } else {
                return element.style.cssText;
            }
        }
    };
    jxn.registerPlugin('Css', Css, ['css']);
})(jxn);


/* import from d:\workhome\workspace\jxn\src\ajax.js */ 

/*--------------------------- Ajax ---------------------------*/
(function(jxn, undefined) {
    var Ajax = {
        ajaxComplete: function(element, callback) {

        },
        ajaxSuccess: function(element, callback) {

        },
        ajaxStop: function(element, callback) {

        },
        ajaxStart: function(element, callback) {
        },

        ajaxSend: function(element, callback) {

        },
        ajaxError: function(element, callback) {

        },
        // load, called by event
        loadFile: function(element, url, data, callback) {
            if (jxn.isFunction(data)) {
                callback = data;
                data = undefined;
            }
            var realCallback = function(e) {
                jxn.html(element, e.responseText || '');
                callback && callback.call(element, e);
            };
            jxn.get(url, data, realCallback);
        },

        serialize: function(element) {
            if (!jxn.isDomNode(element)) {
                jxn.error('serialize should be called by form element');
                return '';
            }
            var tagName = element.tagName.toLowerCase();
            if (tagName != 'form') {
                jxn.error('serialize should be called by form tag, not ' + tagName);
                return '';
            }
            return dom.wrap(element).toQueryString();
        },

        serializeArray: function(element) {
        }
    };

    function assertStyleOnload(style, callback) {
        if (style.attachEvent) {
            style.attachEvent('onload', function() {
                callback.call(this, style);
            });
        } else {
            setTimeout(function() {
                var handler = arguments.callee;
                if (callback.isCalled) {
                    return;
                }
                var isLoaded = false;
                if (ua.ua.webkit) {
                    if (style['sheet']) {
                        isLoaded = true;
                    }
                } else if (style['sheet']) {
                    try {
                        if (style['sheet'].cssRules) {
                            isLoaded = true;
                        }
                    } catch (e) {
                        if (e.code === 1000 || e.code == 18) {
                            isLoaded = true;
                        }
                    }
                }
                if (isLoaded) {
                    setTimeout(function() {
                        callback.call(style, style);
                    }, 1);
                } else {
                    setTimeout(handler, 1);
                }
            }, 0);
        }
    }

    function handleStyleAjaxRequest(url, callback) {
        var style, head = document.head || document.getElementsByTagName( "head" )[0] || document.documentElement;
        var style = document.createElement('link');
        style.rel = 'stylesheet';
        style.type = 'text/css';
        style.href = url;
        head.appendChild(style);
        if (!callback) {
            return style;
        }
        assertStyleOnload(style, callback);
        return style;
    }

    function handleScriptAjaxRequest(url, callback) {
        var script, head = document.head || document.getElementsByTagName( "head" )[0] || document.documentElement;
        script = document.createElement('script');
        script.async = 'async';
        script.src = url;
        script.onload = script.onreadystatechange = function() {
            if (!script.readyState || /loaded|complete/.test(script.readyState)) {
                script.onload = script.onreadystatechange = null;
                if (head && script.parentNode) {
                    jxn.empty(script);
                    head.removeChild(script);
                }
                script = undefined;
                callback && callback.call(this);
            }
        };
        head.insertBefore( script, head.firstChild );
    }

    var accepts = {
        xml: "application/xml, text/xml",
        html: "text/html",
        text: "text/plain",
        json: "application/json, text/javascript"
    };
    jxn.extend(jxn, {
        ajax: function(url, options) {
            if (jxn.isObject(url)) {
                options = url;
                url = options.url;
            }
            var dataType = options.dataType;
            options = options || {};

            if (dataType == 'script') {
                handleScriptAjaxRequest(url, options.success || options.onsuccess || options.onSuccess);
                return;
            }

            var headers = {};
            if (options.ifModified) {
                headers['If-Modified-Since'] = parseInt(options.ifModified);
            }
            if (options.ContentType) {
                headers['Content-Type'] = options.ContentType;
            }
            if (options.cache) {
                headers['Cache-Control'] = options.cache || 'no-cache';
            }
            if (dataType) {
                if (accepts[dataType]) {
                    headers['Accept'] = accepts[dataType] + ', */*;q=0.01';
                } else if (dataType == '*') {
                    headers['Accept'] = '*/*';
                }
            }
            var data = jxn.isString(options.data) ? options.data : string.toQueryString(options.data);
            var method = options.method || options.type || 'get';
            var request = new net.Request({
                url: url || options.url,
                data: method == 'post' ? '' : data,
                dataType: options.dataType,
                method: method,
                timeout: options.timeout,
                headers: headers,
                onsuccess: options.success || options.onsuccess || options.onSuccess,
                onerror: options.error || options.onerror || options.onError,
                oncomplete: options.complete || options.oncomplete || options.onComplete
            });

            request.send(method == 'post' ? data : '');

            // return request for unit test
            return request;
        },
        ajaxSetup: function() {
        },

        // type in xml, html, script, json, text
        get: function(url, data, callback, type) {
            if (jxn.isFunction(data)) {
                type = type || callback;
                callback = data;
                data = undefined;
            }
            if (type == 'json') {
                var oldCallback = callback;
                callback = function(e) {
                    oldCallback && oldCallback.call(this, JSON.parse(e.responseText || ''));
                };
            }
            return jxn.ajax({
                method: 'get',
                url: url,
                data: data,
                success: callback,
                dataType: type
            });
        },
        getJSON: function(url, data, callback) {
            return jxn.get(url, data, callback, 'json');
        },
        getScript: function(urls, callback) {
            if (jxn.isString(urls)) {
                return jxn.get(urls, undefined, callback, 'script');
            }
            if (!jxn.isArray(urls)) {
                return;
            }
            var len = urls.length, counter = 0, realCallback = function() {
                counter ++;
                if (counter == len) {
                    callback && callback.call(this);
                }
            };
            jxn.forEach(urls, function(url) {
                jxn.getScript(url, realCallback);
            });
        },
        getCSS: function(urls, callback) {
            if (jxn.isString(urls)) {
                return handleStyleAjaxRequest(urls, callback);
            }
            if (!jxn.isArray(urls)) {
                return;
            }
            var len = urls.length, counter = 0, nodes = [], realCallback = function() {
                counter ++;
                if (counter == len) {
                    callback && callback.call(this, nodes);
                }
            };
            jxn.forEach(urls, function(url) {
                nodes.push(jxn.getCSS(url, realCallback));
            });
        },
        post: function(url, data, callback, type) {
            if (jxn.isFunction(data)) {
                type = type || callback;
                callback = data;
                data = undefined;
            }
            return jxn.ajax({
                method: 'post',
                url: url,
                data: data,
                success: callback,
                dataType: type
            });
        },
        param: function() {
        }
    });
    jxn.registerPlugin('Ajax', Ajax, ['loadFile']);
})(jxn);

/* import from d:\workhome\workspace\jxn\src\effect.js */ 

/*--------------------------- Effect ---------------------------*/
(function(jxn, undefined) {
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
        }
    };

    var Tweening = function() {
        if (this.onTweening) {
            this.onTweening.apply(this);
        }
        if (this.current >= this.frames) {
            this.stop();
            if (this.onComplete) {
                this.onComplete.apply(this);
            }
            this.tweening = false;
            return;
        }

        this.current++;
    };

    /**
     * 动画组件
     *
     * @params {String} 动画类型（方程式）
     * @params {Number} 过程动画时间
     */
    var Motion = function(tween, duration) {
        this.tween = tween || 'linear';
        this.duration = jxn.isNumber(duration) ? duration : (timeMap[duration] || 1000);
        this.reset(tween, this.duration);
        this.tweening = false;
    };

    // 原型继承
    Motion.prototype = {
        equation: function(from, to) {
            return this.tweenMethod((this.current/this.frames) * this.duration, from, to - from, this.duration);
        },
        reset: function(tween, duration) {
            if (this.tweening) {
                this.stop();
            }
            this.duration = duration || 400;
            this.tween = tween || 'linear';
            this.fps = this.fps || 35;

            this.frames = Math.ceil((this.duration/1000) * this.fps);
            if (this.frames < 1) {
                this.frames = 1;
            }
            this.tweenMethod = ('function' == typeof this.tween) ? this.tween : Tween[this.tween] || Tween['linear'];
            this.current = 1;
        },
        //  开始动画
        start: function() {
            this.tweening = true;
            var _self = this, d = this.duration / this.frames;
            this.timer = setInterval(function() {Tweening.call(_self);}, d);
        },
        // 停止动画
        stop: function() {
            if (this.timer) {
                clearInterval(this.timer);
            }
            this.tweening = false;
        },
        hold: function() {
            this.stop();
        },
        goon: function() {
            this.start();
        }
    };

    var unitMatcher = /[a-zA-Z]+/,
        relativeMatcher = /^(?:([+\-])=)([\d\.]+)/;
    function getUnits(origin, target) {
        var executed = unitMatcher.exec(origin);
        if (executed) {
            return executed[0];
        }
        executed = unitMatcher.exec(target);
        if (executed) {
            return executed[0];
        }
        return 'px';
    }

    function getNumber(value) {
        return jxn.getNumber(value);
    }

    function getTarget(value, origin) {
        if (jxn.isNumber(value)) {
            return value;
        }
        if (relativeMatcher.test(jxn.trim(value))) {
            if (RegExp.$1 == '+') {
                return origin + getNumber(RegExp.$2);
            } else {
                return origin - getNumber(RegExp.$2);
            }
        }
        return getNumber(value);
    }

    var timeMap = {
        'slow' : 600,
        'fast' : 200
    };

    function doEffect(element, properties, duration, easing, complete) {
        var props = [], origins = {}, targets = {}, units = {}, origin, motion, step;

        if (jxn.isFunction(properties)) {
            properties = properties.call(element);
            if (!properties || !jxn.isObject(properties)) {
                jxn.error('function as first param, should return an object');
                properties = {};
            }
        }
        if (jxn.isFunction(duration)) {
            complete = duration;
            duration = properties.duration;
        }

        if (jxn.isFunction(easing)) {
            complete = easing;
            easing = 'linear';
        }

        if (jxn.isObject(duration)) {
            var options = duration;
            duration = options.duration;
            easing = options.easing;
            complete = options.complete;
            step = options.step;
        }
        duration = jxn.isNumber(duration) ? duration : (timeMap[duration] || 1000);

        motion = element.__jxnMotion;
        var isNew = motion.isNew;
        motion.isNew = false;

        jxn.forEach(properties, function(name, value) {
            name = string.camelCase(name);
            props.push(name);
            origin = getNumber(jxn.css(element, name) || '0');
            origins[name] = origin;
            targets[name] = getTarget(value, origin);
            units[name] = getUnits(origin, value);
        });

        var propsLen = props.length;
        if (propsLen == 0) {
            // it's delay, setTimeout
        }

        motion.onTweening = function() {
            for (var i = 0, prop, value; i < propsLen; i++) {
                prop = props[i];
                value = this.equation(origins[prop], targets[prop]);
                if (units[prop]) {
                    value = value + units[prop];
                }
                jxn.css(element, prop, value);
            }
            jxn.isFunction(step) && step.call(element, this.equation(0, this.frames), this.frames, motion);
        };

        motion.onComplete = function() {
            for (var i = 0, prop, value; i < propsLen; i++) {
                prop = props[i];
                value = targets[prop];
                if (units[prop]) {
                    value = value + units[prop];
                }
                if (jxn.css(element, prop) != value) {
                    jxn.css(element, prop, value);
                }
            }
            jxn.isFunction(complete) && complete.call(element, this.frames, motion);
            this.tweening = false;
            if (element.__motionQueue && element.__motionQueue.length != 0) {
                var args = element.__motionQueue.shift();
                doEffect.apply(element, args);
            }
        };
        if (!isNew) {
            motion.reset(easing, duration);
        }
        motion.start();
        element.__motion = motion;
    }

    var Effect = {
		animate: function(element, properties, duration, easing, complete) {
            if (!properties) {
                jxn.error('need params for animate');
                return;
            }
            var motion, realEasing = easing, realDuration = duration;
            if (jxn.isFunction(realEasing)) {
                realEasing = 'linear';
            }
            if (!element.__jxnMotion) {
                if (jxn.isObject(duration)) {
                    realEasing = duration.easing;
                    realDuration = duration.duration;
                }
                element.__jxnMotion = new Motion(realEasing, realDuration);
                element.__jxnMotion.isNew = true;
            }
            motion = element.__jxnMotion;
            if (motion.tweening) {
                element.__motionQueue = element.__motionQueue || [];
                element.__motionQueue.push(jxn.slice.call(arguments));
                return;
            }

            doEffect.apply(element, arguments);
		},

		clearQueue: function(element){
            var queue = element.__motionQueue;
            if (!queue) {
                return;
            }
            for (var i = 0, l = queue.length; i < l; i++) {
                queue[i] = null;
            }
            element.__motionQueue = null;
		},

		delay: function(element, time, callback) {
            jxn.animate(element, {}, time, 'linear', callback);
		},
		dequeue: function(){
		
		},
		fadeOut: function(element, speed, callback) {
            jxn.animate(element, {
                'opacity' : '0'
            }, speed, 'easeIn', function() {
                jxn.css(element, 'opacity', '0');
                jxn.data(element, 'display-bak', jxn.css(element, 'display'));
                jxn.css(element, 'display', 'none');
                callback && callback.apply(element, arguments);
            });
		},
		fadeIn: function(element, speed, callback){
            var prepare = function() {
                jxn.css(element, 'display', jxn.data(element, 'display-bak') || '');
                jxn.css(element, 'opacity', '0');
                return {'opacity': '1'};
            };
            jxn.animate(element, prepare, speed, 'easeOut', function() {
                jxn.css(element, 'opacity', '1');
                jxn.removeData(element, 'display-bak');
                callback && callback.apply(element, arguments);
            });
		},
		fadeTo: function(element, speed, opacity, callback) {
            var prepare = function() {
                if (opacity != 0) {
                    jxn.css(element, 'display', jxn.data(element, 'display-bak') || '')
                    jxn.removeData(element, 'display-bak');
                }
                return {'opacity': opacity};
            }
            jxn.animate(element, prepare, speed, 'linear', function() {
                jxn.css(element, 'opacity', opacity);
                callback && callback.apply(element, arguments);
            });
		},
		fadeToggle: function(){
		
		},
		fx: {
			interval: function(){
			},

			off: function() {
			}
		},
		queue: function(){
		
		},
		slideDown: function(element, speed, callback) {
             var prepare = function() {
                 var height, display, opacity, node;
                 if (jxn.data(this, 'animate-height-bak')) {
                     height = jxn.data(this, 'animate-height-bak');
                     display = jxn.data(this, 'animate-display-bak');
                     opacity = jxn.data(this, 'animate-opacity-bak');
                 } else {
                     node = jxn('<' + this.tagName + '>').appendTo('body');
                     height = node.css('height');
                     display = node.css('display');
                     opacity = node.css('opacity');
                     node.remove();
                 }
                 jxn.css(this, 'display', display);
                 jxn.css(this, 'height', '0px');
                 return {
                     'height' : height,
                     'opacity' : opacity
                 };
             };
             jxn.animate(element, prepare, speed, 'easeIn', callback);
		},
		slideToggle: function(){
		
		},
		slideUp: function(element, speed, callback) {
              var prepare = function() {
                 jxn.data(this, 'animate-height-bak', jxn.css(this, 'height'));
                 jxn.data(this, 'animate-opacity-bak', jxn.css(this, 'opacity'));
                 jxn.data(this, 'animate-display-bak', jxn.css(this, 'display'));
                 return {
                     'height' : '0px',
                     'opacity' : 0
                 };
             };
             jxn.animate(element, prepare, speed, 'easeIn', function() {
                 jxn.css(element, 'opacity', '0');
                 jxn.css(element, 'display', 'none');
                 callback && callback.call(element, arguments);
             });
		},
        start: function(element) {
            element.__jxnMotion && element.__jxnMotion.start();
        },
		stop: function(element) {
            element.__jxnMotion && element.__jxnMotion.stop();
		},
        hold: function(element) {
            element.__jxnMotion && element.__jxnMotion.hold();
        },
        goon: function(element) {
            element.__jxnMotion && element.__jxnMotion.goon();
        }
	};
    jxn.registerPlugin('Effect', Effect, ['animate']);
})(jxn);

/* import from d:\workhome\workspace\jxn\src\position.js */ 

/*--------------------------- Position ---------------------------*/
(function(jxn, undefined) {
    var rroot = /^(?:body|html)$/i;

    var Position = {
        position : function(element) {
            if (!element) {
                return null;
            }
            var ele = jxn(element), 
                offsetParent = ele.offsetParent(),
                offset   = ele.offset(),
                parentOffset = rroot.test(offsetParent[0].nodeName) ? { top: 0, left: 0 } : offsetParent.offset();

            offset.top  -= parseFloat( jxn.css(element, "marginTop") ) || 0;
            offset.left -= parseFloat( jxn.css(element, "marginLeft") ) || 0;

            parentOffset.top  += parseFloat( jxn.css(offsetParent[0], "borderTopWidth") ) || 0;
            parentOffset.left += parseFloat( jxn.css(offsetParent[0], "borderLeftWidth") ) || 0;

            return {
                top:  offset.top  - parentOffset.top,
                left: offset.left - parentOffset.left
            };
        },

        scrollTop : function(element, value) {
            if (value !== undefined) {
                var win = jxn.getWindow(element);
                if (win) {
                    win.scrollTo(jxn(win).scrollLeft(), value);
                } else {
                    element.scrollTop = value;
                }
                return;
            }
            var win = jxn.getWindow(element);
            
            if (win) {
                if ('pageYOffset' in win) {
                    return win.pageYOffset;
                }
                var body = win.document.body;
                var docEle = win.document.documentElement;
                docEle = (docEle.clientWidth) ? docEle : body;
                return docEle.scrollTop;
            } else {
                return element.scrollTop;
            }
        },

        scrollLeft : function(element, value) {
            if (value !== undefined) {
                var win = jxn.getWindow(element);
                if (win) {
                    win.scrollTo(value, jxn.scrollTop(win));
                } else {
                    element.scrollLeft = value;
                }
                return;
            }
            var win = jxn.getWindow(element);
            if (win) {
                if ('pageXOffset' in win) {
                    return win.pageXOffset;
                }
                var body = win.document.body;
                var docEle = win.document.documentElement;
                docEle = (docEle.clientWidth) ? docEle : body;
                return docEle.scrollLeft;
            } else {
                return element.scrollLeft;
            }
        }
	};

    jxn.registerPlugin('Position', Position, ['position', 'scrollLeft', 'scrollTop']);
})(jxn);

/* import from d:\workhome\workspace\jxn\src\offset.js */ 

/*--------------------------- Offset ---------------------------*/
(function(jxn, undefined) {
    var rroot = /^(?:body|html)$/i;

    // 参考mootools
	function getDOMLeftTop(ele) {
		if (ele.getBoundingClientRect) {
			var bound = ele.getBoundingClientRect(),
                html = ele.ownerDocument.documentElement,
                scroll = {x:getScrollLeft(ele), y:getScrollTop(ele)},
                isFixed = (ele.style.position == 'fixed');
			return {
				left: parseInt(bound.left, 10) + ((isFixed) ? 0 : scroll.x) - html.clientLeft,
				top: parseInt(bound.top, 10) +  ((isFixed) ? 0 : scroll.y) - html.clientTop
			};
		}

		var element = ele, position = {left: 0, top: 0};
		if (ele.tagName == 'BODY') return position;

		while (element && element.tagName != 'BODY'){
			position.left += element.offsetLeft;
			position.top += element.offsetTop;

			if (ua.ua.gecko){
				if (!borderBox(element)){
					position.left += parseFloat(element.style.borderLeftWidth);
					position.top += parseFloat(element.style.borderTopWidth);
				}
				var parent = element.parentNode;
				if (parent && parent.style.overflow != 'visible'){
					position.left += parseFloat(parent.style.borderLeftWidth);
					position.top += parseFloat(parent.style.borderTopWidth);
				}
			} else if (element != ele && ua.ua.webket){
				position.left += parseFloat(element.style.borderLeftWidth);
				position.top += parseFloat(element.style.borderTopWidth);
			}

			element = element.offsetParent;
		}
		if (ua.ua.gecko && ele.style.MozBoxSizing != 'border-box'){
			position.left -= parseFloat(ele.style.borderLeftWidth);
			position.top -= parseFloat(ele.style.borderTopWidth);
		}
		return position;
	}

	function getScrollTop(ele) {
		if(document.documentElement && document.documentElement.scrollTop) {
			return document.documentElement.scrollTop;
		} else {
			return document.body.scrollTop;
		}
	}

	function getScrollLeft(ele) {
		if(document.documentElement && document.documentElement.scrollLeft) {
			return document.documentElement.scrollLeft;
		} else {
			return document.body.scrollLeft;
		}
	}

    function getWidthOrHeight(element, name, value) {
        var prop = name.toLowerCase();
        if (jxn.isWindow(element)) {
            var docElemProp = element.document.documentElement["client" + name],
                body = element.document.body;
            return element.document.compatMode === "CSS1Compat" && docElemProp ||
                body && body["client" + name] || docElemProp;
        } else if (jxn.isDocument(element)) {
            return Math.max(
                element.documentElement["client" + name],
                element.body["client" + name], element.documentElement["client" + name],
                element.body["client" + name], element.documentElement["client" + name]
            )
        }
        if (value !== undefined) {
            if (jxn.isNumber(value)) {
                value = value + 'px';
            }
            jxn.css(element, prop, value);
            return;
        }
        return parseInt(jxn.css(element, prop));
    }

    var Offset = {
        offsetParent: function(element) {
            var offsetParent = element.offsetParent || document.body;
			while (offsetParent && (!rroot.test(offsetParent.nodeName) && jxn.css(offsetParent, "position") === "static") ) {
				offsetParent = offsetParent.offsetParent;
			}
			return jxn(offsetParent);
        },
        offset: function(element) {
            return getDOMLeftTop(element);
        },
        width: function(element, width) {
            return getWidthOrHeight(element, 'Width', width);
        },
        height: function(element, height){
            return getWidthOrHeight(element, 'Height', height);
        },
        innerWidth: function(element){
        	return element.offsetWidth;
        },
        innerHeight: function(element) {
        	return element.offsetHeight;
        },
        outerWidth: function(){

        },
        outerHeight: function(){
        }			
	};
    jxn.registerPlugin('Offset', Offset);
})(jxn);

/* import from d:\workhome\workspace\jxn\src\data.js */ 

/*--------------------------- Data ---------------------------*/
(function(jxn, undefined) {
    var propFix = {
        tabindex: 'tabIndex',
        readonly: 'readOnly',
        'for': 'htmlFor',
        'class': 'className',
        maxlength: 'maxLength',
        cellspacing: 'cellSpacing',
        cellpadding: 'cellPadding',
        rowspan: 'rowSpan',
        colspan: 'colSpan',
        usemap: 'useMap',
        frameborder: 'frameBorder',
        contenteditable: 'contentEditable'
    }, rboolean = /^(?:autofocus|autoplay|async|checked|controls|defer|disabled|hidden|loop|multiple|open|readonly|required|scoped|selected)$/i;

    function isBooleanValueIn(element, attr) {
        return rboolean.test(attr) && attr in element;
    }
    function setAttributeToElement(element, name, value, prefix) {
        prefix = prefix || '';
        if (jxn.isObject(name)) {
            for (var prop in name) {
                if (!name.hasOwnProperty(prop)) {
                    continue;
                }
                setAttributeToElement(element, prop, name[prop], prefix);
            }
            return;
        }
        if (value === undefined) {
            var attr = prefix + name,
                returned = null, tmp, value;
            if (isBooleanValueIn(element, attr)) {
                value = element[attr];
                value = !!value && value != 'false';
                return value
            } else {
                returned = element.getAttribute(attr);
                if (jxn.isString(returned) &&
                    jxn.trim(returned).indexOf('{') == 0) {
                    try {
                        tmp = JSON.parse(returned);
                    } catch (e) {}
                }
                value = tmp || returned;
            }
            return value;
        } else {
            if (jxn.isObject(value)) {
                element.setAttribute(prefix + name, JSON.stringify(value));
            } else {
                element.setAttribute(prefix + name, value);
            }
            var attr = prefix + name;
            if (isBooleanValueIn(element, attr)) {
                element[attr] = value;
            }
        }
    }

    var Data = {
        attr: function(element, name, value) {
            return setAttributeToElement(element, name, value);
        },
        data: function(element, name, value) {
            return setAttributeToElement(element, name, value, 'data-');
        },
        removeAttr: function(element, attrName) {
            if (element.nodeType != 1) {
                return;
            }
            attrName = propFix[attrName] || attrName;
            if (element.removeAttribute) {
                element.setAttribute(attrName, '');
                element.removeAttribute(attrName);
                if (rboolean.test(attrName) && attrName in element) {
                    element[attrName] = false;
                }
            }
        },
        removeData: function(element, name) {
            name = 'data-' + name;
            if (element.removeAttribute) {
                element.removeAttribute(name);
            } else {
                element[name] = null;
                try {
                    delete element[name];
                } catch (e) {}
            }
        }
    };
    jxn.registerPlugin('Data', Data, ['attr', 'data', 'removeData']);
})(jxn);

/* import from d:\workhome\workspace\jxn\src\browser.js */ 

/*--------------------------- Browser ---------------------------*/
(function(jxn, undefined) {
    var Browser = {};

    for (var prop in ua.ua) {
        Browser[prop] = ua.ua[prop];
    }

    Browser.version = ua.ua[ua.ua.shell];
    Browser[ua.ua.shell] = true;

    jxn.browser = {};
    jxn.extend(jxn.browser, Browser);
})(jxn);

/* import from d:\workhome\workspace\jxn\src\plugins\cookie.js */ 

/*--------------------------- jxn Cookie Plugin ---------------------------*/
(function(jxn, undefined) {

    var TIMER = 24 * 60 * 60 * 1000;

    jxn.cookie = function(name, value, options) {
        if (typeof value != 'undefined') {
            jxn.cookie.set(name, value, options);
        } else {
            return jxn.cookie.get(name);
        }
    };

    jxn.cookie.get = function(name) {
        var cookie = document.cookie, cookies;
        if (!cookie || cookie == '') {
            return null;
        }
        if (!name) {
            return cookie;
        }
        name = jxn.trim(name);
        cookies = cookie.split(';');
        for (var i = 0, parts, current, l = cookies.length; i < l; i++) {
            current = jxn.trim(cookies[i]);
            parts = current.split('=');
            if (jxn.trim(parts[0]) == name) {
                return decodeURIComponent(jxn.trim(parts[1]));
            }
        }
        return null;
    };

    jxn.cookie.set = function(name, value, options) {
        var expires = '', date, path, domain, secure;
        options = options || {};
        if (value === null) {
            value = '';
            options.expires = -1;
        }
        if (options.expires) {
            if (jxn.isNumber(options.expires)) {
                date = new Date();
                date.setTime(date.getTime() + options.expires * TIMER);
            } else if (options.expires.toUTCString) {
                date = options.expires;
            }
            expires = '; expires=' + date.toUTCString();
        }
        path = options.path ? '; path=' + options.path : '';
        domain = options.domain ? '; domain=' + options.domain : '';
        secure = options.secure ? '; secure' : '';
        document.cookie = [name, '=', encodeURIComponent(value), expires, path, domain, secure].join('');
    };

    jxn.cookie.remove = function(name) {
        jxn.cookie.set(name, null);
    };

})(jxn);

/* import from d:\workhome\workspace\jxn\src\plugins\delayDo.js */ 

/*--------------------------- jxn delayDo Plugin ---------------------------*/
(function(jxn, undefined) {
	var DEFAULT_PRI = 2;
		DELAY_FACTOR = {
			ieshell: {
				'6': 3,
				'7': 2.5,
				'8': 2,
				'9': 1.5,
				'10': 1.3,
				'other': 1.2
			},
			firefox: 1.2,
			chrome: 1,
			other: 1
		}, cache = {}, DELAY_GID = 0;

	function getDelayFactor(browser, version) {
		if (!(browser in DELAY_FACTOR)) {
			return DELAY_FACTOR['other'];
		}
		var factorObj = DELAY_FACTOR[browser];
		if (!jxn.isObject(factorObj)) {
			return factorObj;			
		}
		return factorObj[version] || factorObj['other'];
	}

    jxn.delayDo = function(fn, priority) {
    	fn._gid = fn._gid || DELAY_GID++;
        var factor, timer;
        if (!fn || !jxn.isFunction(fn)) {
            console.error('please use delayDo like "delayDo(function, priority)"');
            return;
        }

        if (fn._gid in cache) {
        	jxn.clearDelayDo(fn._gid);
        }
        priority = priority || DEFAULT_PRI;
        factor = getDelayFactor(jxn.browser.shell, jxn.browser.version);
        timer = setTimeout(function() {
        	fn();
        	jxn.clearDelayDo(fn);
        }, priority * factor * 1000);
        cache[fn._gid] = timer;
    };

    jxn._getDelayDos = function() {
    	return cache;
    };

    jxn.delayDoOrEvent = function(fn, priority, obj, eventName) {
    	if (!jxn.isNumber(priority)) {
    		eventName = obj;
    		obj = priority;
    		priority = DEFAULT_PRI;
    	}
    	if (!obj) {
    		jxn.delayDo(fn, priority);
    		return;
    	}
    	var wrapper = function() {
    		eventFlag && obj.off(eventName, wrapper);
    		jxn.clearDelayDo(wrapper);
    		fn();
    	}, eventFlag;
    	jxn.delayDo(wrapper, priority);
    	if (obj == 'domready') {
    		jxn(wrapper);
    	} else {
    		obj = jxn(obj);
    		eventFlag = true;
    		obj.on(eventName, wrapper);
    	}
    };

    jxn.clearDelayDo = function(gid) {
    	if (jxn.isFunction(gid)) {
    		gid = gid._gid;
    	}
    	if (gid in cache) {
    		clearTimeout(cache[gid]);
    		cache[gid] = null;
    		delete cache[gid];
    	}
    };

})(jxn);

/* import from d:\workhome\workspace\jxn\src\plugins\lazyLoad.js */ 

/*--------------------------- jxn lazyLoad Plugin ---------------------------*/
(function(jxn, undefined) {
    var viewportHeight, inited = false, nodes = {},
        DEFAULT_FREQUENCY = 3;

    function inViewPort(node, delta) {
        var min = jxn(document).scrollTop() - delta, 
            max = min + viewportHeight + delta * 2,
            top = node.position().top,
            bottom = top + node.innerHeight();

        return min < top && top < max || min < bottom && bottom < max;
    }

    function getViewportHeight() {
        var height, docEle = document.documentElement;
        if(typeof window.innerHeight != 'undefined') {
            height = window.innerHeight;
        } else if (typeof docEle !== 'undefined' && typeof docEle.clientHeight !== 'undefined' && docEle.clientHeight != 0) {
            height = docEle.clientHeight;
        } else {
            height = document.getElementsByTagName('body')[0].clientHeight;
        }
        return height;
    }

    function doConsume(prop, propNodes) {
        var len = propNodes.length, delta = propNodes.delta;
        if (len == 0) {
            return;
        }

        for(var i = 0, current; i < len; i++) {
            current = jxn(propNodes[i]);
            if (!inViewPort(current, delta)) {
                continue;
            }
            if (prop == 'value') {
                current.val(current.data(prop)).removeData(prop);
            } else {
                current.attr(prop, current.data(prop)).removeData(prop);
            }
            propNodes.splice(i, 1);
            i--;
            len--;
        }
    }

    function consumeNodes() {
        jxn.forEach(nodes, function(prop, propNodes) {
            doConsume(prop, propNodes);
        });
    }

    jxn._lazyLoadNodes = function() {
        return nodes;
    };

	jxn.lazyLoad = function(selector, options) {
        options = options || {};
        var prop = options.prop || 'src',
            fast = !!options.fast,
            frequency = jxn.isNumber(options.frequency) ? options.frequency : DEFAULT_FREQUENCY,
            delta = options.delta || 0,
            parent = jxn(options.parent || document.body),
            eventName;

        nodes[prop] = jxn(selector, parent);
        nodes[prop].delta = delta;

        if (inited) {
            return;
        }
        inited = true;
        eventName = (fast === true) ? 'scroll' : ('scroll/' + frequency);
        //console.log(eventName)
        jxn(window).on('resize', function() {
            viewportHeight = getViewportHeight();
            consumeNodes();
        }).on(eventName, function() {
            consumeNodes();
        });

        viewportHeight = getViewportHeight();
        consumeNodes();
    };

    jxn.addLazyLoadNodes = function(newNodes, options) {
        options = options || {};
        var prop = options.prop || 'src', 
            propNodes = nodes[prop] = nodes[prop] || [], 
            selector = options.selector || '[data-' + prop + ']';

        for(var i = 0, current, l = newNodes.length; i < l; i++) {
            current = jxn(newNodes[i]);
            if (!current.data(prop)) {
                current = jxn(selector, current);
            }
            if (current.length != 0) {
                propNodes.push(current);
            }
        }
        doConsume(prop, propNodes);
    };
})(jxn);
/* import from d:\workhome\workspace\jxn\src\plugins\localstorage.js */ 

/*--------------------------- jxn localStorage Plugin ---------------------------*/
(function(jxn, undefined) {

	function createDOMStorageNode(storageName, expiresDay) {
		var dataHolder = document.createElement('div');
		dataHolder.style.display = 'none';
		dataHolder.style.behavior = "url(#default#userData)";
        var expires = new Date();
        expires.setDate(expires.getDate() + expiresDay);
        dataHolder.expires = expires.toUTCString();
		document.body.appendChild(dataHolder);
		return dataHolder;
	}

    /**
	 * 为不支持本地存储的浏览器模拟本地存储的类
	 */
	var Storage = new Class(function() {

		this.initialize = function(self, storageName, expires) {
			self.__storageName = storageName || "ObjectJSLocalStorage";
			self.__expires = expires || 365 * 100;
			self.__storageHolder = createDOMStorageNode(self.__storageName, self.__expires);
		};

		this.setItem = function(self, key, value) {
			var storageHolder = self.__storageHolder,
				storageName = self.__storageName;
			var oldValue = self.getItem(key);
			storageHolder.load(storageName);
			storageHolder.setAttribute(key, value);
			storageHolder.save(storageName);
		};

		this.getItem = function(self, key) {
			var storageHolder = self.__storageHolder,
				storageName = self.__storageName;
			storageHolder.load(storageName);
			return storageHolder.getAttribute(key);
		};

		this.removeItem = function(self, key) {
			var storageHolder = self.__storageHolder,
				storageName = self.__storageName;
			var oldValue = self.getItem(key);
			storageHolder.load(storageName);
			storageHolder.removeAttribute(key);
			storageHolder.save(storageName);
		};

		this.clear = function(self) {
			var storageHolder = self.__storageHolder,
				storageName = self.__storageName;
			storageHolder.load(storageName);
			var expiresDate = new Date();
			expiresDate.setDate(expiresDate.getDate() - 1);
			storageHolder.expires = expiresDate.toUTCString();
			storageHolder.save(storageName);
			document.body.removeChild(self.__storageHolder);
			self.__storageHolder = createDOMStorageNode(self.__storageName, self.__expires);
		};

	});

    var supportLocalStorage = ('localStorage' in window) && window['localStorage'] != null,
        storageContainer,
        tmpStorage = {};
    
    if (supportLocalStorage) {
        storageContainer = window.localStorage;
    } else {
        jxn(function() {
            storageContainer = new Storage();
            jxn.forEach(tmpStorage, function(name, value) {
                storageContainer.setItem(name, value);
                delete tmpStorage[name];
            });
            tmpStorage = null;
        });
    }

    jxn.storage = function(name, value) {
        if (value === undefined) {
            return jxn.storage.get(name);
        } else {
            jxn.storage.set(name, value);
        }
    };

    jxn.storage.set = function(name, value) {
        if (jxn.isObject(value)) {
            value = JSON.stringify(value);
        }
        if (!storageContainer) {
            tmpStorage[name] = value;
            return;
        }
        storageContainer.setItem(name, value);
    };

    jxn.storage.get = function(name) {
        if (!storageContainer) {
            return tmpStorage[name];
        }
        var returned = storageContainer.getItem(name), tmp;
        if (jxn.isString(returned) &&
            jxn.trim(returned).indexOf('{') == 0) {
            try {
                tmp = JSON.parse(returned);
            } catch (e) {}
        }
        return tmp || returned;
    };

    jxn.storage.remove = function(name) {
        if (!storageContainer) {
            delete tmpStorage[name];
            return;
        }
        storageContainer.removeItem(name);
    };

    jxn.storage.clear = function() {
        if (!storageContainer) {
            tmpStorage = {};
            return;
        }
        storageContainer.clear();
    };
})(jxn);

/* import from d:\workhome\workspace\jxn\src\plugins\scrollTo.js */ 

/*--------------------------- jxn scrollTo Plugin ---------------------------*/
(function(jxn, undefined) {
    var jxnDoc = jxn(document);

    jxn.scrollViewportTo = function(element, options) {
        if (!element && element !== 0) {
            return;
        }
        options = options || {};
        var userDelta = options.delta || 0,
            currentTop = jxnDoc.scrollTop(),
            target = (element === 0 ? 0 : (jxn(element).position().top)) + userDelta,
            delta = target - currentTop,
            noEffect = options.noEffect || false,
            easing = options.easing || 'easeOut';

        if (noEffect) {
            jxnDoc.stop().clearQueue().scrollTop(target);
            return;
        }

        jxnDoc.stop().clearQueue().animate({}, {
            step: function(current, total) {
                jxnDoc.scrollTop(currentTop + Math.floor(delta * current / total));
            },
            duration: 500,
            easing: easing
        });
    };
})(jxn);

/* import from d:\workhome\workspace\jxn\src\plugins\specialScroll.js */ 

/*--------------------------- jxn localStorage Plugin ---------------------------*/
(function(jxn, undefined) {
    jxn._specialEvents = jxn._specialEvents || [];

    var reg = /^scroll\/\d+$/,
        specialScrolls = {}, 
        GID = 0, 
        scrollFactors = {
            ieshell: 20,
            firefox: 1.4,
            chrome: 1,
            other: 1
        }, timers = {};

    function buildHandler(counter, timer, times, gid, eventHandler) {
        return function() {
            var _this = this, _args = arguments, interval = times * 100;
            if (interval > 2000) {
                interval = 2000;
            }
            if (counter == 0) {
                timer && clearTimeout(timer);
                timer = setTimeout(function() {
                    eventHandler.apply(_this, _args);
                    //console.log('timer', counter, times)
                    counter = 0;
                    timer = null;
                    delete timers[gid];
                }, interval);
                timers[gid] = timer;
            }
            counter ++;
            if (counter >= times - 1) {
                //console.log('scroll', counter, times)
                eventHandler.apply(_this, _args);
                counter = 0;
                if (timer) {
                    clearTimeout(timer);
                    timer = null;
                    delete timers[gid];
                }
            }
        };
    }
    function onSpecialScroll(element, eventType, eventHandler, bubble) {
        var gid = eventHandler._scroll_gid = GID++, originTimes;
        originTimes = parseInt(eventType.split('/')[1]);
        if (isNaN(originTimes)) {
            jxn.error('scroll/N, N should be a number');
            return;
        }
        
        times = originTimes * (scrollFactors[jxn.browser.shell] || scrollFactors['other']);

        var counter = 0, timer = null, handler = buildHandler(counter, timer, times, gid, eventHandler);
        specialScrolls[eventHandler._scroll_gid] = handler;
        dom.wrap(element).addEvent('scroll', handler, bubble);
    }

    function offSpecialScroll(element, eventType, eventHandler, bubble) {
        var gid = eventHandler._scroll_gid, timer = timers[gid];
        dom.wrap(element).removeEvent('scroll', specialScrolls[eventHandler._scroll_gid], bubble);
        if (timer) {
            clearTimeout(timer);
            timer = null;
            delete timers[gid];
        }
    }

    jxn._specialEvents.push({
        likes: function(eventName) {
            return reg.test(eventName);
        },
        on: onSpecialScroll,
        off: offSpecialScroll
    });
})(jxn);

/* import from d:\workhome\workspace\jxn\src\core-tail.js */ 

/* --------------- start of jxn-core-tail.js -------------------- */
    return jxn;
});
/* --------------- end of jxn-core-tail.js -------------------- */

/* import from d:\workhome\workspace\jxn\src\init.js */ 

if (!window.jxn) {
	object.use('jxn', function(jxn) {
	    window.jxn = jxn;
	});
}