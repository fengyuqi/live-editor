// Temporary solution until we get a full DB/UI implemented
var ExerciseMap = {
	// Starting point
	0: 537514895,
	
	// Intro to programming
	537514895: 527964494,
	
	// Intro to Variables 1
	527964494: 580591777,
	
	// Intro to Variables 2
	580591777: 612865753,
	
	// Basic computations
	612865753: 528949083,
	
	// Reading text
	528949083: 579066940,
	
	// Reading numbers
	579066940: 563383397,
	
	// Conditions
	// 563383397
	
	// For testing:
	1: 18
};

$(document).delegate( "a.ui-button", {
	mouseenter: function() {
		if ( !$(this).hasClass( "ui-state-disabled" ) ) {
			$(this).addClass( "ui-state-hover" );
		}
	},
	
	mouseleave: function() {
		$(this).removeClass( "ui-state-hover" );
	},

	click: function( e ) {
		e.preventDefault();
		
		if ( !$(this).hasClass( "ui-state-disabled" ) ) {
			$(this).trigger( "buttonClick" );
		}
	}
});

$(document).delegate( ".tipbar .close", "click", function() {
	$(this).parents(".editor-box").hideTip();
	focusProblem();
	return false;
});

$(document).delegate( ".tipbar .tipnav a", "click", function() {
	if ( !$(this).hasClass( "ui-state-disabled" ) ) {
		var box = $(this).parents(".editor-box"),
			tipData = box.data( "tipData" );
		
		tipData.pos += $(this).hasClass( "next" ) ? 1 : -1;
		box.showTip();
	}
	
	focusProblem();
	
	return false;
});

$(document).delegate( ".tipbar.error .text-wrap a", "click", function() {
	var box = $(this).parents(".editor-box"),
		tipData = box.data( "tipData" ),
		error = tipData.Error[ tipData.pos ];
	
	setCursor( error );
	
	return false;
});

$(document).delegate( ".tipbar form", "submit", function() {
	var box = $(this).parents(".editor-box"),
		tipData = box.data( "tipData" ),
		answer = tipData.Question[ tipData.pos ].answer,
		input = $(this).find("input").first().val();
	
	extractResults();
	
	if ( answer === input ) {
		problemDone();
	}
	
	$(this)
		.find( ".status" ).remove().end()
		.append( "<p class='status'><span class='ui-icon ui-icon-circle-" + 
			(answer === input ? "check" : "close") + "'></span> " +
			(answer === input ? "Correct! Proceed to the next problem." : "Incorrect, try again or view the hints for help.") + "</p>" );
	
	focusProblem();
	
	return false;
});

jQuery.fn.showTip = function( type, texts, callback ) {
	var tipData = this.data( "tipData" );
	
	if ( !tipData ) {
		tipData = { pos: 0 };
		this.data( "tipData", tipData );
	}
	
	type = type || tipData.cur;
	
	if ( texts ) {
		tipData.pos = 0;
		tipData[ type ] = texts;
		tipData.callback = callback;
	}
	
	tipData.cur = type;
	texts = texts || tipData[ type ];
	
	var pos = tipData.pos,
		bar = this.find(".tipbar")
		.attr( "class", "tipbar ui-state-hover " + type.toLowerCase() )
		
		// Inject current text
		.find( "strong" ).text( type + ( texts.length > 1 ? " #" + (pos + 1) : "" ) + ":" ).end()
		.find( ".text" ).html( texts[ pos ].text || texts[ pos ] || "" ).end()
		.find( "a.prev" ).toggleClass( "ui-state-disabled", pos === 0 ).end()
		.find( "a.next" ).toggleClass( "ui-state-disabled", pos + 1 === texts.length ).end();
	
	bar.find( ".tipnav" ).toggle( texts.length > 1 );
	
	// Only animate the bar in if it's not visible
	if ( !bar.is(":visible") ) {
		bar
			.css({ bottom: -30, opacity: 0.1 })
			.show()
			.animate({ bottom: this.find(".toolbar").is(":visible") ? 33 : 0, opacity: 1.0 }, 300 );
	}
	
	if ( tipData.callback ) {
		tipData.callback( texts[ pos ] );
	}
	
	return this;
};

jQuery.fn.hideTip = function( type ) {
	var tipData = this.data( "tipData" );
	
	if ( testAnswers && testAnswers.length > 0 ) {
		showQuestion();
	
	} else if ( tipData && (!type || type === tipData.cur) ) {
		this.find(".tipbar").animate({ bottom: -30, opacity: 0.1 }, 300, function() {
			$(this).hide();
		});
	}
	
	return this;
};

jQuery.fn.toggleTip = function( type, texts, callback ) {
	var tipData = this.data( "tipData" );
	
	if ( !tipData || !this.find(".tipbar").is(":visible") || tipData.cur !== type ) {
		this.showTip( type, texts, callback );
		
	} else {
		this.hideTip();
	}
	
	return this;
};

jQuery.fn.buttonize = function() {
	return this.find(".ui-button")
		.addClass( "ui-widget ui-state-default ui-corner-all" )
		.find("span:first").addClass( "ui-button-icon-primary ui-icon" ).end()
		.filter(":has(.ui-button-text)")
			.addClass( "ui-button-text-icon-primary" )
		.end()
		.not(":has(.ui-button-text)")
			.addClass( "ui-button-icon-only" )
			.append( "<span class='ui-button-text'>&nbsp;</span>" )
		.end()
	.end();
};

jQuery.fn.editorText = function( text ) {
	var editor = this.data("editor");
	
	if ( text != null ) {
		if ( editor && editor.editor ) {
			editor.editor.getSession().setValue( text );
		}
		
	} else {
		return editor && editor.editor ?
			editor.editor.getSession().getValue().replace(/\r/g, "\n") :
			null;
	}
	
	return this;
};

jQuery.fn.extractCursor = function( testObj ) {
	var cursor = this.data( "editor" ).editor.getCursorPosition();
	
	testObj.cursorRow = cursor.row;
	testObj.cursorColumn = cursor.column;
	
	return this;
};

jQuery.fn.setCursor = function( testObj, focus ) {
	if ( testObj && (testObj.cursorRow != null || testObj.row != null) ) {
		var editor = this.data( "editor" ).editor;
		
		editor.moveCursorToPosition({
			row: testObj.cursorRow || testObj.row || 0,
			column: testObj.cursorColumn || testObj.column || 0
		});
		
		editor.clearSelection();
		
		if ( focus !== false ) {
			editor.focus();
		}
	}
};

var setCursor = function( testObj ) {
	$("#editor").setCursor( testObj );
};

var formatTime = function( seconds ) {
	var min = Math.floor( seconds / 60 ),
		sec = Math.round( seconds % 60 );
	
	return min + ":" + (sec < 10 ? "0" : "") + sec;
};

var getExerciseList = function( callback ) {
	$.getJSON( "/api/labs/videoexercises", callback );
};

var getExercise = function( id, callback ) {
	$.getJSON( "/api/labs/videoexercises/" + id, function( exerciseData ) {
		lastSave = JSON.stringify( exerciseData );
		
		// Load in the user's saved progress
		loadResults( exerciseData, callback );
	});
};

var saveExercise = function( callback ) {
	// Make sure we get the latest data
	extractProblem( curProblem );
	
	var data = JSON.stringify( Exercise );
	
	$.ajax({
		url: "/api/labs/videoexercises" + (Exercise.id ? "/" + Exercise.id : ""),
		data: data,
		dataType: "JSON",
		type: Exercise.id ? "PUT" : "POST",
		contentType: "application/json",
		success: function( exerciseData ) {
			lastSave = JSON.stringify( exerciseData );
			callback( exerciseData );
		}
	});		
};

var problemDone = function() {
	curProblem.done = true;

	$("#main-tabs-nav .ui-tabs-selected").markDone();

	$("#next-problem-desc").show();
	$(".next-problem").show();
	$("#code").addClass( "done" );
	
	if ( curProblem.solution ) {
		$("#solution-nav").removeClass( "ui-state-disabled" );
		$("#editor-box-tabs-nav").tabs( "select", 3 );
	}
};

jQuery.fn.markDone = function() {
	return this
		.next( "li" ).removeClass( "ui-state-disabled" ).end()
		.removeClass( "ui-state-disabled" )
 		.addClass( "icon-tab" )
		.find( "a" ).prepend( "<span class='ui-icon ui-icon-circle-check'></span>" ).end();
};

var saveResults = function( callback ) {
	var results = [],
		problems = Exercise.problems;
	
	for ( var i = 0; i < problems.length; i++ ) {
		var problem = problems[i];
		
		results.push({
			answer: problem.answer,
			done: problem.done,
			cursorRow: problem.cursorRow,
			cursorColumn: problem.cursorColumn
		});
	}
	
	window.localStorage[ "labs-cs-" + Exercise.id ] = JSON.stringify({ problems: results });
	
	if ( callback ) {
		callback();
	}
};

var loadResults = function( exercise, callback ) {
	var results = JSON.parse( window.localStorage[ "labs-cs-" + exercise.id ] || null );
	
	if ( results && results.problems ) {
		for ( var i = 0; i < results.problems.length; i++ ) {
			$.extend( exercise.problems[i], results.problems[i] );
		}
	}
	
	if ( callback ) {
		callback( exercise );
	}
};

var extractResults = function( code, callback ) {
	if ( testAnswers.length > 0 ) {
		code = $(".tipbar input").first().val();
	}
	
	if ( code !== curProblem.start || curProblem.answer != null ) {
		curProblem.answer = code;
	}
};

var openExerciseDialog = function( callback ) {
	var dialog = $("<div><ul><li>Loading...</li></ul></div>")
		.dialog({ title: "Open Exercise", modal: true });

	getExerciseList(function( exercises ) {
		var ul = dialog.find("ul");
	
		ul.html( exercises.length ? "" : "<li>No exercises found.</li>" );
	
		$.each( exercises, function() {
			var exercise = this;

			// TODO: Maybe show who created the exercise
			$("<li><a href=''>" + exercise.title + "</a></li>")
				.find("a").click(function() {
					ul.html( "<li>Loading exercise...</li>" );
				
					getExercise( exercise.id, function( exercise ) {
						callback( exercise );
					
						dialog.dialog( "destroy" );
					});

					return false;
				}).end()
				.appendTo( ul );
		});
	});
};

var connectAudio = function( callback ) {
	if ( window.SC && SC.isConnected() ) {
		if ( callback ) {
			callback();
		}
	
	} else {
		$.getScript( "http://connect.soundcloud.com/sdk.js", function() {
			SC.initialize({
				client_id: "82ff867e7207d75bc8bbd3d281d74bf4",
				redirect_uri: window.location.href.replace(/[^\/]*$/, "callback.html")
			});
		
			if ( window.Exercise && Exercise.audioID ) {
				SC.get( "/tracks/" + Exercise.audioID, function( data ) {
					if ( callback ) {
						callback( data );
					}
				});
			
			} else {
				SC.connect(function() {
					if ( callback ) {
						callback();
					}
				});
			}
		});
	}
};

(function() {
	var num, range, firstNum, slider, handle, decimal = 0, ignore = false;
	
	jQuery.fn.hotNumber = function() {
		var editor = this.data("editor").editor,
			selection = editor.session.selection;
		
		selection.on( "changeCursor", $.proxy( checkNumber, editor ) );
		selection.on( "changeSelection", $.proxy( checkNumber, editor ) );

		attachSlider();
		
		return this;
	};
	
	function attachSlider() {
		if ( !slider ) {
			slider = $("<div class='hotnumber'><div class='slider'></div><div class='arrow'></div>")
				.appendTo( "body" )
				.children( ".slider" ).slider({
					slide: function( e, ui ) {
						if ( handle ) {
							handle( ui.value );
						}
					}
				}).end()
				.hide();
		}
	}
	
	function checkNumber() {
		if ( ignore ) {
			return;
		}
		
		var editor = this,
			pos = editor.selection.getCursor(),
			line = editor.session.getDocument().getLine( pos.row ),
			before = pos.column - (/([\d.-]+)$/.test( line.slice( 0, pos.column ) ) ? RegExp.$1.length : 0);
	
		if ( /^([\d.-]+)/.test( line.slice( before ) ) && !isNaN( parseFloat( RegExp.$1 ) ) ) {
			var Range = require("ace/range").Range;
			
			num = RegExp.$1;
			firstNum = parseFloat( num );
			decimal = /\.(\d+)/.test( num ) ? RegExp.$1.length : 0;
			range = new Range( pos.row, before, pos.row, before + String( num ).length );
			
			handle = function( value ) {
				updateNumberSlider( editor, value );
			};
			
			var coords = editor.renderer.textToScreenCoordinates( pos.row, pos.column );
			slider.children().slider( "value", 50 );
			slider.css({ top: coords.pageY, left: coords.pageX }).show();
			
		} else {
			range = null;
			slider.hide();
		}
	}

	function updateNumberSlider( editor, newNum ) {
		if ( !range ) {
			return;
		}
		
		// Compute the offset, relative to the center position
		var offsetNum = firstNum === 0 ? newNum === 50 ? 0 : 1 : firstNum;
			curNum = newNum < 50 ? (50 - newNum) + 50 : newNum,
			offset = ((Math.log( offsetNum * 500 ) - Math.log( offsetNum * ((100 - curNum) * 10) )) * offsetNum);
		 
		newNum = firstNum + ((newNum < 50 ? -1 : 1) * (!isFinite( offset ) ? offsetNum * 4 : offset));
		newNum = newNum.toFixed( decimal );
		
		// Figure out the position of the old number to replace
		range.end.column = range.start.column + num.length;
		num = newNum;
		
		ignore = true;
		
		// Insert the new number
		editor.session.replace( range, newNum );
		
		// Select and focus the updated number
		range.end.column = range.start.column + num.length;
		editor.selection.setSelectionRange( range );
		editor.focus();
		
		ignore = false;
	}
})();