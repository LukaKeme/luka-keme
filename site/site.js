// Mobile menu, and the contact form's error and sent states.
(function () {
  var lt = document.documentElement.lang === "lt";

  var top = document.querySelector(".top");
  var btn = top && top.querySelector(".menu");
  if (btn) {
    var nav = top.querySelector("nav");
    nav.id = nav.id || "site-nav";
    btn.setAttribute("aria-controls", nav.id);
    btn.setAttribute("aria-expanded", "false");
    btn.addEventListener("click", function () {
      var open = top.classList.toggle("open");
      btn.setAttribute("aria-expanded", String(open));
      btn.textContent = open ? (lt ? "Uždaryti" : "Close") : (lt ? "Meniu" : "Menu");
    });
  }

  // Home doodle: find where the photo's horizon falls inside the doodle, so it can turn white below it.
  var hero = document.querySelector(".hero");
  var photo = hero && hero.querySelector(".band img.photo");
  var fisher = hero && hero.querySelector(".fisher.on-sky");
  if (photo && fisher) {
    var HORIZON = 0.522; // share of the photo's height, measured on p19
    var place = function () {
      var band = photo.parentElement, w = band.clientWidth, h = band.clientHeight;
      var nw = photo.naturalWidth || 2000, nh = photo.naturalHeight || 1500;
      var s = Math.max(w / nw, h / nh), py = parseFloat(getComputedStyle(photo).objectPosition.split(" ")[1]) / 100;
      var hz = HORIZON * nh * s - (nh * s - h) * (isNaN(py) ? 0.5 : py);
      var f = fisher.getBoundingClientRect(), b = band.getBoundingClientRect();
      hero.style.setProperty("--hz", hz + "px");
      hero.style.setProperty("--split", ((hz - (f.top - b.top)) / f.height * 100).toFixed(1) + "%");
    };
    place();
    photo.addEventListener("load", place);
    window.addEventListener("resize", place);
  }

  var form = document.querySelector("form.msg");
  if (!form) return;
  var text = lt
    ? { name: "Įrašykite savo vardą.", email: "Įrašykite el. pašto adresą, pavyzdžiui vardas@pavyzdys.lt.", message: "Parašykite kelis žodžius apie tai, kas jus atveda.",
        sentTitle: "Ačiū, žinutė išsiųsta", sentBody: "Atsakysiu per 2 darbo dienas. Jei per tą laiką negausite atsakymo, parašykite į luka.keme@gmail.com.", sending: "Siunčiama…" }
    : { name: "Please enter your name.", email: "Please enter an email address, for example name@example.com.", message: "Please write a few words about what brings you here.",
        sentTitle: "Thank you, your message is sent", sentBody: "I'll reply within 2 working days. If you don't hear back by then, write to luka.keme@gmail.com.", sending: "Sending…" };

  form.setAttribute("novalidate", "");
  ["name", "email", "message"].forEach(function (n) {
    var field = form.elements[n];
    var err = document.createElement("span");
    err.className = "err"; err.id = "err-" + n; err.setAttribute("aria-live", "polite");
    field.insertAdjacentElement("afterend", err);
    field.setAttribute("aria-describedby", err.id);
    field.addEventListener("input", function () { if (field.validity.valid) { err.textContent = ""; field.removeAttribute("aria-invalid"); } });
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var firstBad = null;
    ["name", "email", "message"].forEach(function (n) {
      var field = form.elements[n], err = document.getElementById("err-" + n);
      if (!field.validity.valid) { err.textContent = text[n]; field.setAttribute("aria-invalid", "true"); firstBad = firstBad || field; }
    });
    if (firstBad) { firstBad.focus(); return; }
    var submit = form.querySelector("button");
    submit.disabled = true; submit.textContent = text.sending;
    function show(title, body) {
      var done = document.createElement("div");
      done.className = "sent"; done.setAttribute("role", "status"); done.tabIndex = -1;
      done.innerHTML = "<h2></h2><p></p>";
      done.querySelector("h2").textContent = title;
      done.querySelector("p").textContent = body;
      form.replaceWith(done); done.focus();
    }
    // The sketch has no Netlify behind it, so it only demonstrates the sent state.
    if (location.protocol === "file:" || /^(localhost|127\.)/.test(location.hostname)) { show(text.sentTitle, text.sentBody); return; }
    // Netlify accepts the same form posted as URL-encoded data.
    fetch("/", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: new URLSearchParams(new FormData(form)).toString() })
      .then(function (r) { if (!r.ok) throw r; show(text.sentTitle, text.sentBody); })
      .catch(function () {
        submit.disabled = false; submit.textContent = lt ? "Siųsti žinutę" : "Send message";
        var err = document.getElementById("err-message");
        err.textContent = lt ? "Žinutės išsiųsti nepavyko. Bandykite dar kartą arba rašykite į luka.keme@gmail.com." : "The message couldn't be sent. Please try again, or write to luka.keme@gmail.com.";
      });
  });
})();

// Home topics: pointing at a topic brings up its doodle on the left
document.querySelectorAll('.topics').forEach(function(sec){
  var stage=sec.querySelector('.stage'); if(!stage) return;
  var imgs=[].slice.call(stage.children), items=[].slice.call(sec.querySelectorAll('.toc a'));
  function show(i){
    imgs.forEach(function(im,j){im.classList.toggle('on',j===i)});
    items.forEach(function(a,j){a.classList.toggle('on',j===i)});
  }
  items.forEach(function(a,i){
    a.addEventListener('pointerenter',function(){show(i)});
    a.addEventListener('focus',function(){show(i)});
    if(!a.hasAttribute('href')) a.addEventListener('click',function(){show(i)});
  });
  show(0);
});
