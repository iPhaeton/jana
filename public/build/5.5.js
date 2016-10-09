webpackJsonp_name_([5],{

/***/ 12:
/***/ function(module, exports) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	function makeSearchRequest(request, data, onSearchEnd, onSearchResult) {
	    var key = Math.random();
	
	    shop.socket.callbacks.searchResult = function (err, data, done, resultKey) {
	        if (data === "searchComplete") {
	            onSearchEnd(null, null);
	            return;
	        };
	
	        if (err) {
	            alert("Ошибка поиска. Выведены не все результаты.");
	            socket.callbacks.searchResult = null;
	            return;
	        };
	
	        if (!data) {
	            alert("Ничего не найдено");
	            return;
	        };
	
	        if (resultKey !== key) return;
	
	        onSearchResult(data, done);
	    };
	
	    shop.socket.send(JSON.stringify({
	        request: "/search?" + request,
	        data: data,
	        key: key
	    }));
	};
	
	exports.makeSearchRequest = makeSearchRequest;

/***/ }

});
//# sourceMappingURL=5.5.js.map