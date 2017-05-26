angular.module('protarasApp')
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
