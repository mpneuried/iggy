KEYCODES = require( "../../utils/keycodes" )

class FacetSubsDateRange extends require( "./base" )
	template: require( "../../tmpls/daterange.jade" )

	forcedDateRangeOpts: =>
		opens: "right"

	events: =>
		return

	focus: ()=>
		if not @daterangepicker?
			_opts = _.extend( {}, @model.get( "opts" ), @forcedDateRangeOpts() )
			@$inp.daterangepicker( _opts, @_dateReturn )
			@daterangepicker = @$inp.data( "daterangepicker" )
			@daterangepicker.container?.addClass( "daterange-iggy" )

		else
			@daterangepicker.element = @$inp
			@daterangepicker.show()
			
		@$inp.on( "cancel.daterangepicker", @close )
		@$inp.on( "hide.daterangepicker", @close )
		return super
		
	close: =>
		super
		@$inp.off( "cancel.daterangepicker", @close )
		@$inp.off( "hide.daterangepicker", @close )
		return

	remove: =>
		@daterangepicker?.remove()
		@daterangepicker = null
		return super

	renderResult: =>
		_res = @getResults()

		_startDate = moment( _res.value[ 0 ] )
		_endDate = moment( _res.value[ 1 ] ) if _res.value[ 1 ]?

		_time = @model.get( "opts" ).timePicker

		_s = "<li>"
		_s += _startDate.format( ( if _time then "LLLL" else "LL" ) )

		if _endDate?
			_s += " - "
			_s += _endDate.format( ( if _time then "LLLL" else "LL" ) )

		_s += "</li>"

		return _s
	
	_hasTabListener: ->
		return false
	
	_dateReturn: ( @startDate, @endDate )=>
		@model.set( "value", @getValue( false ) )
		@select()
		return

	getTemplateData: =>
		return super

	getValue: ( predef = true )=>
		if predef
			_predefVal = @model.get( "value" )
			if _predefVal?
				if not _.isArray( _predefVal )
					_predefVal =  [ _predefVal ]
				[ @startDate, @endDate ] = _predefVal
				return _predefVal
		_out = [ @startDate.valueOf() ]
		_out.push @endDate.valueOf() if @endDate?
		return _out

	select: =>
		_ModelConst = @getSelectModel()
		_model = new _ModelConst( value: @getValue() )
		@result.add( _model )
		@trigger( "selected", _model )
		@close()
		return

module.exports = FacetSubsDateRange