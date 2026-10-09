/* Runs learner code against tests inside a Web Worker. The server serves this file with a policy that blocks all network access. */
self.onmessage = function(e) {
  var d = e.data;
  try {
    var fn = new Function(d.code + "\n;return " + d.name + ";")();
    if (typeof fn !== "function") throw new Error("Define a function named " + d.name);
    var rows = d.tests.map(function(t) {
      try { var a = fn.apply(null, t.args); return { actual: a === undefined ? "undefined" : a, pass: JSON.stringify(a) === JSON.stringify(t.expected) }; }
      catch (x) { return { actual: String(x.message), pass: false }; }
    });
    self.postMessage({ rows: rows });
  } catch (x) { self.postMessage({ error: x.message }); }
};
