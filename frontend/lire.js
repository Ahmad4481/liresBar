document.querySelector("header i").addEventListener("click", function () {
  document.querySelector(".black-overlay").classList.add("on");
  document.querySelector(".freinds").classList.add("on");
  document.querySelector(".close").addEventListener("click", function () {
    document.querySelector(".black-overlay").classList.remove("on");
    document.querySelector(".freinds").classList.remove("on");
  })
})

document.querySelector(".add").addEventListener("click" , (el) => {
  document.querySelectorAll('.black-overlay')[1].classList.add("on");
  document.querySelectorAll(".close")[1].addEventListener("click", function () {
    document.querySelectorAll(".black-overlay")[1].classList.remove("on");
  })
})

