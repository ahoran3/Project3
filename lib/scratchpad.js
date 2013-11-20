/*
 * This is a JavaScript Scratchpad.
 *
 * Enter some JavaScript, then Right Click or choose from the Execute Menu:
 * 1. Run to evaluate the selected text (Ctrl+r),
 * 2. Inspect to bring up an Object Inspector on the result (Ctrl+i), or,
 * 3. Display to insert the result in a comment after the selection. (Ctrl+l)
 */

var list = new Array('tree', 'boat', 'cone', 'boat', 'tree', 'orange', 'boat');
var elem_spot = list.indexOf('tree');
list.splice(elem_spot, 1);
document.write(list);
/*
undefined
*/