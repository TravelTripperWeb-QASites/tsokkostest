(function(angular) {

'use strict';

angular.module('rt3app', []);

angular.module('rt3app')
  .filter('isArray', [function() {
    return function(input) {
      return angular.isArray(input);
    };
  }])
  .filter('formatpolicydescription', function() {
      return function(text) {
        return  text ? String(text).replace('["', '<p>').replace('"]', '</p>').replace(',',' ') : '';
      }
    }
  );

angular.module('rt3app')
  .service('rt3HotelInfo', ['$rootScope', '$q', 'rt3api', function($rootScope, $q, rt3api) {
    var hotelInfo = {
      loaded: false,
      galleryImg: []
    };

    hotelInfo.ready = $q(function(resolve) {
      rt3api.getHotelInfo().then(function(response) {
        $rootScope.$apply(function() {
          angular.extend(hotelInfo, response);
          hotelInfo.loaded = true;
          hotelInfo.galleryImg = galleryArr(response.photos);
          resolve(hotelInfo);
        });
      });
    });

    function galleryArr(items) {
      var arr = [];

      for(var i = 0; i < items.length; i++) {
        arr.push(items[i].thumb_yankee_medium);
      }

      return arr;
    }

    return hotelInfo;
  }])

  .service('rt3PortalInfo', ['$rootScope', '$q', 'rt3api', function($rootScope, $q, rt3api) {
    var searchParams = {
      loaded: false
    };

    searchParams.ready = $q(function(resolve) {
      rt3api.getPortalInfo().then(function(response) {
        $rootScope.$apply(function() {
          angular.extend(searchParams, response);
          searchParams.loaded = true;
          resolve(searchParams);
        });
      });
    });

    return searchParams;
  }])

  .service('rt3Search', ['rt3PortalInfo', 'rt3LocalStorage', 'rt3api', '$rootScope', function(rt3PortalInfo, rt3LocalStorage, rt3api, $rootScope) {
    function Search() {
      var self = this;
      this.loaded = false;
      this.constraints = {};
      this.params = {};
      this.today = today();

      prepareConstraintsAndParams(this);

      function paramsFn() {
        return self.params;
      }

      $rootScope.$watch(paramsFn, function(value) {
        if (value.arrival_date) {
          rt3LocalStorage.setSearchParams(value);
        }
      }, true);
    }

    // Prams for roomDetails
    Search.prototype.getParams = function() {
      var self = this;

      return {
        arrival_date: self.params.arrival_date || today(),
        departure_date: self.params.departure_date || today(1),
        adults: self.params.adults || self.constraints.min_number_of_adults_per_room || 2,
        children: self.params.children || self.constraints.min_number_of_children_per_room || 0,
        rooms: self.params.rooms || self.constraints.default_number_of_rooms || 1
      }
    }

    return new Search();

    // PRIVATE
    function prepareConstraintsAndParams(self) {
      rt3PortalInfo.ready.then(function(response) {
        angular.extend(self.constraints, extractsConstraints(response));
        angular.extend(self.params, extractsParams(response));

        self.loaded = true;
      });
    }

    function extractsConstraints(params) {
      return {
        "min_length_of_stay": params.min_length_of_stay,
        "max_length_of_stay": params.max_length_of_stay,
        "numbers_of_rooms": params.numbers_of_rooms,
        "default_number_of_rooms": params.default_number_of_rooms,
        "min_number_of_adults_per_room": params.min_number_of_adults_per_room,
        "max_number_of_adults_per_room": params.max_number_of_adults_per_room,
        "default_number_of_adults_per_room": params.default_number_of_adults_per_room,
        "min_number_of_children_per_room": params.min_number_of_children_per_room,
        "max_number_of_children_per_room": params.max_number_of_children_per_room,
        "min_number_of_guests_per_room": params.min_number_of_guests_per_room,
        "max_number_of_guests_per_room": params.max_number_of_guests_per_room
      }
    }

    function extractsParams(params) {
      function defaultSearchParams(params) {
        return {
          arrival_date: today(),
          departure_date: today(1),
          portal_id: rt3api.config.portalId,
          hotel_id: rt3api.config.hotelId,
          locale: rt3api.config.defaultLocale,
          currency: rt3api.config.defaultCurrency,
          rooms: params.default_number_of_rooms,
          adults: params.default_number_of_adults_per_room,
          children: params.min_number_of_children_per_room
        }
      }

      return rt3LocalStorage.getRelevantSearchParams() || defaultSearchParams(params);
    }

    function today(minLos) {
      var date = new Date();
      var n = minLos || 0;

      return date.getFullYear() +'-'+ ('0' + (date.getMonth() + 1)).slice(-2) +'-'+ ('0' + (date.getDate() + n)).slice(-2);
    }
  }])

  .service('rt3Browser', ['$rootScope', '$q', 'rt3api', 'rt3Search', function($rootScope, $q, rt3api, rt3Search) {
    function Browser() {
      this.loaded = false;
      this.rooms = [];
      this.errors = [];
      this.searchParams = {};
    }

    Browser.prototype.search = function(params) {
      var date = new Date();
      var self = this;
      this.loaded = false;
      this.searchParams = params || rt3Search.getParams();
      this.thisDate = date.getFullYear() +'-'+ ('0' + (date.getMonth() + 1)).slice(-2) +'-'+ ('0' + date.getDate()).slice(-2);

      if(this.searchParams || this.storageContainer) {
        rt3api.availableRooms(this.searchParams || this.storageContainer).then(function(response) {
          $rootScope.$apply(function() {
            self.rooms = response.room_details_list;
            self.errors = response.error_info.error_details;
            self.loaded = true;
            self.searchParams = self.searchParams || self.storageContainer;
          });
        });
      } else {
        rt3api.getAllRooms().then(function(response) {
          $rootScope.$apply(function() {
            self.rooms = response.rooms;
            self.errors = response.error_info.error_details;
            self.loaded = true;
          });
        });
      }
    };

    var browser = new Browser();

    browser.search();

    return browser;
  }])

  .service('rt3SpecialRates', ['$rootScope', '$q', '$location', 'rt3api', function($rootScope, $q, $location, rt3api) {
    var specialRates = {
      loaded: false,
      locationHash: $location.path().substr(1) || null
    };

    specialRates.ready = $q(function(resolve) {
      rt3api.getAllSpecialRates().then(function(response) {
        if (specialRates.locationHash) {
            $rootScope.$apply(function() {
                angular.forEach(response.special_rates, function(value, key) {
                    if (value.rate_plan_code == specialRates.locationHash) {
                        angular.extend(specialRates, formatRespone(value));
                        specialRates.loaded = true;
                        resolve(specialRates);
                    }
                });
            });
        } else {
            $rootScope.$apply(function() {
                angular.extend(specialRates, formatRespone(response));
                specialRates.loaded = true;
                resolve(specialRates);
            });
        }
      });
    });

    return specialRates;

    // private
    // todo reformat response
    function formatRespone(response) {
      return response;
    }
  }])
  .service('rt3RoomDetails', ['$rootScope', '$q', '$location', 'rt3Search', 'rt3api', '$timeout', function($rootScope, $q, $location, rt3Search, rt3api, $timeout) {
    function RoomDetails() {
      loaded = false;
      params = {};
      brg = {};
      locationHash = $location.path().substr(1);
    }

    RoomDetails.prototype.fetchRoomDetails = function() {
      var self = this;
      var searchParams = rt3Search.getParams();
      var dataRoomId = angular.element('[data-room-id]').data('room-id');
      var roomId = { room_id: dataRoomId || $location.path().substr(1) };

      self.params = $.extend(searchParams, roomId);

      $q.when(rt3api.getAllRooms()).then(function(response) {
        $.each(response.rooms, function(key, value) {
          if(value.code == self.params.room_id) {
            angular.extend(self, value);
          }
        });
      });

      $q.when(rt3api.getBrgInfo(self.params)).then(function(response) {
        self.brg = response;
      });
    };

    var details = new RoomDetails();

    $rootScope.$on('$locationChangeSuccess', function() {
      details.fetchRoomDetails();
    });

    $timeout(function() {
      details.fetchRoomDetails();
    }, 0);


    return details;
  }])
  .service('rt3RecentBookings', ['$rootScope', '$q', 'rt3api', function($rootScope, $q, rt3api) {
    var recentBookings = {
      loaded: false
    };

    recentBookings.ready = $q(function(resolve) {
      rt3api.recentBookings(48 * 60).then(function(response) {
        $rootScope.$apply(function() {
          angular.extend(recentBookings, response);
          recentBookings.loaded = true;
          recentBookings = response;
          resolve(recentBookings);
        });
      });
    });

    return recentBookings;
  }])
  .service('rt3LocalStorage', [function() {
    function Rt3LocalStorage() {}

    Rt3LocalStorage.prototype.setSearchParams = function(params) {
      if (params) {
        localStorage.setItem("searchParams", JSON.stringify(params));
        localStorage.setItem("relevance", params.arrival_date);
      }
    };

    Rt3LocalStorage.prototype.getRelevantSearchParams = function() {
      if (storageHasValidRelevance()) {
        return paramsFromStorage();
      } else {
        clearStorage();
        return null;
      }
    };

    return new Rt3LocalStorage();

    // PRIVATE
    function storageHasValidRelevance() {
      var date = new Date();
      var currentDate = date.getFullYear() +'-'+ ('0' + (date.getMonth() + 1)).slice(-2) +'-'+ ('0' + date.getDate()).slice(-2);
      var relevance = localStorage.getItem("relevance");

      return currentDate <= relevance;
    }

    function paramsFromStorage() {
      return JSON.parse(localStorage.getItem("searchParams"));
    }

    function clearStorage() {
      localStorage.removeItem("relevance");
      localStorage.removeItem("searchParams");
    }
  }])
  .service('rt3RateShopping', ['$q', 'rt3api', 'rt3Search', function($q, rt3api, rt3Search) {
    function RateShopping() {
      rt3Search;

      this.loaded = false;
      this.params = rt3Search.getParams();

      getRateShopping(this);
    }

    function getRateShopping(self) {
      $q.when(rt3api.getRateShopping(self.params)).then(function(response) {
        angular.extend(self, response);

        this.loaded = true;
      });
    }

    return new RateShopping();
  }]);

angular.module('rt3app')
  .directive('rt3HotelInfo', ['rt3HotelInfo', function(rt3HotelInfo) {
    return {
      restrict: 'A',
      scope: true,
      link: function(scope, element, attrs) {
        scope[attrs['rt3HotelInfo']] = rt3HotelInfo;
      }
    };
  }])
  .directive('rt3SearchForm', ['rt3Search', function(rt3Search) {
    return {
      restrict: 'A',
      scope: true,
      link: function(scope, element, attrs) {
        scope[attrs['rt3SearchForm']] = rt3Search;
      }
    };
  }])
  .directive('rt3RoomsBrowser', ['rt3Browser', '$rootScope', function(rt3Browser, $rootScope) {
    return {
      restrict: 'A',
      scope: true,
      link: function(scope, element, attrs) {
        scope[attrs['rt3RoomsBrowser']] = rt3Browser;
      }
    };
  }])
  .directive('rt3SpecialRates', ['rt3SpecialRates', function(rt3SpecialRates) {
    return {
      restrict: 'A',
      scope: true,
      link: function(scope, element, attrs) {
        scope[attrs['rt3SpecialRates']] = rt3SpecialRates;
      }
    };
  }])
  .directive('rt3RoomDetails', ['rt3RoomDetails', function(rt3RoomDetails) {
    return {
      restrict: 'A',
      scope: true,
      link: function(scope, element, attrs) {
        scope[attrs['rt3RoomDetails']] = rt3RoomDetails;
      }
    };
  }])
  .directive('rt3RecentBookings', ['rt3RecentBookings', function(rt3RecentBookings) {
    return {
      restrict: 'A',
      scope: true,
      link: function(scope, element, attrs) {
        scope[attrs['rt3RecentBookings']] = rt3RecentBookings;
      }
    };
  }])
  .directive('rt3RateShopping', ['rt3RateShopping', function(rt3RateShopping) {
    return {
      restrict: 'A',
      scope: true,
      link: function(scope, element, attrs) {
        scope[attrs['rt3RateShopping']] = rt3RateShopping;
      }
    }
  }]);

})(angular);
