/**
 * Created by jmacruz on 13/01/2018.
 */

/* "Sort by, then by"
 // Based on this jsfiddle:
 // http://jsfiddle.net/dFNva/1/
 // as a response to this stackoverflow post:
 // http://stackoverflow.com/a/979325/2502532
 // Improvements include JSON deep access with path notation, 'then by' sorting.
 // Description: Sort by object key, with optional reverse ordering, priming, and 'then by' sorting.

 // Ref: http://jsfiddle.net/gfullam/sq9U7/

 array.sort(
 by(path[, reverse[, primer[, then]]])
 );
 */

/* THE FUNCTION */
var by = function (path, reverse, primer, then) {
    var get = function (obj, path) {
            if (path) {
                path = path.split('.');
                for (var i = 0, len = path.length - 1; i < len; i++) {
                    obj = obj[path[i]];
                };
                return obj[path[len]];
            }
            return obj;
        },
        prime = function (obj) {
            return primer ? primer(get(obj, path)) : get(obj, path);
        };

    return function (a, b) {
        var A = prime(a),
            B = prime(b);

        return (
                (A < B) ? -1 :
                    (A > B) ?  1 :
                        (typeof then === 'function') ? then(a, b) : 0
            ) * [1,-1][+!!reverse];
    };
};

/* THE ARRAY */
var places = [
    {
        "id": 0,
        "props": {
            "city": "Dallas",
            "state": "TX",
            "zip": 75001
        }
    }, {
        "id": 1,
        "props": {
            "city": "Austin",
            "state": "TX",
            "zip": 78610
        }
    }, {
        "id": 2,
        "props": {
            "city": "Beverly Hills",
            "state": "CA",
            "zip": 90210
        }
    }, {
        "id": 3,
        "props": {
            "city": "Houston",
            "state": "TX",
            "zip": 77002
        }
    }, {
        "id": 4,
        "props": {
            "city": "New York",
            "state": "NY",
            "zip": 10453
        }
    }, {
        "id": 4,
        "props": {
            "city": "O'Neill",
            "state": "NE",
            "zip": 68763
        }
    }, {
        "id": 4,
        "props": {
            "city": "Omaha",
            "state": "NE",
            "zip": 68183
        }
    }
];


/* THE EXAMPLES */
/* Sort by "state" A-Z */
places.sort(by('props.state'));

// Output
var t1 = document.getElementById('t1');
t1.innerHTML += '<caption>Sort by "state" A-Z</caption>';
for (var i = 0; i < places.length; i++) {
    t1.innerHTML += '<tr><td>' + places[i].props.city + '</td><td class="sortby">' + places[i].props.state + '</td><td> ' + places[i].props.zip + '</td></tr>';
}


/* Sort by "state" Z-A (reverse) */
places.sort(by('props.state', true));

// Output
var t2 = document.getElementById('t2');
t2.innerHTML += '<caption>Sort by "state" Z-A (reverse)</caption>';
for (var i = 0; i < places.length; i++) {
    t2.innerHTML += '<tr><td>' + places[i].props.city + '</td><td class="sortby">' + places[i].props.state + '</td><td> ' + places[i].props.zip + '</td></tr>';
}


/* Sort by 'state', Descending [Z-A] (reverse), Primer `parseFloat` converts to number before comparison;
 // Then by 'zip', Descending [9-0], Primer function converts strings to uppercase before comparison.
 // NOTE: sort order is inherited; setting to true here would return the reverse of the parent sort order. */
places.sort(
    by('props.state', true, null,
        by('props.zip', false, parseFloat)
    )
);

// Output
var t3 = document.getElementById('t3');
t3.innerHTML += '<caption>Sort by "state" Z-A (reverse), then by "ZIP" 9-0 (reverse inherited)</caption>';
for (i = 0; i < places.length; i++) {
    t3.innerHTML += '<tr><td>' + places[i].props.city + '</td><td class="sortby">' + places[i].props.state + '</td><td class="thenby"> ' + places[i].props.zip + '</td></tr>';
}


/* Sort by 'city', Ascending [A-Z], Primer function converts strings to uppercase & removes non-word characters before comparison. */
places.sort(
    by('props.city', false, function (x) {
        return x.toUpperCase().replace(/\W/g, '');
    })
);

// Output
var t4 = document.getElementById('t4');
t4.innerHTML += '<caption>Sort by "city" A-Z, case- & punctuation-insensitive (primer)</caption>';
for (i = 0; i < places.length; i++) {
    t4.innerHTML += '<tr><td class="sortby">' + places[i].props.city + '</td><td>' + places[i].props.state + '</td><td> ' + places[i].props.zip + '</td></tr>';
}

