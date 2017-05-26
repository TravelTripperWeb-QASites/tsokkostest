(function() {
//Pull in Angular: https://cdnjs.cloudflare.com/ajax/libs/angular.js/1.5.2/angular.min.js
var proApp = angular.module('protarasApp',['ngRoute','ui.date','ngMap','ngSanitize'],   function($interpolateProvider) {
      $interpolateProvider.startSymbol('[[');
      $interpolateProvider.endSymbol(']]');
    });

proApp.factory('myCache', ['$cacheFactory', function($cacheFactory) {
    return $cacheFactory('myData');
  }])

// add routing url for each pages
// to assign the template and controller
 
proApp.config(function($routeProvider, $locationProvider, $httpProvider) { 
   // Starting Symbol
        //$interpolateProvider.startSymbol('[[');
        // Ending Symbol
        //$interpolateProvider.endSymbol(']]');
$locationProvider.html5Mode({
        enabled: true,
        requireBase: false,
        rewriteLinks: false
      }); 
$httpProvider.defaults.cache = true;
  $routeProvider 
  .when("/", { 
    controller: 'protarasCtr'
  })
  .when("/hotel/:name", {
    templateUrl : "/hotel",
    controller: 'detailController' 
  })
  .otherwise({redirectTo:'/region-listing/'});  
}); 

// add dash(-hyphen) function in url
proApp.filter('spaceDash', function() {
   return function(input) {
       return input.replace(/ /g, '-');
   }
});

// main page controller to display the list of hotels in a region
proApp.controller('protarasCtrl',function($scope, myCache , $http){  
  $('.loading').css('display','block');
 var cache = myCache.get('myData');

   if (cache) {
     $scope.HotelLists = cache;
   }
   else { 
    $http.get('https://rt3api-prd.ttaws.com/hotels/list.json?portal_id=TSOKKOS&rooms=1&locale=en').success(function(result){
      $scope.HotelLists = result.hotels; 
      $scope.minDate = todaydate();
      $scope.maxDate = todaydate(1);
      myCache.put('myData', result.hotels);
      $('.loading').css('display','none');
    }).error(function(data){ 
    });
    
     }
    
   function todaydate(minLos) {
      var date = new Date();
      var n = minLos || 0;
      
      return date.getFullYear() +'-'+ ('0' + (date.getMonth() + 1)).slice(-2) +'-'+ ('0' + (date.getDate() + n)).slice(-2);
    }
   /* 
   $scope.rezLinks = function() {
          
           var full = location.protocol+'//'+location.hostname+(location.port ? ':'+location.port: '');
      
           $http.get(full +'/js/listing.js').success(rezhttpSuccess).error(function() {
                //alert('Unable to get back informations :( ');
            });
        }
        rezhttpSuccess = function(response) { 
            $scope.bookingLinks = response.hotelsurl;
            //alert($scope.name);
            var linkFilter = $scope.bookingLinks.filter(function(item){
             //return item.name==newStrUrl; // example with id 1, or routeParams.id
             return item.region=="protaras";
            });
            var newComment = { rtzurl:linkFilter.hturl};
            //$scope.HotelLists.rezLinks =  
            $scope.HotelLists.push(json[newComment]);
        }  
   $scope.rezLinks(); */

});


//hotel detail page controller
 proApp.controller('detailController',function($scope, $routeParams, $http, NgMap){ 

$('.loading').css('display','block');
   
  var url = window.location.pathname;
   var _array = url.split('/'),
    _foo = _array[_array.length-2]; 
//var filename = url.substring(url.lastIndexOf('/')+1);
 var nameurl = _foo.replace(/-/g, " "); 

    //alert(_foo);
    $scope.search = function() {
            var url = 'https://rt3api-prd.ttaws.com/hotels/list.json?portal_id=TSOKKOS&rooms=1&locale=en';
            $http.get(url).success(httpSuccess).error(function() {
                //alert('Unable to get back informations :( ');
            });
        }
        httpSuccess = function(response) { 
            $scope.hotels = response.hotels;
            //alert($scope.name);
            var hoteldetail = $scope.hotels.filter(function(item){
             //return item.name==newStrUrl; // example with id 1, or routeParams.id
             return item.name==nameurl;
            });
            $scope.hotel = hoteldetail[0];  // remove extra square bracs 
          $scope.lat = hoteldetail[0].latitude, 
          $scope.lng = hoteldetail[0].longitude;
 
             

            $scope.roomDetails();
            $scope.specials(); 
           // $scope.mapLocation(); 
        } 
        $scope.search();

        $scope.roomDetails = function() {
           
            var url = 'https://rt3api-prd.ttaws.com/hotels/rooms.json?hotel_id='+$scope.hotel.hotel_id+'&portal_id=tsokkos&locale=en&currency=USD&arrival_date='+today()+'&departure_date='+today(1)+'&adults=1&children=0&rooms=1';
            $http.get(url).success(httpSuccess).error(function() {
                //alert('Unable to get back informations :( ');
            });
        }
        httpSuccess = function(response) { 
            $scope.rooms = response.rooms;
            //alert($scope.name); 
            // $scope.roomdetails = hoteldetail[0];  // remove extra square bracs 
            // alert();
        } 
       
    $scope.minDate = today();
    $scope.maxDate = today(1);

    
    //get the date
    function today(minLos) {
      var date = new Date();
      var n = minLos || 0;
      
      return date.getFullYear() +'-'+ ('0' + (date.getMonth() + 1)).slice(-2) +'-'+ ('0' + (date.getDate() + n)).slice(-2);
    }

proApp.filter('num', function() {
    return function(input) {
      return parseInt(input, 10);
    };
}); 
        
        $scope.specials = function() {
           
            var urlspecial = 'https://rt3api-prd.ttaws.com/hotels/special_rates.json?hotel_id='+$scope.hotel.hotel_id+'&portal_id=tsokkos&locale=en&currency=USD';
            $http.get(urlspecial).success(httpSuccessoffer).error(function() {
                //alert('Unable to get back informations :( ');
            });
        }
        httpSuccessoffer = function(response) { 
            //$scope.offers = response.special_rates[0];
            $scope.offering = response;
            //alert($scope.name);  
            $('.loading').css('display','none');
        } 

        
  
 
});

proApp.filter('filterHtmlChars', function(){
   return function(html) {
       var filtered = angular.element('<div>').html(html).text(); 
       return filtered;
   }
});
proApp.filter('spaceless', function() {
              return function(input) {
                return input.replace(/^\s*/gm, '');
              };
          });

  //cyprus controller
  proApp.controller('cyprusCtrl', cyprusCtrl);

    function cyprusCtrl($scope) {
            var vm = this;
  
              vm.zoom = 11;
              var styles = [{stylers:[ { hue: '#333' },
      { saturation: -80 },
        { lightness: 0 }]},{elementType:'labels',stylers:[{visibility:'off'}]},{
        featureType: 'landscape',
        elementType: 'all',
        stylers: [
          { saturation: -100 },
        { lightness: 0 }
        ]
      },{
        featureType: 'road',
       elementType: 'geometry',
        stylers: [
           { saturation: -80 },{ lightness: '20' }
        ]
      },{
        featureType: 'transit',
        elementType: 'all',
        stylers: [
          {visibility:'off'}
        ]
      },
        {
        featureType: 'Administrative',
        elementType: 'all',
        stylers: [
          { visibility:'off' }
        ]
      },{featureType:'water',stylers:[ { hue: '#becbcf' },
      { saturation: 0 },
        { lightness: 0 }]},{color: '#becbcf'}];


              $scope.eventLocation = {
                coordinates: '35.126413, 33.429859',
                address: 'cyprus',
                name: 'Some Custom Name',
                styles: styles
              };


            
          } 
 
 

})();

 
