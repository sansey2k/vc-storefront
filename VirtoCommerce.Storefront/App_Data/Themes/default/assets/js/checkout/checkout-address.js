﻿var storefrontApp = angular.module('storefrontApp');
storefrontApp.component('vcCheckoutAddress', {
	templateUrl: "themes/assets/js/checkout/checkout-address.tpl.html",
	bindings: {
		address: '=',
		addresses: '<',
		getAvailCountries: '&',
		editMode: '<',
		onUpdate: '&'
	},
	require: {
		checkoutStep: '^vcCheckoutWizardStep'
	},

	controller: ['$scope', 'cartService', function ($scope, cartService) {
		var ctrl = this;
		this.$onInit = function () {
			ctrl.checkoutStep.addComponent(this);
			if (ctrl.editMode) {
				ctrl.getAvailCountries().then(function (countries) {
					ctrl.countries = countries;
				});
			}
		};

		this.$onDestroy = function () {
			ctrl.checkoutStep.removeComponent(this);
		};
		
	
		function loadCountryRegions(country) {
			return cartService.getCountryRegions(country.code3).then(function (result) {
				country.regions = result.data;
				return country.regions;
			});
		};

		ctrl.selectAddress = function (address) {
			ctrl.address = address;
			//Set country object for address
			address.country = _.find(ctrl.countries, function (x) { return x.name == address.countryName || x.code2 == address.countryCode || x.code3 == address.countryCode; });
			if (address.country) {
				loadCountryRegions(address.country).then(function (regions) {
					address.region = _.find(regions, function (x) { return x.code == address.regionId || x.name == address.regionName; });
				});
			}
		};

		ctrl.selectCountry = function (country) {
			if (country) {
				if (!country.regions) {
					loadCountryRegions(country);
				}
				ctrl.address.countryName = ctrl.address.country.name;
				ctrl.address.countryCode = ctrl.address.country.code3;
			}
			else {
				ctrl.address.countryName = undefined;
				ctrl.address.countryCode = undefined;
			}
		};

		ctrl.selectRegion = function (region) {
			if (region) {
				ctrl.address.regionId = ctrl.address.region.code;
				ctrl.address.regionName = ctrl.address.region.name;
			}
			else {
				ctrl.address.regionId = undefined;
				ctrl.address.regionName = undefined;
			}
		};

		ctrl.validate = function () {
			if (ctrl.form) {
				ctrl.form.$setSubmitted();
				return !ctrl.form.$invalid;
			}
			return true;
		}

		function stringifyAddress(address) {
			var stringifiedAddress = address.firstName + ' ' + address.lastName + ', ';
			stringifiedAddress += address.organization ? address.organization + ', ' : '';
			stringifiedAddress += address.countryName + ', ';
			stringifiedAddress += address.regionName ? address.regionName + ', ' : '';
			stringifiedAddress += address.city;
			stringifiedAddress += address.line1 + ', '
			stringifiedAddress += address.line2 ? address.line2 : '';
			stringifiedAddress += address.postalCode;
			return stringifiedAddress;
		}

		$scope.$watch('$ctrl.address', function () {
			if (ctrl.form && ctrl.address) {
				
				ctrl.address.name = stringifyAddress(ctrl.address);
		
				ctrl.onUpdate({ address: ctrl.address });
			}
		}, true);

	}]
});
