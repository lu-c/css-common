'use strict';

const livingcss = require('livingcss'),
	fs = require('fs'),
	path = require('path');

let customSectionTemplate = {};
let partials = ['section'];

partials.forEach((partial) => {
	let filePath = path.join(__dirname, `handlebars/partials/${partial}.hbs`);
	fs.readFile(filePath, {encoding: 'utf-8'}, function(err,data){
		if (!err) {
			customSectionTemplate[partial] = data;
		}
	});
});

livingcss(['src/client/**/*.scss', 'styleguide/help.scss'], 'styleguide/docs', {
	loadcss: true,
	sortOrder: [
		{ 'Core': ['About', 'Colors'] },
		'Forms',
		'Components',
	],
	preprocess: function(context, template, Handlebars){
		context.title = 'Ostrich Style Guide';
		context.globalStylesheets = [
			'../../dist/styles.css',
			'../livingcss.css'
		];
		context.scripts = [
			'../../dist/vendor.js'
		]
		let sections = Object.keys(customSectionTemplate);
		sections.forEach((section) => {
			Handlebars.registerPartial(section, customSectionTemplate[section]);
		});
	},
	tags: {
		classes: function() {
			var section = this.sections[this.tag.name];
			if (section) {
				section.classes = this.tag.description;
			}
		},
		color: function() {
			let parsedDesc = this.tag.description.split(', ');
			var section = this.sections[parsedDesc[0]];
			if (section) {
				section.colors = section.colors || [];
				section.colors.push({
					name: this.tag.name,
					value: this.tag.type,
					classes: parsedDesc[1]
				});
			}
		},
		tablerow: function() {
			let parsedDesc = this.tag.description.split(' | ');
			let type = this.tag.type || '';
			let parsedType = type.split(' | ');
			let columns = parsedDesc.map(function(col, i) {
				return {
					td: parsedType[i],
					html: col
				};
			});
			var section = this.sections[this.tag.name];
			if (section) {
				section.table = section.table || [];
				section.table.push({
					name: this.tag.name,
					value: this.tag.type,
					columns: columns
				});
			}
		}
	}
});
