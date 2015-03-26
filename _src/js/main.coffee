MainView = require( "./views/main" )
Facets = require( "./models/backbone_sub" )
FctString = require( "./models/facet_string" )
FctArray = require( "./models/facet_array" )
FctSelect = require( "./models/facet_select" )
FctNumber = require( "./models/facet_number" )
FctRange = require( "./models/facet_range" )
FctDateRange = require( "./models/facet_daterange" )
Results = require( "./models/results" )

class IGGY extends Backbone.Events
	$: jQuery
	constructor: ( el, facets = [], options = {} )->
		_.extend @, Backbone.Events
		@_initErrors()
		
		# init element
		@$el = @_prepareEl( el )
		@el = @$el[0]
		@$el.data( "iggy", @ )

		# init facets
		@facets = @_prepareFacets( facets )
		@results = new Results()

		@results.on "add", @triggerChange
		@results.on "remove", @triggerChange
		@results.on "change", @triggerChange

		new MainView( el: @$el, collection: @facets, results: @results )
		return

	_prepareEl: ( el )=>

		if not el?
			throw @_error( "EMISSINGEL" )

		if _.isString( el )
			if not el.length
				throw @_error( "EEMPTYELSTRING" )

			_$el = @$( el )
			if not _$el?.length
				throw @_error( "EINVALIDELSTRING" )

			return _$el

		if el instanceof jQuery
			if not el.length
				throw @_error( "EEMPTYELJQUERY" )

			# TODO handle multiple jQuery elements to IGGY instances
			if el.length > 1
				throw @_error( "ESIZEELJQUERY" )

			return el

		if el instanceof Element
			return @$( el )

		throw @_error( "EINVALIDELTYPE" )

		return

	_prepareFacets: ( facets )=>
		_ret = []
		for facet in facets when ( _fct = @_createFacet( facet ) )?
			_ret.push _fct

		return new Facets( _ret )

	_createFacet: ( facet )=>
		switch facet.type.toLowerCase()
			when "string" then return new FctString( facet )
			when "select" then return new FctSelect( facet )
			when "array" then return new FctArray( facet )
			when "number" then return new FctNumber( facet )
			when "range" then return new FctRange( facet )
			when "daterange" then return new FctDateRange( facet )

	addFacet: ( facet )=>
		if not @facets?
			return
		if ( _fct = @_createFacet( facet ) )?
			@facets.add( _fct )
		return @

	_error: ( type, data = {} )=>
		if @errors[ type ]?
			_msg = @errors[ type ]( data )
		else
			_msg = "-"
		_err = new Error()
		_err.name = type
		_err.message = _msg
		return _err

	getQuery: =>
		return @results

	triggerChange: =>
		@trigger( "change", @results )
		return

	_initErrors: =>
		@errors = {}
		for _k, _tmpl of @ERRORS()
			@errors[ _k ] = _.template( _tmpl ) 
		return

	ERRORS: =>
		"EINVALIDELSTRING": "If you define a `el` as String it has to be a valid selector for an existing DOM element."
		"EEMPTYELSTRING": "The `el` as string can not be empty."
		"EEMPTYELJQUERY": "The `el` as jOuery object can not be an empty collection."
		"ESIZEELJQUERY": "The `el` as jOuery object can not be a result of one el."
		"EINVALIDELTYPE": "The `el` can only be a selector string, dom element or jQuery collection"
		"EMISSINGEL": "Please define a target `el`"

module.exports = IGGY